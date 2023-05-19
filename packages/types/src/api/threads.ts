import { z } from 'zod';
import { ThreadState, ThreadStatus } from '../threads';

export const findThreadSchema = z.object({
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
export type findThreadType = z.infer<typeof findThreadSchema>;

export const getThreadSchema = z.object({
  accountId: z.string().uuid(),
  id: z.string().uuid(),
});
export type getThreadType = z.infer<typeof getThreadSchema>;

export const putThreadSchema = z.object({
  accountId: z.string().uuid(),
  id: z.string().uuid(),
  state: z.enum([ThreadState.OPEN, ThreadState.CLOSE]).optional(),
  title: z.string().optional(),
  pinned: z.boolean().optional(),
  resolutionId: z.string().uuid().optional().nullable(),
  message: z.string().optional(),
});
export type putThreadType = z.infer<typeof putThreadSchema>;

export const postThreadSchema = z.object({
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
export type postThreadType = z.infer<typeof postThreadSchema>;
