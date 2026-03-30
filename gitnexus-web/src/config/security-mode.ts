const FALSEY_LOCAL_ONLY_VALUES = new Set(['', '0', 'false']);

export const isLocalOnlyEnabled = (value: string | undefined): boolean => {
  if (value === undefined) return false;
  return !FALSEY_LOCAL_ONLY_VALUES.has(value.trim().toLowerCase());
};

export const isLocalOnlyMode = (): boolean => (
  isLocalOnlyEnabled(import.meta.env.VITE_GITNEXUS_LOCAL_ONLY)
);

export const isLoopbackUrl = (rawUrl: string | undefined): boolean => {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  } catch {
    return false;
  }
};
