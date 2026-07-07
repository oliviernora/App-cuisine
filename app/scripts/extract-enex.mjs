/**
 * Inventaire et tri de l'export Evernote « Recettes.enex » (décisions Olivier
 * 07/07/2026). Produit dans le dossier « Evernote/ » du projet :
 *   - inventaire.json : une entrée par note (titre, url, date, type, douteux)
 *   - tri.md          : synthèse lisible, avec la liste des douteux à valider
 *   - textes/NNN-slug.txt : le texte de chaque note (pour l'extraction des fiches)
 *   - photos/NNN-slug/    : les images de plus de 25 Ko (photos de plats)
 * Rejouable : écrase ses sorties, ne touche à rien d'autre.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ENEX = join(ROOT, 'Recettes.enex')
const OUT = join(ROOT, 'Evernote')

const xml = readFileSync(ENEX, 'utf8')

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(n))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}

function field(note, tag) {
  const m = note.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))
  return m ? decodeEntities(m[1]) : ''
}

/** ENML → texte brut : balises enlevées, blancs normalisés. */
function toText(enml) {
  return decodeEntities(enml
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br[^>]*>|<\/(p|div|li|h\d|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function slug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'sans-titre'
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }

mkdirSync(join(OUT, 'textes'), { recursive: true })
mkdirSync(join(OUT, 'photos'), { recursive: true })

const notes = []
let pos = 0, num = 0
while (true) {
  const start = xml.indexOf('<note>', pos)
  if (start === -1) break
  const end = xml.indexOf('</note>', start)
  const note = xml.slice(start, end)
  pos = end + 7
  num++

  const title = field(note, 'title') || 'Note sans titre'
  const created = field(note, 'created').slice(0, 8)
  const sourceUrl = field(note, 'source-url')
  const cdata = note.match(/<content>\s*<!\[CDATA\[([\s\S]*?)\]\]>/)
  const text = cdata ? toText(cdata[1]) : ''
  const id = String(num).padStart(3, '0') + '-' + slug(title)

  // Photos et PDF : ressources de plus de 25 Ko (les vignettes et icônes de page sont ignorées)
  let photos = 0
  for (const res of note.matchAll(/<resource>([\s\S]*?)<\/resource>/g)) {
    const mime = field(res[1], 'mime')
    const ext = EXT[mime]
    if (!ext) continue
    const data = res[1].match(/<data[^>]*>([\s\S]*?)<\/data>/)
    if (!data) continue
    const buf = Buffer.from(data[1].replace(/\s/g, ''), 'base64')
    if (buf.length < 25_000) continue
    if (photos === 0) mkdirSync(join(OUT, 'photos', id), { recursive: true })
    photos++
    writeFileSync(join(OUT, 'photos', id, `${photos}.${ext}`), buf)
  }

  writeFileSync(join(OUT, 'textes', id + '.txt'),
    `${title}\n${sourceUrl}\ncréée le ${created}\n\n${text}`)

  const hasIngredients = /ingr[eé]dient|(\d+\s?(g|kg|cl|ml)\b[\s\S]{0,40}){3}/i.test(text)
  // Scannable : la « source-url » est un cache Evernote (en-cache://) → photo(s) sans texte.
  const isScan = sourceUrl.startsWith('en-cache://') || /^scanner\b/i.test(title)
  const webUrl = isScan ? '' : sourceUrl
  const type = isScan ? 'scan' : webUrl ? 'web' : 'perso'
  // Une capture web titrée « Recette … » sans ingrédients est juste incomplète :
  // la page sera rechargée depuis son URL au moment de l'extraction.
  const incomplete = type === 'web' && !hasIngredients && /^recette\b/i.test(title)
  notes.push({ id, title, created, url: webUrl, type, photos, chars: text.length,
    incomplete, douteux: !hasIngredients && !incomplete && type !== 'scan' })
}

writeFileSync(join(OUT, 'inventaire.json'), JSON.stringify(notes, null, 1))

const parType = Object.groupBy(notes, n => n.type)
const douteux = notes.filter(n => n.douteux)
const domaine = u => { try { return new URL(u).hostname.replace('www.', '') } catch { return '?' } }
const lignes = [
  '# Tri de l\'export Evernote — à valider par Olivier', '',
  `${notes.length} notes : ${parType.web?.length ?? 0} captures web, ` +
  `${parType.perso?.length ?? 0} notes perso, ${parType.scan?.length ?? 0} scans (photos seules).`, '',
  `## Douteuses — ${douteux.length} notes à trancher`,
  'Cocher ce qui doit quand même être importé ; le reste sera écarté.', '',
  ...douteux.map(n => `- [ ] ${n.title}${n.url ? ' — ' + domaine(n.url) : ''} (${n.type}, ${n.created})`), '',
  `## Captures web incomplètes — ${notes.filter(n => n.incomplete).length} (rechargées depuis leur URL à l'extraction, rien à faire)`,
  ...notes.filter(n => n.incomplete).map(n => `- ${n.title} — ${domaine(n.url)}`), '',
  `## Recettes perso retenues — ${(parType.perso ?? []).filter(n => !n.douteux).length}`,
  ...(parType.perso ?? []).filter(n => !n.douteux).map(n => `- ${n.title} (${n.created})`), '',
  `## Scans (photos seules) — ${(parType.scan ?? []).length} : passeront par l'extraction photo (OCR), photos déjà dans Evernote/photos/`,
  ...(parType.scan ?? []).map(n => `- ${n.title} (${n.created}, ${n.photos} photo${n.photos > 1 ? 's' : ''})`)
]
writeFileSync(join(OUT, 'tri.md'), lignes.join('\n'))

console.log(`${notes.length} notes lues — ${douteux.length} douteuses`)
console.log(`photos extraites dans ${notes.reduce((s, n) => s + n.photos, 0)} fichiers`)
console.log('sorties : Evernote/inventaire.json, tri.md, textes/, photos/')
