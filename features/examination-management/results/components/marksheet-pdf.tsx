'use client'

import { forwardRef } from 'react'
import { StudentMarksheetData } from '../api/student-marksheet.action'

interface MarksheetPDFProps {
	data: StudentMarksheetData
	tenantInfo?: {
		name: string
		logo?: string
		address?: string
	}
}

export const MarksheetPDF = forwardRef<HTMLDivElement, MarksheetPDFProps>(
	({ data, tenantInfo }, ref) => {
		// Group results by exam type
		const groupedResults = data.results.reduce((acc, result) => {
			const examType = result.examSchedule.exam.examType.name
			if (!acc[examType]) {
				acc[examType] = []
			}
			acc[examType].push(result)
			return acc
		}, {} as Record<string, typeof data.results>)

		// Calculate overall statistics
		const totalMarks = data.results.reduce((sum, result) => sum + result.totalMarks, 0)
		const obtainedMarks = data.results.reduce((sum, result) => sum + result.obtainedMarks, 0)
		const averagePercentage = data.results.length > 0 
			? data.results.reduce((sum, result) => sum + result.percentage, 0) / data.results.length
			: 0

		// Grade distribution
		const gradeDistribution = data.results.reduce<Record<string, number>>((acc, result) => {
			if (result.grade && !result.isAbsent) {
				acc[result.grade] = (acc[result.grade] || 0) + 1
			}
			return acc
		}, {})

		return (
			<div ref={ref} className="bg-white p-8 min-h-screen" style={{ fontFamily: 'Arial, sans-serif' }}>
				{/* Header */}
				<div className="text-center mb-8 border-b-2 pb-6">
					<div className="flex items-center justify-center gap-4 mb-4">
						{tenantInfo?.logo && (
							<img 
								src={tenantInfo.logo} 
								alt="School Logo" 
								className="h-16 w-16 object-contain"
							/>
						)}
						<div>
							<h1 className="text-3xl font-bold text-gray-800">
								{tenantInfo?.name || 'School Management System'}
							</h1>
							{tenantInfo?.address && (
								<p className="text-gray-600 mt-1">{tenantInfo.address}</p>
							)}
						</div>
					</div>
					<h2 className="text-2xl font-semibold text-gray-700">Academic Marksheet</h2>
				</div>

				{/* Student Information */}
				<div className="grid grid-cols-2 gap-8 mb-8">
					<div className="space-y-3">
						<div className="flex">
							<span className="font-semibold w-32">Student Name:</span>
							<span className="text-lg">{data.name}</span>
						</div>
						<div className="flex">
							<span className="font-semibold w-32">Roll Number:</span>
							<span>{data.roll}</span>
						</div>
						<div className="flex">
							<span className="font-semibold w-32">Class:</span>
							<span>{data.class.name}{data.section ? ` - ${data.section.name}` : ''}</span>
						</div>
					</div>
					<div className="space-y-3">
						<div className="flex">
							<span className="font-semibold w-32">Student ID:</span>
							<span>{data.id}</span>
						</div>
						<div className="flex">
							<span className="font-semibold w-32">Issue Date:</span>
							<span>{new Date().toLocaleDateString()}</span>
						</div>
						<div className="flex">
							<span className="font-semibold w-32">Academic Year:</span>
							<span>2024-25</span>
						</div>
					</div>
				</div>

				{/* Results by Exam Type */}
				{Object.entries(groupedResults).map(([examType, results]) => (
					<div key={examType} className="mb-8">
						<h3 className="text-xl font-semibold mb-4 bg-gray-100 p-3 rounded">
							{examType} Results
						</h3>
						<div className="overflow-hidden border border-gray-300 rounded-lg">
							<table className="w-full">
								<thead>
									<tr className="bg-gray-50 border-b">
										<th className="text-left p-3 font-semibold">Subject</th>
										<th className="text-center p-3 font-semibold">Components</th>
										<th className="text-center p-3 font-semibold">Marks Obtained</th>
										<th className="text-center p-3 font-semibold">Total Marks</th>
										<th className="text-center p-3 font-semibold">Percentage</th>
										<th className="text-center p-3 font-semibold">Grade</th>
									</tr>
								</thead>
								<tbody>
									{results.map((result, index) => (
										<tr key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
											<td className="p-3 border-b">
												<div>
													<div className="font-medium">{result.examSchedule.subject.name}</div>
													<div className="text-sm text-gray-500">
														{result.examSchedule.subject.code}
													</div>
												</div>
											</td>
											<td className="p-3 border-b text-center">
												{result.isAbsent ? (
													<span className="text-red-600 font-medium">ABSENT</span>
												) : (
													<div className="text-sm space-y-1">
														{result.componentResults.map((cr, idx) => (
															<div key={idx}>
																{cr.examComponent.name}: {cr.isAbsent ? 'Absent' : `${cr.obtainedMarks}/${cr.examComponent.maxMarks}`}
															</div>
														))}
													</div>
												)}
											</td>
											<td className="p-3 border-b text-center font-medium">
												{result.isAbsent ? '-' : result.obtainedMarks}
											</td>
											<td className="p-3 border-b text-center">
												{result.totalMarks}
											</td>
											<td className="p-3 border-b text-center font-medium">
												{result.isAbsent ? '-' : `${result.percentage.toFixed(1)}%`}
											</td>
											<td className="p-3 border-b text-center">
												<span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
													result.isAbsent ? 'bg-red-100 text-red-800' :
													result.grade?.startsWith('A') ? 'bg-green-100 text-green-800' :
													result.grade?.startsWith('B') ? 'bg-blue-100 text-blue-800' :
													result.grade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
													'bg-red-100 text-red-800'
												}`}>
													{result.isAbsent ? 'AB' : result.grade || 'N/A'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				))}

				{/* Overall Summary */}
				<div className="border-t-2 pt-6 mt-8">
					<h3 className="text-xl font-semibold mb-4">Overall Performance Summary</h3>
					<div className="grid grid-cols-3 gap-6 mb-6">
						<div className="bg-blue-50 p-4 rounded-lg text-center">
							<div className="text-2xl font-bold text-blue-600">{data.results.length}</div>
							<div className="text-sm text-blue-800">Total Subjects</div>
						</div>
						<div className="bg-green-50 p-4 rounded-lg text-center">
							<div className="text-2xl font-bold text-green-600">{obtainedMarks}/{totalMarks}</div>
							<div className="text-sm text-green-800">Total Marks</div>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg text-center">
							<div className="text-2xl font-bold text-purple-600">{averagePercentage.toFixed(1)}%</div>
							<div className="text-sm text-purple-800">Average Percentage</div>
						</div>
					</div>

					{/* Grade Distribution */}
					{Object.keys(gradeDistribution).length > 0 && (
						<div className="mb-6">
							<h4 className="font-semibold mb-2">Grade Distribution:</h4>
							<div className="flex gap-4 flex-wrap">
								{Object.entries(gradeDistribution).map(([grade, count]) => (
									<span key={grade} className="inline-block px-3 py-1 bg-gray-100 rounded">
										Grade {grade}: {count} subject{count > 1 ? 's' : ''}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Performance Remarks */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h4 className="font-semibold mb-2">Remarks:</h4>
						<p className="text-gray-700">
							{averagePercentage >= 80 ? 
								'Excellent performance! The student has demonstrated outstanding academic achievement across all subjects.' :
							averagePercentage >= 70 ? 
								'Very good performance! The student shows strong academic capabilities with room for further improvement.' :
							averagePercentage >= 60 ? 
								'Good performance! The student has achieved satisfactory results with consistent effort.' :
							averagePercentage >= 40 ? 
								'Average performance. The student should focus more on studies and seek additional support if needed.' :
								'Below average performance. The student requires immediate attention and additional support to improve academic standing.'
							}
						</p>
					</div>
				</div>

				{/* Signature Section */}
				<div className="flex justify-between items-end mt-12 pt-8 border-t">
					<div className="text-center">
						<div className="w-48 border-b border-gray-400 mb-2"></div>
						<p className="text-sm text-gray-600">Class Teacher</p>
					</div>
					<div className="text-center">
						<div className="w-48 border-b border-gray-400 mb-2"></div>
						<p className="text-sm text-gray-600">Principal</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8 text-xs text-gray-500">
					<p>This is a computer-generated marksheet. No signature required.</p>
					<p>Generated on {new Date().toLocaleString()}</p>
				</div>
			</div>
		)
	}
)

MarksheetPDF.displayName = 'MarksheetPDF'