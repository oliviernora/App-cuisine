Nouveaux commentaires :

> Statut vérifié le 19/07/2026 (code + documentation + tests) : chaque point
> est annoté « → CORRIGÉ » avec, si besoin, un commentaire. Vérifications du
> jour : 139 tests automatisés verts, schéma réel conforme (16/16 tables),
> parcours réels du 16/07 consignés au cahier de tests (M9, M43-M46, M48-M54).
> Reste à faire côté Olivier : republier la prod pour le lot Résidences
> (`app/mettre-en-ligne.cmd`), puis M47 (iPhone), M48-M50 et M55 sur appareil.

Nous allons un peu modifier la manière dont les écrans et le flow a lieu.
Mets bien à jour les use case au fur et à mesure de mes instructions.
→ FAIT : cas d'utilisation amendés (N1, N3, N8, NP1, NP4) et nouveau cas
N12 « Mes trois maisons » ; suivi dans docs/technique/suivi-cas-utilisation.md.

Menu Stock :
- lorsque l'on cherche un ingrédient dans les stocks, on ne recherche pas par emplacement, mais par ingrédient.
    - supprime l'option emplacement - classe les ingrédients par ordre alphabétique uniquement.
      → CORRIGÉ (lot 1, EN PRODUCTION) : une seule liste alphabétique, plus de vue ni de chips d'emplacement.
    - pour chaque ingrédient, indique la somme de cet ingrédient, dans tous les emplacements
      → CORRIGÉ : le compteur de la ligne est la somme de tous les emplacements (testé).
    - s'il n'y a qu'un emplacement, il est indiqué directement
      → CORRIGÉ : nom de l'emplacement en gris sur la ligne.
    - s'il y a plusieurs emplacements, une petite flèche permet de faire apparaitre les différents endroits où se trouve l'ingrédient et le nombre par endroit
      → CORRIGÉ : « ▸ n emplacements » déplie le détail, avec + / − par endroit (M9 déroulé en réel).
    - s'il ne reste plus d'ingrédient, il n'est rien indiqué dans l'emplacement
      → CORRIGÉ : les emplacements à zéro n'apparaissent pas (testé).
    - le rachat automatique se fait lorsque la somme des ingrédients est inférieur au stock minimum
      → CORRIGÉ : réserve minimum PAR INGRÉDIENT (1 par défaut, réglable dans Modifier), rachat quand la somme passe dessous (2 tests dédiés, M43 déroulé en prod).
- il doit être possible de modifier directement les ingrédients dans cette page, avec un bouton modifier :
    - corriger le nom, et si deux noms correspondont, le fusionner avec un autre
    - supprimer un ingrédient
    - corriger le genre de l'ingrédient
    - modifier la quantité minimale avant recommande
    → CORRIGÉ : crayon ✎ sur chaque ligne → panneau Modifier (renommer avec fusion en deux touches, genre, réserve minimum, suppression). Testé + M43 en prod.
- il ne doit pas être possible de supprimer un ingrédient dans la liste principale sans passer par l'option modifier
  → CORRIGÉ : la poubelle a disparu de la liste principale ; la suppression ne vit que dans le panneau Modifier (deux touches).
- on peut avoir racheté des ingrédients, et les avoir reçus (dans le cadre du use case achat)
    - le rajout des ingrédients se fera dans l'écran inventaire
    → CORRIGÉ (lot 3, décision Q2) : « Ranger les achats » passe les lignes cochées « à mettre en stock » en tête de l'onglet Inventaire — quantité réelle + emplacement confirmés au rangement, lot daté si congélateur. Plus de +1 automatique ; NP4 réglé et testé (M49-M50 à dérouler sur appareil).

Menu d'Inventaires :
- pour la réconciliation d ingrédients, sur l'iPhone on ne voit pas les deux ingrédients si leur nom est trop long sur la ligne - il faudrait pouvoir afficher l'intégralité des deux noms si on clique sur le nom - c'est vrai aussi en pc.
  → CORRIGÉ : toucher la question l'affiche en entier (un second toucher referme). Effet à constater sur iPhone (M47).
- les boutons ne sont pas alignés sur iPhone et sur PC : Gérer et Inventaire ne sont pas alignés
  → CORRIGÉ : alignés sur la même ligne (constaté sur PC ; M47 pour l'iPhone).
- lorsqu on saisit ingrédient sur iPhone on ne voit pas la saisie - elle est cachée par le clavier
  → CORRIGÉ : la barre de saisie remonte au-dessus du clavier virtuel (visualViewport). À confirmer sur iPhone (M47).
- lorsqu'on a fait une saisie d'un ingérdient pour l'inventaire, il doit être possible de corriger la saisie, notamment s'il y a plusieurs variantes ou orthographes
  → CORRIGÉ : toucher une ligne « vue » ouvre « ce n'était pas le bon produit ? » — transfert du comptage sur la bonne variante ou remise à vérifier (testé, M46 déroulé).
- lorsque l'on saisit un ingrédient il faut rechercher les ingrédients qui s'écrivent proches : par exemple "clou de girofle" et "clous de girofle"
  → CORRIGÉ : un alias confirmé est déclaré directement ; une orthographe proche (singulier/pluriel) ouvre le menu de choix — jamais de pari (testé, M45 déroulé en réel).
- sur iPhone, il faut pouvoir arrêter la dictée vocale en appuyant une deuxième fois sur le micro
  → CORRIGÉ : le 2e appui arrête toujours la dictée et traite ce qui a été entendu. À valider sur iPhone (M47).

Menu courses :
- il doit être possible pour les ingrédients qui n'ont pas de lieu de courses de leur définir un lieu
  → CORRIGÉ : crayon ✎ sur chaque ligne, y compris le groupe « Autre » (sans lieu) ; la ligne se reclasse sous son magasin.
- il doit être possible de changer le lieu de course d'un ingrédient, en cliquant sur un bouton modifier
  → CORRIGÉ : même crayon ; le lieu est mémorisé sur l'ingrédient pour les prochaines entrées en courses (testé, M48 à dérouler sur appareil).

Recettes
- par exemple : Gazpacho d'Asperge:
    * La recette recopiée du site ne conserve pas les sauts de ligne entre les étapes, ni les numéros d'étape. Regarde entre la recette en ligne et le texte dans l'appli et trouve un moyen pour conserver la lisibilité du texte en ligne.
      → CORRIGÉ : l'import URL découpe et numérote les étapes comme en ligne (2 tests). La cause du Gazpacho était les fiches extraites d'Evernote : 48 des 56 fiches concernées ont été réparées depuis leur page (GO donné) ; 8 restent en l'état (pages disparues ou sans étapes structurées). M53 vérifié.
    * comment importer la photo ?
      → CORRIGÉ : à l'import URL, la photo annoncée par la page est proposée à la relecture (case cochée d'avance) ; pour une fiche déjà importée, bouton « Récupérer la photo de la page » (M52 vérifié en réel sur le Gazpacho).
- dans le texte de la recette, mettre "ajouter à la wishlist" sous forme d'une étoile à droite de la source, pour économiser uune ligne.
  → CORRIGÉ : ★/☆ à droite de la source, plus de ligne dédiée.
- mettre tous les boutons en bas (ajouter la photo, etc.)
  → CORRIGÉ : tous les boutons regroupés en bas de la fiche.
- attention il y a un doublon : ajouter la photo du plate
  → CORRIGÉ (Q4) : un seul bouton « Ajouter la photo du plat » (rattachée à la réalisation du jour s'il y en a une) ; l'autre bouton est « Photo de la recette (page du livre) », fonction différente.
- en bas mettre la zone "commentaires" juste après la recette, dans toute la largeur. mettre ensuite le bouton "modifier" qui permet de tout modifier (ingrédient, recette, photo). Laisse juste le terme "modifier".
  → CORRIGÉ (Q3) : zone « Commentaires » pleine largeur juste après la recette, commune à toutes les réalisations ; bouton « Modifier » seul terme, en dernier (testé, M51 à l'occasion).
- à quoi sert la date ? à supprimer.
  → CORRIGÉ : le champ date a disparu — « J'ai fait cette recette » consigne au jour même. L'historique des réalisations passées reste affiché en lecture.
- il faut pouvoir importer les photos de plate des URL
  → CORRIGÉ : même mécanisme que ci-dessus (photo du JSON-LD rapatriée par la fonction serveur, rattachée en « Plat »).

Gestion de différentes résidences
- pour la gestion des stocks, des repas, etc., il peut y avoir différentes résidences. Il faudrait pouvoir définir différentes résidences et changer de résidence via un menu déroulant lorsque nécessaire. cela peut se faire via le menu "compte".
- par exemple : argenteuil, oulins, montalivet
- chaque résidence a ses stocks, ses courses, etc.
  → CORRIGÉ (lot 5, décision Q6) : menu déroulant dans « Foyer et compte », choix mémorisé PAR APPAREIL, titre « foyer · résidence », créer/renommer. Stocks, courses, inventaires et semaine par résidence ; recettes, wish list et master list communes au foyer. Migration appliquée, « Argenteuil » (existant) et « Montalivet » créées, bascule vérifiée en réel (M54) ; « Oulins » à créer en un geste. RESTE : republier la prod puis M55 sur place.

Autres remarques :
- sur le PC, on peut élargir encore plus les écrans.
  → CORRIGÉ : largeur de contenu portée à 960 px sur PC (téléphone et tablette inchangés) ; consigné au design guide.
