import { z } from 'zod';

export const getMessageSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type getMessageType = z.infer<typeof getMessageSchema>;

export const postMessageSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  threadId: z.string().uuid(),
  imitationId: z.string().optional(),
  body: z.string().min(1),
  files: z
    .array(
      z.object({
        id: z.string().min(1),
        url: z.string().min(1),
      })
    )
    .optional(),
});
export type postMessageType = z.infer<typeof postMessageSchema>;

export const deleteMessageSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type deleteMessageType = z.infer<typeof deleteMessageSchema>;

export const putMessageSchema = z.object({
  id: z.string().uuid(),
  body: z.string(),
});
export type putMessageType = z.infer<typeof putMessageSchema>;
