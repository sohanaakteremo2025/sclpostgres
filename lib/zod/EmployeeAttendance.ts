import { z } from 'zod'
import { AttendanceStatusSchema } from './schemas'

export const EmployeeAttendanceSchema = z.object({
  id: z.string(),
  date: z.date(),
  status: AttendanceStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tenantId: z.string(),
  employeeId: z.string(),
})

export type EmployeeAttendance = z.infer<typeof EmployeeAttendanceSchema>

export const CreateEmployeeAttendanceInputSchema = EmployeeAttendanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
})

export type CreateEmployeeAttendanceInput = z.infer<typeof CreateEmployeeAttendanceInputSchema>

export const CreateEmployeeAttendancePayloadSchema = CreateEmployeeAttendanceInputSchema.extend({
  tenantId: z.string(),
})

export type CreateEmployeeAttendancePayload = z.infer<typeof CreateEmployeeAttendancePayloadSchema>

export const UpdateEmployeeAttendanceInputSchema = EmployeeAttendanceSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type UpdateEmployeeAttendanceInput = z.infer<typeof UpdateEmployeeAttendanceInputSchema>

