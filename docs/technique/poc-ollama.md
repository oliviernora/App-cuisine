# POC A2 — extraction de recettes par IA locale (Ollama)

POC du 10/07/2026 (plan « Import de recettes — plan IA locale », incrément
A2). Objectif : juger sur pièces si un modèle à vision local sur le PC
d'Olivier (Legion i9, RTX 5070 Laptop, 8 Go de VRAM) sait transformer la
photo d'une page de livre ou de magazine en fiche structurée. Script
rejouable : `app/scripts/poc-extract-ollama.mjs`.

## Photos de test (vraies captures d'Olivier, dossier Evernote/)

- `photos/039-note/2.png` — colonne de magazine « Chaudrée du potager »
  (texte parasite d'autres articles autour).
- `photos/348-poulet-aux-noix-de-cajou/1.png + 2.png` — double page du
  livre chinois (ingrédients avec fractions ½ et 1½, étapes) envoyée en
  une seule requête.

Images réduites à 1600 px (JPEG 85) avant envoi — comme la compression
photo déjà en place dans l'app. En pleine résolution (3200 px), le temps
explose (> 6 min).

## Verdict : qwen3-vl:4b-instruct

| Modèle | Magazine (1 image) | Qualité | Livre (2 images) |
|---|---|---|---|
| **qwen3-vl:4b-instruct** | **33 s** | **titre exact, 9/9 ingrédients, étapes fidèles ; 1 confusion (« bouteille d'asperges »), dernière phrase omise** | **61 s — 13 ingrédients, fractions ½/1½ intactes, étapes quasi verbatim ; titre pris en chinois, « riz vapeur (p. 540) » omis** |
| qwen3-vl:8b | 380 s (déborde sur CPU) | équivalente | non testé (trop lent) |
| qwen3-vl:4b (thinking) | 235 s (réflexion + 16k ctx sur CPU) | équivalente + remarque du chef captée | non testé |
| gemma3:4b | 27 s | fautes de lecture (« décoriées », « poire à Domfrontais », « fierier ») | non testé |
| qwen2.5vl:3b | 65 s | lecture parfaite mais structuration ratée (tout dans « quantité ») | non testé |

Le modèle n'invente pas : « personnes » absent de la page → 0. Les défauts
constatés (choix du titre, ligne d'accompagnement omise, accents) sont
exactement ce que l'écran de relecture obligatoire rattrape.

## Réglages retenus (pour l'incrément A3)

- Modèle : `qwen3-vl:4b-instruct` (~3,4 Go, tient ENTIÈREMENT dans les
  8 Go de VRAM — c'est la clé de la vitesse).
- API : `POST localhost:11434/api/chat`, `stream: false`,
  `format: <schéma JSON>`, `options: { temperature: 0, num_ctx: 8192,
  num_predict: 4096 }`.
- Schéma JSON : titre, personnes (integer), ingredients[]
  (quantite/unite/nom en string), etapes[], remarques.

## Pièges découverts (à ne pas redécouvrir)

1. **Pas de types union dans le schéma** (`["string","null"]`) : le
   convertisseur de grammaire d'Ollama 0.30 les digère mal — la
   génération part en boucle d'espaces et la connexion est coupée en
   plein flux (`done: false`, JSON tronqué). Types simples partout,
   `""`/`0` pour « absent ».
2. **qwen3-vl (tags par défaut) réfléchit** et `think: false` est ignoré
   avec `format` : la réflexion mange tout le `num_predict` et il ne sort
   jamais de JSON. Prendre la variante **`-instruct`**.
3. **num_ctx 16384 fait déborder le modèle sur le CPU** (~2,5 tok/s au
   lieu de ~50). Rester à 8192, ce qui suffit pour 2 images à 1600 px
   (~3 500 tokens) + la réponse.
4. **Ne pas utiliser `ollama run` dans un shell sans terminal** (il
   attend stdin) ni `fetch` de Node sans régler les timeouts undici
   (coupure à 5 min) : passer par `node:http` ou régler le client.
5. Le premier appel charge le modèle (~1 min) ; ensuite il reste en
   mémoire 5 min (`keep_alive`).
