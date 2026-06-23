<template>
  <LessonRoom
    v-if="selectedLesson"
    role-label="Tanulói óra"
    :lesson="selectedLesson"
    :participant-label="studentName"
    :date-label="formatDate(selectedLesson.scheduled_at)"
    :status-label="getLessonStatusLabel(selectedLesson.status)"
    :model-value="lessonWorkbookDraft.sharedNotes"
    :is-saving="isSavingLessonWorkbook"
    realtime-author-role="student"
    @update:model-value="handleLessonWorkbookUpdate"
    @close="closeSelectedLesson"
    @save="saveSelectedLessonWorkbook"
    @video-started="syncLessonVideoStarted"
  />

  <section v-else :class="lessonsUi.shell">
    <div :class="lessonsUi.header">
      <span :class="lessonsUi.headerKicker">Online órák</span>
      <h2 :class="lessonsUi.headerTitle">Óráim</h2>
      <p :class="lessonsUi.headerCopy">
        Következő óra, korábbi alkalmak és közös órai jegyzetek egy helyen.
      </p>
    </div>

    <section :class="lessonsUi.nextCard">
      <div :class="lessonsUi.nextCopy">
        <span :class="lessonsUi.cardKicker">Következő óra</span>
        <h3 :class="lessonsUi.nextTitle">
          {{ upcomingLesson?.topic || "Nincs ütemezett következő óra" }}
        </h3>
        <p :class="lessonsUi.nextMeta">
          {{
            upcomingLesson
              ? `${formatDate(upcomingLesson.scheduled_at)} · ${getLessonStatusLabel(upcomingLesson.status)}`
              : "Amint a tanárod ütemez egy órát, itt fog megjelenni."
          }}
        </p>
      </div>

      <button
        type="button"
        :class="lessonsUi.primaryAction"
        :disabled="!upcomingLesson"
        @click="selectLessonSession(upcomingLesson)"
      >
        Csatlakozás
      </button>
    </section>

    <section :class="lessonsUi.panel">
      <div :class="lessonsUi.panelHead">
        <div :class="lessonsUi.panelHeadText">
          <span :class="lessonsUi.cardKicker">Óraarchívum</span>
          <h2 :class="lessonsUi.panelTitle">Korábbi és ütemezett órák</h2>
        </div>

        <button
          type="button"
          :class="lessonsUi.refreshButton"
          @click="loadLessonSessions"
          :disabled="isLoadingLessonSessions"
        >
          {{ isLoadingLessonSessions ? "Frissítés..." : "Frissítés" }}
        </button>
      </div>

      <div
        v-if="lessonSessionSetupError"
        :class="[
          lessonsUi.empty,
          lessonsUi.emptyWarning,
        ]"
      >
        Az órák táblája még nincs beállítva.
      </div>

      <div v-else-if="isLoadingLessonSessions" :class="lessonsUi.empty">
        Órák betöltése...
      </div>

      <div v-else-if="!lessonSessions.length" :class="lessonsUi.empty">
        Még nincs online órád.
      </div>

      <div v-else :class="lessonsUi.lessonList">
        <button
          v-for="lesson in orderedLessonSessions"
          :key="lesson.id"
          type="button"
          :class="lessonsUi.lessonItem"
          @click="selectLessonSession(lesson)"
        >
          <div class="min-w-0">
            <strong :class="lessonsUi.lessonItemTitle">
              {{ lesson.topic || "Online óra" }}
            </strong>
            <span :class="lessonsUi.lessonItemMeta">
              {{ formatDate(lesson.scheduled_at) }}
            </span>
          </div>

          <small :class="lessonsUi.lessonItemStatus">
            {{ getLessonStatusLabel(lesson.status) }}
          </small>
        </button>
      </div>
    </section>
  </section>
</template>

<script>
import LessonRoom from "../lesson/LessonRoom.vue";
import {
  fetchLessonSession,
  fetchStudentLessonSessions,
  updateLessonWorkbook,
} from "../../services/lessonSessionService";
import { formatDate } from "../../utils/formatters";

const LESSONS_UI = {
  shell:
    "student-materials-view student-lessons-view nemet-page-shell nemet-page-shell--compact",
  header: "mb-6 text-left",
  headerKicker:
    "inline-flex items-center rounded-full bg-[#ffd56a]/16 px-3 py-2 text-xs font-black leading-none text-[#ffdc7a]",
  headerTitle:
    "mt-3 text-4xl font-black leading-tight text-white sm:text-5xl",
  headerCopy:
    "max-w-3xl text-base font-semibold leading-relaxed text-white/60",
  nextCard:
    "mb-5 flex flex-col gap-4 rounded-[26px] border border-[#80caff]/18 bg-[linear-gradient(135deg,rgba(79,172,254,0.16),rgba(255,255,255,0)_46%),rgba(255,255,255,0.055)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:flex-row md:items-center md:justify-between",
  nextCopy: "min-w-0",
  cardKicker:
    "inline-flex text-xs font-black uppercase tracking-[0.02em] text-[#80caff]",
  nextTitle:
    "mt-2 text-2xl font-black leading-tight text-white sm:text-[2.1rem]",
  nextMeta: "mt-2 text-sm font-semibold leading-relaxed text-white/64",
  primaryAction:
    "inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-[#4faccf]/18 px-5 text-sm font-black text-[#80caff] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40",
  panel:
    "rounded-[24px] border border-[#ffd56a]/25 bg-white/[0.055] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:p-6",
  panelHead:
    "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  panelHeadText: "min-w-0",
  panelTitle: "mt-2 text-3xl font-black leading-tight text-white sm:text-[2rem]",
  refreshButton:
    "inline-flex h-10 w-fit items-center rounded-full border border-white/12 bg-white/10 px-4 text-sm font-black text-white/80 transition hover:bg-white/15",
  empty:
    "rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-black leading-relaxed text-white/65",
  emptyWarning: "text-[#ffdc7a]",
  lessonList: "grid gap-2.5",
  lessonItem:
    "flex w-full items-center justify-between gap-3 rounded-[18px] border border-white/12 bg-black/20 px-4 py-3.5 text-left text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80caff]/35 hover:border-[#80caff]/34 hover:bg-[#4faccf]/13",
  lessonItemTitle:
    "block min-w-0 text-base font-black leading-snug text-white truncate",
  lessonItemMeta:
    "mt-1 block text-sm font-bold leading-relaxed text-white/64 truncate",
  lessonItemStatus:
    "shrink-0 text-xs font-black uppercase tracking-[0.02em] text-[#80caff]",
};

export default {
  name: "StudentLessonsView",

  components: {
    LessonRoom,
  },

  props: {
    userSession: {
      type: Object,
      default: null,
    },

    authFullName: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      lessonsUi: LESSONS_UI,
      lessonSessions: [],
      selectedLessonId: "",
      selectedLessonSnapshot: null,
      lessonWorkbookDraft: {
        sharedNotes: "",
      },
      isLoadingLessonSessions: false,
      isSavingLessonWorkbook: false,
      lessonSessionSetupError: false,
    };
  },

  computed: {
    studentName() {
      return this.authFullName || this.userSession?.email || "Diák";
    },

    selectedLesson() {
      if (!this.selectedLessonId) {
        return null;
      }

      return this.lessonSessions.find((lesson) => lesson.id === this.selectedLessonId)
        || this.selectedLessonSnapshot
        || null;
    },

    upcomingLesson() {
      const now = new Date();

      return this.lessonSessions
        .filter((lesson) => {
          return lesson.status !== "completed" && new Date(lesson.scheduled_at) >= now;
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0] || null;
    },

    orderedLessonSessions() {
      return this.lessonSessions
        .slice()
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    },
  },

  mounted() {
    this.loadLessonSessions();
  },

  methods: {
    formatDate,

    async loadLessonSessions() {
      if (!this.userSession?.id) {
        this.lessonSessions = [];
        return;
      }

      this.isLoadingLessonSessions = true;
      this.lessonSessionSetupError = false;

      try {
        this.lessonSessions = await fetchStudentLessonSessions(this.userSession.id);
        const selectedLessonStillExists = this.lessonSessions.find((lesson) => {
          return lesson.id === this.selectedLessonId;
        });

        if (selectedLessonStillExists) {
          this.selectedLessonSnapshot = { ...selectedLessonStillExists };
          this.syncLessonWorkbookDraft(selectedLessonStillExists);
        } else if (!this.selectedLessonId) {
          this.closeSelectedLesson();
        }
      } catch (error) {
        console.error("Diák órák lekérési hiba:", error.message);
        this.lessonSessions = [];
        this.lessonSessionSetupError = error.message?.includes("lesson_sessions");
      } finally {
        this.isLoadingLessonSessions = false;
      }
    },

    async selectLessonSession(lesson) {
      if (!lesson?.id) return;

      this.selectedLessonId = lesson.id;
      this.selectedLessonSnapshot = { ...lesson };
      this.syncLessonWorkbookDraft(lesson);

      try {
        const updated = await fetchLessonSession(lesson.id);

        if (!updated) {
          return;
        }

        this.lessonSessions = this.lessonSessions.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        this.selectedLessonSnapshot = { ...updated };
        this.syncLessonWorkbookDraft(updated);
      } catch (error) {
        console.error("Óra frissítési hiba:", error.message);
      }
    },

    closeSelectedLesson() {
      this.selectedLessonId = "";
      this.selectedLessonSnapshot = null;
      this.syncLessonWorkbookDraft(null);
    },

    goBackOneStep() {
      if (!this.selectedLessonId) {
        return false;
      }

      this.closeSelectedLesson();
      return true;
    },

    syncLessonWorkbookDraft(lesson) {
      this.lessonWorkbookDraft = {
        sharedNotes: lesson?.shared_notes || "",
      };
    },

    handleLessonWorkbookUpdate(sharedNotes) {
      this.lessonWorkbookDraft.sharedNotes = sharedNotes;

      if (this.selectedLessonSnapshot) {
        this.selectedLessonSnapshot = {
          ...this.selectedLessonSnapshot,
          shared_notes: sharedNotes,
        };
      }
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

      this.selectedLessonSnapshot = {
        ...this.selectedLesson,
        video_started_at: videoStartedAt || new Date().toISOString(),
      };
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
        this.selectedLessonSnapshot = { ...updated };
      } catch (error) {
        console.error("Diák órai jegyzet mentési hiba:", error.message);
        alert("Nem sikerült menteni az órai jegyzetet.");
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

      return labels[status] || "Ütemezve";
    },
  },
};
</script>
