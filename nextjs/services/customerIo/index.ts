const { TrackClient, RegionEU } = require('customerio-node');
const siteId = process.env.CUSTOMER_IO_SITE_ID;
const apiKey = process.env.CUSTOMER_IO_API_KEY;

export const trackSignUp = async (
  id: string,
  email: string,
  createdAt: Date
) => {
  if (!siteId || !apiKey) {
    return;
  }
  let cio = new TrackClient(siteId, apiKey, { region: RegionEU });

  cio.identify(id, {
    email: email,
    created_at: createdAt.getTime() / 1000,
  });
};
