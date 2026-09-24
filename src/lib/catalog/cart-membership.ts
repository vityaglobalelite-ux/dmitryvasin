"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  isPostureBundleBlock,
  isPostureBundleFull,
} from "@/lib/catalog/bundles";
import {
  GUEST_CART_STORAGE_KEY,
  addGuestItem,
  getGuestCart,
  mergeGuestCartOnLogin,
  removeGuestItem,
} from "@/lib/catalog/cart";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import {
  listCartItems,
  removeCartItem,
  upsertCartItem,
} from "@/lib/catalog/repo/cart";
import {
  getPublishedProduct,
  listPublishedProducts,
} from "@/lib/catalog/repo/products";
import type { CartItem, Product } from "@/lib/catalog/types";
import { peekCachedAuthUser } from "@/lib/supabase/auth";

export type CartNotice = "sync_failed";

export type CartSnapshot = {
  ids: ReadonlySet<string>;
  ordered: readonly string[];
  items: readonly CartItem[];
  notice: CartNotice | null;
  /** Signed-in cart has been read, or this is a guest cart. */
  idsReady: boolean;
  /** Every visible line has product data (or the cart is empty). */
  itemsHydrated: boolean;
};

const EMPTY_IDS: readonly string[] = [];
const EMPTY_ITEMS: readonly CartItem[] = [];
const EMPTY_SET: ReadonlySet<string> = new Set();

const SERVER_SNAPSHOT: CartSnapshot = {
  ids: EMPTY_SET,
  ordered: EMPTY_IDS,
  items: EMPTY_ITEMS,
  notice: null,
  idsReady: false,
  itemsHydrated: false,
};

let activeScope = "guest";
let baseOrdered: string[] = [];
let pendingAdds: string[] = [];
let pendingRemoves = new Set<string>();
let tombstones = new Set<string>();
let mutation = 0;
let idsReady = false;
let itemsHydrated = false;
let notice: CartNotice | null = null;
let noticeTimer = 0;
let booted = false;
let runSeq = 0;
let guestRun = 0;
let inflight: Promise<void> | null = null;
let inflightUser: string | null = null;
let lastKey = "";

const mergedFor = new Set<string>();
const rowCache = new Map<string, CartItem>();
const productCache = new Map<string, Product>();
const addedAt = new Map<string, string>();
const writeChains = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

let snapshot: CartSnapshot = SERVER_SNAPSHOT;

function productOf(id: string): Product | undefined {
  return rowCache.get(id)?.product ?? productCache.get(id);
}

function orderedIds(): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const skip = (id: string) => pendingRemoves.has(id) || tombstones.has(id);
  for (const id of baseOrdered) {
    if (skip(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  for (const id of pendingAdds) {
    if (skip(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function materialize(ids: readonly string[]): CartItem[] {
  return ids.map((id) => {
    const row = rowCache.get(id);
    const product = productOf(id);
    return {
      productId: id,
      qty: 1,
      addedAt: row?.addedAt ?? addedAt.get(id) ?? new Date().toISOString(),
      ...(product ? { product } : {}),
    };
  });
}

function refreshHydrated(ids: readonly string[]): void {
  itemsHydrated =
    ids.length === 0 || ids.every((id) => Boolean(productOf(id)));
}

function publish(): void {
  const ordered = orderedIds();
  refreshHydrated(ordered);
  const items = materialize(ordered);
  const key = [
    activeScope,
    idsReady ? "1" : "0",
    itemsHydrated ? "1" : "0",
    notice ?? "",
    items
      .map((item) => {
        const product = item.product;
        return product
          ? `${item.productId}:${product.priceMinor}:${product.coverUrl}`
          : `${item.productId}:na`;
      })
      .join(","),
  ].join("|");
  if (key === lastKey) return;
  lastKey = key;
  snapshot = {
    ids: new Set(ordered),
    ordered,
    items,
    notice,
    idsReady,
    itemsHydrated,
  };
  for (const listener of [...listeners]) listener();
}

function rememberProduct(product: Product): void {
  productCache.set(product.id, product);
  const row = rowCache.get(product.id);
  rowCache.set(product.id, {
    productId: product.id,
    qty: 1,
    addedAt: row?.addedAt ?? addedAt.get(product.id) ?? new Date().toISOString(),
    product,
  });
}

function rememberRows(items: readonly CartItem[]): void {
  for (const item of items) {
    rowCache.set(item.productId, item);
    if (item.product) productCache.set(item.productId, item.product);
  }
}

function showNotice(): void {
  notice = "sync_failed";
  if (typeof window === "undefined") return;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    notice = null;
    publish();
  }, 4600);
}

export function showCartNotice(): void {
  showNotice();
  publish();
}

export function dismissCartNotice(): void {
  notice = null;
  if (typeof window !== "undefined") window.clearTimeout(noticeTimer);
  publish();
}

function bootClient(): void {
  if (booted || typeof window === "undefined") return;
  booted = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== GUEST_CART_STORAGE_KEY) return;
    if (activeScope !== "guest") return;
    adoptGuest();
  });

  const peeked = peekCachedAuthUser();
  if (peeked) {
    activeScope = peeked.id;
    idsReady = false;
    itemsHydrated = false;
    snapshot = {
      ...SERVER_SNAPSHOT,
      ids: EMPTY_SET,
    };
    lastKey = "";
    return;
  }
  if (peeked === null) {
    activeScope = "guest";
    baseOrdered = getGuestCart().map((item) => item.productId);
    idsReady = true;
    const ordered = orderedIds();
    refreshHydrated(ordered);
    snapshot = {
      ids: new Set(ordered),
      ordered,
      items: materialize(ordered),
      notice,
      idsReady,
      itemsHydrated,
    };
    lastKey = "";
  }
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCartSnapshot(): CartSnapshot {
  bootClient();
  return snapshot;
}

export function getCartServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function useCartSnapshot(): CartSnapshot {
  return useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
}

/** Brief scale when a control flips into the “in cart” state. */
export function useAddedPop(active: boolean): boolean {
  const previous = useRef(active);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (active && !previous.current) {
      setPop(true);
      const timer = window.setTimeout(() => setPop(false), 420);
      previous.current = true;
      return () => window.clearTimeout(timer);
    }
    previous.current = active;
  }, [active]);

  return pop;
}

export function adoptGuest(): void {
  activeScope = "guest";
  baseOrdered = getGuestCart().map((item) => item.productId);
  pendingAdds = [];
  pendingRemoves = new Set();
  tombstones = new Set();
  idsReady = true;
  publish();
}

function enqueue(productId: string, job: () => Promise<void>): void {
  const previous = writeChains.get(productId) ?? Promise.resolve();
  const next = previous.then(job, job);
  writeChains.set(productId, next);
  void next.finally(() => {
    if (writeChains.get(productId) === next) writeChains.delete(productId);
  });
}

function dropBlocksForFull(): void {
  tombstones.add(POSTURE_BUNDLE.block1Id);
  tombstones.add(POSTURE_BUNDLE.block2Id);
  pendingAdds = pendingAdds.filter(
    (id) => id !== POSTURE_BUNDLE.block1Id && id !== POSTURE_BUNDLE.block2Id,
  );
  baseOrdered = baseOrdered.filter(
    (id) => id !== POSTURE_BUNDLE.block1Id && id !== POSTURE_BUNDLE.block2Id,
  );
}

export function stageAdd(
  productId: string,
  userId: string | null,
  product?: Product,
): "added" | "exists" | "conflict" {
  if (product) rememberProduct(product);
  const current = new Set(orderedIds());
  if (current.has(productId)) return "exists";
  if (isPostureBundleBlock(productId) && current.has(POSTURE_BUNDLE.fullId)) {
    return "conflict";
  }

  const stamp = new Date().toISOString();
  addedAt.set(productId, stamp);
  if (product) {
    rowCache.set(productId, { productId, qty: 1, addedAt: stamp, product });
  }

  if (!userId) {
    addGuestItem(productId);
    activeScope = "guest";
    baseOrdered = getGuestCart().map((item) => item.productId);
    pendingAdds = [];
    pendingRemoves = new Set();
    tombstones = new Set();
    idsReady = true;
    publish();
    return "added";
  }

  activeScope = userId;
  mutation += 1;
  if (isPostureBundleFull(productId)) dropBlocksForFull();
  if (!pendingAdds.includes(productId)) pendingAdds.push(productId);
  pendingRemoves.delete(productId);
  tombstones.delete(productId);
  publish();
  enqueue(productId, () => persistAdd(productId));
  return "added";
}

export function stageRemove(productId: string, userId: string | null): void {
  if (!userId) {
    removeGuestItem(productId);
    activeScope = "guest";
    baseOrdered = getGuestCart().map((item) => item.productId);
    idsReady = true;
    publish();
    return;
  }

  activeScope = userId;
  mutation += 1;
  pendingRemoves.add(productId);
  publish();
  enqueue(productId, () => persistRemove(productId));
}

async function persistAdd(productId: string): Promise<void> {
  if (pendingRemoves.has(productId) || tombstones.has(productId)) {
    pendingAdds = pendingAdds.filter((id) => id !== productId);
    publish();
    return;
  }
  try {
    await upsertCartItem(productId, 1);
    ackAdd(productId);
  } catch {
    if (pendingRemoves.has(productId)) {
      pendingAdds = pendingAdds.filter((id) => id !== productId);
      publish();
      return;
    }
    failAdd(productId);
  }
}

function ackAdd(productId: string): void {
  pendingAdds = pendingAdds.filter((id) => id !== productId);
  if (!pendingRemoves.has(productId) && !tombstones.has(productId)) {
    if (!baseOrdered.includes(productId)) {
      baseOrdered = [...baseOrdered, productId];
    }
  }
  if (isPostureBundleFull(productId)) {
    baseOrdered = baseOrdered.filter(
      (id) => id !== POSTURE_BUNDLE.block1Id && id !== POSTURE_BUNDLE.block2Id,
    );
  }
  publish();
}

function failAdd(productId: string): void {
  pendingAdds = pendingAdds.filter((id) => id !== productId);
  if (isPostureBundleFull(productId)) {
    tombstones.delete(POSTURE_BUNDLE.block1Id);
    tombstones.delete(POSTURE_BUNDLE.block2Id);
  }
  showNotice();
  publish();
}

async function persistRemove(productId: string): Promise<void> {
  // A newer add for this id already replaced the remove.
  if (!pendingRemoves.has(productId)) return;
  try {
    await removeCartItem(productId);
    ackRemove(productId);
  } catch {
    if (!pendingRemoves.has(productId)) return;
    pendingRemoves.delete(productId);
    showNotice();
    publish();
  }
}

function ackRemove(productId: string): void {
  // Re-add landed while the delete was in flight. Leave that add alone.
  if (!pendingRemoves.has(productId)) return;
  pendingRemoves.delete(productId);
  pendingAdds = pendingAdds.filter((id) => id !== productId);
  tombstones.add(productId);
  baseOrdered = baseOrdered.filter((id) => id !== productId);
  publish();
}

function ingest(userId: string, items: CartItem[], seenMutation: number): void {
  if (activeScope !== userId) return;
  rememberRows(items);
  const ids = items.map((item) => item.productId);
  const serverHas = new Set(ids);

  if (seenMutation !== mutation) {
    const merged: string[] = [];
    const seen = new Set<string>();
    for (const id of [...baseOrdered, ...ids, ...pendingAdds]) {
      if (seen.has(id) || tombstones.has(id) || pendingRemoves.has(id)) continue;
      seen.add(id);
      merged.push(id);
    }
    baseOrdered = merged;
    pendingAdds = pendingAdds.filter((id) => !serverHas.has(id) && !tombstones.has(id));
  } else {
    baseOrdered = ids.filter((id) => !tombstones.has(id) && !pendingRemoves.has(id));
    pendingAdds = pendingAdds.filter((id) => !serverHas.has(id));
    for (const id of [...tombstones]) {
      if (!serverHas.has(id)) tombstones.delete(id);
    }
    for (const id of [...pendingRemoves]) {
      if (!serverHas.has(id)) pendingRemoves.delete(id);
    }
  }

  idsReady = true;
  publish();
}

async function hydrateGuestItems(items: CartItem[]): Promise<CartItem[]> {
  if (items.length === 0) return [];
  const unique = new Map<string, CartItem>();
  for (const item of items) {
    if (!unique.has(item.productId)) unique.set(item.productId, { ...item, qty: 1 });
  }
  const published = await listPublishedProducts();
  const byId = new Map(published.map((product) => [product.id, product]));
  const hydrated: CartItem[] = [];
  for (const item of unique.values()) {
    const product = byId.get(item.productId) ?? productCache.get(item.productId);
    if (!product) continue;
    hydrated.push({ ...item, qty: 1, product });
  }
  return hydrated;
}

export async function ensureGuestCart(): Promise<void> {
  const run = ++guestRun;
  const hydrated = await hydrateGuestItems(getGuestCart());
  if (run !== guestRun || activeScope !== "guest") return;
  rememberRows(hydrated);
  baseOrdered = getGuestCart()
    .map((item) => item.productId)
    .filter((id) => Boolean(productOf(id)));
  pendingAdds = [];
  pendingRemoves = new Set();
  tombstones = new Set();
  idsReady = true;
  publish();
}

async function loadServer(userId: string, run: number): Promise<void> {
  if (!mergedFor.has(userId)) {
    mergedFor.add(userId);
    try {
      await mergeGuestCartOnLogin();
    } catch {
      mergedFor.delete(userId);
    }
  }
  if (run !== runSeq || activeScope !== userId) return;
  const seen = mutation;
  const items = await listCartItems();
  if (run !== runSeq || activeScope !== userId) return;
  ingest(userId, items, seen);
}

export function requestServerCart(userId: string, force = false): Promise<void> {
  guestRun += 1;
  if (!force && inflight && inflightUser === userId) return inflight;
  const run = ++runSeq;
  inflightUser = userId;
  activeScope = userId;
  const task = loadServer(userId, run);
  const tracked = task.finally(() => {
    if (inflight === tracked) inflight = null;
  });
  inflight = tracked;
  return tracked;
}

/** Full-course row used when both posture blocks are in the cart. */
export async function bundleCapProducts(items: readonly CartItem[]): Promise<Product[]> {
  const ids = new Set(items.map((item) => item.productId));
  const hasBothBlocks =
    ids.has(POSTURE_BUNDLE.block1Id) && ids.has(POSTURE_BUNDLE.block2Id);
  if (!hasBothBlocks || ids.has(POSTURE_BUNDLE.fullId)) return [];
  const cached = productCache.get(POSTURE_BUNDLE.fullId);
  if (cached) return [cached];
  const fetched = await getPublishedProduct(POSTURE_BUNDLE.fullId);
  if (fetched) productCache.set(fetched.id, fetched);
  return fetched ? [fetched] : [];
}
