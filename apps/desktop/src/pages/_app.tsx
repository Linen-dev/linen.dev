import type { AppProps } from 'next/app';

import '../style.css';
import '@linen/ui/dist/index.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
