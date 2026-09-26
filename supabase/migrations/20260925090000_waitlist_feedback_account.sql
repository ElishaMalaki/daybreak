-- Earth AI waitlist, feedback, and account deletion foundation
-- Safe additive migration: no existing product tables are changed.

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  interest text not null check (interest in ('agriculture', 'finance', 'pelit', 'enterprise')),
  message text,
  source text not null default 'earth_ai_website',
  status text not null default 'new' check (status in ('new', 'reviewing', 'approved', 'declined', 'archived')),
  admin_notes text,
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
create index if not exists feedback_reports_user_idx on public.feedback_reports (user_id, created_at desc);
create index if not exists feedback_reports_status_idx on public.feedback_reports (status, created_at desc);
create index if not exists account_deletion_requests_user_idx on public.account_deletion_requests (user_id, requested_at desc);

alter table public.waitlist_entries enable row level security;
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
