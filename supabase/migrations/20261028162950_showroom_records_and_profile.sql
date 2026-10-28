-- Persist showroom profile, supplier, and supplier purchase workflows.
alter table public.showrooms
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists country text not null default 'Pakistan',
  add column if not exists tax_number text,
  add column if not exists website text,
  add column if not exists established_year text;

drop policy if exists showroom_owner_update on public.showrooms;
create policy showroom_owner_update on public.showrooms
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  name text not null,
  company text not null,
  phone text,
  email text,
  address text,
  products_supplied text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_name text not null,
  invoice_reference text not null,
  purchase_date date not null default current_date,
  total_cost numeric not null check (total_cost >= 0),
  paid_amount numeric not null default 0 check (paid_amount >= 0),
  payment_method text,
  status text not null default 'Unpaid',
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  inventory_id uuid references public.inventory_units(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_cost numeric not null check (unit_cost >= 0),
  line_total numeric not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;

create policy suppliers_member_access on public.suppliers
  for all to authenticated
  using (public.is_showroom_member(showroom_id))
  with check (public.is_showroom_member(showroom_id));
create policy purchases_member_access on public.purchases
  for all to authenticated
  using (public.is_showroom_member(showroom_id))
  with check (public.is_showroom_member(showroom_id));
create policy purchase_items_member_access on public.purchase_items
  for all to authenticated
  using (exists (
    select 1 from public.purchases p
    where p.id = purchase_id and public.is_showroom_member(p.showroom_id)
  ))
  with check (exists (
    select 1 from public.purchases p
    where p.id = purchase_id and public.is_showroom_member(p.showroom_id)
  ));

grant select, insert, update, delete on public.suppliers, public.purchases, public.purchase_items to authenticated;
