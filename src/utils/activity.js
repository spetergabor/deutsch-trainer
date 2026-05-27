export function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function calculateLoginActivity(days = []) {
  const today = new Date();
  const todayKey = getDateKey(today);

  const activeDates = new Set(days.map((item) => item.activity_date));

  const last42Days = [];
  const last30Days = [];

  for (let i = 41; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);
    const active = activeDates.has(key);

    last42Days.push({
      date: key,
      count: active ? 1 : 0,
      level: active ? "level-3" : "level-0",
    });

    if (i < 30) {
      last30Days.push({
        date: key,
        active,
      });
    }
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
    activityCalendar: last42Days,
    activityStats: {
      streak: Math.max(streak, activeDates.has(todayKey) ? 1 : 0),
      activeDays: activeDates.size,
      last30Days: last30Days.filter((day) => day.active).length,
    },
  };
}
