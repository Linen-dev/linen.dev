import { z } from 'zod';

export const threadPostSchema = z.object({
  channelId: z.string().uuid(),
  body: z.string().min(1),
  title: z.string().optional(),
  externalThreadId: z.string().min(1),
  authorId: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type threadPostType = z.infer<typeof threadPostSchema>;

export const threadPutSchema = z.object({
  title: z.string().optional(),
  accountId: z.string().uuid().optional(),
  channelId: z.string().uuid(),
  externalThreadId: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'CLOSE']).optional(),
  threadId: z.string().uuid().optional(),
});
export type threadPutType = z.infer<typeof threadPutSchema>;

export const threadFindSchema = z.object({
  channelId: z.string().uuid(),
  externalThreadId: z.string().min(1).optional(),
  threadId: z.string().uuid().optional(),
});
export type threadFindType = z.infer<typeof threadFindSchema>;
export type threadFindResponseType = {
  id: string;
  title: string | null;
  externalThreadId: string | null;
  messages: {
    body: string;
    author: {
      displayName: string | null;
    } | null;
  }[];
} | null;
