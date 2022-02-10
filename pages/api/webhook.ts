import prisma from "../../client";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const event = req.body;
  const message = await createSlackMessage(event);
  res.status(200).json({ message });
}

export const createSlackMessage = async (event: any) => {
  const body = event.event.text;
  const timestamp = event.event.ts;
  const sentAt = new Date(parseFloat(timestamp) * 1000);

  return await prisma.message.create({
    data: {
      body: body,
      sentAt: sentAt,
    },
  });
};
