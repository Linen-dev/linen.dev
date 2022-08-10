interface Props {
  src: string;
  height?: string;
  style?: string;
}

export default function img({ src, height, style }: Props): string {
  return `
    <img src="${src}" height="${height || 'auto'}" style="${style || ''}">
  `.trim();
}
