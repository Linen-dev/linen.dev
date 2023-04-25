const { TrackClient, RegionEU } = require('customerio-node');
const siteId = process.env.CUSTOMER_IO_SITE_ID;
const apiKey = process.env.CUSTOMER_IO_API_KEY;

const customerIoClient = () => {
  if (!siteId || !apiKey) {
    return null;
  }

  return new TrackClient(siteId, apiKey, { region: RegionEU });
};

interface customerIoClient {
  identify: (id: string, params: any) => {};
  track: (id: string, params: any) => {};
}

const client: customerIoClient | null = customerIoClient();

export const createUserEvent = async (
  id: string,
  email: string,
  createdAt: Date
) => {
  try {
    client?.identify(email, {
      id,
      created_at: createdAt.getTime() / 1000,
    });
  } catch (e) {
    console.error('failed to track event');
  }
};

export const createAccountEvent = async (email: string, accountId: string) => {
  try {
    client?.track(email, {
      name: 'Account created',
      data: {
        accountId,
      },
    });
  } catch (e) {
    console.error('failed to identify account creation');
  }
};
