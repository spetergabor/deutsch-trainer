<template>
    <section :class="materialsUi.shell">
    <div :class="materialsUi.header">
      <span :class="materialsUi.headerKicker">Anyagok</span>
      <h2 :class="materialsUi.headerTitle">Házi feladataim és beküldéseim</h2>
      <p :class="materialsUi.headerCopy">
        A tanári feladatokat, beküldött írásokat és javítási állapotokat itt
        követheted.
      </p>
    </div>

    <section :class="materialsUi.panel">
      <h2 :class="materialsUi.sectionTitle">Anyagaim</h2>

      <div :class="materialsUi.tabs">
        <button
          v-for="filter in homeworkFilters"
          :key="filter.key"
          :class="[
            materialsUi.tab,
            activeHomeworkFilter === filter.key
              ? materialsUi.tabActive
              : materialsUi.tabInactive,
          ]"
          @click="activeHomeworkFilter = filter.key"
        >
          {{ filter.label }}
          <span :class="materialsUi.tabCount">{{ getHomeworkFilterCount(filter.key) }}</span>
        </button>
      </div>

      <div v-if="isLoadingHomework" :class="materialsUi.empty">
        Házik betöltése...
      </div>

      <div v-else-if="!materialItems.length" :class="materialsUi.empty">
        Még nincs kiadott vagy beküldött anyagod.
      </div>

      <div
        v-else-if="!filteredMaterialItems.length"
        :class="materialsUi.empty"
      >
        {{ emptyHomeworkFilterText }}
      </div>

      <div
        v-else
        :class="materialsUi.layout"
      >
        <aside :class="materialsUi.listContainer">
          <button
            v-for="item in filteredMaterialItems"
            :key="getMaterialItemKey(item)"
            :class="[
              materialsUi.listItem,
              isSelectedMaterialItem(item)
                ? materialsUi.listItemActive
                : materialsUi.listItemIdle,
            ]"
            @click="selectMaterialItem(item)"
          >
            <strong :class="materialsUi.listItemTitle">{{ item.title }}</strong>
            <span :class="materialsUi.listItemMeta">{{ item.statusLabel }}</span>
            <span :class="materialsUi.listItemType">{{ item.typeLabel }}</span>
            <small
              v-if="item.createdAt"
              :class="materialsUi.listItemMeta"
            >
              {{ formatDate(item.createdAt) }}
            </small>
          </button>
        </aside>

        <article v-if="selectedMaterialItem" :class="materialsUi.detail">
          <div :class="materialsUi.detailHead">
            <span :class="[
              materialsUi.statusBadge,
              getMaterialStatusBadgeClass(selectedMaterialItem),
            ]">
              {{ selectedMaterialItem.statusLabel }}
            </span>

            <h2 :class="materialsUi.detailTitle">
              {{ selectedMaterialItem.title }}
            </h2>

            <p v-if="selectedMaterialItem.createdAt" :class="materialsUi.detailDate">
              {{ formatDate(selectedMaterialItem.createdAt) }}
            </p>
          </div>

          <div :class="materialsUi.metaGrid">
            <div v-if="selectedMaterialItem.wordCount" :class="materialsUi.metaItem">
              <span :class="materialsUi.metaLabel">Szószám</span>
              <strong :class="materialsUi.metaValue">{{ selectedMaterialItem.wordCount }} szó</strong>
            </div>

            <div v-if="selectedMaterialItem.expectedWordCount" :class="materialsUi.metaItem">
              <span :class="materialsUi.metaLabel">Elvárt</span>
              <strong :class="materialsUi.metaValue">
                {{ selectedMaterialItem.expectedWordCount }} szó
              </strong>
            </div>

            <div v-if="selectedMaterialItem.targetCount" :class="materialsUi.metaItem">
              <span :class="materialsUi.metaLabel">Cél</span>
              <strong :class="materialsUi.metaValue">
                {{ selectedMaterialItem.targetCount }} feladat
              </strong>
            </div>

            <div v-if="selectedMaterialItem.dueAt" :class="materialsUi.metaItem">
              <span :class="materialsUi.metaLabel">Határidő</span>
              <strong :class="materialsUi.metaValue">
                {{ formatDate(selectedMaterialItem.dueAt) }}
              </strong>
            </div>

            <div :class="materialsUi.metaItem">
              <span :class="materialsUi.metaLabel">Típus</span>
              <strong :class="materialsUi.metaValue">
                {{ selectedMaterialItem.typeLabel }}
              </strong>
            </div>
          </div>

          <template v-if="selectedMaterialItem.kind === 'homework'">
            <section
              v-if="
                selectedMaterialItem.latestSubmission?.grade ||
                selectedMaterialItem.latestSubmission?.teacher_feedback
              "
              :class="materialsUi.reviewSection"
            >
              <h3 :class="materialsUi.sectionHeading">
                {{
                  selectedMaterialItem.raw.status === 'revision_requested'
                    ? 'Újraküldés kérése'
                    : 'Tanári értékelés'
                }}
              </h3>

              <div
                v-if="selectedMaterialItem.latestSubmission.grade"
                :class="materialsUi.gradeBox"
              >
                <span :class="materialsUi.gradeLabel">Osztályzat / értékelés</span>
                <strong :class="materialsUi.gradeValue">
                  {{ selectedMaterialItem.latestSubmission.grade }}
                </strong>
              </div>

              <p
                v-if="selectedMaterialItem.latestSubmission.teacher_feedback"
                :class="materialsUi.sectionText"
              >
                {{ selectedMaterialItem.latestSubmission.teacher_feedback }}
              </p>

              <small
                v-if="selectedMaterialItem.latestSubmission.reviewed_at"
                :class="materialsUi.mutedText"
              >
                Javítva: {{ formatDate(selectedMaterialItem.latestSubmission.reviewed_at) }}
              </small>
            </section>

            <section :class="materialsUi.textSection">
              <h3 :class="materialsUi.sectionHeading">Feladat</h3>
              <p :class="materialsUi.sectionText">{{ selectedMaterialItem.description }}</p>
            </section>

            <section v-if="selectedMaterialItem.raw.topic" :class="materialsUi.textSection">
              <h3 :class="materialsUi.sectionHeading">Téma</h3>
              <p :class="materialsUi.sectionText">{{ selectedMaterialItem.raw.topic }}</p>
            </section>

            <section
              v-if="
                selectedMaterialItem.raw.type === 'writing' &&
                canStudentWorkOnHomework(selectedMaterialItem.raw.status)
              "
              :class="materialsUi.workspace"
            >
              <h3 :class="materialsUi.sectionHeading">
                {{
                  selectedMaterialItem.raw.status === 'revision_requested'
                    ? 'Újraküldés'
                    : 'Megoldás'
                }}
              </h3>

              <textarea
                v-model="homeworkDrafts[selectedMaterialItem.raw.id]"
                :class="materialsUi.textarea"
                placeholder="Ide írd a házi fogalmazást vagy levelet..."
              />

              <button
                :class="materialsUi.submitBtn"
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
              :class="materialsUi.primaryAction"
              @click="$emit('start-homework-practice', selectedMaterialItem.raw)"
            >
              Gyakorlás indítása
            </button>

            <section v-if="selectedMaterialItem.latestSubmission" :class="materialsUi.textSection">
              <h3 :class="materialsUi.sectionHeading">Legutóbbi beküldés</h3>
              <p :class="materialsUi.sectionText">
                {{ selectedMaterialItem.latestSubmission.content }}
              </p>
            </section>

            <div
              v-if="!canStudentWorkOnHomework(selectedMaterialItem.raw.status)"
              :class="materialsUi.doneBadge"
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
              :class="materialsUi.reviewSection"
            >
              <h3 :class="materialsUi.sectionHeading">Tanári értékelés</h3>

              <div
                v-if="selectedMaterialItem.raw.grade"
                :class="materialsUi.gradeBox"
              >
                <span :class="materialsUi.gradeLabel">Osztályzat / értékelés</span>
                <strong :class="materialsUi.gradeValue">
                  {{ selectedMaterialItem.raw.grade }}
                </strong>
              </div>

              <p
                v-if="selectedMaterialItem.raw.teacher_feedback"
                :class="materialsUi.sectionText"
              >
                {{ selectedMaterialItem.raw.teacher_feedback }}
              </p>

              <small
                v-if="selectedMaterialItem.raw.reviewed_at"
                :class="materialsUi.mutedText"
              >
                Javítva: {{ formatDate(selectedMaterialItem.raw.reviewed_at) }}
              </small>
            </section>

            <section :class="materialsUi.textSection">
              <h3 :class="materialsUi.sectionHeading">Levél témája</h3>
              <p :class="materialsUi.sectionText">
                {{ selectedMaterialItem.raw.task_situation }}
              </p>
            </section>

            <section
              v-if="selectedMaterialItem.raw.task_points?.length"
              :class="materialsUi.textSection"
            >
              <h3 :class="materialsUi.sectionHeading">Feladat pontjai</h3>
              <ul :class="materialsUi.listReset">
                <li v-for="point in selectedMaterialItem.raw.task_points" :key="point">
                  {{ point }}
                </li>
              </ul>
            </section>

            <section :class="materialsUi.textSection">
              <h3 :class="materialsUi.sectionHeading">Beküldött szöveg</h3>
              <p :class="materialsUi.sectionText">
                {{ selectedMaterialItem.raw.content }}
              </p>
            </section>
          </template>
        </article>
      </div>
    </section>

    <div v-if="setupError" :class="materialsUi.emptyWarning">
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
  HOMEWORK_STATUS,
  canStudentWorkOnHomework,
  getHomeworkFilterStatus,
  getHomeworkStatusLabel,
  getSubmissionStatusLabel,
  shouldMarkHomeworkStarted,
} from "../../utils/homeworkLifecycle";
import { formatDate } from "../../utils/formatters";

const MATERIALS_UI = {
  shell:
    "student-materials-view nemet-page-shell nemet-page-shell--compact",
  header: "mb-6 text-left",
  headerKicker:
    "inline-flex items-center rounded-full bg-[#ffd56a]/16 px-3 py-2 text-xs font-black leading-none text-[#ffdc7a]",
  headerTitle:
    "mt-3 text-4xl font-black leading-tight text-white sm:text-5xl",
  headerCopy:
    "max-w-3xl text-base font-semibold leading-relaxed text-white/60",
  panel:
    "rounded-[24px] border border-[#ffd56a]/25 bg-white/[0.055] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:p-6",
  sectionTitle:
    "mb-5 text-3xl font-black leading-tight text-white sm:text-4xl",
  tabs: "mb-4 flex flex-wrap gap-2 rounded-full bg-black/20 p-2",
  tab: "inline-flex min-h-10 items-center gap-2 rounded-full border border-transparent bg-transparent px-3 py-1.5 text-sm font-black leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd56a]/20",
  tabActive: "border-[#ffd56a]/30 bg-[#ffd56a]/15 text-white",
  tabInactive: "text-white/65 hover:bg-white/10",
  tabCount:
    "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-1.5 text-xs font-black text-[#ffdc7a]",
  empty:
    "rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-black leading-relaxed text-white/65",
  emptyWarning: "rounded-xl border border-[#ffd56a]/30 bg-[#ffd56a]/10 p-4 text-sm font-black leading-relaxed text-[#ffdc7a]",
  layout: "grid gap-4 md:grid-cols-[320px,minmax(0,1fr)]",
  listContainer: "space-y-2 rounded-xl border border-white/10 bg-black/20 p-2",
  listItem:
    "w-full rounded-xl border border-transparent bg-black/10 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd56a]/20",
  listItemActive: "border-[#ffd56a]/40 bg-[#ffd56a]/15 text-white",
  listItemIdle: "border-transparent text-white/95",
  listItemTitle:
    "block min-w-0 text-base font-black leading-snug text-white/95 truncate",
  listItemMeta:
    "mt-1 block text-xs font-black text-white/55",
  listItemType:
    "mt-1 block text-xs font-black text-white/45",
  detail:
    "min-w-0 rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5",
  detailHead: "mb-4",
  statusBadge:
    "inline-flex h-7 items-center rounded-full border px-3 text-xs font-black leading-none",
  detailTitle: "mt-3 text-[1.7rem] font-black leading-tight text-white",
  detailDate: "mt-2 text-sm font-semibold text-white/58",
  metaGrid: "mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3",
  metaItem:
    "rounded-lg border border-white/10 bg-black/18 p-3",
  metaLabel:
    "block text-xs font-black uppercase tracking-[0.02em] text-white/45",
  metaValue:
    "mt-1 block text-sm font-black text-white",
  textSection:
    "mb-4 rounded-lg border border-white/10 bg-black/12 p-3 sm:p-4",
  sectionHeading: "m-0 text-xl font-black text-white",
  sectionText: "mt-2 text-sm leading-relaxed text-white/72",
  listReset: "pl-5 text-sm leading-relaxed text-white/72",
  mutedText: "mt-2 block text-xs font-black text-white/50",
  workspace: "mb-4 flex flex-col gap-3",
  textarea:
    "h-44 w-full resize-vertical rounded-xl border border-white/12 bg-black/22 p-4 text-sm font-semibold leading-relaxed text-white placeholder:text-white/50",
  primaryAction:
    "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/12 bg-white/10 px-4 text-sm font-black text-white/90 transition hover:bg-white/15",
  submitBtn:
    "inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-br from-[#35d06f] to-[#2fc061] text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50",
  doneBadge:
    "w-full rounded-full border border-[#43e97b]/30 bg-[#43e97b]/12 px-3 py-3 text-center text-sm font-black text-[#79f2a8]",
  reviewSection:
    "rounded-lg border border-[#43e97b]/30 bg-[#43e97b]/10 px-4 py-3",
  gradeBox:
    "mb-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/18 px-3 py-2",
  gradeLabel: "text-sm text-white/58",
  gradeValue: "text-2xl font-black text-[#79f2a8]",
};

const MATERIAL_STATUS_BADGE = {
  homework: {
    todo: "bg-[#ffd56a]/15 border-[#ffd56a]/35 text-[#ffdc7a]",
    started: "bg-[#80caff]/15 border-[#80caff]/35 text-[#c5e6ff]",
    submitted: "bg-[#43e97b]/15 border-[#43e97b]/35 text-[#79f2a8]",
    revision_requested:
      "bg-[#ff7ea7]/15 border-[#ff7ea7]/35 text-[#ffb3cd]",
    reviewed: "bg-[#66ffa5]/15 border-[#66ffa5]/35 text-[#a5ffd4]",
    closed: "bg-white/10 border-white/20 text-white/70",
  },
  submission: {
    todo: "bg-[#ffd56a]/15 border-[#ffd56a]/35 text-[#ffdc7a]",
    submitted: "bg-[#43e97b]/15 border-[#43e97b]/35 text-[#79f2a8]",
    reviewed: "bg-[#66ffa5]/15 border-[#66ffa5]/35 text-[#a5ffd4]",
    closed: "bg-white/10 border-white/20 text-white/70",
    revision_requested:
      "bg-[#ff7ea7]/15 border-[#ff7ea7]/35 text-[#ffb3cd]",
  },
};

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
      materialsUi: MATERIALS_UI,
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
      isMaterialDetailOpen: true,
    };
  },

  async mounted() {
    await Promise.all([
      this.loadSubmissions(),
      this.loadHomeworkAssignments(),
    ]);
  },

  watch: {
    async userSession() {
      await Promise.all([
        this.loadSubmissions(),
        this.loadHomeworkAssignments(),
      ]);
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

    getMaterialStatusBadgeClass(item) {
      const kind = item.kind || "homework";
      const status = item.raw?.status || "default";
      const map = MATERIAL_STATUS_BADGE[kind] || MATERIAL_STATUS_BADGE.homework;

      return `${MATERIALS_UI.statusBadge} ${map[status] || map.default || ""}`;
    },

    formatDate,
  },
};
</script>
