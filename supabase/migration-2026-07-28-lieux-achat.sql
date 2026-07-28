-- Migration du 28/07/2026 — lieux d'achat (N3 point 4, commentaires 3).
-- À coller dans le SQL Editor du dashboard Supabase (session Olivier).
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  kind text not null default 'physique', -- physique | internet
  url text not null default '',
  address text not null default '',
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
alter table stores enable row level security;
drop policy if exists "lieux d'achat du foyer" on stores;
create policy "lieux d'achat du foyer" on stores
  for all using (is_member(household_id)) with check (is_member(household_id));
