import { z } from 'zod'

export const StudentInvoiceSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  studentId: z.string(),
})

export type StudentInvoice = z.infer<typeof StudentInvoiceSchema>

export const CreateStudentInvoiceInputSchema = StudentInvoiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateStudentInvoiceInput = z.infer<typeof CreateStudentInvoiceInputSchema>

export const CreateStudentInvoicePayloadSchema = CreateStudentInvoiceInputSchema.extend({
  tenantId: z.string(),
})

export type CreateStudentInvoicePayload = z.infer<typeof CreateStudentInvoicePayloadSchema>

export const UpdateStudentInvoiceInputSchema = StudentInvoiceSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateStudentInvoiceInput = z.infer<typeof UpdateStudentInvoiceInputSchema>

