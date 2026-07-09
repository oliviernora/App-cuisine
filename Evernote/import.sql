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
  ('Le Monde — Cuisine')
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

select count(*) as recettes_evernote from recipes where url like '%marieclaire%' or url like '%.fr%' or url like '%.com%' or url like '%.org%';