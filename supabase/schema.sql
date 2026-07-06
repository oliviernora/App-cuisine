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

create table items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  loc text not null default '',
  qty int not null default 1,
  min int not null default 0,
  store text not null default '',
  dismissed boolean not null default false, -- épuisé mais retiré du panier par l'utilisateur (NP1)
  created_at timestamptz not null default now()
);

create table shopping (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  name text not null,
  store text not null default '',
  done boolean not null default false,
  manual boolean not null default false,
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
  name text not null,
  last_inventory_at timestamptz,
  unique (household_id, name)
);
alter table locations enable row level security;
create policy "emplacements du foyer" on locations
  for all using (is_member(household_id)) with check (is_member(household_id));

-- Synchronisation temps réel entre appareils.
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table shopping;
