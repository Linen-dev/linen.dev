import { z } from 'zod';

export const channelGetSchema = z.object({
  channelId: z.string().uuid().optional(),
  integrationId: z.string().min(1).optional(),
});
export type channelGetType = z.infer<typeof channelGetSchema>;
