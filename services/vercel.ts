const ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.vercel.com';

interface DNSRecord {
  id: string;
  slug: string;
  name: string;
  type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'SRV' | 'TXT' | 'NS';
  value: string;
}

interface GetDNSRecordsResponse {
  records: DNSRecord[];
}

export default class Vercel {
  getDNSRecords = async (domain: string): Promise<GetDNSRecordsResponse> => {
    const res = await fetch(`${BASE_URL}/v4/domains/${domain}/records`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    const { records } = await res.json();
    return records;
  };
}
