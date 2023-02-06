import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';
import superagent from 'superagent';
import fs from 'fs';

// async function update(request: NextApiRequest, response: NextApiResponse) {
//   const id = request.query.id as string;
//   await prisma.threads.update({
//     where: { id },
//     data: { viewCount: { increment: 1 } },
//   });
//   return response.status(200).json({});
// }

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const token = process.env.GPT3_SECRETS_KEY;
  const result: message[] = await prisma.$queryRaw`select messages.id as 
    messageid, body from messages join "threads" on messages."threadId" = "threads".id  
    where "threads"."channelId" = '4c850a46-0114-46dd-af00-7b21eb8720b9' and "externalThreadId" = "externalMessageId";`;

  const trimmedMessages = result.map((m) => {
    return {
      body: m.body.slice(0, 2046),
      messageId: m.messageid,
      embedding: null,
      id: null,
    };
  });

  //   console.log(trimmedMessages);

  const res = await superagent
    .post('https://api.openai.com/v1/engines/babbage-similarity/embeddings')
    .set('Authorization', 'Bearer ' + token)
    .send({ input: trimmedMessages.map((m) => m.body) });

  const data: embeddingResponse[] = res.body.data;

  for (let i = 0; i < trimmedMessages.length - 1; i++) {
    const message = trimmedMessages[i] as any;
    message.embedding = data[i].embedding;
    message.id = i;
  }

  fs.writeFile(
    'embeddingResults.json',
    JSON.stringify(trimmedMessages),
    (write) => {
      console.log({ write });
    }
  );

  return response.status(200).json({ trimmedMessages });
}

// export const getSlackChannelInfo = async (channelId: string, token: string) => {
//   const url = 'https://slack.com/api/conversations.info';

//   const response = await request
//     .get(url + 'channel=' + channelId)
//     .set('Authorization', 'Bearer ' + token);

//   return response;
// };

type embeddingResponse = {
  object: string;
  index: number;
  embedding: number[];
};

type message = {
  messageid: string;
  body: string;
};
