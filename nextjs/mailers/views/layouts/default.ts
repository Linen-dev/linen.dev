import div from '../components/div';

export default function layout(children: string) {
  return `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${div(
          {
            background: '#f9fafb',
            width: '100%',
            height: '100%',
            spacing: '48px',
          },
          div(
            {
              background: '#ffffff',
              padding: '32px',
              width: '480px',
              textAlign: 'center',
            },
            children.trim()
          )
        )}
      </body>
    </html>
  `.trim();
}
