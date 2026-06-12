<template>
  <LessonRoom
    v-if="selectedLesson"
    role-label="Tanulói óra"
    :lesson="selectedLesson"
    participant-label="Diák"
    :date-label="formatDate(selectedLesson.scheduled_at)"
    :status-label="getLessonStatusLabel(selectedLesson.status)"
    :model-value="lessonWorkbookDraft.sharedNotes"
    :is-saving="isSavingLessonWorkbook"
    @update:model-value="lessonWorkbookDraft.sharedNotes = $event"
    @close="closeSelectedLesson"
    @save="saveSelectedLessonWorkbook"
  />

  <section v-else class="student-materials-view">
    <div class="student-materials-header">
      <span>Anyagok</span>
      <h2>Házi feladataim és beküldéseim</h2>
      <p>
        A tanári feladatokat, beküldött írásokat és javítási állapotokat itt
        követheted.
      </p>
    </div>

    <section class="student-homework-panel">
      <h2>Anyagaim</h2>

      <div class="student-homework-tabs">
        <button
          v-for="filter in homeworkFilters"
          :key="filter.key"
          :class="{ active: activeHomeworkFilter === filter.key }"
          @click="activeHomeworkFilter = filter.key"
        >
          {{ filter.label }}
          <span>{{ getHomeworkFilterCount(filter.key) }}</span>
        </button>
      </div>

      <div v-if="isLoadingHomework" class="student-materials-empty">
        Házik betöltése...
      </div>

      <div v-else-if="!materialItems.length" class="student-materials-empty">
        Még nincs kiadott vagy beküldött anyagod.
      </div>

      <div
        v-else-if="!filteredMaterialItems.length"
        class="student-materials-empty"
      >
        {{ emptyHomeworkFilterText }}
      </div>

      <div v-else class="student-materials-unified">
        <aside class="student-materials-list">
          <button
            v-for="item in filteredMaterialItems"
            :key="getMaterialItemKey(item)"
            class="student-materials-item"
            :class="{ active: isSelectedMaterialItem(item) }"
            @click="selectMaterialItem(item)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.statusLabel }}</span>
            <small>{{ item.typeLabel }}</small>
            <small v-if="item.createdAt">{{
              formatDate(item.createdAt)
            }}</small>
          </button>
        </aside>

        <article v-if="selectedMaterialItem" class="student-materials-detail">
          <div class="student-materials-detail-head">
            <span
              v-if="selectedMaterialItem.kind === 'submission'"
              :class="[
                'student-submission-status',
                selectedMaterialItem.raw.status,
              ]"
            >
              {{ selectedMaterialItem.statusLabel }}
            </span>
            <span
              v-else
              :class="[
                'student-submission-status',
                'homework',
                selectedMaterialItem.raw.status,
              ]"
            >
              {{ selectedMaterialItem.statusLabel }}
            </span>

            <h2>{{ selectedMaterialItem.title }}</h2>
            <p v-if="selectedMaterialItem.createdAt">
              {{ formatDate(selectedMaterialItem.createdAt) }}
            </p>
          </div>

          <div class="student-materials-meta">
            <div v-if="selectedMaterialItem.wordCount">
              <span>Szószám</span>
              <strong>{{ selectedMaterialItem.wordCount }} szó</strong>
            </div>

            <div v-if="selectedMaterialItem.expectedWordCount">
              <span>Elvárt</span>
              <strong>{{ selectedMaterialItem.expectedWordCount }} szó</strong>
            </div>

            <div v-if="selectedMaterialItem.targetCount">
              <span>Cél</span>
              <strong>{{ selectedMaterialItem.targetCount }} feladat</strong>
            </div>

            <div v-if="selectedMaterialItem.dueAt">
              <span>Határidő</span>
              <strong>{{ formatDate(selectedMaterialItem.dueAt) }}</strong>
            </div>

            <div>
              <span>Típus</span>
              <strong>{{ selectedMaterialItem.typeLabel }}</strong>
            </div>
          </div>

          <template v-if="selectedMaterialItem.kind === 'homework'">
            <section
              v-if="
                selectedMaterialItem.latestSubmission?.grade ||
                selectedMaterialItem.latestSubmission?.teacher_feedback
              "
              class="student-materials-review"
            >
              <h3>
                {{
                  selectedMaterialItem.raw.status === 'revision_requested'
                    ? 'Újraküldés kérése'
                    : 'Tanári értékelés'
                }}
              </h3>

              <div
                v-if="selectedMaterialItem.latestSubmission.grade"
                class="student-materials-grade"
              >
                <span>Osztályzat / értékelés</span>
                <strong>{{ selectedMaterialItem.latestSubmission.grade }}</strong>
              </div>

              <p v-if="selectedMaterialItem.latestSubmission.teacher_feedback">
                {{ selectedMaterialItem.latestSubmission.teacher_feedback }}
              </p>

              <small v-if="selectedMaterialItem.latestSubmission.reviewed_at">
                Javítva: {{ formatDate(selectedMaterialItem.latestSubmission.reviewed_at) }}
              </small>
            </section>

            <section>
              <h3>Feladat</h3>
              <p>{{ selectedMaterialItem.description }}</p>
            </section>

            <section v-if="selectedMaterialItem.raw.topic">
              <h3>Téma</h3>
              <p>{{ selectedMaterialItem.raw.topic }}</p>
            </section>

            <section
              v-if="
                selectedMaterialItem.raw.type === 'writing' &&
                canStudentWorkOnHomework(selectedMaterialItem.raw.status)
              "
              class="student-homework-workspace"
            >
              <h3>
                {{
                  selectedMaterialItem.raw.status === 'revision_requested'
                    ? 'Újraküldés'
                    : 'Megoldás'
                }}
              </h3>
              <textarea
                v-model="homeworkDrafts[selectedMaterialItem.raw.id]"
                class="student-homework-textarea"
                placeholder="Ide írd a házi fogalmazást vagy levelet..."
              ></textarea>

              <button
                class="student-homework-submit"
                @click="submitHomeworkWriting(selectedMaterialItem.raw)"
                :disabled="
                  isSubmittingHomework ||
                  !homeworkDrafts[selectedMaterialItem.raw.id]?.trim()
                "
              >
                {{ isSubmittingHomework ? "Beküldés..." : "Házi beküldése" }}
              </button>
            </section>

            <button
              v-else-if="
                selectedMaterialItem.raw.type === 'practice' &&
                canStudentWorkOnHomework(selectedMaterialItem.raw.status)
              "
              class="student-homework-submit"
              @click="
                $emit('start-homework-practice', selectedMaterialItem.raw)
              "
            >
              Gyakorlás indítása
            </button>

            <section v-if="selectedMaterialItem.latestSubmission">
              <h3>Legutóbbi beküldés</h3>
              <p class="student-materials-content">
                {{ selectedMaterialItem.latestSubmission.content }}
              </p>
            </section>

            <div
              v-if="!canStudentWorkOnHomework(selectedMaterialItem.raw.status)"
              class="student-homework-done"
            >
              {{
                selectedMaterialItem.raw.status === 'closed'
                  ? 'Ez a házi le van zárva.'
                  : 'Ez az anyag már be van küldve.'
              }}
            </div>
          </template>

          <template v-else>
            <section
              v-if="
                selectedMaterialItem.raw.grade ||
                selectedMaterialItem.raw.teacher_feedback
              "
              class="student-materials-review"
            >
              <h3>Tanári értékelés</h3>

              <div
                v-if="selectedMaterialItem.raw.grade"
                class="student-materials-grade"
              >
                <span>Osztályzat / értékelés</span>
                <strong>{{ selectedMaterialItem.raw.grade }}</strong>
              </div>

              <p v-if="selectedMaterialItem.raw.teacher_feedback">
                {{ selectedMaterialItem.raw.teacher_feedback }}
              </p>

              <small v-if="selectedMaterialItem.raw.reviewed_at">
                Javítva: {{ formatDate(selectedMaterialItem.raw.reviewed_at) }}
              </small>
            </section>

            <section>
              <h3>Levél témája</h3>
              <p>{{ selectedMaterialItem.raw.task_situation }}</p>
            </section>

            <section v-if="selectedMaterialItem.raw.task_points?.length">
              <h3>Feladat pontjai</h3>
              <ul>
                <li
                  v-for="point in selectedMaterialItem.raw.task_points"
                  :key="point"
                >
                  {{ point }}
                </li>
              </ul>
            </section>

            <section>
              <h3>Beküldött szöveg</h3>
              <p class="student-materials-content">
                {{ selectedMaterialItem.raw.content }}
              </p>
            </section>
          </template>
        </article>
      </div>
    </section>

    <section class="student-homework-panel student-workbooks-panel">
      <div class="student-lesson-head">
        <div>
          <span>Órai munkafüzetek</span>
          <h2>Közös órai jegyzetek</h2>
        </div>

        <button
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
        Munkafüzetek betöltése...
      </div>

      <div v-else-if="!lessonSessions.length" class="student-materials-empty">
        Még nincs órai munkafüzeted.
      </div>

      <div v-else class="student-lesson-layout student-materials-lesson-layout">
        <aside class="student-lesson-list">
          <button
            v-for="lesson in lessonSessions"
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
          <strong>Válassz munkafüzetet.</strong>
          <p>Az óra kártyájára kattintva megnyílik a közös órai jegyzet.</p>
        </article>
      </div>
    </section>

    <div v-if="setupError" class="student-materials-empty warning">
      A beküldött írások táblája még nincs beállítva.
    </div>
  </section>
</template>

<script>
import {
  createWritingSubmission,
  fetchStudentWritingSubmissions,
} from "../../services/writingSubmissionService";
import {
  fetchStudentHomeworkAssignments,
  updateHomeworkStatus,
} from "../../services/homeworkService";
import {
  fetchStudentLessonSessions,
  updateLessonWorkbook,
} from "../../services/lessonSessionService";
import {
  HOMEWORK_STATUS,
  canStudentWorkOnHomework,
  getHomeworkFilterStatus,
  getHomeworkStatusLabel,
  getSubmissionStatusLabel,
  shouldMarkHomeworkStarted,
} from "../../utils/homeworkLifecycle";
import { formatDate } from "../../utils/formatters";
import LessonRoom from "../lesson/LessonRoom.vue";

export default {
  name: "StudentMaterialsView",

  components: {
    LessonRoom,
  },

  props: {
    userSession: {
      type: Object,
      default: null,
    },
  },

  emits: ["go-dashboard", "set-mode", "start-homework-practice"],

  data() {
    return {
      submissions: [],
      selectedSubmission: null,
      homeworkAssignments: [],
      homeworkDrafts: {},
      isLoading: false,
      isLoadingHomework: false,
      lessonSessions: [],
      selectedLessonId: "",
      isLoadingLessonSessions: false,
      isSavingLessonWorkbook: false,
      lessonSessionSetupError: false,
      lessonWorkbookDraft: {
        sharedNotes: "",
      },
      isSubmittingHomework: false,
      setupError: false,
      activeHomeworkFilter: "todo",
      selectedMaterialKey: "",
      isMaterialDetailOpen: true,
    };
  },

  async mounted() {
    await Promise.all([
      this.loadSubmissions(),
      this.loadHomeworkAssignments(),
      this.loadLessonSessions(),
    ]);
  },

  watch: {
    async userSession() {
      await Promise.all([
        this.loadSubmissions(),
        this.loadHomeworkAssignments(),
        this.loadLessonSessions(),
      ]);
    },

    selectedLesson(lesson) {
      this.syncLessonWorkbookDraft(lesson);
    },
  },

  computed: {
    homeworkFilters() {
      return [
        { key: "todo", label: "Teendők" },
        { key: "submitted", label: "Leadva" },
        { key: "reviewed", label: "Javítva" },
        { key: "closed", label: "Lezárva" },
        { key: "all", label: "Összes" },
      ];
    },

    submissionsByAssignmentId() {
      return this.submissions.reduce((groups, submission) => {
        if (!submission.assignment_id) return groups;

        if (!groups[submission.assignment_id]) {
          groups[submission.assignment_id] = [];
        }

        groups[submission.assignment_id].push(submission);
        return groups;
      }, {});
    },

    materialItems() {
      const homeworkItems = this.homeworkAssignments
        .map((assignment) => ({
          id: assignment.id,
          kind: "homework",
          raw: assignment,
          latestSubmission: this.getLatestSubmissionForAssignment(assignment.id),
          title: assignment.title,
          status: assignment.status,
          filterStatus: getHomeworkFilterStatus(assignment.status),
          statusLabel: this.getHomeworkStatusLabel(assignment.status),
          typeLabel: this.getHomeworkTypeLabel(assignment),
          description: assignment.instructions,
          dueAt: assignment.due_at,
          expectedWordCount: assignment.expected_word_count,
          targetCount: assignment.target_count,
          wordCount: this.getLatestSubmissionForAssignment(assignment.id)?.word_count,
          createdAt: assignment.created_at,
        }));

      const submissionItems = this.submissions
        .filter((submission) => !submission.assignment_id)
        .map((submission) => ({
          id: submission.id,
          kind: "submission",
          raw: submission,
          title: submission.task_title,
          status: submission.status,
          filterStatus: getHomeworkFilterStatus(submission.status),
          statusLabel: this.getSubmissionStatusLabel(submission.status),
          typeLabel: "Beküldött írás",
          description: submission.task_situation || submission.task_instructions,
          expectedWordCount: submission.expected_word_count,
          wordCount: submission.word_count,
          createdAt: submission.created_at,
        }));

      return [...homeworkItems, ...submissionItems].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    },

    filteredMaterialItems() {
      if (this.activeHomeworkFilter === "all") {
        return this.materialItems;
      }

      return this.materialItems.filter((item) => {
        if (this.activeHomeworkFilter === "todo") {
          return item.filterStatus === "todo";
        }

        return item.filterStatus === this.activeHomeworkFilter;
      });
    },

    selectedMaterialItem() {
      if (!this.filteredMaterialItems.length) {
        return null;
      }

      if (!this.isMaterialDetailOpen) {
        return null;
      }

      return (
        this.filteredMaterialItems.find((item) => {
          return this.getMaterialItemKey(item) === this.selectedMaterialKey;
        }) || this.filteredMaterialItems[0]
      );
    },

    selectedLesson() {
      if (!this.lessonSessions.length || !this.selectedLessonId) {
        return null;
      }

      return this.lessonSessions.find((lesson) => lesson.id === this.selectedLessonId)
        || null;
    },

    emptyHomeworkFilterText() {
      const messages = {
        todo: "Nincs aktív teendőd.",
        submitted: "Nincs leadott, javításra váró anyagod.",
        reviewed: "Nincs javított anyagod.",
        closed: "Nincs lezárt anyagod.",
        all: "Még nincs kiadott vagy beküldött anyagod.",
      };

      return (
        messages[this.activeHomeworkFilter] || "Nincs házi ebben a nézetben."
      );
    },
  },

  methods: {
    async loadSubmissions() {
      if (!this.userSession?.id) return;

      this.isLoading = true;
      this.setupError = false;

      try {
        this.submissions = await fetchStudentWritingSubmissions(
          this.userSession.id,
        );
        this.selectedSubmission = this.submissions[0] || null;
      } catch (error) {
        console.error("Diák anyagok lekérési hiba:", error.message);
        this.setupError = error.message?.includes("writing_submissions");
      } finally {
        this.isLoading = false;
      }
    },

    async loadHomeworkAssignments() {
      if (!this.userSession?.id) return;

      this.isLoadingHomework = true;

      try {
        this.homeworkAssignments = await fetchStudentHomeworkAssignments(
          this.userSession.id,
        );
      } catch (error) {
        console.error("Diák házik lekérési hiba:", error.message);
      } finally {
        this.isLoadingHomework = false;
      }
    },

    async loadLessonSessions() {
      if (!this.userSession?.id) {
        this.lessonSessions = [];
        this.closeSelectedLesson();
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
        console.error("Diák munkafüzetek lekérési hiba:", error.message);
        this.lessonSessionSetupError = error.message?.includes("lesson_sessions");
      } finally {
        this.isLoadingLessonSessions = false;
      }
    },

    async submitHomeworkWriting(assignment) {
      const content = this.homeworkDrafts[assignment.id]?.trim();
      if (!content || this.isSubmittingHomework) return;

      this.isSubmittingHomework = true;

      try {
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        await createWritingSubmission({
          studentId: this.userSession.id,
          taskType: "homework-writing",
          taskTitle: assignment.title,
          taskSituation: assignment.topic || assignment.instructions,
          taskInstructions: assignment.instructions,
          taskPoints: [],
          expectedWordCount: assignment.expected_word_count || 0,
          wordCount,
          content,
          assignmentId: assignment.id,
          teacherId: assignment.teacher_id,
        });

        await updateHomeworkStatus(assignment.id, HOMEWORK_STATUS.SUBMITTED);
        this.homeworkDrafts[assignment.id] = "";
        await Promise.all([
          this.loadHomeworkAssignments(),
          this.loadSubmissions(),
        ]);
        this.activeHomeworkFilter = "submitted";
      } catch (error) {
        console.error("Házi beküldési hiba:", error.message);
        alert("Nem sikerült beküldeni a házit.");
      } finally {
        this.isSubmittingHomework = false;
      }
    },

    getSubmissionStatusLabel(status) {
      return getSubmissionStatusLabel(status);
    },

    getHomeworkFilterCount(filterKey) {
      if (filterKey === "all") {
        return this.materialItems.length;
      }

      return this.materialItems.filter((item) => {
        if (filterKey === "todo") {
          return item.filterStatus === "todo";
        }

        return item.filterStatus === filterKey;
      }).length;
    },

    getHomeworkStatusLabel(status) {
      return getHomeworkStatusLabel(status);
    },

    getHomeworkTypeLabel(assignment) {
      return assignment.type === "practice"
        ? `Gyakorló: ${assignment.practice_type || "feladat"}`
        : "Fogalmazás / levélírás";
    },

    getMaterialItemKey(item) {
      if (!item) {
        return "";
      }

      return `${item.kind}-${item.id}`;
    },

    isSelectedMaterialItem(item) {
      if (!this.selectedMaterialItem) {
        return false;
      }

      return (
        this.getMaterialItemKey(item) ===
        this.getMaterialItemKey(this.selectedMaterialItem)
      );
    },

    getLatestSubmissionForAssignment(assignmentId) {
      const submissions = this.submissionsByAssignmentId[assignmentId] || [];

      return submissions
        .slice()
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0] || null;
    },

    canStudentWorkOnHomework,

    selectLessonSession(lesson) {
      if (this.selectedLessonId === lesson.id) {
        this.closeSelectedLesson();
        return;
      }

      this.selectedLessonId = lesson.id;
      this.syncLessonWorkbookDraft(lesson);
    },

    closeSelectedLesson() {
      this.selectedLessonId = "";
      this.syncLessonWorkbookDraft(null);
    },

    syncLessonWorkbookDraft(lesson) {
      this.lessonWorkbookDraft = {
        sharedNotes: lesson?.shared_notes || "",
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

    async markHomeworkStartedIfNeeded(assignment) {
      if (!assignment?.id || !shouldMarkHomeworkStarted(assignment.status)) {
        return;
      }

      try {
        const updated = await updateHomeworkStatus(
          assignment.id,
          HOMEWORK_STATUS.STARTED,
        );

        this.homeworkAssignments = this.homeworkAssignments.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
      } catch (error) {
        console.error("Házi elkezdés státusz hiba:", error.message);
      }
    },

    async selectMaterialItem(item) {
      const itemKey = this.getMaterialItemKey(item);
      const currentKey = this.getMaterialItemKey(this.selectedMaterialItem);

      if (this.isMaterialDetailOpen && currentKey === itemKey) {
        this.selectedMaterialKey = "";
        this.isMaterialDetailOpen = false;
        return;
      }

      this.selectedMaterialKey = itemKey;
      this.isMaterialDetailOpen = true;

      if (item.kind === "homework") {
        await this.markHomeworkStartedIfNeeded(item.raw);
      }
    },

    formatDate,
  },
};
</script>
