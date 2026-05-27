<template>
  <div class="teacher-dashboard">
    <section v-if="!activeTeacherSection" class="teacher-portal">
      <div class="teacher-portal-header">
        <div>
          <h1>Munkaterület választása</h1>
          <p>Válaszd ki, mivel szeretnél dolgozni.</p>
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
      </div>
    </section>

    <section v-else class="teacher-workspace">
      <header class="teacher-workspace-header">
        <button class="btn-outline btn-small" @click="goToTeacherPortal">
          ← Vissza
        </button>

        <div>
          <h1>
            {{
              activeTeacherSection === "students"
                ? "Diákkezelő"
                : "Feladatkezelő"
            }}
          </h1>
          <p>
            {{
              activeTeacherSection === "students"
                ? "Diákok áttekintése, teljesítmény és tanári jegyzetek."
                : "Nem ÖSD feladatok szerkesztése és bővítése."
            }}
          </p>
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
} from "../services/teacherService";
import {
  createExerciseItem,
  deactivateExerciseItem,
  fetchTeacherExerciseItems,
  updateExerciseItem,
} from "../services/exerciseItemService";
import verbsData from "../data/verbs.json";
import nomenData from "../data/nomen.json";
import adjektivData from "../data/adjektiv.json";
import { praepositionenData } from "../data/praepositionen";
import { konnektorenData } from "../data/konnektoren";
import { sichVerbenData } from "../data/sichVerben";

export default {
  name: "TeacherDashboard",

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

      teacherNoteText: "",
      isSendingTeacherNote: false,

      isLoading: false,
      isStudentDataLoading: false,

      exerciseItems: [],
      isExerciseItemsLoading: false,
      isExerciseSaving: false,
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
  },

  async mounted() {
    await this.fetchStudents();
  },

  methods: {
    async openTeacherSection(section) {
      this.activeTeacherSection = section;

      if (section === "exercises" && !this.exerciseItems.length) {
        await this.fetchExerciseItems();
      }
    },

    goToTeacherPortal() {
      this.activeTeacherSection = null;
      this.clearSelectedStudent();
      this.resetExerciseForm();
    },

    async fetchStudents() {
      this.isLoading = true;

      try {
        this.students = await fetchTeacherStudents();
      } catch (error) {
        console.error("Hiba a diákok lekérésekor:", error.message);
      } finally {
        this.isLoading = false;
      }
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
