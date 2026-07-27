Voici mes nouvelles remarques :
- lors de l'ajout au stock, il faut avoir la possibilité de  préciser l emplacement de l'ajout ou de modifier l'emplacement d'un ajout identifié
  → **CORRIGÉ (27/07/2026)** : l'emplacement du dépliant « ⋯ » est retenu d'un ajout à l'autre (décision Olivier : mémoriser le dernier emplacement) et rappelé en gris à côté du bouton « ⋯ ». Pour une ligne existante : bouton « Déplacer » sur chaque emplacement dans le détail « ▸ » de l'ingrédient (fusion automatique si le produit existe déjà à destination).
- pendant l inventaire, il faut pouvoir modifier la saisie d'un ingrédient
  → **CORRIGÉ (27/07/2026)** : toucher le nombre d'une ligne « vue » ouvre la saisie directe de la quantité (Entrée ou sortie du champ valide ; 0 remet la ligne « à vérifier »). Les − / + restent.
- Attention : en saisie vocale, "4 épices" ne doit pas être remplacé par 4 fois épices.
  → **CORRIGÉ (27/07/2026)** : si le texte dicté entier correspond à un ingrédient connu (stock, recettes ou master list — chiffres et traits d'union confondus : « 4 épices » ≡ « Quatre-épices »), le nombre n'est plus consommé. « 2 cumin » marche comme avant.
- Il y a des ingrédients qui sont spécifiques à la cuisine, comme le "nuoc mam" ou le "Ras El Hanout". Comment permettre une saisie vocale de ces ingrédients ?
  → **CORRIGÉ (27/07/2026)** (décision Olivier : rapprochement + alias mémorisés) : la dictée est rapprochée de la master list entière avec tolérance orthographique — au Stock la bonne graphie remplit le champ (« Entendu … → … »), à l'inventaire le menu de choix propose aussi les ingrédients « connus ailleurs ». Une correction confirmée est mémorisée comme alias : la même transcription est reconnue directement les fois suivantes.
- il faut ajouter la possibilité d interrompre un inventaire et de le reprendre.
  → **CORRIGÉ (27/07/2026)** : bouton « Mettre en pause » dans l'inventaire — la liste des emplacements redevient accessible, avec un bandeau « Reprendre l'inventaire de … » et le bouton « Reprendre » sur l'emplacement. Démarrer un inventaire ailleurs pendant une pause demande une confirmation (la pause serait perdue). La pause survit toujours au rechargement (même appareil).
- sur le smartphone, les lignes ont trop de boutons et éléments, et du coup les noms sont tronqués et on ne peut plus les lire.
   --> pour l'écran stock, juste indiquer le nom de l'ingrédient, le nombre et l'emplacement. Lorsque l'on clique sur l'ingrédient, le nom complet de l'ingrédient apparait (l'emplacement disparait pour laisser la place). Une seconde ligne apparait en dessous avec l'emplacement et tous les boutons nécessaires.
  → **CORRIGÉ (27/07/2026)** : appliqué tel que décrit au Stock, et aux Courses (décision Olivier : Stock + Courses) — ligne compacte case + nom + statut, toucher déplie statut + « Je l'ai déjà »/« À acheter » + ✎ lieu + poubelle. Note : le motif s'applique à toutes les largeurs d'écran (PC compris), pour un comportement unique — dites-moi si vous préférez l'ancienne ligne complète sur PC.
- dans le menu inventaire, le menu flottant du bas cache le bas de la page inventaire. on ne peut pas scroller jusqu'en bas.
  → **CORRIGÉ (27/07/2026)** : la page réserve désormais exactement la hauteur réelle de la barre du bas (mesurée en continu, y compris quand l'indice passe sur plusieurs lignes ou que le dépliant « ⋯ » est ouvert) — le bas de page est toujours atteignable, sur tous les onglets.

---
Livraison du 27/07/2026 : 156 tests verts (12 nouveaux), build OK, schéma 16/16 (aucune migration), parcours réels vérifiés sur 5173. Reste : republier (`app/mettre-en-ligne.cmd`) puis M59-M62 sur iPhone (cahier de tests).
