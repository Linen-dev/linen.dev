import { ThreadStatus } from '@linen/types';
import { ThreadState } from '@linen/database';
import { z } from 'zod';

export const findSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  cursor: z.string().min(1).optional(),
  userId: z.string().optional(),
  status: z
    .enum([
      ThreadStatus.UNREAD,
      ThreadStatus.READ,
      ThreadStatus.MUTED,
      ThreadStatus.REMINDER,
    ])
    .optional(),
});
export type findType = z.infer<typeof findSchema>;

export const getSchema = z.object({
  accountId: z.string().uuid(),
  id: z.string().uuid(),
});
export type getType = z.infer<typeof getSchema>;

export const putSchema = z.object({
  accountId: z.string().uuid(),
  id: z.string().uuid(),
  state: z.enum([ThreadState.OPEN, ThreadState.CLOSE]).optional(),
  title: z.string().optional(),
  pinned: z.boolean().optional(),
  resolutionId: z.string().uuid().optional(),
  message: z.string().optional(),
});
export type putType = z.infer<typeof putSchema>;

export const postSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  imitationId: z.string().optional(),
  body: z.string().min(1),
  title: z.string().optional(),
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
