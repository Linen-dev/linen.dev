import { z } from 'zod';

export const putMarkSchema = z.object({
  threadId: z.string().uuid(),
});

export type putMarkType = z.infer<typeof putMarkSchema>;

export const putSettingsSchema = z.object({
  notificationsByEmail: z.boolean(),
});

export type putSettingsType = z.infer<typeof putSettingsSchema>;
