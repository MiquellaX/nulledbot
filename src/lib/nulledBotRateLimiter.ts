import { redis } from "./redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

export async function rateLimit(ip: string): Promise<boolean> {
	const key = `rate_limit:${ip}`;

	const current = await redis.incr(key);

	if (current === 1) {
		await redis.expire(key, WINDOW_SECONDS);
	}

	return current <= MAX_REQUESTS;
}
