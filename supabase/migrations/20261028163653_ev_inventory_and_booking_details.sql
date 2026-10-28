-- Preserve EV specification and customer delivery details in each showroom.
alter table public.inventory_units
  add column if not exists category text not null default 'EV Bikes',
  add column if not exists top_speed text,
  add column if not exists battery_type text,
  add column if not exists battery_voltage text,
  add column if not exists battery_ah text,
  add column if not exists range_description text,
  add column if not exists warranty text,
  add column if not exists sku text,
  add column if not exists barcode text,
  add column if not exists description text;

alter table public.bookings
  add column if not exists customer_email text,
  add column if not exists bike_brand text,
  add column if not exists bike_model text,
  add column if not exists model_year integer,
  add column if not exists bike_color text,
  add column if not exists chassis_reference text,
  add column if not exists stock_unit_reference text,
  add column if not exists salesperson text,
  add column if not exists deposit_required numeric not null default 0,
  add column if not exists delivery_status text not null default 'Reserved';
