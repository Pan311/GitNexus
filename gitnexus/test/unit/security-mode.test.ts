import { afterEach, describe, expect, it } from 'vitest';
import { isLocalOnlyEnabled, isLocalOnlyMode } from '../../src/config/security-mode.js';

const ORIGINAL_LOCAL_ONLY = process.env.GITNEXUS_LOCAL_ONLY;

afterEach(() => {
  if (ORIGINAL_LOCAL_ONLY === undefined) {
    delete process.env.GITNEXUS_LOCAL_ONLY;
  } else {
    process.env.GITNEXUS_LOCAL_ONLY = ORIGINAL_LOCAL_ONLY;
  }
});

describe('security-mode', () => {
  it('treats unset value as disabled', () => {
    expect(isLocalOnlyEnabled(undefined)).toBe(false);
  });

  it('treats explicit falsey values as disabled', () => {
    expect(isLocalOnlyEnabled('')).toBe(false);
    expect(isLocalOnlyEnabled('0')).toBe(false);
    expect(isLocalOnlyEnabled('false')).toBe(false);
    expect(isLocalOnlyEnabled('FALSE')).toBe(false);
    expect(isLocalOnlyEnabled(' false ')).toBe(false);
  });

  it('treats explicit truthy values as enabled', () => {
    expect(isLocalOnlyEnabled('1')).toBe(true);
    expect(isLocalOnlyEnabled('true')).toBe(true);
    expect(isLocalOnlyEnabled('yes')).toBe(true);
  });

  it('reads process env via isLocalOnlyMode', () => {
    delete process.env.GITNEXUS_LOCAL_ONLY;
    expect(isLocalOnlyMode()).toBe(false);

    process.env.GITNEXUS_LOCAL_ONLY = 'true';
    expect(isLocalOnlyMode()).toBe(true);
  });
});
