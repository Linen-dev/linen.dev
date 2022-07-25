export const LIMIT = 100;
export const THREAD_LIMIT = 4;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
export const SECONDS = 1000;
export enum CrawlType {
  from_onboarding = 'from_onboarding',
  new_only = 'new_only',
  historic = 'historic',
}
