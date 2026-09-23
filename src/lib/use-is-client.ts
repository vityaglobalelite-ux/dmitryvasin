import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards — for portals to
 * `document.body` and markup that must match the server HTML first.
 * Client-side navigations mount with true straight away.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
