/**
 * `@yugabytedb/pg` is a fork of `node-postgres` and ships no type declarations of its own, so this
 * ambient declaration aliases the module onto the upstream `@types/pg` definitions. The adapter
 * source is then type-identical to `@prisma/adapter-pg`, which keeps future ports to a pure import
 * swap.
 *
 * Note: `@types/pg` tracks current node-postgres (8.16.x) while `@yugabytedb/pg` is based on 8.7.3,
 * so the declarations are a superset of what the fork implements. Every API the adapter actually
 * calls has been verified present in `@yugabytedb/pg@8.7.3-yb-11`.
 */
declare module '@yugabytedb/pg' {
  import pg = require('pg')

  export = pg
}
