-- A linked partner account is read-only and limited to that partner's own
-- identity, investment ledger and settlement ledger. Other showroom users keep
-- the existing operational access.
alter table public.showroom_members
  add column if not exists partner_id uuid references public.partners(id) on delete set null;
create unique index if not exists showroom_members_partner_once_idx
  on public.showroom_members(showroom_id, partner_id) where partner_id is not null;

create table if not exists public.partner_invitations (
  id uuid primary key default gen_random_uuid(),
  showroom_id uuid not null references public.showrooms(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  invite_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  created_by uuid not null references auth.users(id),
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists partner_invitations_pending_idx
  on public.partner_invitations(showroom_id, partner_id, status, expires_at);
alter table public.partner_invitations enable row level security;
revoke all on public.partner_invitations from anon, authenticated;
grant select, insert, update, delete on public.partner_invitations to service_role;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_showroom_operator(p_showroom_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.showroom_members m
    where m.showroom_id = p_showroom_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','manager','salesperson','accountant')
  ) or exists (
    select 1 from public.showrooms s
    where s.id = p_showroom_id and s.owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_showroom_owner(p_showroom_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.showrooms s
    where s.id = p_showroom_id and s.owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.showroom_members m
    where m.showroom_id = p_showroom_id
      and m.user_id = (select auth.uid())
      and m.role = 'owner'
  );
$$;

create or replace function private.is_linked_showroom_partner(p_showroom_id uuid, p_partner_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.showroom_members m
    where m.showroom_id = p_showroom_id
      and m.user_id = (select auth.uid())
      and m.role = 'partner'
      and m.partner_id = p_partner_id
  );
$$;

revoke all on function private.is_showroom_operator(uuid) from public, anon;
revoke all on function private.is_showroom_owner(uuid) from public, anon;
revoke all on function private.is_linked_showroom_partner(uuid, uuid) from public, anon;
grant execute on function private.is_showroom_operator(uuid) to authenticated;
grant execute on function private.is_showroom_owner(uuid) to authenticated;
grant execute on function private.is_linked_showroom_partner(uuid, uuid) to authenticated;

-- Replace broad membership policies with operator-only policies and partner
-- specific read policies.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'customers','inventory_units','bookings','booking_payments','sales','sale_items',
        'expenses','partners','partner_capital_entries','partner_allocations','partner_settlements',
        'suppliers','purchases','purchase_items','quotations','quotation_items',
        'subscriptions','notification_deliveries','monthly_closings'
      ])
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['customers','inventory_units','bookings','sales','expenses','partners',
    'partner_capital_entries','partner_allocations','partner_settlements','suppliers','purchases','quotations'] loop
    execute format('create policy %I on public.%I for all to authenticated using (private.is_showroom_operator(showroom_id)) with check (private.is_showroom_operator(showroom_id))', t || '_operator_access', t);
  end loop;
end $$;

create policy partners_linked_read on public.partners
  for select to authenticated using (private.is_linked_showroom_partner(showroom_id, id));
create policy partner_capital_linked_read on public.partner_capital_entries
  for select to authenticated using (private.is_linked_showroom_partner(showroom_id, partner_id));
create policy partner_settlements_linked_read on public.partner_settlements
  for select to authenticated using (private.is_linked_showroom_partner(showroom_id, partner_id));

create policy booking_payments_operator_access on public.booking_payments
  for all to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and private.is_showroom_operator(b.showroom_id)))
  with check (exists (select 1 from public.bookings b where b.id = booking_id and private.is_showroom_operator(b.showroom_id)));
create policy sale_items_operator_access on public.sale_items
  for all to authenticated
  using (exists (select 1 from public.sales s where s.id = sale_id and private.is_showroom_operator(s.showroom_id)))
  with check (exists (select 1 from public.sales s where s.id = sale_id and private.is_showroom_operator(s.showroom_id)));
create policy purchase_items_operator_access on public.purchase_items
  for all to authenticated
  using (exists (select 1 from public.purchases p where p.id = purchase_id and private.is_showroom_operator(p.showroom_id)))
  with check (exists (select 1 from public.purchases p where p.id = purchase_id and private.is_showroom_operator(p.showroom_id)));
create policy quotation_items_operator_access on public.quotation_items
  for all to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id and private.is_showroom_operator(q.showroom_id)))
  with check (exists (select 1 from public.quotations q where q.id = quotation_id and private.is_showroom_operator(q.showroom_id)));

create policy subscriptions_operator_select on public.subscriptions
  for select to authenticated using (private.is_showroom_operator(showroom_id));
create policy monthly_closings_owner_access on public.monthly_closings
  for all to authenticated using (private.is_showroom_owner(showroom_id)) with check (private.is_showroom_owner(showroom_id));
create policy notifications_operator_access on public.notification_deliveries
  for all to authenticated using (private.is_showroom_operator(showroom_id)) with check (private.is_showroom_operator(showroom_id));

drop policy if exists member_read on public.showroom_members;
drop policy if exists owner_add_member on public.showroom_members;
create policy member_read on public.showroom_members
  for select to authenticated
  using (user_id = (select auth.uid()) or private.is_showroom_owner(showroom_id));
create policy owner_add_self_member on public.showroom_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) and role = 'owner'
    and exists (select 1 from public.showrooms s where s.id = showroom_id and s.owner_id = (select auth.uid()))
  );
revoke update, delete on public.showroom_members from anon, authenticated;
revoke insert on public.showroom_members from anon, authenticated;
grant select, insert on public.showroom_members to authenticated;
