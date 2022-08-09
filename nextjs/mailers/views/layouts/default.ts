export default function layout(children: string) {
  return `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${children.trim()}
      </body>
    </html>
  `.trim();
}
