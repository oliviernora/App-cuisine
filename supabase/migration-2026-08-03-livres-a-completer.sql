-- Migration du 03/08/2026 — livres non trouvés mis de côté (NP15 révisé).
-- Un scan sans résultat garde l'ISBN (photo de secours possible) ; Claude
-- complète ensuite les fiches par recherche web (outil MCP completer_source).
-- À coller dans le SQL Editor du dashboard Supabase (session Olivier).
create table if not exists pending_books (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  isbn text not null,
  photo_path text not null default '', -- photo de secours dans le bucket privé « photos »
  created_at timestamptz not null default now(),
  unique (household_id, isbn)
);
alter table pending_books enable row level security;
drop policy if exists "livres à compléter du foyer" on pending_books;
create policy "livres à compléter du foyer" on pending_books
  for all using (is_member(household_id)) with check (is_member(household_id));
