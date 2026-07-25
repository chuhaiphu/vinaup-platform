export function generateZonedTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}
