export function getLast30ChartPoints(exercises) {
  const items = [...exercises].reverse();

  if (!items.length) return "";

  return items
    .map((item, index) => {
      const percent = item.max_score
        ? (Number(item.score) / Number(item.max_score)) * 100
        : 0;

      const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
      const y = 100 - percent;

      return `${x},${y}`;
    })
    .join(" ");
}

export function getCorrectAnswers(exercises) {
  return exercises.reduce((sum, item) => {
    return sum + (Number(item.score) || 0);
  }, 0);
}

export function getWrongAnswers(exercises) {
  return exercises.reduce((sum, item) => {
    const score = Number(item.score) || 0;
    const max = Number(item.max_score) || 0;

    return sum + Math.max(max - score, 0);
  }, 0);
}

export function getAveragePercent(exercises) {
  const totalMax = exercises.reduce((sum, item) => {
    return sum + (Number(item.max_score) || 0);
  }, 0);

  if (!totalMax) return 0;

  return Math.round((getCorrectAnswers(exercises) / totalMax) * 100);
}

export function calculateStatsFromResults(results) {
  if (!results.length) {
    return {
      recentExercises: [],
      stats: {
        accuracy: 0,
        totalDone: 0,
      },
    };
  }

  let totalScore = 0;
  let totalMaxScore = 0;

  results.forEach((item) => {
    totalScore += Number(item.score) || 0;
    totalMaxScore += Number(item.max_score) || 0;
  });

  return {
    recentExercises: results.slice(0, 30),
    stats: {
      totalDone: results.length,
      accuracy: totalMaxScore
        ? Math.round((totalScore / totalMaxScore) * 100)
        : 0,
    },
  };
}

const taskLabels = {
  perfekt: "Perfekt",
  "nomen-verb": "Nomen-Verb",
  adjektiv: "Adjektiv",
  osd: "ÖSD",
  praeposition: "Präpositionen",
  konnektoren: "Konnektoren",
  "zu-infinitiv": "Zu + Infinitiv",
  plusquamperfekt: "Plusquamperfekt",
  "sich-verben": "Sich-Verben",
  passiv: "Passiv",
  "passiv-writing": "Passiv átalakítás",
  pronominaladverb: "Pronominaladverbien",
  "pronominaladverb-writing": "Pronominaladv. gépelős",
  vocabulary: "Szókincs edző",
  "vocabulary-learn": "Szókártyák",
  "vocabulary-test": "Szókincs teszt",
  "daily-challenge": "Napi challenge",
  "daily-challenge-adjektiv": "Napi challenge: Adjektiv",
  "daily-challenge-konjunktiv-ii": "Napi challenge: Konjunktiv II",
  "story-reading": "Story-Lesen",
};

function getTaskLabel(type) {
  return taskLabels[type] || type || "Gyakorlat";
}

export function getTopicStats(results) {
  const grouped = new Map();

  results.forEach((item) => {
    const type = item.exercise_type || "unknown";
    const current = grouped.get(type) || {
      type,
      label: getTaskLabel(type),
      totalScore: 0,
      totalMax: 0,
      attempts: 0,
    };

    current.totalScore += Number(item.score) || 0;
    current.totalMax += Number(item.max_score) || 0;
    current.attempts += 1;

    grouped.set(type, current);
  });

  return Array.from(grouped.values())
    .map((topic) => ({
      ...topic,
      accuracy: topic.totalMax
        ? Math.round((topic.totalScore / topic.totalMax) * 100)
        : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
}

export function getWeakTopics(results, limit = 3) {
  return getTopicStats(results)
    .filter((topic) => topic.attempts >= 2 && topic.accuracy < 75)
    .slice(0, limit);
}

export function getRecommendedPractice(results) {
  const weakTopics = getWeakTopics(results, 1);

  if (weakTopics.length) {
    const topic = weakTopics[0];

    return {
      type: topic.type,
      label: topic.label,
      reason: `${topic.accuracy}% átlag az utolsó ${topic.attempts} próbából`,
    };
  }

  const topicStats = getTopicStats(results);

  if (topicStats.length) {
    const leastPracticed = [...topicStats].sort(
      (a, b) => a.attempts - b.attempts || a.accuracy - b.accuracy,
    )[0];

    return {
      type: leastPracticed.type,
      label: leastPracticed.label,
      reason: "Ezt gyakoroltad mostanában a legkevesebbet",
    };
  }

  return {
    type: "adjektiv",
    label: "Adjektivdeklination",
    reason: "Sok döntési pont, jól automatizálható gyakorlással",
  };
}

export function getLast30Trend(results) {
  const items = results.slice(0, 30).reverse();

  if (items.length < 4) {
    return {
      direction: "neutral",
      label: "Még kevés adat",
      detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
      change: 0,
    };
  }

  const midpoint = Math.floor(items.length / 2);
  const older = items.slice(0, midpoint);
  const newer = items.slice(midpoint);
  const olderAverage = getAveragePercent(older);
  const newerAverage = getAveragePercent(newer);
  const change = newerAverage - olderAverage;

  if (change >= 8) {
    return {
      direction: "up",
      label: "Javuló tendencia",
      detail: `Az újabb feladatok átlaga ${change} ponttal jobb.`,
      change,
    };
  }

  if (change <= -8) {
    return {
      direction: "down",
      label: "Visszaeső tendencia",
      detail: `Az újabb feladatok átlaga ${Math.abs(change)} ponttal gyengébb.`,
      change,
    };
  }

  return {
    direction: "neutral",
    label: "Stabil teljesítmény",
    detail: "Az utolsó feladatok átlaga nagyjából egyenletes.",
    change,
  };
}

export function getTeacherAlerts(results) {
  const alerts = [];
  const weakTopics = getWeakTopics(results, 2);
  const trend = getLast30Trend(results);

  weakTopics.forEach((topic) => {
    alerts.push({
      type: "weak-topic",
      level: topic.accuracy < 55 ? "high" : "medium",
      text: `Sokat ront ebből: ${topic.label} (${topic.accuracy}%).`,
    });
  });

  if (trend.direction === "down") {
    alerts.push({
      type: "trend-down",
      level: "medium",
      text: trend.detail,
    });
  }

  return alerts;
}
