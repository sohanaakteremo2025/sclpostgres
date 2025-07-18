import { z } from 'zod'
import { Decimal } from 'decimal.js'

export const DecimalSchema = z.union([
  z.instanceof(Decimal),
  z.string(),
  z.number(),
]).transform(val => new Decimal(val))
