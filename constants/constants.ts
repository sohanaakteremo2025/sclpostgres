import { MenuGroup } from '@/components/Sidebar/types'
import {
	Award, // For fees management
	BadgeDollarSign, // For salary management

	// Communication & Misc
	Bell, // For employees/staff
	BookOpen,
	// Admin/Management Icons
	Building2, // For student billing

	// Teacher Panel Specific
	CalendarCheck, // For student profile
	CalendarDays, // For subjects (more intuitive than BookCopy)
	CalendarRange, // For class routines/schedules
	ClipboardCheck, // For student result view
	ClipboardList, // For teacher schedule
	ClipboardSignature, // For teacher attendance
	Coins, // For student attendance view
	CreditCard, // For student class schedule
	FileSpreadsheet, // Keep dashboard icon

	// Academic Icons
	GraduationCap,
	Grid2X2,
	IdCard, // For admin users/tenant admins
	LayoutDashboard,
	Mail,
	MessageSquareQuote,
	MessagesSquare, // For results/grades
	PenSquare, // For classes

	// Financial Icons
	Receipt, // For exams
	School2, // For notices

	// Student Panel Specific
	UserCircle, // For tenant/school management
	UserCog, // For students
	Users, // Keep for transactions
	Wallet, // For fees management
} from 'lucide-react'

export const cmsMenu: MenuGroup[] = [
	{
		groupLabel: 'CMS Admin Panel',
		menus: [
			{
				icon: 'LayoutDashboard',
				label: 'Dashboard',
				href: '/cms',
			},
			{
				icon: 'Building2',
				label: 'Institute Management',
				href: '/cms/tenants/list',
			},
			{
				icon: 'UserCog',
				label: 'Institute Admins',
				href: '/cms/tenants/users',
			},
			// {
			// 	icon: 'Mail',
			// 	label: 'SMS Orders',
			// 	href: '/cms/tenants/sms-orders',
			// },
			// {
			// 	icon: 'Receipt',
			// 	label: 'Transactions',
			// 	href: '/cms/transactions',
			// },
		],
	},
]

export const adminMenu: MenuGroup[] = [
	// Dashboard Group
	{
		groupLabel: 'Dashboard',
		menus: [
			{
				icon: 'LayoutDashboard',
				label: 'Dashboard',
				href: '/admin',
			},
		],
	},

	// Academic Management Group
	{
		groupLabel: 'Academic Management',
		menus: [
			{
				icon: 'School2',
				label: 'Classes',
				href: '/admin/classes',
			},
			{
				icon: 'Book',
				label: 'Sections/Groups',
				href: '/admin/sections',
			},
			{
				icon: 'Timer',
				label: 'Sessions',
				href: '/admin/session',
			},

			// {
			// 	icon: 'BookOpen',
			// 	label: 'Subjects',
			// 	href: '/admin/subjects',
			// },
			// {
			// 	icon: 'CalendarRange',
			// 	label: 'Routine',
			// 	href: '/admin/class-routine',
			// },
			{
				icon: 'GraduationCap',
				label: 'Students',
				href: '/admin/students',
			},
			// {
			// 	icon: 'Users',
			// 	label: 'Employees',
			// 	href: '/admin/employees',
			// },
		],
	},

	// Examination Management Group
	// {
	// 	groupLabel: 'Examination',
	// 	menus: [
	// 		{
	// 			icon: 'PenSquare',
	// 			label: 'Exams',
	// 			href: '/admin/exams',
	// 		},
	// 		{
	// 			icon: 'CalendarRange',
	// 			label: 'Exam Schedules',
	// 			href: '/admin/exam-schedules',
	// 		},
	// 		{
	// 			icon: 'Award',
	// 			label: 'Results',
	// 			href: '/admin/result',
	// 		},
	// 		{
	// 			icon: 'PenSquare',
	// 			label: 'Admit Card',
	// 			href: '/admin/admit-card',
	// 		},
	// 	],
	// },

	// Attendance Group
	// {
	// 	groupLabel: 'Attendance',
	// 	menus: [
	// 		{
	// 			icon: 'ClipboardCheck',
	// 			label: 'Student Attendance',
	// 			href: '/admin/student-attendance',
	// 		},
	// 		{
	// 			icon: 'ClipboardCheck',
	// 			label: 'Employee Attendance',
	// 			href: '/admin/employee-attendance',
	// 		},
	// 	],
	// },

	// Financial Management Group
	{
		groupLabel: 'Financial Management',
		menus: [
			{
				icon: 'CreditCard',
				label: 'Fee Management',
				href: '#',
				submenus: [
					{
						icon: 'Grid2X2',
						label: 'Fee Structures',
						href: '/admin/fee-structures',
					},
					{
						icon: 'HandCoins',
						label: 'Fee Collection',
						href: '/admin/fees',
					},
					{
						icon: 'CirclePlus',
						label: 'Add New Fee',
						href: '/admin/fees/add',
					},
				],
			},
			{
				label: 'School Finance',
				icon: 'PieChart',
				href: '#',
				submenus: [
					{
						icon: 'Wallet',
						label: 'Accounts',
						href: '/admin/accounts',
					},
					{
						icon: 'Receipt',
						label: 'Transactions',
						href: '/admin/transactions',
					},
				],
			},

			// {
			// 	icon: 'BadgeDollarSign',
			// 	label: 'Salary Management',
			// 	href: '/admin/salaries',
			// },
		],
	},

	// Exam Management Group
	{
		groupLabel: 'Exam Management',
		menus: [
			{
				label: 'Exam Management',
				icon: 'NotebookPen',
				href: '#',
				submenus: [
					{
						icon: 'Notebook',
						label: 'Exams',
						href: '/admin/exam',
					},
					{
						icon: 'BookCopy',
						label: 'Subjects',
						href: '/admin/subjects',
					},
					{
						icon: 'CalendarRange',
						label: 'Exam Schedules',
						href: '/admin/exam-schedules',
					},
				],
			},
			{
				label: 'Result Management',
				icon: 'Award',
				href: '#',
				submenus: [
					{
						icon: 'Paperclip',
						label: 'Results Entry',
						href: '/admin/result-entry',
					},
				],
			},
		],
	},

	// Communication & Documents Group
	{
		groupLabel: 'Communication & Documents',
		menus: [
			// {
			// 	icon: 'MessagesSquare',
			// 	label: 'SMS Management',
			// 	href: '/admin/sms-management',
			// },
			{
				icon: 'Bell',
				label: 'Notices',
				href: '/admin/notice',
			},
			// {
			// 	icon: 'IdCard',
			// 	label: 'ID Cards',
			// 	href: '/admin/id-card',
			// },
			// {
			// 	icon: 'MessageSquareQuote',
			// 	label: 'Testimonials',
			// 	href: '/admin/testimonials',
			// },
		],
	},
]

export const menuGroups = [
	// Student Panel
	{
		name: 'Student Panel',
		menuItems: [
			{
				icon: LayoutDashboard,
				label: 'Dashboard',
				route: '/dashboard',
			},
			{
				icon: CreditCard,
				label: 'Billing',
				route: '/dashboard/student/billing',
			},
			{
				icon: FileSpreadsheet,
				label: 'Result',
				route: '/dashboard/student/result',
			},
			{
				icon: ClipboardList,
				label: 'Attendence',
				route: '/dashboard/student/attendance',
			},
			{
				icon: CalendarDays,
				label: 'Class Schedule',
				route: '/dashboard/student/routine',
			},
		],
	},
	// Teacher Panel
	{
		permittedTo: ['teacher'],
		name: 'Teacher Panel',
		menuItems: [
			{
				icon: LayoutDashboard,
				label: 'Dashboard',
				route: '/dashboard',
			},
			{
				icon: UserCircle,
				label: 'Student Attendance',
				route: '/dashboard/teacher/student-attendance',
			},
			{
				icon: CalendarCheck,
				label: 'Class Schedule',
				route: '/dashboard/teacher/schedule',
			},
			{
				icon: ClipboardSignature,
				label: 'Attendence',
				route: '/dashboard/teacher/attendance',
			},
			{
				icon: Coins,
				label: 'Salaries',
				route: '/dashboard/teacher/salaries',
			},
		],
	},
	// Employee Panel
	{
		permittedTo: ['employee'],
		name: 'Employee Panel',
		menuItems: [
			{
				icon: LayoutDashboard,
				label: 'Dashboard',
				route: '/dashboard',
			},
			{
				icon: Coins,
				label: 'Salaries',
				route: '/dashboard/employee/salaries',
			},
			{
				icon: ClipboardSignature,
				label: 'Attendence',
				route: '/dashboard/employee/attendance',
			},
		],
	},
	// Admin Panel
	{
		permittedTo: ['admin'],
		name: 'Admin Panel',
		menuItems: [
			{
				icon: LayoutDashboard,
				label: 'Dashboard',
				route: '/dashboard',
			},
			{
				icon: School2,
				label: 'Classes',
				route: '/dashboard/admin/classes',
			},
			{
				icon: Grid2X2,
				label: 'Fees Structures',
				route: '/dashboard/admin/fee-structures',
			},
			{
				icon: GraduationCap,
				label: 'Students',
				route: '/dashboard/admin/students',
			},
			{
				icon: IdCard,
				label: 'ID Cards',
				route: '/dashboard/admin/id-card',
			},
			{
				icon: PenSquare,
				label: 'Admit Card',
				route: '/dashboard/admin/admit-card',
			},
			{
				icon: MessageSquareQuote,
				label: 'Testimonials',
				route: '/dashboard/admin/testimonials',
			},
			{
				icon: Users,
				label: 'Employees',
				route: '/dashboard/admin/employees',
			},
			{
				icon: BookOpen,
				label: 'Subjects',
				route: '/dashboard/admin/subjects',
			},
			{
				icon: CalendarRange,
				label: 'Routine',
				route: '/dashboard/admin/routine',
			},
			{
				icon: ClipboardCheck,
				label: 'Student Attendance',
				route: '/dashboard/admin/student-attendance',
			},
			{
				icon: ClipboardCheck,
				label: 'Employee Attendance',
				route: '/dashboard/admin/employee-attendance',
			},
			{
				icon: PenSquare,
				label: 'Exams',
				route: '/dashboard/admin/exams',
			},
			{
				icon: Award,
				label: 'Results',
				route: '/dashboard/admin/result',
			},
			{
				icon: Wallet,
				label: 'Fees Management',
				route: '/dashboard/admin/fees',
			},
			{
				icon: BadgeDollarSign,
				label: 'Salary Management',
				route: '/dashboard/admin/salaries',
			},
			{
				icon: Receipt,
				label: 'Transactions',
				route: '/dashboard/admin/transactions',
			},
			{
				icon: MessagesSquare,
				label: 'SMS Management',
				route: '/dashboard/admin/sms-management',
			},
			{
				icon: Bell,
				label: 'Notices',
				route: '/dashboard/admin/notices',
			},
		],
	},
	// CMS Admin Panel
	{
		permittedTo: ['cmsAdmin', 'superAdmin'],
		name: 'CMS Admin Panel',
		menuItems: [
			{
				icon: LayoutDashboard,
				label: 'Dashboard',
				route: '/cms',
			},
			{
				icon: Building2,
				label: 'Tenant Management',
				route: '/cms/tenants/list',
				permittedTo: ['superAdmin', 'cmsAdmin'],
			},
			{
				icon: UserCog,
				label: 'Tenant Admins',
				route: '/cms/tenants/admins',
				permittedTo: ['superAdmin'],
			},
			{
				icon: Mail,
				label: 'SMS Orders',
				route: '/cms/tenants/sms-orders',
				permittedTo: ['superAdmin'],
			},
			{
				icon: Wallet,
				label: 'Payment History',
				route: '/cms/tenants/payments',
				permittedTo: ['superAdmin'],
			},
			{
				icon: Receipt,
				label: 'Transactions',
				route: '/cms/tenants/transactions',
			},
		],
	},
]
export const feeCategories = [
	{
		value: 'form_fees',
		label: 'Form Fees',
	},
	{
		value: 'admission_fees',
		label: 'Admission Fees',
	},
	{
		value: 'monthly_fees',
		label: 'Monthly Fees',
	},
	{
		label: 'Book',
		value: 'book_fees',
	},
	{
		label: 'Syllabus',
		value: 'syllabus_fees',
	},
	{
		label: 'ID Card',
		value: 'id_card_fees',
	},
	{
		label: 'Dress',
		value: 'dress_fees',
	},
	{
		label: 'Prottoyon Fee',
		value: 'prottoyon_fees',
	},
	{
		label: 'Stationary',
		value: 'stationary_fees',
	},
	{
		value: 'exam_fees',
		label: 'Examination Fees',
	},
	{
		value: 'hostel_fees',
		label: 'Hostel Fees',
	},
	{
		value: 'laboratory_fees',
		label: 'Laboratory Fees',
	},
	{
		value: 'library_fees',
		label: 'Library Fees',
	},
	{
		value: 'transport_fees',
		label: 'Transport Fees',
	},
	{
		value: 'other_fees',
		label: 'Other Fees',
	},
]

export const salaryCategories = [
	{
		value: 'monthly_salary',
		label: 'Monthly Salary',
	},
	{
		value: 'bonus',
		label: 'Bonus',
	},
	{
		value: 'overtime_payment',
		label: 'Overtime Payment',
	},
	{
		value: 'yearly_increment',
		label: 'Yearly Increment',
	},
	{
		value: 'allowances',
		label: 'Allowances',
	},
]

export const currencySimbols = {
	BDT: '৳',
	USD: '$',
}

export const expenseCategories = [
	...feeCategories,
	...salaryCategories,
	{
		value: 'bank_deposit',
		label: 'Bank Deposit',
	},
	{
		value: 'bank_withdrawal',
		label: 'Bank Withdrawal',
	},
	{
		value: 'donations',
		label: 'Donations & Grants',
	},
	{
		value: 'cafeteria_income',
		label: 'Cafeteria Income',
	},
	{
		value: 'utilities',
		label: 'Utilities',
	},
	{
		value: 'maintenance',
		label: 'Building Maintenance',
	},
	{
		value: 'supplies',
		label: 'Office Supplies',
	},
	{
		value: 'teaching_supplies',
		label: 'Teaching Supplies',
	},
	{
		value: 'equipment',
		label: 'Equipment',
	},
	{
		value: 'technology',
		label: 'Technology & IT',
	},
	{
		value: 'library_resources',
		label: 'Library Resources',
	},
	{
		value: 'sports_equipment',
		label: 'Sports Equipment',
	},

	{
		value: 'marketing',
		label: 'Marketing & Advertising',
	},
	{
		value: 'security',
		label: 'Security Services',
	},
	{
		value: 'student_activities',
		label: 'Student Activities',
	},
	{
		value: 'cleaning',
		label: 'Cleaning Services',
	},
	{
		value: 'furniture',
		label: 'Furniture',
	},
	{
		value: 'repairs',
		label: 'Repairs',
	},

	{
		value: 'scholarships',
		label: 'Scholarships',
	},
	{
		value: 'miscellaneous',
		label: 'Miscellaneous',
	},
]

export const roles = [
	{
		value: 'principal',
		label: 'Principal',
	},
	{
		value: 'vice_principal',
		label: 'Vice Principal',
	},
	{
		value: 'teacher',
		label: 'Teacher',
	},
	{
		value: 'coordinator',
		label: 'Coordinator',
	},
	{
		value: 'assistant_teacher',
		label: 'Assistant Teacher',
	},
	{
		value: 'student_counselor',
		label: 'Student Counselor',
	},
	{
		value: 'librarian',
		label: 'Librarian',
	},
	{
		value: 'lab_technician',
		label: 'Lab Technician',
	},
	{
		value: 'accountant',
		label: 'Accountant',
	},
	{
		value: 'maintenance_staff',
		label: 'Maintenance Staff',
	},
]

export const examTypes = [
	{
		label: 'First-Term',
		value: 'first_term',
	},
	{
		label: 'Second-Term',
		value: 'second_term',
	},
	{
		label: 'Midterm',
		value: 'midterm',
	},
	{
		label: 'Final',
		value: 'final',
	},
	{
		label: 'Lab',
		value: 'lab',
	},
	{
		label: 'Test',
		value: 'test',
	},
	{
		label: 'Exam',
		value: 'exam',
	},
	{
		label: 'Assignment',
		value: 'assignment',
	},
	{
		label: 'Incourse',
		value: 'incourse',
	},
	{
		label: 'Project',
		value: 'project',
	},
	{
		label: 'Quiz',
		value: 'quiz',
	},
]

export const companyTransactionCategories = [
	{ label: 'Domain Revenue', value: 'domain_revenue' },
	{ label: 'Monthly Subscription', value: 'monthly_subscription' },
	{ label: 'Product Sales', value: 'product_sales' }, // Income
	{ label: 'Service Revenue', value: 'service_revenue' }, // Income
	{ label: 'Subscription Revenue', value: 'subscription_revenue' }, // Income
	{ label: 'Advertising Revenue', value: 'advertising_revenue' }, // Income
	{ label: 'Investment Income', value: 'investment_income' }, // Income
	{ label: 'Rental Income', value: 'rental_income' }, // Income
	{ label: 'Miscellaneous Income', value: 'misc_income' }, // Income
	{ label: 'Salaries', value: 'salaries' }, // Expense
	{ label: 'Office Rent', value: 'office_rent' }, // Expense
	{ label: 'Utilities', value: 'utilities' }, // Expense
	{ label: 'Marketing', value: 'marketing' }, // Expense
	{ label: 'Travel', value: 'travel' }, // Expense
	{ label: 'Software and Tools', value: 'software_tools' }, // Expense
	{ label: "Owner's Draw", value: 'owners_draw' }, // Expense
	{ label: 'Miscellaneous Expense', value: 'misc_expense' }, // Expense
]

export const SMSPerTaka = 2.4

export const WEEKEND_DAYS = ['Friday']

interface EmailTemplate {
	subject: string
	text: string
	html: string
}
export const emailTemplates: {
	[key in 'paymentSuccess' | 'paymentFailure']: EmailTemplate
} = {
	paymentSuccess: {
		subject: 'Payment Successful - VisionSoftwares',
		text: `Dear Customer,

Thank you for your payment! Your transaction has been successfully processed.

Transaction Details:
- Amount: $[amount]
- Transaction ID: [transactionId]
- Date: [date]

If you have any questions or concerns, feel free to contact us at support@visionsoftwares.xyz.

Best regards,
VisionSoftwares Team`,
		html: `
      <p>Dear Customer,</p>
      <p>Thank you for your payment! Your transaction has been successfully processed.</p>
      <h3>Transaction Details:</h3>
      <ul>
        <li>Amount: <strong>$[amount]</strong></li>
        <li>Transaction ID: <strong>[transactionId]</strong></li>
        <li>Date: <strong>[date]</strong></li>
      </ul>
      <p>If you have any questions or concerns, feel free to contact us at <a href="mailto:support@visionsoftwares.xyz">support@visionsoftwares.xyz</a>.</p>
      <p>Best regards,</p>
      <p><strong>VisionSoftwares Team</strong></p>
    `,
	},
	paymentFailure: {
		subject: 'Payment Failed - VisionSoftwares',
		text: `Dear Customer,

Unfortunately, your payment could not be processed at this time.

Please check the following:
- Ensure that your payment details are correct.
- Verify that your account has sufficient funds.
- Contact your bank if the issue persists.

You can retry the payment or contact us at support@visionsoftwares.xyz for assistance.

We apologize for any inconvenience caused.

Best regards,
VisionSoftwares Team`,
		html: `
      <p>Dear Customer,</p>
      <p>Unfortunately, your payment could not be processed at this time.</p>
      <p>Please check the following:</p>
      <ul>
        <li>Ensure that your payment details are correct.</li>
        <li>Verify that your account has sufficient funds.</li>
        <li>Contact your bank if the issue persists.</li>
      </ul>
      <p>You can retry the payment or contact us at <a href="mailto:support@visionsoftwares.xyz">support@visionsoftwares.xyz</a> for assistance.</p>
      <p>We apologize for any inconvenience caused.</p>
      <p>Best regards,</p>
      <p><strong>VisionSoftwares Team</strong></p>
    `,
	},
}

export const isRegistrationActive = false
