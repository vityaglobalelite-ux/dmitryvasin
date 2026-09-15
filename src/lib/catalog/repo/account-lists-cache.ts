import type { Access, Order } from "@/lib/catalog/types";

const ORDERS_KEY = "betango.catalog.orders.v1";
const ACCESS_KEY = "betango.catalog.access.v1";

type ListCacheEntry<T> = {
  userId: string;
  data: T;
};

let memoryOrders: ListCacheEntry<Order[]> | null = null;
let memoryAccess: ListCacheEntry<Access[]> | null = null;
let ordersFetchGen = 0;
let accessFetchGen = 0;

function readStored<T>(key: string, userId?: string | null): ListCacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListCacheEntry<T>;
    if (!parsed?.userId || !Array.isArray(parsed.data)) return null;
    if (userId && parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored<T>(key: string, entry: ListCacheEntry<T>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* private mode / quota */
  }
}

function clearStored(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}

export function beginOrdersFetch(): number {
  ordersFetchGen += 1;
  return ordersFetchGen;
}

export function isOrdersFetchCurrent(gen: number): boolean {
  return gen === ordersFetchGen;
}

export function beginAccessFetch(): number {
  accessFetchGen += 1;
  return accessFetchGen;
}

export function isAccessFetchCurrent(gen: number): boolean {
  return gen === accessFetchGen;
}

export function peekCachedOrders(userId?: string | null): Order[] | null {
  if (!memoryOrders) return null;
  if (userId && memoryOrders.userId !== userId) return null;
  if (!userId) return null;
  return memoryOrders.data;
}

export function hydrateOrdersCache(userId?: string | null): Order[] | null {
  const stored = readStored<Order[]>(ORDERS_KEY, userId);
  if (!stored) return null;
  memoryOrders = stored;
  return stored.data;
}

export function writeOrdersCache(userId: string, data: Order[]): void {
  memoryOrders = { userId, data };
  writeStored(ORDERS_KEY, memoryOrders);
}

export function peekCachedAccess(userId?: string | null): Access[] | null {
  if (!memoryAccess) return null;
  if (userId && memoryAccess.userId !== userId) return null;
  if (!userId) return null;
  return memoryAccess.data;
}

export function hydrateAccessCache(userId?: string | null): Access[] | null {
  const stored = readStored<Access[]>(ACCESS_KEY, userId);
  if (!stored) return null;
  memoryAccess = stored;
  return stored.data;
}

export function writeAccessCache(userId: string, data: Access[]): void {
  memoryAccess = { userId, data };
  writeStored(ACCESS_KEY, memoryAccess);
}

export function clearAccountListsCache(): void {
  memoryOrders = null;
  memoryAccess = null;
  ordersFetchGen += 1;
  accessFetchGen += 1;
  clearStored(ORDERS_KEY);
  clearStored(ACCESS_KEY);
}
