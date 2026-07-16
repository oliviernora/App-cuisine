-- Migration du 16/07/2026 nuit — APPLIQUÉE le 16/07/2026 (SQL Editor piloté
-- en session, GO d'Olivier, sauvegarde préalable, check:schema 16/16).
-- Lot 5 des commentaires Olivier du 16/07/2026 (décision
-- Q6) : les RÉSIDENCES (Argenteuil, Oulins, Montalivet…). Chaque résidence
-- a ses stocks, ses emplacements, ses courses et sa semaine ; les recettes,
-- sources, réalisations, wish list et master list restent communes au foyer.

create table residences (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
alter table residences enable row level security;
create policy "résidences du foyer" on residences
  for all using (is_member(household_id)) with check (is_member(household_id));

alter table items add column residence_id uuid references residences(id) on delete cascade;
alter table shopping add column residence_id uuid references residences(id) on delete cascade;
alter table locations add column residence_id uuid references residences(id) on delete cascade;
alter table item_lots add column residence_id uuid references residences(id) on delete cascade;
alter table events add column residence_id uuid references residences(id) on delete cascade;

-- Deux résidences peuvent avoir un emplacement du même nom (« Cuisine ») :
-- l'unicité des emplacements devient par résidence.
alter table locations drop constraint locations_household_id_name_key;
alter table locations add constraint locations_residence_name_key
  unique (household_id, residence_id, name);

-- Reprise : tout l'existant rejoint la première résidence, « Argenteuil »
-- (renommable dans Foyer et compte).
insert into residences (household_id, name) select id, 'Argenteuil' from households;
update items i set residence_id = r.id from residences r
  where r.household_id = i.household_id and i.residence_id is null;
update shopping s set residence_id = r.id from residences r
  where r.household_id = s.household_id and s.residence_id is null;
update locations l set residence_id = r.id from residences r
  where r.household_id = l.household_id and l.residence_id is null;
update item_lots t set residence_id = r.id from residences r
  where r.household_id = t.household_id and t.residence_id is null;
update events e set residence_id = r.id from residences r
  where r.household_id = e.household_id and e.residence_id is null;
