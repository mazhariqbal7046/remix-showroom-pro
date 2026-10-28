-- The sales table already has a unique constraint on (showroom_id, invoice_number).
-- Keep the constraint and remove the redundant standalone unique index.
drop index if exists public.sales_showroom_invoice_number_unique;
