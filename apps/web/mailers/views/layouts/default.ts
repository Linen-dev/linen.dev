import div from '../components/div';
import img from '../components/img';
import timestamp from '../components/timestamp';

export default function layout(children: string) {
  return `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, target-densitydpi=device-dpi">
      </head>
      <body>
        ${div(
          {
            background: '#f9fafb',
            width: '100%',
            height: '100%',
            spacing: '48px',
          },
          [
            img({
              src: 'https://linen.dev/images/logo/linen.png',
              height: '24',
              style: 'margin: 0 auto; display: block;',
            }),
            div(
              {
                background: '#ffffff',
                padding: '32px',
                width: '480px',
                textAlign: 'center',
              },
              [children.trim()]
            ),
            div(
              {
                background: '#f9fafb',
                textAlign: 'center',
                style: 'font-size: 12px; color: #5d7079;',
              },
              ['© Rebase Corporation 312 W 20th St New York, NY 10011']
            ),
            timestamp(),
          ]
        )}
      </body>
    </html>
  `.trim();
}
