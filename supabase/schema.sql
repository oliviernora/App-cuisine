-- Garde-manger : schéma initial (étape 1)
-- Foyers, membres, ingrédients, liste de courses.

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Notre foyer',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  primary key (household_id, user_id)
);

-- Résidences (lot 5 du 16/07/2026, décision Q6) : chaque résidence du foyer
-- (Argenteuil, Oulins, Montalivet…) a ses stocks, emplacements, courses et
-- sa semaine. Recettes, sources, réalisations et master list restent au foyer.
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

create table items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid references residences(id) on delete cascade,
  name text not null,
  loc text not null default '',
  qty int not null default 1,
  min int not null default 0, -- hérité : remplacé par ingredient_refs.min (16/07/2026), plus lu
  store text not null default '',
  dismissed boolean not null default false, -- hérité : remplacé par ingredient_refs.dismissed (16/07/2026), plus lu
  created_at timestamptz not null default now()
);

create table shopping (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid references residences(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  name text not null,
  store text not null default '',
  done boolean not null default false,
  manual boolean not null default false,
  qty numeric, -- quantité à acheter (null = non précisée)
  unit text not null default '',
  origin text not null default 'reappro', -- 'reappro' ou 'semaine' (synchronisé depuis les repas)
  available boolean not null default false, -- « je l'ai déjà » : à ne pas acheter
  received boolean not null default false, -- achetée et rangée « à mettre en stock » via l'inventaire (16/07/2026)
  created_at timestamptz not null default now()
);

-- Une seule entrée de courses par ingrédient lié (évite les doublons entre appareils).
create unique index shopping_one_per_item on shopping(item_id) where item_id is not null;

-- Appartenance au foyer, utilisable dans les politiques sans récursion.
create function is_member(h uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = h and user_id = auth.uid()
  );
$$;

alter table households enable row level security;
alter table household_members enable row level security;
alter table items enable row level security;
alter table shopping enable row level security;

create policy "membres voient leur foyer" on households
  for select using (is_member(id));
create policy "tout utilisateur connecté peut créer un foyer" on households
  for insert with check (auth.uid() is not null);
create policy "membres modifient leur foyer" on households
  for update using (is_member(id));

create policy "voir les membres de son foyer" on household_members
  for select using (user_id = auth.uid() or is_member(household_id));
create policy "se joindre soi-même avec le code du foyer" on household_members
  for insert with check (user_id = auth.uid());
create policy "quitter un foyer" on household_members
  for delete using (user_id = auth.uid());

create policy "ingrédients du foyer" on items
  for all using (is_member(household_id)) with check (is_member(household_id));

create policy "courses du foyer" on shopping
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Emplacements : entités porteuses de la date de dernier inventaire (cas N2).
create table locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid references residences(id) on delete cascade,
  name text not null,
  last_inventory_at timestamptz,
  dated boolean not null default false, -- « à dates » : chaque entrée forme un lot daté (N7)
  stale_months int not null default 6, -- ancienneté (mois) déclenchant le rappel des lots dans la Semaine (N10)
  unique (household_id, residence_id, name)
);
alter table locations enable row level security;
create policy "emplacements du foyer" on locations
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Lots datés (N7) : dans un emplacement « à dates », le stock d'un produit
-- est fait de lots (n produits identiques entrés à la même date).
-- items.qty reste le total ; les lots portent le détail des dates.
create table item_lots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid references residences(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  qty int not null default 1,
  entered_on date not null default current_date,
  created_at timestamptz not null default now()
);
alter table item_lots enable row level security;
create policy "lots du foyer" on item_lots
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Recettes (étape 4, incrément 1) : sources, recettes, réalisations.
create table sources (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  kind text not null default 'livre', -- livre | site | video | perso
  title text not null,
  author text not null default '',
  isbn text not null default '',
  publisher text not null default '',
  year text not null default '',
  cover_path text not null default '', -- couverture dans le bucket privé « photos » (N15)
  country text not null default '',
  categories text not null default '',
  url text not null default '', -- adresse d'une source « site » (N16, 04/08/2026)
  created_at timestamptz not null default now()
);
-- Livres non trouvés mis de côté au scan (NP15 révisé, 03/08/2026) : Claude
-- complète les fiches par recherche web (outil MCP completer_source).
create table pending_books (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  isbn text not null,
  photo_path text not null default '', -- photo de secours dans le bucket privé « photos »
  created_at timestamptz not null default now(),
  unique (household_id, isbn)
);
alter table pending_books enable row level security;
create policy "livres à compléter du foyer" on pending_books
  for all using (is_member(household_id)) with check (is_member(household_id));
create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  title text not null,
  page text not null default '',
  url text not null default '',
  video text not null default '', -- fichier vidéo local (PC)
  notes text not null default '',
  steps text not null default '', -- texte de la recette (étapes)
  servings int, -- « pour N personnes » (null = inconnu, pas de mise à l'échelle)
  country text not null default '', -- pays d'origine (recherche)
  category text not null default '', -- catégorie (« Boissons »… ; vide = plat)
  wishlist boolean not null default false, -- wish list « à faire un jour » (N11)
  created_at timestamptz not null default now()
);
create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  position int not null default 0,
  qty numeric,
  unit text not null default '',
  name text not null, -- l'ingrédient générique (« beurre salé »), sans qualificatif
  hard boolean not null default false, -- difficile à sourcer, à commander à l'avance (N11)
  note text not null default '', -- descriptif de la recette (« fondu », « pommade »…)
  optional boolean not null default false, -- ingrédient facultatif
  qty_raw text not null default '' -- saisie d'origine de la quantité (« ½ ») pour l'affichage
);
alter table recipe_ingredients enable row level security;
create policy "ingredients de recettes du foyer" on recipe_ingredients
  for all using (is_member(household_id)) with check (is_member(household_id));
create table realisations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  made_on date, -- null = cuisinée à une date non notée
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
create policy "réalisations du foyer" on realisations
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Semaine (cas N10, incrément 1) : événements et recettes associées.
create table events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid references residences(id) on delete cascade, -- la semaine est par résidence (Q6)
  day date not null,
  title text not null default 'Dîner maison',
  guests int not null default 4,
  contraintes text not null default '',
  created_at timestamptz not null default now()
);
create table event_recipes (
  household_id uuid not null references households(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  scale_pct int not null default 100, -- ajustement % pour cet événement
  qty_overrides jsonb not null default '{}', -- quantités corrigées à la main { nom: qty }
  primary key (event_id, recipe_id)
);
alter table events enable row level security;
alter table event_recipes enable row level security;
create policy "événements du foyer" on events
  for all using (is_member(household_id)) with check (is_member(household_id));
create policy "recettes des événements du foyer" on event_recipes
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Référentiel d'ingrédients (master list, décision Olivier 07/07/2026) :
-- une entrée par ingrédient canonique ; aliases = orthographes confirmées
-- comme identiques ; rejected = rapprochements refusés (jamais reproposés).
create table ingredient_refs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  aliases text[] not null default '{}',
  rejected text[] not null default '{}',
  category text not null default '', -- genre de rangement (master list)
  sourcing text not null default '', -- marché | internet | boutique ('' = hérite du genre)
  sourcing_note text not null default '', -- URL, nom du marché…
  min int not null default 1, -- réserve minimum : rachat auto quand la somme des emplacements passe en dessous (16/07/2026)
  dismissed boolean not null default false, -- épuisé mais retiré du panier par l'utilisateur (NP1, niveau ingrédient)
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
alter table ingredient_refs enable row level security;
create policy "référentiel du foyer" on ingredient_refs
  for all using (is_member(household_id)) with check (is_member(household_id));

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

-- Photos de recettes (N8, étape 4 incrément 2) : plat (liée à une
-- réalisation si consignée avec) ou page du livre (copie privée du foyer).
-- Le fichier vit dans le bucket privé « photos », chemin <foyer>/<recette>/<uuid>.jpg.
create table recipe_photos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  realisation_id uuid references realisations(id) on delete set null,
  kind text not null default 'plat', -- plat | page
  path text not null, -- chemin dans le bucket « photos »
  created_at timestamptz not null default now()
);
alter table recipe_photos enable row level security;
create policy "photos de recettes du foyer" on recipe_photos
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Bucket privé « photos » : accès réservé au foyer dont l'id ouvre le chemin.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;
create policy "photos du foyer — lecture" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and is_member(((storage.foldername(name))[1])::uuid));
create policy "photos du foyer — ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and is_member(((storage.foldername(name))[1])::uuid));
create policy "photos du foyer — suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and is_member(((storage.foldername(name))[1])::uuid));

-- Synchronisation temps réel entre appareils.
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table shopping;

-- Lieux d'achat (N3 point 4, décision Olivier 27/07/2026) : entités gérées
-- (physique ou Internet, URL / adresse, commentaire), communes au foyer.
-- Les lignes de courses et le sourcing continuent de porter le nom en texte.
create table stores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  kind text not null default 'physique', -- physique | internet
  url text not null default '',
  address text not null default '',
  comment text not null default '',
  -- Une boutique PHYSIQUE appartient à une résidence (04/08/2026) ; null =
  -- non rangée, visible partout. Les lieux Internet restent communs (null).
  residence_id uuid references residences(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);
alter table stores enable row level security;
create policy "lieux d'achat du foyer" on stores
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Fiche ingrédient unique (N14 amendé, 04/08/2026) : réserve minimum PAR
-- RÉSIDENCE (repli : ingredient_refs.min, puis 1).
create table ingredient_minimums (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  residence_id uuid not null references residences(id) on delete cascade,
  name text not null, -- nom canonique de l'ingrédient (master list)
  min numeric not null default 1,
  created_at timestamptz not null default now(),
  unique (household_id, residence_id, name)
);
alter table ingredient_minimums enable row level security;
create policy "minimums du foyer" on ingredient_minimums
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Un ingrédient peut avoir PLUSIEURS lieux d'achat (04/08/2026).
create table ingredient_stores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null, -- nom canonique de l'ingrédient (master list)
  store_id uuid not null references stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (household_id, name, store_id)
);
alter table ingredient_stores enable row level security;
create policy "lieux d'achat des ingrédients du foyer" on ingredient_stores
  for all using (is_member(household_id)) with check (is_member(household_id));
