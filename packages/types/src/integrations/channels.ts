import { z } from 'zod';
import { channelsIntegrationType } from '../channels';

export const channelGetSchema = z.object({
  channelId: z.string().uuid().optional(),
  integrationId: z.coerce.string().min(1).optional(),
});
export type channelGetType = z.infer<typeof channelGetSchema>;

export const channelGetIntegrationSchema = z.object({
  channelId: z.string().uuid(),
  type: z.nativeEnum(channelsIntegrationType),
});
export type channelGetIntegrationType = z.infer<
  typeof channelGetIntegrationSchema
>;

export const channelPutIntegrationSchema = z.object({
  integrationId: z.string().uuid(),
  data: z.any(),
  externalId: z.string().optional(),
});
export type channelPutIntegrationType = z.infer<
  typeof channelPutIntegrationSchema
>;

export const channelFindOrCreateSchema = z.object({
  accountId: z.string().uuid(),
  channelName: z.string(),
  externalChannelId: z.string(),
  hidden: z.boolean().optional(),
  members: z.array(z.string().uuid()).optional(),
});
export type channelFindOrCreateType = z.infer<typeof channelFindOrCreateSchema>;
