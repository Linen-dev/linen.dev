import ApplicationMailer from './ApplicationMailer';

interface Options {
  communityName: string | null;
  inviterName: string;
  host: string;
  to: string;
}

export default class InviteToJoinMailer {
  static async send({ inviterName, communityName, host, to }: Options) {
    const content = `Join your team ${communityName} on Linen.dev and start collaborating. ${host}/signup?email=${encodeURIComponent(
      to
    )}`;
    return ApplicationMailer.send({
      to,
      subject: `${inviterName} invited you to join Linen.dev`,
      text: content,
      html: content,
    });
  }
}
