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
    @update:model-value="lessonWorkbookDraft.sharedNotes = $event"
    @close="closeSelectedLesson"
    @save="saveSelectedLessonWorkbook"
    @video-started="syncLessonVideoStarted"
  />

  <section v-else class="student-materials-view student-lessons-view">
    <div class="student-materials-header">
      <span>Online órák</span>
      <h2>Óráim</h2>
      <p>Következő óra, korábbi alkalmak és közös órai jegyzetek egy helyen.</p>
    </div>

    <section class="student-lessons-next">
      <div class="student-lessons-next-copy">
        <span>Következő óra</span>
        <h3>{{ upcomingLesson?.topic || "Nincs ütemezett következő óra" }}</h3>
        <p>
          {{
            upcomingLesson
              ? `${formatDate(upcomingLesson.scheduled_at)} · ${getLessonStatusLabel(upcomingLesson.status)}`
              : "Amint a tanárod ütemez egy órát, itt fog megjelenni."
          }}
        </p>
      </div>

      <button
        type="button"
        :disabled="!upcomingLesson"
        @click="selectLessonSession(upcomingLesson)"
      >
        Csatlakozás
      </button>
    </section>

    <section class="student-homework-panel student-lessons-panel">
      <div class="student-lesson-head">
        <div>
          <span>Óraarchívum</span>
          <h2>Korábbi és ütemezett órák</h2>
        </div>

        <button
          type="button"
          @click="loadLessonSessions"
          :disabled="isLoadingLessonSessions"
        >
          {{ isLoadingLessonSessions ? "Frissítés..." : "Frissítés" }}
        </button>
      </div>

      <div v-if="lessonSessionSetupError" class="student-materials-empty warning">
        Az órák táblája még nincs beállítva.
      </div>

      <div v-else-if="isLoadingLessonSessions" class="student-materials-empty">
        Órák betöltése...
      </div>

      <div v-else-if="!lessonSessions.length" class="student-materials-empty">
        Még nincs online órád.
      </div>

      <div v-else class="student-lessons-list">
        <button
          v-for="lesson in orderedLessonSessions"
          :key="lesson.id"
          type="button"
          class="student-lessons-item"
          @click="selectLessonSession(lesson)"
        >
          <div>
            <strong>{{ lesson.topic || "Online óra" }}</strong>
            <span>{{ formatDate(lesson.scheduled_at) }}</span>
          </div>

          <small>{{ getLessonStatusLabel(lesson.status) }}</small>
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
      lessonSessions: [],
      selectedLessonId: "",
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
      if (!this.lessonSessions.length || !this.selectedLessonId) {
        return null;
      }

      return this.lessonSessions.find((lesson) => lesson.id === this.selectedLessonId)
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
          this.syncLessonWorkbookDraft(selectedLessonStillExists);
        } else {
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
