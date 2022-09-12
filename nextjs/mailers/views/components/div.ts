interface Props {
  align?: string;
  background?: string;
  spacing?: string;
  padding?: string;
  width?: string;
  height?: string;
  textAlign?: string;
  style?: string;
}

export default function div(
  {
    align,
    background,
    spacing,
    padding,
    width,
    height,
    textAlign,
    style,
  }: Props,
  children: string[]
): string {
  return `
    <table width="${width || '100%'}" height="${height || 'auto'}" align="${
    align || 'center'
  }" cellspacing="${spacing || 0}" cellpadding="${
    padding || 0
  }" border="0" bgcolor="${background || '#ffffff'}">
      <tbody>
        <tr>
          <td style="${style || ''}" align="${textAlign || ''}">${children
    .map((child) => child)
    .join('')}</td>
        </tr>
      </tbody>
    </table>`.trim();
}
