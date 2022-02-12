import prisma from "../../client";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const event = req.body;
  const channelId = req.body.channel;

  const channel = await prisma.channel.findUnique({
    where: {
      slackChannelId: channelId,
    },
  });

  if (channel === null) {
    console.error("Channel does not exist in db ");
    res.status(403).json({ error: "Channel not found" });
    return;
  }

  const message = await createSlackMessage(event, channel.id);
  res.status(200).json({ message });
}

export const createSlackMessage = async (event: any, channelId: string) => {
  const body = event.event.text;
  const timestamp = event.event.ts;
  const sentAt = new Date(parseFloat(timestamp) * 1000);

  return await prisma.message.create({
    data: {
      body: body,
      sentAt: sentAt,
      channelId: channelId,
    },
  });
};

// export const findOrCreateChannel = async (channelId: string) => {
//   prisma.channel.upsert({
//     where: {
//       slackChannelId: channelId,
//     },
//     update: {},
//     create: {
//       slackChannelId: channelId,
//       channelName: channelName,
//     },
//   });
// };
