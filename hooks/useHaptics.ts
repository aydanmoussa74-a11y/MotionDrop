/**
 * useHaptics — thin wrapper around navigator.vibrate() with graceful fallback.
 * Only fires on primary actions (export, tab switch, modal open).
 */
export type HapticPattern =
  | "light" // 10ms
  | "medium" // 20ms
  | "heavy" // 40ms
  | "success" // [10, 50, 20]
  | "error" // [40, 60, 40]
  | "selection"; // 5ms

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 20],
  error: [40, 60, 40],
  selection: 5,
};

let supported: boolean | null = null;

function isSupported(): boolean {
  if (supported === null) {
    supported =
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function";
  }
  return supported;
}

export function vibrate(pattern: HapticPattern) {
  if (!isSupported()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* no-op: some browsers throw on silent pages */
  }
}

export function useHaptics() {
  return { vibrate };
}
