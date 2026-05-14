<template>
  <div class="teacher-dashboard">
    <div class="teacher-container">
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
            <span class="student-name">{{ student.full_name || "Névtelen diák" }}</span>
            <span class="student-email">{{ student.email }}</span>
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

            <div class="detail-card">
              <h3>📝 Jegyzetek</h3>

              <div v-if="studentNotes.length">
                <div v-for="note in studentNotes" :key="note.id" class="note-item">
                  <small>{{ formatDate(note.created_at) }}</small>
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
          <div class="empty-icon">👨‍🏫</div>
          <h2>Tanári felület</h2>
          <p>Válassz egy diákot a bal oldali listából.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  name: "TeacherDashboard",

  data() {
    return {
      students: [],
      selectedStudent: null,
      studentNotes: [],
      studentFiles: [],
      studentResults: [],
      studentStats: {
        accuracy: 0,
        totalDone: 0,
      },
      isLoading: false,
      isStudentDataLoading: false,
    };
  },

  async mounted() {
    await this.fetchStudents();
  },

  methods: {
    async fetchStudents() {
      this.isLoading = true;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("full_name", { ascending: true });

        if (error) throw error;

        this.students = data || [];
      } catch (error) {
        console.error("Hiba a diákok lekérésekor:", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async selectStudent(student) {
      this.selectedStudent = student;
      this.isStudentDataLoading = true;

      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
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
      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
      this.studentStats = {
        accuracy: 0,
        totalDone: 0,
      };
    },

    async fetchStudentNotes(studentId) {
      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", studentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Diák jegyzetek lekérési hiba:", error.message);
        return;
      }

      this.studentNotes = data || [];
    },

    async fetchStudentFiles(studentId) {
      const { data, error } = await supabase.storage
        .from("homeworks")
        .list(`${studentId}/`, {
          limit: 50,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (error) {
        console.error("Diák fájlok lekérési hiba:", error.message);
        return;
      }

      const files = (data || []).filter(
        (file) => file.name !== ".emptyFolderPlaceholder"
      );

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const path = `${studentId}/${file.name}`;

          const { data: signedData, error: signedError } =
            await supabase.storage.from("homeworks").createSignedUrl(path, 3600);

          return {
            name: file.name,
            path,
            url: signedError ? "#" : signedData.signedUrl,
          };
        })
      );

      this.studentFiles = filesWithUrls;
    },

    async fetchStudentResults(studentId) {
      const { data, error } = await supabase
        .from("exercise_results")
        .select("*")
        .eq("user_id", studentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Diák statisztika lekérési hiba:", error.message);
        return;
      }

      this.studentResults = data || [];

      if (!data?.length) return;

      let totalScore = 0;
      let totalMaxScore = 0;

      data.forEach((item) => {
        totalScore += Number(item.score) || 0;
        totalMaxScore += Number(item.max_score) || 0;
      });

      this.studentStats = {
        totalDone: data.length,
        accuracy: totalMaxScore
          ? Math.round((totalScore / totalMaxScore) * 100)
          : 0,
      };
    },

    getInitial(name) {
      return name?.trim()?.charAt(0)?.toUpperCase() || "S";
    },

    formatDate(dateString) {
      if (!dateString) return "";

      return new Date(dateString).toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getTaskName(type) {
      const names = {
        perfekt: "Perfekt Gyakorló",
        "nomen-verb": "Nomen-Verb",
        adjektiv: "Adjektivdekl.",
        osd: "ÖSD Gyakorló",
        praeposition: "Präpositionen",
        konnektoren: "Konnektoren Trainer",
      };

      return names[type] || "Gyakorlat";
    },
  },
};
</script>

<style scoped>
.teacher-dashboard {
  width: 100%;
}

.teacher-container {
  display: flex;
  gap: 20px;
  width: 100%;
  min-height: 70vh;
  margin-top: 20px;
}

.student-list {
  flex: 1;
  min-width: 280px;
  padding: 20px;
  overflow-y: auto;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
}

.student-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.student-list-header h2 {
  margin: 0;
  color: #ffffff;
}

.student-count {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
}

.no-students {
  padding: 16px 0;
  color: rgba(255, 255, 255, 0.55);
  font-style: italic;
}

.student-details {
  flex: 2;
  padding: 30px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
}

.student-item {
  display: flex;
  align-items: center;
  gap: 15px;

  margin-bottom: 10px;
  padding: 12px;
  border-radius: 12px;

  cursor: pointer;
  transition: 0.2s ease;
}

.student-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.student-item.active {
  background: #2ecc71;
  color: #ffffff;
}

.avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background: #3498db;
  color: #ffffff;
  font-weight: 800;
}

.student-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.student-name {
  color: #ffffff;
  font-weight: 800;
}

.student-email {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.details-header h1 {
  margin: 0 0 6px;
  color: #ffffff;
  font-size: 1.8rem;
}

.details-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.detail-card {
  padding: 20px;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.detail-card h3 {
  margin: 0 0 10px;
  color: #ffffff;
}

.detail-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.58);
}

.empty-state {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
  opacity: 0.65;
}

.empty-icon {
  margin-bottom: 20px;
  font-size: 4rem;
}

.empty-state h2 {
  margin: 0 0 8px;
  color: #ffffff;
}

.empty-state p {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
}

.btn-small {
  width: auto;
  padding: 9px 16px;
}

@media (max-width: 800px) {
  .teacher-container {
    flex-direction: column;
  }

  .student-list {
    min-width: 0;
  }

  .student-details {
    padding: 22px;
  }

  .details-header {
    flex-direction: column;
  }

  .btn-small {
    width: 100%;
  }
}

.student-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.student-list-header h2 {
  margin: 0;
}

.student-list-header span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.detail-card {
  padding: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-row,
.mini-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.note-item {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: rgba(0,0,0,0.2);
}

.note-item small {
  color: rgba(255,255,255,0.45);
}

.note-item p {
  margin: 6px 0 0;
}

.file-item {
  display: block;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: rgba(0,0,0,0.2);
  color: white;
  text-decoration: none;
}

.file-item:hover {
  background: rgba(255,255,255,0.1);
}

.empty-text {
  color: rgba(255,255,255,0.5);
  font-style: italic;
}

.empty-state.small {
  min-height: 200px;
}
</style>