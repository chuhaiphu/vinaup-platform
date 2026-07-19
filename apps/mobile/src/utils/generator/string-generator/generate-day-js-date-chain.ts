import dayjs from 'dayjs';

/**
 * Generates an array of Dayjs objects for each day in the range from start to end, include startDate and endDate themselves.
 *
 * @param start - Start date (Date or ISO string).
 * @param end - End date (Date or ISO string).
 * @returns Array of Dayjs objects, one per day in the range.
 * @example
 * const dates = generateDayJsDateChain(new Date('2026-04-10'), new Date('2026-04-13'));
 * // dates: [Dayjs(2026-04-10), Dayjs(2026-04-11), Dayjs(2026-04-12), Dayjs(2026-04-13)]
 * const output = dates.map((d) => d.format('YYYY-MM-DD'));
 * // output: ['2026-04-10', '2026-04-11', '2026-04-12', '2026-04-13']
 */
export function generateDayJsDateChain(start: Date | string, end: Date | string): dayjs.Dayjs[] {
  const result: dayjs.Dayjs[] = [];
  let current = dayjs(start);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    result.push(current);
    current = current.add(1, 'day');
  }
  return result;
}
