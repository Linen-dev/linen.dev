import ApplicationMailer from './ApplicationMailer';
import * as mentionsTemplate from './views/emails/notification/mentions';
import * as threadsTemplate from './views/emails/notification/threads';

interface Options {
  to: string;
}

export type TemplateType = {
  authors: string[];
  threads: { url: string; text: string; date: string }[];
  preferencesUrl: string;
  userName: string;
};

export default class NotificationMailer {
  static async send({
    to,
    text,
    html,
    ...props
  }: Options & TemplateType & { text: Function; html: Function }) {
    const joinedAuthors = props.authors?.join(' and ');
    return ApplicationMailer.send({
      to,
      subject: `[Linen] New messages from ${joinedAuthors}`,
      text: text(props),
      html: html(props),
    });
  }

  static async sendMention(props: Options & TemplateType) {
    return NotificationMailer.send({ ...props, ...mentionsTemplate });
  }
  static async sendThread(props: Options & TemplateType) {
    return NotificationMailer.send({ ...props, ...threadsTemplate });
  }
}
