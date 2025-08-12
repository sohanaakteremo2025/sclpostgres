'use client'

import React from 'react'
import { Home, Search, MessageCircle, ArrowLeft, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				{/* Main 404 Section */}
				<div className="text-center mb-12">
					<div className="relative">
						{/* Large 404 with educational elements */}
						<div className="text-8xl md:text-9xl font-bold text-blue-100 select-none">
							404
						</div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="bg-white rounded-full p-6 shadow-lg">
								<Search className="w-16 h-16 text-blue-500" />
							</div>
						</div>
					</div>

					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8 mb-4">
						Page Not Found
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
						Sorry, we couldn't find the page you're looking for in our
						institution management system. The resource may have been moved,
						deleted, or you may have entered an incorrect URL.
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Button
							onClick={() => window.history.back()}
							variant="outline"
							size="lg"
							className="gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Go Back
						</Button>
						<Link href="/">
							<Button size="lg" className="gap-2 w-full sm:w-auto">
								<Home className="w-4 h-4" />
								Dashboard Home
							</Button>
						</Link>
					</div>
				</div>

				{/* Help Section */}
				<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
					<CardHeader className="text-center">
						<CardTitle className="text-xl text-blue-900 flex items-center justify-center gap-2">
							<MessageCircle className="w-5 h-5" />
							Need Help?
						</CardTitle>
						<CardDescription className="text-blue-700">
							Can't find what you're looking for? Our support team is here to
							help.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Contact Options */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* WhatsApp Contact */}
							<a
								href="https://wa.me/+8801641663053?text=Hi%2C%20I%20need%20help%20with%20our%20school%20management%20system.%20I%20encountered%20a%20404%20error%20and%20can%27t%20find%20the%20page%20I%27m%20looking%20for.%20Can%20you%20please%20assist%3F"
								target="_blank"
								rel="noopener noreferrer"
								className="block"
							>
								<div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors group cursor-pointer">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
											<MessageCircle className="w-5 h-5 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-green-900">
												WhatsApp Support
											</h3>
											<p className="text-sm text-green-700">Get instant help</p>
										</div>
									</div>
								</div>
							</a>

							{/* Phone Support */}
							<a href="tel:+8801641663053" className="block">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors group cursor-pointer">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
											<Phone className="w-5 h-5 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-blue-900">
												Call Support
											</h3>
											<p className="text-sm text-blue-700">+880 164 166 3053</p>
										</div>
									</div>
								</div>
							</a>

							{/* Email Support */}
							<a href="mailto:hamid.coder.js@gmail.com" className="block">
								<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors group cursor-pointer">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
											<Mail className="w-5 h-5 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-purple-900">
												Email Support
											</h3>
											<p className="text-sm text-purple-700">
												Send us a message
											</p>
										</div>
									</div>
								</div>
							</a>
						</div>

						<Separator />

						{/* Common Issues */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-3">
								Common Issues:
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
								<div className="flex items-center gap-2 text-gray-600">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
									Check your institution subdomain
								</div>
								<div className="flex items-center gap-2 text-gray-600">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
									Verify your access permissions
								</div>
								<div className="flex items-center gap-2 text-gray-600">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
									Clear browser cache and cookies
								</div>
								<div className="flex items-center gap-2 text-gray-600">
									<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
									Contact your system administrator
								</div>
							</div>
						</div>

						{/* Search Suggestion */}
						<div className="bg-white rounded-lg p-4 border border-gray-200">
							<h4 className="font-medium text-gray-900 mb-2">
								Try searching for:
							</h4>
							<div className="flex flex-wrap gap-2">
								{[
									'Student Records',
									'Course Management',
									'Fee Payment',
									'Academic Calendar',
									'Reports',
								].map(term => (
									<span
										key={term}
										className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
									>
										{term}
									</span>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8 text-gray-500 text-sm">
					<p>© 2025 Institution Management System. All rights reserved.</p>
					<p className="mt-1">
						Powered by modern education technology solutions
					</p>
				</div>
			</div>
		</div>
	)
}
