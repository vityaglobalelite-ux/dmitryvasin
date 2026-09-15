import type { WatchProgress } from "@/lib/catalog/types";

export const WATCH_RESUME_MIN_SEC = 5;
export const WATCH_COMPLETE_REMAINING_SEC = 5;
export const WATCH_COMPLETE_RATIO = 0.97;

const listeners = new Set<(row: WatchProgress) => void>();

export function onWatchProgressChanged(
  listener: (row: WatchProgress) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyWatchProgress(row: WatchProgress): void {
  for (const listener of listeners) listener(row);
}

export function isWatchComplete(positionSec: number, durationSec: number): boolean {
  if (!(durationSec > 0) || !(positionSec >= 0)) return false;
  if (positionSec >= durationSec - WATCH_COMPLETE_REMAINING_SEC) return true;
  return positionSec / durationSec >= WATCH_COMPLETE_RATIO;
}

export function watchRatio(
  progress: WatchProgress | null | undefined,
  fallbackDurationSec = 0,
): number {
  if (!progress) return 0;
  if (progress.completed) return 1;
  const duration =
    progress.durationSec > 0 ? progress.durationSec : fallbackDurationSec;
  if (!(duration > 0)) return 0;
  return Math.min(1, Math.max(0, progress.positionSec / duration));
}

export function watchPercent(
  progress: WatchProgress | null | undefined,
  fallbackDurationSec = 0,
): number {
  const ratio = watchRatio(progress, fallbackDurationSec);
  if (ratio <= 0) return 0;
  return Math.min(100, Math.max(1, Math.round(ratio * 100)));
}

export function resumeSeekSeconds(
  progress: WatchProgress | null | undefined,
  durationSec = 0,
): number | null {
  if (!progress || progress.completed) return null;
  if (progress.positionSec < WATCH_RESUME_MIN_SEC) return null;
  const duration = durationSec > 0 ? durationSec : progress.durationSec;
  if (duration > 0 && isWatchComplete(progress.positionSec, duration)) {
    return null;
  }
  if (duration > 0) {
    return Math.min(progress.positionSec, Math.max(0, duration - 1));
  }
  return progress.positionSec;
}

export function formatWatchClock(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function remainingWatchSec(
  progress: WatchProgress,
  fallbackDurationSec = 0,
): number {
  if (progress.completed) return 0;
  const duration =
    progress.durationSec > 0 ? progress.durationSec : fallbackDurationSec;
  if (!(duration > 0)) return 0;
  return Math.max(0, duration - progress.positionSec);
}
