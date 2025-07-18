'use server'

import { emailTemplates } from '@/constants/constants'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || '465', 10),
	secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
})

export const sendEmail = async ({
	to,
	type,
}: {
	to: string
	type: 'paymentSuccess' | 'paymentFailure'
}) => {
	const template = emailTemplates[type]
	const mailOptions = {
		from: process.env.SMTP_FROM,
		to,
		subject: template.subject,
		text: template.text,
		html: template.html,
	}
	try {
		await transporter.sendMail(mailOptions)
	} catch (error) {
		console.error('Error sending email:')
	}
}
