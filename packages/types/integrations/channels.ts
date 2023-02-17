import { z } from 'zod';
import { channelsIntegrationType } from '../index';

export const channelGetSchema = z.object({
  channelId: z.string().uuid().optional(),
  integrationId: z.coerce.string().min(1).optional(),
});
export type channelGetType = z.infer<typeof channelGetSchema>;

export const channelGetIntegrationSchema = z.object({
  channelId: z.string().uuid(),
  type: z.enum([
    channelsIntegrationType.EMAIL,
    channelsIntegrationType.GITHUB,
    channelsIntegrationType.LINEAR,
  ]),
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
