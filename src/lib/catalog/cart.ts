import type { CartItem } from "@/lib/catalog/types";

const STORAGE_KEY = "catalog.guest-cart.v1";

function readWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getGuestCart(): CartItem[] {
  const storage = readWindow();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export function setGuestCart(items: CartItem[]): void {
  const storage = readWindow();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addGuestItem(productId: string): CartItem[] {
  const items = getGuestCart();
  if (items.some((item) => item.productId === productId)) return items;
  const next = [
    ...items,
    { productId, qty: 1, addedAt: new Date().toISOString() },
  ];
  setGuestCart(next);
  return next;
}

export function removeGuestItem(productId: string): CartItem[] {
  const next = getGuestCart().filter((item) => item.productId !== productId);
  setGuestCart(next);
  return next;
}

export function clearGuestCart(): void {
  const storage = readWindow();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

/** After login (Wave 3): merge guest local cart into Supabase, then clear guest storage. */
export async function mergeGuestCartOnLogin(): Promise<void> {
  const items = getGuestCart();
  if (items.length === 0) return;
  const { mergeGuestCart } = await import("@/lib/catalog/repo/cart");
  await mergeGuestCart(items);
  clearGuestCart();
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.qty === "number" &&
    typeof item.addedAt === "string"
  );
}
