export const contactWhatsapp = (number: string, message: string) => {
	const text = encodeURIComponent(message)
	return `https://wa.me/${number}?text=${
		'আমি ' + text + ' প্যাকেজটি সম্পর্কে জানতে চাই।'
	}`
}
