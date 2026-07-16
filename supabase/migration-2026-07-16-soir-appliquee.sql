-- Migration du 16/07/2026 soir — APPLIQUÉE le 16/07/2026 (SQL Editor piloté
-- en session, GO d'Olivier, sauvegarde préalable, check:schema OK).
-- Lot 3 des commentaires Olivier du 16/07/2026 (décision
-- Q2) : « Ranger les achats » n'ajoute plus +1 au stock — les lignes
-- cochées deviennent « reçues, à mettre en stock » et s'intègrent au stock
-- depuis l'onglet Inventaire, avec la vraie quantité et l'emplacement
-- choisis (règle aussi NP4 : plusieurs pots d'un coup).

alter table shopping add column received boolean not null default false;
