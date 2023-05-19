import type { DNSRecord, GetDNSRecordsResponse } from '@linen/types';

const ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN || '';
const TEAM_ID = process.env.VERCEL_TEAM_ID || '';
const BASE_URL = 'https://api.vercel.com';

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

  static createOrFindDomain = async (domain: string): Promise<any> => {
    let response = await Vercel.addDomainToProject(domain);

    if (response.error && response.error.code !== 'domain_already_in_use') {
      return response;
    }

    response = await Vercel.getProjectDomain(domain);

    if (response.error) {
      return response;
    }

    return response;
  };

  static findOrCreateDomainWithDnsRecords = async (
    domain: string
  ): Promise<any> => {
    let response = await Vercel.createOrFindDomain(domain);

    if (response.verification) {
      const records = response.verification.map((record: DNSRecord) => {
        if (record.type === 'TXT' && !record.name) {
          record.name = '_vercel';
        }
        return record;
      });

      return { records };
    }

    response = await Vercel.getDnsRecords(domain);

    if (response.error) {
      return response;
    }

    const records = response.records.filter(
      (record: DNSRecord) => record.type === 'TXT' || record.type === 'CNAME'
    );

    return { records };
  };
}
