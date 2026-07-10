-- Import Evernote (généré par enex-merge.mjs — rejouable, aucun doublon).
with h as (select id from households limit 1)
insert into sources (household_id, kind, title)
select h.id, 'site', v.title from h cross join (values
  ('Recettes perso'),
  ('Marie Claire — Cuisine'),
  ('Papilles et Pupilles'),
  ('aufouraumoulin.com'),
  ('L''Atelier des Chefs'),
  ('healthyfoodcreation.fr'),
  ('recettes-de-clairette.overblog.com'),
  ('Le Monde — Cuisine'),
  ('pepperdelight.com')
) as v(title)
where not exists (select 1 from sources s where s.title = v.title);

-- Jus céleri, laitue, épinards, pomme verte
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus céleri, laitue, épinards, pomme verte', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus céleri, laitue, épinards, pomme verte' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'céleri'),
  (1, null, '', 'laitue'),
  (2, null, '', 'épinards'),
  (3, null, '', 'pomme verte')
) as v(pos, qty, unit, name) on true;

-- Jus céleri, haricots verts, poire, persil
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus céleri, haricots verts, poire, persil', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus céleri, haricots verts, poire, persil' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'céleri'),
  (1, null, '', 'haricots verts'),
  (2, null, '', 'poire'),
  (3, null, '', 'persil')
) as v(pos, qty, unit, name) on true;

-- Jus chou de Bruxelles, laitue, pomme
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus chou de Bruxelles, laitue, pomme', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus chou de Bruxelles, laitue, pomme' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'chou de Bruxelles'),
  (1, null, '', 'laitue'),
  (2, null, '', 'pomme')
) as v(pos, qty, unit, name) on true;

-- Jus fenouil, pomme verte, citron, coriandre
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus fenouil, pomme verte, citron, coriandre', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus fenouil, pomme verte, citron, coriandre' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'fenouil'),
  (1, null, '', 'pomme verte'),
  (2, null, '', 'citron'),
  (3, null, '', 'coriandre')
) as v(pos, qty, unit, name) on true;

-- Jus fenouil, concombre, céleri, orange, muscade
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus fenouil, concombre, céleri, orange, muscade', '', null, 'Passer fenouil, concombre, céleri et orange à l''extracteur de jus. Râper un peu de muscade au moment de servir.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus fenouil, concombre, céleri, orange, muscade' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'fenouil'),
  (1, null, '', 'concombre'),
  (2, null, '', 'céleri'),
  (3, null, '', 'orange'),
  (4, null, '', 'muscade')
) as v(pos, qty, unit, name) on true;

-- Jus concombre, céleri, laitue, pomme verte
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus concombre, céleri, laitue, pomme verte', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus concombre, céleri, laitue, pomme verte' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'concombre'),
  (1, null, '', 'céleri'),
  (2, null, '', 'laitue'),
  (3, null, '', 'pomme verte')
) as v(pos, qty, unit, name) on true;

-- Jus kiwi, pomme, sauge
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus kiwi, pomme, sauge', '', null, 'Passer tous les ingrédients à l''extracteur de jus. Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus kiwi, pomme, sauge' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'kiwi'),
  (1, null, '', 'pomme'),
  (2, null, '', 'sauge')
) as v(pos, qty, unit, name) on true;

-- Jus de dattes fraîches
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus de dattes fraîches', '', null, 'Passer les dattes fraîches dénoyautées à l''extracteur de jus.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus de dattes fraîches' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'dattes fraîches')
) as v(pos, qty, unit, name) on true;

-- Jus betterave, pomme, citron vert, carotte, gingembre
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Jus betterave, pomme, citron vert, carotte, gingembre', '', null, 'Passer tous les ingrédients à l''extracteur de jus (la note d''origine indique « pomme/citron vert/carotte » : doser au goût, éventuellement l''un des trois seulement). Boire frais.', 'Boissons'
  from h where not exists (select 1 from recipes where title = 'Jus betterave, pomme, citron vert, carotte, gingembre' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, null::numeric, '', 'betterave'),
  (1, null, '', 'pomme'),
  (2, null, '', 'citron vert'),
  (3, null, '', 'carotte'),
  (4, null, '', 'gingembre')
) as v(pos, qty, unit, name) on true;

-- Salade de poulet aux herbes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Salade de poulet aux herbes', 'https://www.marieclaire.fr/cuisine/salade-de-poulet-aux-herbes,1444800.asp', 4, 'Réchauffer le poulet cuit 15 min au four à 180 °C. Pendant ce temps, peler les oignons nouveaux, les rincer et sécher avec le persil et la coriandre, ciseler finement le tout ; mettre dans un saladier avec l''huile, le jus du citron vert et le vinaigre. Le poulet encore chaud : ôter la peau, émietter grossièrement la chair, mélanger au saladier. Servir tiède ou froid. (Suzy Palatin — recette créole ; en saison, ajouter tomates, aubergines ou courgettes. Préparation 15 min, cuisson 15 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/salade-de-poulet-aux-herbes,1444800.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'poulet déjà cuit'),
  (1, 0.5, 'botte', 'oignons nouveaux'),
  (2, 1, '', 'citron vert'),
  (3, 1, 'botte', 'persil plat'),
  (4, 1, 'botte', 'coriandre'),
  (5, 4, 'c. à s.', 'huile de tournesol ou d''arachide'),
  (6, 3, 'c. à s.', 'vinaigre blanc'),
  (7, null, '', 'sel'),
  (8, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Maquereaux à la plancha
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Papilles et Pupilles'), 'Maquereaux à la plancha', 'https://www.papillesetpupilles.fr/2019/06/maquereaux-a-la-plancha.html/', 4, 'Vider les maquereaux et faire 4 incisions parallèles dans la partie charnue de chaque poisson. Les mariner 45 min au frais dans huile d''olive + vin blanc + fenouil + genièvre + laurier + citron. Sur la plancha chaude, étaler une poignée de gros sel (il tempère la chaleur), y dorer les maquereaux 4-5 min par face. Piment d''Espelette et servir aussitôt. Attention : ne pas retourner dans le gros sel (avis lecteur). (Papilles et Pupilles — préparation 15 min, cuisson 10 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.papillesetpupilles.fr/2019/06/maquereaux-a-la-plancha.html/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 8::numeric, '', 'petits maquereaux'),
  (1, 1, '', 'poignée de gros sel gris de Guérande'),
  (2, 10, 'cl', 'vin blanc'),
  (3, 10, 'cl', 'huile d''olive'),
  (4, 1, 'c. à c.', 'graines de fenouil'),
  (5, 1, 'feuille', 'laurier'),
  (6, 5, '', 'baies de genièvre'),
  (7, 1, '', 'zeste de citron'),
  (8, 1, 'pincée', 'piment d''Espelette')
) as v(pos, qty, unit, name) on true;

-- Pâte à crêpes traditionnelle
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pâte à crêpes traditionnelle', 'https://www.marieclaire.fr/cuisine/pate-a-crepes,24127,1192363.asp', 4, 'Pour une vingtaine de crêpes fines. Tamiser la farine en puits, délayer avec la moitié du lait. Ajouter les œufs battus, puis le beurre fondu et une pincée de sel ; verser le reste du lait en remuant jusqu''à pâte lisse. Repos 2 h (ou lait chaud / robot pour diviser par deux). Cuire à la poêle à fond épais graissée, petite louche inclinée pour étaler. Sucre glace en empilant. (Marie Claire — préparation 15 min, cuisson 40 min, repos 2 h.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/pate-a-crepes,24127,1192363.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 250::numeric, 'g', 'farine tamisée'),
  (1, 3, '', 'œufs'),
  (2, 50, 'cl', 'lait'),
  (3, 2, 'c. à s.', 'beurre fondu'),
  (4, null, '', 'huile pour la cuisson'),
  (5, null, '', 'sel')
) as v(pos, qty, unit, name) on true;

-- Crêpes de sarrasin (recette perso)
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Crêpes de sarrasin (recette perso)', '', null, 'Bilic pas trop liquide. Version sucrée : 350 g froment, 70 g blé noir, 4 œufs, sel, 70 g sucre. (Note perso Evernote du 17/10/2024, transcrite telle quelle.)', ''
  from h where not exists (select 1 from recipes where title = 'Crêpes de sarrasin (recette perso)' and source_id = (select id from sources where title = 'Recettes perso'))
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 350::numeric, 'g', 'farine de sarrasin'),
  (1, 70, 'g', 'farine de froment'),
  (2, 1, '', 'œuf'),
  (3, 25, 'cl', 'lait'),
  (4, null, '', 'sel'),
  (5, null, '', 'eau')
) as v(pos, qty, unit, name) on true;

-- Dal indien
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Dal indien', 'https://www.marieclaire.fr/cuisine/dal-indien,1201655.asp', 6, 'Monder et couper la tomate en dés ; épépiner et hacher finement les piments ; émincer échalotes et ail. Rincer les lentilles, les tremper 30 min, égoutter. Bouillir 1 l d''eau avec curcuma, cumin et échalotes ; y cuire les lentilles 30 min à frémissement, puis ajouter tomate et piments et poursuivre 45 min jusqu''à ce qu''elles s''écrasent (rallonger d''eau au besoin). Remuer hors du feu en soupe épaisse. Tempérage final : graines de moutarde, ail et feuilles de cari revenus au beurre à feu vif, versés sur les lentilles ; saler, servir chaud parsemé de coriandre — avec riz basmati ou naan. (Marie Claire — préparation 30 min, cuisson 1 h 15.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/dal-indien,1201655.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 200::numeric, 'g', 'lentilles jaunes'),
  (1, 1, '', 'grosse tomate'),
  (2, 2, '', 'petits piments verts'),
  (3, 3, 'gousses', 'ail'),
  (4, 2, '', 'échalotes'),
  (5, 1, 'c. à s.', 'feuilles de coriandre ciselées'),
  (6, 0.5, 'c. à c.', 'curcuma moulu'),
  (7, 1, 'c. à c.', 'cumin'),
  (8, 0.5, 'c. à c.', 'graines de moutarde'),
  (9, 8, 'feuilles', 'cari (curry)'),
  (10, 15, 'g', 'beurre'),
  (11, null, '', 'sel')
) as v(pos, qty, unit, name) on true;

-- Velouté glacé à la courgette et au lait de coco
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'aufouraumoulin.com'), 'Velouté glacé à la courgette et au lait de coco', 'https://www.aufouraumoulin.com/veloute-glace-a-la-courgette/', 4, 'Faire revenir l''oignon émincé 5-8 min à l''huile d''olive, ajouter l''ail écrasé. Ajouter les courgettes en tronçons, couvrir d''eau bouillante, saler, cuire 10-12 min à couvert. Retirer 2-3 louches de bouillon (pour ajuster ensuite), ajouter le lait de coco (ou ribot) et mixer finement — un peu plus liquide que voulu, la soupe épaissit en refroidissant. Mixer avec les herbes, réfrigérer au moins 1 h. La version coco se mange aussi chaude ; pas la version ribot. (Au four au moulin — 28 min en tout.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.aufouraumoulin.com/veloute-glace-a-la-courgette/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 500::numeric, 'g', 'courgettes (2 moyennes ou 3 petites)'),
  (1, 1, '', 'oignon'),
  (2, 1, 'gousse', 'ail (facultatif)'),
  (3, 15, 'cl', 'lait de coco ou lait ribot'),
  (4, 1, 'c. à s.', 'huile d''olive'),
  (5, 1, '', 'poignée de basilic, menthe ou coriandre'),
  (6, null, '', 'sel'),
  (7, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Dal de lentilles corail à l'indienne
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Dal de lentilles corail à l''indienne', 'https://www.marieclaire.fr/cuisine/recette-de-dal-de-lentilles-indien,1212481.asp', 4, 'Cuire les lentilles couvertes d''eau : ébullition, écumer, puis 20 min à petit feu jusqu''à consistance crémeuse. À côté, faire revenir l''oignon en dés 5 min dans 1 c. à s. d''huile, ajouter tomate en dés et gingembre 3 min, puis le curcuma, puis les épinards 5 min ; verser le tout dans le dal et mijoter quelques minutes, saler. Finition : chauffer 1 c. à s. d''huile avec cumin et ail 30 s jusqu''au crépitement, verser sur le dal, couvrir et laisser infuser. Servir bien chaud, avec naans. (Marie Claire — préparation 15 min, cuisson 30 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/recette-de-dal-de-lentilles-indien,1212481.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 300::numeric, 'g', 'lentilles corail'),
  (1, 400, 'g', 'jeunes pousses d''épinards'),
  (2, 1, '', 'petit oignon'),
  (3, 1, '', 'tomate moyenne'),
  (4, 1, '', 'petit morceau de gingembre râpé'),
  (5, 2, 'c. à s.', 'huile végétale'),
  (6, 0.5, 'c. à c.', 'curcuma moulu'),
  (7, 0.5, 'c. à c.', 'graines de cumin entières'),
  (8, 1, 'gousse', 'ail écrasée'),
  (9, 1, 'pincée', 'sel')
) as v(pos, qty, unit, name) on true;

-- La bouillabaisse marseillaise traditionnelle
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'L''Atelier des Chefs'), 'La bouillabaisse marseillaise traditionnelle', 'https://www.atelierdeschefs.fr/recettes/13554/la-bouillabaisse-marseillaise-traditionnelle/', 6, 'Soupe : faire revenir doucement poireaux, oignon, ail écrasé et tomates concassées dans l''huile avec laurier, écorce d''orange et piment, 15 min ; ajouter les poissons de roche (non écaillés, rincés), colorer 15 min ; couvrir de 3 l d''eau bouillante, frémir 10 min ; retirer fenouil et écorce, passer au presse-purée puis au chinois ; safran, assaisonner. Rouille : moutarde + jaunes, ail haché, monter avec 25 cl d''huile d''olive ; croûtons grillés frottés d''ail. Service : cuire les pommes de terre en gros dés 30 min dans moitié fond de poisson moitié eau ; pocher les poissons en tronçons dans le fond bouillant, 6-10 min à feu doux en commençant par les chairs fermes. Poissons sur pommes de terre, bouillon versé sur les croûtons en soupière. « Quand ça boue, on baisse ! » (L''Atelier des Chefs — préparation 1 h, cuisson 1 h 30.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.atelierdeschefs.fr/recettes/13554/la-bouillabaisse-marseillaise-traditionnelle/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'poissons de roche'),
  (1, 2, '', 'poireaux'),
  (2, 1, '', 'oignon'),
  (3, 4, '', 'tomates'),
  (4, 2, '', 'têtes d''ail'),
  (5, 2, 'feuilles', 'laurier'),
  (6, 10, 'cl', 'huile d''olive (soupe)'),
  (7, 1, '', 'branche de fenouil séché'),
  (8, 1, '', 'écorce d''orange'),
  (9, 2, 'pincées', 'pistils de safran'),
  (10, 1, 'g', 'piment de Cayenne'),
  (11, 25, 'cl', 'huile d''olive (rouille)'),
  (12, 2, '', 'jaunes d''œuf'),
  (13, 1, 'c. à s.', 'moutarde forte'),
  (14, 2, 'gousses', 'ail (rouille)'),
  (15, 6, '', 'pommes de terre à chair fondante'),
  (16, 1, '', 'saint-pierre (1,2 kg)'),
  (17, 4, '', 'vives'),
  (18, 1, '', 'rascasse (800 g)'),
  (19, 800, 'g', 'congre'),
  (20, 1, '', 'pain (croûtons)'),
  (21, null, '', 'sel, gros sel, poivre')
) as v(pos, qty, unit, name) on true;

-- Gaufres saines sans sucre ni matières grasses
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'healthyfoodcreation.fr'), 'Gaufres saines sans sucre ni matières grasses', 'https://www.healthyfoodcreation.fr/gaufres-saines/', null, 'Préchauffer le gaufrier. Mélanger œufs, compote et la moitié du lait ; ajouter farine, levure, sel, puis le reste du lait. Plaques chaudes légèrement huilées si besoin, cuire 2-3 min. Se congèle. (healthyfoodcreation — préparation 5 min ; la compote peut être remplacée par une petite banane bien mûre.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.healthyfoodcreation.fr/gaufres-saines/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 2::numeric, '', 'œufs'),
  (1, 40, 'g', 'compote de pommes ou banane écrasée'),
  (2, 25, 'cl', 'lait (végétal ou non)'),
  (3, 140, 'g', 'farine T65 ou épeautre'),
  (4, 3, 'g', 'levure chimique'),
  (5, 1, 'pincée', 'sel')
) as v(pos, qty, unit, name) on true;

-- Pavés de cabillaud aux lentilles
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pavés de cabillaud aux lentilles', 'https://www.marieclaire.fr/cuisine/paves-de-cabillaud-aux-lentilles,1194511.asp', 6, 'Cuire les lentilles avec oignon émincé, carotte en dés et bouquet garni, largement couvertes d''eau froide peu calcaire : ébullition puis 45 min à frémissement. 10 min avant la fin, dorer le bacon à sec, égoutter. Dans la même poêle, saisir les pavés 2 min par face dans 1 c. d''huile, puis 5 min à feu doux, sel, poivre. Vinaigrette (sel, poivre, Xérès, reste d''huile) sur les lentilles égouttées ; poser cabillaud et bacon dessus, servir aussitôt. Astuce : chair plus ferme si les pavés dégorgent 1 h au gros sel puis rincés. (Marie Claire — préparation 20 min, cuisson 45 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/paves-de-cabillaud-aux-lentilles,1194511.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 6::numeric, '', 'pavés de cabillaud (130 g pièce)'),
  (1, 500, 'g', 'lentilles vertes du Puy'),
  (2, 6, 'tranches', 'bacon ou pancetta (très fines)'),
  (3, 1, '', 'carotte'),
  (4, 1, '', 'oignon'),
  (5, 4, 'c. à s.', 'huile d''olive'),
  (6, 1, 'c. à s.', 'vinaigre de Xérès'),
  (7, 1, '', 'bouquet garni'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Gaufres de pomme de terre
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'recettes-de-clairette.overblog.com'), 'Gaufres de pomme de terre', 'https://recettes-de-clairette.overblog.com/2021/12/gaufres-de-pomme-de-terre.html', 4, 'Éplucher et râper finement les pommes de terre ; hacher l''ail dégermé, ciseler le persil. Tout mélanger avec farine et œuf, bien saler, poivrer. Gaufrier chaud huilé : cuire jusqu''à belle dorure (5 min et plus), réserver au chaud. Servir avec salade verte ou poêlée de champignons. Se prépare la veille : réchauffer 10 min au four à 200 °C. Environ 8 petites gaufres. (Recettes de Clairette.)', ''
  from h where not exists (select 1 from recipes where url = 'https://recettes-de-clairette.overblog.com/2021/12/gaufres-de-pomme-de-terre.html')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 800::numeric, 'g', 'pommes de terre à chair ferme'),
  (1, 50, 'g', 'farine'),
  (2, 1, '', 'œuf'),
  (3, 3, 'gousses', 'ail'),
  (4, 1, '', 'poignée de persil plat'),
  (5, null, '', 'sel, poivre, huile d''olive')
) as v(pos, qty, unit, name) on true;

-- Salade de pâtes aux asperges, saumon laqué au sirop d'érable et pain d'épices
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Salade de pâtes aux asperges, saumon laqué au sirop d''érable et pain d''épices', 'https://www.marieclaire.fr/cuisine/salade-de-pates-aux-asperges-saumon-laque-au-sirop-d-erable-et-pain-d-epices,1375600.asp', 4, 'Retirer le pied des asperges, les cuire 7-8 min à la vapeur puis les plonger dans l''eau glacée pour stopper la cuisson. Cuire les pâtes al dente selon le paquet, égoutter. Rincer et sécher les pavés de saumon, les couper en cubes. Faire fondre le beurre en poêle, ajouter le sirop d''érable et les cubes de saumon, cuire 3-4 min à feu vif (dorés dehors, rosés dedans). Couper le pain d''épices en dés, le dorer 4-5 min sous le gril du four. Émulsionner huile d''olive, vinaigre de xérès, sel et poivre pour la vinaigrette. Mélanger tous les ingrédients de la salade, arroser de vinaigrette, servir aussitôt. Astuce : quelques copeaux de parmesan en plus pour la gourmandise. (Marie Claire, recette de Sophie Dupuis-Gaulier — préparation 10 min, cuisson 18 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/salade-de-pates-aux-asperges-saumon-laque-au-sirop-d-erable-et-pain-d-epices,1375600.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'botte', 'asperges vertes'),
  (1, 100, 'g', 'pâtes « avoines »'),
  (2, 400, 'g', 'pavés de saumon'),
  (3, 20, 'g', 'beurre'),
  (4, 4, 'c. à s.', 'sirop d''érable'),
  (5, 2, 'tranches', 'pain d''épices'),
  (6, 4, 'c. à s.', 'huile d''olive'),
  (7, 2, 'c. à s.', 'vinaigre de xérès'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Magret de canard au jus de pomme et au miel
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Magret de canard au jus de pomme et au miel', 'https://www.marieclaire.fr/cuisine/magret-de-canard-au-jus-de-pomme-et-au-miel,1192850.asp?xtor=EPR-3&M_BT=2242774561181', 4, '12 h avant, chauffer le jus de pomme avec le miel, 1 c. à c. de fleur de sel, du poivre et 45 cl d''eau, sans atteindre l''ébullition. Inciser la peau des magrets, les colorer côté peau 3 min en poêle, puis les mettre dans la sauteuse et cuire à feu doux 10 min en les retournant une fois. Réserver les magrets, laisser tiédir le jus de cuisson, y remettre les magrets, couvrir de film et mariner 12 h au réfrigérateur. Sortir les magrets, faire réduire leur jus des 2/3 à feu vif en écumant pour obtenir une sauce onctueuse. Pendant ce temps, remettre les magrets côté peau en poêle 3 min à feu vif (peau croustillante), puis retourner 3 min à feu moyen. Trancher, napper de sauce, servir aussitôt avec du riz rouge (ou des quartiers de pomme citronnés revenus au beurre pour une version sans féculent). Sur une idée de Fumiko Kono. (Marie Claire, recette d''Irène Karsenty — préparation 15 min, cuisson 30 min, marinade 12 h ; ingrédients récupérés sur la page d''origine, la capture Evernote étant incomplète.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/magret-de-canard-au-jus-de-pomme-et-au-miel,1192850.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 2::numeric, '', 'magrets de canard'),
  (1, 65, 'cl', 'pur jus de pomme'),
  (2, 1, 'c. à s.', 'miel de châtaignier'),
  (3, null, '', 'fleur de sel'),
  (4, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Magret de canard rôti, chou rouge façon alsacienne
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Magret de canard rôti, chou rouge façon alsacienne', 'https://www.marieclaire.fr/cuisine/magret-de-canard-roti-chou-rouge-facon-alsacienne,1196053.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Émincer le chou rouge en fines lanières, le mélanger avec le sucre, le vinaigre et un peu de sel, réserver. Émincer l''oignon, couper les pommes en quartiers. Dorer les lardons à feu doux en cocotte, ajouter pommes et oignon, cuire 5 min. Ajouter le chou, saler, poivrer, mouiller de 75 cl d''eau bouillante et laisser mijoter 1 h. Quadriller le gras des magrets, les saisir côté peau 8 min en poêle, jeter le gras rendu, retourner et poursuivre 4 min, saler, poivrer, réserver au chaud sous papier alu. Ajouter dans la cocotte le cassis, la gelée et les marrons égouttés, cuire encore 10 min à feu moyen. Trancher les magrets, dresser avec le chou, napper de sauce au cassis. Astuce : laisser reposer le magret sous papier alu quelques minutes après cuisson pour plus de tendreté. (Marie Claire, recette d''Irène Karsenty et Pascale Mosnier — préparation 20 min, cuisson 1 h 20 ; ingrédients récupérés sur la page d''origine, la capture Evernote étant incomplète.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/magret-de-canard-roti-chou-rouge-facon-alsacienne,1196053.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 2::numeric, '', 'magrets de canard'),
  (1, 1, '', 'chou rouge'),
  (2, 2, '', 'pommes'),
  (3, 100, 'g', 'lardons'),
  (4, 200, 'g', 'cassis (surgelés ou au sirop)'),
  (5, 300, 'g', 'marrons (sous vide ou en boîte)'),
  (6, 2, 'c. à s.', 'gelée de cassis'),
  (7, 1, '', 'gros oignon'),
  (8, 10, 'cl', 'vinaigre de vin'),
  (9, 1, 'c. à s.', 'sucre'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Magrets de canard aux échalotes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Magrets de canard aux échalotes', 'https://www.marieclaire.fr/cuisine/magrets-de-canard-aux-echalotes,1211226.asp?xtor=EPR-3&M_BT=2242774561181', 6, 'Éplucher et cuire les pommes de terre en gros morceaux 20 min à la vapeur. Chauffer une poêle à fond épais, entailler le gras des magrets en croisillons, saler, poivrer, saisir côté peau 10 min à feu vif. Couper les échalotes en deux dans la longueur ; sortir la viande, vider l''excès de graisse, reposer les magrets côté chair, ajouter les échalotes et poursuivre 10 min. Écraser les pommes de terre avec l''huile et la ciboulette ciselée, réserver au chaud. Réserver les magrets couverts de papier alu ; déglacer la poêle avec 3 c. à s. d''eau et le vinaigre en grattant les sucs, réduire 5 min. Trancher les magrets, napper de sauce aux échalotes, servir avec l''écrasée de pomme de terre façonnée en quenelles. Astuce : peut aussi se servir avec du riz pour gagner du temps. (Marie Claire, recette de Solveig Darrigo-Dartinet et Pascale Mosnier — préparation 25 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/magrets-de-canard-aux-echalotes,1211226.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 3::numeric, '', 'magrets de canard'),
  (1, 12, '', 'échalotes'),
  (2, 6, 'c. à s.', 'vinaigre balsamique'),
  (3, 1, 'kg', 'pommes de terre bintje'),
  (4, 3, 'c. à s.', 'huile d''olive'),
  (5, 6, 'brins', 'ciboulette'),
  (6, null, '', 'sel'),
  (7, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Magret de canard façon mendiants
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Magret de canard façon mendiants', 'https://www.marieclaire.fr/cuisine/magret-de-canard-facon-mendiants,1326041.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Faire gonfler pruneaux et raisins secs 5 min dans l''eau chaude, égoutter ; couper pruneaux et abricots en dés. Griller amandes et noisettes à sec 3 min en remuant, saupoudrer de sucre et caraméliser 1 min ; mélanger tous les fruits secs. Quadriller la peau des magrets, les saisir côté peau 5 min à feu vif, jeter la graisse, retourner et poursuivre 4 min selon la cuisson désirée. Réserver sous papier alu 5 min. Dans la même poêle, faire revenir au beurre à feu doux les quartiers de poire, déglacer avec la sauce Worcestershire et le miel, laisser épaissir 3 min. Trancher un demi-magret par personne, saler, poivrer, couvrir de fruits secs, servir avec la sauce et les poires poêlées, décorer de cerfeuil. (Marie Claire, recette de Sophie Menut-Yovanovitch — préparation 20 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/magret-de-canard-facon-mendiants,1326041.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 2::numeric, '', 'magrets de canard'),
  (1, 2, '', 'poires'),
  (2, null, 'brins', 'cerfeuil'),
  (3, 30, 'g', 'beurre'),
  (4, 50, 'g', 'raisins secs'),
  (5, 50, 'g', 'abricots secs'),
  (6, 50, 'g', 'pruneaux'),
  (7, 30, 'g', 'noisettes'),
  (8, 30, 'g', 'amandes non mondées'),
  (9, 2, 'c. à s.', 'sucre en poudre'),
  (10, 2, 'c. à s.', 'miel liquide'),
  (11, 2, 'c. à s.', 'sauce Worcestershire'),
  (12, null, '', 'sel'),
  (13, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Rougail de saucisses aux lentilles
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Rougail de saucisses aux lentilles', 'https://www.marieclaire.fr/cuisine/rougail-de-saucisses-aux-lentilles,1195387.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Mettre les lentilles dans une grande casserole avec un oignon coupé en 8, la moitié du gingembre, le laurier et le clou de girofle ; couvrir largement d''eau froide, porter à ébullition. Baisser pour un frémissement, ajouter les saucisses et cuire 10 min. Égoutter les saucisses, poursuivre la cuisson des lentilles 25 min ; hacher les autres oignons et l''ail, couper les saucisses en tronçons. Chauffer l''huile en cocotte, fondre l''ail et l''oignon, ajouter les saucisses et dorer. Verser les tomates, assaisonner avec le reste de gingembre et le piment, laisser sur feu doux. Une fois les lentilles cuites, les égoutter et les ajouter à la cocotte, saler, mouiller d''une louche de bouillon de cuisson, mijoter 5 min et servir bien chaud. Astuce : le piment oiseau se trouve en grande surface ou sur internet. (Marie Claire, recette de Pascale Mosnier — préparation 15 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/rougail-de-saucisses-aux-lentilles,1195387.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 8::numeric, '', 'chipolatas aux herbes'),
  (1, 350, 'g', 'lentilles vertes du Puy'),
  (2, 4, '', 'oignons'),
  (3, 2, 'gousses', 'ail'),
  (4, 1, 'boîte', 'tomates concassées (1/2 format)'),
  (5, 2, 'c. à s.', 'huile d''olive'),
  (6, 1, 'c. à c.', 'gingembre en poudre'),
  (7, 1, 'feuille', 'laurier'),
  (8, 1, '', 'piment oiseau'),
  (9, 1, '', 'clou de girofle'),
  (10, null, '', 'sel')
) as v(pos, qty, unit, name) on true;

-- Quiche aux lardons, à la choucroute et au comté
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Quiche aux lardons, à la choucroute et au comté', 'https://www.marieclaire.fr/cuisine/quiche-a-la-choucroute,24110,1191607.asp?xtor=EPR-3&M_BT=2242774561181', 6, 'Préchauffer le four à 180 °C (th. 6). Dérouler la pâte dans un moule à tarte, tapisser le fond de choucroute. Faire sauter les lardons à sec quelques minutes, égoutter, répartir sur la choucroute. Émincer finement le comté (au robot idéalement). Fouetter les œufs avec la crème et le lait, saler légèrement (le lard sale déjà), poivrer généreusement. Verser sur la quiche, incliner le moule pour bien répartir le liquide. Couvrir de comté, cuire environ 35 min au four jusqu''à belle coloration et pâte croustillante ; servir très chaud. (Marie Claire, recette de Pascale Mosnier — préparation 20 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/quiche-a-la-choucroute,24110,1191607.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'rouleau', 'pâte brisée'),
  (1, 250, 'g', 'choucroute cuite'),
  (2, 200, 'g', 'comté'),
  (3, 150, 'g', 'lardons fumés'),
  (4, 2, '', 'œufs'),
  (5, 20, 'cl', 'crème liquide'),
  (6, 10, 'cl', 'lait'),
  (7, null, '', 'sel'),
  (8, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Coco de Paimpol à la tomate, herbes et curcuma
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Papilles et Pupilles'), 'Coco de Paimpol à la tomate, herbes et curcuma', 'https://www.papillesetpupilles.fr/2020/09/coco-de-paimpol-a-la-tomate.html/', null, 'Écosser et rincer les haricots coco de Paimpol. Peler et couper en dés oignon et ail ; peler et couper en dés les tomates ; éplucher et ciseler le céleri branche. Chauffer l''huile d''olive en cocotte, faire revenir ail, oignon et céleri 5 min, ajouter tomates, thym, laurier et curcuma, laisser compoter 5 min. Ajouter les cocos égouttés et mouiller avec 70 cl d''eau. Porter à ébullition et cuire 30 min à frémissement (décompte à partir de l''ébullition), puis saler et poursuivre 10 min. Servir par exemple avec un filet de cabillaud vapeur. Variante suggérée par des lecteurs : ajouter poivron vert et rouge, mouiller en partie avec un bouillon de poule, remplacer le curcuma par du piment d''Espelette ; se fait aussi avec des haricots tarbais, soissons ou coco selon la région. (Papilles et Pupilles, recette d''Anne — pour 3 à 4 personnes selon l''appétit, cuisson environ 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.papillesetpupilles.fr/2020/09/coco-de-paimpol-a-la-tomate.html/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'haricots coco de Paimpol à écosser (480 g écossés)'),
  (1, 2, 'c. à s.', 'huile d''olive'),
  (2, 1, '', 'oignon'),
  (3, 2, 'gousses', 'ail'),
  (4, 2, '', 'tomates'),
  (5, 1, 'brin', 'céleri branche'),
  (6, 1, 'pincée', 'curcuma'),
  (7, 3, 'brins', 'thym'),
  (8, 2, 'feuilles', 'laurier'),
  (9, 70, 'cl', 'eau'),
  (10, 1, 'pincée', 'sel')
) as v(pos, qty, unit, name) on true;

-- Saint-Jacques présentées dans leur coquille (Bruno Verjus)
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Le Monde — Cuisine'), 'Saint-Jacques présentées dans leur coquille (Bruno Verjus)', 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html', 4, 'Faire ouvrir et nettoyer les grosses Saint-Jacques bien vivantes chez le poissonnier, en conservant les deux valves, la noix et le corail éventuel. Glisser la noix (et son corail) dans la valve creuse, ajouter une noix de beurre, quelques gouttes de jus d''orange et une feuille d''aromate au choix. Refermer la coquille en réunissant les deux valves et les lier avec de la ficelle. Enfourner 4 min à 200 °C et servir aussitôt, avec du bon pain pour saucer le beurre. (Le Monde, recette de Bruno Verjus — cuisson 4 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 8::numeric, '', 'grosses coquilles Saint-Jacques'),
  (1, 8, '', 'noix de beurre cru demi-sel'),
  (2, 1, '', 'orange'),
  (3, null, '', 'aromates au choix (laurier, thym, verveine, sauge)'),
  (4, null, '', 'ficelle à lier')
) as v(pos, qty, unit, name) on true;

-- Œuf poché à la truffe en croûte de sel (Fred Ménager)
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Le Monde — Cuisine'), 'Œuf poché à la truffe en croûte de sel (Fred Ménager)', 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html', 4, 'Couper le potimarron en dés de 2 cm avec la peau. Émincer ail et échalote épluchés, les suer au beurre, ajouter le potimarron et remuer 5 min. Mouiller à hauteur d''eau, cuire 30 min à feu doux (rajouter de l''eau si besoin), puis mixer avec une feuille de sauge, saler et poivrer. Porter à ébullition 1 l d''eau avec le vinaigre, retirer du feu, casser les œufs un à un et laisser pocher 4 min hors du feu. Déposer un peu de crème de potimarron chaude au fond de l''assiette, égoutter les œufs et les poser dessus. Couper la truffe, la rouler dans l''huile d''olive et la fleur de sel, la poser sur l''œuf, ajouter pétales de fleurs et feuilles de sauge fraîche. (Le Monde, recette de Fred Ménager — cuisson environ 45 min au total.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'potimarron de taille moyenne'),
  (1, 4, '', 'œufs bio'),
  (2, 1, '', 'truffe fraîche'),
  (3, 100, 'g', 'beurre'),
  (4, null, '', 'sauge'),
  (5, null, '', 'fleurs de souci ou autres (déco)'),
  (6, 2, '', 'échalotes'),
  (7, 2, 'gousses', 'ail'),
  (8, 2, 'c. à s.', 'vinaigre blanc'),
  (9, 1, 'l', 'eau'),
  (10, null, '', 'fleur de sel'),
  (11, null, '', 'huile d''olive')
) as v(pos, qty, unit, name) on true;

-- Foie gras aux coques et au citron (Jonathan Schweizer)
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Le Monde — Cuisine'), 'Foie gras aux coques et au citron (Jonathan Schweizer)', 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html', null, 'Éveiner le foie gras et reconstituer le lobe, assaisonner de fleur de sel (un peu de calvados en option). Poser sur une plaque et cuire 45 min à 60 °C. Une fois cuit, dégager le foie de son gras, l''envelopper serré dans du papier film, laisser refroidir et réserver. (Le Monde, recette de Jonathan Schweizer — cuisson 45 min à 60 °C ; suite de la recette — coques, pomme, oignon, assemblage — non capturée, article réservé aux abonnés.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.lemonde.fr/m-styles/article/2020/12/20/chacun-son-assiette-trois-recettes-speciale-distanciation-physique-pour-les-fetes_6063984_4497319.html')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'foie gras cru'),
  (1, 500, 'g', 'coques (pêche à pied si possible)'),
  (2, 1, '', 'citron cédrat'),
  (3, 1, '', 'pomme'),
  (4, 1, '', 'oignon'),
  (5, null, '', 'huile d''olive'),
  (6, null, '', 'vinaigre de cidre'),
  (7, null, '', 'fleur de sel')
) as v(pos, qty, unit, name) on true;

-- Filet de bœuf et champignons en croûte briochée
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Filet de bœuf et champignons en croûte briochée', 'https://www.marieclaire.fr/cuisine/filet-de-boeuf-en-croute,1196945.asp', 6, 'Émietter la levure dans le lait tiédi. Dans une jatte, verser la farine, faire un puits avec les œufs entiers, la levure délayée, le sucre, le beurre fondu et une pincée de sel ; travailler jusqu''à obtenir une pâte élastique, la fariner et la laisser lever 2 h à température ambiante (idéalement vers 40 °C, sur un radiateur en hiver). Retirer les pieds des champignons, couper les têtes en tout petits dés. Peler et hacher les échalotes, les fondre 2 min au beurre, ajouter les champignons, saler, poivrer et cuire 15 min à feu doux (duxelles). Colorer le filet de bœuf à l''huile à feu vif en cocotte, égoutter et laisser refroidir. Préchauffer le four à 210 °C (th. 7). Étaler la pâte en rectangle sur une plaque, la tartiner de duxelles, poser la viande au centre, saler, poivrer, rabattre la pâte sur la viande et souder les bords en pinçant. Badigeonner de jaune d''œuf, percer quelques petits trous pour laisser échapper la vapeur. Enfourner 30 min, laisser reposer 10 min four éteint porte ouverte avant de servir. (Marie Claire, recette d''Irène Karsenty avec Mathilde Joannès — préparation 35 min, cuisson 45 min, repos 2 h 10.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/filet-de-boeuf-en-croute,1196945.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'filet de bœuf non bardé non ficelé'),
  (1, 1, 'c. à s.', 'huile'),
  (2, null, '', 'sel'),
  (3, null, '', 'poivre'),
  (4, 2, '', 'œufs'),
  (5, 1, '', 'jaune d''œuf'),
  (6, 250, 'g', 'farine'),
  (7, 0.5, 'sachet', 'levure de boulanger'),
  (8, 50, 'g', 'beurre fondu'),
  (9, 15, 'g', 'sucre'),
  (10, 10, 'cl', 'lait'),
  (11, 750, 'g', 'champignons de Paris'),
  (12, 3, '', 'échalotes'),
  (13, 20, 'g', 'beurre')
) as v(pos, qty, unit, name) on true;

-- Beef ularthiyathu (rôti de bœuf épicé du Kerala)
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'pepperdelight.com'), 'Beef ularthiyathu (rôti de bœuf épicé du Kerala)', 'https://www.pepperdelight.com/beef-ularthiyathu-dry-roast/', 4, 'Couper le bœuf en cubes (façon « soup cut »). Cuire les cubes à la cocotte-minute avec sel, poivre en poudre, meat masala et un peu d''eau à hauteur, 2 sifflements ; laisser retomber la pression, réserver avec le jus de cuisson. Dans une poêle, faire éclater les graines de moutarde dans l''huile, ajouter feuilles de curry, échalotes, piments verts et un peu de sel, faire suer jusqu''à ce que l''oignon soit translucide. Ajouter la pâte ail-gingembre 1 min, puis à feu doux le curcuma, le piment, la coriandre et le garam masala sans les laisser brûler. Verser le bœuf cuit avec son jus, mélanger à la masala et laisser réduire à feu moyen jusqu''à ce que la sauce soit sèche, en remuant régulièrement pour éviter l''accroche ; rectifier le sel. À part, faire dorer les morceaux de noix de coco à l''huile avec des feuilles de curry jusqu''à coloration. Quand la sauce est sèche, baisser le feu et poursuivre la cuisson du bœuf 10-15 min en remuant jusqu''à ce qu''il soit bien grillé et noirci par endroits ; incorporer la coco et les feuilles de curry dorées. Servir chaud avec riz, porotta, appam ou naan. Astuce : le chuck roast convient aussi bien que le top blade/top loin ; à défaut de meat masala, doubler le garam masala ; l''huile de coco est recommandée pour une saveur kéralaise authentique. (Pepper Delight — Akhila, préparation 15 min, cuisson 1 h.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.pepperdelight.com/beef-ularthiyathu-dry-roast/')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 2.5::numeric, 'lb', 'bœuf (à couper en cubes)'),
  (1, 25, '', 'échalotes (émincées finement)'),
  (2, 2.5, '', 'piments verts (fendus)'),
  (3, 1, 'c. à s.', 'pâte ail-gingembre'),
  (4, 0.25, 'c. à s.', 'curcuma en poudre'),
  (5, 1, 'c. à s.', 'piment rouge en poudre'),
  (6, 1.5, 'c. à s.', 'coriandre en poudre'),
  (7, 2, 'c. à s.', 'poivre en poudre'),
  (8, 1, 'c. à c.', 'meat masala (épices pour viande)'),
  (9, 0.5, 'c. à c.', 'garam masala'),
  (10, 5, 'brins', 'feuilles de curry'),
  (11, 0.25, 'cup', 'morceaux de noix de coco'),
  (12, null, 'pincée', 'graines de moutarde'),
  (13, null, '', 'sel'),
  (14, null, '', 'huile')
) as v(pos, qty, unit, name) on true;

-- Lotte au vin blanc, citron confit et safran
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Lotte au vin blanc, citron confit et safran', 'https://www.marieclaire.fr/cuisine/lotte-au-safran,1193358.asp', 6, 'Demander au poissonnier de retirer la peau de la queue de lotte (ou le faire soi-même). Préchauffer le four à 180 °C (th. 6). Diluer le safran dans le vin blanc. Émincer l''oignon dégermé et le citron confit, répartir dans le fond d''un plat à four. Piquer la lotte de gousses d''ail pelées, la poser dans le plat sur l''oignon et le citron confit. Arroser du jus de citron, du vin blanc safrané et d''un filet d''huile d''olive. Enfourner 30 min en arrosant régulièrement de jus. Vérifier que la chair est ferme et blanche, retirer l''arête centrale et découper. Servir sur assiettes tièdes avec des légumes verts croquants, arrosé du jus de cuisson. (Marie Claire — préparation 15 min, cuisson 30 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/lotte-au-safran,1193358.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'queue de lotte (2 kg)'),
  (1, 3, 'gousses', 'ail pelé'),
  (2, 1, '', 'citron (jus)'),
  (3, 1, '', 'citron confit'),
  (4, 1, '', 'gros oignon'),
  (5, null, 'pincées', 'safran'),
  (6, 1, 'verre', 'vin blanc'),
  (7, null, '', 'huile d''olive'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Navarin de lotte aux petits légumes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Navarin de lotte aux petits légumes', 'https://www.marieclaire.fr/cuisine/navarin-de-lotte,1196357.asp', 6, 'Nettoyer les légumes : tailler carottes et courgettes en bâtonnets, détailler les choux romanesco en petits bouquets. Cuire tous les légumes 15 min à la vapeur, réserver au chaud. Saler et poivrer les médaillons de lotte, les dorer légèrement 5 min de chaque côté dans le beurre fondu à feu modéré, égoutter et réserver. Prélever le zeste du citron, déglacer la sauteuse avec le safran, le vin blanc, le fumet de poisson et le zeste, saler, poivrer, cuire 3 min à feu vif. Ajouter la moitié de la crème et la lotte, poursuivre 3 min en retournant les médaillons dans la sauce. Disposer les légumes chauds dans un plat creux, poser la lotte dessus, couvrir d''aluminium. Battre le reste de crème avec le jaune d''œuf, verser dans la sauteuse et remuer 1 min à feu doux sans laisser bouillir, puis napper le plat et servir aussitôt. (Marie Claire — n° 74, accord : condrieu blanc ; préparation 30 min, cuisson 30 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/navarin-de-lotte,1196357.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 6::numeric, '', 'médaillons de lotte (200 g pièce)'),
  (1, 250, 'g', 'pois gourmands'),
  (2, 4, '', 'petits choux romanesco'),
  (3, 2, '', 'petites courgettes'),
  (4, 250, 'g', 'petites carottes'),
  (5, 250, 'g', 'haricots verts'),
  (6, 1, 'pincée', 'safran'),
  (7, 20, 'cl', 'crème liquide'),
  (8, 10, 'cl', 'vin blanc sec'),
  (9, 1, 'c. à c.', 'fumet de poisson en poudre'),
  (10, 1, '', 'citron non traité'),
  (11, 1, '', 'jaune d''œuf'),
  (12, 30, 'g', 'beurre'),
  (13, null, '', 'sel'),
  (14, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Lotte farcie aux herbes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Lotte farcie aux herbes', 'https://www.marieclaire.fr/cuisine/lotte-farcie-aux-herbes,24109,1190807.asp', 6, 'Demander au poissonnier de retirer la fine peau de la lotte et de lever les deux filets en ôtant le cartilage central. Laver rapidement les herbes (cerfeuil, estragon, basilic, persil), les éponger, ôter les grosses tiges et les mixer grossièrement par à-coups. Poser les filets côte à côte sur une gaze, saler, étaler les herbes mixées au milieu avec les grains de poivre vert, superposer les filets face herbes contre face herbes, ficeler comme un rôti et envelopper entièrement dans la gaze. Cuire à la vapeur 25 min. Pendant ce temps, préparer la sauce : râper le zeste de l''orange lavée, extraire son jus, réunir jus, zestes, beurre, crème fraîche, safran, sel et poivre dans une petite casserole sur feu doux, fouetter sans cesse jusqu''à émulsion, réserver au chaud. Découper la lotte et servir sans attendre avec la sauce en saucière. Astuce : se sert aussi tiède avec une vinaigrette huile d''olive, vinaigre blanc, jus d''orange, sel, poivre blanc. (Marie Claire — n° 40, accord : coteaux-du-languedoc blanc ; préparation 15 min, cuisson 25 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/lotte-farcie-aux-herbes,24109,1190807.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1.5::numeric, 'kg', 'lotte (filets)'),
  (1, 0.5, 'botte', 'cerfeuil'),
  (2, 0.5, 'botte', 'estragon'),
  (3, 0.5, 'bouquet', 'basilic'),
  (4, 0.5, 'bouquet', 'persil plat'),
  (5, 3, 'brins', 'menthe'),
  (6, 1, 'c. à s.', 'poivre vert frais (ou 0,5 c. à c. de poivre vert déshydraté)'),
  (7, 60, 'g', 'beurre'),
  (8, 2, 'c. à s.', 'crème fraîche'),
  (9, 1, 'dose', 'safran en poudre'),
  (10, 1, '', 'orange non traitée'),
  (11, null, '', 'sel'),
  (12, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur', 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793', 4, 'Peler et émincer l''échalote, éplucher et tailler les carottes en petits dés, rincer les barbes de saint-jacques pour éliminer le sable. Faire fondre l''échalote et les carottes dans 15 g de beurre 2 min, ajouter les barbes 2 min, mouiller avec le cidre, ajouter le bouquet garni, poivrer, laisser frémir doucement 25 min. Pendant ce temps, détailler le chou-fleur en bouquets ; porter à ébullition le lait et la crème, y cuire le chou-fleur 35 min à frémissement, poivrer. Prélever 2 louches de liquide, mixer le reste au mixeur plongeant (rallonger avec le liquide réservé si trop épais). Filtrer le cidre pour retirer les barbes, le faire réduire de moitié à feu vif, puis monter la sauce en incorporant peu à peu le beurre bien froid en dés, en fouettant vigoureusement ; réserver au chaud. Dans une poêle, chauffer le reste de beurre et saisir les noix de saint-jacques 2 min par face, saler, poivrer. Répartir les noix dans les assiettes, napper de beurre de cidre et servir chaud avec la crème de chou-fleur. Astuce : remplacer le lait de vache par du lait de coco pour une touche exotique. (Marie Claire — n° 144, accord : cidre brut ; préparation 30 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 12::numeric, '', 'noix de saint-jacques (avec les barbes réservées)'),
  (1, 20, 'g', 'beurre'),
  (2, null, '', 'sel'),
  (3, null, '', 'poivre'),
  (4, 50, 'cl', 'cidre brut'),
  (5, 100, 'g', 'beurre bien froid (pour monter la sauce)'),
  (6, 15, 'g', 'beurre (pour suer les légumes)'),
  (7, 1, '', 'échalote'),
  (8, 2, '', 'carottes'),
  (9, 1, '', 'bouquet garni'),
  (10, 1, '', 'petit chou-fleur'),
  (11, 30, 'cl', 'crème liquide'),
  (12, 40, 'cl', 'lait')
) as v(pos, qty, unit, name) on true;

-- Curry de lotte au lait de coco
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Curry de lotte au lait de coco', 'https://www.marieclaire.fr/cuisine/curry-de-lotte-au-lait-de-coco,1200745.asp', 4, 'Couper grossièrement les queues de lotte décongelées. Faire fondre le beurre en cocotte, y faire revenir doucement l''oignon, l''ail et le gingembre jusqu''à légère coloration. Ajouter la lotte, monter le feu et cuire jusqu''à ce qu''elle dore. Saupoudrer de curry, cuire encore 2 min, saler. Verser le lait de coco, les poivrons et les tomates, porter à ébullition, écumer, laisser mijoter 15 min. En fin de cuisson, ajouter la coriandre. Rectifier l''assaisonnement, servir avec un riz basmati cuit avec quelques gousses de cardamome fendues. (Marie Claire — préparation 15 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/curry-de-lotte-au-lait-de-coco,1200745.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'boîte de lait de coco'),
  (1, 200, 'g', 'oignons en cubes'),
  (2, 150, 'g', 'tomates à l''italienne en cubes'),
  (3, 1, 'kg', 'queues de lotte'),
  (4, 200, 'g', 'trio de poivrons'),
  (5, 30, 'g', 'beurre'),
  (6, 3, 'c. à s.', 'coriandre (feuilles)'),
  (7, 2, 'c. à s.', 'gingembre haché'),
  (8, 600, 'g', 'riz basmati'),
  (9, 1, 'c. à s.', 'ail haché'),
  (10, 3, 'c. à s.', 'curry en poudre'),
  (11, null, '', 'sel')
) as v(pos, qty, unit, name) on true;

-- Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur', 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793', 4, 'Peler et émincer l''échalote, éplucher et tailler les carottes en petits dés, rincer les barbes de saint-jacques pour éliminer le sable. Faire fondre l''échalote et les carottes dans 15 g de beurre 2 min, ajouter les barbes 2 min, mouiller avec le cidre, ajouter le bouquet garni, poivrer, laisser frémir doucement 25 min. Pendant ce temps, détailler le chou-fleur en bouquets ; porter à ébullition le lait et la crème, y cuire le chou-fleur 35 min à frémissement, poivrer. Prélever 2 louches de liquide, mixer le reste au mixeur plongeant (rallonger avec le liquide réservé si trop épais). Filtrer le cidre pour retirer les barbes, le faire réduire de moitié à feu vif, puis monter la sauce en incorporant peu à peu le beurre bien froid en dés, en fouettant vigoureusement ; réserver au chaud. Dans une poêle, chauffer le reste de beurre et saisir les noix de saint-jacques 2 min par face, saler, poivrer. Répartir les noix dans les assiettes, napper de beurre de cidre et servir chaud avec la crème de chou-fleur. Astuce : remplacer le lait de vache par du lait de coco pour une touche exotique. (Marie Claire — n° 144, accord : cidre brut ; préparation 30 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 12::numeric, '', 'noix de saint-jacques (avec les barbes réservées)'),
  (1, 20, 'g', 'beurre'),
  (2, null, '', 'sel'),
  (3, null, '', 'poivre'),
  (4, 50, 'cl', 'cidre brut'),
  (5, 100, 'g', 'beurre bien froid (pour monter la sauce)'),
  (6, 15, 'g', 'beurre (pour suer les légumes)'),
  (7, 1, '', 'échalote'),
  (8, 2, '', 'carottes'),
  (9, 1, '', 'bouquet garni'),
  (10, 1, '', 'petit chou-fleur'),
  (11, 30, 'cl', 'crème liquide'),
  (12, 40, 'cl', 'lait')
) as v(pos, qty, unit, name) on true;

-- Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Coquilles Saint-Jacques au beurre de cidre et crème de chou-fleur', 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793', 4, 'Peler et émincer l''échalote, éplucher et tailler les carottes en petits dés, rincer les barbes de saint-jacques pour éliminer le sable. Faire fondre l''échalote et les carottes dans 15 g de beurre 2 min, ajouter les barbes 2 min, mouiller avec le cidre, ajouter le bouquet garni, poivrer, laisser frémir doucement 25 min. Pendant ce temps, détailler le chou-fleur en bouquets ; porter à ébullition le lait et la crème, y cuire le chou-fleur 35 min à frémissement, poivrer. Prélever 2 louches de liquide, mixer le reste au mixeur plongeant (rallonger avec le liquide réservé si trop épais). Filtrer le cidre pour retirer les barbes, le faire réduire de moitié à feu vif, puis monter la sauce en incorporant peu à peu le beurre bien froid en dés, en fouettant vigoureusement ; réserver au chaud. Dans une poêle, chauffer le reste de beurre et saisir les noix de saint-jacques 2 min par face, saler, poivrer. Répartir les noix dans les assiettes, napper de beurre de cidre et servir chaud avec la crème de chou-fleur. Astuce : remplacer le lait de vache par du lait de coco pour une touche exotique. (Marie Claire — n° 144, accord : cidre brut ; préparation 30 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saint-jacques-roties-beurre-de-cidre-et-creme-de-chou-fleur,1210716.asp?xtor=EPR-3&M_BT=2557490782793')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 12::numeric, '', 'noix de saint-jacques (avec les barbes réservées)'),
  (1, 20, 'g', 'beurre'),
  (2, null, '', 'sel'),
  (3, null, '', 'poivre'),
  (4, 50, 'cl', 'cidre brut'),
  (5, 100, 'g', 'beurre bien froid (pour monter la sauce)'),
  (6, 15, 'g', 'beurre (pour suer les légumes)'),
  (7, 1, '', 'échalote'),
  (8, 2, '', 'carottes'),
  (9, 1, '', 'bouquet garni'),
  (10, 1, '', 'petit chou-fleur'),
  (11, 30, 'cl', 'crème liquide'),
  (12, 40, 'cl', 'lait')
) as v(pos, qty, unit, name) on true;

-- Carpaccio de betteraves, écume de haddock
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Carpaccio de betteraves, écume de haddock', 'https://www.marieclaire.fr/cuisine/carpaccio-de-betteraves-ecume-de-haddock,1206503.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Préchauffer le four à 180 °C (th. 6). Emballer les betteraves séparément dans du papier alu, cuire 1 h 30 au four, laisser refroidir dans le papier. Pendant ce temps, cuire l''œuf dur 10 min, l''écaler et le hacher finement ; peler et hacher finement l''oignon rouge avec les cornichons pour une brunoise. Couper le pain de mie en dés et les dorer à la poêle au beurre. Retirer la peau du haddock, couper la chair en petits morceaux. Chauffer la crème, y ajouter le haddock, laisser mijoter 10 min, puis filtrer pour récupérer une crème parfumée et laisser refroidir. Éplucher les betteraves refroidies, les trancher très finement en carpaccio, disposer dans un plat. Émulsionner huile de noix, vinaigre, sel et poivre, en arroser le carpaccio. Au moment de servir, entourer le carpaccio de crème de haddock froide, parsemer de la brunoise œuf-cornichon-oignon et des croûtons dorés. Astuce croûtons : voir la recette maison dédiée. (Marie Claire — Éric Frechon, n° 144, accord : muscadet-sèvre-et-maine ; préparation 30 min, cuisson 1 h 30.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/carpaccio-de-betteraves-ecume-de-haddock,1206503.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'betteraves crues (taille moyenne)'),
  (1, 200, 'g', 'haddock'),
  (2, 25, 'cl', 'crème liquide'),
  (3, 1, '', 'petit oignon rouge'),
  (4, 1, '', 'œuf'),
  (5, 4, '', 'cornichons'),
  (6, 1, '', 'tranche de pain de mie'),
  (7, 10, 'g', 'beurre'),
  (8, 10, 'cl', 'huile de noix'),
  (9, 2, 'c. à s.', 'vinaigre de vin'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Flans de petits pois au lard croustillant
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Flans de petits pois au lard croustillant', 'https://www.marieclaire.fr/cuisine/flans-de-petits-pois-au-lard-croustillant,1206546.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Préchauffer le four à 180 °C (th. 6). Écosser les petits pois, les cuire à l''eau bouillante salée 12-15 min selon la grosseur, égoutter (réserver 100 g de pois entiers) et mixer le reste en fine purée. Ajouter à la purée les œufs et la crème, saler, poivrer, mélanger au fouet. Répartir dans des moules individuels en silicone, enfourner 25 min. En parallèle, disposer les tranches de lard sur une plaque tapissée de papier sulfurisé, recouvrir d''une autre feuille et d''une plaque pour qu''il reste plat, cuire au four le même temps que les flans. Ciseler la menthe effeuillée, préparer une vinaigrette avec l''huile, le jus de citron, sel et poivre, y ajouter la menthe. Démouler les flans tièdes, servir avec les petits pois réservés, une cuillerée de mascarpone, le lard croustillant et la vinaigrette à la menthe ; se déguste chaud ou froid. Variante : remplacer le lard par des lanières de saumon fumé. (Marie Claire — Irène Karsenty, n° 145, accord : côtes-de-gascogne blanc sec ; préparation 35 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/flans-de-petits-pois-au-lard-croustillant,1206546.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'petits pois frais à écosser'),
  (1, 2, '', 'gros œufs'),
  (2, 20, 'cl', 'crème épaisse'),
  (3, 2, 'c. à s.', 'mascarpone'),
  (4, 4, 'tranches', 'lard fumé (fines tranches)'),
  (5, 4, 'brins', 'menthe fraîche'),
  (6, 4, 'c. à s.', 'huile d''olive'),
  (7, 2, 'c. à s.', 'jus de citron'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Crème de petits pois à la menthe
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Crème de petits pois à la menthe', 'https://www.marieclaire.fr/cuisine/creme-de-petits-pois-a-la-menthe,24101,1192382.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Diluer les tablettes de bouillon dans 50 cl d''eau bouillante, y plonger les petits pois, cuire 20 min à petits frémissements, saler, poivrer. Pendant ce temps, faire revenir les lardons à l''huile d''arachide à feu doux jusqu''à ce qu''ils soient bien grillés. Mixer les petits pois avec leur bouillon, l''huile de noix, la crème et 6 feuilles de menthe (mixeur plongeant ou blender), rectifier l''assaisonnement. Répartir la crème dans des bols, parsemer de lardons grillés et décorer d''une feuille de menthe. Astuce : en saison, remplacer par des petits pois frais (environ 1 kg à écosser pour 4 personnes). (Marie Claire — Marie Leteuré, n° 91 ; préparation 5 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/creme-de-petits-pois-a-la-menthe,24101,1192382.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 500::numeric, 'g', 'petits pois surgelés'),
  (1, 2, '', 'tablettes de bouillon de volaille'),
  (2, 125, 'g', 'lardons allumettes'),
  (3, 15, 'cl', 'crème liquide'),
  (4, 1, 'c. à s.', 'huile d''arachide'),
  (5, 2, 'c. à s.', 'huile de noix'),
  (6, 10, 'feuilles', 'menthe'),
  (7, null, '', 'sel'),
  (8, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Sauté d'agneau aux petits navets
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Sauté d''agneau aux petits navets', 'https://www.marieclaire.fr/cuisine/saute-d-agneau-aux-petits-navets,1351448.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Préparer la gremolata : ciseler finement les herbes lavées, hacher l''ail pelé, prélever et hacher les zestes des agrumes, mélanger le tout avec la moitié de l''huile d''olive, réserver. Faire dorer les morceaux d''agneau sur toutes les faces 5 min dans le reste d''huile en cocotte, verser le vin blanc, laisser réduire un peu, ajouter les tomates en dés et un verre d''eau, assaisonner, cuire à feu doux 1 h 30. Pendant ce temps, éplucher les navets (garder un peu de fanes), les cuire 10 min à l''eau bouillante, égoutter et les ajouter à la cocotte avec la moitié de la gremolata 15 min avant la fin de cuisson. Rectifier l''assaisonnement, servir bien chaud ; encore meilleur préparé la veille. Astuce : pour épaissir la sauce, saupoudrer la viande de 2 c. à s. de farine avant de mouiller au vin blanc. (Marie Claire — Sophie Menut-Yovanovitch, n° 193, accord : corbières blanc ; préparation 20 min, cuisson 1 h 45.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saute-d-agneau-aux-petits-navets,1351448.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1.5::numeric, 'kg', 'collier d''agneau (coupé en morceaux)'),
  (1, 2, 'bottes', 'navets'),
  (2, 250, 'g', 'tomates en dés (en boîte)'),
  (3, 10, 'brins', 'menthe'),
  (4, 10, 'brins', 'persil'),
  (5, 2, 'gousses', 'ail'),
  (6, 1, '', 'orange bio'),
  (7, 1, '', 'citron bio'),
  (8, 5, 'cl', 'huile d''olive'),
  (9, 10, 'cl', 'vin blanc'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Rougets à la rhubarbe
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Rougets à la rhubarbe', 'https://www.marieclaire.fr/cuisine/rougets-a-la-rhubarbe,1206553.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Effiler les tiges de rhubarbe, les couper en petits tronçons, les blanchir 2 min à l''eau bouillante, égoutter. Faire chauffer le beurre jusqu''à couleur noisette, y rissoler la rhubarbe 5 min en remuant, ajouter le cinq-épices et le miel, laisser compoter 3-4 min à feu doux, réserver. Mélanger la moitié de l''huile d''olive avec le sucre dans une petite casserole, y cuire les tomates cerises à feu doux 5 min. Saler et poivrer les filets de rougets, les fariner, les cuire à la poêle avec le reste d''huile 1 min de chaque côté. Dresser la rhubarbe en dôme dans les assiettes, poser les rougets dessus, garnir des tomates. (Marie Claire — n° 145, accord : côtes-de-provence rosé ; préparation 30 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/rougets-a-la-rhubarbe,1206553.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 8::numeric, '', 'filets de rougets barbets (frais ou surgelés)'),
  (1, 500, 'g', 'tiges de rhubarbe'),
  (2, 12, '', 'tomates cerises'),
  (3, 100, 'g', 'beurre'),
  (4, 60, 'g', 'miel'),
  (5, 2, 'pincées', 'cinq-épices'),
  (6, 6, 'c. à s.', 'huile d''olive'),
  (7, 10, 'g', 'sucre'),
  (8, 2, 'c. à s.', 'farine'),
  (9, null, '', 'sel'),
  (10, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Wok de mignon de porc aux pois gourmands
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Wok de mignon de porc aux pois gourmands', 'https://www.marieclaire.fr/cuisine/wok-de-mignon-de-porc-aux-pois-gourmands,1197748.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Couper le filet mignon en fines tranches, saler et poivrer. Effiler et rincer les pois gourmands, éplucher et émincer l''oignon rouge. Chauffer l''huile dans un wok, y faire revenir l''oignon à feu vif 1 min puis le réserver sur le côté. Faire dorer la viande 3 min en remuant sans arrêt, ajouter les pois gourmands et poursuivre 3 min. Incorporer la pâte de curry, le yaourt et l''oignon réservé, mélanger et retirer du feu. Astuce : les pois gourmands peuvent être remplacés ou complétés par des petits pois frais ou surgelés, précuits 10 min à l''eau bouillante salée à découvert. (Marie Claire, Marie-France Six — préparation 10 min, cuisson 7 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/wok-de-mignon-de-porc-aux-pois-gourmands,1197748.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'filet mignon de porc (400 g)'),
  (1, 200, 'g', 'pois gourmands'),
  (2, 1, '', 'gros oignon rouge'),
  (3, 2, 'c. à s.', 'yaourt nature'),
  (4, 2, 'c. à s.', 'pâte de curry'),
  (5, 1, 'c. à s.', 'huile d''olive'),
  (6, null, '', 'sel'),
  (7, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Croquettes de poulet mijotées, sauce curry-coco
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Croquettes de poulet mijotées, sauce curry-coco', 'https://www.marieclaire.fr/cuisine/croquettes-de-poulet-mijotees-sauce-curry,1193978.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Hacher les blancs de poulet au couteau, peler et hacher l''ail et les oignons, effeuiller la coriandre, verser la farine dans une assiette. Mixer au robot les cacahuètes avec la moitié de la coriandre et 2 gousses d''ail pour obtenir une pâte. Faire fondre la moitié des oignons dans 2 c. à s. d''huile, ajouter la pâte de cacahuètes et le miel, laisser caraméliser 3 min à feu vif. Laisser refroidir puis mélanger avec le poulet haché, le jaune d''œuf, sel et poivre ; former des boulettes, les rouler dans la farine en retirant l''excédent. Faire fondre le reste des oignons et la dernière gousse d''ail hachée dans 1 c. à s. d''huile, ajouter le curry, le lait de coco, 20 cl d''eau et la tablette de bouillon émiettée, cuire 10 min à feu moyen puis mixer la sauce au mixeur plongeant. Dorer les croquettes 5 min à la poêle dans le reste d''huile en les faisant rouler, puis les mettre dans la sauce et laisser mijoter 15 min à feu moyen. Parsemer du reste de coriandre ciselée avant de servir, avec un riz basmati ou thaï sauté aux amandes effilées. Peut se préparer à l''avance : croquettes dorées et sauce réservées séparément, réunies 15 min avant de servir. (Marie Claire, Valéry Drouet — préparation 40 min, cuisson 40 min ; vin conseillé : un rully blanc de Bourgogne.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/croquettes-de-poulet-mijotees-sauce-curry,1193978.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'blancs de poulet'),
  (1, 80, '', 'cacahuètes décortiquées'),
  (2, 1, 'c. à s.', 'miel liquide'),
  (3, 2, '', 'petits oignons'),
  (4, 3, 'gousses', 'ail'),
  (5, 20, 'cl', 'lait de coco'),
  (6, 0.5, '', 'tablette de bouillon de volaille'),
  (7, 1, '', 'jaune d''œuf'),
  (8, 1, 'c. à s.', 'curry en poudre'),
  (9, 40, 'g', 'farine'),
  (10, 5, 'c. à s.', 'huile d''olive'),
  (11, 1, 'botte', 'coriandre'),
  (12, null, '', 'sel'),
  (13, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Poulet à l'estragon et vin blanc
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Poulet à l''estragon et vin blanc', 'https://www.marieclaire.fr/cuisine/poulet-a-l-estragon-et-vin-blanc,1355711.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Faire dorer le poulet sur toutes ses faces dans l''huile en cocotte, réserver. Éplucher et hacher les échalotes, les faire blondir 3 min dans la même cocotte. Remettre le poulet, saler, poivrer, ajouter la farine, bien mélanger puis verser le vin blanc ; laisser 5 min puis ajouter le bouillon bien chaud, couvrir et laisser cuire 20 min. Retirer le poulet et poursuivre la cuisson du bouillon 10 min pour le faire réduire. Laver et ciseler l''estragon, l''ajouter à la crème, saler, poivrer, verser dans la cocotte et laisser cuire 5 min. Remettre le poulet et prolonger la cuisson environ 10 min jusqu''à sauce épaisse et veloutée. Servir avec du riz nature. Version express et légère : blancs de poulet sans peau coupés en lanières, temps de cuisson divisé par deux. (Marie Claire, Sophie Menut-Yovanovitch — préparation 20 min, cuisson 45 min ; vin conseillé : un riesling d''Alsace.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/poulet-a-l-estragon-et-vin-blanc,1355711.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'poulet coupé en morceaux'),
  (1, 1, 'botte', 'estragon'),
  (2, 3, '', 'échalotes'),
  (3, 15, 'cl', 'crème liquide'),
  (4, 15, 'cl', 'vin blanc'),
  (5, 20, 'cl', 'bouillon de poule'),
  (6, 2, 'c. à s.', 'huile d''olive'),
  (7, 1, 'c. à s.', 'farine'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Curry indien de poulet aux petits pois
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Curry indien de poulet aux petits pois', 'https://www.marieclaire.fr/cuisine/curry-indien-de-poulet-aux-petits-pois,1356319.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Couper le poulet en morceaux, le faire mariner avec le jus de citron vert, le paprika, le piment, sel et poivre pendant 30 min. Précuire les petits pois 5 min à la vapeur douce. Peler l''ail et l''oignon, émincer l''oignon, hacher l''ail et le gingembre, épépiner le poivron et le tailler en lamelles. Chauffer l''huile de coco en cocotte avec le bâton de cannelle, la cardamome fendue et les graines de cumin jusqu''à ce que les parfums se dégagent. Ajouter ail, oignon, poivron et gingembre, cuire 3 min à feu moyen, puis le poulet mariné 5 à 8 min. Ajouter garam masala, curcuma et cumin en poudre, laisser 2 min, verser le coulis de tomates et un verre d''eau, mijoter 10 min. Ajouter les petits pois et prolonger 10 min, puis les épinards 2 min avant la fin. Se déguste tel quel ou avec du riz ou des pommes de terre. (150 recettes de naturopathe, Hélène Comlan, éditions Marie Claire — préparation 25 min, cuisson 30 min, repos 30 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/curry-indien-de-poulet-aux-petits-pois,1356319.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 400::numeric, 'g', 'petits pois'),
  (1, 2, '', 'filets de poulet'),
  (2, 25, 'cl', 'coulis de tomates'),
  (3, 1, '', 'poivron jaune'),
  (4, 500, 'g', 'jeunes pousses d''épinards'),
  (5, 1, 'c. à s.', 'huile de coco'),
  (6, 0.5, '', 'citron vert'),
  (7, 1, 'c. à c.', 'paprika'),
  (8, 1, 'pincée', 'piment en poudre (facultatif)'),
  (9, 1, '', 'bâton de cannelle'),
  (10, 2, 'gousses', 'cardamome'),
  (11, 0.5, 'c. à c.', 'graines de cumin'),
  (12, 1, '', 'oignon'),
  (13, 2, 'gousses', 'ail'),
  (14, 3, 'cm', 'gingembre'),
  (15, 1, 'c. à c.', 'curcuma'),
  (16, 1, 'c. à c.', 'cumin en poudre'),
  (17, 1, 'c. à c.', 'garam masala'),
  (18, 0.5, 'botte', 'coriandre'),
  (19, null, '', 'sel'),
  (20, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Lasagnes aux épinards et saumon
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Lasagnes aux épinards et saumon', 'https://www.marieclaire.fr/cuisine/lasagnes-aux-epinards-et-saumon,1356317.asp?xtor=EPR-3&M_BT=2242774561181', 2, 'Pocher le saumon 10 min dans la boisson végétale, l''émietter en retirant les arêtes, réserver la boisson de cuisson. Laver et hacher les épinards, les cuire 10 min à la vapeur. Faire un roux avec le beurre fondu et la farine de riz, mouiller avec la boisson de cuisson du saumon, porter à ébullition au fouet jusqu''à sauce homogène ; saler, poivrer, ajouter la muscade, retirer du feu et incorporer épinards et saumon. Préchauffer le four à 200 °C, monter les lasagnes en plat à gratin en alternant pâtes et garniture saumon-épinards, terminer par la garniture et la mozzarella émiettée. Enfourner 30 min. (150 recettes de naturopathe, Hélène Comlan, éditions Marie Claire — préparation 15 min, cuisson 40 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/lasagnes-aux-epinards-et-saumon,1356317.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 0.5::numeric, '', 'boîte de pâtes à lasagne précuites'),
  (1, 250, 'g', 'saumon frais'),
  (2, 500, 'g', 'épinards frais'),
  (3, 50, 'g', 'mozzarella'),
  (4, 10, 'g', 'beurre'),
  (5, 35, 'cl', 'boisson végétale de riz'),
  (6, 2, 'c. à s.', 'farine de riz'),
  (7, 0.25, 'c. à c.', 'muscade'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Anchois marinés au vin blanc
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Anchois marinés au vin blanc', 'https://www.marieclaire.fr/cuisine/anchois-marines-au-vin-blanc,1193828.asp?xtor=EPR-3&M_BT=2242774561181', 6, 'Faire étêter et vider les anchois par le poissonnier. Les essuyer sans les rincer, les ranger dans un plat en verre et les recouvrir complètement de sel fin ; laisser reposer 2 h au frais. Éplucher et émincer finement échalotes et ail. Sortir les anchois du sel, les essuyer un par un. Préparer la marinade : vin blanc, vinaigre, échalotes, ail, estragon, laurier, thym, piments et quelques grains de poivre dans un saladier ; y plonger les anchois, couvrir et mettre au frais 12 h. Égoutter les anchois à l''écumoire, ouvrir chaque poisson et retirer l''arête centrale, ranger les filets en terrine. (Marie Claire, Irène Karsenty — préparation 45 min ; vin conseillé : un collioure blanc du Languedoc-Roussillon.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/anchois-marines-au-vin-blanc,1193828.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'anchois frais moyens'),
  (1, 10, '', 'échalotes'),
  (2, 5, 'gousses', 'ail'),
  (3, 75, 'cl', 'vin blanc sec'),
  (4, 75, 'cl', 'vinaigre de vin blanc'),
  (5, 2, 'brins', 'estragon'),
  (6, 4, 'feuilles', 'laurier'),
  (7, 2, 'brins', 'thym'),
  (8, 2, '', 'piments oiseaux'),
  (9, null, '', 'poivre en grains'),
  (10, null, '', 'sel fin de mer')
) as v(pos, qty, unit, name) on true;

-- Pintxos de chorizo
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pintxos de chorizo', 'https://www.marieclaire.fr/cuisine/pintxos-de-chorizo,1212823.asp?xtor=EPR-3&M_BT=2242774561181', 6, 'Ôter la peau du chorizo et le couper en tranches épaisses. Couper les cornichons en gros morceaux, détailler les piquillos égouttés en larges lamelles. Préparer un barbecue. Emballer chaque rondelle de chorizo dans une lamelle de piquillo, piquer sur des minibrochettes avec un morceau de cornichon. Faire colorer sur le barbecue, relever de piment d''Espelette. Au moment de servir, flamber hors du feu avec un peu de cognac réchauffé. Servir chaud. (Marie Claire, Pascale Mosnier — préparation 10 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/pintxos-de-chorizo,1212823.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 300::numeric, 'g', 'chorizo'),
  (1, 6, '', 'cornichons au vinaigre'),
  (2, 12, '', 'piquillos (petits poivrons espagnols en bocal)'),
  (3, null, '', 'piment d''Espelette'),
  (4, null, '', 'cognac')
) as v(pos, qty, unit, name) on true;

-- Tortilla aux courgettes et aux oignons
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Tortilla aux courgettes et aux oignons', 'https://www.marieclaire.fr/cuisine/tortilla-aux-courgettes-et-aux-oignons,1196797.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Rincer les courgettes, ôter les extrémités, les émincer en fines rondelles. Peler et hacher les oignons au couteau, ciseler le persil, peler et hacher l''ail, battre les œufs en omelette. Faire fondre doucement les oignons 10 min dans 2 c. à s. d''huile, les réserver ; dans la même poêle, faire revenir courgettes et ail 8 à 10 min à feu moyen. Mélanger courgettes, oignons et persil aux œufs, saler, poivrer. Nettoyer la poêle, y chauffer le reste d''huile, verser la préparation et laisser prendre en détachant les bords à la spatule. Quand le centre commence à prendre, retourner la tortilla sur un plat puis la glisser de nouveau dans la poêle pour cuire l''autre face environ 5 min. Couper en parts, servir tiède ou froid, éventuellement avec une salade de mâche aux noix. (Marie Claire, Irène Karsenty — préparation 30 min, cuisson 30 min ; vin conseillé : un bordeaux rosé.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/tortilla-aux-courgettes-et-aux-oignons,1196797.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 10::numeric, '', 'œufs'),
  (1, 4, '', 'petites courgettes'),
  (2, 2, '', 'gros oignons'),
  (3, 2, 'gousses', 'ail'),
  (4, 1, 'botte', 'persil plat'),
  (5, 10, 'cl', 'huile d''olive'),
  (6, null, '', 'sel'),
  (7, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Pot-au-feu de veau à l'italienne
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pot-au-feu de veau à l''italienne', 'https://www.marieclaire.fr/cuisine/pot-au-feu-de-veau-a-l-italienne,1194612.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Peler carottes et oignon, couper le céleri en tronçons. Mettre la viande dans un faitout avec ces légumes, la tomate entière et le bouquet garni, couvrir d''eau froide, porter à ébullition, saler, puis laisser mijoter à découvert 2 h 30 à 3 h jusqu''à ce que la viande se détache des os. Sortir la viande (réserver le bouillon), retirer les os et couper le veau en bouchées. Passer le bouillon à la passoire, le remettre dans le faitout, rectifier l''assaisonnement, porter à ébullition et y cuire les pâtes 2 à 3 min. Rincer et éponger roquette et tomates cerise. Répartir pâtes et un peu de bouillon dans 4 assiettes creuses, ajouter roquette et viande, garnir de tomates cerise, une cuillerée de pesto et une de mascarpone par assiette. Poivrer et servir aussitôt. Version italienne du pot-au-feu, plus légère et colorée que la version classique ; à garnir au dernier moment. (Marie Claire, Irène Karsenty — préparation 30 min, cuisson environ 2 h 30 ; vin conseillé : un mont baudile du Languedoc-Roussillon.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/pot-au-feu-de-veau-a-l-italienne,1194612.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, 'tranches', 'osso-buco de veau (épaisses)'),
  (1, 2, '', 'carottes'),
  (2, 1, '', 'tomate'),
  (3, 1, '', 'oignon'),
  (4, 2, 'branches', 'céleri'),
  (5, 1, '', 'bouquet garni (thym, laurier, persil)'),
  (6, null, '', 'sel'),
  (7, null, '', 'poivre'),
  (8, 4, 'c. à s.', 'pesto en pot'),
  (9, 4, 'c. à s.', 'mascarpone'),
  (10, 12, '', 'tomates cerise'),
  (11, 1, '', 'poignée de roquette'),
  (12, 250, 'g', 'tagliatelles fraîches')
) as v(pos, qty, unit, name) on true;

-- Conchiglioni farcis au veau
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Conchiglioni farcis au veau', 'https://www.marieclaire.fr/cuisine/conchiglioni-farcis-au-veau,1193982.asp?xtor=EPR-1&M_BT=2242774561181', 6, 'Précuire les pâtes 5 min à l''eau bouillante salée, les égoutter, les rafraîchir puis les étaler sur un torchon. Ciseler le cerfeuil. Préchauffer le four à 180 °C. Éplucher et hacher oignons et ail, les faire fondre 5 min à l''huile d''olive. Ajouter la viande hachée, cuire 5 min à feu vif en remuant puis verser 20 cl de coulis de tomates, saler, poivrer et laisser mijoter 15 min à feu doux. Hors du feu, ajouter le cerfeuil ciselé et laisser tiédir. Garnir les conchiglioni de cette farce, les disposer dans un plat à four. Diluer la tablette de bouillon dans 20 cl d''eau bouillante, verser dans le plat avec le reste de coulis, parsemer de parmesan et faire gratiner 20 à 25 min au four. Servir très chaud. Peut se préparer à l''avance : pâtes garnies couvertes de papier alu quelques heures avant, coulis et bouillon versés puis plat enfourné 30 min avant de servir. (Marie Claire, Valéry Drouet — préparation 30 min, cuisson 55 min ; vin conseillé : un patrimonio blanc de Provence-Corse.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/conchiglioni-farcis-au-veau,1193982.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 24::numeric, '', 'conchiglioni (très grosses pâtes en forme de coquillage)'),
  (1, 500, 'g', 'veau haché'),
  (2, 2, '', 'oignons'),
  (3, 2, 'gousses', 'ail'),
  (4, 60, 'cl', 'coulis de tomates'),
  (5, 1, 'botte', 'cerfeuil'),
  (6, 4, 'c. à s.', 'huile d''olive'),
  (7, 100, 'g', 'parmesan fraîchement râpé'),
  (8, 1, '', 'tablette de bouillon de volaille'),
  (9, null, '', 'sel'),
  (10, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Boulettes de veau au citron de Cyril Lignac
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Boulettes de veau au citron de Cyril Lignac', 'https://www.marieclaire.fr/cuisine/boulettes-de-veau-au-citron-de-cyril-lignac,1375851.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Mélanger à la main le haché de veau avec le parmesan, les œufs, la ricotta, le persil haché et le pain trempé dans le lait puis pressé ; assaisonner de sel fin, poivre, muscade râpée et zeste de citron. Former une trentaine de boulettes. Porter une casserole d''eau à ébullition avec le gros sel. Dans une poêle chaude, faire fondre l''huile d''olive et le beurre avec le laurier et le bâton de cannelle, ajouter le parmesan et le laisser fondre, ajouter le jus de citron et une louche de l''eau de cuisson des boulettes en fouettant jusqu''à sauce liée, légèrement épaisse et brillante ; retirer la cannelle, passer la sauce et la remettre dans la poêle avec le laurier. Plonger les boulettes 7 min dans l''eau bouillante, les égoutter et les déposer dans la sauce, mélanger. Servir chaud en assiettes creuses, garni d''un quartier de citron et d''une feuille de laurier. (Cyril Lignac pour Bravo le Veau, via Marie Claire — préparation 20 min, cuisson 25 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/boulettes-de-veau-au-citron-de-cyril-lignac,1375851.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 600::numeric, 'g', 'haché de veau'),
  (1, 30, 'g', 'parmesan râpé'),
  (2, 2, '', 'œufs bio'),
  (3, 100, 'g', 'ricotta'),
  (4, 2, 'c. à s.', 'persil haché'),
  (5, 100, 'g', 'pain sans croûte trempé dans du lait'),
  (6, 1, '', 'zeste de citron non traité'),
  (7, 1, 'pincée', 'muscade'),
  (8, 4, 'quartiers', 'citron jaune non traité'),
  (9, null, '', 'jus de citron'),
  (10, 50, 'g', 'parmesan râpé'),
  (11, 1, '', 'bâton de cannelle'),
  (12, 4, 'feuilles', 'laurier'),
  (13, 25, 'g', 'beurre demi-sel'),
  (14, 10, 'cl', 'huile d''olive'),
  (15, 1, 'c. à c.', 'gros sel de cuisine'),
  (16, null, '', 'sel fin'),
  (17, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Tajine de veau à l'orange et aux carottes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Tajine de veau à l''orange et aux carottes', 'https://www.marieclaire.fr/cuisine/tajine-de-veau-a-l-orange-et-aux-carottes,24107,1192454.asp?xtor=EPR-1&M_BT=2242774561181', 6, 'Peler carottes, ail et oignons ; couper les carottes en rondelles épaisses, hacher l''ail, émincer finement les oignons, couper la viande en gros dés. Presser une orange, peler les deux autres à vif et lever les quartiers, réserver deux rubans de zeste. Faire revenir la viande dans l''huile en cocotte, l''égoutter et à sa place faire fondre oignons et ail à feu doux, puis remettre la viande avec les carottes et les zestes. Ajouter les épices, saler, poivrer, verser 10 cl d''eau, l''eau de fleur d''oranger et le jus d''orange, laisser mijoter à couvert 1 h 20 à feu doux. Ajouter le bouquet de coriandre ficelé et les quartiers d''orange, poursuivre 10 min, retirer la coriandre avant de servir. Astuce budget : remplacer par du tendron de veau, en prévoyant 1,5 kg à cause des os. (Marie Claire, Valéry Drouet — préparation 25 min, cuisson 1 h 30 ; vin conseillé : un chardonnay de Limoux, Languedoc.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/tajine-de-veau-a-l-orange-et-aux-carottes,24107,1192454.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'viande de veau (jarret et épaule)'),
  (1, 1, 'kg', 'carottes'),
  (2, 3, '', 'oranges bio'),
  (3, 2, '', 'oignons'),
  (4, 2, 'gousses', 'ail'),
  (5, 1, 'c. à c.', 'cannelle en poudre'),
  (6, 2, 'pincées', 'gingembre en poudre'),
  (7, 2, 'pincées', 'cumin en poudre'),
  (8, 1, 'c. à s.', 'eau de fleur d''oranger'),
  (9, 1, 'botte', 'coriandre'),
  (10, 2, 'c. à s.', 'huile d''olive'),
  (11, null, '', 'sel'),
  (12, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Colombo de veau
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Colombo de veau', 'https://www.marieclaire.fr/cuisine/colombo-de-veau,1292071.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Peler l''échalote et l''ail, les hacher avec le persil. Mettre dans un saladier avec 3 c. à s. d''huile, les épices, sel et poivre, zester le citron vert au-dessus, ajouter son jus, bien mélanger puis incorporer la viande et malaxer à la main pour bien l''imprégner de marinade ; laisser reposer au moins 4 h au frais. Couper l''aubergine en cubes, la faire revenir dans le reste d''huile environ 10 min. Faire dorer la viande marinée en cocotte 5 min à feu vif en remuant souvent. Ajouter les aubergines et les tomates, verser 40 cl d''eau, rectifier l''assaisonnement et laisser cuire à couvert à feu doux environ 45 min jusqu''à ce que la viande soit fondante et la sauce sirupeuse (ajouter un peu d''eau si la sauce réduit trop). Servir bien chaud avec du riz, basmati par exemple. (Marie Claire, Sophie Menut — préparation 30 min, cuisson 1 h, repos 4 h ; vin conseillé : un bandol rosé de Provence-Corse.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/colombo-de-veau,1292071.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 800::numeric, 'g', 'veau coupé en morceaux (quasi, échine)'),
  (1, 1, '', 'aubergine'),
  (2, 1, '', 'échalote'),
  (3, 1, 'gousse', 'ail'),
  (4, 3, 'brins', 'persil plat'),
  (5, 1, '', 'citron vert bio'),
  (6, 1, '', 'tomates jaunes entières au jus (rouges si vous n''en trouvez pas)'),
  (7, 5, 'c. à s.', 'huile d''olive'),
  (8, 2, 'c. à s.', 'poudre à colombo'),
  (9, 1, 'c. à c.', 'poudre de bois d''Inde'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Cocotte de veau aux asperges vertes de Cyril Lignac
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Cocotte de veau aux asperges vertes de Cyril Lignac', 'https://www.marieclaire.fr/cuisine/cocotte-de-veau-aux-asperges-vertes-de-cyril-lignac,1375850.asp?xtor=EPR-1&M_BT=2242774561181', 4, 'Couper le veau en cubes de 3 cm. Parer les asperges (retirer la partie dure, tailler les pointes puis le reste en biseau), émincer finement les champignons nettoyés et l''oignon. Faire suer l''oignon à l''huile en cocotte, ajouter les têtes d''asperges puis le reste taillé en biseau, cuire 4 min ; ajouter les champignons, saler, poivrer, parsemer de fenouil sauvage et cuire encore 5 min, puis réserver les légumes. Dans la même cocotte, huiler et colorer la viande assaisonnée sur toutes les faces à feu vif, ajouter le beurre, laisser caraméliser 2 min. Remettre les légumes, incorporer la moutarde à l''ancienne et la crème, assaisonner, laisser frémir quelques minutes puis parsemer d''anis vert. Servir chaud, accompagné de riz. (Cyril Lignac pour Bravo le Veau, sur Marie Claire — préparation 20 min, cuisson 20 min.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/cocotte-de-veau-aux-asperges-vertes-de-cyril-lignac,1375850.asp?xtor=EPR-1&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 600::numeric, 'g', 'escalopes de veau'),
  (1, 8, '', 'asperges vertes'),
  (2, 8, '', 'champignons de Paris'),
  (3, 1, '', 'oignon'),
  (4, 30, 'g', 'beurre'),
  (5, 1, 'c. à s.', 'moutarde à l''ancienne'),
  (6, 20, 'cl', 'crème fraîche'),
  (7, 1, 'c. à c.', 'fenouil sauvage sec'),
  (8, 1, 'pincée', 'anis vert'),
  (9, null, '', 'huile d''olive'),
  (10, null, '', 'sel fin'),
  (11, null, '', 'poivre du moulin')
) as v(pos, qty, unit, name) on true;

-- Saumon grillé et chutney de rhubarbe
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Saumon grillé et chutney de rhubarbe', 'https://www.marieclaire.fr/cuisine/saumon-grille-et-chutney-de-rhubarbe,1375789.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'La veille, éplucher et couper la rhubarbe en tronçons, hacher le gingembre, peler et émincer l''oignon, faire gonfler les raisins secs 15 min dans l''eau chaude. Chauffer le vinaigre avec le sucre, ajouter rhubarbe, oignon, gingembre et raisins, cuire 30 min jusqu''à consistance compotée et liquide réduit sans caraméliser ; laisser refroidir puis réserver au frais jusqu''au lendemain. Le jour même, torréfier les graines de sarrasin 1 min à sec, cuire les pavés de saumon côté peau 3 min puis 3 min de l''autre côté dans l''huile chaude. Servir le saumon avec le chutney, parsemer de graines de sarrasin et d''aneth, saler, poivrer. (Sophie Menut-Yovanovitch, Marie Claire — préparation 35 min, cuisson 35 min, repos 24 h. Accord vin : blanc, Cassis blanc.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saumon-grille-et-chutney-de-rhubarbe,1375789.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'pavés de saumon'),
  (1, 500, 'g', 'rhubarbe'),
  (2, 1, '', 'oignon'),
  (3, 75, 'g', 'raisins secs'),
  (4, 1, '', 'noix de gingembre frais'),
  (5, 250, 'g', 'sucre cassonade'),
  (6, 4, 'c. à s.', 'graines de sarrasin'),
  (7, 25, 'cl', 'vinaigre blanc'),
  (8, null, '', 'aneth'),
  (9, 1, 'c. à s.', 'huile d''olive'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Bar confit au fenouil
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Bar confit au fenouil', 'https://www.marieclaire.fr/cuisine/bar-confit-au-fenouil,1375787.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'La veille, laver et ôter la peau des filets de bar, les recouvrir de gros sel (moitié dessous, moitié dessus) et laisser confire 24 h au frais. Le jour même, rincer les filets, les tremper 30 min dans l''eau froide, égoutter puis couper en cubes de 2,5 cm. Peler, épépiner et couper les tomates en petits dés, égoutter dans une passoire. Couper le fenouil en petits cubes et le fondre 10 min dans une partie de l''huile. Ciseler persil et basilic. Dans le reste d''huile, saisir 1 min les graines de fenouil et les dés de poisson, ajouter tomates et herbes, cuire 2 min, saler si besoin, poivrer. Ajouter quelques lamelles crues de fenouil pour le croquant. Servir immédiatement. (Sophie Menut-Yovanovitch, Marie Claire — préparation 20 min, cuisson 15 min, repos 24 h. Accord vin : rosé, Lubéron rosé. Astuce : arroser d''un peu de jus de citron.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/bar-confit-au-fenouil,1375787.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'filets de bar'),
  (1, 8, '', 'tomates'),
  (2, 2, '', 'fenouils'),
  (3, 3, 'brins', 'persil'),
  (4, 2, 'brins', 'basilic'),
  (5, 5, 'cl', 'huile d''olive'),
  (6, 1, 'c. à c.', 'graines de fenouil'),
  (7, 500, 'g', 'gros sel'),
  (8, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Salade d'asperges vertes, sauce au citron
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Salade d''asperges vertes, sauce au citron', 'https://www.marieclaire.fr/cuisine/salade-d-asperges-vertes-sauce-au-citron,1375775.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'La veille, prélever le zeste et le jus du citron, ciseler le persil, mélanger le tout au lait ribot, saler, poivrer, réserver au frais. Le jour même, préchauffer le four à 200 °C. Émietter le pain en grosses miettes (robot ou couteau), peler et tailler l''ail en lamelles, disposer sur une plaque avec les câpres égouttées, arroser d''huile et enfourner 10 min en remuant de temps en temps. Laver et parer les asperges, les tailler en fines lamelles à l''économe ou à la mandoline ; ciseler cerfeuil et estragon. Mélanger les asperges avec la garniture de pain, câpres et herbes ; disposer en les enroulant dans les assiettes, arroser de la sauce au lait ribot et citron. (Sophie Menut-Yovanovitch, Marie Claire — préparation 20 min, cuisson 15 min. Accord vin : blanc, Muscat d''Alsace. Astuce : ajouter un œuf dur haché, choisir des asperges pas trop grosses pour qu''elles restent tendres.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/salade-d-asperges-vertes-sauce-au-citron,1375775.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 12::numeric, '', 'asperges vertes très fraîches'),
  (1, 1, '', 'citron'),
  (2, 2, 'gousses', 'ail'),
  (3, 3, 'c. à s.', 'câpres'),
  (4, 5, 'brins', 'cerfeuil'),
  (5, 2, 'brins', 'estragon'),
  (6, 2, 'brins', 'persil'),
  (7, 15, 'cl', 'lait ribot'),
  (8, 0.25, '', 'baguette de pain rassis'),
  (9, null, '', 'huile d''olive'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Gaspacho d'asperge
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Gaspacho d''asperge', 'https://www.marieclaire.fr/cuisine/gaspacho-d-asperge,1375772.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Couper le haut des asperges en conservant les têtes, peler les tiges et les couper en rondelles. Laver et hacher les cébettes, peler, dégermer et hacher l''ail. Faire blondir cébettes et ail 3 min dans 2 c. à s. d''huile, ajouter les rondelles d''asperges, cuire 5 min, verser le bouillon chaud, saler, poivrer et laisser cuire à couvert environ 30 min jusqu''à ce que les asperges soient moelleuses. Pendant ce temps, recouper les têtes en bâtonnets et les faire sauter 6 min dans 2 c. à s. d''huile jusqu''à légère coloration, réserver. Prélever le zeste du citron vert. Mixer finement le pain coupé en morceaux avec le contenu de la casserole, le sucre, le vinaigre et le jus de citron jusqu''à obtenir une crème lisse ; ajouter le zeste, rectifier l''assaisonnement, réfrigérer au moins 3 h. Répartir les bâtonnets d''asperges au centre des assiettes, verser le gaspacho autour. (Sophie Menut-Yovanovitch, Marie Claire — préparation 20 min, cuisson 30 min, repos 3 h. Accord vin : blanc, Sauvignon. Astuce : ajouter un filet d''huile d''olive extra-vierge avant de servir.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/gaspacho-d-asperge,1375772.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1.2::numeric, 'kg', 'asperges blanches'),
  (1, 3, '', 'cébettes'),
  (2, 2, 'gousses', 'ail'),
  (3, 1, '', 'tranche de pain de campagne'),
  (4, 1, '', 'citron vert'),
  (5, 1, 'c. à s.', 'sucre semoule'),
  (6, 1, 'l', 'bouillon de volaille'),
  (7, 2, 'c. à s.', 'vinaigre blanc'),
  (8, 4, 'c. à s.', 'huile d''olive'),
  (9, null, '', 'sel'),
  (10, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Tarte aux fraises et à la rhubarbe d'Hélène Darroze
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Tarte aux fraises et à la rhubarbe d''Hélène Darroze', 'https://www.marieclaire.fr/cuisine/tarte-aux-fraises-et-a-la-rhubarbe-d-helene-darroze,1375948.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Éplucher la rhubarbe et la couper en tronçons ; laver rapidement les fraises et couper les plus grosses en deux. Préchauffer le four à 200 °C, étaler la pâte sur une feuille de papier cuisson saupoudrée de 30 g de sucre. Répartir la rhubarbe sur la pâte en laissant 2 cm de bord, rabattre et rouler légèrement les bords, enfourner 15 min puis baisser à 180 °C et poursuivre 10 min. Sortir la tarte, répartir les fraises et le beurre coupé en morceaux, saupoudrer du sucre restant, remettre au four environ 15 min. Servir tiède. (Hélène Darroze, Marie Claire — préparation 20 min, cuisson 40 min. Accord vin : effervescent rosé, Crémant de Loire rosé. Variante : pâte feuilletée à la place de la pâte sucrée ; badigeonner de marmelade d''oranges avant dégustation pour plus de gourmandise.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/tarte-aux-fraises-et-a-la-rhubarbe-d-helene-darroze,1375948.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 300::numeric, 'g', 'fraises'),
  (1, 3, '', 'tiges de rhubarbe'),
  (2, 70, 'g', 'sucre brun'),
  (3, 1, '', 'disque de pâte sablée'),
  (4, 50, 'g', 'beurre')
) as v(pos, qty, unit, name) on true;

-- Carré d'agneau aux herbes d'Hélène Darroze
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Carré d''agneau aux herbes d''Hélène Darroze', 'https://www.marieclaire.fr/cuisine/carre-d-agneau-aux-herbes-d-helene-darroze,1375941.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Faire dorer le carré d''agneau et les gousses d''ail en chemise dans la graisse de canard jusqu''à belle coloration, saler, poivrer. Préchauffer le four à 180 °C. Dans une cocotte, faire un lit avec les trois quarts des herbes, poser le carré dessus avec les gousses d''ail autour, recouvrir avec le reste des herbes. Enfourner environ 15 min, laisser reposer une dizaine de minutes avant de servir. (Hélène Darroze, Marie Claire — préparation 15 min, cuisson 15 min. Accord vin : rouge, Faugères rouge. Servir avec des légumes de printemps.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/carre-d-agneau-aux-herbes-d-helene-darroze,1375941.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, '', 'carré d''agneau de 8 côtes'),
  (1, 1, '', 'tête d''ail'),
  (2, 1, '', 'bouquet de thym'),
  (3, 1, '', 'bouquet de romarin'),
  (4, 1, '', 'bouquet de serpolet'),
  (5, 1, '', 'bouquet de marjolaine'),
  (6, 2, 'brins', 'fenouil'),
  (7, 3, 'c. à s.', 'graisse de canard'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Cocotte de légumes des beaux jours et œufs pochés d'Hélène Darroze
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Cocotte de légumes des beaux jours et œufs pochés d''Hélène Darroze', 'https://www.marieclaire.fr/cuisine/cocotte-de-legumes-des-beaux-jours-et-oeufs-poches-d-helene-darroze,1375931.asp?xtor=EPR-3&M_BT=2242774561181', 4, 'Écosser les petits pois, laver le cœur de salade et les pommes de terre, couper les oignons nouveaux en 2 ou 4 et la ventrèche en gros lardons. Faire chauffer la graisse de canard en cocotte, ajouter oignons et ventrèche, cuire 5 min. Ajouter les pommes de terre, les gousses d''ail en chemise, le thym, verser le bouillon, saler, poivrer, couvrir et cuire 25 min ; 10 min avant la fin ajouter les petits pois, puis 5 min après les feuilles de salade romaine. Pendant ce temps, pocher les œufs 3 min dans une eau vinaigrée, égoutter sur papier absorbant. Mélanger les légumes, rectifier l''assaisonnement et glisser délicatement les œufs pochés dedans. Servir directement en cocotte. (Hélène Darroze, Marie Claire — préparation 45 min, cuisson 30 min. Accord vin : blanc, Beaujolais blanc. Astuce d''Hélène : rallonger d''un peu de bouillon si les légumes accrochent ; on peut aussi pocher les œufs directement dans les légumes en fin de cuisson, moins joli mais délicieux.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/cocotte-de-legumes-des-beaux-jours-et-oeufs-poches-d-helene-darroze,1375931.asp?xtor=EPR-3&M_BT=2242774561181')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1::numeric, 'kg', 'petits pois frais'),
  (1, 400, 'g', 'petites pommes de terre grenaille'),
  (2, 1, '', 'cœur de salade romaine'),
  (3, 2, '', 'oignons nouveaux'),
  (4, 4, 'gousses', 'ail'),
  (5, 4, '', 'œufs'),
  (6, 125, 'g', 'ventrèche du Sud-Ouest (poitrine de porc au piment d''Espelette)'),
  (7, 20, 'cl', 'bouillon de volaille'),
  (8, 1, 'trait', 'vinaigre blanc'),
  (9, 2, 'c. à s.', 'graisse de canard'),
  (10, 2, 'brins', 'thym'),
  (11, null, '', 'sel'),
  (12, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Rôti de veau au citron et au gingembre
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Rôti de veau au citron et au gingembre', 'https://www.marieclaire.fr/cuisine/roti-de-veau-au-citron-et-au-gingembre,24107,1191332.asp', 6, 'Préchauffer le four à 180 °C (th. 6). Faire chauffer l''huile en cocotte allant au four et dorer le rôti sur toutes ses faces. Saler, ajouter les oignons en quartiers, le gingembre finement émincé, un peu de poivre mignonnette, enfourner à découvert environ 10 min. Prélever le zeste des deux citrons en julienne, presser un citron. Réunir le vin, 10 cl d''eau, le sucre, les clous de girofle, le jus de citron, la julienne de zestes et le bouquet garni, porter à ébullition et réduire d''un tiers à feu vif. Verser sur le rôti en cocotte, couvrir et cuire 1 h au four en arrosant fréquemment. Le rôti doit être bien doré, sinon augmenter la température 10 min avant la fin. Servir découpé avec le jus dégraissé et déglacé d''un peu d''eau, accompagné de riz créole ou de pâtes. (Marie Claire, recette parue dans le numéro 88 — préparation 25 min, cuisson 1 h 20. Astuce : préférer un veau élevé sous la mère, plus cher mais incomparable.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/roti-de-veau-au-citron-et-au-gingembre,24107,1191332.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 1.5::numeric, 'kg', 'rôti de longe de veau'),
  (1, 2, '', 'citrons non traités'),
  (2, 3, '', 'oignons moyens'),
  (3, 3, '', 'clous de girofle'),
  (4, 3, 'cm', 'racine de gingembre'),
  (5, 1, '', 'bouquet garni (laurier, thym frais, queues de persil plat)'),
  (6, 10, 'cl', 'vin blanc sec'),
  (7, 3, 'c. à s.', 'huile'),
  (8, 40, 'g', 'sucre'),
  (9, null, '', 'sel'),
  (10, null, '', 'poivre mignonnette')
) as v(pos, qty, unit, name) on true;

-- Nems au jambon blanc
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Nems au jambon blanc', 'https://www.marieclaire.fr/cuisine/nems-au-jambon-blanc,1197141.asp', 4, 'Ébouillanter les germes de soja dans une passoire, égoutter. Couper le jambon en lanières, effeuiller et ciseler grossièrement la coriandre. Couper les feuilles de brick en deux ; au centre de chaque demi-feuille, répartir St Môret, jambon, germes de soja et coriandre, saler, poivrer, parsemer de sésame, rabattre les grands côtés puis rouler en cigare. Chauffer l''huile dans une poêle antiadhésive, dorer les nems 7-8 min en les retournant régulièrement pour qu''ils soient croustillants. Servir très chauds avec la sauce soja en coupelles. (Cuisine et Vins de France pour Marie Claire, recette parue dans le numéro 634 — préparation 30 min, cuisson 10 min. Accord vin : rosé, vin de pays d''Oc. Astuce : ajouter une pincée de piment de Cayenne ou d''Espelette dans la farce pour plus de piquant.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/nems-au-jambon-blanc,1197141.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, 'tranches', 'jambon blanc'),
  (1, 4, 'feuilles', 'brick'),
  (2, 200, 'g', 'germes de soja frais'),
  (3, 150, 'g', 'fromage frais type St Môret'),
  (4, 1, 'c. à s.', 'graines de sésame'),
  (5, 1, '', 'bouquet de coriandre'),
  (6, 10, 'cl', 'huile'),
  (7, 15, 'cl', 'sauce soja douce (type Kikkoman)'),
  (8, null, '', 'sel'),
  (9, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Carpaccio de betteraves, écume de haddock
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Carpaccio de betteraves, écume de haddock', 'https://www.marieclaire.fr/cuisine/carpaccio-de-betteraves-ecume-de-haddock,1206503.asp', 4, 'Préchauffer le four à 180 °C (th. 6). Emballer les betteraves séparément dans du papier alu, enfourner 1 h 30, laisser refroidir dans le papier. Cuire l''œuf dur 10 min à l''eau bouillante, écaler et hacher finement ; peler et hacher finement l''oignon avec les cornichons, réserver cette brunoise. Couper le pain de mie en dés et les dorer à la poêle au beurre, réserver. Ôter la peau du haddock, couper la chair en petits morceaux. Chauffer la crème, ajouter le haddock, mijoter 10 min, puis filtrer pour récupérer une crème parfumée, laisser refroidir. Éplucher les betteraves refroidies, les couper en fines rondelles façon carpaccio, disposer en plat de service. Émulsionner huile et vinaigre avec sel et poivre, arroser le carpaccio. Au moment de servir, entourer de crème de haddock froide, parsemer de la brunoise œuf-cornichon-oignon et de croûtons. Servir aussitôt. (Eric Frechon, Marie Claire, recette parue dans le numéro 144 — préparation 30 min, cuisson 1 h 30. Accord vin : blanc, muscadet-sèvre-et-maine.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/carpaccio-de-betteraves-ecume-de-haddock,1206503.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'betteraves crues de taille moyenne'),
  (1, 200, 'g', 'haddock'),
  (2, 25, 'cl', 'crème liquide'),
  (3, 1, '', 'petit oignon rouge'),
  (4, 1, '', 'œuf'),
  (5, 4, '', 'cornichons'),
  (6, 1, '', 'tranche de pain de mie'),
  (7, 10, 'g', 'beurre'),
  (8, 10, 'cl', 'huile de noix'),
  (9, 2, 'c. à s.', 'vinaigre de vin'),
  (10, null, '', 'sel'),
  (11, null, '', 'poivre')
) as v(pos, qty, unit, name) on true;

-- Saumon fumé, asperges blanches en vinaigrette mimosa
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Saumon fumé, asperges blanches en vinaigrette mimosa', 'https://www.marieclaire.fr/cuisine/saumon-fume-asperges-blanches-en-vinaigrette-mimosa,1193089.asp', 4, 'Éplucher les asperges blanches, casser les queues et égaliser leur longueur, les attacher en botte et cuire 7-8 min à l''eau bouillante salée, puis laisser tiédir à température ambiante. Écaler les œufs durs, mélanger les jaunes avec le persil ciselé et la mayonnaise, saler, poivrer, remettre la préparation dans les blancs (œufs mimosa). Assaisonner les asperges de vinaigre balsamique blanc et d''huile d''olive. Dresser dans les assiettes : asperges, œufs mimosa, crevettes décortiquées, quelques feuilles de jeune pousse de salade et le saumon fumé sur les asperges. Parsemer de cacahuètes grillées, de piment d''Espelette et de fleur de sel. (Rédaction CVF, Marie Claire — préparation 10 min, cuisson 10 min. Astuce : pour une version plus classique, essayer les asperges blanches à la sauce mousseline maison.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/saumon-fume-asperges-blanches-en-vinaigrette-mimosa,1193089.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, 'tranches', 'saumon fumé'),
  (1, 12, '', 'crevettes'),
  (2, 10, 'g', 'cacahuètes grillées'),
  (3, 12, '', 'asperges blanches'),
  (4, 4, '', 'œufs durs'),
  (5, 2, 'c. à s.', 'mayonnaise'),
  (6, 0.5, 'botte', 'persil plat'),
  (7, null, '', 'huile d''olive'),
  (8, null, '', 'vinaigre balsamique blanc'),
  (9, null, '', 'poivre'),
  (10, null, '', 'fleur de sel'),
  (11, null, '', 'piment d''Espelette'),
  (12, null, '', 'jeunes pousses de salade')
) as v(pos, qty, unit, name) on true;

-- Poulet sauté à la citronnelle et au piment
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps, category)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Poulet sauté à la citronnelle et au piment', 'https://www.marieclaire.fr/cuisine/poulet-saute-a-la-citronnelle-et-au-piment,728986.asp', 4, 'Hacher ensemble l''ail, la citronnelle débarrassée de ses couches dures et le piment ; couper l''oignon pelé et le poulet en morceaux. Faire mariner le poulet 30 min avec la moitié du nuoc-mam, le poivre, le cinq-parfums, la moitié du miel, un peu d''huile et la moitié du hachis ail-citronnelle-piment. Dans une poêle bien chaude, saisir le reste du hachis avec l''oignon quelques secondes, ajouter le poulet mariné et cuire en remuant sans cesse ; verser l''eau de coco et laisser cuire 5 min. À part, cuire le reste du hachis avec le reste du nuoc-mam et de miel jusqu''à belle coloration, puis y verser le poulet et bien mélanger. Parsemer de menthe vietnamienne hachée, accompagner de riz blanc ou gluant. (Eric Solal, Marie Claire — préparation 20 min, cuisson 10 min. Astuce : accompagner d''un riz pilaf.)', ''
  from h where not exists (select 1 from recipes where url = 'https://www.marieclaire.fr/cuisine/poulet-saute-a-la-citronnelle-et-au-piment,728986.asp')
  returning id, household_id)
insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)
select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values
  (0, 4::numeric, '', 'cuisses de poulet désossées'),
  (1, 2, '', 'oignons'),
  (2, 3, 'gousses', 'ail'),
  (3, 6, 'tiges', 'citronnelle'),
  (4, 1, '', 'petit piment rouge'),
  (5, 3, 'c. à s.', 'miel'),
  (6, 8, 'c. à s.', 'nuoc-mam'),
  (7, 6, 'c. à s.', 'huile de tournesol'),
  (8, 1, 'c. à c.', 'curcuma'),
  (9, 0.67, 'c. à c.', 'cinq-parfums'),
  (10, 0.67, 'c. à c.', 'poivre'),
  (11, 8, 'c. à s.', 'eau de coco'),
  (12, 20, 'feuilles', 'menthe vietnamienne')
) as v(pos, qty, unit, name) on true;

select count(*) as recettes_evernote from recipes where url like '%marieclaire%' or url like '%.fr%' or url like '%.com%' or url like '%.org%';