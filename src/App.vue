<template>
  <div id="app">
    <header class="app-header">
      <button class="logo-btn" @click="goToDashboard" title="Vissza a kezdőlapra">
        D
      </button>

      <div class="current-task-title">
        {{ headerTitle }}
      </div>

      <button
        v-if="userSession"
        class="btn-logout-small"
        @click="handleLogout"
      >
        Kilépés
      </button>

      <div v-else class="header-spacer"></div>
    </header>

    <main class="content-wrapper">
      <!-- SZEREPKÖR VÁLASZTÓ -->
      <section v-if="!userSession && !showLoginForm" class="welcome-screen">
        <h1>Üdvözlünk!</h1>
        <p class="subtitle">Kérjük, válaszd ki a szerepkörödet:</p>

        <div class="menu-grid role-grid">
          <article class="menu-card" @click="openAuthForm('student')">
            <div class="card-icon">🎓</div>
            <h2>Diák vagyok</h2>
            <p>Gyakorlás és fejlődés követése</p>
            <button class="select-btn btn-pill btn-check">Tovább</button>
          </article>

          <article class="menu-card" @click="openAuthForm('teacher')">
            <div class="card-icon">👨‍🏫</div>
            <h2>Tanár vagyok</h2>
            <p>Feladatok és diákok kezelése</p>
            <button class="select-btn btn-pill btn-check">Tovább</button>
          </article>
        </div>
      </section>

      <!-- BEJELENTKEZÉS / REGISZTRÁCIÓ -->
      <section v-else-if="!userSession && showLoginForm" class="welcome-screen">
        <div class="widget-card login-card">
          <h2>
            {{ selectedRoleLabel }}
            {{ isLoginMode ? 'Bejelentkezés' : 'Regisztráció' }}
          </h2>

          <input
            v-if="!isLoginMode"
            v-model.trim="authFullName"
            type="text"
            placeholder="Teljes neved"
            class="simple-input"
          />

          <input
            v-model.trim="authEmail"
            type="email"
            placeholder="E-mail cím"
            class="simple-input"
          />

          <input
            v-model="authPassword"
            type="password"
            placeholder="Jelszó (min. 6 karakter)"
            class="simple-input"
            @keyup.enter="submitAuthForm"
          />

          <button
            v-if="isLoginMode"
            class="select-btn btn-login"
            @click="handleLogin"
          >
            Belépés
          </button>

          <button
            v-else
            class="select-btn btn-register"
            @click="handleRegister"
          >
            Fiók létrehozása
          </button>

          <div class="auth-toggle">
            <p v-if="isLoginMode">
              Nincs még fiókod?
              <a href="#" @click.prevent="isLoginMode = false">
                Regisztrálj itt!
              </a>
            </p>

            <p v-else>
              Már van fiókod?
              <a href="#" @click.prevent="isLoginMode = true">
                Lépj be itt!
              </a>
            </p>
          </div>

          <hr class="divider" />

          <button class="btn-outline btn-back" @click="resetAuthForm">
            ← Vissza a választáshoz
          </button>
        </div>
      </section>

      <!-- DIÁK DASHBOARD -->
      <section
        v-else-if="userRole === 'student' && !currentMode"
        class="dashboard-layout"
      >
        <div class="dashboard-header">
          <h1>Üdvözlünk, {{ authFullName || 'Diák' }}!</h1>
          <p class="subtitle">
            Válassz egy gyakorlatot, vagy tekintsd át a profilodat.
          </p>
        </div>

        <h2 class="section-title">Elérhető leckék</h2>

        <div class="lessons-ios-grid">

  <div class="ios-app" @click="setCurrentMode('perfekt')">
    <div class="ios-icon perfekt">
      🚀
    </div>
    <span>Perfekt</span>
  </div>

  <div class="ios-app" @click="setCurrentMode('nomen-verb')">
    <div class="ios-icon nomen">
      📚
    </div>
    <span>Nomen-Verb</span>
  </div>

  <div class="ios-app" @click="setCurrentMode('adjektiv')">
    <div class="ios-icon adjektiv">
      🎨
    </div>
    <span>Adjektiv</span>
  </div>

  <div class="ios-app" @click="setCurrentMode('osd')">
    <div class="ios-icon osd">
      🇦🇹
    </div>
    <span>ÖSD</span>
  </div>

  <div class="ios-app" @click="setCurrentMode('praeposition')">
  <div class="ios-icon praeposition">
    🔗
  </div>
  <span>Präpositionen</span>
</div>

<div class="ios-app" @click="setCurrentMode('konnektoren')">
  <div class="ios-icon konnektoren">
    🔀
  </div>
  <span>Konnektoren</span>
</div>

</div>

        <h2 class="section-title section-title-spaced">
          Saját irányítópult
        </h2>

        <div class="dashboard-widgets-auto">
          <article class="widget-card">
            <h3>👤 Profil</h3>

            <div class="profile-info">
              <div class="profile-avatar">🎓</div>

              <div>
                <p>
                  <strong>Név:</strong>
                  <br />
                  {{ authFullName || 'Nincs megadva' }}
                </p>

                <p>
                  <strong>E-mail:</strong>
                  <br />
                  {{ userSession?.email || 'Nincs adat' }}
                </p>
              </div>
            </div>
          </article>

          <article class="widget-card">
            <h3>📊 Statisztikák</h3>

            <div class="stat-row">
              <span>Helyes válaszok:</span>
              <strong>{{ stats.accuracy }}%</strong>
            </div>

            <div class="stat-row">
              <span>Megoldott feladatok:</span>
              <strong>{{ stats.totalDone }} db</strong>
            </div>
          </article>

          <article class="widget-card">
            <h3>🕒 Legutóbbi feladatok</h3>

            <div v-if="recentExercises.length">
              <div
                v-for="task in recentExercises"
                :key="task.id || task.created_at"
                class="recent-task-row"
              >
                <span>{{ getTaskName(task.exercise_type) }}</span>
                <strong>{{ task.score }} / {{ task.max_score }}</strong>
              </div>
            </div>

            <p v-else class="empty-text">
              Még nem oldottál meg feladatot.
            </p>
          </article>

          <article class="widget-card">
            <h3>📝 Gyors jegyzet</h3>

            <textarea
              v-model="newNoteText"
              placeholder="Írd ide a jegyzeted..."
              class="simple-textarea"
            ></textarea>

            <button
              class="select-btn btn-save-note"
              @click="saveNote"
              :disabled="!newNoteText.trim()"
            >
              Mentés
            </button>

            <div v-if="savedNotes.length" class="mini-note-list">
              <div
                v-for="note in savedNotes.slice(0, 2)"
                :key="note.id"
                class="mini-note"
              >
                <small>{{ formatDate(note.created_at) }}</small>
                <p>{{ note.content }}</p>
              </div>
            </div>
          </article>

          <article class="widget-card">
            <h3>📂 Dokumentumok</h3>

            <button
              class="upload-btn"
              @click="triggerFileInput"
              :disabled="isUploading"
            >
              {{ isUploading ? 'Töltés... ⏳' : '+ Új fájl feltöltése' }}
            </button>

            <input
              ref="fileInput"
              type="file"
              class="hidden-file-input"
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
              @change="uploadFile"
            />

            <ul v-if="userFiles.length" class="file-list">
              <li v-for="file in userFiles.slice(0, 3)" :key="file.name">
                📄 {{ file.name }}
              </li>
            </ul>

            <p v-else class="empty-text">
              Nincsenek feltöltött fájlok.
            </p>
          </article>
        </div>
      </section>

      <!-- TANÁRI FELÜLET -->
      <section v-else-if="userRole === 'teacher' && !currentMode" class="welcome-screen">
        <TeacherDashboard />
      </section>

      <!-- GYAKORLATOK -->
      <section v-else class="practice-screen">
        <VerbPractice v-if="currentMode === 'perfekt'" />
        <NomenVerbPractice v-if="currentMode === 'nomen-verb'" />
        <AdjektivPractice v-if="currentMode === 'adjektiv'" />
        <OsdPractice v-if="currentMode === 'osd'" />
        <PraepositionPractice v-if="currentMode === 'praeposition'" />
        <KonnektorenPractice v-if="currentMode === 'konnektoren'" />
      </section>
    </main>
  </div>
</template>

<script>
import KonnektorenPractice from "./components/KonnektorenPractice.vue";
import PraepositionPractice from "./components/PraepositionPractice.vue";
import VerbPractice from "./components/VerbPractice.vue";
import NomenVerbPractice from "./components/NomenVerbPractice.vue";
import AdjektivPractice from "./components/AdjektivPractice.vue";
import OsdPractice from "./components/OsdPractice.vue";
import TeacherDashboard from "./components/TeacherDashboard.vue";
import { supabase } from "./supabase";


export default {
  name: "App",

  components: {
    VerbPractice,
    NomenVerbPractice,
    AdjektivPractice,
    OsdPractice,
    TeacherDashboard,
    PraepositionPractice,
    KonnektorenPractice,
  },

  data() {
    return {
      userSession: null,
      userRole: null,
      showLoginForm: null,
      isLoginMode: true,
      authEmail: "",
      authPassword: "",
      authFullName: "",
      currentMode: null,
      newNoteText: "",
      savedNotes: [],
      isUploading: false,
      userFiles: [],
      recentExercises: [],
      stats: {
        accuracy: 0,
        totalDone: 0,
      },
    };
  },

  computed: {
    headerTitle() {
      if (this.currentMode) {
        return this.getTaskName(this.currentMode);
      }

      if (this.userSession) {
        return this.userRole === "teacher" ? "Tanári felület" : "Diák dashboard";
      }

      return "Deutsch Übungen";
    },

    selectedRoleLabel() {
      return this.showLoginForm === "teacher" ? "Tanár" : "Diák";
    },
  },

  async mounted() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await this.setupUserSession(session);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await this.setupUserSession(session);
      } else {
        this.clearUserSession();
      }
    });
  },

  methods: {
    setCurrentMode(mode) {
      this.currentMode = mode;
    },

    goToDashboard() {
      if (!this.userSession) return;

      this.currentMode = null;

      if (this.userRole === "student") {
        this.fetchStudentDashboardData();
      }
    },

    resetAuthForm() {
      this.showLoginForm = null;
      this.isLoginMode = true;
      this.authEmail = "";
      this.authPassword = "";
      this.authFullName = "";
    },

    openAuthForm(role) {
      this.showLoginForm = role;
      this.isLoginMode = true;
      this.authEmail = "";
      this.authPassword = "";
      this.authFullName = "";
    },

    submitAuthForm() {
      if (this.isLoginMode) {
        this.handleLogin();
      } else {
        this.handleRegister();
      }
    },

    async handleLogin() {
      if (!this.authEmail || !this.authPassword) {
        alert("Kérlek, add meg az e-mail címedet és a jelszavadat!");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: this.authEmail,
        password: this.authPassword,
      });

      if (error) {
        alert("Hiba a belépésnél: " + error.message);
      }
    },

    async handleRegister() {
      if (!this.authEmail || !this.authFullName || this.authPassword.length < 6) {
        alert("Töltsd ki az összes mezőt! A jelszónak minimum 6 karakternek kell lennie.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: this.authEmail,
        password: this.authPassword,
        options: {
          data: {
            role: this.showLoginForm,
            full_name: this.authFullName,
          },
        },
      });

      if (error) {
        alert("Hiba a regisztrációnál: " + error.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: this.authEmail,
            role: this.showLoginForm,
            full_name: this.authFullName,
          },
        ]);

        if (profileError) {
          alert("A fiók létrejött, de a profil mentése nem sikerült: " + profileError.message);
          return;
        }

        alert("Sikeres regisztráció!");
      }
    },

    async handleLogout() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Hiba a kilépésnél: " + error.message);
        return;
      }

      this.clearUserSession();
    },

    async setupUserSession(session) {
      this.userSession = session.user;
      this.userRole = session.user.user_metadata?.role || "student";
      this.authFullName = session.user.user_metadata?.full_name || "";
      this.showLoginForm = null;

      if (this.userRole === "student") {
        await this.fetchStudentDashboardData();
      }
    },

    clearUserSession() {
      this.userSession = null;
      this.userRole = null;
      this.showLoginForm = null;
      this.isLoginMode = true;
      this.authEmail = "";
      this.authPassword = "";
      this.authFullName = "";
      this.currentMode = null;
      this.newNoteText = "";
      this.savedNotes = [];
      this.userFiles = [];
      this.recentExercises = [];
      this.stats = {
        accuracy: 0,
        totalDone: 0,
      };
    },

    async fetchStudentDashboardData() {
      await Promise.all([
        this.fetchNotes(),
        this.fetchFiles(),
        this.fetchStatistics(),
      ]);
    },

    async fetchNotes() {
      if (!this.userSession?.id) return;

      const { data, error } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", this.userSession.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Jegyzetek betöltési hiba:", error.message);
        return;
      }

      this.savedNotes = data || [];
    },

    async saveNote() {
      if (!this.userSession?.id || !this.newNoteText.trim()) return;

      const { data, error } = await supabase
        .from("user_notes")
        .insert([
          {
            user_id: this.userSession.id,
            content: this.newNoteText.trim(),
          },
        ])
        .select();

      if (error) {
        alert("Hiba a mentésnél: " + error.message);
        return;
      }

      if (data?.[0]) {
        this.savedNotes.unshift(data[0]);
        this.newNoteText = "";
      }
    },

    triggerFileInput() {
      this.$refs.fileInput?.click();
    },

    async uploadFile(event) {
      const file = event.target.files?.[0];

      if (!file || !this.userSession?.id) return;

      this.isUploading = true;

      const fileExtension = file.name.split(".").pop();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${this.userSession.id}/${Date.now()}-${safeFileName}`;

      const { error } = await supabase.storage
        .from("homeworks")
        .upload(filePath, file);

      if (error) {
        alert("Feltöltési hiba: " + error.message);
      } else {
        await this.fetchFiles();
      }

      this.isUploading = false;
      event.target.value = "";
    },

    async fetchFiles() {
      if (!this.userSession?.id) return;

      const { data, error } = await supabase.storage
        .from("homeworks")
        .list(`${this.userSession.id}/`, {
          limit: 20,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (error) {
        console.error("Fájlok betöltési hiba:", error.message);
        return;
      }

      this.userFiles = data
        ? data.filter((file) => file.name !== ".emptyFolderPlaceholder")
        : [];
    },

    async fetchStatistics() {
      if (!this.userSession?.id) return;

      const { data, error } = await supabase
        .from("exercise_results")
        .select("*")
        .eq("user_id", this.userSession.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Statisztika betöltési hiba:", error.message);
        return;
      }

      if (!data?.length) {
        this.recentExercises = [];
        this.stats = {
          accuracy: 0,
          totalDone: 0,
        };
        return;
      }

      this.recentExercises = data.slice(0, 3);
      this.stats.totalDone = data.length;

      let totalScore = 0;
      let totalMaxScore = 0;

      data.forEach((item) => {
        totalScore += Number(item.score) || 0;
        totalMaxScore += Number(item.max_score) || 0;
      });

      this.stats.accuracy = totalMaxScore
        ? Math.round((totalScore / totalMaxScore) * 100)
        : 0;
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
        konnektoren: "Konnektoren",
      };

      return names[type] || "Gyakorlat";
    },
  },
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.logo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background-color: #6c5ce7;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  user-select: none;
}

.logo-btn:hover {
  background-color: #5b4bc4;
  transform: scale(1.05);
}

.current-task-title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
}

.header-spacer {
  width: 50px;
}

.btn-logout-small {
  padding: 6px 15px;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  background: transparent;
  color: #e74c3c;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-logout-small:hover {
  background: #e74c3c;
  color: #fff;
}

.welcome-screen,
.dashboard-layout {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 15px;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 30px;
  color: #fff;
  text-align: center;
}

.dashboard-header h1 {
  margin-bottom: 5px;
}

.subtitle {
  color: #aaa;
}

.section-title {
  display: inline-block;
  margin-bottom: 20px;
  padding-bottom: 5px;
  border-bottom: 2px solid #6c5ce7;
  color: #fff;
  font-size: 1.2rem;
  text-align: left;
}

.section-title-spaced {
  margin-top: 40px;
}

.login-card {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.login-card h2 {
  margin-bottom: 25px;
  color: #fff;
}

.simple-input,
.simple-textarea {
  width: 100%;
  border: 1px solid #444;
  border-radius: 8px;
  background: #222;
  color: #fff;
  box-sizing: border-box;
  font-size: 1rem;
}

.simple-input {
  margin-bottom: 15px;
  padding: 14px;
}

.simple-input:focus,
.simple-textarea:focus {
  outline: none;
  border-color: #6c5ce7;
  background: #2a2a2a;
}

.simple-textarea {
  height: 70px;
  margin-bottom: 10px;
  padding: 10px;
  resize: vertical;
}

.btn-login {
  background-color: #2ecc71;
}

.btn-login:hover {
  background-color: #27ae60;
}

.btn-register {
  background-color: #3498db;
}

.btn-register:hover {
  background-color: #2980b9;
}

.auth-toggle {
  margin-top: 20px;
  color: #aaa;
  font-size: 0.9rem;
}

.auth-toggle a {
  color: #6c5ce7;
  font-weight: 700;
  text-decoration: none;
}

.auth-toggle a:hover {
  text-decoration: underline;
}

.divider {
  margin: 25px 0;
  border: 0;
  border-top: 1px solid #444;
}

.btn-back {
  width: 100%;
  padding: 10px;
  border: 1px solid #888;
  border-radius: 8px;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-back:hover {
  border-color: #fff;
  color: #fff;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 40px;
}

.menu-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid transparent;
  border-radius: 20px;
  background: #2a2a2a;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  cursor: pointer;
  transition: 0.3s ease;
}

.menu-card:hover {
  border-color: #2ecc71;
  transform: translateY(-5px);
}

.card-icon {
  margin-bottom: 10px;
  font-size: 35px;
}

.menu-card h2 {
  margin: 5px 0;
  color: #fff;
  font-size: 1.2rem;
}

.menu-card p {
  margin-bottom: 15px;
  color: #aaa;
  font-size: 0.9rem;
}

.select-btn {
  width: 100%;
  margin-top: auto;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.select-btn:disabled,
.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-card .select-btn,
.btn-save-note {
  background-color: #2ecc71;
}

.dashboard-widgets-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.widget-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 15px;
  background: #2a2a2a;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.widget-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
  color: #fff;
  font-size: 1.1rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #444;
  font-size: 40px;
}

.profile-info p {
  margin: 5px 0;
  color: #ccc;
  font-size: 0.9rem;
}

.profile-info strong {
  color: #fff;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #444;
}

.stat-row:last-child {
  border-bottom: 0;
}

.stat-row strong,
.recent-task-row strong {
  color: #2ecc71;
  font-size: 1.1rem;
}

.recent-task-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  color: #ddd;
  font-size: 0.9rem;
}

.recent-task-row:last-child {
  border-bottom: 0;
}

.mini-note-list {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  background: #1a1a1a;
}

.mini-note {
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
}

.mini-note:last-child {
  border-bottom: 0;
}

.mini-note small {
  color: #888;
  font-size: 0.75rem;
}

.mini-note p {
  margin: 2px 0 0;
  color: #ddd;
  font-size: 0.85rem;
}

.upload-btn {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #2ecc71;
  border-radius: 8px;
  background: transparent;
  color: #2ecc71;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.upload-btn:hover:not(:disabled) {
  background: #2ecc71;
  color: #fff;
}

.hidden-file-input {
  display: none;
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-list li {
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 6px;
  background: #1a1a1a;
  font-size: 0.9rem;
}

.empty-text {
  padding: 10px 0;
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
  text-align: left;
}

.lessons-ios-grid {
  display: flex;
  align-items: flex-start;
  gap: 35px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.ios-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.ios-app:hover {
  transform: translateY(-6px);
}

.ios-icon {
  width: 90px;
  height: 90px;
  border-radius: 28px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 2.2rem;
  color: white;

  backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.15);

  box-shadow:
    0 10px 30px rgba(0,0,0,0.35),
    inset 0 1px 1px rgba(255,255,255,0.15);

  transition: all 0.3s ease;
}

.ios-icon:hover {
  transform: scale(1.08);
}

/* Színek */
.ios-icon.perfekt {
  background: linear-gradient(135deg, #ff9966, #ff5e62);
}

.ios-icon.nomen {
  background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.ios-icon.adjektiv {
  background: linear-gradient(135deg, #c471f5, #fa71cd);
}

.ios-icon.osd {
  background: linear-gradient(135deg, #43cea2, #185a9d);
}

.ios-app span {
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

/* Mobil */
@media (max-width: 700px) {
  .lessons-ios-grid {
    justify-content: center;
    gap: 25px;
  }

  .ios-icon {
    width: 75px;
    height: 75px;
    border-radius: 24px;
    font-size: 1.8rem;
  }

  .ios-app span {
    font-size: 0.85rem;
  }
}

.ios-icon.praeposition {
  background: linear-gradient(135deg, #f7971e, #ffd200);
}

.ios-icon.konnektoren {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
</style>