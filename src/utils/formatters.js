export function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTaskName(type) {
  const names = {
    perfekt: "Perfekt Gyakorló",
    "nomen-verb": "Nomen-Verb",
    adjektiv: "Adjektivdekl.",
    osd: "ÖSD Gyakorló",
    praeposition: "Präpositionen",
    konnektoren: "Konnektoren",
    "sich-verben": "Sich-Verben",
    passiv: "Passiv",
    "passiv-writing": "Passiv átalakítás",
    pronominaladverb: "Pronominaladverbien",
    "pronominaladverb-writing": "Pronominaladv. gépelős",
    vocabulary: "Szókincs edző",
    "vocabulary-learn": "Szókártyák",
    "vocabulary-test": "Szókincs teszt",
    "mistake-review": "Hibatár gyakorló",
    "daily-challenge": "Napi challenge",
    "daily-challenge-adjektiv": "Napi challenge: Adjektiv",
    "daily-challenge-konjunktiv-ii": "Napi challenge: Konjunktiv II",
    "story-reading": "Story-Lesen",
    "learning-library": "Tanulási könyvtár",
    "student-materials": "Beküldött anyagaim",
    messages: "Üzenetek",
    "grammar-guide-passiv": "Passiv",
    "grammar-guide-indirekte-rede": "Indirekte Rede",
    "grammar-guide-adjektivdeklination": "Adjektivdeklination",
    "grammar-guide-brief-schreiben": "Brief schreiben",
    "grammar-guide-pronominaladverbien": "Pronominaladverbien",
    "grammar-guide-partizip-i-und-ii": "Partizip I und II",
    "grammar-guide-infinitivsaetze-vs-nebensaetze":
      "Infinitivsätze vs. Nebensätze",
    "grammar-guide-konjunktiv-ii": "Konjunktiv II",
    "grammar-guide-modalpartikel": "Modalpartikel",
    "grammar-guide-vonatkozo-nevmas": "Vonatkozó névmás",
    profile: "Profil",
  };

  return names[type] || "Gyakorlat";
}
