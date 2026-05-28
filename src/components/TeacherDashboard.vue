<template>
  <div class="teacher-dashboard">
    <section v-if="!activeTeacherSection" class="teacher-portal">
      <div class="teacher-portal-header">
        <div>
          <h1>Tanári áttekintés</h1>
          <p>Gyors kép arról, kivel érdemes ma foglalkozni.</p>
        </div>
      </div>

      <div class="teacher-overview-grid">
        <article class="teacher-overview-card highlight">
          <span class="teacher-overview-icon">🎓</span>
          <small>Diákok</small>
          <strong>{{ students.length }}</strong>
          <p>{{ isLoading ? "Betöltés..." : "regisztrált diák" }}</p>
        </article>

        <article class="teacher-overview-card">
          <span class="teacher-overview-icon green">✅</span>
          <small>Ma aktív</small>
          <strong>{{ teacherOverview.activeTodayCount }}</strong>
          <p>diák oldott meg feladatot</p>
        </article>

        <article class="teacher-overview-card warning">
          <span class="teacher-overview-icon amber">⚠️</span>
          <small>Figyelmet igényel</small>
          <strong>{{ teacherOverview.attentionStudents.length }}</strong>
          <p>
            {{
              teacherOverview.attentionStudents.length
                ? teacherOverview.attentionStudents.map((item) => item.name).join(", ")
                : "nincs kiugró gyenge pont"
            }}
          </p>
        </article>

        <article class="teacher-overview-card">
          <span class="teacher-overview-icon blue">📉</span>
          <small>Gyenge téma</small>
          <strong>{{ teacherOverview.weakestTopic?.label || "Nincs adat" }}</strong>
          <p>
            {{
              teacherOverview.weakestTopic
                ? `${teacherOverview.weakestTopic.accuracy}% átlag · ${teacherOverview.weakestTopic.attempts} próba`
                : "még kevés feladat alapján"
            }}
          </p>
        </article>
      </div>

      <div class="teacher-focus-panel">
        <div>
          <span class="teacher-focus-kicker">Mai tanári fókusz</span>
          <h2>{{ teacherFocusTitle }}</h2>
          <p>{{ teacherFocusText }}</p>
        </div>

        <div class="teacher-focus-actions">
          <button @click="openTeacherSection('students')">Diákok megnyitása</button>
          <button class="secondary" @click="openTeacherSection('exercises')">
            Feladat készítése
          </button>
        </div>
      </div>

      <div v-if="teacherOverview.attentionStudents.length" class="teacher-focus-list">
        <div class="teacher-focus-list-header">
          <h2>Figyelmet igénylő diákok</h2>
          <span>{{ teacherOverview.attentionStudents.length }} javaslat</span>
        </div>

        <div class="teacher-focus-students">
          <article
            v-for="student in teacherOverview.attentionStudents"
            :key="student.id"
            class="teacher-focus-student"
          >
            <div class="avatar">{{ getInitial(student.name) }}</div>

            <div class="teacher-focus-student-body">
              <strong>{{ student.name }}</strong>
              <span>{{ student.reason }}</span>
              <small>Utolsó aktivitás: {{ formatDate(student.lastActivity) }}</small>
            </div>

            <button @click="openStudentFromOverview(student.id)">Megnyitás</button>
          </article>
        </div>
      </div>

      <div class="teacher-section-grid">
        <button class="teacher-section-card" @click="openTeacherSection('students')">
          <span class="teacher-section-icon students">🎓</span>
          <strong>Diákkezelő</strong>
          <small>Diákok, statisztikák, jegyzetek és feltöltött fájlok.</small>
          <em>{{ students.length }} diák</em>
        </button>

        <button class="teacher-section-card" @click="openTeacherSection('exercises')">
          <span class="teacher-section-icon exercises">🧩</span>
          <strong>Feladatkezelő</strong>
          <small>Feladatok hozzáadása, szerkesztése és deaktiválása.</small>
          <em>5 feladattípus</em>
        </button>

        <button class="teacher-section-card" @click="openTeacherSection('writings')">
          <span class="teacher-section-icon writings">✍️</span>
          <strong>Beküldött írások</strong>
          <small>ÖSD levelek, beadott fogalmazások és javításra váró szövegek.</small>
          <em>{{ writingSubmissions.length }} beküldés</em>
        </button>
      </div>
    </section>

    <section v-else class="teacher-workspace">
      <header class="teacher-workspace-header">
        <button class="btn-outline btn-small" @click="goToTeacherPortal">
          ← Vissza
        </button>

        <div>
          <h1>
            {{ activeTeacherSectionTitle }}
          </h1>
          <p>{{ activeTeacherSectionDescription }}</p>
        </div>
      </header>

      <div v-if="activeTeacherSection === 'students'" class="teacher-container">
        <aside class="student-list">
          <div class="student-list-header">
            <h2>Diákjaim</h2>
            <span>{{ students.length }} fő</span>
          </div>

          <div v-if="isLoading" class="no-students">Diákok betöltése...</div>

          <div v-else-if="students.length === 0" class="no-students">
            Még nincsenek regisztrált diákok.
          </div>

          <div
            v-for="student in students"
            :key="student.id"
            class="student-item"
            :class="{ active: selectedStudent?.id === student.id }"
            @click="selectStudent(student)"
          >
            <div class="avatar">{{ getInitial(student.full_name) }}</div>

            <div class="student-info">
              <span class="student-name">
                {{ student.full_name || "Névtelen diák" }}
              </span>

              <span class="student-email">
                {{ student.email }}
              </span>
            </div>
          </div>
        </aside>

        <main class="student-details">
          <div v-if="selectedStudent" class="details-content">
            <header class="details-header">
              <div>
                <h1>{{ selectedStudent.full_name || "Névtelen diák" }}</h1>
                <p>{{ selectedStudent.email }}</p>
              </div>

              <button class="btn-outline btn-small" @click="clearSelectedStudent">
                Bezárás
              </button>
            </header>

            <div v-if="isStudentDataLoading" class="empty-state small">
              Adatok betöltése...
            </div>

            <div v-else class="details-grid">
              <div class="detail-card">
                <h3>📊 Statisztikák</h3>

                <div class="stat-row">
                  <span>Megoldott feladatok:</span>
                  <strong>{{ studentStats.totalDone }} db</strong>
                </div>

                <div class="stat-row">
                  <span>Átlagos eredmény:</span>
                  <strong>{{ studentStats.accuracy }}%</strong>
                </div>

                <div class="student-trend-box" :class="studentTrend.direction">
                  <strong>{{ studentTrend.label }}</strong>
                  <span>{{ studentTrend.detail }}</span>
                </div>
              </div>

              <div class="detail-card smart-alert-card">
                <h3>🧠 Figyelmeztetések</h3>

                <div v-if="studentAlerts.length" class="teacher-alert-list">
                  <div
                    v-for="alert in studentAlerts"
                    :key="alert.type + alert.text"
                    class="teacher-alert"
                    :class="alert.level"
                  >
                    {{ alert.text }}
                  </div>
                </div>

                <p v-else class="empty-text">
                  Nincs kritikus gyenge pont az utolsó feladatok alapján.
                </p>

                <div v-if="studentWeakTopics.length" class="teacher-topic-list">
                  <strong>Témánkénti gyenge pontok</strong>

                  <div
                    v-for="topic in studentWeakTopics"
                    :key="topic.type"
                    class="teacher-topic-row"
                  >
                    <span>{{ topic.label }}</span>
                    <small>{{ topic.accuracy }}% · {{ topic.attempts }} próba</small>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h3>🕒 Legutóbbi feladatok</h3>

                <div v-if="studentResults.length">
                  <div
                    v-for="result in studentResults.slice(0, 5)"
                    :key="result.id || result.created_at"
                    class="mini-row"
                  >
                    <span>{{ getTaskName(result.exercise_type) }}</span>
                    <strong>{{ result.score }} / {{ result.max_score }}</strong>
                  </div>
                </div>

                <p v-else class="empty-text">Még nincs megoldott feladat.</p>
              </div>

              <div class="detail-card teacher-note-card">
                <h3>✍️ Tanári jegyzet küldése</h3>

                <textarea
                  v-model="teacherNoteText"
                  class="teacher-note-textarea"
                  placeholder="Írj jegyzetet, instrukciót vagy házi feladatot a diáknak..."
                ></textarea>

                <button
                  class="send-teacher-note-btn"
                  @click="sendTeacherNote"
                  :disabled="isSendingTeacherNote || !teacherNoteText.trim()"
                >
                  {{ isSendingTeacherNote ? "Küldés..." : "Jegyzet küldése" }}
                </button>
              </div>

              <div class="detail-card">
                <h3>📝 Jegyzetek</h3>

                <div v-if="studentNotes.length">
                  <div
                    v-for="note in studentNotes"
                    :key="note.id"
                    :class="[
                      'note-item',
                      note.author_role === 'teacher' ? 'teacher-note-item' : '',
                    ]"
                  >
                    <small>
                      <template v-if="note.author_role === 'teacher'">
                        👨‍🏫 Tanári jegyzet
                        <span v-if="note.author_name">
                          · {{ note.author_name }}
                        </span>
                        · {{ formatDate(note.created_at) }}
                      </template>

                      <template v-else>
                        {{ formatDate(note.created_at) }}
                      </template>
                    </small>

                    <p>{{ note.content }}</p>
                  </div>
                </div>

                <p v-else class="empty-text">Nincsenek jegyzetek.</p>
              </div>

              <div class="detail-card">
                <h3>📂 Feltöltött dokumentumok</h3>

                <div v-if="studentFiles.length">
                  <a
                    v-for="file in studentFiles"
                    :key="file.path"
                    class="file-item"
                    :href="file.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {{ file.name }}
                  </a>
                </div>

                <p v-else class="empty-text">Nincsenek feltöltött fájlok.</p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🎓</div>
            <h2>Válassz diákot</h2>
            <p>Bal oldalt kattints egy diákra a részletek megnyitásához.</p>
          </div>
        </main>
      </div>

      <section v-else-if="activeTeacherSection === 'writings'" class="writing-submissions-manager">
        <div v-if="writingSubmissionSetupError" class="setup-warning-card">
          <strong>A beküldött írások táblája még nincs beállítva.</strong>
          <p>Futtasd le a `supabase/writing_submissions.sql` fájlt a Supabase SQL editorban.</p>
        </div>

        <div class="writing-submission-toolbar">
          <div>
            <h2>Anyagok és házi feladatok</h2>
            <p>Házi kiadása, beküldött írások javítása és későbbi leckék kezelése.</p>
          </div>

          <button
            class="btn-outline btn-small"
            @click="fetchWritingSubmissions"
            :disabled="isWritingSubmissionsLoading"
          >
            Frissítés
          </button>
        </div>

        <div class="homework-create-card">
          <h3>Új házi feladat</h3>

          <div class="homework-form-grid">
            <label>
              Diák
              <select v-model="newHomework.studentId">
                <option value="">Válassz diákot</option>
                <option
                  v-for="student in students"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.full_name || student.email }}
                </option>
              </select>
            </label>

            <label>
              Feladat típusa
              <select v-model="newHomework.type">
                <option value="writing">Fogalmazás / levélírás</option>
                <option value="practice">Gyakorló feladat</option>
              </select>
            </label>

            <label v-if="newHomework.type === 'practice'">
              Gyakorló típus
              <select v-model="newHomework.practiceType">
                <option value="perfekt">Perfekt</option>
                <option value="adjektiv">Adjektivdeklination</option>
                <option value="passiv">Passiv</option>
                <option value="pronominaladverb">Pronominaladverbien</option>
                <option value="vocabulary">Szókincs</option>
              </select>
            </label>

            <label>
              Cím
              <input v-model.trim="newHomework.title" type="text" placeholder="pl. Panaszlevél írása" />
            </label>

            <label v-if="newHomework.type === 'writing'">
              Elvárt szószám
              <input v-model.number="newHomework.expectedWordCount" type="number" min="40" />
            </label>

            <label v-else>
              Feladatok száma
              <input v-model.number="newHomework.targetCount" type="number" min="1" />
            </label>

            <label>
              Határidő
              <input v-model="newHomework.dueAt" type="datetime-local" />
            </label>
          </div>

          <label class="homework-wide-field">
            Instrukció / kérés
            <textarea
              v-model.trim="newHomework.instructions"
              placeholder="Írd le pontosan, mit kérsz a diáktól..."
            ></textarea>
          </label>

          <button
            class="send-teacher-note-btn"
            @click="saveHomeworkAssignment"
            :disabled="isSavingHomework || !canSaveHomework"
          >
            {{ isSavingHomework ? "Kiadás..." : "Házi kiadása" }}
          </button>
        </div>

        <div v-if="homeworkAssignments.length" class="homework-assignment-list">
          <h3>Kiadott házik</h3>

          <article
            v-for="assignment in homeworkAssignments.slice(0, 6)"
            :key="assignment.id"
            class="homework-assignment-row"
          >
            <div>
              <strong>{{ assignment.title }}</strong>
              <span>{{ assignment.student?.full_name || assignment.student?.email || "Diák" }}</span>
            </div>

            <small>
              {{ getHomeworkTypeLabel(assignment) }} · {{ getHomeworkStatusLabel(assignment.status) }}
            </small>
          </article>
        </div>

        <div v-if="isWritingSubmissionsLoading" class="empty-state small">
          Beküldések betöltése...
        </div>

        <div v-else-if="!writingSubmissions.length" class="empty-state small">
          Még nincs beküldött írás.
        </div>

        <div v-else class="writing-submissions-layout">
          <aside class="writing-submission-list">
            <button
              v-for="submission in writingSubmissions"
              :key="submission.id"
              class="writing-submission-item"
              :class="{ active: selectedWritingSubmission?.id === submission.id }"
              @click="selectedWritingSubmission = submission"
            >
              <strong>{{ submission.student?.full_name || submission.student?.email || "Diák" }}</strong>
              <span>{{ submission.task_title }}</span>
              <small>{{ formatDate(submission.created_at) }} · {{ getSubmissionStatusLabel(submission.status) }}</small>
            </button>
          </aside>

          <article v-if="selectedWritingSubmission" class="writing-submission-detail">
            <div class="writing-submission-detail-header">
              <div>
                <span class="submission-status-pill">
                  {{ getSubmissionStatusLabel(selectedWritingSubmission.status) }}
                </span>
                <h2>{{ selectedWritingSubmission.task_title }}</h2>
                <p>
                  {{ selectedWritingSubmission.student?.full_name || selectedWritingSubmission.student?.email || "Diák" }}
                  · {{ formatDate(selectedWritingSubmission.created_at) }}
                </p>
              </div>

              <select
                :value="selectedWritingSubmission.status"
                @change="changeWritingSubmissionStatus(selectedWritingSubmission, $event.target.value)"
              >
                <option value="submitted">Új beküldés</option>
                <option value="reviewing">Javítás alatt</option>
                <option value="reviewed">Javítva</option>
              </select>
            </div>

            <div class="writing-submission-meta">
              <div>
                <span>Elvárt szószám</span>
                <strong>{{ selectedWritingSubmission.expected_word_count }} szó</strong>
              </div>

              <div>
                <span>Diák szószáma</span>
                <strong>{{ selectedWritingSubmission.word_count }} szó</strong>
              </div>

              <div>
                <span>Típus</span>
                <strong>{{ selectedWritingSubmission.task_type }}</strong>
              </div>
            </div>

            <section class="writing-submission-task">
              <h3>Levél témája</h3>
              <p>{{ selectedWritingSubmission.task_situation }}</p>

              <h3>Feladat pontjai</h3>
              <ul>
                <li
                  v-for="point in selectedWritingSubmission.task_points"
                  :key="point"
                >
                  {{ point }}
                </li>
              </ul>

              <h3>Instrukció</h3>
              <p>{{ selectedWritingSubmission.task_instructions }}</p>
            </section>

            <section class="writing-submission-content">
              <h3>Diák levele</h3>
              <p>{{ selectedWritingSubmission.content }}</p>
            </section>

            <section class="writing-review-panel">
              <h3>Tanári értékelés</h3>

              <label>
                Osztályzat / értékelés
                <input
                  v-model.trim="writingReviewGrade"
                  type="text"
                  placeholder="pl. 4, B2: gut, 82%"
                />
              </label>

              <label>
                Vélemény a diáknak
                <textarea
                  v-model.trim="writingReviewFeedback"
                  placeholder="Írd le röviden, mi sikerült jól, min kell javítani, mire figyeljen legközelebb..."
                ></textarea>
              </label>

              <button
                @click="saveWritingReview"
                :disabled="isSavingWritingReview || !selectedWritingSubmission"
              >
                {{ isSavingWritingReview ? "Mentés..." : "Értékelés mentése" }}
              </button>
            </section>
          </article>
        </div>
      </section>

      <section v-else class="exercise-manager">
        <div class="exercise-manager-header">
          <div>
            <h2>Feladatok kezelése</h2>
            <p>Válassz feladattípust, majd adj hozzá vagy szerkessz feladatokat.</p>
          </div>

          <button
            class="btn-outline btn-small"
            @click="fetchExerciseItems"
            :disabled="isExerciseItemsLoading"
          >
            Frissítés
          </button>
        </div>

        <div class="teacher-exercise-apps">
          <button
            v-for="exerciseType in exerciseTypes"
            :key="exerciseType.type"
            class="teacher-exercise-app"
            :class="{ active: selectedExerciseType === exerciseType.type }"
            @click="selectExerciseType(exerciseType.type)"
          >
            <span :class="['teacher-exercise-icon', exerciseType.iconClass]">
              {{ exerciseType.icon }}
            </span>
            <strong>{{ exerciseType.label }}</strong>
          </button>
        </div>

        <div class="exercise-editor-card">
          <h3>
            {{
              editingExerciseId
                ? selectedExerciseConfig.editTitle
                : selectedExerciseConfig.newTitle
            }}
          </h3>

          <div class="exercise-form-grid">
            <label v-for="field in compactExerciseFields" :key="field.key">
              {{ field.label }}
              <input
                v-model.trim="newExercise[field.key]"
                type="text"
                :placeholder="field.placeholder"
              />
            </label>
          </div>

          <label
            v-for="field in fullExerciseFields"
            :key="field.key"
            class="exercise-field"
          >
            {{ field.label }}
            <textarea
              v-if="field.type === 'textarea'"
              v-model.trim="newExercise[field.key]"
              :placeholder="field.placeholder"
            ></textarea>

            <input
              v-else
              v-model.trim="newExercise[field.key]"
              type="text"
              :placeholder="field.placeholder"
            />
          </label>

          <button
            class="send-teacher-note-btn"
            @click="saveExercise"
            :disabled="isExerciseSaving || !canSaveExercise"
          >
            {{
              isExerciseSaving
                ? "Mentés..."
                : editingExerciseId
                  ? "Módosítás mentése"
                  : "Feladat hozzáadása"
            }}
          </button>

          <button
            v-if="editingExerciseId"
            class="cancel-edit-btn"
            @click="cancelExerciseEdit"
            :disabled="isExerciseSaving"
          >
            Mégse
          </button>
        </div>

        <div class="exercise-list-card">
          <div class="exercise-list-header">
            <div>
              <h3>{{ selectedExerciseConfig.label }} feladatlista</h3>
              <p>
                Tanári feladat:
                <strong>{{ exerciseItems.length }}</strong>
                · Alap feladatbank:
                <strong>{{ baseExerciseItems.length }}</strong>
              </p>
            </div>

            <button class="btn-outline btn-small" @click="showBaseExercises = !showBaseExercises">
              {{ showBaseExercises ? "Alap feladatok elrejtése" : "Alap feladatok mutatása" }}
            </button>
          </div>

          <div v-if="isExerciseItemsLoading" class="empty-text">
            Feladatok betöltése...
          </div>

          <div v-else-if="!visibleExerciseItems.length" class="empty-text">
            Még nincs {{ selectedExerciseConfig.label }} feladat.
          </div>

          <div v-else class="exercise-item-list">
            <article
              v-for="item in visibleExerciseItems"
              :key="item.id"
              class="exercise-item-row"
              :class="{
                inactive: !item.is_active,
                'base-exercise-row': item.isBaseExercise,
              }"
            >
              <div>
                <div class="exercise-item-meta">
                  <span>{{ selectedExerciseConfig.label }}</span>
                  <span>{{ item.isBaseExercise ? "Alap feladat" : "Tanári feladat" }}</span>
                  <span v-if="getExerciseMeta(item)">{{ getExerciseMeta(item) }}</span>
                  <span>{{ item.is_active ? "Aktív" : "Inaktív" }}</span>
                </div>

                <strong>{{ getExercisePrimaryText(item) }}</strong>
                <small>{{ getExerciseSecondaryText(item) }}</small>
              </div>

              <div class="exercise-row-actions">
                <button
                  v-if="!item.isBaseExercise"
                  class="btn-outline btn-small"
                  @click="startExerciseEdit(item)"
                >
                  Szerkesztés
                </button>

                <button
                  v-if="!item.isBaseExercise"
                  class="btn-outline btn-small"
                  @click="deactivateExercise(item.id)"
                  :disabled="!item.is_active"
                >
                  Deaktiválás
                </button>

                <span v-if="item.isBaseExercise" class="readonly-exercise-label">
                  Beépített
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
import { formatDate, getTaskName } from "../utils/formatters";
import {
  createTeacherNote,
  fetchTeacherStudents,
  fetchTeacherStudentFiles,
  fetchTeacherStudentNotes,
  fetchTeacherStudentResults,
  fetchTeacherOverview,
} from "../services/teacherService";
import {
  createExerciseItem,
  deactivateExerciseItem,
  fetchTeacherExerciseItems,
  updateExerciseItem,
} from "../services/exerciseItemService";
import {
  fetchTeacherWritingSubmissions,
  reviewWritingSubmission,
  updateWritingSubmissionStatus,
} from "../services/writingSubmissionService";
import {
  createHomeworkAssignment,
  fetchTeacherHomeworkAssignments,
} from "../services/homeworkService";
import verbsData from "../data/verbs.json";
import nomenData from "../data/nomen.json";
import adjektivData from "../data/adjektiv.json";
import { praepositionenData } from "../data/praepositionen";
import { konnektorenData } from "../data/konnektoren";
import { sichVerbenData } from "../data/sichVerben";

export default {
  name: "TeacherDashboard",

  props: {
    initialSection: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      activeTeacherSection: null,
      students: [],
      selectedStudent: null,

      studentNotes: [],
      studentFiles: [],
      studentResults: [],
      studentAlerts: [],
      studentWeakTopics: [],
      studentTrend: {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      },

      studentStats: {
        accuracy: 0,
        totalDone: 0,
      },
      teacherOverview: {
        activeTodayCount: 0,
        inactiveCount: 0,
        inactiveStudents: [],
        attentionStudents: [],
        weakestTopic: null,
        totalResults: 0,
      },

      teacherNoteText: "",
      isSendingTeacherNote: false,

      isLoading: false,
      isStudentDataLoading: false,

      exerciseItems: [],
      isExerciseItemsLoading: false,
      isExerciseSaving: false,
      writingSubmissions: [],
      selectedWritingSubmission: null,
      isWritingSubmissionsLoading: false,
      writingSubmissionSetupError: false,
      writingReviewGrade: "",
      writingReviewFeedback: "",
      isSavingWritingReview: false,
      homeworkAssignments: [],
      isSavingHomework: false,
      newHomework: {
        studentId: "",
        type: "writing",
        practiceType: "adjektiv",
        title: "",
        instructions: "",
        expectedWordCount: 120,
        targetCount: 10,
        dueAt: "",
      },
      showBaseExercises: false,
      selectedExerciseType: "perfekt",
      exerciseTypes: [
        {
          type: "perfekt",
          label: "Perfekt",
          icon: "🚀",
          iconClass: "perfekt",
          newTitle: "Új Perfekt feladat",
          editTitle: "Perfekt feladat szerkesztése",
        },
        {
          type: "nomen-verb",
          label: "Nomen-Verb",
          icon: "📚",
          iconClass: "nomen",
          newTitle: "Új Nomen-Verb feladat",
          editTitle: "Nomen-Verb feladat szerkesztése",
        },
        {
          type: "adjektiv",
          label: "Adjektiv",
          icon: "🎨",
          iconClass: "adjektiv",
          newTitle: "Új Adjektiv feladat",
          editTitle: "Adjektiv feladat szerkesztése",
        },
        {
          type: "praeposition",
          label: "Präpositionen",
          icon: "🔗",
          iconClass: "praeposition",
          newTitle: "Új Präposition feladat",
          editTitle: "Präposition feladat szerkesztése",
        },
        {
          type: "konnektoren",
          label: "Konnektoren",
          icon: "🔀",
          iconClass: "konnektoren",
          newTitle: "Új Konnektoren feladat",
          editTitle: "Konnektoren feladat szerkesztése",
        },
        {
          type: "sich-verben",
          label: "Sich-Verben",
          icon: "🪞",
          iconClass: "sich",
          newTitle: "Új Sich-Verben feladat",
          editTitle: "Sich-Verben feladat szerkesztése",
        },
      ],
      newExercise: {
        verb: "",
        auxiliary: "hat",
        pastParticiple: "",
        nomen: "",
        context: "",
        article: "",
        adj: "",
        noun: "",
        case: "",
        rule: "",
        preposition: "",
        caseType: "",
        example: "",
        gapSentence: "",
        level: "B1",
        category: "",
        sentence: "",
        optionsText: "",
        correct: "",
        meaning: "",
        explanation: "",
        grammarTip: "",
        infinitive: "",
        answer: "",
      },
      editingExerciseId: null,
    };
  },

  computed: {
    selectedExerciseConfig() {
      return (
        this.exerciseTypes.find((item) => item.type === this.selectedExerciseType) ||
        this.exerciseTypes[0]
      );
    },

    currentTeacherId() {
      return this.$root?.userSession?.id || null;
    },

    activeTeacherSectionTitle() {
      const titles = {
        students: "Diákkezelő",
        exercises: "Feladatkezelő",
        writings: "Beküldött írások",
      };

      return titles[this.activeTeacherSection] || "Tanári felület";
    },

    activeTeacherSectionDescription() {
      const descriptions = {
        students: "Diákok áttekintése, teljesítmény és tanári jegyzetek.",
        exercises: "Nem ÖSD feladatok szerkesztése és bővítése.",
        writings: "ÖSD levelek és fogalmazások áttekintése, javítási állapottal.",
      };

      return descriptions[this.activeTeacherSection] || "";
    },

    exerciseFields() {
      const fieldsByType = {
        perfekt: [
          { key: "verb", label: "Ige *", placeholder: "gehen" },
          { key: "auxiliary", label: "Segédige *", placeholder: "ist" },
          { key: "pastParticiple", label: "Partizip II *", placeholder: "gegangen" },
          { key: "meaning", label: "Jelentés", placeholder: "megy" },
        ],
        "nomen-verb": [
          { key: "nomen", label: "Nomen *", placeholder: "eine Entscheidung" },
          { key: "verb", label: "Verb *", placeholder: "treffen" },
          { key: "meaning", label: "Jelentés", placeholder: "sich entscheiden" },
          {
            key: "example",
            label: "Példamondat",
            placeholder: "Wir müssen eine Entscheidung treffen.",
            type: "textarea",
          },
          {
            key: "translation",
            label: "Fordítás",
            placeholder: "Döntést kell hoznunk.",
            type: "textarea",
          },
        ],
        adjektiv: [
          { key: "context", label: "Kontextus *", placeholder: "Das ist" },
          { key: "article", label: "Névelő *", placeholder: "der" },
          { key: "adj", label: "Melléknév *", placeholder: "alt" },
          { key: "noun", label: "Főnév *", placeholder: "Schlüssel" },
          { key: "correct", label: "Helyes válasz *", placeholder: "der alte Schlüssel" },
          { key: "case", label: "Eset", placeholder: "Nominativ" },
          { key: "rule", label: "Szabály", placeholder: "Határozott (Hímnem)" },
        ],
        praeposition: [
          { key: "verb", label: "Ige *", placeholder: "warten" },
          { key: "preposition", label: "Prepozíció *", placeholder: "auf" },
          { key: "caseType", label: "Eset", placeholder: "Akk" },
          { key: "meaning", label: "Jelentés", placeholder: "várni valamire" },
          {
            key: "example",
            label: "Példamondat",
            placeholder: "Immer muss man auf dich warten.",
            type: "textarea",
          },
          {
            key: "gapSentence",
            label: "Hiányos mondat *",
            placeholder: "Immer muss man ___ dich warten.",
            type: "textarea",
          },
        ],
        konnektoren: [
          { key: "level", label: "Szint", placeholder: "B1" },
          { key: "category", label: "Kategória", placeholder: "kausal" },
          {
            key: "sentence",
            label: "Mondat *",
            placeholder: "Ich bleibe zu Hause, _____ ich krank bin.",
            type: "textarea",
          },
          {
            key: "optionsText",
            label: "Válaszlehetőségek vesszővel elválasztva *",
            placeholder: "weil, obwohl, trotzdem, während",
          },
          { key: "correct", label: "Helyes válasz *", placeholder: "weil" },
          { key: "meaning", label: "Jelentés", placeholder: "mert" },
          {
            key: "explanation",
            label: "Magyarázat",
            placeholder: "A weil okot fejez ki.",
            type: "textarea",
          },
          {
            key: "grammarTip",
            label: "Nyelvtani tipp",
            placeholder: "weil után az ige a mellékmondat végére kerül.",
            type: "textarea",
          },
        ],
        "sich-verben": [
          { key: "infinitive", label: "Alapige *", placeholder: "sich freuen auf" },
          { key: "meaning", label: "Jelentés", placeholder: "örülni valaminek" },
          {
            key: "sentence",
            label: "Hiányos mondat *",
            placeholder: "Ich _____ auf den Urlaub.",
            type: "textarea",
          },
          { key: "answer", label: "Helyes válasz *", placeholder: "freue mich" },
          {
            key: "optionsText",
            label: "Alternatív válaszok vesszővel elválasztva",
            placeholder: "freue mich sehr, freue mich darauf",
          },
          {
            key: "explanation",
            label: "Magyarázat",
            placeholder: "Ich esetén a reflexív névmás: mich.",
            type: "textarea",
          },
        ],
      };

      return fieldsByType[this.selectedExerciseType] || [];
    },

    compactExerciseFields() {
      return this.exerciseFields.filter((field) => field.type !== "textarea");
    },

    fullExerciseFields() {
      return this.exerciseFields.filter((field) => field.type === "textarea");
    },

    canSaveExercise() {
      const requiredFieldsByType = {
        perfekt: ["verb", "auxiliary", "pastParticiple"],
        "nomen-verb": ["nomen", "verb"],
        adjektiv: ["context", "article", "adj", "noun", "correct"],
        praeposition: ["verb", "preposition", "gapSentence"],
        konnektoren: ["sentence", "optionsText", "correct"],
        "sich-verben": ["infinitive", "sentence", "answer"],
      };

      const requiredFields = requiredFieldsByType[this.selectedExerciseType] || [];

      return requiredFields.every((field) => this.newExercise[field]?.trim());
    },

    baseExerciseData() {
      const itemsByType = {
        perfekt: verbsData,
        "nomen-verb": nomenData,
        adjektiv: adjektivData,
        praeposition: praepositionenData,
        konnektoren: konnektorenData,
        "sich-verben": sichVerbenData,
      };

      return itemsByType[this.selectedExerciseType] || [];
    },

    baseExerciseItems() {
      return this.baseExerciseData.map((payload, index) => ({
        id: `base-${this.selectedExerciseType}-${payload.id || index}`,
        type: this.selectedExerciseType,
        title: this.getExerciseTitle(payload),
        payload,
        is_active: true,
        isBaseExercise: true,
      }));
    },

    visibleExerciseItems() {
      return this.showBaseExercises
        ? [...this.exerciseItems, ...this.baseExerciseItems]
        : this.exerciseItems;
    },

    canSaveHomework() {
      return Boolean(
        this.newHomework.studentId &&
          this.newHomework.title?.trim() &&
          this.newHomework.instructions?.trim(),
      );
    },

    teacherFocusTitle() {
      const attentionStudent = this.teacherOverview.attentionStudents[0];

      if (attentionStudent) {
        return `${attentionStudent.name} most figyelmet kér`;
      }

      if (this.teacherOverview.inactiveStudents.length) {
        return "Van pár csendesebb diák";
      }

      if (this.teacherOverview.weakestTopic) {
        return `${this.teacherOverview.weakestTopic.label} lehet a mai fókusz`;
      }

      return "Kezdd egy gyors ellenőrzéssel";
    },

    teacherFocusText() {
      const attentionStudent = this.teacherOverview.attentionStudents[0];

      if (attentionStudent) {
        return `Érdemes ránézni: ${attentionStudent.reason}. Innen gyorsan tudsz jegyzetet írni vagy célzott feladatot adni.`;
      }

      if (this.teacherOverview.inactiveStudents.length) {
        return `${this.teacherOverview.inactiveStudents.join(", ")} nem volt aktív az elmúlt 7 napban.`;
      }

      if (this.teacherOverview.weakestTopic) {
        return `Az elmúlt 30 nap alapján ez a leggyengébb közös téma: ${this.teacherOverview.weakestTopic.accuracy}%.`;
      }

      return "Nyisd meg a diákkezelőt, vagy készíts egy rövid gyakorlófeladatot a következő órára.";
    },
  },

  async mounted() {
    await this.fetchStudents();

    if (this.initialSection) {
      await this.openTeacherSection(this.initialSection);
    }
  },

  watch: {
    async initialSection(section) {
      if (section) {
        await this.openTeacherSection(section);
      }
    },

    selectedWritingSubmission(submission) {
      this.writingReviewGrade = submission?.grade || "";
      this.writingReviewFeedback = submission?.teacher_feedback || "";
    },
  },

  methods: {
    async openTeacherSection(section) {
      this.activeTeacherSection = section;

      if (section === "exercises" && !this.exerciseItems.length) {
        await this.fetchExerciseItems();
      }

      if (section === "writings" && !this.writingSubmissions.length) {
        await Promise.all([
          this.fetchWritingSubmissions(),
          this.fetchHomeworkAssignments(),
        ]);
      }
    },

    async openStudentFromOverview(studentId) {
      const student = this.students.find((item) => item.id === studentId);

      if (!student) return;

      this.activeTeacherSection = "students";
      await this.selectStudent(student);
    },

    goToTeacherPortal() {
      this.activeTeacherSection = null;
      this.clearSelectedStudent();
      this.selectedWritingSubmission = null;
      this.resetExerciseForm();
    },

    async fetchStudents() {
      this.isLoading = true;

      try {
        this.students = await fetchTeacherStudents();
        await Promise.all([
          this.fetchTeacherOverview(),
          this.fetchWritingSubmissions(),
          this.fetchHomeworkAssignments(),
        ]);
      } catch (error) {
        console.error("Hiba a diákok lekérésekor:", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTeacherOverview() {
      try {
        this.teacherOverview = await fetchTeacherOverview(this.students);
      } catch (error) {
        console.error("Tanári áttekintés lekérési hiba:", error.message);
      }
    },

    async fetchWritingSubmissions() {
      this.isWritingSubmissionsLoading = true;
      this.writingSubmissionSetupError = false;

      try {
        this.writingSubmissions = await fetchTeacherWritingSubmissions();
        this.selectedWritingSubmission = this.writingSubmissions[0] || null;
      } catch (error) {
        console.error("Beküldött írások lekérési hiba:", error.message);
        this.writingSubmissionSetupError = error.message?.includes("writing_submissions");
      } finally {
        this.isWritingSubmissionsLoading = false;
      }
    },

    async fetchHomeworkAssignments() {
      try {
        this.homeworkAssignments = await fetchTeacherHomeworkAssignments();
      } catch (error) {
        console.error("Kiadott házik lekérési hiba:", error.message);
      }
    },

    async saveHomeworkAssignment() {
      if (!this.canSaveHomework || this.isSavingHomework) return;

      this.isSavingHomework = true;

      try {
        const assignment = await createHomeworkAssignment({
          teacherId: this.currentTeacherId,
          studentId: this.newHomework.studentId,
          type: this.newHomework.type,
          practiceType:
            this.newHomework.type === "practice" ? this.newHomework.practiceType : null,
          title: this.newHomework.title,
          instructions: this.newHomework.instructions,
          expectedWordCount:
            this.newHomework.type === "writing"
              ? this.newHomework.expectedWordCount
              : null,
          targetCount:
            this.newHomework.type === "practice" ? this.newHomework.targetCount : null,
          dueAt: this.newHomework.dueAt
            ? new Date(this.newHomework.dueAt).toISOString()
            : null,
        });

        if (assignment) {
          await this.fetchHomeworkAssignments();
        }

        this.newHomework = {
          studentId: "",
          type: "writing",
          practiceType: "adjektiv",
          title: "",
          instructions: "",
          expectedWordCount: 120,
          targetCount: 10,
          dueAt: "",
        };
      } catch (error) {
        console.error("Házi kiadási hiba:", error.message);
        alert("Nem sikerült kiadni a házit.");
      } finally {
        this.isSavingHomework = false;
      }
    },

    async changeWritingSubmissionStatus(submission, status) {
      try {
        const updated = await updateWritingSubmissionStatus(submission.id, status);

        this.writingSubmissions = this.writingSubmissions.map((item) =>
          item.id === submission.id ? { ...item, status: updated.status } : item,
        );
        this.selectedWritingSubmission = {
          ...this.selectedWritingSubmission,
          status: updated.status,
        };
      } catch (error) {
        console.error("Beküldött írás státusz hiba:", error.message);
        alert("Nem sikerült módosítani a státuszt.");
      }
    },

    async saveWritingReview() {
      if (!this.selectedWritingSubmission || this.isSavingWritingReview) {
        return;
      }

      this.isSavingWritingReview = true;

      try {
        const updated = await reviewWritingSubmission(this.selectedWritingSubmission.id, {
          grade: this.writingReviewGrade,
          teacherFeedback: this.writingReviewFeedback,
        });

        this.writingSubmissions = this.writingSubmissions.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        this.selectedWritingSubmission = {
          ...this.selectedWritingSubmission,
          ...updated,
        };
      } catch (error) {
        console.error("Írás értékelési hiba:", error.message);
        alert("Nem sikerült menteni az értékelést.");
      } finally {
        this.isSavingWritingReview = false;
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
      if (assignment.type === "practice") {
        return `Gyakorló: ${assignment.practice_type || "feladat"}`;
      }

      return "Fogalmazás / levélírás";
    },

    async selectStudent(student) {
      this.selectedStudent = student;
      this.isStudentDataLoading = true;

      this.teacherNoteText = "";
      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
      this.studentAlerts = [];
      this.studentWeakTopics = [];
      this.studentTrend = {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      };

      this.studentStats = {
        accuracy: 0,
        totalDone: 0,
      };

      await Promise.all([
        this.fetchStudentNotes(student.id),
        this.fetchStudentFiles(student.id),
        this.fetchStudentResults(student.id),
      ]);

      this.isStudentDataLoading = false;
    },

    clearSelectedStudent() {
      this.selectedStudent = null;
      this.teacherNoteText = "";
      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
      this.studentAlerts = [];
      this.studentWeakTopics = [];
      this.studentTrend = {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      };

      this.studentStats = {
        accuracy: 0,
        totalDone: 0,
      };
    },

    async fetchStudentNotes(studentId) {
      try {
        this.studentNotes = await fetchTeacherStudentNotes(studentId);
      } catch (error) {
        console.error("Diák jegyzetek lekérési hiba:", error.message);
      }
    },

    async sendTeacherNote() {
      if (!this.selectedStudent?.id || !this.teacherNoteText.trim()) {
        return;
      }

      this.isSendingTeacherNote = true;

      try {
        const note = await createTeacherNote(
          this.selectedStudent.id,
          this.teacherNoteText,
        );

        if (note) {
          this.studentNotes.unshift(note);
        }

        this.teacherNoteText = "";
      } catch (error) {
        console.error("Tanári jegyzet mentési hiba:", error.message);
        alert("Nem sikerült elküldeni a jegyzetet.");
      } finally {
        this.isSendingTeacherNote = false;
      }
    },

    async fetchStudentFiles(studentId) {
      try {
        this.studentFiles = await fetchTeacherStudentFiles(studentId);
      } catch (error) {
        console.error("Diák fájlok lekérési hiba:", error.message);
      }
    },

    async fetchStudentResults(studentId) {
      try {
        const { results, stats, alerts, weakTopics, trend } =
          await fetchTeacherStudentResults(studentId);

        this.studentResults = results;
        this.studentStats = stats;
        this.studentAlerts = alerts;
        this.studentWeakTopics = weakTopics;
        this.studentTrend = trend;
      } catch (error) {
        console.error("Diák statisztika lekérési hiba:", error.message);
      }
    },

    async fetchExerciseItems() {
      this.isExerciseItemsLoading = true;

      try {
        this.exerciseItems = await fetchTeacherExerciseItems(this.selectedExerciseType);
      } catch (error) {
        console.error("Feladatok lekérési hiba:", error.message);
      } finally {
        this.isExerciseItemsLoading = false;
      }
    },

    async selectExerciseType(type) {
      if (this.selectedExerciseType === type) return;

      this.selectedExerciseType = type;
      this.showBaseExercises = false;
      this.resetExerciseForm();
      await this.fetchExerciseItems();
    },

    buildExercisePayload() {
      if (this.selectedExerciseType === "perfekt") {
        return {
          verb: this.newExercise.verb.trim(),
          auxiliary: this.newExercise.auxiliary.trim() || "hat",
          pastParticiple: this.newExercise.pastParticiple.trim(),
          meaning: this.newExercise.meaning.trim(),
        };
      }

      if (this.selectedExerciseType === "nomen-verb") {
        return {
          nomen: this.newExercise.nomen.trim(),
          verb: this.newExercise.verb.trim(),
          meaning: this.newExercise.meaning.trim(),
          example: this.newExercise.example.trim(),
          translation: this.newExercise.translation.trim(),
        };
      }

      if (this.selectedExerciseType === "adjektiv") {
        return {
          context: this.newExercise.context.trim(),
          elements: {
            article: this.newExercise.article.trim(),
            adj: this.newExercise.adj.trim(),
            noun: this.newExercise.noun.trim(),
          },
          correct: this.newExercise.correct.trim(),
          case: this.newExercise.case.trim(),
          rule: this.newExercise.rule.trim(),
        };
      }

      if (this.selectedExerciseType === "praeposition") {
        return {
          verb: this.newExercise.verb.trim(),
          preposition: this.newExercise.preposition.trim(),
          caseType: this.newExercise.caseType.trim(),
          meaning: this.newExercise.meaning.trim(),
          example: this.newExercise.example.trim(),
          gapSentence: this.newExercise.gapSentence.trim(),
        };
      }

      if (this.selectedExerciseType === "sich-verben") {
        return {
          infinitive: this.newExercise.infinitive.trim(),
          sentence: this.newExercise.sentence.trim(),
          meaning: this.newExercise.meaning.trim(),
          answer: this.newExercise.answer.trim(),
          alternatives: this.newExercise.optionsText
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean),
          explanation: this.newExercise.explanation.trim(),
        };
      }

      return {
        category: this.newExercise.category.trim() || "egyéb",
        level: this.newExercise.level.trim() || "B1",
        sentence: this.newExercise.sentence.trim(),
        options: this.newExercise.optionsText
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
        correct: this.newExercise.correct.trim(),
        meaning: this.newExercise.meaning.trim(),
        explanation: this.newExercise.explanation.trim(),
        grammarTip: this.newExercise.grammarTip.trim(),
      };
    },

    getExerciseTitle(payload) {
      if (this.selectedExerciseType === "perfekt") {
        return payload.verb;
      }

      if (this.selectedExerciseType === "nomen-verb") {
        return payload.nomen;
      }

      if (this.selectedExerciseType === "adjektiv") {
        return `${payload.context} ${payload.correct}`;
      }

      if (this.selectedExerciseType === "praeposition") {
        return `${payload.verb} + ${payload.preposition}`;
      }

      if (this.selectedExerciseType === "sich-verben") {
        return payload.infinitive || payload.sentence;
      }

      return payload.sentence;
    },

    resetExerciseForm() {
      this.newExercise = {
        verb: "",
        auxiliary: "hat",
        pastParticiple: "",
        nomen: "",
        context: "",
        article: "",
        adj: "",
        noun: "",
        case: "",
        rule: "",
        preposition: "",
        caseType: "",
        example: "",
        gapSentence: "",
        level: "B1",
        category: "",
        sentence: "",
        optionsText: "",
        correct: "",
        meaning: "",
        explanation: "",
        grammarTip: "",
        translation: "",
        infinitive: "",
        answer: "",
      };

      this.editingExerciseId = null;
    },

    startExerciseEdit(item) {
      const payload = item?.payload || {};

      this.editingExerciseId = item.id;
      this.newExercise = {
        verb: payload.verb || "",
        auxiliary: payload.auxiliary || "hat",
        pastParticiple: payload.pastParticiple || "",
        nomen: payload.nomen || "",
        context: payload.context || "",
        article: payload.elements?.article || payload.article || "",
        adj: payload.elements?.adj || payload.adj || "",
        noun: payload.elements?.noun || payload.noun || "",
        case: payload.case || "",
        rule: payload.rule || "",
        preposition: payload.preposition || "",
        caseType: payload.caseType || "",
        example: payload.example || "",
        gapSentence: payload.gapSentence || "",
        level: payload.level || "B1",
        category: payload.category || "",
        sentence: payload.sentence || "",
        optionsText: Array.isArray(payload.options)
          ? payload.options.join(", ")
          : "",
        correct: payload.correct || "",
        meaning: payload.meaning || "",
        explanation: payload.explanation || "",
        grammarTip: payload.grammarTip || "",
        translation: payload.translation || "",
        infinitive: payload.infinitive || "",
        answer: payload.answer || "",
      };
    },

    cancelExerciseEdit() {
      this.resetExerciseForm();
    },

    async saveExercise() {
      if (!this.canSaveExercise) return;

      this.isExerciseSaving = true;

      try {
        const payload = this.buildExercisePayload();
        const title = this.getExerciseTitle(payload);

        if (this.editingExerciseId) {
          await updateExerciseItem(this.editingExerciseId, {
            type: this.selectedExerciseType,
            title,
            payload,
          });
        } else {
          await createExerciseItem({
            type: this.selectedExerciseType,
            title,
            payload,
          });
        }

        this.resetExerciseForm();
        await this.fetchExerciseItems();
      } catch (error) {
        console.error("Feladat mentési hiba:", error.message);
        alert("Nem sikerült menteni a feladatot.");
      } finally {
        this.isExerciseSaving = false;
      }
    },

    async deactivateExercise(itemId) {
      if (!itemId) return;

      const confirmed = confirm("Biztosan deaktiválod ezt a feladatot?");

      if (!confirmed) return;

      try {
        await deactivateExerciseItem(itemId);
        await this.fetchExerciseItems();
      } catch (error) {
        console.error("Feladat deaktiválási hiba:", error.message);
        alert("Nem sikerült deaktiválni a feladatot.");
      }
    },

    getExercisePrimaryText(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") return payload.verb || item.title;
      if (item.type === "nomen-verb") return payload.nomen || item.title;
      if (item.type === "adjektiv") {
        return `${payload.context || ""} ${payload.correct || item.title}`.trim();
      }
      if (item.type === "praeposition") {
        return `${payload.verb || ""} + ${payload.preposition || ""}`.trim() || item.title;
      }
      if (item.type === "sich-verben") {
        return payload.infinitive || item.title;
      }

      return payload.sentence || item.title;
    },

    getExerciseSecondaryText(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") {
        return `${payload.auxiliary || ""} ${payload.pastParticiple || ""} · ${payload.meaning || ""}`;
      }
      if (item.type === "nomen-verb") {
        return `${payload.verb || "-"} · ${payload.meaning || ""}`;
      }
      if (item.type === "adjektiv") {
        return `${payload.case || "-"} · ${payload.rule || ""}`;
      }
      if (item.type === "praeposition") {
        return `${payload.caseType || "-"} · ${payload.gapSentence || ""}`;
      }
      if (item.type === "sich-verben") {
        return `${payload.sentence || ""} · válasz: ${payload.answer || "-"}`;
      }

      return `Helyes válasz: ${payload.correct || "-"}`;
    },

    getExerciseMeta(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") return payload.auxiliary || "";
      if (item.type === "nomen-verb") return payload.verb || "";
      if (item.type === "adjektiv") return payload.case || "";
      if (item.type === "praeposition") return payload.caseType || "";
      if (item.type === "sich-verben") return payload.answer || "";

      return payload.category || payload.level || "";
    },

    getInitial(name) {
      return name?.trim()?.charAt(0)?.toUpperCase() || "S";
    },

    formatDate,
    getTaskName,
  },
};
</script>
