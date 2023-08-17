import layout from '../../layouts/default';

export function start(): string {
  return layout(`
    <h1>Sync started</h1>
    <p>We've started to sync your data. We'll send you another email when it's done. Sync time can vary depending on your community size, from minutes to hours.</p>
    <p>In the meantime, consider taking a break and checkout out our <a href='https://www.linen.dev'>feed</a>. If you have any questions, concerns or suggestions, join our <a href='https://linen.dev/s/linen'>linen community</a>.</p>
  `);
}

export function end({ url }: { url: string }): string {
  return layout(`
    <h1>Sync succeded</h1>
    <p>We've finished syncing your data.<p>
    <p>If there's any data missing, please ensure that you gave the bot enough permissions to access your data and try again. Alternatively, you could try to export your data and import it to linen manually.</p>
    <p>If you have any questions or ideas, join our <a href='https://linen.dev/s/linen'>linen community</a>.</p>
    <p>You can access your community <a href='${url}'>here</a>.</p>
  `);
}

export function error(): string {
  return layout(`
    <h1>Sync failed</h1>
    <p>We couldn't sync your data.<p>
    <p>We've been notified about it and we'll look into it as soon as possible. In the meantime, please ensure that you have the bot enough permissions to access your data and try again. Alternatively, you could try to export your data and import it to linen manually.</p>
    <p>If you have any questions or concerns, join our <a href='https://linen.dev/s/linen'>linen community</a>.</p>
  `);
}
