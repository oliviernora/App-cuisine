-- Pré-remplissage des pays d'origine (proposition validée par Olivier le 07/07/2026).
-- Rejouable : ne touche que les recettes SANS pays. À appliquer dans le SQL Editor.

-- Alain Passard → France par défaut
update recipes set country = 'France'
where country = ''
  and source_id in (select id from sources where title like 'Alain Passard%');

-- Les dals → Inde
update recipes set country = 'Inde'
where country = '' and (title ilike 'dal %' or title ilike '%dal indien%');

-- La salade de poulet créole → Antilles
update recipes set country = 'Antilles'
where country = '' and title ilike 'salade de poulet%';

-- Recettes clairement françaises déjà en base (lot Evernote 1 + Marie Claire)
update recipes set country = 'France'
where country = '' and title in (
  'La bouillabaisse marseillaise traditionnelle',
  'Pâte à crêpes traditionnelle',
  'Crêpes de sarrasin (recette perso)',
  'Gaufres de pomme de terre',
  'Pavés de cabillaud aux lentilles'
);
update recipes set country = 'France'
where country = '' and title ilike '%tatin d''endives%';

-- Bilan
select coalesce(nullif(country, ''), '(sans pays)') as pays, count(*)
from recipes group by 1 order by 2 desc;
