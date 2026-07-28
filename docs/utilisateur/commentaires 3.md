Nouveaux commentaires :

Dans les cas d'utilisation, nous allons faire une modification importante liée aux courses :
- lorsque je prépare les courses, les ingrédients sont ajoutés au fur et à mesure dans les courses
    * ils peuvent provenir de stocks vides
    * ils peuvent provenir des recettes de la semaine
    * ils peuvent être ajoutés à la main
- pendant les courses, je peux cocher les ingrédients que j'ai achetés.
    * il doit être possible d'annuler la coche d'un élément
    * on doit voir les ingrédients à acheter au dessus, et ceux déjà achetés en dessous
    * le fonctionnement est similaire à "To Do" de microsoft
- lorsque je reviens des courses, il faut un écran pour ranger les courses
    * pour chaque ingrédient acheté, je commence à saisir le nom ou bien je le dicte à la voix
    * s'il fait partie de la liste des courses, j'affiche les ingrédients possibles pour que je puisse choisir le bon ingrédient
          exemple : "huile" m'affiche "huile d'olive" et "huile de tournesol" si les deux sont dans ma liste de course
    * s'il ne fait pas partie de la liste de courses, c'est un nouvel ingrédient
    * je choisi pour chaque ingrédient l'emplacement, et je peux modifier la quantité.
    * par défaut, si l'ingrédient est connu, l'emplacement est le précédent connu

Pour la gestion des ingrédients, il y a deux solutions :
- je peux gérer les ingrédients dans leur ensemble depuis l'écran "stocks"
- je peux visualiser les ingrédients présents dans un inventaire, et modifier ces ingrédients si besoin :
    * pour les inventaires, je peux faire un inventaire, ou visualiser l'inventaire et le gérer
    * gérer l'inventaire : ajouter ou retirer des ingrédients, les mettre dans les courses à faire, modifier le nom, la typologie, etc. de l'ingrédient
- en fait la liste des ingrédients est accessible de deux manières :
    * via l'écran de stock
    * via l'écran d'inventaire
- dans tous les cas, on arrive sur la même liste avec la possibilité de gérer les ingrédients.

Pour les cas d'utilisation, je voudrais un écran d'accueil avec des icônes pour les différentes use cases :
- gérer les ingrédients
- faire les courses
- préparer la semaine
- gérer les recettes
- gérer les  inventaires
pour chaque use case, il y a différents étapes :
- gérer les ingrédients :
    * rechercher un ingrédient, et éventuellement marquer qu'il est utilisé ou non
    * modifier un ingrédient - modifier son nom, son emplacement, etc.
    * ajouter un ingrédient nouveau, éventuellement avec un stock à zéro et marqué à acheter dans les courses
- gérer les courses :
    * planifier les courses
    * effectuer les courses
    * ranger les courses
- préparer la semaine :
    * planifier la semaine
    * marquer les plats faits et ajouter les photos
- gérer les recettes
    * rechercher une recette, et l'ajouter en favori ou dans la semaine en cours
    * modifier une recette
    * créer une recette via l'appareil photo ou une photo ou un pdf, via une URL, via une saisie texte direct
- gérer les inventaires :
    * faire l'inventaire d'un emplacement
    * gérer le stock dans un emplacement
    * modifier un emplacement, changer son nom, etc.

Peux tu modifier le fichier cas d'utilisation pour refléter cette approche :
- il y a de grandes familles de cas d'utilisation
- au sein de ces familles il y a des use case individuels