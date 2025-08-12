import { z } from 'zod'
import { Decimal } from 'decimal.js'

export const DecimalSchema = z.union([z.instanceof(Decimal), z.string(), z.number()]).transform(val => new Decimal(val))

export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'STUDENT', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'LIBRARIAN', 'SUPERVISOR', 'STAFF', 'WORKER', 'EMPLOYEE', 'SECURITY', 'IT', 'MARKETING', 'HR'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const BillingFrequencySchema = z.enum(['ONE_TIME', 'MONTHLY', 'YEARLY'])
export type BillingFrequency = z.infer<typeof BillingFrequencySchema>

export const PaymentMethodSchema = z.enum(['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'MOBILE_BANKING', 'SHURJOPAY', 'BANK', 'CARD', 'OTHER'])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

export const AccountTypeSchema = z.enum(['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'CARD', 'MOBILE_BANKING', 'SHURJOPAY', 'OTHER'])
export type AccountType = z.infer<typeof AccountTypeSchema>

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'DEPOSIT', 'WITHDRAWAL', 'FUND_TRANSFER'])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

export const SMSOrderStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])
export type SMSOrderStatus = z.infer<typeof SMSOrderStatusSchema>

export const SubjectTypeSchema = z.enum(['COMPULSORY', 'ELECTIVE', 'OPTIONAL'])
export type SubjectType = z.infer<typeof SubjectTypeSchema>

export const SessionStatusSchema = z.enum(['UPCOMING', 'ONGOING', 'ENDED'])
export type SessionStatus = z.infer<typeof SessionStatusSchema>

export const StudentStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type StudentStatus = z.infer<typeof StudentStatusSchema>

export const GenderSchema = z.enum(['MALE', 'FEMALE', 'OTHER'])
export type Gender = z.infer<typeof GenderSchema>

export const ReligionSchema = z.enum(['ISLAM', 'CHRISTIAN', 'HINDU', 'BUDDHIST', 'OTHER'])
export type Religion = z.infer<typeof ReligionSchema>

export const WeekDaySchema = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
export type WeekDay = z.infer<typeof WeekDaySchema>

export const ResultStatusSchema = z.enum(['PENDING', 'COMPLETED'])
export type ResultStatus = z.infer<typeof ResultStatusSchema>

export const ExamStatusSchema = z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
export type ExamStatus = z.infer<typeof ExamStatusSchema>

export const FeeFrequencySchema = z.enum(['ONE_TIME', 'MONTHLY', 'SEMESTER', 'ANNUAL', 'QUARTERLY', 'WEEKLY', 'DAILY'])
export type FeeFrequency = z.infer<typeof FeeFrequencySchema>

export const LateFeeFrequencySchema = z.enum(['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'])
export type LateFeeFrequency = z.infer<typeof LateFeeFrequencySchema>

export const WaiverTypeSchema = z.enum(['PERCENTAGE', 'FIXED'])
export type WaiverType = z.infer<typeof WaiverTypeSchema>

export const FeeTypeSchema = z.enum(['ADMISSION', 'MONTHLY', 'EXAM'])
export type FeeType = z.infer<typeof FeeTypeSchema>

export const FeeStatusSchema = z.enum(['PENDING', 'PAID'])
export type FeeStatus = z.infer<typeof FeeStatusSchema>

export const FeeItemStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type FeeItemStatus = z.infer<typeof FeeItemStatusSchema>

export const SalaryAdjustmentTypeSchema = z.enum(['BONUS', 'DEDUCTION', 'ALLOWANCE'])
export type SalaryAdjustmentType = z.infer<typeof SalaryAdjustmentTypeSchema>

export const AttendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'])
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>

export const TenantStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
export type TenantStatus = z.infer<typeof TenantStatusSchema>

export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BANNED'])
export type UserStatus = z.infer<typeof UserStatusSchema>

export const DueAdjustmentTypeSchema = z.enum(['DISCOUNT', 'WAIVER', 'FINE', 'LATE_FEE'])
export type DueAdjustmentType = z.infer<typeof DueAdjustmentTypeSchema>

export const BillingTypeSchema = z.enum(['FIXED', 'PER_STUDENT'])
export type BillingType = z.infer<typeof BillingTypeSchema>

export const BillingStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type BillingStatus = z.infer<typeof BillingStatusSchema>

export const DueItemStatusSchema = z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'])
export type DueItemStatus = z.infer<typeof DueItemStatusSchema>

export const EnrollmentStatusSchema = z.enum(['ENROLLED', 'PASSED', 'FAILED', 'REPEATED', 'TRANSFERRED', 'DROPPED'])
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>

export const EmployeeRoleSchema = z.enum(['TEACHER', 'PRINCIPAL', 'ADMIN', 'ACCOUNTANT', 'LIBRARIAN', 'SUPERVISOR', 'STAFF', 'WORKER', 'EMPLOYEE', 'SECURITY', 'IT', 'MARKETING', 'HR'])
export type EmployeeRole = z.infer<typeof EmployeeRoleSchema>

export const EmployeeStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type EmployeeStatus = z.infer<typeof EmployeeStatusSchema>

export const DueAdjustmentStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type DueAdjustmentStatus = z.infer<typeof DueAdjustmentStatusSchema>

export const LogLevelSchema = z.enum(['INFO', 'WARN', 'ERROR', 'DEBUG'])
export type LogLevel = z.infer<typeof LogLevelSchema>

