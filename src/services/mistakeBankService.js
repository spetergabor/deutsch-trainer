const STORAGE_KEY = "nemet-app:mistake-bank:v1";

function readMistakes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Hibatár betöltési hiba:", error.message);
    return [];
  }
}

function writeMistakes(mistakes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch (error) {
    console.error("Hibatár mentési hiba:", error.message);
  }
}

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function buildMistakeId(type, sourceId, correctAnswer) {
  return [type, sourceId || normalizeAnswer(correctAnswer)]
    .filter(Boolean)
    .join(":");
}

export function getMistakes() {
  return readMistakes().sort((a, b) => {
    const scoreA = (a.wrongCount || 1) * 100 + Date.parse(a.lastWrongAt || 0) / 1e11;
    const scoreB = (b.wrongCount || 1) * 100 + Date.parse(b.lastWrongAt || 0) / 1e11;

    return scoreB - scoreA;
  });
}

export function getActiveMistakes() {
  return getMistakes().filter((mistake) => !mistake.resolvedAt);
}

export function getMistakeStats() {
  const active = getActiveMistakes();

  return {
    total: active.length,
    adjektiv: active.filter((mistake) => mistake.type === "adjektiv").length,
    vocabulary: active.filter((mistake) => mistake.type === "vocabulary").length,
  };
}

export function recordMistake(payload) {
  if (!payload?.type || !payload?.correctAnswer) return;

  const mistakes = readMistakes();
  const id = payload.id || buildMistakeId(payload.type, payload.sourceId, payload.correctAnswer);
  const existingIndex = mistakes.findIndex((mistake) => mistake.id === id);
  const now = new Date().toISOString();

  const nextMistake = {
    id,
    type: payload.type,
    label: payload.label || "Gyakorló",
    prompt: payload.prompt || "",
    sourceId: payload.sourceId || "",
    correctAnswer: payload.correctAnswer,
    userAnswer: payload.userAnswer || "",
    explanation: payload.explanation || "",
    level: payload.level || "B1",
    meta: payload.meta || {},
    wrongCount: 1,
    correctCount: 0,
    firstWrongAt: now,
    lastWrongAt: now,
    lastCorrectAt: null,
    resolvedAt: null,
  };

  if (existingIndex >= 0) {
    const existing = mistakes[existingIndex];

    mistakes[existingIndex] = {
      ...existing,
      ...nextMistake,
      wrongCount: (existing.wrongCount || 0) + 1,
      correctCount: 0,
      firstWrongAt: existing.firstWrongAt || now,
      lastWrongAt: now,
      resolvedAt: null,
    };
  } else {
    mistakes.push(nextMistake);
  }

  writeMistakes(mistakes);
}

export function markMistakeCorrect(id) {
  if (!id) return;

  const mistakes = readMistakes();
  const index = mistakes.findIndex((mistake) => mistake.id === id);

  if (index < 0) return;

  const now = new Date().toISOString();
  const mistake = mistakes[index];
  const correctCount = (mistake.correctCount || 0) + 1;

  mistakes[index] = {
    ...mistake,
    correctCount,
    lastCorrectAt: now,
    resolvedAt: correctCount >= 2 ? now : null,
  };

  writeMistakes(mistakes);
}

export function clearResolvedMistakes() {
  writeMistakes(readMistakes().filter((mistake) => !mistake.resolvedAt));
}
