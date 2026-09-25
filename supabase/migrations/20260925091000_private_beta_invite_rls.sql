-- Let authenticated users verify only their own private beta invite.
-- This supports middleware beta gating without exposing other invite records.

do $$ begin
  create policy "Users read own beta invite" on public.private_beta_invites
    for select to authenticated
    using (lower(email) = lower((auth.jwt() ->> 'email')));
exception when duplicate_object then null; end $$;
