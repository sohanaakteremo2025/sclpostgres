'use client'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { contactWhatsapp } from '@/utils/whatsapp-contact'
import { siteConfig } from '@/config/site'

const plans = [
	{
		name: 'Starter',
		price: '৳1,200',
		description: 'Ideal for small institutions',
		features: [
			'Up to 2000 students',
			'10 teachers/staff',
			'Basic reporting',
			'Email support',
		],
	},
	{
		name: 'Professional',
		price: '৳3,500',
		description: 'Perfect for medium-sized institutions',
		features: [
			'Up to 5,000 students',
			'Unlimited teachers/staff',
			'Advanced reporting & analytics',
			'24/7 premium support',
			'Custom modules',
		],
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		description: 'For large institutions and universities',
		features: [
			'Unlimited students & staff',
			'High-performance API',
			'Dedicated account manager',
			'On-site training',
			'Custom integrations',
		],
	},
]

export default function Pricing() {
	return (
		<section id="pricing" className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<h2 className="text-3xl font-bold text-center mb-4">
					Our Pricing Plans
				</h2>
				<p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
					Choose the plan that fits your institution's size and needs. Starting
					from just ৳1,200 per month!
				</p>
				<div className="grid md:grid-cols-3 gap-8">
					{plans.map((plan, index) => (
						<Card
							key={index}
							className={index === 1 ? 'border-blue-500 border-2' : ''}
						>
							<CardHeader>
								<CardTitle className="text-2xl">{plan.name}</CardTitle>
								<CardDescription>{plan.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-4xl font-bold mb-4">
									{plan.price}{' '}
									<span className="text-lg font-normal text-gray-600">
										/month
									</span>
								</div>
								<ul className="space-y-2">
									{plan.features.map((feature, fIndex) => (
										<li key={fIndex} className="flex items-center">
											<Check className="h-5 w-5 text-green-500 mr-2" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() =>
										window.open(
											contactWhatsapp(
												siteConfig.whatsapp,
												plan.name + plan.features.map(f => f).join(', ') + ' ',
											),
											'_blank',
										)
									}
									className="w-full"
									variant={index === 1 ? 'default' : 'outline'}
								>
									{index === 2 ? 'Contact Us' : 'Get Started'}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
				<p className="text-center text-gray-600 mt-8">
					All prices are displayed in Bangladeshi Taka (BDT). ৳1,200 is
					approximately $9 USD.
				</p>
			</div>
		</section>
	)
}
