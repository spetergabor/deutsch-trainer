<template>
  <section class="student-materials-view">
    <div class="student-materials-topbar">
      <button class="btn-outline btn-small" @click="$emit('go-dashboard')">
        ← Vissza
      </button>

      <h1>Beküldött anyagaim</h1>
    </div>

    <div class="student-materials-header">
      <span>Anyagok</span>
      <h2>Házi feladataim és beküldéseim</h2>
      <p>A tanári feladatokat, beküldött írásokat és javítási állapotokat itt követheted.</p>
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

      <div v-else-if="!filteredMaterialItems.length" class="student-materials-empty">
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
            <small v-if="item.createdAt">{{ formatDate(item.createdAt) }}</small>
          </button>
        </aside>

        <article v-if="selectedMaterialItem" class="student-materials-detail">
          <div class="student-materials-detail-head">
            <span
              v-if="selectedMaterialItem.kind === 'submission'"
              :class="['student-submission-status', selectedMaterialItem.raw.status]"
            >
              {{ selectedMaterialItem.statusLabel }}
            </span>
            <span v-else class="student-submission-status homework">
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
            <section>
              <h3>Feladat</h3>
              <p>{{ selectedMaterialItem.description }}</p>
            </section>

            <section v-if="selectedMaterialItem.raw.topic">
              <h3>Téma</h3>
              <p>{{ selectedMaterialItem.raw.topic }}</p>
            </section>

            <section
              v-if="selectedMaterialItem.raw.type === 'writing' && selectedMaterialItem.raw.status !== 'submitted' && selectedMaterialItem.raw.status !== 'reviewed'"
              class="student-homework-workspace"
            >
              <h3>Megoldás</h3>
              <textarea
                v-model="homeworkDrafts[selectedMaterialItem.raw.id]"
                class="student-homework-textarea"
                placeholder="Ide írd a házi fogalmazást vagy levelet..."
              ></textarea>

              <button
                class="student-homework-submit"
                @click="submitHomeworkWriting(selectedMaterialItem.raw)"
                :disabled="isSubmittingHomework || !homeworkDrafts[selectedMaterialItem.raw.id]?.trim()"
              >
                {{ isSubmittingHomework ? "Beküldés..." : "Házi beküldése" }}
              </button>
            </section>

            <button
              v-else-if="selectedMaterialItem.raw.type === 'practice' && selectedMaterialItem.raw.status !== 'submitted' && selectedMaterialItem.raw.status !== 'reviewed'"
              class="student-homework-submit"
              @click="$emit('start-homework-practice', selectedMaterialItem.raw)"
            >
              Gyakorlás indítása
            </button>

            <div v-else class="student-homework-done">
              Ez az anyag már be van küldve.
            </div>
          </template>

          <template v-else>
            <section
              v-if="selectedMaterialItem.raw.grade || selectedMaterialItem.raw.teacher_feedback"
              class="student-materials-review"
            >
              <h3>Tanári értékelés</h3>

              <div v-if="selectedMaterialItem.raw.grade" class="student-materials-grade">
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
              <p class="student-materials-content">{{ selectedMaterialItem.raw.content }}</p>
            </section>
          </template>
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
import { formatDate } from "../../utils/formatters";

export default {
  name: "StudentMaterialsView",

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
      isSubmittingHomework: false,
      setupError: false,
      activeHomeworkFilter: "todo",
      selectedMaterialKey: "",
    };
  },

  async mounted() {
    await this.loadSubmissions();
    await this.loadHomeworkAssignments();
  },

  computed: {
    homeworkFilters() {
      return [
        { key: "todo", label: "Teendők" },
        { key: "submitted", label: "Leadva" },
        { key: "reviewed", label: "Javítva" },
        { key: "all", label: "Összes" },
      ];
    },

    materialItems() {
      const submittedWritingAssignmentIds = new Set(
        this.submissions
          .map((submission) => submission.assignment_id)
          .filter(Boolean),
      );

      const homeworkItems = this.homeworkAssignments
        .filter((assignment) => {
          return !(
            assignment.type === "writing" &&
            submittedWritingAssignmentIds.has(assignment.id)
          );
        })
        .map((assignment) => ({
          id: assignment.id,
          kind: "homework",
          raw: assignment,
          title: assignment.title,
          status: assignment.status,
          filterStatus: ["assigned", "opened"].includes(assignment.status)
            ? "todo"
            : assignment.status,
          statusLabel: this.getHomeworkStatusLabel(assignment.status),
          typeLabel: this.getHomeworkTypeLabel(assignment),
          description: assignment.instructions,
          dueAt: assignment.due_at,
          expectedWordCount: assignment.expected_word_count,
          targetCount: assignment.target_count,
          createdAt: assignment.created_at,
        }));

      const submissionItems = this.submissions.map((submission) => ({
        id: submission.id,
        kind: "submission",
        raw: submission,
        title: submission.task_title,
        status: submission.status,
        filterStatus: submission.status,
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

      return this.filteredMaterialItems.find((item) => {
        return this.getMaterialItemKey(item) === this.selectedMaterialKey;
      }) || this.filteredMaterialItems[0];
    },

    emptyHomeworkFilterText() {
      const messages = {
        todo: "Nincs aktív teendőd.",
        submitted: "Nincs leadott, javításra váró anyagod.",
        reviewed: "Nincs javított anyagod.",
        all: "Még nincs kiadott vagy beküldött anyagod.",
      };

      return messages[this.activeHomeworkFilter] || "Nincs házi ebben a nézetben.";
    },
  },

  methods: {
    async loadSubmissions() {
      if (!this.userSession?.id) return;

      this.isLoading = true;
      this.setupError = false;

      try {
        this.submissions = await fetchStudentWritingSubmissions(this.userSession.id);
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
        });

        await updateHomeworkStatus(assignment.id, "submitted");
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
      const labels = {
        submitted: "Új beküldés",
        reviewing: "Javítás alatt",
        reviewed: "Javítva",
      };

      return labels[status] || "Beküldve";
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
      const labels = {
        assigned: "Kiadva",
        opened: "Megnyitva",
        submitted: "Beküldve",
        reviewed: "Javítva",
      };

      return labels[status] || "Kiadva";
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
      return this.getMaterialItemKey(item) === this.getMaterialItemKey(this.selectedMaterialItem);
    },

    selectMaterialItem(item) {
      this.selectedMaterialKey = this.getMaterialItemKey(item);
    },

    formatDate,
  },
};
</script>
