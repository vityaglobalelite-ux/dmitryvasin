export type Locale = "ru" | "en";

export type ProductType =
  | "lifehack"
  | "lesson"
  | "course"
  | "extra"
  | "research"
  | "peek";

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
  currency: Currency;
  accessDays: number;
  coverUrl: string;
  durationSec: number;
  level: string;
  skills: string[];
  lessonCount?: number;
  i18n: Record<Locale, ProductI18n>;
  published: boolean;
};

export type AuthUser = {
  id: string;
  email: string | null;
};

export type Profile = {
  id: string;
  email: string;
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
