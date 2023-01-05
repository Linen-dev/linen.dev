import { ThreadState } from '@prisma/client';
import { z } from 'zod';

export const findSchema = z.object({
  channelId: z.string().uuid(),
  cursor: z.string().min(1).optional(),
});
export type findType = z.infer<typeof findSchema>;

export const getSchema = z.object({
  id: z.string().uuid(),
});
export type getType = z.infer<typeof getSchema>;

export const putSchema = z.object({
  id: z.string().uuid(),
  state: z.enum([ThreadState.OPEN, ThreadState.CLOSE]).optional(),
  title: z.string().optional(),
  pinned: z.boolean().optional(),
});
export type putType = z.infer<typeof putSchema>;
