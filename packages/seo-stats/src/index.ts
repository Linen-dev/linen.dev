import { google } from 'googleapis';
import env from './config';
import { authenticate } from './authenticate';

const searchconsole = google.searchconsole('v1');

const creds = {
  client_id: env.CLIENT_ID,
  client_secret: env.CLIENT_SECRET,
  project_id: 'linen-dev',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  redirect_uris: ['http://localhost:3000/oauth2callback'],
};

export const oauth2Client = new google.auth.OAuth2(
  creds.client_id,
  creds.client_secret,
  creds.redirect_uris[0]
);

google.options({ auth: oauth2Client });

const scopes = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

authenticate(scopes)
  .then(() => runSample())
  .catch(console.error);

const today = new Date();
const oneWeek = 1000 * 60 * 60 * 24 * 7;
const lastWeek = new Date(today.getTime() - oneWeek);

async function runSample() {
  const list = await searchconsole.sites.list();
  // console.log('%j', list.data.siteEntry);

  const all: any = [];
  if (list.data.siteEntry) {
    for (const site of list.data.siteEntry) {
      if (site.siteUrl) {
        const result = await searchconsole.searchanalytics
          .query({
            requestBody: {
              // dimensions: ['date'],
              // dimensions: ['page'], // top pages
              startDate: lastWeek.toISOString().substring(0, 10),
              endDate: today.toISOString().substring(0, 10),
            },
            siteUrl: site.siteUrl,
          })
          .catch((e) => {
            console.error(e);
          });
        if (result) {
          const info = {
            site: site.siteUrl,
            ...result.data.rows?.pop(),
          };
          console.log(info);
          all.push(info);
        }
      }
    }
  }

  console.log(
    JSON.stringify(
      all.sort((a: any, b: any) => b.clicks - a.clicks),
      null,
      2
    )
  );
}
