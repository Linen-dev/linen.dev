export function showTop(
  isPreviousMessageFromSameUser?: boolean,
  isPreviousMessageFromSameThread?: boolean
) {
  if (isPreviousMessageFromSameThread === undefined)
    return !isPreviousMessageFromSameUser;
  return !isPreviousMessageFromSameUser || !isPreviousMessageFromSameThread;
}
