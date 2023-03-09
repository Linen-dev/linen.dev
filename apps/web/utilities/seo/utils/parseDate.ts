export function parseDate(data: any) {
  try {
    return new Date(data).toISOString();
  } catch (error) {
    return data;
  }
}
