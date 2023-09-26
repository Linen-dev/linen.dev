import {
  AuthedRequestWithTenantAndBody,
  NextFunction,
  Response,
  ChatType,
  findThreadType,
  getThreadType,
  postThreadType,
  putThreadType,
  type findTopicsSchema,
  MentionNode,
} from '@linen/types';
import {
  BadRequest,
  Forbidden,
  NotFound,
  NotImplemented,
} from 'server/exceptions';
import ThreadsServices from 'services/threads';
import { findTopics } from 'services/threads/topics';
import { trackApiEvent, ApiEvent } from 'utilities/ssr-metrics';
import { parse, find } from '@linen/ast';
import { isMember, isNotManager } from 'utilities/roles';
import { to } from '@linen/utilities/await-to-js';
import ChannelsService from 'services/channels';

export class ThreadsController {
  static async get(
    req: AuthedRequestWithTenantAndBody<getThreadType>,
    res: Response,
    next: NextFunction
  ) {
    const thread = await ThreadsServices.get({
      ...req.body,
      accountId: req.tenant?.id!,
    });
    if (!thread) {
      return next(new NotFound());
    }
    res.json(thread);
  }
  static async find(
    req: AuthedRequestWithTenantAndBody<findThreadType>,
    res: Response,
    _: NextFunction
  ) {
    const threads = await ThreadsServices.find({
      ...req.body,
      accountId: req.tenant?.id!,
    });
    res.json(threads);
  }
  static async put(
    req: AuthedRequestWithTenantAndBody<putThreadType>,
    res: Response,
    next: NextFunction
  ) {
    // if pinned, must be admin/owner
    if (
      typeof req.body.pinned === 'boolean' &&
      isNotManager(req.tenant_user?.role)
    ) {
      return next(new Forbidden('User not allow to pin messages'));
    }

    // if member, must be the creator
    if (isMember(req.tenant_user?.role)) {
      const thread = await ThreadsServices.get({
        id: req.body.id,
        accountId: req.tenant?.id!,
      });
      if (req.tenant_user?.id !== thread?.messages?.shift()?.author?.id) {
        return next(new Forbidden('User not allow to update this message'));
      }
    }

    const thread = await ThreadsServices.update({
      ...req.body,
      accountId: req.tenant?.id!,
    });
    res.json(thread);
  }
  static async post(
    req: AuthedRequestWithTenantAndBody<postThreadType>,
    res: Response,
    next: NextFunction
  ) {
    if (req.tenant?.chat === ChatType.NONE) {
      return next(new Forbidden('Community has chat disabled'));
    }

    if (
      req.tenant?.chat === ChatType.MANAGERS &&
      isNotManager(req.tenant_user?.role)
    ) {
      return next(new Forbidden('User is not allow to chat'));
    }

    const tree = parse.linen(req.body.body);
    const mentionNodes: MentionNode[] = find.mentions(tree);

    if (
      mentionNodes.find((m) => m.id === 'channel') &&
      isNotManager(req.tenant_user?.role)
    ) {
      return next(new Forbidden('User is not allow to mention a channel'));
    }
    const [err, _] = await to(
      ChannelsService.isChannelUsable({
        channelId: req.body.channelId,
        accountId: req.tenant?.id!,
      })
    );
    if (err) {
      return next(new BadRequest(err.message));
    }

    const thread = await ThreadsServices.create({
      accountId: req.tenant?.id!,
      body: req.body.body,
      channelId: req.body.channelId,
      files: req.body.files,
      imitationId: req.body.imitationId,
      title: req.body.title,
      authorId: req.tenant_user?.id!,
    });

    await trackApiEvent({ req, res }, ApiEvent.user_send_message);

    res.json({ thread, imitationId: req.body.imitationId });
  }
  static async findTopics(
    req: AuthedRequestWithTenantAndBody<findTopicsSchema>,
    res: Response,
    next: NextFunction
  ) {
    const { threads, topics } = await findTopics({
      channelId: req.body.channelId,
      sentAt: req.body.sentAt ? new Date(req.body.sentAt) : undefined,
      direction: req.body.direction,
      anonymize: req.tenant?.anonymize!,
      accountId: req.tenant?.id!,
    });
    if (!threads.length) {
      return next(new NotFound());
    }
    res.json({ threads, topics });
  }
  static async notImplemented(_: any, _2: any, next: NextFunction) {
    next(new NotImplemented());
  }
}
