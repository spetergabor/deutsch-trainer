export function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateLoginActivity(days = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = getDateKey(today);

  const activeDates = new Set(days.map((item) => item.activity_date));

  const last30Days = [];
  const yearStart = new Date(today);
  yearStart.setDate(today.getDate() - 364);

  const calendarStart = new Date(yearStart);
  calendarStart.setDate(yearStart.getDate() - yearStart.getDay());

  const monthNames = [
    "jan",
    "feb",
    "márc",
    "ápr",
    "máj",
    "jún",
    "júl",
    "aug",
    "szept",
    "okt",
    "nov",
    "dec",
  ];

  const weeks = [];
  const monthLabels = [];
  let previousMonth = null;
  let yearlyActiveDays = 0;

  for (let weekIndex = 0; weekIndex < 53; weekIndex += 1) {
    const week = {
      key: `week-${weekIndex}`,
      days: [],
    };

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + weekIndex * 7 + dayIndex);

      const key = getDateKey(date);
      const isInYearRange = date >= yearStart && date <= today;
      const active = isInYearRange && activeDates.has(key);

      if (isInYearRange && active) {
        yearlyActiveDays += 1;
      }

      if (isInYearRange && date.getMonth() !== previousMonth) {
        monthLabels.push({
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: monthNames[date.getMonth()],
          weekIndex,
        });
        previousMonth = date.getMonth();
      }

      week.days.push({
        date: key,
        count: active ? 1 : 0,
        level: active ? "level-4" : "level-0",
        isInYearRange,
        isFuture: date > today,
      });
    }

    weeks.push(week);
  }

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);
    const active = activeDates.has(key);

    last30Days.push({
      date: key,
      active,
    });
  }

  let streak = 0;

  for (let i = 0; i < 365; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);

    if (activeDates.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  return {
    activityCalendar: {
      weeks,
      monthLabels,
      activeDays: yearlyActiveDays,
    },
    activityStats: {
      streak: Math.max(streak, activeDates.has(todayKey) ? 1 : 0),
      activeDays: yearlyActiveDays,
      last30Days: last30Days.filter((day) => day.active).length,
    },
  };
}
