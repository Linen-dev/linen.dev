import { NextApiRequest, NextApiResponse } from 'next';
// import Session from 'services/session';
// import { updateReadStatus } from 'services/users/read-status';
// import to from 'utilities/await-to-js';
// import { z } from 'zod';

async function post(request: NextApiRequest, response: NextApiResponse) {
  // const user = await Session.auth(request, response);
  // if (!user) {
  //   return response.status(401).json({});
  // }

  // const schema = z.object({
  //   channelId: z.string().min(1),
  //   timestamp: z.number(),
  // });
  // const [badRequest, body] = await to(schema.parseAsync(request.body));
  // if (badRequest) {
  //   return response.status(400).json({ error: badRequest.message });
  // }

  // const [err, _] = await to(
  //   updateReadStatus({
  //     channelId: body.channelId,
  //     authId: user.id,
  //     timestamp: BigInt(body.timestamp),
  //   })
  // );
  // if (err) {
  //   console.error(err);
  //   return response.status(500).json({});
  // }

  return response.status(200).json({});
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return await post(request, response);
  }
  return response.status(405).end();
}
