import layout from 'mailers/views/layouts/default';
import { TemplateType } from 'mailers/NotificationMailer';

export function html({
  userName,
  threads,
  preferencesUrl,
}: TemplateType): string {
  let phrase = threads.length > 1 ? 'few threads' : 'thread';
  return layout(`
  <h3>
    Hi ${userName}, you were mentioned in a ${phrase}:
  </h3>
  ${threads
    ?.map((thread) => {
      return `<h3>${thread.date}: <a href="${thread.url}">${thread.text}</a></h3>`;
    })
    .join('')}
  <hr />
  <p>
    You can turn email notifications off, 
    <br/>see <a href="${preferencesUrl}">your profile page</a>.
  </p>
  `);
}

export function text({ userName, threads, preferencesUrl }: TemplateType) {
  let phrase = threads.length > 1 ? 'few threads' : 'thread';

  return `Hi ${userName}, you were mentioned in a ${phrase}:
  
  * * *
  
  ${threads
    ?.map((thread) => {
      return `${thread.date} ${thread.text}\n${thread.url}`;
    })
    .join('\n')}
  
  * * *
  
  You can turn email notifications off, see your profile page: ${preferencesUrl}`;
}
