-- WhatsApp is out of scope; notification delivery is email-only.
alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_channel_check;

alter table public.notification_deliveries
  add constraint notification_deliveries_channel_check check (channel = 'email');
