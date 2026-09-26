-- Remove private beta access controls from production databases.
-- Keep normal waitlist, feedback, account deletion, and subscription foundations intact.

drop trigger if exists private_beta_capacity_guard on public.private_beta_invites;
drop function if exists public.enforce_private_beta_capacity();
drop function if exists public.is_private_beta_user(text);
drop function if exists public.private_beta_accepted_count();
drop table if exists public.private_beta_invites;

-- Waitlist remains a normal product update and early access list, not an application gate.
do $$ begin
  alter table public.waitlist_entries
    drop constraint if exists waitlist_entries_status_check;
exception when undefined_table then null; end $$;

do $$ begin
  alter table public.waitlist_entries
    add constraint waitlist_entries_status_check
    check (status in ('new', 'reviewing', 'approved', 'declined', 'archived'));
exception
  when undefined_table then null;
  when duplicate_object then null;
end $$;
