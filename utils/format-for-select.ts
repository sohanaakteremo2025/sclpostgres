import { SelectOption } from '@/components/school-form'

export const formatForSelect = (data: any[]): SelectOption[] => {
	return data.map(item => ({
		label: item.title || item.name || item.label || '',
		value: item.id || item.value || '',
	}))
}
