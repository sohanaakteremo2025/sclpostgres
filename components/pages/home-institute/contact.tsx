'use client'
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react'
import { Tenant } from '@prisma/client'

const ContactInfo = ({ tenant }: { tenant: Tenant | null }) => (
	<div>
		<h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
		<div className="space-y-6">
			<div className="flex items-center space-x-4">
				<MapPin className="w-6 h-6 text-emerald-400" />
				<p>{tenant?.address}</p>
			</div>
			<div className="flex items-center space-x-4">
				<Phone className="w-6 h-6 text-emerald-400" />
				<p>{tenant?.phone}</p>
			</div>
			<div className="flex items-center space-x-4">
				<Mail className="w-6 h-6 text-emerald-400" />
				<p>{tenant?.email}</p>
			</div>
		</div>
	</div>
)

const ContactForm = () => (
	<form className="space-y-4">
		<input
			type="text"
			placeholder="Your Name"
			className="w-full px-4 py-3 rounded-lg bg-emerald-800 border border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
		/>
		<input
			type="email"
			placeholder="Your Email"
			className="w-full px-4 py-3 rounded-lg bg-emerald-800 border border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
		/>
		<textarea
			placeholder="Your Message"
			rows={4}
			className="w-full px-4 py-3 rounded-lg bg-emerald-800 border border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
		/>
		<button className="w-full bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 group">
			<span>Send Message</span>
			<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
		</button>
	</form>
)

export function Contact({ data }: { data: any }) {
	return (
		<div id="contact" className="bg-emerald-900 text-white py-16">
			<div className="container mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					<ContactInfo tenant={data} />
					<ContactForm />
				</div>
			</div>
		</div>
	)
}
