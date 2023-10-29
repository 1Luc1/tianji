import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import type { DateUnit } from '../../shared';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export type { DateUnit };

function createDateUnitFn(unit: DateUnit) {
  return {
    diff: (end: dayjs.ConfigType, start: dayjs.ConfigType) =>
      dayjs(end).diff(start, unit),
    add: (date: dayjs.ConfigType, n: number) => dayjs(date).add(n, unit),
    normalize: (date: dayjs.ConfigType) => dayjs(date).startOf(unit),
  };
}

export function getDateArray(
  data: { x: string; y: number }[],
  startDate: dayjs.ConfigType,
  endDate: dayjs.ConfigType,
  unit: DateUnit
) {
  const arr = [];
  const { diff, add, normalize } = createDateUnitFn(unit);
  const n = diff(endDate, startDate) + 1;

  function findData(date: dayjs.Dayjs) {
    const d = data.find(({ x }) => {
      return normalize(dayjs(x)).unix() === date.unix();
    });

    return d?.y || 0;
  }

  for (let i = 0; i < n; i++) {
    const t = normalize(add(startDate, i));
    const y = findData(t);

    arr.push({ x: formatDate(t), y });
  }

  return arr;
}

export function formatDate(val: dayjs.ConfigType) {
  return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
}

export function formatDateWithUnit(val: dayjs.ConfigType, unit: DateUnit) {
  if (unit === 'minute') {
    return dayjs(val).format('HH:mm');
  } else if (unit === 'hour') {
    return dayjs(val).format('HA');
  } else if (unit === 'day') {
    return dayjs(val).format('MMM DD');
  } else if (unit === 'month') {
    return dayjs(val).format('MMM');
  } else if (unit === 'year') {
    return dayjs(val).format('YYYY');
  }

  return formatDate(val);
}
