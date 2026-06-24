export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore errors on unsupported browsers/devices
    }
  }
};

export const hapticFeedback = {
  light: () => triggerHaptic(10),
  medium: () => triggerHaptic(20),
  heavy: () => triggerHaptic(40),
  success: () => triggerHaptic([10, 50, 10]),
  error: () => triggerHaptic([50, 50, 50]),
  reaction: () => triggerHaptic(5),
};
