import nextConnect from 'next-connect';
import { onError, onNoMatch } from 'utilities/middlewares/error';
import init from 'utilities/middlewares/init';

export default function nextConnectWrapper() {
  return nextConnect({ onError, onNoMatch }).use(init);
}
