// utils/engagement-tracker.ts
export class EngagementTracker {
	private static instance: EngagementTracker | null = null
	private startTime: number
	private pageViews: number = 0
	private interactions: number = 0

	private constructor() {
		this.startTime = Date.now()
		// Only access sessionStorage in the browser
		if (typeof window !== 'undefined') {
			this.pageViews = parseInt(sessionStorage.getItem('pageViews') || '0')
			this.interactions = parseInt(
				sessionStorage.getItem('interactions') || '0',
			)
		}
	}

	static getInstance(): EngagementTracker {
		if (!EngagementTracker.instance) {
			EngagementTracker.instance = new EngagementTracker()
		}
		return EngagementTracker.instance
	}

	trackPageView() {
		this.pageViews++
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('pageViews', this.pageViews.toString())
		}
	}

	trackInteraction() {
		this.interactions++
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('interactions', this.interactions.toString())
		}
	}

	getTimeSpent(): number {
		return Date.now() - this.startTime
	}

	updateTimeSpent() {
		if (typeof window !== 'undefined') {
			const currentTime = this.getTimeSpent()
			sessionStorage.setItem('timeSpent', currentTime.toString())
		}
	}

	getEngagementScore(): number {
		const timeSpent = this.getTimeSpent() / 1000 // Convert to seconds
		const score = this.pageViews * 20 + this.interactions * 10 + timeSpent * 0.5
		return Math.min(score, 100) // Cap at 100
	}

	isEngaged(threshold = 50): boolean {
		return this.getEngagementScore() >= threshold
	}
}
