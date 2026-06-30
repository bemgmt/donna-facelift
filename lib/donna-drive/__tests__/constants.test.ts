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
    delete process.env.DONNA_DRIVE_ENABLED;
    delete process.env.NEXT_PUBLIC_DONNA_DRIVE_ENABLED;
    delete process.env.DONNA_DRIVE_FACILITATOR_SECRET;
  });

  test('feature flag returns boolean based on env vars', async () => {
    process.env.DONNA_DRIVE_ENABLED = 'true';
    const { isDonnaDriveEnabled } = await import('@/lib/donna-drive/constants');
    expect(isDonnaDriveEnabled()).toBe(true);

    process.env.DONNA_DRIVE_ENABLED = 'false';
    expect(isDonnaDriveEnabled()).toBe(false);

    delete process.env.DONNA_DRIVE_ENABLED;
    process.env.NEXT_PUBLIC_DONNA_DRIVE_ENABLED = 'true';
    expect(isDonnaDriveEnabled()).toBe(true);
  });

  test('facilitator secret is server-only in this test runtime', async () => {
    delete process.env.DONNA_DRIVE_FACILITATOR_SECRET;
    const { FACILITATOR_SECRET } = await import('@/lib/donna-drive/constants');
    expect(FACILITATOR_SECRET).toBe('');
  });
});
