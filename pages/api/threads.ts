import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../../client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const channelId = req.body.channel_id;
  const limit = req.body.limit;
  const offSet = req.body.off_set || 0;

  const threads = await prisma.slackThread.findMany({
    take: limit,
    skip: offSet,
    include: {
      messages: true,
    },
    where: { channelId },
  });

  res.status(200).json({ threads });
}
