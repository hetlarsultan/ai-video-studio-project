import { describe, it, expect } from 'vitest';
import { ConnectionProvider, useConnection } from './ConnectionContext';

describe('ConnectionContext', () => {
  it('should export ConnectionProvider', () => {
    expect(ConnectionProvider).toBeDefined();
  });

  it('should export useConnection hook', () => {
    expect(useConnection).toBeDefined();
  });

  it('should have correct types', () => {
    const provider = ConnectionProvider;
    expect(provider).toBeDefined();
    expect(typeof provider).toBe('function');
  });
});
