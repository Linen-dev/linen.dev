import memoizeFn from 'lodash.memoize';

export function memo(resolver?): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.value = memoizeFn(descriptor.value, resolver);
    return descriptor;
  };
}
