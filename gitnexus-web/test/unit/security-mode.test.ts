import { describe, expect, it } from 'vitest';
import { isLocalOnlyEnabled } from '../../src/config/security-mode';

describe('web security-mode', () => {
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
});
