import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'server/middlewares/error';
import init from 'server/middlewares/init';

export default function nextConnectWrapper() {
  return nextConnect({ onError, onNoMatch }).use(init);
}
