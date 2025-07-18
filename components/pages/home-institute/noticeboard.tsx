import React from 'react'
import { Bell, Calendar } from 'lucide-react'
import { Notice } from '@prisma/client'
import { getAllNoticesByTenantId } from '@/lib/actions/notice.action'

// const getNotices = unstable_cache(
// 	async (id: string) => getAllNoticesByTenantId(id),
// 	['tenant'],
// 	{ revalidate: 3600 }, // Cache for 1 hour
// )

export async function NoticeBoard({ data }: { data: any }) {
	const notices = await getAllNoticesByTenantId(data?.id)

	return (
		<div className="bg-white py-16">
			<div className="container mx-auto px-6">
				<div className="flex items-center justify-center mb-12">
					<Bell className="w-8 h-8 text-emerald-600 mr-3" />
					<h2 className="text-4xl font-bold text-gray-800">Notice Board</h2>
				</div>
				<div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
					{notices.length === 0 && (
						<div className="flex items-center justify-center p-6 bg-white border border-emerald-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
							<p className="text-gray-600">No notices published</p>
						</div>
					)}
					{notices.map((notice: Notice, index: number) => (
						<div
							key={index}
							className="bg-white border border-emerald-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<Calendar className="w-6 h-6 text-emerald-600" />
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-800">
											{notice.title}
										</h3>
										<span className="text-sm text-emerald-600 font-medium">
											{notice.date}
										</span>
									</div>
									<p className="mt-2 text-gray-600">{notice.content}</p>
								</div>
							</div>
						</div>
					))}
				</div>
				{/* <div className="text-center mt-8">
					<button className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold">
						View All Notices
						<span className="ml-2">→</span>
					</button>
				</div> */}
			</div>
		</div>
	)
}
