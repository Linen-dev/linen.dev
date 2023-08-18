import { Router } from 'express';
import { AuthedRequest, AuthedRequestWithBody, Response } from '@linen/types';
import { onError } from 'server/middlewares/error';
import jwtMiddleware from 'server/middlewares/jwt';
import validationMiddleware from 'server/middlewares/validation';
import { z } from 'zod';
import { prisma } from '@linen/database';
import formidable from 'formidable';
import {
  FILE_SIZE_LIMIT_IN_BYTES,
  normalizeFilename,
} from '@linen/utilities/files';
import { readFile } from 'fs/promises';
import UploadService from 'services/upload';
import express from 'express';
import CommunityService from 'services/community';
import { serializeAccount } from '@linen/serializers/account';
import { eventUserNameUpdate } from 'services/events/eventUserNameUpdate';

const prefix = '/api/profile';
const profileRouter = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(1),
});

profileRouter.put(
  `${prefix}`,
  express.json(),
  jwtMiddleware(),
  validationMiddleware(updateProfileSchema, 'body'),
  async (
    req: AuthedRequestWithBody<z.infer<typeof updateProfileSchema>>,
    res: Response
  ) => {
    const users = await prisma.users.findMany({
      select: { id: true, accountsId: true },
      where: { authsId: req.session_user?.id! },
    });
    await prisma.users.updateMany({
      where: {
        id: { in: users.map((u) => u.id) },
      },
      data: {
        displayName: req.body.displayName,
      },
    });
    await Promise.allSettled(
      users.map((u) =>
        eventUserNameUpdate({
          userId: u.id,
          accountId: u.accountsId,
        })
      )
    );
    res.json({ ok: true });
    res.end();
  }
);

profileRouter.get(
  `${prefix}`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response) => {
    const profile = await prisma.auths.findUnique({
      where: { id: req.session_user?.id! },
      select: {
        email: true,
        id: true,
        users: {
          select: {
            accountsId: true,
            displayName: true,
            id: true,
            externalUserId: true,
            profileImageUrl: true,
            role: true,
          },
        },
      },
    });
    const communities = await CommunityService.findByAuthId(
      req.session_user?.id!
    );
    res.json({
      profile,
      communities: communities.map(serializeAccount),
    });
    res.end();
  }
);

interface File {
  filepath: string;
  mimetype: string;
  mtime: string;
  newFilename: string;
  originalFilename: string;
  size: number;
}

profileRouter.post(
  `${prefix}/avatar`,
  jwtMiddleware(),
  async (req: AuthedRequest, res: Response, next) => {
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMIT_IN_BYTES,
      maxFields: 1,
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    const files: File[] = await new Promise((resolve, reject) => {
      form.parse(req, function (error, _, files) {
        if (error) {
          return reject(error);
        }
        resolve(Object.values(files) as any);
      });
    });
    const file = files[0];
    const buffer = await readFile(file.filepath);
    const name = normalizeFilename(file.originalFilename);
    const data = await UploadService.upload({
      id: name,
      name,
      buffer,
    });

    if (!data || !data.url) {
      console.error('Failed to upload an avatar.');
      return res.status(500);
    }

    await prisma.users.updateMany({
      where: {
        auth: { id: req.session_user?.id! },
      },
      data: {
        profileImageUrl: data.url,
      },
    });

    return res.json({});
  }
);

profileRouter.use(onError);

export default profileRouter;
