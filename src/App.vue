<template>
  <div id="app">
    <AppHeader
      v-if="!currentMode || windowWidth > 700"
      :header-title="headerTitle"
      :user-session="userSession"
      :is-guest-mode="isGuestMode"
      :user-role="userRole"
      :unread-notifications="unreadNotifications"
      :unread-messages="unreadMessages"
      :is-logging-out="isLoggingOut"
      @go-dashboard="goToDashboard"
      @open-teacher-materials="openTeacherMaterials"
      @open-messages="openMessagesPanel"
      @toggle-notifications="toggleNotificationsMenu"
      @open-profile="setCurrentMode('profile')"
      @logout="handleLogout"
    />

    <main class="content-wrapper">
      <div v-if="!isAuthReady" class="auth-loading-screen">
        <div class="auth-loading-card">
          <strong>Betöltés...</strong>
          <span>Fiók ellenőrzése</span>
        </div>
      </div>

      <!-- BEJELENTKEZÉS / REGISZTRÁCIÓ -->
      <AuthScreen
        v-else-if="!userSession"
        :show-login-form="showLoginForm"
        :is-login-mode="isLoginMode"
        :selected-role-label="selectedRoleLabel"
        :auth-full-name="authFullName"
        :auth-email="authEmail"
        :auth-password="authPassword"
        :is-logging-in="isLoggingIn"
        @open-auth-form="openAuthForm"
        @update:auth-full-name="authFullName = $event"
        @update:auth-email="authEmail = $event"
        @update:auth-password="authPassword = $event"
        @submit-auth-form="submitAuthForm"
        @login="handleLogin"
        @register="handleRegister"
        @set-login-mode="isLoginMode = $event"
        @reset-auth-form="resetAuthForm"
        @continue-as-guest="continueAsGuest"
      />

      <!-- DIÁK DASHBOARD -->
      <!-- DIÁK DASHBOARD -->
      <StudentDashboard
        v-else-if="userRole === 'student' && !currentMode"
        :user-session="userSession"
        :is-guest-mode="isGuestMode"
        :auth-full-name="authFullName"
        :xp-profile="xpProfile"
        :activity-stats="activityStats"
        :activity-calendar="activityCalendar"
        :recent-exercises="recentExercises"
        :user-files="userFiles"
        :is-uploading="isUploading"
        :new-note-text="newNoteText"
        :saved-notes="savedNotes"
        :last30-chart-points="last30ChartPoints"
        :last30-average-percent="last30AveragePercent"
        :last30-correct-answers="last30CorrectAnswers"
        :last30-wrong-answers="last30WrongAnswers"
        :recommended-practice="recommendedPractice"
        :weak-topics="weakTopics"
        :last30-trend="last30Trend"
        @set-mode="setCurrentMode"
        @open-story="openStoryLesson"
        @upload-file="uploadFile"
        @update:new-note-text="newNoteText = $event"
        @save-note="saveNote"
        @delete-note="deleteNote"
        @select-note="selectedNote = $event"
      />

      <!-- TANÁRI FELÜLET -->
      <section
        v-else-if="userRole === 'teacher' && !currentMode"
        class="welcome-screen teacher-dashboard-shell"
      >
        <TeacherDashboard :initial-section="teacherInitialSection" />
      </section>

      <!-- GYAKORLATOK / APP AL-OLDALAK -->
      <!-- GYAKORLATOK / APP AL-OLDALAK -->
      <PracticeScreen
        v-else
        :current-mode="currentMode"
        :header-title="headerTitle"
        :user-session="userSession"
        :is-guest-mode="isGuestMode"
        :user-role="userRole"
        :auth-full-name="authFullName"
        :stats="stats"
        :activity-stats="activityStats"
        :xp-profile="xpProfile"
        :activity-calendar="activityCalendar"
        :recent-exercises="recentExercises"
        :user-files="userFiles"
        :is-uploading="isUploading"
        :new-note-text="newNoteText"
        :saved-notes="savedNotes"
        :last30-chart-points="last30ChartPoints"
        :last30-average-percent="last30AveragePercent"
        :last30-correct-answers="last30CorrectAnswers"
        :last30-wrong-answers="last30WrongAnswers"
        :recommended-practice="recommendedPractice"
        :weak-topics="weakTopics"
        :last30-trend="last30Trend"
        :initial-story-id="selectedStoryId"
        @go-dashboard="goToDashboard"
        @exercise-finished="handleExerciseFinished"
        @logout="handleLogout"
        @set-mode="setCurrentMode"
        @upload-file="uploadFile"
        @update:new-note-text="newNoteText = $event"
        @save-note="saveNote"
        @delete-note="deleteNote"
        @select-note="selectedNote = $event"
      />

      <NoteModal :note="selectedNote" @close="selectedNote = null" />
    </main>

    <MobileBottomNav
      v-if="userSession"
      :is-guest-mode="isGuestMode"
      :user-role="userRole"
      :unread-notifications="unreadNotifications"
      :unread-messages="unreadMessages"
      @go-dashboard="goToDashboard"
      @open-teacher-materials="openTeacherMaterials"
      @open-messages="openMessagesPanel"
      @toggle-notifications="toggleNotificationsMenu"
      @open-profile="setCurrentMode('profile')"
      @logout="handleLogout"
    />

    <NotificationsDropdown
      v-if="userSession && !isGuestMode && showNotificationsMenu"
      :notifications="notifications"
      :unread-notifications="unreadNotifications"
      @mark-all-read="markAllNotificationsRead"
    />

    <MessagesPanel
      v-if="userSession && !isGuestMode && showMessagesPanel"
      :user-session="userSession"
      :user-role="userRole"
      @close="showMessagesPanel = false"
      @messages-read="fetchUnreadMessages"
    />
  </div>
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
import AuthScreen from "./components/auth/AuthScreen.vue";
import StudentDashboard from "./components/student/StudentDashboard.vue";
import NoteModal from "./components/student/NoteModal.vue";
import PracticeScreen from "./components/PracticeScreen.vue";
import TeacherDashboard from "./components/TeacherDashboard.vue";
import NotificationsDropdown from "./components/NotificationsDropdown.vue";
import MessagesPanel from "./components/MessagesPanel.vue";
import { getTaskName } from "./utils/formatters";
import {
  fetchUserNotifications,
  markUserNotificationsRead,
} from "./services/notificationService";
import { fetchUnreadMessageCount } from "./services/messageService";
import {
  fetchUserNotes,
  createUserNote,
  deleteUserNote,
} from "./services/notesService";
import { uploadUserFile, fetchUserFiles } from "./services/filesService";
import { fetchUserProfile, fetchUserXpProfile } from "./services/profileService";
import {
  saveUserDailyActivity,
  fetchUserActivityDays,
} from "./services/activityService";
import { fetchUserExerciseResults } from "./services/statisticsService";
import {
  loginWithPassword,
  registerUser,
  logoutUser,
  getCurrentSession,
  listenToAuthStateChange,
} from "./services/authService";
import {
  getLast30ChartPoints,
  getCorrectAnswers,
  getWrongAnswers,
  getAveragePercent,
  calculateStatsFromResults,
  getLast30Trend,
  getRecommendedPractice,
  getWeakTopics,
} from "./utils/statistics";
import { getDateKey, calculateLoginActivity } from "./utils/activity";

export default {
  name: "App",

  components: {
    AppHeader,
    MobileBottomNav,
    AuthScreen,
    StudentDashboard,
    NoteModal,
    PracticeScreen,
    TeacherDashboard,
    NotificationsDropdown,
    MessagesPanel,
  },

  data() {
    return {
      selectedNote: null,
      windowWidth: window.innerWidth,
      isLoggingIn: false,
      isLoggingOut: false,
      isAuthReady: false,
      currentSessionUserId: null,

      userSession: null,
      userRole: null,
      isGuestMode: false,

      showLoginForm: null,
      isLoginMode: true,

      authListener: null,
      authEmail: "",
      authPassword: "",
      authFullName: "",

      currentMode: null,
      selectedStoryId: null,
      teacherInitialSection: null,

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

      xpProfile: {
        xp: 0,
        level: 1,
        today_xp: 0,
        coins: 0,
      },

      notifications: [],
      unreadNotifications: 0,
      showNotificationsMenu: false,
      unreadMessages: 0,
      showMessagesPanel: false,

      activityCalendar: [],
    };
  },

  computed: {
    last30ChartPoints() {
      return getLast30ChartPoints(this.recentExercises);
    },

    last30CorrectAnswers() {
      return getCorrectAnswers(this.recentExercises);
    },

    last30WrongAnswers() {
      return getWrongAnswers(this.recentExercises);
    },

    last30AveragePercent() {
      return getAveragePercent(this.recentExercises);
    },

    recommendedPractice() {
      return getRecommendedPractice(this.recentExercises);
    },

    weakTopics() {
      return getWeakTopics(this.recentExercises);
    },

    last30Trend() {
      return getLast30Trend(this.recentExercises);
    },

    headerTitle() {
      if (this.currentMode) return this.getTaskName(this.currentMode);

      if (this.userSession) {
        if (this.isGuestMode) return "Vendég mód";

        return this.userRole === "teacher"
          ? "Tanári felület"
          : "Diák dashboard";
      }

      return "Deutsch Übungen";
    },

    selectedRoleLabel() {
      return this.showLoginForm === "teacher" ? "Tanár" : "Diák";
    },
  },

  async mounted() {
    this.updateWindowSize();

    window.addEventListener("resize", this.updateWindowSize);

    try {
      const session = await getCurrentSession();

      if (session) {
        await this.setupUserSession(session);
      } else {
        this.clearUserSession();
      }
    } catch (error) {
      console.error("Auth inicializálási hiba:", error.message);
      this.clearUserSession();
    } finally {
      this.isAuthReady = true;
    }

    this.authListener = listenToAuthStateChange((event, session) => {
      console.log("AUTH:", event);
      this.handleAuthStateChange(event, session);
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateWindowSize);
    this.authListener?.data?.subscription?.unsubscribe();
  },

  methods: {
    async handleAuthStateChange(event, session) {
      if (
        ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event) &&
        session
      ) {
        await this.setupUserSession(session);
      }

      if (event === "SIGNED_OUT") {
        this.clearUserSession();
      }

      this.isAuthReady = true;
    },

    updateWindowSize() {
      this.windowWidth = window.innerWidth;
    },

    scrollToPageTop() {
      this.$nextTick(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    },

    setCurrentMode(mode) {
      this.currentMode = mode;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.showNotificationsMenu = false;
      this.showMessagesPanel = false;
      this.scrollToPageTop();
    },

    openTeacherMaterials() {
      this.currentMode = null;
      this.selectedStoryId = null;
      this.teacherInitialSection = "writings";
      this.showNotificationsMenu = false;
      this.showMessagesPanel = false;
      this.scrollToPageTop();
    },

    openStoryLesson(storyId) {
      this.selectedStoryId = storyId;
      this.currentMode = "story-reading";
      this.teacherInitialSection = null;
      this.showNotificationsMenu = false;
      this.showMessagesPanel = false;
      this.scrollToPageTop();
    },

    goToDashboard() {
      if (!this.userSession) return;

      this.currentMode = null;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.showNotificationsMenu = false;
      this.showMessagesPanel = false;
      this.scrollToPageTop();

      if (this.userRole === "student" && !this.isGuestMode) {
        this.fetchStudentDashboardData();
      }
    },

    async fetchXpProfile() {
      if (!this.userSession?.id) return;

      try {
        this.xpProfile = await fetchUserXpProfile(this.userSession.id);
      } catch (error) {
        console.error("XP profil betöltési hiba:", error.message);
      }
    },

    async handleExerciseFinished() {
      if (this.isGuestMode) return;

      this.activityStats.today = Math.min(this.activityStats.today + 1, 10);
      await this.fetchStatistics();
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

    continueAsGuest() {
      this.isGuestMode = true;
      this.userRole = "student";
      this.userSession = {
        id: null,
        email: "",
        user_metadata: {
          full_name: "Vendég",
          avatar_url: "",
        },
      };
      this.authFullName = "Vendég";
      this.showLoginForm = null;
      this.currentMode = null;
      this.selectedStoryId = null;
      this.scrollToPageTop();
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
        const session = await loginWithPassword(
          this.authEmail,
          this.authPassword,
        );

        if (session) {
          await this.setupUserSession(session);
        }
      } catch (error) {
        alert("Hiba a belépésnél: " + error.message);
      } finally {
        this.isLoggingIn = false;
      }
    },

    async handleRegister() {
      if (
        !this.authEmail ||
        !this.authFullName ||
        this.authPassword.length < 6
      ) {
        alert(
          "Töltsd ki az összes mezőt! A jelszónak minimum 6 karakternek kell lennie.",
        );
        return;
      }

      try {
        const user = await registerUser({
          email: this.authEmail,
          password: this.authPassword,
          role: this.showLoginForm,
          fullName: this.authFullName,
        });

        if (user) {
          await this.saveDailyActivity(user.id);
          alert("Sikeres regisztráció!");
        }
      } catch (error) {
        alert("Hiba a regisztrációnál: " + error.message);
      }
    },

    async handleLogout() {
      if (this.isLoggingOut) return;

      if (this.isGuestMode) {
        this.clearUserSession();
        return;
      }

      this.isLoggingOut = true;

      try {
        await logoutUser();
      } catch (error) {
        console.error("Kilépési hiba:", error.message);
      } finally {
        this.clearUserSession();
        this.isLoggingOut = false;
      }
    },

    async setupUserSession(session) {
      if (!session?.user?.id) return;

      if (this.currentSessionUserId === session.user.id && this.userSession) {
        return;
      }

      this.userSession = session.user;
      this.showLoginForm = null;
      this.currentSessionUserId = session.user.id;

      let profile = null;

      try {
        profile = await fetchUserProfile(session.user.id);
      } catch (error) {
        console.error("Profil betöltési hiba:", error.message);
      }

      this.userRole = profile?.role || session.user.user_metadata?.role || "student";
      this.authFullName =
        profile?.full_name || session.user.user_metadata?.full_name || "";

      await this.saveDailyActivity(session.user.id);
      await this.fetchUnreadMessages();

      if (this.userRole === "student") {
        await this.fetchStudentDashboardData();
      }
    },

    clearUserSession() {
      this.isLoggingIn = false;
      this.isLoggingOut = false;

      this.userSession = null;
      this.userRole = null;
      this.isGuestMode = false;
      this.currentSessionUserId = null;

      this.showLoginForm = null;
      this.isLoginMode = true;

      this.authEmail = "";
      this.authPassword = "";
      this.authFullName = "";

      this.currentMode = null;
      this.selectedNote = null;
      this.selectedStoryId = null;

      this.newNoteText = "";
      this.savedNotes = [];

      this.userFiles = [];
      this.recentExercises = [];

      this.notifications = [];
      this.unreadNotifications = 0;
      this.showNotificationsMenu = false;
      this.unreadMessages = 0;
      this.showMessagesPanel = false;

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

      this.xpProfile = {
        xp: 0,
        level: 1,
        today_xp: 0,
        coins: 0,
      };

      this.activityCalendar = [];
    },

    async fetchStudentDashboardData() {
      await Promise.all([
        this.fetchNotes(),
        this.fetchFiles(),
        this.fetchStatistics(),
        this.fetchActivityStats(),
        this.fetchNotifications(),
        this.fetchXpProfile(),
      ]);
    },

    async fetchNotifications() {
      if (!this.userSession?.id) return;

      try {
        this.notifications = await fetchUserNotifications(this.userSession.id);
        this.unreadNotifications = this.notifications.filter(
          (notification) => !notification.is_read,
        ).length;
      } catch (error) {
        console.error("Értesítések betöltési hiba:", error.message);
      }
    },

    toggleNotificationsMenu() {
      this.showNotificationsMenu = !this.showNotificationsMenu;

      if (this.showNotificationsMenu) {
        this.showMessagesPanel = false;
      }
    },

    openMessagesPanel() {
      this.showMessagesPanel = true;
      this.showNotificationsMenu = false;
    },

    async fetchUnreadMessages() {
      if (!this.userSession?.id) return;

      try {
        this.unreadMessages = await fetchUnreadMessageCount(this.userSession.id);
      } catch (error) {
        console.error("Olvasatlan üzenetek betöltési hiba:", error.message);
      }
    },

    async markAllNotificationsRead() {
      if (!this.userSession?.id) return;

      try {
        await markUserNotificationsRead(this.userSession.id);

        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          is_read: true,
        }));

        this.unreadNotifications = 0;
      } catch (error) {
        console.error("Értesítések olvasottra állítási hiba:", error.message);
      }
    },

    async fetchNotes() {
      if (!this.userSession?.id) return;

      try {
        this.savedNotes = await fetchUserNotes(this.userSession.id);
      } catch (error) {
        console.error("Jegyzetek betöltési hiba:", error.message);
      }
    },

    async saveNote() {
      if (!this.userSession?.id || !this.newNoteText.trim()) return;

      try {
        const note = await createUserNote(
          this.userSession.id,
          this.newNoteText,
        );

        if (note) {
          this.savedNotes.unshift(note);
          this.newNoteText = "";
        }
      } catch (error) {
        alert("Hiba a mentésnél: " + error.message);
      }
    },

    async deleteNote(noteId) {
      if (!noteId || !this.userSession?.id) return;

      const confirmDelete = confirm(
        "Biztosan törölni szeretnéd ezt a jegyzetet?",
      );

      if (!confirmDelete) return;

      try {
        await deleteUserNote(this.userSession.id, noteId);
        this.savedNotes = this.savedNotes.filter((note) => note.id !== noteId);

        if (this.selectedNote?.id === noteId) {
          this.selectedNote = null;
        }
      } catch (error) {
        alert("Hiba a törlésnél: " + error.message);
      }
    },

    async uploadFile(event) {
      const file = event.target.files?.[0];

      if (!file || !this.userSession?.id) return;

      this.isUploading = true;

      try {
        await uploadUserFile(this.userSession.id, file);
        await this.fetchFiles();
      } catch (error) {
        alert("Feltöltési hiba: " + error.message);
      } finally {
        this.isUploading = false;
        event.target.value = "";
      }
    },

    async fetchFiles() {
      if (!this.userSession?.id) return;

      try {
        this.userFiles = await fetchUserFiles(this.userSession.id);
      } catch (error) {
        console.error("Fájlok betöltési hiba:", error.message);
      }
    },

    async fetchStatistics() {
      if (!this.userSession?.id) return;

      try {
        const results = await fetchUserExerciseResults(this.userSession.id);

        this.updateTodayExerciseCount(results);

        const { recentExercises, stats } = calculateStatsFromResults(results);

        this.recentExercises = recentExercises;
        this.stats = stats;
      } catch (error) {
        console.error("Statisztika betöltési hiba:", error.message);
      }
    },

    updateTodayExerciseCount(results) {
      const todayKey = this.getDateKey(new Date());

      const todayExercises = results.filter((item) => {
        if (!item.created_at) return false;

        return this.getDateKey(new Date(item.created_at)) === todayKey;
      });

      this.activityStats.today = todayExercises.length;
    },

    async saveDailyActivity(userId) {
      if (!userId) return;

      const today = this.getDateKey(new Date());

      try {
        await saveUserDailyActivity(userId, today);
      } catch (error) {
        console.error("Napi aktivitás mentési hiba:", error.message);
      }
    },

    async fetchActivityStats() {
      if (!this.userSession?.id) return;

      try {
        const days = await fetchUserActivityDays(this.userSession.id);
        this.calculateLoginActivityStats(days);
      } catch (error) {
        console.error("Aktivitás betöltési hiba:", error.message);
      }
    },

    calculateLoginActivityStats(days) {
      const { activityCalendar, activityStats } = calculateLoginActivity(days);

      this.activityCalendar = activityCalendar;

      this.activityStats = {
        ...this.activityStats,
        ...activityStats,
      };
    },
    getDateKey,
    getTaskName,
  },
};
</script>

<style>
@import "./assets/styles/app.css";
@import "./assets/styles/header.css";
@import "./assets/styles/auth.css";
@import "./assets/styles/notifications.css";
@import "./assets/styles/messages.css";
@import "./assets/styles/note-modal.css";
@import "./assets/styles/dashboard.css";
@import "./assets/styles/student-widgets.css";
@import "./assets/styles/activity-card.css";
@import "./assets/styles/daily-goal.css";
@import "./assets/styles/dashboard-stats.css";
@import "./assets/styles/practice.css";
@import "./assets/styles/practice-layout.css";
@import "./assets/styles/grammar-guide.css";
@import "./assets/styles/mobile-nav.css";
@import "./assets/styles/profile.css";
@import "./assets/styles/teacher-dashboard.css";
</style>
