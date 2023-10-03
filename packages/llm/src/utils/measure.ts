import * as util from 'util';

export function measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): any {
  const originalMethod = descriptor.value;
  const name =
    target && target.constructor && target.constructor.name
      ? `${target.constructor.name}.${propertyKey}`
      : propertyKey;

  if (util.types.isAsyncFunction(originalMethod)) {
    descriptor.value = async function (...args: any): Promise<any> {
      const description = name === 'Function.crawl' ? ' ' + args[0] : '';
      console.log(`${name}${description} started.`);
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      console.log(
        `${name}${description} finished after ${(end - start).toFixed(
          2
        )} milliseconds.`
      );
      return result;
    };
  } else {
    descriptor.value = function (...args) {
      const description = name === 'Function.crawl' ? ' ' + args[0] : '';
      console.log(`${name}${description} started.`);
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      console.log(
        `${name}${description} finished after ${(end - start).toFixed(
          2
        )} milliseconds.`
      );
      return result;
    };
  }
  return descriptor;
}
