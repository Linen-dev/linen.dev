import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../../client";
import {
  fetchConversations,
  saveMessages,
} from "../../fetch_all_conversations";
import { findOrCreateChannel } from "../../lib/slack";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const channelId = "C030HFK836C";
  const channel = await findOrCreateChannel(channelId, "kam-sync_test");
  const slackResponse = await fetchConversations(channelId);
  const messages = await saveMessages(slackResponse.body.messages, channel.id);

  res.status(200).json({ messages });
}

export const syncChannel = () => {};
