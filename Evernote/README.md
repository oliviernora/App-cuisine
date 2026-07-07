# Base de recettes Evernote — réutilisable

Extraction de l'export `Recettes.enex` (371 notes, 2015-2026), pensée pour
être réutilisée dans n'importe quel projet, indépendamment de l'application
garde-manger.

## Le fichier principal : `recettes-data.json`

Un tableau JSON, une entrée par recette :

| Champ | Contenu |
|---|---|
| `id` | identifiant stable `NNN-slug` (NNN = ordre dans l'export) |
| `title` | titre de la recette |
| `url` | page d'origine (vide pour une recette perso) |
| `source` | nom lisible de la source (« Marie Claire — Cuisine », « Recettes perso »…) |
| `capturedOn` | date de capture dans Evernote (AAAA-MM-JJ) |
| `servings` | « pour N personnes » (null si inconnu) |
| `ingredients` | liste ordonnée de `{ qty, unit, name }` (qty null = non précisée) |
| `steps` | recette condensée et reformulée (copie privée — jamais le texte original) |
| `photos` | chemins relatifs vers les images extraites (`photos/<id>/…`) |

## Les autres fichiers

- `inventaire.json` — les 371 notes (titre, url, date, type web/perso/scan,
  douteuse ou non). Généré par `app/scripts/extract-enex.mjs`.
- `tri.md` — le tri à valider (notes douteuses cochées par Olivier).
- `textes/` (hors git) — texte brut de chaque note.
- `photos/` (hors git) — 914 images > 25 Ko, classées par note.
- `lots/`, `fiches/` — fichiers de travail de l'extraction par lots.
- `import.sql` — import idempotent dans la base Supabase de l'application
  (rejouable, dédoublonnage par URL). Généré par `app/scripts/enex-merge.mjs`.

## Rejouer le pipeline

```
node app/scripts/extract-enex.mjs   # .enex → inventaire, textes, photos, tri
node app/scripts/enex-lots.mjs      # notes retenues → lots à extraire
# (extraction des fiches par lots, en session : Evernote/fiches/lot-NN.json)
node app/scripts/enex-merge.mjs     # fiches → recettes-data.json + import.sql
```
