export function buildTauriDeepLink(url: string) {
  if (url.startsWith('tauri://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return 'tauri://localhost' + url;
  }

  if (url.indexOf('//') > -1) {
    return 'tauri://' + url.substring(url.indexOf('//') - 1);
  }

  return url;
}
