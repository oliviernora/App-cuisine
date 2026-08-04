-- Migration du 04/08/2026 — écran bibliothèque (N16, commentaires 4 lot 4).
-- Les sources « site » portent leur adresse : bouton « Visiter le site »
-- même sans recette enregistrée, et sites intéressants gardés pour plus tard.
-- Rejouable sans risque.

alter table sources add column if not exists url text not null default '';
