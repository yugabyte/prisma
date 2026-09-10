/**
 * `@yugabytedb/pg` ships no type declarations, and the rolled-up `dist/index.d.ts` references it
 * (`PrismaPg`'s constructor accepts a `pg.Pool`, `underlyingDriver()` returns one). api-extractor
 * drops ambient module declarations during roll-up, so without this step a consumer's `tsc` fails
 * with "Could not find a declaration file for module '@yugabytedb/pg'".
 *
 * This copies the ambient shim next to the rolled-up typings and references it from both entry
 * points. `@types/pg`, which the shim aliases, is a runtime `dependency` for that reason - the same
 * choice upstream `@prisma/adapter-pg` 7.8.0 makes.
 */
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve(__dirname, '..', 'dist')
const shimName = 'yugabytedb-pg.d.ts'

fs.copyFileSync(path.resolve(__dirname, '..', 'src', shimName), path.join(dist, shimName))

for (const entry of ['index.d.ts', 'index.d.mts']) {
  const file = path.join(dist, entry)
  const reference = `/// <reference path="./${shimName}" />`
  const contents = fs.readFileSync(file, 'utf8')

  if (!contents.includes(reference)) {
    fs.writeFileSync(file, `${reference}\n${contents}`)
  }
}

console.log(`Shipped ${shimName} and referenced it from dist/index.d.ts and dist/index.d.mts`)
