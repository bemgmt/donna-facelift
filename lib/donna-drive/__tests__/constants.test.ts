// lib/donna-drive/__tests__/constants.test.ts

import { isDonnaDriveEnabled, FACILITATOR_SECRET } from '@/lib/donna-drive/constants';
import { logWarning } from '@/lib/donna-drive/log-utils';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mock supabaseAdmin for logging tests
jest.mock('@/lib/supabase-admin', () => {
  const mockInsert = jest.fn().mockResolvedValue({});
  const mockFrom = () => ({ insert: mockInsert });
  return {
    supabaseAdmin: { from: mockFrom },
  };
});

describe('Donna Drive constants', () => {
  afterEach(() => {
    jest.resetModules();
    // Reset env vars by assigning undefined
    (process.env as any).DONNA_DRIVE_ENABLED = undefined;
    (process.env as any).NEXT_PUBLIC_DONNA_DRIVE_ENABLED = undefined;
    (process.env as any).DONNA_DRIVE_FACILITATOR_SECRET = undefined;
    (process.env as any).NODE_ENV = undefined;
  });

  test('feature flag returns boolean based on env vars', () => {
    process.env.DONNA_DRIVE_ENABLED = 'true';
    const { isDonnaDriveEnabled } = require('@/lib/donna-drive/constants');
    expect(isDonnaDriveEnabled()).toBe(true);
    process.env.DONNA_DRIVE_ENABLED = 'false';
    expect(isDonnaDriveEnabled()).toBe(false);
    delete process.env.DONNA_DRIVE_ENABLED;
    process.env.NEXT_PUBLIC_DONNA_DRIVE_ENABLED = 'true';
    expect(isDonnaDriveEnabled()).toBe(true);
  });

  test('facilitator secret fallback logs warning in development', async () => {
    (process.env as any).NODE_ENV = 'development';
    const mockInsert = jest.fn().mockResolvedValue({});
    // Re‑mock supabaseAdmin to capture insert calls
    jest.doMock('@/lib/supabase-admin', () => ({ supabaseAdmin: { from: () => ({ insert: mockInsert }) } }));
    // Import after mocking
    const { FACILITATOR_SECRET } = await import('@/lib/donna-drive/constants');
    expect(FACILITATOR_SECRET).toBe('donna-drive-dev');
    // Wait a tick for async logWarning promise (if any)
    await new Promise(process.nextTick);
    expect(mockInsert).toHaveBeenCalled();
  });
});
