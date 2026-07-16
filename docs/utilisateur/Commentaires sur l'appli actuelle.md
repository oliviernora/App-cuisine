Nouveaux commentaires :

Nous allons un peu modifier la manière dont les écrans et le flow a lieu.
Mets bien à jour les use case au fur et à mesure de mes instructions.

Menu Stock :
- lorsque l'on cherche un ingrédient dans les stocks, on ne recherche pas par emplacement, mais par ingrédient.
    - supprime l'option emplacement - classe les ingrédients par ordre alphabétique uniquement.
    - pour chaque ingrédient, indique la somme de cet ingrédient, dans tous les emplacements
    - s'il n'y a qu'un emplacement, il est indiqué directement
    - s'il y a plusieurs emplacements, une petite flèche permet de faire apparaitre les différents endroits où se trouve l'ingrédient et le nombre par endroit
    - s'il ne reste plus d'ingrédient, il n'est rien indiqué dans l'emplacement
    - le rachat automatique se fait lorsque la somme des ingrédients est inférieur au stock minimum
- il doit être possible de modifier directement les ingrédients dans cette page, avec un bouton modifier :
    - corriger le nom, et si deux noms correspondont, le fusionner avec un autre
    - supprimer un ingrédient
    - corriger le genre de l'ingrédient
    - modifier la quantité minimale avant recommande
- il ne doit pas être possible de supprimer un ingrédient dans la liste principale sans passer par l'option modifier
- on peut avoir racheté des ingrédients, et les avoir reçus (dans le cadre du use case achat)
    - le rajout des ingrédients se fera dans l'écran inventaire

Menu d'Inventaires :
- pour la réconciliation d ingrédients, sur l'iPhone on ne voit pas les deux ingrédients si leur nom est trop long sur la ligne - il faudrait pouvoir afficher l'intégralité des deux noms si on clique sur le nom - c'est vrai aussi en pc. 
- les boutons ne sont pas alignés sur iPhone et sur PC : Gérer et Inventaire ne sont pas alignés
- lorsqu on saisit ingrédient sur iPhone on ne voit pas la saisie - elle est cachée par le clavier
- lorsqu'on a fait une saisie d'un ingérdient pour l'inventaire, il doit être possible de corriger la saisie, notamment s'il y a plusieurs variantes ou orthographes
- lorsque l'on saisit un ingrédient il faut rechercher les ingrédients qui s'écrivent proches : par exemple "clou de girofle" et "clous de girofle"
- sur iPhone, il faut pouvoir arrêter la dictée vocale en appuyant une deuxième fois sur le micro

Menu courses :
- il doit être possible pour les ingrédients qui n'ont pas de lieu de courses de leur définir un lieu
- il doit être possible de changer le lieu de course d'un ingrédient, en cliquant sur un bouton modifier

Recettes
- par exemple : Gazpacho d'Asperge: 
    * La recette recopiée du site ne conserve pas les sauts de ligne entre les étapes, ni les numéros d'étape. Regarde entre la recette en ligne et le texte dans l'appli et trouve un moyen pour conserver la lisibilité du texte en ligne.
    * comment importer la photo ?
- dans le texte de la recette, mettre "ajouter à la wishlist" sous forme d'une étoile à droite de la source, pour économiser uune ligne.
- mettre tous les boutons en bas (ajouter la photo, etc.)
- attention il y a un doublon : ajouter la photo du plate
- en bas mettre la zone "commentaires" juste après la recette, dans toute la largeur. mettre ensuite le bouton "modifier" qui permet de tout modifier (ingrédient, recette, photo). Laisse juste le terme "modifier". 
- à quoi sert la date ? à supprimer.
- il faut pouvoir importer les photos de plate des URL
- dans le menu "sources"

Gestion de différentes résidences
- pour la gestion des stocks, des repas, etc., il peut y avoir différentes résidences. Il faudrait pouvoir définir différentes résidences et changer de résidence via un menu déroulant lorsque nécessaire. cela peut se faire via le menu "compte".
- par exemple : argenteuil, oulins, montalivet
- chaque résidence a ses stocks, ses courses, etc.

Autres remarques :
- sur le PC, on peut élargir encore plus les écrans.
