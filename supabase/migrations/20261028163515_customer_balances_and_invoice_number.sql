-- Keep customer balances and invoice identifiers in the real database.
alter table public.customers
  add column if not exists total_purchases numeric not null default 0,
  add column if not exists outstanding_balance numeric not null default 0;

create unique index if not exists sales_showroom_invoice_number_unique
  on public.sales(showroom_id, invoice_number);
