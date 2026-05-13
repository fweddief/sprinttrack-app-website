-- SprintTrack waitlist — run in Supabase Dashboard → SQL Editor
-- 1. Paste this entire file and click Run.
-- 2. Copy your Project URL + anon public key from Settings → API.
-- 3. In the website folder: cp supabase-config.example.js supabase-config.js
--    Then paste url and anonKey into supabase-config.js.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_lowercase check (email = lower(email))
);

create unique index if not exists waitlist_signups_email_key on public.waitlist_signups (email);

alter table public.waitlist_signups enable row level security;

-- Anonymous site visitors may insert one row at a time (anon key + RLS).
create policy "Anyone can join waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

-- Optional: allow authenticated dashboard users to read (skip if you only use Table Editor as owner).
-- create policy "Service role reads via dashboard only"
--   on public.waitlist_signups for select to authenticated using (auth.role() = 'authenticated');

comment on table public.waitlist_signups is 'Marketing waitlist emails from sprinttrack.app';
