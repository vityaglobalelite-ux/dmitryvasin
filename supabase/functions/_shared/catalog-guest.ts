export function isCatalogGuest(user: {
  is_anonymous?: boolean;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): boolean {
  if (user.is_anonymous === true) return true;
  const flag = user.user_metadata?.catalog_guest;
  if (flag === true) return true;
  if (flag === false) return false;
  return /@guest\.betango\.internal$/i.test(user.email ?? "");
}
