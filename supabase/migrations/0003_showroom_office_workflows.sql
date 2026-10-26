-- Office workflows for subscriptions, quotations, reminders, and month closing.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  plan_id text not null default 'showroom',
  status text not null default 'trial' check (status in ('trial','active','past_due','cancelled','expired')),
  monthly_amount numeric not null default 10000,
  started_at date not null default current_date,
  next_billing_date date,
  last_paid_at timestamptz,
  provider text,
  provider_reference text,
  created_at timestamptz not null default now()
);
create unique index if not exists subscriptions_showroom_active_idx on public.subscriptions(showroom_id) where status in ('trial','active','past_due');

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  quote_number text not null,
  issue_date date not null default current_date,
  valid_until date,
  status text not null default 'Draft' check (status in ('Draft','Sent','Accepted','Expired','Cancelled')),
  subtotal numeric not null default 0,
  total numeric not null default 0,
  notes text,
  owner_signature text,
  owner_stamp text,
  created_at timestamptz not null default now(),
  unique(showroom_id, quote_number)
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  inventory_id uuid references public.inventory_units(id) on delete set null,
  product_name text not null,
  brand text,
  model text,
  color text,
  motor_power text,
  battery_type text,
  battery_capacity text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('owner','customer','partner')),
  recipient_id uuid,
  channel text not null check (channel in ('email','whatsapp')),
  event_type text not null,
  destination text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists notification_deliveries_queue_idx on public.notification_deliveries(status, scheduled_for);

create table if not exists public.monthly_closings (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  month_start date not null,
  closed_at timestamptz,
  closed_by uuid references auth.users(id),
  revenue numeric not null default 0,
  cogs numeric not null default 0,
  gross_profit numeric not null default 0,
  operating_expenses numeric not null default 0,
  net_profit numeric not null default 0,
  stock_units integer not null default 0,
  notes text,
  unique(showroom_id, month_start)
);

alter table public.subscriptions enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.monthly_closings enable row level security;

do $$ declare t text; begin
  foreach t in array array['subscriptions','quotations','notification_deliveries','monthly_closings'] loop
    execute format('create policy %I on public.%I for all to authenticated using (public.is_showroom_member(showroom_id)) with check (public.is_showroom_member(showroom_id));', t || '_member_access', t);
  end loop;
  create policy quotation_items_member_access on public.quotation_items for all to authenticated using (exists (select 1 from public.quotations q where q.id = quotation_id and public.is_showroom_member(q.showroom_id))) with check (exists (select 1 from public.quotations q where q.id = quotation_id and public.is_showroom_member(q.showroom_id)));
exception when duplicate_object then null;
end $$;

grant select, insert, update, delete on public.subscriptions, public.quotations, public.quotation_items, public.notification_deliveries, public.monthly_closings to authenticated;
