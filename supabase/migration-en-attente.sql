-- Migration du 08/07/2026 — APPLIQUÉE le 09/07/2026 (SQL Editor, session
-- navigateur d'Olivier, sauvegarde préalable de la base ; check:schema 15/15).
-- Conservée pour trace ; le schéma de référence est supabase/schema.sql.
-- Porte : genres d'ingrédients (table + sourcing), sourcing par ingrédient,
-- descriptif / facultatif / fraction sur les ingrédients de recette,
-- seuil d'ancienneté des lots par emplacement (rappel Semaine, N10).

-- Genres d'ingrédients (master list des genres, commentaires Olivier 08/07) :
-- une entrée par genre, avec le sourcing par défaut du genre.
create table ingredient_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  sourcing text not null default '', -- marché | internet | boutique | '' (non précisé)
  sourcing_note text not null default '', -- URL, nom du marché…
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
alter table ingredient_categories enable row level security;
create policy "genres du foyer" on ingredient_categories
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Reprise : chaque catégorie déjà utilisée devient un genre.
insert into ingredient_categories (household_id, name)
select distinct household_id, category from ingredient_refs where category <> ''
on conflict do nothing;

-- Sourcing affiné ingrédient par ingrédient (vide = hérite du genre).
alter table ingredient_refs add column sourcing text not null default '';
alter table ingredient_refs add column sourcing_note text not null default '';

-- Lignes de recette : descriptif (« fondu », « pommade »… — l'ingrédient
-- générique reste dans name), facultatif, et saisie d'origine de la
-- quantité (« ½ », « 1/2 », « 0,5 ») pour réafficher comme entré.
alter table recipe_ingredients add column note text not null default '';
alter table recipe_ingredients add column optional boolean not null default false;
alter table recipe_ingredients add column qty_raw text not null default '';

-- Rappel des lots anciens dans la Semaine (N10) : seuil réglable par
-- emplacement « à dates » (mois).
alter table locations add column stale_months int not null default 6;

-- Réparation des artefacts de fractions (plan, point 3) : l'ancien parseur
-- lisait « 1/2 canard » comme qty=1, name=« /2 canard ». On rétablit la
-- vraie quantité, la saisie d'origine et le nom.
update recipe_ingredients set
  qty_raw = qty::int || substring(name from '^(/\d+)'),
  qty = qty / (substring(name from '^/([1-9]\d*)'))::numeric,
  name = regexp_replace(name, '^/\d+\s*(de\s+|d'')?', '')
where name ~ '^/[1-9]\d*\s' and qty is not null;

-- Contrôle : les noms encore douteux de la master list (à trancher avec
-- Olivier — « Aïe », « eau », « ficelle de cuisine »…).
select ri.name, count(*) as lignes, array_agg(distinct r.title) as recettes
from recipe_ingredients ri join recipes r on r.id = ri.recipe_id
where ri.name ~ '^[/\d]' or lower(ri.name) in ('aïe', 'eau', 'ficelle de cuisine')
group by ri.name order by ri.name;
