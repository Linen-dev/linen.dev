export function showTop(
  isPreviousMessageFromSameUser?: boolean | null,
  isPreviousMessageFromSameThread?: boolean | null
) {
  if (isPreviousMessageFromSameThread === undefined)
    return !isPreviousMessageFromSameUser;
  return !isPreviousMessageFromSameUser || !isPreviousMessageFromSameThread;
}
