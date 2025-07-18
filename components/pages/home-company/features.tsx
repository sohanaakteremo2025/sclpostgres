import {
	LayoutDashboard,
	GraduationCap,
	Users,
	BookOpen,
	Calendar,
	ClipboardCheck,
	FileSpreadsheet,
	Calculator,
	Receipt,
	Wallet,
	CircleDollarSign,
	Building2,
	MessagesSquare,
	BookMarked,
	LibraryBig,
	Bus,
	Bell,
	Settings,
} from 'lucide-react'

const features = [
	{
		icon: LayoutDashboard,
		title: 'Smart Dashboard',
		description:
			'Comprehensive overview of institution metrics and activities in real-time.',
		color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
	},
	{
		icon: GraduationCap,
		title: 'Class Management',
		description:
			'Organize and manage classes, sections, and academic schedules efficiently.',
		color: 'bg-blue-50 text-blue-600 border-blue-100',
	},
	{
		icon: Users,
		title: 'Student Management',
		description:
			'Complete student lifecycle management from admission to graduation.',
		color: 'bg-violet-50 text-violet-600 border-violet-100',
	},
	{
		icon: Building2,
		title: 'Employee Management',
		description: 'Handle staff records, roles, and departmental assignments.',
		color: 'bg-purple-50 text-purple-600 border-purple-100',
	},
	{
		icon: BookOpen,
		title: 'Subject Management',
		description:
			'Manage curriculum, subjects, and course materials across departments.',
		color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
	},
	{
		icon: Calendar,
		title: 'Routine Management',
		description:
			'Create and manage class schedules, exam timetables, and events.',
		color: 'bg-teal-50 text-teal-600 border-teal-100',
	},
	{
		icon: ClipboardCheck,
		title: 'Student Attendance',
		description:
			'Track and manage student attendance with automated reporting.',
		color: 'bg-sky-50 text-sky-600 border-sky-100',
	},
	{
		icon: FileSpreadsheet,
		title: 'Employee Attendance',
		description: 'Monitor staff attendance and generate detailed reports.',
		color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
	},
	{
		icon: Calculator,
		title: 'Examination System',
		description:
			'Conduct exams, manage question banks, and generate report cards.',
		color: 'bg-rose-50 text-rose-600 border-rose-100',
	},
	{
		icon: Receipt,
		title: 'Results Management',
		description:
			'Process and publish examination results with grade calculations.',
		color: 'bg-pink-50 text-pink-600 border-pink-100',
	},
	{
		icon: Wallet,
		title: 'Fees Management',
		description: 'Handle student fees, generate invoices, and track payments.',
		color: 'bg-amber-50 text-amber-600 border-amber-100',
	},
	{
		icon: CircleDollarSign,
		title: 'Salary Management',
		description: 'Process staff salaries, bonuses, and manage payroll.',
		color: 'bg-yellow-50 text-yellow-600 border-yellow-100',
	},
	{
		icon: BookMarked,
		title: 'Library Management',
		description: 'Manage books, issue returns, and track library resources.',
		color: 'bg-orange-50 text-orange-600 border-orange-100',
	},
	{
		icon: Bus,
		title: 'Transport Management',
		description:
			'Organize transport routes, vehicles, and track student transport.',
		color: 'bg-lime-50 text-lime-600 border-lime-100',
	},
	{
		icon: MessagesSquare,
		title: 'Communication',
		description: 'Send notifications to students, parents, and staff members.',
		color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
	},
	{
		icon: Bell,
		title: 'Notice Board',
		description: 'Share announcements, events, and important updates.',
		color: 'bg-red-50 text-red-600 border-red-100',
	},
	{
		icon: LibraryBig,
		title: 'Resource Management',
		description: 'Manage classrooms, labs, and institutional resources.',
		color: 'bg-green-50 text-green-600 border-green-100',
	},
	{
		icon: Settings,
		title: 'System Settings',
		description: 'Customize system preferences and manage user permissions.',
		color: 'bg-slate-50 text-slate-600 border-slate-100',
	},
]

export default function Features() {
	return (
		<section id="features" className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-4">
					Comprehensive Institution Management
				</h2>
				<p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
					Everything you need to manage your educational institution efficiently
					in one integrated platform.
				</p>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<div
							key={index}
							className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all duration-300 ${feature.color}`}
						>
							<div className="flex items-center mb-4">
								<feature.icon className="w-6 h-6 mr-3" />
								<h3 className="text-lg font-semibold">{feature.title}</h3>
							</div>
							<p className="text-gray-700">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
