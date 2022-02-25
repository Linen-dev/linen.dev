import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query.query as string;
  const accountId = req.query.account_id as string;

  const response = await prisma.messages.findMany({
    where: {
      body: {
        search: query,
      },
      channel: {
        accountId: accountId,
      },
    },
    take: 20,
  });

  res.status(200).json({ results: response });
}
//example get query:
//localhost:3000/api/search?query='papercups'

//example response:
// {
//     "results": [
//         {
//             "id": "00b8ebe2-978f-43e6-9ba2-8b3474eafcbe",
//             "createdAt": "2022-02-19T21:33:51.731Z",
//             "body": "that’s awesome :smile: Cant wait to flex my papercups swag :sunglasses:",
//             "sentAt": "2021-03-16T21:41:32.004Z",
//             "channelId": "c550828a-36bc-4e8d-9f45-84d7339bf884",
//             "slackThreadId": "6f4511f5-a449-4420-ab64-75801f1e1640",
//             "usersId": "e3e56a3e-1b39-420b-8455-8f32775a0c19"
//         },
//         {
//             "id": "04aaf56d-9519-4dcd-8fb7-c70555711a1c",
//             "createdAt": "2022-02-19T21:33:43.608Z",
//             "body": "I have a little question about papercups integration on a wordpress website :\nwe did manage to integrate it on our website <https://hidora.io/> but the icon is way too big, any idea of what could cause that ?",
//             "sentAt": "2022-01-18T12:58:49.001Z",
//             "channelId": "af505043-21fb-4810-b3cc-f82a3ef76046",
//             "slackThreadId": "4a469b00-027c-4719-a7d8-27890989a899",
//             "usersId": "e17f6a01-f8e4-4467-9e31-d12a09907aa2"
//         },
//     ]
// }
