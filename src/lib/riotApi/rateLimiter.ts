import { logTimed } from "../utils";

export class RateLimiter {
	private tokens: number;
	private lastRefillTime: number;
	private isSecondRateLimiter: boolean;
	private readonly capacity: number;
	private readonly timeToRefillInMs: number;

	constructor(tokensPerRefill: number, timeToRefill: number, isSecondRateLimiter?: true) {
		this.tokens = tokensPerRefill;
		this.capacity = tokensPerRefill;
		this.isSecondRateLimiter = isSecondRateLimiter ?? false;
		this.timeToRefillInMs = timeToRefill * 1000;
		this.lastRefillTime = Date.now();
	}

	private refillTokens() {
		const now = Date.now();
		const timeDelta = now - this.lastRefillTime;
		if (timeDelta >= this.timeToRefillInMs) {
			this.tokens = this.capacity - 1;
			this.lastRefillTime = now;
		}
	}

	async consumeToken(): Promise<void> {
		this.refillTokens();

		if (this.tokens >= 1) {
			this.tokens -= 1;
			return;
		}

		const now = Date.now();
		const timeToWait = this.timeToRefillInMs - (now - this.lastRefillTime);
		return new Promise((resolve) => setTimeout(resolve, timeToWait));
	}

	async fetch<T>(url: string): Promise<null | T> {
		await this.consumeToken();

		if (!this.isSecondRateLimiter) {
			try {
				const res = await fetch(url);
				const data = (await res.json()) as any;
				if ("status" in data) {
					logTimed(data.status, "error");
					return null;
				}
				return data as T;
			} catch (e) {
				logTimed(e, "error");
				return null;
			}
		} else {
			return await rateLimiterApiKey.fetch<T>(url);
		}
	}
}

export const rateLimiterApiKey = new RateLimiter(4, 1);
