import { z } from 'zod';
import { MessageFormat } from '../messages';

export const messageGetSchema = z.object({
  messageId: z.string().uuid(),
});
export type messageGetType = z.infer<typeof messageGetSchema>;
export type messageGetResponseType = {
  body: string;
  author: {
    displayName: string | null;
    profileImageUrl?: string | null;
  } | null;
  channelId: string;
  externalMessageId: string | null;
  threadId: string | null;
} | null;

export const messageFindSchema = z.object({
  channelId: z.string().uuid(),
  externalMessageId: z.string().min(1).optional(),
  threadId: z.string().uuid().optional(),
  mustHave: z.preprocess(
    (val) => (!!val ? decodeURIComponent(val as string).split(',') : undefined),
    z.array(z.string()).optional()
  ),
  sortBy: z.enum(['sentAt']).optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
});
export type messageFindType = z.infer<typeof messageFindSchema>;
export type messageFindResponseType = {
  externalMessageId: string | null;
  threadId: string | null;
  id: string;
} | null;

export const messagePostSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  threadId: z.string().uuid(),
  authorId: z.string().uuid(),
  externalMessageId: z.string().min(1),
  body: z.string().min(1),
  mentions: z
    .array(
      z.object({
        id: z.string().uuid(),
      })
    )
    .optional(),
  messageFormat: z.nativeEnum(MessageFormat).optional(),
});
export type messagePostType = z.infer<typeof messagePostSchema>;

export const messagePutSchema = z.object({
  messageId: z.string().uuid(),
  externalMessageId: z.string().min(1).optional(),
  body: z.string().optional(),
});
export type messagePutType = z.infer<typeof messagePutSchema>;

export const messageDeleteSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type messageDeleteType = z.infer<typeof messageDeleteSchema>;
