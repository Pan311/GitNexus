const FALSEY_LOCAL_ONLY_VALUES = new Set(['', '0', 'false']);

export const isLocalOnlyEnabled = (value: string | undefined): boolean => {
  if (value === undefined) return false;
  return !FALSEY_LOCAL_ONLY_VALUES.has(value.trim().toLowerCase());
};

export const isLocalOnlyMode = (): boolean => (
  isLocalOnlyEnabled(process.env.GITNEXUS_LOCAL_ONLY)
);
