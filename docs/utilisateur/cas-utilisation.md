# Garde-manger — cas d'utilisation

Un cas d'utilisation est un usage du client de bout en bout : il part d'une
situation de la vraie vie, traverse l'application, et se termine quand le
besoin est satisfait. Les cas restent au niveau du besoin (jamais de la
fonctionnalité), en nombre raisonnable ; les cas non passants sont regroupés
en fin de document. Le suivi (validation, couverture) est tenu à part, dans
`docs/technique/suivi-cas-utilisation.md`. Les cas marqués *(proposition)*
attendent la validation d'Olivier.

Règles de fond (décisions Olivier) :
- un produit peut exister dans plusieurs emplacements à la fois ; chaque
  ligne est propre à son emplacement, et l'inventaire de chaque emplacement
  fait foi chez lui ;
- le stock se lit **par ingrédient** : une seule liste alphabétique, la
  somme de tous les emplacements ; le **rachat automatique** se déclenche
  quand cette somme passe **sous la réserve minimum** de l'ingrédient
  (1 par défaut) — jamais emplacement par emplacement (16/07/2026) ;
- les écrans quotidiens restent libres des actions exceptionnelles.

---

# Cas nominaux

## Stocks, courses, inventaires

### N1 — Je cuisine, j'épuise un ingrédient, il revient tout seul

1. En préparant un curry, je vide le pot de cumin. Je le signale à
   l'application en un geste, sans interrompre ma cuisine.
2. S'il ne m'en reste plus **nulle part** (la somme de tous les emplacements
   passe sous ma réserve minimum), le cumin est marqué « à racheter » ; il
   figure sur la liste de courses, classé sous le magasin où je l'achète
   habituellement. S'il m'en reste ailleurs, rien ne se passe.
3. En fin de semaine, je fais mes courses : le cumin m'est proposé au bon
   magasin, je l'achète, je le coche.
4. De retour à la maison, je range mes achats : les produits cochés quittent
   la liste et m'attendent « **à mettre en stock** » en tête de l'onglet
   Inventaire ; pour chacun je vérifie la quantité reçue, je choisis
   l'emplacement (proposé d'après l'existant) et je range — mon stock
   affiche à nouveau du cumin. *(Décision Q2 du 16/07/2026.)*

**Résultat attendu** : à aucun moment je n'ai eu à « penser » au cumin ; le
stock affiché correspond toujours à la réalité de mes placards.

### N2 — Je fais l'inventaire d'un emplacement (dicté par Olivier)

Contexte : la tenue d'un inventaire est fastidieuse — les pots sont dans une
caisse, en vrac.

1. Je **démarre l'inventaire** d'un emplacement : tous les produits qui y
   sont listés passent en statut **« à vérifier »**.
2. Je vide la caisse pot par pot. Chaque fois que je trouve un produit, je le
   **déclare** — à l'oral de préférence, sinon sur l'interface — avec
   éventuellement le nombre :
   - sans la voix, la recherche doit être très facile ;
   - produit inconnu de l'inventaire → il est **créé** ;
   - produit déjà vu pendant cet inventaire → sa quantité **augmente** ;
   - je peux **corriger une erreur**.
3. Dans un **emplacement daté** (voir N7) : quand un produit est identifié,
   l'application propose la liste de ses lots déjà connus avec leur date —
   je valide la date inscrite sur le produit que je tiens — et un bouton
   **« Nouveau »** pour saisir un nouveau lot avec sa date.
4. À la fin, le système me **liste les produits non trouvés** et me demande
   si c'est exact : je confirme (ils passent à zéro) ou je corrige.
5. L'emplacement porte la **date de son dernier inventaire**.

**Résultat attendu** : au fur et à mesure des inventaires, le stock global
tous emplacements évolue, et les achats automatiques suivent.

### N3 — Je prépare mes courses *(reformulé par Olivier)*

1. Je prépare mes courses en **indiquant un produit manquant** que
   l'application n'aurait pas repéré, ou en **prévoyant un ingrédient à
   acheter** (réserve, besoin à venir).
2. J'indique la **quantité** voulue, notamment si j'achète en gros (trois
   pots de cumin en promotion, un carton de conserves) — la quantité
   réellement reçue se confirme au rangement (« à mettre en stock »).
3. Ces produits rejoignent la liste de courses, chacun sous son magasin,
   avec leur quantité ; je peux **définir ou changer le lieu d'achat**
   d'une ligne (crayon) — il est mémorisé pour les prochaines fois
   (16/07/2026).

**Résultat attendu** : la liste de courses combine ce que l'application
détecte toute seule et ce que je décide d'y mettre, quantités comprises.

### N4 — Je fais mes courses dans plusieurs endroits

1. Ma liste de la semaine contient des produits du marché, de Grand Frais et
   d'une boutique spécialisée.
2. Au marché, je vois d'abord les produits du marché ; je coche au fur et à
   mesure. Même chose ensuite chez Grand Frais.
3. **Je peux aussi voir les autres listes si je le veux** : je tombe au
   marché sur un produit prévu pour Grand Frais — je le coche directement.
4. De retour, je range tout : le stock est à jour ; il ne reste sur la liste
   que ce que je n'ai pas trouvé.

**Résultat attendu** : une seule liste, organisée par lieu d'achat mais
jamais cloisonnée, qui survit à une tournée en plusieurs étapes.

### N5 — Nous tenons le stock à plusieurs

1. Pendant que je suis au marché, mon mari finit un pot de crème à la maison
   et le signale.
2. Le produit apparaît sur ma liste de courses pendant mes achats.
3. J'achète la crème, je coche ; à la maison, mon mari voit qu'elle est en
   route.

**Résultat attendu** : chacun agit de son côté, personne n'écrase le travail
de l'autre, tout le monde voit le même état à tout moment.

### N6 — Je réorganise mes rangements et j'y déplace mes produits

1. **Un produit change de place** (le safran part en réserve) : je l'indique
   en un geste ; il garde quantité, magasin et état « à racheter ». S'il
   existe déjà à destination, les pots se regroupent.
2. **Plusieurs produits changent de place** : je les coche dans la liste et
   je les déplace en lot, sans ressaisie.
3. **Une boîte casse**, remplacée par une plus grande : je fusionne deux
   emplacements — les produits se retrouvent dans le nouveau, les doublons
   se regroupent.
4. **Une boîte devient deux plus petites** : je crée le nouvel emplacement
   et j'y déplace les produits concernés (cochés en liste).
5. **Un rangement se déplace ou change de nom** : tous ses produits suivent
   en un geste.

**Résultat attendu** : les rangements de la vraie vie changent souvent ;
l'application suit sans jamais exiger de ressaisir les produits un à un.

### N7 — Les emplacements datés *(proposition)*

1. Un emplacement peut être marqué **« à dates »** : c'est un réglage de
   l'emplacement. Les rangements ordinaires ne suivent pas de dates.
2. Dans un emplacement daté, le stock d'un produit est fait de **lots** :
   un lot = un ou plusieurs produits identiques entrés à la même date
   (quantité par défaut 1, modifiable à l'entrée).
3. **Entrer** un produit crée un lot daté du jour (date modifiable).
   **Sortir** un produit, c'est désigner son lot : le plus ancien m'est
   proposé d'abord, je peux en choisir un autre.
4. **Au quotidien, je vois des quantités simples** — le total par produit ;
   le détail des dates se déroule à la demande (une flèche).
5. Les dates servent à l'inventaire (N2 : je valide la date inscrite sur le
   produit) et à **utiliser en priorité ce qui dort** — rappel des lots
   anciens quand je planifie ma semaine (N10).

**Résultat attendu** : fini les paquets anonymes et les bouteilles sans
âge — des quantités simples au quotidien, les dates quand j'en ai besoin.

*Exemples : je congèle une côte de bœuf → « 1 côte de bœuf » datée
d'aujourd'hui ; trois côtes au fil du temps → l'état affiche « 3 côtes de
bœuf », la flèche montre les trois dates ; j'en prends une → la plus
ancienne est proposée. À la cave, une caisse de 6 bouteilles entre avec sa
date ; quand je bois une bouteille, j'indique sa date.*

## Recettes

### N8 — Je fais une recette et je la consigne *(fusionné par Olivier)*

1. Lorsque je fais une recette, je peux **ajouter son livre ou son site**
   s'il n'existe pas déjà dans ma bibliothèque (un livre : titre, auteur,
   ISBN si disponible, pays, quelques catégories — le titre seul suffit).
2. Je **photographie la recette** (ou PDF, ou URL) : l'IA en extrait titre,
   ingrédients et étapes ; je relis, je corrige, j'enregistre. C'est ma
   copie privée — consultable hors ligne, jamais publique, partagée
   seulement avec le foyer.
3. Je **consigne mes réalisations** d'un geste (« J'ai fait cette
   recette », datée du jour) et j'ajoute la photo du plat ; la recette
   porte tout son historique. Mes **commentaires** (doses, tours de main,
   avis des convives) vivent dans une zone unique de la fiche, commune à
   toutes les réalisations (décision Q3 du 16/07/2026), et je peux amender
   ma copie sans perdre le texte d'origine.
4. En volume : je peux **importer une liste de livres ou de sites** (export
   d'un logiciel de scan de livres, avec ISBN) et **capturer des recettes
   par lot** (scan de plusieurs pages d'un livre).

**Résultat attendu** : faire une recette et la consigner est un seul geste
naturel ; la bibliothèque se construit au fil de l'eau ou par imports.

### N9 — Je retrouve une recette

1. « C'était quoi ce plat brésilien fait cet hiver ? » : je cherche par mot,
   ingrédient, pays, livre, ou date de réalisation.
2. Depuis une recette : sa source, ses dates, mes notes, sa photo.

## Semaine

### N10 — Je planifie ma semaine *(fusionné par Olivier : recettes, courses et planning ensemble)*

1. Je pose les événements : dîner maison mardi (4 personnes), repas de
   l'association samedi (20 personnes, halal, pas épicé), pique-nique
   dimanche.
2. J'associe les recettes — bibliothèque, wish list, ou nouveauté. La
   semaine se lit d'un coup d'œil : jours, plats, convives, contraintes.
3. Les quantités suivent toutes seules le nombre de convives ; je modère à
   la main ou en pourcentage (gros appétits, plat riche parmi d'autres).
4. **Je vérifie ma liste de courses** : ce qui manque par rapport à mon
   stock s'y ajoute en un geste ; les lots anciens du congélateur me sont
   rappelés (N7).
5. **Je planifie mes courses** : à ma demande, l'application propose les
   tournées de la semaine d'après les créneaux de mes magasins
   (`creneaux-courses.md`) — marché samedi matin, commande Internet à J-7.
   J'ajuste, je valide ; à terme, les sorties vont dans mon agenda Google.
   Le jour venu, la liste du magasin est prête (N4).

**Résultat attendu** : le menu est posé une fois, visible par le foyer ; la
liste et le planning de courses en découlent sans calcul mental ; aucune
tournée oubliée, les commandes Internet passées assez tôt.

### N11 — La wish list et le beau produit *(proposition)*

1. Je garde une wish list de recettes à faire un jour ; elles signalent
   leurs **ingrédients difficiles à sourcer**, à commander à l'avance.
2. Au marché, un beau turbot : je cherche dans la wish list les recettes qui
   conviennent à ce produit, et je décide en connaissance.
3. La recette choisie rejoint la semaine ; ses manquants, la liste de
   courses.

**Résultat attendu** : le beau produit imprévu trouve sa recette, et les
ingrédients rares sont commandés à temps.

---

# Cas non passants *(non revus par Olivier à ce stade)*

### NP1 — J'ai demandé de commander un produit… et je le retrouve dans mes réserves

1. Le cumin est à zéro partout, il est en liste de courses ; j'en retrouve
   un pot non enregistré dans la réserve de l'entrée.
2. Je range le pot retrouvé avec « + » (dans le détail des emplacements) :
   la somme remonte, la ligne de courses se retire toute seule.
3. Je peux aussi simplement retirer le cumin de la liste : il n'y revient
   pas tout seul, et côté stock il s'affiche « manquant — à ajouter au
   panier » (un appui l'y remettrait ; le retour automatique se réarme quand
   le stock remonte). *(Décision Olivier ; niveau ingrédient depuis le
   16/07/2026.)*

### NP2 — Le produit est introuvable (rupture en magasin)

Je ne le coche pas ; il reste sur la liste pour ma prochaine tournée, sans
manipulation.

### NP3 — J'ai coché par erreur

Je décoche : rien d'autre ne doit avoir changé, ni sur la liste ni au stock.

### NP4 — J'ai acheté plusieurs pots d'un coup

Trois pots de cumin en promotion : en rangeant mes achats, mon stock doit
indiquer trois pots.

### NP5 — Pas de réseau au marché

Je dois quand même pouvoir consulter ma liste et cocher mes achats, quitte à
ce que la synchronisation attende le retour du réseau.

### NP6 — Je suis interrompu en plein inventaire

On sonne à la porte ; je reviens une heure plus tard : l'inventaire est
toujours « en cours », rien n'est perdu. Je peux aussi l'abandonner : tout
revient à l'état d'avant. **Un inventaire interrompu ne produit jamais un
stock à moitié faux.**

### NP8 — Un produit s'ajoute après la validation du planning de courses *(proposition)*

Il rejoint la bonne tournée s'il en reste une dans la semaine ; sinon,
l'application me le signale.

### NP9 — L'extraction IA se trompe *(proposition)*

La lecture automatique n'est jamais enregistrée sans ma relecture, et la
photo d'origine reste jointe.

### NP10 — Je veux la recette là où le livre n'est pas *(proposition)*

Dans la maison B sans le livre, ou sans réseau : ma copie privée reste
consultable.

### NP11 — Je m'apprête à refaire une recette déjà faite cette année *(proposition)*

Je ne refais jamais deux fois la même recette dans l'année : la date de
dernière réalisation est bien visible quand je consulte une recette.

### NP12 — Le nombre de convives change à la veille *(proposition)*

20 → 25 : les quantités se recalculent, la liste s'ajuste pour ce qui n'est
pas acheté, et ce qui l'est déjà m'est signalé pour compléter.

### NP13 — Une contrainte apparaît au dernier moment *(proposition)*

Un convive végétarien s'annonce : je vois si le menu convient, et je trouve
un remplacement dans la wish list filtrée par contrainte.

*(NP7 : numéro retiré — signalement croisé pendant l'inventaire, refusé par
Olivier.)*
