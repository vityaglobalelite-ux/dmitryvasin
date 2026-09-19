import { POSTURE_BUNDLE } from "@/lib/catalog/ids";

export type BundleLink = {
  parentId: string;
  childId: string;
  sort: number;
};

export function isPostureBundleFull(productId: string): boolean {
  return productId === POSTURE_BUNDLE.fullId;
}

export function isPostureBundleBlock(productId: string): boolean {
  return (
    productId === POSTURE_BUNDLE.block1Id ||
    productId === POSTURE_BUNDLE.block2Id
  );
}

export function postureBlockSibling(blockId: string): string | null {
  if (blockId === POSTURE_BUNDLE.block1Id) return POSTURE_BUNDLE.block2Id;
  if (blockId === POSTURE_BUNDLE.block2Id) return POSTURE_BUNDLE.block1Id;
  return null;
}

/** Expand purchased ids with bundle children (parent → children). */
export function expandBundleChildren(
  productIds: string[],
  links: BundleLink[],
): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const link of links) {
    const list = childrenByParent.get(link.parentId) ?? [];
    list.push(link.childId);
    childrenByParent.set(link.parentId, list);
  }
  const out = new Set(productIds);
  for (const id of productIds) {
    for (const childId of childrenByParent.get(id) ?? []) {
      out.add(childId);
    }
  }
  return [...out];
}

/** If both posture blocks are present, also grant the full course id. */
export function postureFullIfBothBlocks(productIds: string[]): string[] {
  const set = new Set(productIds);
  if (
    set.has(POSTURE_BUNDLE.block1Id) &&
    set.has(POSTURE_BUNDLE.block2Id)
  ) {
    set.add(POSTURE_BUNDLE.fullId);
  }
  return [...set];
}

export function cartHasBundleConflict(
  productIds: string[],
  links: BundleLink[],
): boolean {
  const set = new Set(productIds);
  for (const link of links) {
    if (set.has(link.parentId) && set.has(link.childId)) {
      return true;
    }
  }
  return false;
}

export function parentIdsForChildren(
  productIds: string[],
  links: BundleLink[],
): Map<string, string> {
  const set = new Set(productIds);
  const map = new Map<string, string>();
  for (const link of links) {
    if (set.has(link.childId)) {
      map.set(link.childId, link.parentId);
    }
  }
  return map;
}

/** Drop block SKUs when the full course is in the set or already owned. */
export function dropPostureBlocksIfFullCovered(
  productIds: string[],
  hasFullAccess = false,
): string[] {
  const set = new Set(productIds);
  if (!hasFullAccess && !set.has(POSTURE_BUNDLE.fullId)) return [...set];
  set.delete(POSTURE_BUNDLE.block1Id);
  set.delete(POSTURE_BUNDLE.block2Id);
  return [...set];
}

/** Catalog/home grids: parent courses only. Block SKUs stay on the course page. */
export function isStorefrontListingProduct(product: {
  id: string;
  bundleParentId: string | null;
}): boolean {
  if (isPostureBundleBlock(product.id)) return false;
  return !product.bundleParentId;
}
