<template>
  <LessonRoom
    v-if="selectedLesson"
    role-label="Tanulói óra"
    :lesson="selectedLesson"
    :participant-label="authFullName || 'Diák'"
    :date-label="formatDate(selectedLesson.scheduled_at)"
    :status-label="getLessonStatusLabel(selectedLesson.status)"
    :model-value="lessonWorkbookDraft.sharedNotes"
    :is-saving="isSavingLessonWorkbook"
    realtime-author-role="student"
    @update:model-value="lessonWorkbookDraft.sharedNotes = $event"
    @close="closeSelectedLesson"
    @save="saveSelectedLessonWorkbook"
    @video-started="syncLessonVideoStarted"
  />

  <section v-else class="dashboard-layout">
    <section class="student-home-hero">
      <div class="student-home-main">
        <div class="student-home-person">
          <img
            :src="
              userSession?.user_metadata?.avatar_url ||
              'https://ui-avatars.com/api/?name=' + authFullName
            "
            class="dashboard-avatar student-home-avatar"
          />

          <div>
            <h1>Üdv, {{ authFullName || "Diák" }}!</h1>
          </div>
        </div>

        <div v-if="!isGuestMode" class="dashboard-profile-xp student-home-stats">
          <div class="profile-level-pill streak">🔥 {{ activityStats.streak }} nap</div>
          <div class="profile-level-pill">⭐ {{ xpProfile.xp }} XP</div>
          <div class="profile-level-pill blue">Level {{ xpProfile.level }}</div>
        </div>

        <p>
          {{
            isGuestMode
              ? "Vendégként kipróbálhatod a feladatokat. Profil, statisztika és mentés nem készül."
              : "Először nézd meg, van-e teendőd, aztán indítsd a mai ajánlott edzést."
          }}
        </p>

        <div class="student-home-recommendation">
          <div class="student-home-recommendation-icon">
            {{ recommendedPracticeMeta.icon }}
          </div>

          <div>
            <span>Ma ezt ajánlom</span>
            <strong>{{ recommendedPracticeMeta.label }}</strong>
            <small>{{ recommendedPracticeMeta.reason }}</small>
          </div>

          <button
            class="daily-plan-primary"
            @click="$emit('set-mode', recommendedPracticeMeta.mode)"
          >
            Indítás
          </button>
        </div>
      </div>

      <aside class="student-home-status">
        <button
          v-if="!isGuestMode"
          class="student-status-card"
          type="button"
          @click="$emit('set-mode', 'student-lessons')"
        >
          <span>Online óra</span>
          <strong>{{ upcomingLessonTitle }}</strong>
          <small>{{ upcomingLessonMeta }}</small>
        </button>

        <button
          v-if="!isGuestMode"
          class="student-status-card"
          type="button"
          @click="$emit('set-mode', 'student-materials')"
        >
          <span>Házi és anyagok</span>
          <strong>{{ activeHomeworkCount }} teendő</strong>
          <small>{{ reviewedHomeworkCount }} javított anyag</small>
        </button>

        <article class="student-status-card">
          <span>Haladás</span>
          <strong>{{ last30AveragePercent }}% átlag</strong>
          <small>{{ weakTopicSummary }}</small>
        </article>
      </aside>
    </section>

    <section class="student-route-section">
      <div class="student-route-head">
        <span>Útvonalválasztó</span>
        <h2>Mivel szeretnél haladni?</h2>
      </div>

      <div class="student-route-grid">
        <button
          class="student-route-card is-primary"
          type="button"
          @click="$emit('set-mode', recommendedPracticeMeta.mode)"
        >
          <span>{{ recommendedPracticeMeta.icon }}</span>
          <strong>Mai edzés</strong>
          <small>Ajánlott útvonal az eredményeid alapján.</small>
        </button>

        <button
          v-if="!isGuestMode"
          class="student-route-card"
          type="button"
          @click="$emit('set-mode', 'student-materials')"
        >
          <span>📥</span>
          <strong>Házi feladat</strong>
          <small>{{ activeHomeworkCount }} aktív teendő, {{ submittedHomeworkCount }} leadva.</small>
        </button>

        <button
          v-if="!isGuestMode"
          class="student-route-card"
          type="button"
          @click="$emit('set-mode', 'student-lessons')"
        >
          <span>🗓️</span>
          <strong>Online óra</strong>
          <small>Következő óra és közös munkafüzet.</small>
        </button>

        <button
          class="student-route-card"
          type="button"
          @click="$emit('set-mode', 'learning-library')"
        >
          <span>🧭</span>
          <strong>Szabad tanulás</strong>
          <small>Gyakorlók, challenge-ek, szókincs és storyk.</small>
        </button>
      </div>
    </section>

    <section
      v-if="!isGuestMode"
      ref="lessonPanel"
      class="student-lesson-panel is-compact"
    >
      <div class="student-lesson-head">
        <div>
          <span>Online óra</span>
          <h2>Legutóbbi órai munkafüzetek</h2>
        </div>

        <button
          @click="$emit('set-mode', 'student-lessons')"
        >
          Összes munkafüzet
        </button>
      </div>

      <div v-if="lessonSessionSetupError" class="student-submissions-empty warning">
        Az órák táblája még nincs beállítva.
      </div>

      <div v-else-if="isLoadingLessonSessions" class="student-submissions-empty">
        Órák betöltése...
      </div>

      <div v-else-if="!recentLessonSessions.length" class="student-submissions-empty">
        Még nincs órai munkafüzeted.
      </div>

      <div v-else class="student-lesson-layout">
        <aside class="student-lesson-list">
          <button
            v-for="lesson in recentLessonSessions"
            :key="lesson.id"
            class="student-lesson-item"
            :class="{ active: selectedLesson?.id === lesson.id }"
            @click="selectLessonSession(lesson)"
          >
            <strong>{{ lesson.topic || "Online óra" }}</strong>
            <span>{{ formatDate(lesson.scheduled_at) }}</span>
            <small>{{ getLessonStatusLabel(lesson.status) }}</small>
          </button>
        </aside>

        <article v-if="selectedLesson" class="student-lesson-workbook">
          <div class="student-lesson-summary">
            <div>
              <span>{{ getLessonStatusLabel(selectedLesson.status) }}</span>
              <h3>{{ selectedLesson.topic || "Online óra" }}</h3>
              <p>{{ formatDate(selectedLesson.scheduled_at) }}</p>
            </div>

            <div class="student-lesson-summary-actions">
              <a
                v-if="selectedLesson.meet_url"
                :href="selectedLesson.meet_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meet megnyitása
              </a>

              <button
                type="button"
                class="student-lesson-close"
                @click="closeSelectedLesson"
              >
                Bezárás
              </button>
            </div>
          </div>

          <p v-if="selectedLesson.goal" class="student-lesson-goal">
            {{ selectedLesson.goal }}
          </p>

          <label>
            Közös órai jegyzet
            <textarea
              v-model="lessonWorkbookDraft.sharedNotes"
              placeholder="Ide írhat a tanár és a diák is..."
            ></textarea>
          </label>

          <button
            class="student-lesson-save"
            @click="saveSelectedLessonWorkbook"
            :disabled="isSavingLessonWorkbook"
          >
            {{ isSavingLessonWorkbook ? "Mentés..." : "Jegyzet mentése" }}
          </button>
        </article>

        <article v-else class="student-lesson-workbook student-lesson-workbook-empty">
          <strong>Válassz órát a közös jegyzet megnyitásához.</strong>
          <p>A dashboardon csak a két legutóbbi munkafüzet látszik. A teljes lista az Óráim menüpontban van.</p>
        </article>
      </div>
    </section>

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

  </section>
</template>

<script>
import { formatDate, getTaskName } from "../../utils/formatters";
import {
  fetchLessonSession,
  fetchStudentLessonSessions,
  updateLessonWorkbook,
} from "../../services/lessonSessionService";
import { fetchStudentHomeworkAssignments } from "../../services/homeworkService";
import LessonRoom from "../lesson/LessonRoom.vue";

export default {
  name: "StudentDashboard",

  components: {
    LessonRoom,
  },

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

  data() {
    return {
      lessonSessions: [],
      selectedLessonId: "",
      isLoadingLessonSessions: false,
      isSavingLessonWorkbook: false,
      lessonSessionSetupError: false,
      homeworkAssignments: [],
      isLoadingHomeworkSummary: false,
      lessonWorkbookDraft: {
        sharedNotes: "",
      },
    };
  },

  async mounted() {
    await Promise.all([
      this.loadLessonSessions(),
      this.loadHomeworkSummary(),
    ]);
  },

  watch: {
    async userSession() {
      await Promise.all([
        this.loadLessonSessions(),
        this.loadHomeworkSummary(),
      ]);
    },

    selectedLesson(lesson) {
      this.syncLessonWorkbookDraft(lesson);
    },
  },

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
        "zu-infinitiv": {
          mode: "zu-infinitiv",
          label: "Zu + Infinitiv",
          icon: "✍️",
        },
        plusquamperfekt: {
          mode: "plusquamperfekt",
          label: "Plusquamperfekt",
          icon: "⏳",
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

    upcomingLesson() {
      const now = new Date();
      const upcoming = this.lessonSessions
        .filter((lesson) => {
          return lesson.status === "scheduled" && new Date(lesson.scheduled_at) >= now;
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

      return upcoming[0] || null;
    },

    selectedLesson() {
      if (!this.lessonSessions.length || !this.selectedLessonId) {
        return null;
      }

      return this.lessonSessions.find((lesson) => lesson.id === this.selectedLessonId)
        || null;
    },

    recentLessonSessions() {
      return this.lessonSessions.slice(0, 2);
    },

    activeHomeworkCount() {
      return this.homeworkAssignments.filter((assignment) => {
        return ["assigned", "opened"].includes(assignment.status);
      }).length;
    },

    submittedHomeworkCount() {
      return this.homeworkAssignments.filter((assignment) => {
        return assignment.status === "submitted";
      }).length;
    },

    reviewedHomeworkCount() {
      return this.homeworkAssignments.filter((assignment) => {
        return assignment.status === "reviewed";
      }).length;
    },

    upcomingLessonTitle() {
      return this.upcomingLesson?.topic || "Nincs közelgő óra";
    },

    upcomingLessonMeta() {
      if (!this.upcomingLesson) {
        return "A munkafüzet akkor jelenik meg, ha a tanár órát ütemez.";
      }

      return this.formatDate(this.upcomingLesson.scheduled_at);
    },

    weakTopicSummary() {
      const topic = this.weakTopics?.[0];

      if (topic) {
        return `Gyenge pont: ${topic.label} (${topic.accuracy}%).`;
      }

      return this.last30Trend?.label || "Oldj meg pár feladatot a pontosabb képhez.";
    },
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput?.click();
    },

    async loadLessonSessions() {
      if (this.isGuestMode || !this.userSession?.id) {
        this.lessonSessions = [];
        this.closeSelectedLesson();
        return;
      }

      this.isLoadingLessonSessions = true;
      this.lessonSessionSetupError = false;

      try {
        this.lessonSessions = await fetchStudentLessonSessions(this.userSession.id);
        const selectedLessonStillExists = this.recentLessonSessions.find((lesson) => {
          return lesson.id === this.selectedLessonId;
        });

        if (selectedLessonStillExists) {
          this.syncLessonWorkbookDraft(selectedLessonStillExists);
        } else {
          this.closeSelectedLesson();
        }
      } catch (error) {
        console.error("Diák órák lekérési hiba:", error.message);
        this.lessonSessionSetupError = error.message?.includes("lesson_sessions");
      } finally {
        this.isLoadingLessonSessions = false;
      }
    },

    async loadHomeworkSummary() {
      if (this.isGuestMode || !this.userSession?.id) {
        this.homeworkAssignments = [];
        return;
      }

      this.isLoadingHomeworkSummary = true;

      try {
        this.homeworkAssignments = await fetchStudentHomeworkAssignments(
          this.userSession.id,
        );
      } catch (error) {
        console.error("Diák házi összegzés lekérési hiba:", error.message);
        this.homeworkAssignments = [];
      } finally {
        this.isLoadingHomeworkSummary = false;
      }
    },

    async selectLessonSession(lesson) {
      if (this.selectedLessonId === lesson.id) {
        this.closeSelectedLesson();
        return;
      }

      this.selectedLessonId = lesson.id;
      this.syncLessonWorkbookDraft(lesson);

      try {
        const updated = await fetchLessonSession(lesson.id);

        if (!updated) {
          return;
        }

        this.lessonSessions = this.lessonSessions.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        this.syncLessonWorkbookDraft(updated);
      } catch (error) {
        console.error("Óra frissítési hiba:", error.message);
      }
    },

    closeSelectedLesson() {
      this.selectedLessonId = "";
      this.syncLessonWorkbookDraft(null);
    },

    openLessonRoute() {
      if (this.upcomingLesson && this.selectedLessonId !== this.upcomingLesson.id) {
        this.selectedLessonId = this.upcomingLesson.id;
        this.syncLessonWorkbookDraft(this.upcomingLesson);
      }

      this.$nextTick(() => {
        this.$refs.lessonPanel?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },

    syncLessonWorkbookDraft(lesson) {
      this.lessonWorkbookDraft = {
        sharedNotes: lesson?.shared_notes || "",
      };
    },

    syncLessonVideoStarted(videoStartedAt) {
      if (!this.selectedLesson?.id) {
        return;
      }

      this.lessonSessions = this.lessonSessions.map((lesson) =>
        lesson.id === this.selectedLesson.id
          ? { ...lesson, video_started_at: videoStartedAt || new Date().toISOString() }
          : lesson,
      );
    },

    async saveSelectedLessonWorkbook() {
      if (!this.selectedLesson?.id || this.isSavingLessonWorkbook) {
        return;
      }

      this.isSavingLessonWorkbook = true;

      try {
        const updated = await updateLessonWorkbook(
          this.selectedLesson.id,
          this.lessonWorkbookDraft,
        );

        this.lessonSessions = this.lessonSessions.map((lesson) =>
          lesson.id === updated.id ? { ...lesson, ...updated } : lesson,
        );
      } catch (error) {
        console.error("Diák munkafüzet mentési hiba:", error.message);
        alert("Nem sikerült menteni a munkafüzetet.");
      } finally {
        this.isSavingLessonWorkbook = false;
      }
    },

    getLessonStatusLabel(status) {
      const labels = {
        scheduled: "Ütemezve",
        completed: "Lezárva",
        cancelled: "Lemondva",
      };

      return labels[status] || "Óra";
    },

    formatDate,
    getTaskName,
  },
};
</script>
