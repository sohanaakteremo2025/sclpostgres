/**
 * Centralized cache keys and tags for all cached data
 */
export const CACHE_KEYS = {
	EXAMS: {
		KEY: (tenantId: string) => `exams-${tenantId}`,
		TAG: (tenantId: string) => `exams-${tenantId}`,
	},
	EXAM: {
		KEY: (id: string) => `exam-${id}`,
		TAG: (id: string) => `exam-${id}`,
	},
	EXAM_TYPES: {
		KEY: (tenantId: string) => `exam-types-${tenantId}`,
		TAG: (tenantId: string) => `exam-types-${tenantId}`,
	},
	EXAM_TYPE: {
		KEY: (id: string) => `exam-type-${id}`,
		TAG: (id: string) => `exam-type-${id}`,
	},
	STUDENT_ENROLLMENTS: {
		KEY: (tenantId: string) => `student-enrollments-${tenantId}`,
		TAG: (tenantId: string) => `student-enrollments-${tenantId}`,
	},
	STUDENT_ENROLLMENT: {
		KEY: (id: string) => `student-enrollment-${id}`,
		TAG: (id: string) => `student-enrollment-${id}`,
	},
	CMS_DASHBOARD: {
		BASE: 'dashboard-data',
		TAG: 'dashboard',
	},
	TENANT_DASHBOARD: {
		KEY: (tenantId: string) => `tenant-dashboard-data-${tenantId}`,
		TAG: (tenantId: string) => `tenant-dashboard-data-${tenantId}`,
	},
	TENANTS: {
		BASE: 'tenants-list-cms',
		TAG: 'tenants-cms',
	},
	TENANT_BY_ID: {
		BASE: (id: string) => `tenant-${id}`,
		TAG: 'tenant',
	},
	TENANT_BY_DOMAIN: {
		BASE: (domain: string) => `tenant-${domain}`,
		TAG: 'tenant',
	},
	TENANT_ID_BY_DOMAIN: {
		BASE: (domain: string) => `tenant-${domain}`,
		TAG: 'tenant',
	},
	TENANT_ACCOUNT: {
		KEY: (id: string) => `tenant-account-${id}`,
		TAG: (id: string) => `tenant-account-${id}`,
	},
	TENANT_ACCOUNTS: {
		KEY: (tenantId: string) => `tenant-accounts-${tenantId}`,
		TAG: (tenantId: string) => `tenant-accounts-${tenantId}`,
	},
	TRANSACTION_CATEGORIES: {
		KEY: (tenantId: string) => `transaction-categories-${tenantId}`,
		TAG: (tenantId: string) => `transaction-categories-${tenantId}`,
	},
	TRANSACTION_CATEGORY: {
		KEY: (id: string) => `transaction-category-${id}`,
		TAG: (id: string) => `transaction-category-${id}`,
	},
	TENANT_ADMINS: {
		KEY: `tenant-admins-cms`,
		TAG: `tenant-admins-cms`,
	},
	TENANT_ADMIN: {
		KEY: `tenant-admin-cms`,
		TAG: `tenant-admin-cms`,
	},
	ADMIN: {
		BASE: 'admin',
		TAG: 'admin',
	},
	COMPANY_TRANSACTION: {
		BASE: 'companyTransactions',
		TAG: 'companyTransactions',
	},
	SMS_ORDERS: {
		BASE: 'sms-orders',
		TAG: 'sms-orders',
	},
	GET_USER_BY_ID: {
		BASE: (id: string) => `user-${id}`,
		TAG: 'current-user',
	},
	CLASS: {
		KEY: (id: string) => `class-${id}`,
		TAG: (id: string) => `class-${id}`,
	},

	CLASSES: {
		KEY: (tenantId: string) => `classes-${tenantId}`,
		TAG: (tenantId: string) => `classes-${tenantId}`,
	},
	CLASS_ROUTINES: {
		KEY: (tenantId: string) => `class-routines-${tenantId}`,
		TAG: (tenantId: string) => `class-routines-${tenantId}`,
	},
	CLASS_ROUTINE: {
		KEY: (id: string) => `class-routine-${id}`,
		TAG: (id: string) => `class-routine-${id}`,
	},
	SECTIONS: {
		KEY: (tenantId: string) => `sections-${tenantId}`,
		TAG: (tenantId: string) => `sections-${tenantId}`,
	},
	SECTION: {
		KEY: (id: string) => `section-${id}`,
		TAG: (id: string) => `section-${id}`,
	},
	SESSIONS: {
		KEY: (tenantId: string) => `sessions-${tenantId}`,
		TAG: (tenantId: string) => `sessions-${tenantId}`,
	},
	SESSION: {
		KEY: (id: string) => `session-${id}`,
		TAG: (id: string) => `session-${id}`,
	},
	GROUPS: {
		KEY: (tenantId: string) => `groups-${tenantId}`,
		TAG: (tenantId: string) => `groups-${tenantId}`,
	},
	GROUP: {
		KEY: (id: string) => `group-${id}`,
		TAG: (id: string) => `group-${id}`,
	},
	SUBJECTS: {
		KEY: (tenantId: string) => `subjects-${tenantId}`,
		TAG: (tenantId: string) => `subjects-${tenantId}`,
	},
	SUBJECT: {
		KEY: (id: string) => `subject-${id}`,
		TAG: (id: string) => `subject-${id}`,
	},
	STUDENTS: {
		KEY: (tenantId: string) => `students-${tenantId}`,
		TAG: (tenantId: string) => `students-${tenantId}`,
	},
	STUDENT: {
		KEY: (id: string) => `student-${id}`,
		TAG: (id: string) => `student-${id}`,
	},
	EMPLOYEES: {
		KEY: (tenantId: string) => `employees-${tenantId}`,
		TAG: (tenantId: string) => `employees-${tenantId}`,
	},
	EMPLOYEE: {
		KEY: (id: string) => `employee-${id}`,
		TAG: (id: string) => `employee-${id}`,
	},
	FEE_STRUCTURES: {
		KEY: (tenantId: string) => `fee-structure-${tenantId}`,
		TAG: (tenantId: string) => `fee-structure-${tenantId}`,
	},
	FEE_STRUCTURE_BY_ID: {
		KEY: (id: string) => `fee-structure-${id}`,
		TAG: (id: string) => `fee-structure-${id}`,
	},
	FEE_ITEMS: {
		KEY: (tenantId: string) => `fee-items-${tenantId}`,
		TAG: (tenantId: string) => `fee-items-${tenantId}`,
	},
	FEE_ITEM: {
		KEY: (id: string) => `fee-item-${id}`,
		TAG: (id: string) => `fee-item-${id}`,
	},
	SALARIES: {
		KEY: (tenantId: string) => `salaries-${tenantId}`,
		TAG: (tenantId: string) => `salaries-${tenantId}`,
	},
	SALARY: {
		KEY: (id: string) => `salary-${id}`,
		TAG: (id: string) => `salary-${id}`,
	},

	STUDENT_DUES: {
		KEY: (tenantId: string) => `dues-${tenantId}`,
		TAG: (tenantId: string) => `dues-${tenantId}`,
	},
	STUDENT_DUE: {
		KEY: (id: string) => `dues-${id}`,
		TAG: (id: string) => `dues-${id}`,
	},
	DUE_ITEMS: {
		KEY: (tenantId: string) => `dues-${tenantId}`,
		TAG: (tenantId: string) => `dues-${tenantId}`,
	},
	DUE_ITEM: {
		KEY: (id: string) => `dues-${id}`,
		TAG: (id: string) => `dues-${id}`,
	},
	DUE_ADJUSTMENTS: {
		KEY: (tenantId: string) => `dues-${tenantId}`,
		TAG: (tenantId: string) => `dues-${tenantId}`,
	},
	DUE_ADJUSTMENT: {
		KEY: (id: string) => `dues-${id}`,
		TAG: (id: string) => `dues-${id}`,
	},
	STUDENT_PAYMENTS: {
		KEY: (tenantId: string) => `payments-${tenantId}`,
		TAG: (tenantId: string) => `payments-${tenantId}`,
	},
	STUDENT_PAYMENT: {
		KEY: (id: string) => `payment-${id}`,
		TAG: (id: string) => `payment-${id}`,
	},
	PAYMENT_TRANSACTIONS: {
		KEY: (tenantId: string) => `payment-transaction-${tenantId}`,
		TAG: (tenantId: string) => `payment-transaction-${tenantId}`,
	},
	PAYMENT_TRANSACTION: {
		KEY: (id: string) => `payment-transaction-${id}`,
		TAG: (id: string) => `payment-transaction-${id}`,
	},
	EMPLOYEE_DUES: {
		KEY: (tenantId: string) => `dues-${tenantId}`,
		TAG: (tenantId: string) => `dues-${tenantId}`,
	},
	EMPLOYEE_DUE: {
		KEY: (id: string) => `dues-${id}`,
		TAG: (id: string) => `dues-${id}`,
	},
	TRANSACTIONS: {
		KEY: (tenantId: string) => `transactions-${tenantId}`,
		TAG: (tenantId: string) => `transactions-${tenantId}`,
	},
	TRANSACTION_BY_ID: {
		KEY: (id: string) => `transaction-${id}`,
		TAG: (id: string) => `transaction-${id}`,
	},
	STUDENT_INVOICES: {
		KEY: (tenantId: string) => `invoices-${tenantId}`,
		TAG: (tenantId: string) => `invoices-${tenantId}`,
	},
	STUDENT_INVOICE: {
		KEY: (id: string) => `invoice-${id}`,
		TAG: (id: string) => `invoice-${id}`,
	},

	EMPLOYEE_INVOICES: {
		KEY: (tenantId: string) => `invoices-${tenantId}`,
		TAG: (tenantId: string) => `invoices-${tenantId}`,
	},
	EMPLOYEE_INVOICE: {
		KEY: (id: string) => `invoice-${id}`,
		TAG: (id: string) => `invoice-${id}`,
	},

	DASHBOARD: {
		KEY: 'dashboard-data',
		TAG: 'dashboard',
	},
	EXAM_SCHEDULES: {
		KEY: (tenantId: string) => `exam-schedules-${tenantId}`,
		TAG: (tenantId: string) => `exam-schedules-${tenantId}`,
	},
	EXAM_SCHEDULE: {
		KEY: (id: string) => `exam-schedule-${id}`,
		TAG: (id: string) => `exam-schedule-${id}`,
	},
	EXAM_RESULTS: {
		KEY: (tenantId: string) => `exam-results-${tenantId}`,
		TAG: (tenantId: string) => `exam-results-${tenantId}`,
	},
	EXAM_RESULT: {
		KEY: (id: string) => `exam-result-${id}`,
		TAG: (id: string) => `exam-result-${id}`,
	},
	NOTICES: {
		KEY: (tenantId: string) => `notices-${tenantId}`,
		TAG: (tenantId: string) => `notices-${tenantId}`,
	},
	NOTICE: {
		KEY: (id: string) => `notice-${id}`,
		TAG: (id: string) => `notice-${id}`,
	},
	// Add more as needed...
} as const
