'use server'

import {
	setupDueReminderCronJobs,
	stopAllDueReminderCronJobs,
	triggerDueReminders,
	checkIfCronJobsActive,
	getCronJobsStatus,
} from '@/lib/cron/scheduler'

/**
 * Initialize or refresh the due reminder cron jobs
 * This will check all tenant configurations and start/stop jobs as needed
 */
export async function initDueReminderSystem() {
	try {
		const success = await setupDueReminderCronJobs()

		if (success) {
			return {
				success: true,
				message: 'Due reminder system initialized successfully',
			}
		} else {
			return {
				success: false,
				message: 'Failed to initialize due reminder system',
			}
		}
	} catch (error) {
		console.error('Error initializing due reminder system:', error)
		return {
			success: false,
			message:
				error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

/**
 * Stop all running due reminder cron jobs
 */
export async function stopDueReminderSystem() {
	try {
		stopAllDueReminderCronJobs()
		return {
			success: true,
			message: 'Due reminder system stopped successfully',
		}
	} catch (error) {
		console.error('Error stopping due reminder system:', error)
		return {
			success: false,
			message:
				error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

/**
 * Manually trigger due reminders with specified frequency
 * @param frequency - Type of reminder to send (early, mid, or late month)
 */
export async function sendDueReminders(frequency: 'early' | 'mid' | 'late') {
	try {
		const result = await triggerDueReminders(frequency)

		if (result.success) {
			return {
				success: true,
				message: `${frequency} month due reminders sent successfully`,
			}
		} else {
			return {
				success: false,
				message: result.error || 'Failed to send due reminders',
			}
		}
	} catch (error) {
		console.error('Error sending due reminders:', error)
		return {
			success: false,
			message:
				error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}

/**
 * Get the current status of the due reminder system
 * This checks if any cron jobs are currently running
 */
export async function getDueReminderStatus() {
	try {
		const isActive = checkIfCronJobsActive()
		const jobStatus = getCronJobsStatus()

		return {
			success: true,
			active: isActive,
			status: jobStatus,
			message: isActive
				? 'Due reminder system is active'
				: 'Due reminder system is inactive',
		}
	} catch (error) {
		console.error('Error getting due reminder status:', error)
		return {
			success: false,
			active: false,
			status: null,
			message:
				error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}
