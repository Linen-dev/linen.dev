export function generateRandomDate(
  from = new Date(2022, 1, 1),
  to = new Date()
) {
  const date = Math.floor(
    from.getTime() + Math.random() * (to.getTime() - from.getTime())
  ).toString();
  return `${date.substring(0, 10)}.${date.substring(10)}`;
}
