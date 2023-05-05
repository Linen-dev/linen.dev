export default function Image({ src, alt, width, height }: any) {
  return <img {...{ src, alt, width, height }} />;
}
