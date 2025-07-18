import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string) => {
	return bcrypt.hashSync(password, 10)
}
