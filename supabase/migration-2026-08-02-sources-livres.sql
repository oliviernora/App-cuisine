-- Migration du 02/08/2026 — chantier bibliothèque par scan ISBN (N15).
-- Livres documentés depuis le web : éditeur, année, couverture (copiée dans
-- le bucket privé « photos », décision Olivier 02/08/2026).
-- À exécuter dans le SQL Editor de Supabase (main d'Olivier), puis
-- vérifier avec `npm run check:schema` dans app/.

alter table sources add column if not exists publisher text not null default '';
alter table sources add column if not exists year text not null default '';
alter table sources add column if not exists cover_path text not null default '';
