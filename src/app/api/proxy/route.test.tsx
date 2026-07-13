import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { POST, isPrivateIp } from './route';
import dns from 'dns/promises';

vi.mock('dns/promises', () => ({
  default: {
    lookup: vi.fn(),
  },
}));

const mockedLookup = dns.lookup as Mock;

function createMockRequest(body: Record<string, unknown> | null) {
  return new Request('http://localhost/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('/api/proxy Route Clean Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Validations', () => {
    it('should return 400 if URL or method is missing', async () => {
      const req = createMockRequest({ method: 'GET' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, string>;
      expect(data.error).toBe('URL and method are required');
    });

    it('should return 400 for invalid URL formats', async () => {
      const req = createMockRequest({ url: 'not-a-valid-url', method: 'GET' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, string>;
      expect(data.error).toBe('Invalid URL format');
    });

    it('should return 400 if protocol is not http or https', async () => {
      const req = createMockRequest({ url: 'ftp://example.com', method: 'GET' });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, string>;
      expect(data.error).toBe('Only http and https protocols are allowed');
    });
  });

  describe('isPrivateIp Unit Coverage', () => {
    it('should return true for private and local IPs', () => {
      const privateIps = [
        '127.0.0.1', '0.0.0.0', '::1', '::', 'fe80::1',
        '10.0.0.5', '172.16.5.5', '172.31.255.255',
        '192.168.1.1', '169.254.0.1', '127.1.1.1', '0.5.5.5',
        '100.64.0.1', '100.127.255.255', '255.255.255.255',
        '::ffff:192.168.1.1'
      ];
      privateIps.forEach(ip => {
        expect(isPrivateIp(ip)).toBe(true);
      });
    });

    it('should return false for secure public IPs', () => {
      const publicIps = [
        '8.8.8.8', '1.1.1.1', '142.250.180.14', '172.15.255.255', 
        '172.32.0.0', '100.63.255.255', '100.128.0.0', 'not-an-ip'
      ];
      publicIps.forEach(ip => {
        expect(isPrivateIp(ip)).toBe(false);
      });
    });
  });

  describe('SSRF & SecureAgent Core Validation', () => {
    it('should intercept connection and block unsafe DNS responses inside route context', async () => {
      mockedLookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);

      const req = createMockRequest({ url: 'https://malicious-internal-target.com', method: 'GET' });
      const res = await POST(req);
      
      expect(res.status).toBe(500);
      const data = await res.json() as Record<string, string>;
      expect(data.error).toBe('fetch failed');
    });

    it('should gracefully handle full DNS lookup rejections inside route agent', async () => {
      mockedLookup.mockRejectedValue(new Error('System DNS Failure'));

      const req = createMockRequest({ url: 'https://broken-dns-domain.com', method: 'GET' });
      const res = await POST(req);
      
      expect(res.status).toBe(500);
      const data = await res.json() as Record<string, string>;
      expect(data.error).toBe('fetch failed');
    });
  });
});
