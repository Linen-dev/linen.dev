// naively hardcoing image widths to prevent layout shifts on page loads
// we should remove this as soon as we migrate image names with dimensions
export function getImageWidthByUrl(src: string) {
  if (src === 'https://static.main.linendev.com/logos/growthbook_logo.svg') {
    return 131;
  }
  if (src === 'https://static.main.linendev.com/logos/cerbos-logo.svg') {
    return 82;
  }
  if (src === 'https://static.main.linendev.com/logos/pulumi-logo.svg') {
    return 96;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/osquery%2520sticker%2520%281%297fb9af5f-b4e4-449f-9dfd-ae4d0d0d106f.svg'
  ) {
    return 82;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/platform-engineering-logo.svg'
  ) {
    return 90;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/5838a945-18b3-4437-9ab1-ee7aec4e8901.svg'
  ) {
    return 103;
  }
  if (src === 'https://static.main.linendev.com/logos/questdb-logo.svg') {
    return 99;
  }
  if (src === 'https://static.main.linendev.com/logos/orchest-logo.svg') {
    return 112;
  }
  if (src === 'https://static.main.linendev.com/logos/signoz-logo.svg') {
    return 96;
  }
  if (src === 'https://static.main.linendev.com/logos/prefect-logo.svg') {
    return 94;
  }
  if (src === 'https://static.main.linendev.com/logos/acryl-logo.svg') {
    return 88;
  }
  if (
    src === 'https://static.main.linendev.com/logos/luna-sec-white-logo.svg'
  ) {
    return 93;
  }
  if (src === 'https://static.main.linendev.com/logos/kotlin-logo.svg') {
    return 111;
  }
  if (src === 'https://static.main.linendev.com/logos/calcom-logo.svg') {
    return 110;
  }
  if (src === 'https://static.main.linendev.com/logos/efabless-logo.svg') {
    return 64;
  }
  if (src === 'https://static.main.linendev.com/logos/infracost-logo.svg') {
    return 118;
  }
  if (
    src === 'https://static.main.linendev.com/logos/future-of-coding-logo.svg'
  ) {
    return 140;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/c565d644-1a66-456c-afea-28dbc04ff881.svg'
  ) {
    return 103;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/image%2520(14)19913d85-f662-4518-a9a1-7adc1793dfd4.png'
  ) {
    return 24;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/dl-stacked-rev-rgb-200pxed106a3d-55a3-4be6-b3ae-266540cc26fa.png'
  ) {
    return 31;
  }
  if (
    src === 'https://static.main.linendev.com/logos/flyte_lockup_on_dark.png'
  ) {
    return 73;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/02df5b5e-1d06-49b5-8c84-c2b67ca31b10.png'
  ) {
    return 69;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/9531bdd8-0127-48ad-877d-a65da3f90597.png'
  ) {
    return 96;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/netsuiteprofessionals-logo.png'
  ) {
    return 72;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/pants-20logo-20with-20name0d38a6d9-3f5c-4614-8a58-f24fb11f86d5.png'
  ) {
    return 72;
  }
  if (
    src ===
    'https://static.main.linendev.com/logos/4daeef92-7139-43b6-a5af-3feb8342a30c.png'
  ) {
    return 92;
  }
  if (src === 'https://static.main.linendev.com/logos/airbyte-logo.png') {
    return 88;
  }
  return undefined;
}

export function getImageWidth(src: string) {
  const hardcodedWidth = getImageWidthByUrl(src);
  if (hardcodedWidth) {
    return hardcodedWidth;
  }
  const parts = src.split('_');
  const last = parts[parts.length - 1];
  const sizes = last.split('.');
  const dimensions = sizes[sizes.length - 2];
  if (dimensions) {
    const [width, height] = dimensions.split('x');
    if (width && height) {
      return Number(width);
    }
  }
  return undefined;
}
