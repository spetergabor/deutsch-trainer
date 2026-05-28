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
      <h2>Házi feladataim</h2>

      <div v-if="isLoadingHomework" class="student-materials-empty">
        Házik betöltése...
      </div>

      <div v-else-if="!homeworkAssignments.length" class="student-materials-empty">
        Még nincs kiadott házi feladatod.
      </div>

      <div v-else class="student-homework-list">
        <article
          v-for="assignment in homeworkAssignments"
          :key="assignment.id"
          class="student-homework-card"
        >
          <div class="student-homework-card-head">
            <span>{{ getHomeworkStatusLabel(assignment.status) }}</span>
            <strong>{{ assignment.title }}</strong>
            <small>{{ getHomeworkTypeLabel(assignment) }}</small>
          </div>

          <p>{{ assignment.instructions }}</p>

          <div class="student-submission-meta">
            <span v-if="assignment.due_at">Határidő: {{ formatDate(assignment.due_at) }}</span>
            <span v-if="assignment.expected_word_count">{{ assignment.expected_word_count }} szó</span>
            <span v-if="assignment.target_count">{{ assignment.target_count }} feladat</span>
          </div>

          <template v-if="assignment.type === 'writing' && assignment.status !== 'submitted'">
            <textarea
              v-model="homeworkDrafts[assignment.id]"
              class="student-homework-textarea"
              placeholder="Ide írd a házi fogalmazást vagy levelet..."
            ></textarea>

            <button
              class="student-homework-submit"
              @click="submitHomeworkWriting(assignment)"
              :disabled="isSubmittingHomework || !homeworkDrafts[assignment.id]?.trim()"
            >
              {{ isSubmittingHomework ? "Beküldés..." : "Házi beküldése" }}
            </button>
          </template>

          <button
            v-else-if="assignment.type === 'practice'"
            class="student-homework-submit"
            @click="$emit('set-mode', assignment.practice_type)"
          >
            Gyakorlás indítása
          </button>
        </article>
      </div>
    </section>

    <div v-if="setupError" class="student-materials-empty warning">
      A beküldött írások táblája még nincs beállítva.
    </div>

    <div v-else-if="isLoading" class="student-materials-empty">
      Beküldések betöltése...
    </div>

    <div v-else-if="!submissions.length" class="student-materials-empty">
      Még nincs beküldött anyagod. Az ÖSD Schreiben feladatnál tudsz levelet beküldeni.
    </div>

    <div v-else class="student-materials-layout">
      <aside class="student-materials-list">
        <button
          v-for="submission in submissions"
          :key="submission.id"
          class="student-materials-item"
          :class="{ active: selectedSubmission?.id === submission.id }"
          @click="selectedSubmission = submission"
        >
          <strong>{{ submission.task_title }}</strong>
          <span>{{ getSubmissionStatusLabel(submission.status) }}</span>
          <small>{{ formatDate(submission.created_at) }}</small>
        </button>
      </aside>

      <article v-if="selectedSubmission" class="student-materials-detail">
        <div class="student-materials-detail-head">
          <span :class="['student-submission-status', selectedSubmission.status]">
            {{ getSubmissionStatusLabel(selectedSubmission.status) }}
          </span>
          <h2>{{ selectedSubmission.task_title }}</h2>
          <p>{{ formatDate(selectedSubmission.created_at) }}</p>
        </div>

        <div class="student-materials-meta">
          <div>
            <span>Szószám</span>
            <strong>{{ selectedSubmission.word_count }} szó</strong>
          </div>

          <div>
            <span>Elvárt</span>
            <strong>{{ selectedSubmission.expected_word_count }} szó</strong>
          </div>

          <div>
            <span>Típus</span>
            <strong>{{ selectedSubmission.task_type }}</strong>
          </div>
        </div>

        <section
          v-if="selectedSubmission.grade || selectedSubmission.teacher_feedback"
          class="student-materials-review"
        >
          <h3>Tanári értékelés</h3>

          <div v-if="selectedSubmission.grade" class="student-materials-grade">
            <span>Osztályzat / értékelés</span>
            <strong>{{ selectedSubmission.grade }}</strong>
          </div>

          <p v-if="selectedSubmission.teacher_feedback">
            {{ selectedSubmission.teacher_feedback }}
          </p>

          <small v-if="selectedSubmission.reviewed_at">
            Javítva: {{ formatDate(selectedSubmission.reviewed_at) }}
          </small>
        </section>

        <section>
          <h3>Levél témája</h3>
          <p>{{ selectedSubmission.task_situation }}</p>
        </section>

        <section>
          <h3>Feladat pontjai</h3>
          <ul>
            <li
              v-for="point in selectedSubmission.task_points"
              :key="point"
            >
              {{ point }}
            </li>
          </ul>
        </section>

        <section>
          <h3>Beküldött szöveg</h3>
          <p class="student-materials-content">{{ selectedSubmission.content }}</p>
        </section>
      </article>
    </div>
  </section>
</template>

<script>
import { fetchStudentWritingSubmissions } from "../../services/writingSubmissionService";
import {
  fetchStudentHomeworkAssignments,
  updateHomeworkStatus,
} from "../../services/homeworkService";
import { createWritingSubmission } from "../../services/writingSubmissionService";
import { formatDate } from "../../utils/formatters";

export default {
  name: "StudentMaterialsView",

  props: {
    userSession: {
      type: Object,
      default: null,
    },
  },

  emits: ["go-dashboard", "set-mode"],

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
    };
  },

  async mounted() {
    await this.loadSubmissions();
    await this.loadHomeworkAssignments();
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

    formatDate,
  },
};
</script>
