<template>
  <section class="dashboard-layout">
    <div class="dashboard-header">
      <div class="dashboard-avatar-wrap">
        <img
          :src="
            userSession?.user_metadata?.avatar_url ||
            'https://ui-avatars.com/api/?name=' + authFullName
          "
          class="dashboard-avatar"
        />
      </div>

      <h1>Üdvözlünk, {{ authFullName || "Diák" }}!</h1>

      <div v-if="!isGuestMode" class="dashboard-profile-xp">
        <div class="profile-level-pill streak">🔥 {{ activityStats.streak }} nap</div>

        <div class="profile-level-pill">⭐ {{ xpProfile.xp }} XP</div>

        <div class="profile-level-pill blue">Level {{ xpProfile.level }}</div>
      </div>

      <p class="subtitle">
        {{
          isGuestMode
            ? "Vendégként kipróbálhatod a feladatokat. Profil, statisztika és mentés nem készül."
            : "Kezdj egy rövid napi edzéssel, vagy válassz szabadon a leckék közül."
        }}
      </p>
    </div>

    <section class="dashboard-daily-plan">
      <div class="daily-plan-main">
        <div class="daily-plan-eyebrow">
          <span>Mai edzés</span>
          <small>kb. 12-15 perc</small>
        </div>

        <h2>{{ recommendedPracticeMeta.label }} indításával kezdenék</h2>
        <p>
          {{ recommendedPracticeMeta.reason }} Utána jöhet egy rövid challenge
          és egy szókincs kör, hogy ne csak szabályt tanulj, hanem használatba is kerüljön.
        </p>

        <button
          class="daily-plan-primary"
          @click="$emit('set-mode', recommendedPracticeMeta.mode)"
        >
          Mai edzés indítása
        </button>
      </div>

      <div class="daily-plan-steps">
        <button
          v-for="step in dailyPlanSteps"
          :key="step.label"
          class="daily-plan-step"
          @click="$emit('set-mode', step.mode)"
        >
          <span>{{ step.number }}</span>
          <div>
            <small>{{ step.kicker }}</small>
            <strong>{{ step.label }}</strong>
            <p>{{ step.description }}</p>
          </div>
        </button>
      </div>
    </section>

    <section class="dashboard-challenge-section">
      <h2 class="section-title">Challenge</h2>

      <div class="lessons-ios-grid challenge-ios-grid">
        <div class="ios-app" @click="$emit('set-mode', 'daily-challenge')">
          <div class="ios-icon daily-challenge">🗞️</div>
          <span>Passiv</span>
        </div>

        <div class="ios-app" @click="$emit('set-mode', 'daily-challenge-adjektiv')">
          <div class="ios-icon challenge-adjektiv">🎨</div>
          <span>Adjektiv</span>
        </div>

        <div
          class="ios-app"
          @click="$emit('set-mode', 'daily-challenge-konjunktiv-ii')"
        >
          <div class="ios-icon challenge-konjunktiv">💭</div>
          <span>Konj. II</span>
        </div>
      </div>
    </section>

    <h2 class="section-title">Elérhető leckék</h2>

    <div class="lessons-ios-grid">
      <div class="ios-app" @click="$emit('set-mode', 'perfekt')">
        <div class="ios-icon perfekt">🚀</div>
        <span>Perfekt</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'nomen-verb')">
        <div class="ios-icon nomen">📚</div>
        <span>Nomen-Verb</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'adjektiv')">
        <div class="ios-icon adjektiv">🎨</div>
        <span>Adjektiv</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'osd')">
        <div class="ios-icon osd">🇦🇹</div>
        <span>ÖSD</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'praeposition')">
        <div class="ios-icon praeposition">🔗</div>
        <span>Präpositionen</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'konnektoren')">
        <div class="ios-icon konnektoren">🔀</div>
        <span>Konnektoren</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'sich-verben')">
        <div class="ios-icon sich">🪞</div>
        <span>Sich-Verben</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'passiv')">
        <div class="ios-icon passiv">🛠️</div>
        <span>Passiv</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'pronominaladverb')">
        <div class="ios-icon pronominaladverb">🔎</div>
        <span>Pronominaladv.</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'vocabulary')">
        <div class="ios-icon vocabulary">🃏</div>
        <span>Szókincs</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'story-reading')">
        <div class="ios-icon story">📰</div>
        <span>Story-Lesen</span>
      </div>
    </div>

    <section class="dashboard-grammar-strip">
      <h2 class="section-title">Nyelvtani segédletek</h2>

      <section
        v-for="group in grammarGuideGroups"
        :key="group.level"
        class="dashboard-grammar-level"
      >
        <div class="dashboard-grammar-level-head">
          <span>{{ group.level }}</span>
          <small>{{ group.description }}</small>
        </div>

        <div class="dashboard-grammar-grid">
          <article
            v-for="guide in group.guides"
            :key="guide.id"
            class="dashboard-grammar-card"
            @click="$emit('set-mode', guide.mode)"
          >
            <div class="grammar-card-icon">{{ guide.icon }}</div>

            <div>
              <span>{{ guide.level }}</span>
              <strong>{{ guide.title }}</strong>
              <p>{{ guide.subtitle }}</p>

              <button
                v-if="guide.practice?.available"
                class="grammar-practice-chip is-available"
                @click.stop="$emit('set-mode', guide.practice.mode)"
              >
                {{ guide.practice.label }}
              </button>

              <small
                v-else
                class="grammar-practice-chip is-planned"
              >
                {{ guide.practice?.label || "Csak segédlet" }}
              </small>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="dashboard-story-strip">
      <div class="dashboard-story-heading">
        <h2 class="section-title">Legújabb storyk</h2>

        <button @click="$emit('set-mode', 'story-reading')">
          Összes story
        </button>
      </div>

      <div class="dashboard-story-grid">
        <article
          v-for="story in latestStoryLessons"
          :key="story.id"
          class="dashboard-story-card"
          @click="$emit('open-story', story.id)"
        >
          <div>
            <span>{{ story.level }}</span>
            <small>{{ story.sourceLabel }}</small>
          </div>

          <strong>{{ story.title }}</strong>
          <p>{{ story.subtitle }}</p>
        </article>
      </div>
    </section>

  </section>
</template>

<script>
import { formatDate, getTaskName } from "../../utils/formatters";
import { storyLessons } from "../../data/storyLessons";
import { grammarGuides } from "../../data/grammarGuides";

export default {
  name: "StudentDashboard",

  props: {
    userSession: {
      type: Object,
      required: true,
    },

    isGuestMode: {
      type: Boolean,
      default: false,
    },

    authFullName: {
      type: String,
      default: "",
    },

    xpProfile: {
      type: Object,
      default: () => ({
        xp: 0,
        level: 1,
        today_xp: 0,
        coins: 0,
      }),
    },

    activityStats: {
      type: Object,
      default: () => ({
        streak: 0,
        today: 0,
        activeDays: 0,
        last30Days: 0,
      }),
    },

    activityCalendar: {
      type: Array,
      default: () => [],
    },

    recentExercises: {
      type: Array,
      default: () => [],
    },

    userFiles: {
      type: Array,
      default: () => [],
    },

    isUploading: {
      type: Boolean,
      default: false,
    },

    newNoteText: {
      type: String,
      default: "",
    },

    savedNotes: {
      type: Array,
      default: () => [],
    },

    last30ChartPoints: {
      type: String,
      default: "",
    },

    last30AveragePercent: {
      type: Number,
      default: 0,
    },

    last30CorrectAnswers: {
      type: Number,
      default: 0,
    },

    last30WrongAnswers: {
      type: Number,
      default: 0,
    },

    recommendedPractice: {
      type: Object,
      default: () => ({
        type: "adjektiv",
        label: "Adjektivdeklination",
        reason: "Sok döntési pont, jól automatizálható gyakorlással",
      }),
    },

    weakTopics: {
      type: Array,
      default: () => [],
    },

    last30Trend: {
      type: Object,
      default: () => ({
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      }),
    },
  },

  emits: [
    "set-mode",
    "open-story",
    "upload-file",
    "update:new-note-text",
    "save-note",
    "delete-note",
    "select-note",
  ],

  computed: {
    recommendedPracticeMeta() {
      const practiceMap = {
        perfekt: {
          mode: "perfekt",
          label: "Perfekt",
          icon: "🚀",
        },
        "nomen-verb": {
          mode: "nomen-verb",
          label: "Nomen-Verb",
          icon: "📚",
        },
        adjektiv: {
          mode: "adjektiv",
          label: "Adjektivdeklination",
          icon: "🎨",
        },
        osd: {
          mode: "osd",
          label: "ÖSD",
          icon: "🇦🇹",
        },
        praeposition: {
          mode: "praeposition",
          label: "Präpositionen",
          icon: "🔗",
        },
        konnektoren: {
          mode: "konnektoren",
          label: "Konnektoren",
          icon: "🔀",
        },
        "sich-verben": {
          mode: "sich-verben",
          label: "Sich-Verben",
          icon: "🪞",
        },
        passiv: {
          mode: "passiv",
          label: "Passiv",
          icon: "🛠️",
        },
        "passiv-writing": {
          mode: "passiv",
          label: "Passiv átalakítás",
          icon: "🛠️",
        },
        pronominaladverb: {
          mode: "pronominaladverb",
          label: "Pronominaladverbien",
          icon: "🔎",
        },
        "pronominaladverb-writing": {
          mode: "pronominaladverb",
          label: "Pronominaladv. gépelős",
          icon: "🔎",
        },
        vocabulary: {
          mode: "vocabulary",
          label: "Szókincs edző",
          icon: "🃏",
        },
        "vocabulary-learn": {
          mode: "vocabulary",
          label: "Szókártyák",
          icon: "🃏",
        },
        "vocabulary-test": {
          mode: "vocabulary",
          label: "Szókincs teszt",
          icon: "✍️",
        },
        "daily-challenge": {
          mode: "daily-challenge",
          label: "Napi challenge",
          icon: "🗞️",
        },
        "story-reading": {
          mode: "story-reading",
          label: "Story-Lesen",
          icon: "📰",
        },
      };

      const type = this.recommendedPractice?.type || "adjektiv";
      const fallback = practiceMap.adjektiv;
      const practice = practiceMap[type] || fallback;

      return {
        ...practice,
        label: this.recommendedPractice?.label || practice.label,
        reason:
          this.recommendedPractice?.reason ||
          "Sok döntési pont, jól automatizálható gyakorlással",
      };
    },

    dailyChallengeMeta() {
      const type = this.recommendedPractice?.type || "";

      if (type.includes("adjektiv")) {
        return {
          mode: "daily-challenge-adjektiv",
          label: "Adjektiv challenge",
          description: "Szövegből induló melléknévragozás.",
        };
      }

      if (type.includes("passiv")) {
        return {
          mode: "daily-challenge",
          label: "Passiv challenge",
          description: "Hírszöveg, felismerés és átalakítás.",
        };
      }

      return {
        mode: "daily-challenge-konjunktiv-ii",
        label: "Konjunktiv II challenge",
        description: "Kívánságok, feltételek és múlt idejű alakok.",
      };
    },

    dailyPlanSteps() {
      return [
        {
          number: "01",
          kicker: "Gyenge pont",
          label: this.recommendedPracticeMeta.label,
          description: "A legjobb következő gyakorlás a legutóbbi eredményeid alapján.",
          mode: this.recommendedPracticeMeta.mode,
        },
        {
          number: "02",
          kicker: "Challenge",
          label: this.dailyChallengeMeta.label,
          description: this.dailyChallengeMeta.description,
          mode: this.dailyChallengeMeta.mode,
        },
        {
          number: "03",
          kicker: "Levezetés",
          label: "Szókincs edző",
          description: "Rövid ismétlés, hogy a nap végén szóanyag is épüljön.",
          mode: "vocabulary",
        },
      ];
    },

    latestStoryLessons() {
      return storyLessons.slice(-3).reverse();
    },

    grammarGuideGroups() {
      const levelMeta = {
        A1: {
          order: 1,
          description: "Alapok",
        },
        A2: {
          order: 2,
          description: "Könnyebb alapozó anyagok",
        },
        "A2/B1": {
          order: 3,
          description: "Átmenet az alapoktól a középszintig",
        },
        B1: {
          order: 4,
          description: "Középszintű nyelvtan",
        },
        "B1/B2": {
          order: 5,
          description: "Haladóbb, vizsgaszintű témák",
        },
        B2: {
          order: 6,
          description: "Nehezebb, választékosabb szerkezetek",
        },
        C1: {
          order: 7,
          description: "Felsőfokú anyagok",
        },
      };

      const groups = grammarGuides.reduce((accumulator, guide) => {
        const level = guide.level || "Egyéb";

        if (!accumulator.has(level)) {
          accumulator.set(level, {
            level,
            description: levelMeta[level]?.description || "További nyelvtani témák",
            order: levelMeta[level]?.order || 99,
            guides: [],
          });
        }

        accumulator.get(level).guides.push(guide);
        return accumulator;
      }, new Map());

      return [...groups.values()].sort((a, b) => a.order - b.order);
    },

    last30ChartPath() {
      const points = this.last30ChartPoints
        .split(" ")
        .filter(Boolean)
        .map((point) => {
          const [x, y] = point.split(",").map(Number);

          return { x, y };
        })
        .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

      if (!points.length) return "";

      if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
      }

      const commands = [`M ${points[0].x} ${points[0].y}`];

      points.slice(0, -1).forEach((point, index) => {
        const next = points[index + 1];
        const previous = points[index - 1] || point;
        const following = points[index + 2] || next;

        const controlOne = {
          x: point.x + (next.x - previous.x) / 10,
          y: point.y + (next.y - previous.y) / 10,
        };

        const controlTwo = {
          x: next.x - (following.x - point.x) / 10,
          y: next.y - (following.y - point.y) / 10,
        };

        controlOne.y = Math.min(Math.max(controlOne.y, 0), 100);
        controlTwo.y = Math.min(Math.max(controlTwo.y, 0), 100);

        commands.push(
          `C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${next.x} ${next.y}`,
        );
      });

      return commands.join(" ");
    },
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput?.click();
    },

    formatDate,
    getTaskName,
  },
};
</script>
