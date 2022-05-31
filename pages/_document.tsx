// import Document from 'next/document';
// import { createGetInitialProps } from '@mantine/next';

// const getInitialProps = createGetInitialProps();

// export default class _Document extends Document {
//   static getInitialProps = getInitialProps;
// }

// MyDocument.getInitialProps = async (ctx) => {
//   const sheet = new ServerStyleSheet();
//   const originalRenderPage = ctx.renderPage;

//   try {
//     // prettier-ignore
//     ctx.renderPage = () => originalRenderPage({
//       enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
//     });

//     const initialProps = await Document.getInitialProps(ctx);
//     return {
//       ...initialProps,
//       styles: (
//         <>
//           {initialProps.styles}
//           {sheet.getStyleElement()}
//         </>
//       ),
//     };
//   } finally {
//     sheet.seal();
//   }
// };

import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { ServerStyles, createStylesServer } from '@mantine/next';

const stylesServer = createStylesServer();

export default class _Document extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
            <ServerStyles html={initialProps.html} server={stylesServer} />
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
