/**
 * Livres par ISBN (N15) : validation du code saisi ou scanné, et recherche
 * de la fiche du livre sur le web — Google Books, puis Open Library, puis
 * le catalogue de la BnF (fort sur l'édition française, mais sans photo de
 * couverture). Les trois services répondent au navigateur sans clé.
 */

/** Normalise une saisie d'ISBN (espaces, tirets) et vérifie sa clé.
 * Accepte l'ISBN-13 (le code-barres EAN des livres) et l'ISBN-10 des
 * livres anciens (converti en 13). Renvoie 13 chiffres, ou null. */
export function normalizeIsbn(text) {
  const raw = String(text ?? '').replace(/[\s-]/g, '').toUpperCase()
  if (/^97[89]\d{10}$/.test(raw)) return key13(raw.slice(0, 12)) === raw[12] ? raw : null
  if (/^\d{9}[\dX]$/.test(raw)) {
    const sum = [...raw].reduce((acc, c, i) => acc + (c === 'X' ? 10 : Number(c)) * (10 - i), 0)
    if (sum % 11 !== 0) return null
    const base = '978' + raw.slice(0, 9)
    return base + key13(base)
  }
  return null
}

function key13(d12) {
  const sum = [...d12].reduce((acc, c, i) => acc + Number(c) * (i % 2 ? 3 : 1), 0)
  return String((10 - sum % 10) % 10)
}

/** Cherche la fiche du livre sur le web. Renvoie
 * { title, author, publisher, year, coverUrl } ou null si introuvable. */
export async function lookupBook(isbn, fetchFn = globalThis.fetch) {
  return await fromGoogleBooks(isbn, fetchFn)
    ?? await fromOpenLibrary(isbn, fetchFn)
    ?? await fromBnf(isbn, fetchFn)
}

async function fromGoogleBooks(isbn, fetchFn) {
  try {
    const res = await fetchFn('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn)
    if (!res.ok) return null
    const info = (await res.json()).items?.[0]?.volumeInfo
    if (!info?.title) return null
    return {
      title: info.subtitle ? info.title + ' — ' + info.subtitle : info.title,
      author: (info.authors ?? []).join(', '),
      publisher: info.publisher ?? '',
      year: (info.publishedDate ?? '').slice(0, 4),
      coverUrl: (info.imageLinks?.thumbnail ?? '').replace('http://', 'https://')
    }
  } catch { return null }
}

/** Catalogue général de la BnF (API SRU, XML Dublin Core, sans clé). */
async function fromBnf(isbn, fetchFn) {
  try {
    const query = encodeURIComponent(`bib.isbn any "${isbn}"`)
    const res = await fetchFn('https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&recordSchema=dublincore&maximumRecords=1&query=' + query)
    if (!res.ok) return null
    const xml = await res.text()
    const dc = name => decodeXml(xml.match(new RegExp('<dc:' + name + '[^>]*>([^<]+)</dc:' + name + '>'))?.[1] ?? '')
    const title = dc('title').split(' / ')[0].trim()
    if (!title) return null
    return {
      title,
      author: bnfName(dc('creator')),
      publisher: dc('publisher').replace(/\s*\([^)]*\)\s*$/, ''),
      year: dc('date').match(/\d{4}/)?.[0] ?? '',
      coverUrl: '' // la BnF ne fournit pas de couverture
    }
  } catch { return null }
}

/** « Palatin, Suzy (1965-....). Auteur du texte » → « Suzy Palatin ». */
function bnfName(creator) {
  const name = creator.replace(/\([^)]*\)/g, '').split('.')[0].trim()
  const [last, first] = name.split(',').map(p => p.trim())
  return first ? first + ' ' + last : last
}

function decodeXml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
}

async function fromOpenLibrary(isbn, fetchFn) {
  try {
    const res = await fetchFn('https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&format=json&jscmd=data')
    if (!res.ok) return null
    const book = (await res.json())['ISBN:' + isbn]
    if (!book?.title) return null
    return {
      title: book.title,
      author: (book.authors ?? []).map(a => a.name).join(', '),
      publisher: (book.publishers ?? []).map(p => p.name).join(', '),
      year: (book.publish_date ?? '').match(/\d{4}/)?.[0] ?? '',
      coverUrl: book.cover?.large ?? book.cover?.medium ?? ''
    }
  } catch { return null }
}
