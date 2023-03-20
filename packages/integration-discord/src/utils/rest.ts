import { restApiVersion } from './constrains';
import { REST } from 'discord.js';

export async function getClient(token: string) {
  return new REST({ version: restApiVersion }).setToken(token);
}
