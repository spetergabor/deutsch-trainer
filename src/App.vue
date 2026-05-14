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
/* =========================
   GLOBAL LAYOUT
========================= */

.dashboard-layout,
.welcome-screen {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 20px 16px 50px;
  box-sizing: border-box;
}

/* =========================
   APPLE IOS HEADER
========================= */

.app-header {
  position: sticky;
  top: 14px;
  z-index: 999;

  width: calc(100% - 30px);
  max-width: 1180px;

  margin: 16px auto 28px;
  padding: 14px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  border-radius: 999px;

  background: rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);

  border: 1px solid rgba(255, 255, 255, 0.14);

  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255,255,255,0.12);

  transition: all 0.3s ease;
}

.logo-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 15px;

  display: flex;
  justify-content: center;
  align-items: center;

  background:
    linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08)),
    linear-gradient(135deg, #667eea, #764ba2);

  color: white;
  font-size: 1.2rem;
  font-weight: 900;

  cursor: pointer;
  transition: all 0.25s ease;

  box-shadow:
    0 8px 24px rgba(102,126,234,0.35),
    inset 0 1px 1px rgba(255,255,255,0.2);
}

.logo-btn:hover {
  transform: scale(1.06);
}

.current-task-title {
  flex: 1;
  text-align: center;

  color: white;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.header-spacer {
  width: 70px;
}

.btn-logout-small {
  padding: 10px 16px;

  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);

  background: rgba(255,255,255,0.08);

  color: white;
  font-weight: 700;

  cursor: pointer;
  transition: all 0.25s ease;

  backdrop-filter: blur(12px);
}

.btn-logout-small:hover {
  background: rgba(231, 76, 60, 0.9);
  border-color: transparent;
}

/* =========================
   TITLES
========================= */

.dashboard-header {
  margin-bottom: 35px;
  text-align: center;
}

.dashboard-header h1 {
  margin-bottom: 8px;

  color: white;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  letter-spacing: -1px;
}

.subtitle {
  color: rgba(255,255,255,0.65);
}

.section-title {
  display: inline-block;

  margin-bottom: 24px;
  padding-bottom: 6px;

  border-bottom: 2px solid rgba(255,255,255,0.15);

  color: white;
  font-size: 1.15rem;
  font-weight: 800;
}

.section-title-spaced {
  margin-top: 50px;
}

/* =========================
   LOGIN CARD
========================= */

.login-card {
  max-width: 430px;
  margin: 0 auto;

  padding: 35px 28px;

  border-radius: 30px;

  background: rgba(255,255,255,0.06);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  border: 1px solid rgba(255,255,255,0.1);

  box-shadow:
    0 18px 40px rgba(0,0,0,0.25);

  text-align: center;
}

.login-card h2 {
  margin-bottom: 28px;
  color: white;
}

/* =========================
   INPUTS
========================= */

.simple-input,
.simple-textarea {
  width: 100%;

  border-radius: 18px;

  border: 1px solid rgba(255,255,255,0.1);

  background: rgba(255,255,255,0.06);

  color: white;

  box-sizing: border-box;

  font-size: 1rem;

  transition: all 0.25s ease;
}

.simple-input {
  padding: 15px;
  margin-bottom: 15px;
}

.simple-textarea {
  padding: 15px;
  min-height: 90px;
  resize: vertical;
}

.simple-input::placeholder,
.simple-textarea::placeholder {
  color: rgba(255,255,255,0.35);
}

.simple-input:focus,
.simple-textarea:focus {
  outline: none;

  border-color: rgba(255,255,255,0.2);

  background: rgba(255,255,255,0.09);

  box-shadow:
    0 0 0 4px rgba(255,255,255,0.05);
}

/* =========================
   BUTTONS
========================= */

.select-btn,
.upload-btn,
.btn-back,
.btn-login,
.btn-register,
.btn-save-note {
  transition: all 0.25s ease;
}

.select-btn,
.btn-login,
.btn-register,
.btn-save-note {
  width: 100%;

  padding: 13px;

  border: none;
  border-radius: 18px;

  color: white;
  font-weight: 800;

  cursor: pointer;
}

.btn-login {
  background: linear-gradient(135deg, #43cea2, #185a9d);
}

.btn-register {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.select-btn,
.btn-save-note {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.select-btn:hover,
.btn-login:hover,
.btn-register:hover,
.btn-save-note:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.btn-back {
  width: 100%;

  padding: 12px;

  border-radius: 16px;

  border: 1px solid rgba(255,255,255,0.15);

  background: rgba(255,255,255,0.05);

  color: rgba(255,255,255,0.7);

  cursor: pointer;
}

.btn-back:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

/* =========================
   AUTH
========================= */

.auth-toggle {
  margin-top: 22px;

  color: rgba(255,255,255,0.55);
  font-size: 0.9rem;
}

.auth-toggle a {
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.auth-toggle a:hover {
  opacity: 0.8;
}

.divider {
  margin: 24px 0;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* =========================
   IOS LESSON GRID
========================= */

.lessons-ios-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  gap: 34px;

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
  width: 92px;
  height: 92px;

  border-radius: 30px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 2.2rem;
  color: white;

  backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.16);

  box-shadow:
    0 14px 34px rgba(0,0,0,0.35),
    inset 0 1px 1px rgba(255,255,255,0.2);

  transition: all 0.28s ease;
}

.ios-icon:hover {
  transform: scale(1.08);
}

/* ICON COLORS */

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

.ios-icon.praeposition {
  background: linear-gradient(135deg, #f7971e, #ffd200);
}

.ios-icon.konnektoren {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.ios-app span {
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  text-align: center;
}

/* =========================
   WIDGETS
========================= */

.dashboard-widgets-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

  gap: 22px;
}

.widget-card {
  padding: 24px;

  border-radius: 28px;

  background: rgba(255,255,255,0.06);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.1);

  box-shadow:
    0 18px 36px rgba(0,0,0,0.24);

  color: white;
}

.widget-card h3 {
  margin-top: 0;
  margin-bottom: 18px;

  padding-bottom: 12px;

  border-bottom: 1px solid rgba(255,255,255,0.08);

  font-size: 1.05rem;
}

/* =========================
   PROFILE
========================= */

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 72px;
  height: 72px;

  border-radius: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(135deg, #667eea, #764ba2);

  font-size: 2rem;

  box-shadow:
    0 10px 30px rgba(102,126,234,0.35);
}

.profile-info p {
  margin: 5px 0;

  color: rgba(255,255,255,0.7);
}

.profile-info strong {
  color: white;
}

/* =========================
   STATS
========================= */

.stat-row,
.recent-task-row {
  display: flex;
  justify-content: space-between;

  padding: 12px 0;

  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.stat-row:last-child,
.recent-task-row:last-child {
  border-bottom: none;
}

.stat-row strong,
.recent-task-row strong {
  color: #2ecc71;
}

/* =========================
   NOTES
========================= */

.mini-note-list {
  margin-top: 15px;

  padding: 12px;

  border-radius: 18px;

  background: rgba(0,0,0,0.2);
}

.mini-note {
  padding-bottom: 8px;
  margin-bottom: 8px;

  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.mini-note:last-child {
  border-bottom: none;
}

.mini-note small {
  color: rgba(255,255,255,0.4);
}

.mini-note p {
  margin-top: 4px;
  color: rgba(255,255,255,0.8);
}

/* =========================
   FILES
========================= */

.upload-btn {
  width: 100%;

  margin-bottom: 15px;

  padding: 12px;

  border-radius: 18px;

  border: 1px solid rgba(46,204,113,0.35);

  background: rgba(46,204,113,0.08);

  color: #2ecc71;

  font-weight: 700;

  cursor: pointer;
}

.upload-btn:hover {
  background: rgba(46,204,113,0.16);
}

.hidden-file-input {
  display: none;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-list li {
  margin-bottom: 8px;

  padding: 10px 12px;

  border-radius: 14px;

  background: rgba(0,0,0,0.2);

  color: rgba(255,255,255,0.8);
}

.empty-text {
  color: rgba(255,255,255,0.45);
  font-style: italic;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {
  .lessons-ios-grid {
    justify-content: center;
    gap: 24px;
  }

  .ios-icon {
    width: 76px;
    height: 76px;
    border-radius: 24px;
    font-size: 1.8rem;
  }

  .ios-app span {
    font-size: 0.82rem;
  }

  .current-task-title {
    font-size: 0.82rem;
  }

  .app-header {
    padding: 12px 16px;
  }

  .dashboard-layout,
  .welcome-screen {
    padding: 16px 12px 40px;
  }
}
</style>