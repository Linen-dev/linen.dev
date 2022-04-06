import { NextApiRequest, NextApiResponse } from 'next/types';

function create(request: NextApiRequest, response: NextApiResponse) {
  const { password, token } = JSON.parse(request.body);
  if (!password) {
    return response.status(400).json({ error: 'Password is required' });
  }
  if (!token) {
    return response.status(400).json({ error: 'Token is required' });
  }
  // const token = await Token.findOne({ token });
  // if (!token) {
  //   return response.status(400).json({ error: 'Invalid token' });
  // }
  // const auth = await Auth.findOne({ _id: token.authId });
  // const { salt } = auth
  // const hash = await generatePassword(password, salt);
  // Auth.updateOne({ _id: auth._id }, { password: hash });
  return response.status(200).json({});
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404);
}
