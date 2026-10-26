-- Keep the tenant membership helper deterministic and safe for RLS evaluation.
alter function public.is_showroom_member(uuid) set search_path = public;
