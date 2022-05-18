const ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.vercel.com';

export interface DNSRecord {
  id: string;
  slug: string;
  name: string;
  type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'SRV' | 'TXT' | 'NS';
  value: string;
}

export interface VercelError {
  code: string;
  message: string;
  saml: boolean;
  teamId: string | null;
  scope: string;
  enforced: boolean;
}

export interface GetDNSRecordsResponse {
  records: DNSRecord[];
  error?: VercelError;
}

export default class Vercel {
  static getDnsRecords = async (
    domain: string
  ): Promise<GetDNSRecordsResponse> => {
    const res = await fetch(`${BASE_URL}/v4/domains/${domain}/records`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return await res.json();
  };
}
