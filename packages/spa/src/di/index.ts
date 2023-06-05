import tauri from './tauri';
import web from './web';
import { DI } from './types';

export const isTauri = () =>
  !!Object.keys((window as any).__TAURI__ || {}).length;

const di: DI = isTauri() ? tauri : web;

export default di;
