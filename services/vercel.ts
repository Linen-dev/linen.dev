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
  static getDomain = async (domain: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/v5/domains/${domain}?teamId=${TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.json();
  };

  static getDomains = async (): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/v5/domains?teamId=${TEAM_ID}&limit=99999999999999`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.json();
  };

  static createDomain = async (): Promise<any> => {
    const response = await fetch(`${BASE_URL}/v4/domains?teamId=${TEAM_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'super-example.com',
      }),
    });
    return response.json();
  };

  static getProjectDomain = async (domain: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/v9/projects/linen-dev/domains/${domain}?teamId=${TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.json();
  };

  static addDomainToProject = async (domain: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/v9/projects/linen-dev/domains?teamId=${TEAM_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      }
    );
    return response.json();
  };

  static getDomainConfiguration = async (domain: string): Promise<any> => {
    const response = await fetch(
      `${BASE_URL}/v6/domains/${domain}/config?teamId=${TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.json();
  };

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
    return response.json();
  };
}
