import { z } from 'zod';

export const getSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type getType = z.infer<typeof getSchema>;

export const postSchema = z.object({
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
export type postType = z.infer<typeof postSchema>;

export const deleteSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type deleteType = z.infer<typeof deleteSchema>;

export const putSchema = z.object({
  id: z.string().uuid(),
  body: z.string(),
});
export type putType = z.infer<typeof putSchema>;
