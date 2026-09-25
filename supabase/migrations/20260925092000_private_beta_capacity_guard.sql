-- Enforce the first private beta cohort cap at the database level.
-- The cap applies to invited and accepted beta users.

create or replace function public.enforce_private_beta_capacity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  active_count integer;
begin
  if new.status in ('invited', 'accepted') then
    select count(*)::integer
      into active_count
      from public.private_beta_invites
      where status in ('invited', 'accepted')
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_count >= 10 then
      raise exception 'Private beta is limited to 10 users';
    end if;
  end if;

  new.plan_tier := 'free';
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists private_beta_capacity_guard on public.private_beta_invites;
create trigger private_beta_capacity_guard
before insert or update on public.private_beta_invites
for each row execute function public.enforce_private_beta_capacity();
