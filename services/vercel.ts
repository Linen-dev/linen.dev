const ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN || '';
const TEAM_ID = process.env.VERCEL_TEAM_ID || '';
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
    const response = await fetch(
      `${BASE_URL}/v4/domains/${domain}/records?teamId=${TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return await response.json();
  };
}
