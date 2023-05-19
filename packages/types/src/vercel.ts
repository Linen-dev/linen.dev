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
