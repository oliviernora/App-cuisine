-- Import Evernote (généré par enex-merge.mjs — rejouable, aucun doublon).
with h as (select id from households limit 1)
insert into sources (household_id, kind, title)
select h.id, 'site', v.title from h cross join (values
  ('Marie Claire — Cuisine'),
  ('Papilles et Pupilles'),
  ('Recettes perso'),
  ('aufouraumoulin.com'),
  ('L''Atelier des Chefs'),
  ('healthyfoodcreation.fr'),
  ('recettes-de-clairette.overblog.com')
) as v(title)
where not exists (select 1 from sources s where s.title = v.title);

-- Salade de poulet aux herbes
with h as (select id from households limit 1),
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Salade de poulet aux herbes', 'https://www.marieclaire.fr/cuisine/salade-de-poulet-aux-herbes,1444800.asp', 4, 'Réchauffer le poulet cuit 15 min au four à 180 °C. Pendant ce temps, peler les oignons nouveaux, les rincer et sécher avec le persil et la coriandre, ciseler finement le tout ; mettre dans un saladier avec l''huile, le jus du citron vert et le vinaigre. Le poulet encore chaud : ôter la peau, émietter grossièrement la chair, mélanger au saladier. Servir tiède ou froid. (Suzy Palatin — recette créole ; en saison, ajouter tomates, aubergines ou courgettes. Préparation 15 min, cuisson 15 min.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Papilles et Pupilles'), 'Maquereaux à la plancha', 'https://www.papillesetpupilles.fr/2019/06/maquereaux-a-la-plancha.html/', 4, 'Vider les maquereaux et faire 4 incisions parallèles dans la partie charnue de chaque poisson. Les mariner 45 min au frais dans huile d''olive + vin blanc + fenouil + genièvre + laurier + citron. Sur la plancha chaude, étaler une poignée de gros sel (il tempère la chaleur), y dorer les maquereaux 4-5 min par face. Piment d''Espelette et servir aussitôt. Attention : ne pas retourner dans le gros sel (avis lecteur). (Papilles et Pupilles — préparation 15 min, cuisson 10 min.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pâte à crêpes traditionnelle', 'https://www.marieclaire.fr/cuisine/pate-a-crepes,24127,1192363.asp', 4, 'Pour une vingtaine de crêpes fines. Tamiser la farine en puits, délayer avec la moitié du lait. Ajouter les œufs battus, puis le beurre fondu et une pincée de sel ; verser le reste du lait en remuant jusqu''à pâte lisse. Repos 2 h (ou lait chaud / robot pour diviser par deux). Cuire à la poêle à fond épais graissée, petite louche inclinée pour étaler. Sucre glace en empilant. (Marie Claire — préparation 15 min, cuisson 40 min, repos 2 h.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Recettes perso'), 'Crêpes de sarrasin (recette perso)', '', null, 'Bilic pas trop liquide. Version sucrée : 350 g froment, 70 g blé noir, 4 œufs, sel, 70 g sucre. (Note perso Evernote du 17/10/2024, transcrite telle quelle.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Dal indien', 'https://www.marieclaire.fr/cuisine/dal-indien,1201655.asp', 6, 'Monder et couper la tomate en dés ; épépiner et hacher finement les piments ; émincer échalotes et ail. Rincer les lentilles, les tremper 30 min, égoutter. Bouillir 1 l d''eau avec curcuma, cumin et échalotes ; y cuire les lentilles 30 min à frémissement, puis ajouter tomate et piments et poursuivre 45 min jusqu''à ce qu''elles s''écrasent (rallonger d''eau au besoin). Remuer hors du feu en soupe épaisse. Tempérage final : graines de moutarde, ail et feuilles de cari revenus au beurre à feu vif, versés sur les lentilles ; saler, servir chaud parsemé de coriandre — avec riz basmati ou naan. (Marie Claire — préparation 30 min, cuisson 1 h 15.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'aufouraumoulin.com'), 'Velouté glacé à la courgette et au lait de coco', 'https://www.aufouraumoulin.com/veloute-glace-a-la-courgette/', 4, 'Faire revenir l''oignon émincé 5-8 min à l''huile d''olive, ajouter l''ail écrasé. Ajouter les courgettes en tronçons, couvrir d''eau bouillante, saler, cuire 10-12 min à couvert. Retirer 2-3 louches de bouillon (pour ajuster ensuite), ajouter le lait de coco (ou ribot) et mixer finement — un peu plus liquide que voulu, la soupe épaissit en refroidissant. Mixer avec les herbes, réfrigérer au moins 1 h. La version coco se mange aussi chaude ; pas la version ribot. (Au four au moulin — 28 min en tout.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Dal de lentilles corail à l''indienne', 'https://www.marieclaire.fr/cuisine/recette-de-dal-de-lentilles-indien,1212481.asp', 4, 'Cuire les lentilles couvertes d''eau : ébullition, écumer, puis 20 min à petit feu jusqu''à consistance crémeuse. À côté, faire revenir l''oignon en dés 5 min dans 1 c. à s. d''huile, ajouter tomate en dés et gingembre 3 min, puis le curcuma, puis les épinards 5 min ; verser le tout dans le dal et mijoter quelques minutes, saler. Finition : chauffer 1 c. à s. d''huile avec cumin et ail 30 s jusqu''au crépitement, verser sur le dal, couvrir et laisser infuser. Servir bien chaud, avec naans. (Marie Claire — préparation 15 min, cuisson 30 min.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'L''Atelier des Chefs'), 'La bouillabaisse marseillaise traditionnelle', 'https://www.atelierdeschefs.fr/recettes/13554/la-bouillabaisse-marseillaise-traditionnelle/', 6, 'Soupe : faire revenir doucement poireaux, oignon, ail écrasé et tomates concassées dans l''huile avec laurier, écorce d''orange et piment, 15 min ; ajouter les poissons de roche (non écaillés, rincés), colorer 15 min ; couvrir de 3 l d''eau bouillante, frémir 10 min ; retirer fenouil et écorce, passer au presse-purée puis au chinois ; safran, assaisonner. Rouille : moutarde + jaunes, ail haché, monter avec 25 cl d''huile d''olive ; croûtons grillés frottés d''ail. Service : cuire les pommes de terre en gros dés 30 min dans moitié fond de poisson moitié eau ; pocher les poissons en tronçons dans le fond bouillant, 6-10 min à feu doux en commençant par les chairs fermes. Poissons sur pommes de terre, bouillon versé sur les croûtons en soupière. « Quand ça boue, on baisse ! » (L''Atelier des Chefs — préparation 1 h, cuisson 1 h 30.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'healthyfoodcreation.fr'), 'Gaufres saines sans sucre ni matières grasses', 'https://www.healthyfoodcreation.fr/gaufres-saines/', null, 'Préchauffer le gaufrier. Mélanger œufs, compote et la moitié du lait ; ajouter farine, levure, sel, puis le reste du lait. Plaques chaudes légèrement huilées si besoin, cuire 2-3 min. Se congèle. (healthyfoodcreation — préparation 5 min ; la compote peut être remplacée par une petite banane bien mûre.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'Marie Claire — Cuisine'), 'Pavés de cabillaud aux lentilles', 'https://www.marieclaire.fr/cuisine/paves-de-cabillaud-aux-lentilles,1194511.asp', 6, 'Cuire les lentilles avec oignon émincé, carotte en dés et bouquet garni, largement couvertes d''eau froide peu calcaire : ébullition puis 45 min à frémissement. 10 min avant la fin, dorer le bacon à sec, égoutter. Dans la même poêle, saisir les pavés 2 min par face dans 1 c. d''huile, puis 5 min à feu doux, sel, poivre. Vinaigrette (sel, poivre, Xérès, reste d''huile) sur les lentilles égouttées ; poser cabillaud et bacon dessus, servir aussitôt. Astuce : chair plus ferme si les pavés dégorgent 1 h au gros sel puis rincés. (Marie Claire — préparation 20 min, cuisson 45 min.)'
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
r as (insert into recipes (household_id, source_id, title, url, servings, steps)
  select h.id, (select id from sources where title = 'recettes-de-clairette.overblog.com'), 'Gaufres de pomme de terre', 'https://recettes-de-clairette.overblog.com/2021/12/gaufres-de-pomme-de-terre.html', 4, 'Éplucher et râper finement les pommes de terre ; hacher l''ail dégermé, ciseler le persil. Tout mélanger avec farine et œuf, bien saler, poivrer. Gaufrier chaud huilé : cuire jusqu''à belle dorure (5 min et plus), réserver au chaud. Servir avec salade verte ou poêlée de champignons. Se prépare la veille : réchauffer 10 min au four à 200 °C. Environ 8 petites gaufres. (Recettes de Clairette.)'
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

select count(*) as recettes_evernote from recipes where url like '%marieclaire%' or url like '%.fr%' or url like '%.com%' or url like '%.org%';