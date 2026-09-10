import { describe, expect, it } from 'vitest'

import { mapArg } from '../conversion'

// `@yugabytedb/pg` is based on node-postgres 8.7.3, which predates
// https://github.com/brianc/node-postgres/pull/2930 (pg 8.9.0). Its `arrayString()` serializes
// `Buffer` elements but not other typed-array views, so `mapArg` must hand it `Buffer`s where
// upstream `@prisma/adapter-pg` returns plain `Uint8Array`s. These tests pin that deviation to the
// driver behaviour it exists for, using the driver's own serializer.

const { prepareValue } = require('@yugabytedb/pg/lib/utils') as { prepareValue: (value: unknown) => unknown }

const bytesList = { scalarType: 'bytes', arity: 'list' } as const
const bytesScalar = { scalarType: 'bytes', arity: 'scalar' } as const

describe('mapArg with @yugabytedb/pg', () => {
  it('maps a Bytes value to a Buffer', () => {
    const result = mapArg(new Uint8Array([1, 2, 3]), bytesScalar)

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result).toEqual(Buffer.from([1, 2, 3]))
  })

  it('maps a Bytes[] value to Buffers the driver can serialize', () => {
    const result = mapArg([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5])], bytesList)

    expect(result).toEqual([Buffer.from([1, 2, 3]), Buffer.from([4, 5])])
    // Would throw `TypeError: elementRepresentation.replace is not a function` for Uint8Array
    // elements, which is the failure this deviation prevents.
    expect(prepareValue(result)).toBe('{\\\\x010203,\\\\x0405}')
  })

  it('preserves byte offsets when mapping a view over a larger buffer', () => {
    const view = new Uint8Array(new Uint8Array([9, 1, 2, 3, 9]).buffer, 1, 3)
    const result = mapArg(view, bytesScalar)

    expect(result).toEqual(Buffer.from([1, 2, 3]))
  })

  it('documents that the driver still cannot serialize Uint8Array array elements', () => {
    // When this test starts failing, `@yugabytedb/pg` has been rebased onto pg >= 8.9.0 and the
    // `Buffer` conversion in `mapArg` can be reverted to upstream's `Uint8Array`.
    expect(() => prepareValue([new Uint8Array([1, 2, 3])])).toThrow(/elementRepresentation\.replace is not a function/)
  })
})
