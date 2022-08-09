interface Props {
  align?: string;
  background?: string;
  spacing?: string;
  padding?: string;
  width?: string;
  height?: string;
  textAlign?: string;
}

export default function div(
  { align, background, spacing, padding, width, height, textAlign }: Props,
  children: string
): string {
  return `
    <table width="${width || '100%'}" height="${height || 'auto'}" align="${
    align || 'center'
  }" cellspacing="${spacing || 0}" cellpadding="${
    padding || 0
  }" border="0" bgcolor="${background || '#ffffff'}">
      <tbody>
        <tr>
          <td align="${textAlign}">${children}</td>
        </tr>
      </tbody>
    </table>
  `.trim();
}
