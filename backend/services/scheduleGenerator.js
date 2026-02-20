const TOPICS = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6', 'Topic 7'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toIsoDateUTC(date) {
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  return `${y}-${m}-${d}`;
}

function isSundayUTC(date) {
  return date.getUTCDay() === 0;
}

function addDaysUTC(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function sameMonthUTC(date, year, month1to12) {
  return date.getUTCFullYear() === year && date.getUTCMonth() === month1to12 - 1;
}

/**
 * Builds the 3 batches/month schedule:
 * - Each batch has 7 class days
 * - No classes on Sundays
 * - Batch 1 starts from the 1st of the month (if Sunday, it starts next non-Sunday)
 * - Between batches: 2 NON-SUNDAY gap days (Sundays do not count toward the 2-day gap)
 */
export function buildMonthSchedule(year, month1to12) {
  const scheduleByIso = new Map(); // isoDate -> { batchNumber, dayNumber, topic }
  let cursor = new Date(Date.UTC(year, month1to12 - 1, 1));

  for (let batch = 1; batch <= 3; batch++) {
    let dayInBatch = 0;

    while (dayInBatch < 7) {
      if (!sameMonthUTC(cursor, year, month1to12)) break;

      if (isSundayUTC(cursor)) {
        cursor = addDaysUTC(cursor, 1);
        continue;
      }

      dayInBatch += 1;
      const isoDate = toIsoDateUTC(cursor);
      scheduleByIso.set(isoDate, {
        isoDate,
        batchNumber: batch,
        dayNumber: dayInBatch,
        topic: TOPICS[dayInBatch - 1],
      });

      cursor = addDaysUTC(cursor, 1);
    }

    if (batch < 3) {
      // 2 non-Sunday gap days between batches
      let gapDays = 0;
      while (gapDays < 2) {
        if (!sameMonthUTC(cursor, year, month1to12)) break;

        if (isSundayUTC(cursor)) {
          cursor = addDaysUTC(cursor, 1);
          continue;
        }

        gapDays += 1;
        cursor = addDaysUTC(cursor, 1);
      }
    }
  }

  return scheduleByIso;
}

export function buildCalendarGrid(year, month1to12, selectedIsoDatesSet = new Set()) {
  const scheduleByIso = buildMonthSchedule(year, month1to12);
  const first = new Date(Date.UTC(year, month1to12 - 1, 1));
  const firstDow = first.getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();

  const cells = [];

  // Leading empty cells
  for (let i = 0; i < firstDow; i++) {
    cells.push({ type: 'empty', date: '-' });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month1to12 - 1, day));
    const isoDate = toIsoDateUTC(date);
    const scheduled = scheduleByIso.get(isoDate);

    if (!scheduled) {
      cells.push({ type: 'plain', date: pad2(day), isoDate });
      continue;
    }

    const isSelected = selectedIsoDatesSet.has(isoDate);
    cells.push({
      type: isSelected ? 'dark' : 'light',
      date: pad2(day),
      isoDate,
      dayNum: `Day ${scheduled.dayNumber}`,
      topic: scheduled.topic,
      batchNumber: scheduled.batchNumber,
      dayNumber: scheduled.dayNumber,
    });
  }

  // Trailing filler to complete 6 rows (42 cells) like typical calendars
  while (cells.length < 42) {
    cells.push({ type: 'empty', date: '-' });
  }

  return { cells, scheduleByIso };
}


