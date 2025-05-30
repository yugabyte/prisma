# @yugabytedb/prisma-adapter

This package contains the driver adapter for Prisma ORM that enables usage of the YugabyteDB node-postgres (`@yugaytedb/pg`) smart database driver for YugabyteDB.

`pg` is one of the most popular drivers in the JavaScript ecosystem for PostgreSQL databases. It can be used with any PostgreSQL database that's accessed via TCP.

> **Note:**: Support for the `pg` driver is available from Prisma versions [5.4.2](https://github.com/prisma/prisma/releases/tag/5.4.2) and later.

## Usage

This section explains how you can use it with Prisma ORM and the `@yugabytedb/prisma-adapter` driver adapter. Be sure that the `DATABASE_URL` environment variable is set to your PostgreSQL connection string (e.g. in a `.env` file).

Example DATABASE_URL: `postgresql://yugabyte:yugabyte@127.0.0.1:5433/yugabyte?ybServersRefreshInterval=10&loadBalance=true&schema=public`

### 1. Enable the `driverAdapters` Preview feature flag

Since driver adapters are currently in [Preview](/orm/more/releases#preview), you need to enable its feature flag on the `datasource` block in your Prisma schema:

```prisma
// schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Once you have added the feature flag to your schema, re-generate Prisma Client:

```
npx prisma generate
```

### 2. Install the dependencies

Next, install the `@yugabytedb/pg` package and Prisma ORM's driver adapter:

```
npm install @yugabytedb/pg
npm install @yugabytedb/prisma-adapter
```
> **Note:**: Need to install @yugabytedb/pg version 8.7.3-yb-10 or later.

### 3. Instantiate Prisma Client using the driver adapter

Finally, when you instantiate Prisma Client, you need to pass an instance of Prisma ORM's driver adapter to the `PrismaClient` constructor:

```ts
import { PrismaPg } from '@yugabytedb/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ 
        connectionString: connectionString,
        max: 20,
      })
const prisma = new PrismaClient({ adapter })
```

## Feedback

We encourage you to create an issue if you find something missing or run into a bug.
