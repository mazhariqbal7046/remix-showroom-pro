create table if not exists public.platform_payment_settings (
  id boolean primary key default true check (id),
  account_holder text not null default '',
  bank_name text not null default '',
  account_number text not null default '',
  iban text not null default '',
  raast_id text not null default '',
  payment_instructions text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.subscription_payment_submissions (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'PKR',
  transfer_reference text not null,
  transfer_date date not null,
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected')),
  submitted_by uuid not null references auth.users(id),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  unique (showroom_id, transfer_reference)
);

create index if not exists subscription_payment_submissions_status_created_idx
  on public.subscription_payment_submissions (status, created_at desc);
create index if not exists subscription_payment_submissions_showroom_created_idx
  on public.subscription_payment_submissions (showroom_id, created_at desc);

alter table public.platform_payment_settings enable row level security;
alter table public.subscription_payment_submissions enable row level security;
revoke all on public.platform_payment_settings, public.subscription_payment_submissions from anon, authenticated;
grant all on public.platform_payment_settings, public.subscription_payment_submissions to service_role;
