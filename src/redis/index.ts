import Redis from 'ioredis';

const redis = new Redis(); // Default connection to localhost:6379

export async function saveVerificationCode(code: string, data: any, expiration: number = 300): Promise<void> {
  await redis.set(code, JSON.stringify(data), 'EX', expiration); // Set expiry time in seconds
}

export async function getVerificationData(code: string): Promise<any | null> {
  const data = await redis.get(code);
  return data ? JSON.parse(data) : null;
}

export async function deleteVerificationCode(code: string): Promise<void> {
  await redis.del(code);
}