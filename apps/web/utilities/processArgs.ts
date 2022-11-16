/**
 *
 * @param flag flag you are looking for, fi: accountId
 * @returns value or exception
 */
export function findArgAndParseOrThrow(flag: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${flag}=`));
  console.log(flag, arg);
  if (!arg) {
    throw `missing ${flag} parameter, try the same command with --${flag}=value`;
  }
  const value = arg.split('=').pop();
  if (!value) {
    throw `missing ${flag} value, try the same command with --${flag}=value`;
  }
  return value;
}
/**
 *
 * @param flag flag you are looking for, fi: accountId
 * @returns value or undefined
 */
export function findArgAndParse(flag: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${flag}=`));
  console.log(flag, arg);
  if (!arg) {
    return undefined;
  }
  const value = arg.split('=').pop();
  if (!value) {
    throw `missing ${flag} value, try the same command with --${flag}=value`;
  }
  return value;
}

export function findBoolArg(flag: string) {
  const arg = process.argv.find((arg) => arg.startsWith(`--${flag}`));
  console.log(flag, arg);
  return !!arg;
}
