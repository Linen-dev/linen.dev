import ApplicationMailer from './ApplicationMailer';
import view from './views/emails/invite';

interface Options {
  communityName: string;
  inviterName: string;
  host: string;
  to: string;
}

export default class InviteToJoinMailer {
  static async send({ inviterName, communityName, host, to }: Options) {
    const url = `${host}/signup?email=${encodeURIComponent(to)}`;
    const content = `Join your team ${communityName} on Linen.dev and start collaborating. ${host}/signup?email=${encodeURIComponent(
      to
    )}`;
    return ApplicationMailer.send({
      to,
      subject: `${inviterName} invited you to join the ${communityName} community on linen.dev`,
      text: content,
      html: view({ communityName, inviterName, url }),
    });
  }
}
