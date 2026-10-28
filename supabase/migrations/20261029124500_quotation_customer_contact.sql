-- Keep quotation customer details even when the customer is not in the CRM.
alter table public.quotations
  add column if not exists customer_name text,
  add column if not exists customer_phone text;
