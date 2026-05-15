<template>
  <div id="app">
<header
  v-if="!currentMode || windowWidth > 700"
  class="app-header"
>      <button class="logo-btn" @click="goToDashboard" title="Vissza a kezdőlapra">
        D
      </button>

<div class="current-task-title">
  {{ headerTitle }}
</div>

<div v-if="userSession" class="desktop-nav-actions">

  <button class="header-nav-btn">
    💬
    <span>Üzenetek</span>
  </button>

  <button class="header-nav-btn">
    🔔
    <span>Értesítés</span>
  </button>

<button
  class="header-nav-btn"
  @click="setCurrentMode('profile')"
>
  👤
  <span>Profil</span>
</button>

  <button
    class="btn-logout-small"
    @click.prevent="handleLogout"
    :disabled="isLoggingOut"
  >
    {{ isLoggingOut ? 'Kilépés...' : 'Kilépés' }}
  </button>

</div>

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
  @click.prevent="handleLogin"
  :disabled="isLoggingIn"
>
  {{ isLoggingIn ? 'Belépés...' : 'Belépés' }}
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
          <article class="widget-card activity-card">
  <div class="activity-header">
    <div>
      <h3>🔥 Aktivitás</h3>
      <p class="activity-subtitle">Tanulási lendület</p>
    </div>

    <div class="streak-badge">
      <span class="fire-icon">🔥</span>
      <strong>{{ activityStats.streak }}</strong>
      <small>nap</small>
    </div>
  </div>

  <div class="activity-stats-row">
    <div>
      <strong>{{ activityStats.today }}</strong>
      <span>ma</span>
    </div>

    <div>
      <strong>{{ activityStats.activeDays }}</strong>
      <span>aktív nap</span>
    </div>

    <div>
      <strong>{{ activityStats.last30Days }}</strong>
      <span>30 nap</span>
    </div>
  </div>

  <div class="activity-grid">
    <div
      v-for="day in activityCalendar"
      :key="day.date"
      class="activity-dot"
      :class="day.level"
      :title="`${day.date}: ${day.count} feladat`"
    ></div>
  </div>
</article>
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
<!-- GYAKORLATOK / APP AL-OLDALAK -->
<section v-else class="practice-screen">

  <!-- csak mobilon -->
  <header class="practice-nav app-header mobile-practice-nav">
    <button class="practice-back-btn" @click="goToDashboard"></button>

    <div class="practice-title">
      {{ headerTitle }}
    </div>

    <div class="practice-nav-spacer"></div>
  </header>

  <VerbPractice v-if="currentMode === 'perfekt'" />
  <NomenVerbPractice v-if="currentMode === 'nomen-verb'" />
  <AdjektivPractice v-if="currentMode === 'adjektiv'" />
  <OsdPractice v-if="currentMode === 'osd'" />
  <PraepositionPractice v-if="currentMode === 'praeposition'" />
  <KonnektorenPractice v-if="currentMode === 'konnektoren'" />

  <ProfileView
    v-if="currentMode==='profile'"
    :userSession="userSession"
    :authFullName="authFullName"
    :stats="stats"
    :activityStats="activityStats"
    @logout="handleLogout"
  />
</section>
    </main>
   <nav v-if="userSession" class="mobile-bottom-nav">
  <button
    class="mobile-nav-item"
    @click="goToDashboard"
  >
    <span class="mobile-nav-icon">🏠</span>
    <span>Főmenü</span>
  </button>

  <button class="mobile-nav-item">
    <span class="mobile-nav-icon">💬</span>
    <span>Üzenetek</span>
  </button>

  <button class="mobile-nav-item">
    <span class="mobile-nav-icon">🔔</span>
    <span>Értesítés</span>
  </button>

<button
  class="mobile-nav-item"
  @click="setCurrentMode('profile')"
>
  <span class="mobile-nav-icon">👤</span>
  <span>Profil</span>
</button>

  <button
    class="mobile-nav-item logout-item"
    @click="handleLogout"
  >
    <span class="mobile-nav-icon">🚪</span>
    <span>Kilépés</span>
  </button>
</nav>
  </div>
</template>

<script>
import ProfileView from "./components/ProfileView.vue";
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
    ProfileView,
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
      windowWidth: window.innerWidth,
      isLoggingIn: false,
      isLoggingOut: false,
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
      activityStats: {
        streak: 0,
        today: 0,
        activeDays: 0,
        last30Days: 0,
      },
      activityCalendar: [],
    };
  },

  computed: {
    headerTitle() {
      if (this.currentMode) return this.getTaskName(this.currentMode);

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
  this.updateWindowSize();

  window.addEventListener(
    "resize",
    this.updateWindowSize
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await this.setupUserSession(session);
  }

  supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        await this.setupUserSession(session);
      } else {
        this.clearUserSession();
      }
    }
  );
},

beforeUnmount() {
  window.removeEventListener(
    "resize",
    this.updateWindowSize
  );
},

  methods: {
    updateWindowSize() {
  this.windowWidth = window.innerWidth;
},
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
  if (this.isLoggingIn) return;

  if (!this.authEmail || !this.authPassword) {
    alert("Kérlek, add meg az e-mail címedet és a jelszavadat!");
    return;
  }

  this.isLoggingIn = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
  email: this.authEmail,
  password: this.authPassword,
});

if (error) {
  alert("Hiba a belépésnél: " + error.message);
  return;
}

if (data?.session) {
  await this.setupUserSession(data.session);
}
  } catch (error) {
    alert("Váratlan hiba a belépésnél: " + error.message);
  } finally {
    this.isLoggingIn = false;
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

        await this.saveDailyActivity(data.user.id);

        alert("Sikeres regisztráció!");
      }
    },

    async handleLogout() {
      if (this.isLoggingOut) return;

      this.isLoggingOut = true;

      try {
        const { error } = await supabase.auth.signOut({
          scope: "local",
        });

        if (error) {
          console.error("Kilépési hiba:", error.message);
        }
      } catch (error) {
        console.error("Kilépési hiba:", error.message);
      } finally {
        this.clearUserSession();
        this.isLoggingOut = false;
      }
    },

    async setupUserSession(session) {
      this.userSession = session.user;
      this.userRole = session.user.user_metadata?.role || "student";
      this.authFullName = session.user.user_metadata?.full_name || "";
      this.showLoginForm = null;

      await this.saveDailyActivity(session.user.id);

      if (this.userRole === "student") {
        await this.fetchStudentDashboardData();
      }
    },

    clearUserSession() {
      this.isLoggingIn = false;
      this.isLoggingOut = false;
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
      this.activityStats = {
        streak: 0,
        today: 0,
        activeDays: 0,
        last30Days: 0,
      };
      this.activityCalendar = [];
    },

    async fetchStudentDashboardData() {
      await Promise.all([
        this.fetchNotes(),
        this.fetchFiles(),
        this.fetchStatistics(),
        this.fetchActivityStats(),
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

      const results = data || [];

      if (!results.length) {
        this.recentExercises = [];
        this.stats = {
          accuracy: 0,
          totalDone: 0,
        };
        return;
      }

      this.recentExercises = results.slice(0, 3);
      this.stats.totalDone = results.length;

      let totalScore = 0;
      let totalMaxScore = 0;

      results.forEach((item) => {
        totalScore += Number(item.score) || 0;
        totalMaxScore += Number(item.max_score) || 0;
      });

      this.stats.accuracy = totalMaxScore
        ? Math.round((totalScore / totalMaxScore) * 100)
        : 0;
    },

    async saveDailyActivity(userId) {
  if (!userId) return;

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("user_daily_activity")
    .upsert(
      {
        user_id: userId,
        activity_date: today,
      },
      {
        onConflict: "user_id,activity_date",
      }
    );

  if (error) {
    console.error("Napi aktivitás mentési hiba:", error.message);
  }
},

    async fetchActivityStats() {
      if (!this.userSession?.id) return;

      const { data, error } = await supabase
        .from("user_daily_activity")
        .select("*")
        .eq("user_id", this.userSession.id)
        .order("activity_date", { ascending: false });

      if (error) {
        console.error("Aktivitás betöltési hiba:", error.message);
        return;
      }

      this.calculateLoginActivityStats(data || []);
    },

    calculateLoginActivityStats(days) {
      const today = new Date();
const todayKey = new Date().toISOString().split("T")[0];
      const activeDates = new Set(days.map((item) => item.activity_date));

      const last42Days = [];
      const last30Days = [];

      for (let i = 41; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const key = this.getDateKey(date);
        const active = activeDates.has(key);

        last42Days.push({
          date: key,
          count: active ? 1 : 0,
          level: active ? "level-3" : "level-0",
        });

        if (i < 30) {
          last30Days.push({
            date: key,
            active,
          });
        }
      }

      let streak = 0;

      for (let i = 0; i < 365; i += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const key = this.getDateKey(date);

        if (activeDates.has(key)) {
          streak += 1;
        } else {
          break;
        }
      }

      this.activityCalendar = last42Days;

this.activityStats = {
  streak: Math.max(streak, activeDates.has(todayKey) ? 1 : 0),
  today: activeDates.has(todayKey) ? 1 : 0,
  activeDays: activeDates.size,
  last30Days: last30Days.filter((day) => day.active).length,
};
    },

    getActivityLevel(count) {
      if (count === 0) return "level-0";
      if (count === 1) return "level-1";
      if (count <= 3) return "level-2";
      if (count <= 6) return "level-3";
      return "level-4";
    },

    getDateKey(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
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
  profile: "Profil",
};

      return names[type] || "Gyakorlat";
    },
  },
};
</script>

<style>
@import "./assets/styles/app.css";
@import "./assets/styles/dashboard.css";
@import "./assets/styles/practice.css";
@import "./assets/styles/mobile-nav.css";
@import "./assets/styles/profile.css";
</style>