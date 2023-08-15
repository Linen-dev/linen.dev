import ApplicationMailer from './ApplicationMailer';
import { start, end, error } from './views/emails/sync';

export default class SyncMailer {
  static async start({ to }: { to: string }) {
    return ApplicationMailer.send({
      to,
      subject: 'Sync start in Linen.dev',
      text: `We've started syncing your data. We'll notify you when it's done.`,
      html: start(),
    });
  }

  static async end({ to, url }: { to: string; url: string }) {
    return ApplicationMailer.send({
      to,
      subject: 'Sync finish in Linen.dev',
      text: `We've finished syncing your data.`,
      html: end({ url }),
    });
  }
  static async error({ to }: { to: string }) {
    return ApplicationMailer.send({
      to,
      subject: 'Sync finish in Linen.dev',
      text: `We've finished syncing your data.`,
      html: error(),
    });
  }
}
