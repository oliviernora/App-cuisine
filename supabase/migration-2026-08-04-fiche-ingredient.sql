-- Migration du 04/08/2026 (2) — fiche ingrédient unique (N14 amendé,
-- décisions Olivier du 04/08) :
-- (1) réserve minimum PAR RÉSIDENCE (repli : ingredient_refs.min, puis 1) ;
-- (2) un ingrédient peut avoir PLUSIEURS lieux d'achat ;
-- (3) une boutique PHYSIQUE appartient à une résidence (les lieux Internet
--     restent communs au foyer) — une boutique non rangée (residence_id
--     null) reste visible partout.
-- Rejouable sans risque (les drop policy préparent les create qui suivent).

alter table stores add column if not exists residence_id
  uuid references residences(id) on delete set null;

create table if not exists ingredient_minimums (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid not null references residences(id) on delete cascade,
  name text not null, -- nom canonique de l'ingrédient (master list)
  min numeric not null default 1,
  created_at timestamptz not null default now(),
  unique (household_id, residence_id, name)
);
alter table ingredient_minimums enable row level security;
drop policy if exists "minimums du foyer" on ingredient_minimums;
create policy "minimums du foyer" on ingredient_minimums
  for all using (is_member(household_id)) with check (is_member(household_id));

create table if not exists ingredient_stores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null, -- nom canonique de l'ingrédient (master list)
  store_id uuid not null references stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (household_id, name, store_id)
);
alter table ingredient_stores enable row level security;
drop policy if exists "lieux d'achat des ingrédients du foyer" on ingredient_stores;
create policy "lieux d'achat des ingrédients du foyer" on ingredient_stores
  for all using (is_member(household_id)) with check (is_member(household_id));
