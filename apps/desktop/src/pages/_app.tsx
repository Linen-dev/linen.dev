import type { AppProps } from 'next/app';

import '../style.css';
import '@linen/ui/index.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <Component {...pageProps} />
    </>
  );
}
