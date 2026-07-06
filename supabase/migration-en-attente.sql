-- MIGRATION EN ATTENTE (bloquée par l'incident du dashboard Supabase du 06/07/2026).
-- À coller telle quelle dans SQL Editor > Run dès que le dashboard répond.
-- Contenu : table locations (dates d'inventaire) + tables recettes (étape 4).

create table locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  last_inventory_at timestamptz,
  unique (household_id, name)
);
alter table locations enable row level security;
create policy "emplacements du foyer" on locations
  for all using (is_member(household_id)) with check (is_member(household_id));

create table sources (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  kind text not null default 'livre',
  title text not null,
  author text not null default '',
  isbn text not null default '',
  country text not null default '',
  categories text not null default '',
  created_at timestamptz not null default now()
);
create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  title text not null,
  page text not null default '',
  url text not null default '',
  video text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
create table realisations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  made_on date,
  comment text not null default '',
  created_at timestamptz not null default now()
);
alter table sources enable row level security;
alter table recipes enable row level security;
alter table realisations enable row level security;
create policy "sources du foyer" on sources
  for all using (is_member(household_id)) with check (is_member(household_id));
create policy "recettes du foyer" on recipes
  for all using (is_member(household_id)) with check (is_member(household_id));
create policy "realisations du foyer" on realisations
  for all using (is_member(household_id)) with check (is_member(household_id));
