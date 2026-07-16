-- Migration du 16/07/2026 — APPLIQUÉE le 16/07/2026 (SQL Editor piloté en
-- session, demande d'Olivier, sauvegarde JSON complète préalable sur
-- OneDrive, check:schema 15/15). Conservée pour trace ; le schéma de
-- référence est supabase/schema.sql.
-- Stock par ingrédient (commentaires Olivier du 16/07/2026) : le minimum de
-- réserve et l'état « retiré du panier » (NP1) remontent de la ligne
-- d'emplacement (items.min, items.dismissed) à l'ingrédient
-- (ingredient_refs). Le rachat automatique se déclenche quand la SOMME de
-- tous les emplacements passe sous le minimum. Le minimum vaut 1 par défaut :
-- rachat quand il n'en reste plus, comme avant.

alter table ingredient_refs add column min int not null default 1;
alter table ingredient_refs add column dismissed boolean not null default false;

-- Reprise des réglages posés par emplacement. L'ancienne règle rachetait à
-- qty <= min, la nouvelle à somme < min : l'équivalent est max(min) + 1.
-- 1) Fiches du référentiel manquantes pour les produits concernés.
insert into ingredient_refs (household_id, name, min)
select i.household_id, min(i.name), max(i.min) + 1
from items i
where (i.min > 0 or i.dismissed) and not exists (
  select 1 from ingredient_refs r
  where r.household_id = i.household_id
    and (lower(r.name) = lower(i.name)
      or lower(i.name) in (select lower(a) from unnest(r.aliases) a))
)
group by i.household_id, lower(i.name);

-- 2) Report des minimums sur les fiches existantes.
update ingredient_refs r set min = greatest(r.min, s.m + 1)
from (select household_id, lower(name) as nm, max(min) as m
      from items where min > 0 group by 1, 2) s
where s.household_id = r.household_id
  and (lower(r.name) = s.nm
    or s.nm in (select lower(a) from unnest(r.aliases) a));

-- 3) Report des produits « retirés du panier » (NP1).
update ingredient_refs r set dismissed = true
from items i
where i.household_id = r.household_id and i.dismissed
  and (lower(r.name) = lower(i.name)
    or lower(i.name) in (select lower(a) from unnest(r.aliases) a));

-- items.min et items.dismissed ne sont plus lus par l'application ;
-- ils sont conservés pour pouvoir revenir en arrière (suppression dans
-- une migration ultérieure, une fois le nouveau stock validé).
