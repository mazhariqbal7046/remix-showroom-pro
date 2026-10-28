-- Store sale lines independently so invoices and COGS survive reloads.
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  inventory_id uuid references public.inventory_units(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  unit_cost numeric not null default 0 check (unit_cost >= 0),
  line_total numeric not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

alter table public.sale_items enable row level security;
create policy sale_items_member_access on public.sale_items
  for all to authenticated
  using (exists (
    select 1 from public.sales s
    where s.id = sale_id and public.is_showroom_member(s.showroom_id)
  ))
  with check (exists (
    select 1 from public.sales s
    where s.id = sale_id and public.is_showroom_member(s.showroom_id)
  ));
grant select, insert, update, delete on public.sale_items to authenticated;
