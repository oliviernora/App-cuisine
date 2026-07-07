-- MIGRATION EN ATTENTE (dashboard Supabase instable au moment de la livraison).
-- À coller telle quelle dans SQL Editor > Run.
-- (La grande migration du 06/07 — locations, sources, recipes, realisations,
-- events, event_recipes — a été appliquée le 06/07/2026 au soir.)

alter table recipes add column steps text not null default '';

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  position int not null default 0,
  qty numeric,
  unit text not null default '',
  name text not null
);
alter table recipe_ingredients enable row level security;
create policy "ingredients de recettes du foyer" on recipe_ingredients
  for all using (is_member(household_id)) with check (is_member(household_id));
