// Premium Dashboard Types
export type TimePeriod = 'daily' | 'weekly' | 'monthly'

export interface TimeSeriesData {
	period: string
	income: number
	expense: number
	net: number
}

export interface AccountBalance {
	id: string
	title: string
	balance: number
	type: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'OTHER'
	lastUpdated: string
}

export interface PaymentStats {
	todayIncome: number
	weekIncome: number
	monthIncome: number
	todayExpense: number
	weekExpense: number
	monthExpense: number
	totalDues: number
	totalWaivers: number
	totalAccountBalance: number
	accountBalances: AccountBalance[]
	dailyComparison: TimeSeriesData[]
	weeklyComparison: TimeSeriesData[]
	monthlyComparison: TimeSeriesData[]
	// Performance metrics
	monthlyGrowth: number
	weeklyGrowth: number
	collectionRate: number
}

export interface ClassSummaryItem {
	className: string
	studentCount: number
	sectionCount: number
	totalFees: number
	collectedFees: number
	pendingFees: number
}

export interface AcademicStats {
	totalStudents: number
	totalTeachers: number
	activeStudents: number
	newAdmissions: number
	classSummary: ClassSummaryItem[]
	studentGrowth: number
	attendanceRate: number
}

export interface DashboardStats {
	payment: PaymentStats
	academic: AcademicStats
}
