# @yugabytedb/prisma-adapter

This package contains the driver adapter for Prisma ORM that enables usage of the
[YugabyteDB smart driver](https://github.com/yugabyte/node-postgres) (`@yugabytedb/pg`) — a fork of
`node-postgres` with cluster-aware and topology-aware load balancing — with YugabyteDB.

It tracks `@prisma/adapter-pg` and is versioned to match the Prisma ORM release it is built against:
`7.8.0-yb-N` works with Prisma ORM `7.8.0`. Driver adapters and the Prisma client exchange typed
error values, so **use the adapter build that matches your `prisma` / `@prisma/client` version** —
a newer adapter can emit error kinds an older client does not recognize.

## Requirements

|                  |                                                                    |
| ---------------- | ------------------------------------------------------------------ |
| Prisma ORM       | `7.8.0`                                                            |
| `@yugabytedb/pg` | `>= 8.7.3-yb-11`                                                   |
| Node.js          | `^20.19 \|\| ^22.12 \|\| >=24.0` (as required by Prisma ORM 7.8.0) |

Driver adapters are generally available in Prisma ORM 7.x — the `driverAdapters` preview feature
flag that earlier versions required no longer exists and should be removed from your schema.

## Usage

Set `DATABASE_URL` to your YugabyteDB connection string, for example:

```
postgresql://yugabyte:yugabyte@127.0.0.1:5433/yugabyte?loadBalance=true&ybServersRefreshInterval=10&schema=public
```

### 1. Install the dependencies

```
npm install @yugabytedb/pg
npm install @yugabytedb/prisma-adapter
```

`@yugabytedb/pg` is a peer dependency, so your application and the adapter share a single driver
instance — that is what lets you pass your own pool in (see below).

### 2. Instantiate Prisma Client using the driver adapter

```ts
import { PrismaPg } from '@yugabytedb/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 20,
})

const prisma = new PrismaClient({ adapter })
```

The adapter also accepts a connection string directly, or a pool you built yourself — useful when
you want to configure smart-driver load balancing explicitly, or share one pool with non-Prisma
code:

```ts
import pg from '@yugabytedb/pg'
import { PrismaPg } from '@yugabytedb/prisma-adapter'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  loadBalance: true,
  topologyKeys: 'aws.us-east-1.us-east-1a',
})

// By default the externally provided pool is left open when the adapter is disposed.
const adapter = new PrismaPg(pool, { disposeExternalPool: true })
```

### Options

`PrismaPg` accepts the same options as `@prisma/adapter-pg` 7.8.0:

| Option                   | Description                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `schema`                 | Schema name to use in generated queries                                                         |
| `disposeExternalPool`    | Call `pool.end()` on an externally provided pool when the adapter is disposed (default `false`) |
| `onPoolError`            | Callback for the pool's `error` events                                                          |
| `onConnectionError`      | Callback for a connection's `error` events                                                      |
| `userDefinedTypeParser`  | Parser for user-defined types, called with the type OID, the value, and a queryable             |
| `statementNameGenerator` | Generates prepared-statement names; omit to leave statement caching off                         |

## Feedback

Please open an issue at https://github.com/yugabyte/prisma if you find something missing or run into
a bug.
