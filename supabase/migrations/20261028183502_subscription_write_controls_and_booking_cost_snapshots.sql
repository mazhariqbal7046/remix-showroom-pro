-- Tenant users may read their plan, but only the service-role backend can
-- change billing status, amount, provider, or payment references.
drop policy if exists subscriptions_member_access on public.subscriptions;
drop policy if exists subscriptions_member_select on public.subscriptions;
drop policy if exists subscriptions_trial_insert on public.subscriptions;
create policy subscriptions_member_select on public.subscriptions
  for select to authenticated
  using (public.is_showroom_member(showroom_id));
revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;

alter table public.bookings
  add column if not exists cost_of_goods numeric(12,2) not null default 0
  check (cost_of_goods >= 0);
alter table public.bookings
  add column if not exists stock_arrival_notified_at timestamptz;

-- Existing delivered records did not retain a cost snapshot. Use the currently
-- recorded unit cost as the best available backfill; future bookings snapshot it
-- when reserved.
update public.bookings b
set cost_of_goods = coalesce(i.purchase_cost, 0)
from public.inventory_units i
where b.inventory_id = i.id
  and b.status = 'Delivered'
  and b.cost_of_goods = 0;

create table if not exists public.platform_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  event_type text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists platform_activity_logs_created_idx on public.platform_activity_logs (created_at desc);
alter table public.platform_activity_logs enable row level security;
revoke all on public.platform_activity_logs from anon, authenticated;
grant select, insert on public.platform_activity_logs to service_role;

alter table public.notification_deliveries
  add column if not exists dedupe_key text;
create unique index if not exists notification_deliveries_dedupe_key_idx
  on public.notification_deliveries (dedupe_key) where dedupe_key is not null;

create table if not exists public.scheduled_notification_runs (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  job_type text not null,
  business_date date not null,
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (showroom_id, job_type, business_date)
);
alter table public.scheduled_notification_runs enable row level security;
revoke all on public.scheduled_notification_runs from anon, authenticated;
grant select, insert, update on public.scheduled_notification_runs to service_role;
