import buildFactory from './build';
import createFactory from './create';

export function build(name: string, options?: object): any {
  return buildFactory(name, options);
}

export async function create(name: string, options?: object): any {
  return createFactory(name, options);
}
