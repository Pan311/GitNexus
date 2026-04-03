const isLocalOnlyEnabled = (value: string | undefined): boolean => (
  value === undefined || value === '' || (value !== '0' && value !== 'false')
);

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
