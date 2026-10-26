-- Showroom Pro production starter schema. Run through Supabase migrations after
-- reviewing RLS policies for your tenant/team model.
create table if not exists public.showrooms (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), name text not null, currency text not null default 'PKR', created_at timestamptz not null default now());
create table if not exists public.showroom_members (showroom_id uuid references public.showrooms(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, role text not null default 'owner', primary key(showroom_id,user_id));
create table if not exists public.inventory_units (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, brand text, model text, model_year int, color text, battery_capacity text, range_km numeric, purchase_cost numeric not null default 0, selling_price numeric not null default 0, quantity int not null default 0, reserved_quantity int not null default 0, min_stock_level int not null default 1, created_at timestamptz not null default now());
create table if not exists public.bookings (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, customer_name text not null, customer_phone text, inventory_id uuid references public.inventory_units(id), booking_number text not null, booking_date date not null, expected_delivery_date date, total_price numeric not null default 0, status text not null default 'Pending', notes text, created_at timestamptz not null default now());
create table if not exists public.booking_payments (id uuid primary key default gen_random_uuid(), booking_id uuid references public.bookings(id) on delete cascade, receipt_number text not null, payment_date date not null, amount numeric not null default 0, method text, reference text);
create table if not exists public.partners (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, full_name text not null, phone text, email text, created_at timestamptz not null default now());
create table if not exists public.partner_capital_entries (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, partner_id uuid references public.partners(id), entry_date date not null, amount numeric not null default 0, entry_type text not null, reference text, status text not null default 'Posted');
create table if not exists public.partner_allocations (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, allocation_type text not null, effective_date date not null, status text not null default 'Draft', approved_by uuid references auth.users(id), allocations jsonb not null default '{}'::jsonb, reason text);
create table if not exists public.expenses (id uuid primary key default gen_random_uuid(), showroom_id uuid references public.showrooms(id) on delete cascade, expense_date date not null, amount numeric not null default 0, category text, description text, reference text);

alter table public.showrooms enable row level security;
alter table public.showroom_members enable row level security;
alter table public.inventory_units enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_payments enable row level security;
alter table public.partners enable row level security;
alter table public.partner_capital_entries enable row level security;
alter table public.partner_allocations enable row level security;
alter table public.expenses enable row level security;

create or replace function public.is_showroom_member(target_showroom uuid) returns boolean language sql stable security invoker as $$ select exists(select 1 from public.showroom_members m where m.showroom_id = target_showroom and m.user_id = (select auth.uid())); $$;
create policy "members can read showroom" on public.showrooms for select to authenticated using (owner_id = (select auth.uid()) or public.is_showroom_member(id));
create policy "members can read inventory" on public.inventory_units for select to authenticated using (public.is_showroom_member(showroom_id));
create policy "members can manage bookings" on public.bookings for all to authenticated using (public.is_showroom_member(showroom_id)) with check (public.is_showroom_member(showroom_id));
create policy "members can manage booking payments" on public.booking_payments for all to authenticated using (exists(select 1 from public.bookings b where b.id = booking_id and public.is_showroom_member(b.showroom_id))) with check (exists(select 1 from public.bookings b where b.id = booking_id and public.is_showroom_member(b.showroom_id)));
