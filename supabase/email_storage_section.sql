-- ============================================================================
-- Email storage (website waitlist)
-- Run in Supabase → SQL Editor once per project (idempotent).
-- Inserts from the site use the publishable (anon) key + RLS insert policy.
-- ============================================================================

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_lowercase check (email = lower(email))
);

create unique index if not exists waitlist_signups_email_key on public.waitlist_signups (email);

alter table public.waitlist_signups enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist_signups;

create policy "Anyone can join waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

comment on table public.waitlist_signups is 'Website waitlist email captures';
