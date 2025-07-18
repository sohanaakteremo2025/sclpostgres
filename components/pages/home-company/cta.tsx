'use client'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function CTA() {
	const whatsappNumber = siteConfig.whatsapp // Replace with your actual WhatsApp number
	const message = encodeURIComponent(
		"Hi, I'm interested in learning more. Can you provide more information?",
	)
	const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

	return (
		<section id="cta" className="bg-blue-600 text-white py-20">
			<div className="max-w-7xl mx-auto px-4 text-center">
				<h2 className="text-3xl font-bold mb-4">
					Ready to Transform Your Institution?
				</h2>
				<p className="text-xl mb-8">
					Chat with us on WhatsApp to start your free trial or learn more.
				</p>
				<Button
					size="lg"
					className="bg-green-500 hover:bg-green-600 text-white"
					onClick={() => window.open(whatsappUrl, '_blank')}
				>
					<MessageCircle className="w-5 h-5 mr-2" />
					Chat on WhatsApp
				</Button>
			</div>
		</section>
	)
}
