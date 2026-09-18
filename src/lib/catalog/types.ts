import type { SkillKey } from "@/lib/catalog/skills";

export type Locale = "ru" | "en";

export type ProductType =
  | "lifehack"
  | "lesson"
  | "course"
  | "extra"
  | "research"
  | "peek";

/** Types returned by listPublishedProducts / getPublishedProduct. */
export type PublicProductType = "lifehack" | "lesson" | "course" | "peek";

export type { SkillKey } from "@/lib/catalog/skills";
export { SKILL_KEYS, isSkillKey } from "@/lib/catalog/skills";

export type ProgramLesson = {
  sort: number;
  title: string;
  gifUrls: string[];
};

export type ProgramBlock = {
  blockKey: string;
  outcomes: string[];
  lessons: ProgramLesson[];
};

export type CourseProgram = {
  blocks: ProgramBlock[];
};

export type AccessStatus = "active" | "expired";
export type OrderStatus = "pending" | "paid" | "failed" | "canceled";
export type Currency = "rub" | "eur" | "usd";
export type SupportFromRole = "user" | "agent";

export type ProductI18n = {
  title: string;
  short: string;
  description: string;
  program?: string;
};

/** Public product. `kinescopeId` is never included. */
export type Product = {
  id: string;
  type: ProductType;
  priceMinor: number;
  priceUsdMinor: number;
  priceEurMinor: number;
  currency: Currency;
  accessDays: number;
  /** First cover frame, or empty when none (e.g. locked peeks 10–24). */
  coverUrl: string;
  /** Cover carousel frames (kind=cover), sorted. */
  coverUrls: string[];
  durationSec: number;
  level: string;
  skills: SkillKey[];
  lessonCount?: number;
  /** Peek unlock instant; null = no schedule lock. */
  availableAt: string | null;
  sortIndex?: number;
  bundleParentId: string | null;
  bundleChildIds: string[];
  programBlocks: CourseProgram;
  i18n: Record<Locale, ProductI18n>;
  published: boolean;
};

export type AuthUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
};

export function isIdentifiedUser(
  user: AuthUser | null | undefined,
): user is AuthUser {
  return Boolean(user && !user.isAnonymous);
}

export function asIdentifiedUser(
  user: AuthUser | null | undefined,
): AuthUser | null {
  return isIdentifiedUser(user) ? user : null;
}

export type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarPath: string | null;
  avatarBucket: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  qty: number;
  addedAt: string;
  product?: Product;
};

export type WholesaleTier = {
  minQty: number;
  percent: number;
};

export type OrderItem = {
  orderId: string;
  productId: string;
  titleSnapshot: string;
  priceMinor: number;
  qty: number;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: Currency;
  stripeSessionId: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type Access = {
  userId: string;
  productId: string;
  orderId: string;
  purchasedAt: string;
  expiresAt: string;
  status: AccessStatus;
  product?: Product;
};

export type WatchProgress = {
  productId: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  userId: string;
  fromRole: SupportFromRole;
  body: string;
  storagePath: string | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type QueryState<T> = {
  data: T;
  loading: boolean;
  error: Error | null;
};
