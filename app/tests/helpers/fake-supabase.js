/**
 * Simulateur Supabase en mémoire pour les tests d'intégration.
 * Implémente uniquement les opérations utilisées par le store.
 */
let counter = 0

export const tables = {
  items: [], shopping: [], households: [], household_members: [], locations: [],
  sources: [], recipes: [], realisations: [], events: [], event_recipes: [],
  recipe_ingredients: [], ingredient_refs: []
}

export function resetFake() {
  for (const key of Object.keys(tables)) tables[key].length = 0
  counter = 0
}

function from(table) {
  const rows = tables[table]
  return {
    select() {
      const filters = []
      const chain = {
        eq(col, val) { filters.push(r => r[col] === val); return chain },
        order() { return chain },
        limit() { return chain },
        single() {
          const found = rows.filter(r => filters.every(f => f(r)))[0] ?? null
          return Promise.resolve({ data: found, error: null })
        },
        then(resolve, reject) {
          return Promise.resolve({ data: rows.filter(r => filters.every(f => f(r))), error: null })
            .then(resolve, reject)
        }
      }
      return chain
    },
    insert(payload) {
      const defaults = table === 'shopping' ? { done: false, manual: false }
        : table === 'items' ? { dismissed: false } : {}
      const inserted = (Array.isArray(payload) ? payload : [payload])
        .map(r => ({ id: 'row-' + ++counter, created_at: 'T' + counter, ...defaults, ...r }))
      rows.push(...inserted)
      return {
        select() {
          return {
            single: () => Promise.resolve({ data: inserted[0], error: null }),
            then: (resolve, reject) => Promise.resolve({ data: inserted, error: null }).then(resolve, reject)
          }
        },
        then: (resolve, reject) => Promise.resolve({ data: null, error: null }).then(resolve, reject)
      }
    },
    update(values) {
      return {
        eq(col, val) {
          rows.filter(r => r[col] === val).forEach(r => Object.assign(r, values))
          return Promise.resolve({ data: null, error: null })
        }
      }
    },
    delete() {
      const filters = []
      const chain = {
        eq(col, val) { filters.push(r => r[col] === val); return chain },
        in(col, vals) { filters.push(r => vals.includes(r[col])); return chain },
        then(resolve, reject) {
          for (let i = rows.length - 1; i >= 0; i--) {
            if (filters.every(f => f(rows[i]))) rows.splice(i, 1)
          }
          return Promise.resolve({ data: null, error: null }).then(resolve, reject)
        }
      }
      return chain
    }
  }
}

const channel = { on: () => channel, subscribe: () => channel }

export const fakeSupabase = {
  from,
  channel: () => channel,
  removeChannel() {},
  auth: {
    getSession: () => Promise.resolve({ data: { session: { user: { id: 'user-test' } } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: () => Promise.resolve()
  }
}
