import { Redis } from "@upstash/redis";

/**
 * 푸시 구독 저장소 (Upstash Redis).
 * Upstash 또는 Vercel KV(Upstash 기반) 환경변수 중 있는 것을 사용.
 */

const HASH = "push:subscribers"; // field: endpoint, value: JSON

export interface StoredSubscriber {
  endpoint: string;
  subscription: unknown; // PushSubscription JSON
  favorites: string[];
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isPushStoreConfigured(): boolean {
  return getRedis() !== null;
}

export async function saveSubscriber(
  subscription: { endpoint: string },
  favorites: string[]
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const value: StoredSubscriber = {
    endpoint: subscription.endpoint,
    subscription,
    favorites,
  };
  await redis.hset(HASH, { [subscription.endpoint]: JSON.stringify(value) });
  return true;
}

export async function removeSubscriber(endpoint: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hdel(HASH, endpoint);
}

export async function getAllSubscribers(): Promise<StoredSubscriber[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = await redis.hgetall<Record<string, string>>(HASH);
  if (!all) return [];
  const out: StoredSubscriber[] = [];
  for (const raw of Object.values(all)) {
    try {
      // upstash가 객체로 역직렬화해 줄 수도, 문자열일 수도 있음 → 양쪽 처리
      out.push(typeof raw === "string" ? JSON.parse(raw) : (raw as StoredSubscriber));
    } catch {
      /* 손상된 항목 무시 */
    }
  }
  return out;
}
