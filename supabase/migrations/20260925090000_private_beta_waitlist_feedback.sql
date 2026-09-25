-- Earth AI private beta, waitlist, feedback, and account deletion foundation
-- Safe additive migration: no existing product tables are changed.

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  interest text not null check (interest in ('agriculture', 'finance', 'pelit', 'enterprise')),
  message text,
  source text not null default 'earth_ai_website',
  status text not null default 'new' check (status in ('new', 'reviewing', 'invited', 'approved', 'declined', 'archived')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.private_beta_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'invited' check (status in ('invited', 'accepted', 'revoked')),
  plan_tier text not null default 'free' check (plan_tier = 'free'),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  type text not null check (type in ('feedback', 'bug', 'error', 'suggestion')),
  page_path text,
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'closed')),
  severity text not null default 'normal' check (severity in ('low', 'normal', 'high', 'critical')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  admin_notes text
);

create unique index if not exists waitlist_entries_email_idx on public.waitlist_entries (lower(email));
create index if not exists waitlist_entries_status_idx on public.waitlist_entries (status, created_at desc);
create unique index if not exists private_beta_invites_email_idx on public.private_beta_invites (lower(email));
create index if not exists private_beta_invites_status_idx on public.private_beta_invites (status, invited_at desc);
create index if not exists feedback_reports_user_idx on public.feedback_reports (user_id, created_at desc);
create index if not exists feedback_reports_status_idx on public.feedback_reports (status, created_at desc);
create index if not exists account_deletion_requests_user_idx on public.account_deletion_requests (user_id, requested_at desc);

alter table public.waitlist_entries enable row level security;
alter table public.private_beta_invites enable row level security;
alter table public.feedback_reports enable row level security;
alter table public.account_deletion_requests enable row level security;

-- Public visitors can join the waitlist. Admin review is server/admin-only.
do $$ begin
  create policy "Anyone can join waitlist" on public.waitlist_entries
    for insert to anon, authenticated
    with check (true);
exception when duplicate_object then null; end $$;

-- Users can create and read their own feedback reports.
do $$ begin
  create policy "Users create own feedback" on public.feedback_reports
    for insert to authenticated
    with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users read own feedback" on public.feedback_reports
    for select to authenticated
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

-- Users can request account deletion and read their own request history.
do $$ begin
  create policy "Users create own deletion requests" on public.account_deletion_requests
    for insert to authenticated
    with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users read own deletion requests" on public.account_deletion_requests
    for select to authenticated
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

-- Private beta helper: only accepted, non-revoked invite emails qualify.
create or replace function public.is_private_beta_user(p_email text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.private_beta_invites
    where lower(email) = lower(p_email)
      and status in ('invited', 'accepted')
      and plan_tier = 'free'
  );
$$;

-- Private beta capacity helper for admin tools.
create or replace function public.private_beta_accepted_count()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.private_beta_invites
  where status in ('invited', 'accepted');
$$;
