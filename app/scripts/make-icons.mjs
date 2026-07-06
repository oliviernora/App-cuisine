/** Génère les icônes PWA (PNG) à partir de public/icon.svg. À relancer si l'icône change. */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const svg = readFileSync(fileURLToPath(new URL('../public/icon.svg', import.meta.url)))

for (const [file, size] of [['pwa-192.png', 192], ['pwa-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL('../public/' + file, import.meta.url)))
  console.log(file, size + 'x' + size)
}
