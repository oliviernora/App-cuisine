/**
 * Tests du cas N15 — documenter la bibliothèque par scan ISBN : validation
 * du code, recherche web (Google Books, Open Library, puis BnF),
 * enregistrement du livre avec sa couverture, complément d'une fiche
 * existante (NP15).
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, storageFiles, edgeFunctions, resetFake } from '../helpers/fake-supabase.js'
import { normalizeIsbn, lookupBook } from '../../src/lib/livre-isbn.js'
import {
  store, addSource, saveBookSource, findSourceByIsbn, fetchCoverBlob, coverUrl
} from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []; store.recipes = []
  store.schemaWarning = false
})

/* ----- Validation de l'ISBN (scan ou saisie manuelle) ----- */

test('normalizeIsbn : ISBN-13 valide, avec ou sans tirets et espaces', () => {
  expect(normalizeIsbn('9780306406157')).toBe('9780306406157')
  expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157')
  expect(normalizeIsbn(' 978 0306 40615 7 ')).toBe('9780306406157')
})

test('normalizeIsbn : ISBN-10 des livres anciens converti en 13', () => {
  expect(normalizeIsbn('0-306-40615-2')).toBe('9780306406157')
})

test('normalizeIsbn : clé fausse, texte quelconque ou code-barres non-livre → null', () => {
  expect(normalizeIsbn('9780306406158')).toBe(null) // clé fausse
  expect(normalizeIsbn('0306406153')).toBe(null) // clé ISBN-10 fausse
  expect(normalizeIsbn('n’importe quoi')).toBe(null)
  expect(normalizeIsbn('3017620422003')).toBe(null) // EAN alimentaire : pas un livre
  expect(normalizeIsbn('')).toBe(null)
})

/* ----- Recherche web ----- */

const googleHit = {
  ok: true,
  json: async () => ({
    items: [{ volumeInfo: {
      title: 'La Cuisine indienne', subtitle: 'De mère en fille',
      authors: ['Beena Paradin', 'Une Autrice'], publisher: 'Phaidon',
      publishedDate: '2019-05-02',
      imageLinks: { thumbnail: 'http://books.google.com/books/content?id=x' }
    } }]
  })
}
const empty = { ok: true, json: async () => ({}) }

test('lookupBook : Google Books répond → fiche complète, couverture en https', async () => {
  const fetchFn = vi.fn(async () => googleHit)
  const book = await lookupBook('9780306406157', fetchFn)
  expect(book).toEqual({
    title: 'La Cuisine indienne — De mère en fille',
    author: 'Beena Paradin, Une Autrice',
    publisher: 'Phaidon',
    year: '2019',
    coverUrl: 'https://books.google.com/books/content?id=x'
  })
  expect(fetchFn).toHaveBeenCalledTimes(1)
})

test('lookupBook : Google muet → repli sur Open Library', async () => {
  const fetchFn = vi.fn(async url => url.includes('openlibrary')
    ? { ok: true, json: async () => ({ 'ISBN:9780306406157': {
        title: 'Le Grand Livre', authors: [{ name: 'Un Auteur' }],
        publishers: [{ name: 'Hachette' }], publish_date: 'May 2003',
        cover: { medium: 'https://covers.openlibrary.org/b/id/1-M.jpg' }
      } }) }
    : empty)
  const book = await lookupBook('9780306406157', fetchFn)
  expect(book.title).toBe('Le Grand Livre')
  expect(book.author).toBe('Un Auteur')
  expect(book.publisher).toBe('Hachette')
  expect(book.year).toBe('2003')
  expect(book.coverUrl).toBe('https://covers.openlibrary.org/b/id/1-M.jpg')
})

test('lookupBook : Google et Open Library muets → repli sur la BnF (livre français, NP15)', async () => {
  // Réponse SRU réelle (abrégée) du catalogue BnF pour 9782016279700.
  const bnfXml = `<?xml version="1.0" encoding="UTF-8"?><srw:searchRetrieveResponse>
    <srw:numberOfRecords>1</srw:numberOfRecords>
    <dc:title>Cuisine créole / Suzy Palatin ; photographies, Frédéric Lucano</dc:title>
    <dc:creator>Palatin, Suzy (1965-....). Auteur du texte</dc:creator>
    <dc:publisher>Hachette cuisine (Vanves)</dc:publisher>
    <dc:date>2021</dc:date></srw:searchRetrieveResponse>`
  const fetchFn = vi.fn(async url => url.includes('catalogue.bnf.fr')
    ? { ok: true, text: async () => bnfXml }
    : empty)
  const book = await lookupBook('9782016279700', fetchFn)
  expect(book).toEqual({
    title: 'Cuisine créole',
    author: 'Suzy Palatin',
    publisher: 'Hachette cuisine',
    year: '2021',
    coverUrl: '' // la BnF ne fournit pas de couverture
  })
  expect(fetchFn).toHaveBeenCalledTimes(3)
})

const bnfEmpty = `<?xml version="1.0"?><srw:searchRetrieveResponse>
  <srw:numberOfRecords>0</srw:numberOfRecords></srw:searchRetrieveResponse>`

test('lookupBook : introuvable partout (ou réseau en panne) → null, jamais d’exception', async () => {
  const fetchFn = async url => url.includes('catalogue.bnf.fr')
    ? { ok: true, text: async () => bnfEmpty }
    : empty
  expect(await lookupBook('9780306406157', fetchFn)).toBe(null)
  expect(await lookupBook('9780306406157', async () => { throw new Error('offline') })).toBe(null)
})

/* ----- Enregistrement (N15) ----- */

const beena = {
  title: 'La Cuisine indienne', author: 'Beena Paradin', isbn: '9780306406157',
  publisher: 'Phaidon', year: '2019'
}

test('saveBookSource : nouveau livre → source « livre » complète, couverture dans le dossier du foyer', async () => {
  const { source, completed } = await saveBookSource(beena, new Blob(['couv'], { type: 'image/jpeg' }))

  expect(completed).toBe(false)
  expect(tables.sources).toHaveLength(1)
  expect(source.kind).toBe('livre')
  expect(source.author).toBe('Beena Paradin')
  expect(source.publisher).toBe('Phaidon')
  expect(source.year).toBe('2019')
  expect(source.cover_path).toBe('h-test/couvertures/' + source.id + '.jpg')
  expect(storageFiles.has(source.cover_path)).toBe(true)
  expect(await coverUrl(source)).toBe('signed://' + source.cover_path)
  expect(store.schemaWarning).toBe(false)
})

test('saveBookSource : un livre du même titre saisi à la main → fiche complétée, pas de doublon (NP15)', async () => {
  await addSource('La cuisine indienne') // titre seul, casse différente
  store.sources[0].country = 'Inde'

  const { source, completed } = await saveBookSource(beena, new Blob(['couv']))

  expect(completed).toBe(true)
  expect(tables.sources).toHaveLength(1)
  expect(source.title).toBe('La cuisine indienne') // le titre existant reste
  expect(source.isbn).toBe('9780306406157')
  expect(source.publisher).toBe('Phaidon')
  expect(source.country).toBe('Inde') // jamais écrasé
  expect(source.cover_path).toBe('h-test/couvertures/' + source.id + '.jpg')
})

test('findSourceByIsbn : le même livre scanné deux fois est détecté (NP15)', async () => {
  const { source } = await saveBookSource(beena)
  expect(findSourceByIsbn('9780306406157')).toBe(source)
  expect(findSourceByIsbn('')).toBe(null)
})

/* ----- Couverture rapatriée du web ----- */

test('fetchCoverBlob : image rapatriée par l’Edge Function → Blob ; panne → null', async () => {
  edgeFunctions['rapatrier-page'] = async body => {
    expect(body).toEqual({ url: 'https://books.google.com/c.jpg', image: true })
    return { image: btoa('fausse image'), contentType: 'image/jpeg' }
  }
  const blob = await fetchCoverBlob('https://books.google.com/c.jpg')
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.type).toBe('image/jpeg')

  delete edgeFunctions['rapatrier-page']
  expect(await fetchCoverBlob('https://books.google.com/c.jpg')).toBe(null)
})
