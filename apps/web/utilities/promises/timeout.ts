export const timeout: <T>(
  millis: number | 'INFINITELY',
  f: (done: () => boolean) => Promise<T>
) => Promise<T> = (millies, f) => {
  if (millies === 'INFINITELY') {
    return f(() => false);
  }

  let done = false;
  const doneF = () => done;

  return new Promise((resolve, reject) => {
    const timeoutRef = setTimeout(() => {
      done = true;
      reject(new Error('Timeout after ' + millies + 'ms'));
    }, millies);

    const result = f(doneF);
    // result.finally(() => clearTimeout(timeoutRef));

    result.then(
      (r) => {
        resolve(r);
        clearTimeout(timeoutRef);
      },
      (e) => {
        reject(e);
        clearTimeout(timeoutRef);
      }
    );
  });
};
