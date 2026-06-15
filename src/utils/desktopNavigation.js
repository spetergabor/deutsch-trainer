export const studentSearchItems = [
  { key: "messages", label: "Üzenetek", icon: "💬", group: "Kapcsolat", mode: "messages" },
  { key: "student-lessons", label: "Óráim", icon: "🗓️", group: "Online órák", mode: "student-lessons" },
  { key: "learning-library", label: "Tanulási könyvtár", icon: "🧭", group: "Könyvtár", mode: "learning-library" },
  { key: "perfekt", label: "Perfekt", icon: "🚀", group: "Gyakorló", mode: "perfekt" },
  { key: "nomen-verb", label: "Nomen-Verb", icon: "📚", group: "Gyakorló", mode: "nomen-verb" },
  { key: "adjektiv", label: "Adjektivdeklination", icon: "🎨", group: "Gyakorló", mode: "adjektiv" },
  { key: "osd", label: "ÖSD feladatok", icon: "🇦🇹", group: "Gyakorló", mode: "osd" },
  { key: "praeposition", label: "Präpositionen", icon: "🔗", group: "Gyakorló", mode: "praeposition" },
  { key: "konnektoren", label: "Konnektoren", icon: "🔀", group: "Gyakorló", mode: "konnektoren" },
  { key: "zu-infinitiv", label: "Zu + Infinitiv", icon: "✍️", group: "Gyakorló", mode: "zu-infinitiv" },
  { key: "plusquamperfekt", label: "Plusquamperfekt", icon: "⏳", group: "Gyakorló", mode: "plusquamperfekt" },
  { key: "sich-verben", label: "Sich-Verben", icon: "🪞", group: "Gyakorló", mode: "sich-verben" },
  { key: "passiv", label: "Passiv", icon: "🛠️", group: "Gyakorló", mode: "passiv" },
  { key: "pronominaladverb", label: "Pronominaladverbien", icon: "🔎", group: "Gyakorló", mode: "pronominaladverb" },
  { key: "vocabulary", label: "Szókincs edző", icon: "🃏", group: "Szókincs", mode: "vocabulary" },
  { key: "story-reading", label: "Story-Lesen", icon: "📰", group: "Olvasás", mode: "story-reading" },
  { key: "daily-challenge", label: "Passiv challenge", icon: "🗞️", group: "Challenge", mode: "daily-challenge" },
  { key: "daily-challenge-adjektiv", label: "Adjektiv challenge", icon: "🎨", group: "Challenge", mode: "daily-challenge-adjektiv" },
  { key: "daily-challenge-konjunktiv-ii", label: "Konjunktiv II challenge", icon: "💭", group: "Challenge", mode: "daily-challenge-konjunktiv-ii" },
];

export const teacherSearchItems = [
  { key: "messages", label: "Üzenetek", icon: "💬", group: "Kapcsolat", mode: "messages" },
  { key: "teacher-students", label: "Diákkezelő", icon: "🎓", group: "Tanári", teacherSection: "students" },
  { key: "teacher-writings", label: "Anyagok és beküldések", icon: "＋", group: "Tanári", teacherSection: "writings" },
  { key: "teacher-exercises", label: "Feladatkezelő", icon: "🧩", group: "Tanári", teacherSection: "exercises" },
  { key: "teacher-homework", label: "Új házi kiadása", icon: "✍️", group: "Tanári", teacherSection: "writings" },
  { key: "teacher-lessons", label: "Online órák", icon: "🗓️", group: "Tanári", teacherSection: "students" },
];

export function getDesktopSearchItems(userRole) {
  return userRole === "teacher" ? teacherSearchItems : studentSearchItems;
}
