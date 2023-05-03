export function getCurrentDateTime(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `[${day}-${month}-${year} ${hours}:${minutes}:${seconds}]`;
}

export function nanosecondsToMilliseconds(nanoseconds: number) {
  return nanoseconds / 1000000;
}

export function millisecondsToHours(milliseconds: number) {
  return milliseconds / 1000 / 60 / 60;
}
