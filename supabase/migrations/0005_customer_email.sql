-- Customer email is required for booking and delivery email workflows.
alter table public.customers add column if not exists email text;
