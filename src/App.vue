<template>
  <div
    id="app"
    :class="{
      'with-desktop-sidebar': showDesktopSidebar,
      'mobile-chat-active': isMessagesMobileConversationOpen,
    }"
  >
    <AppHeader
      v-if="showAppHeader"
      :header-title="headerTitle"
      :user-session="userSession"
      :is-guest-mode="isGuestMode"
      :user-role="userRole"
      :unread-notifications="unreadNotifications"
      :unread-messages="unreadMessages"
      :is-logging-out="isLoggingOut"
      :show-back-navigation="showHeaderBackNavigation"
      :back-parent-label="headerBackParentLabel"
      :back-current-label="headerBackCurrentLabel"
      @go-dashboard="goToDashboard"
      @go-back="goNavigationBack"
      @open-teacher-materials="openTeacherMaterials"
      @open-student-materials="openStudentMaterials"
      @open-messages="openMessagesPanel"
      @toggle-notifications="toggleNotificationsMenu"
      @open-profile="setCurrentMode('profile')"
      @logout="handleLogout"
    />

    <DesktopSidebar
      v-if="showDesktopSidebar"
      :user-session="userSession"
      :is-guest-mode="isGuestMode"
      :user-role="userRole"
      :auth-full-name="authFullName"
      :current-mode="currentMode"
      :teacher-active-section="teacherActiveSection"
      :unread-notifications="unreadNotifications"
      :unread-messages="unreadMessages"
      :is-logging-out="isLoggingOut"
      @go-dashboard="goToDashboard"
      @set-mode="setCurrentMode"
      @open-teacher-section="openTeacherSection"
      @open-student-materials="openStudentMaterials"
      @open-messages="openMessagesPanel"
      @toggle-notifications="toggleNotificationsMenu"
      @open-profile="setCurrentMode('profile')"
      @logout="handleLogout"
    />

    <DesktopTopbar
      v-if="showDesktopSidebar"
      :header-title="desktopTopbarTitle"
      :user-role="userRole"
      :can-go-back="canGoDesktopBack"
      :can-go-forward="canGoDesktopForward"
      @go-back="goNavigationBack"
      @go-forward="goDesktopForward"
      @set-mode="setCurrentMode"
      @open-teacher-section="openTeacherSection"
      @open-student-materials="openStudentMaterials"
    />

    <MobileDrawerMenu
      v-if="showMobileStudentDrawer"
      :user-session="userSession"
      :is-guest-mode="isGuestMode"
      :auth-full-name="authFullName"
      :current-mode="currentMode"
      :unread-notifications="unreadNotifications"
      :unread-messages="unreadMessages"
      :is-logging-out="isLoggingOut"
      @go-dashboard="goToDashboard"
      @set-mode="setCurrentMode"
      @open-student-materials="openStudentMaterials"
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

      <MessagesPanel
        v-else-if="currentMode === 'messages' && !isGuestMode"
        :user-session="userSession"
        :user-role="userRole"
        @messages-read="fetchUnreadMessages"
        @mobile-conversation-open-change="isMessagesMobileConversationOpen = $event"
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
        class="welcome-screen teacher-dashboard-shell nemet-page-shell"
      >
        <TeacherDashboard
          :key="teacherDashboardKey"
          :initial-section="teacherInitialSection"
          @section-change="teacherActiveSection = $event"
        />
      </section>

      <!-- GYAKORLATOK / APP AL-OLDALAK -->
      <!-- GYAKORLATOK / APP AL-OLDALAK -->
      <PracticeScreen
        ref="practiceScreen"
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
        :active-homework-assignment="activeHomeworkAssignment"
        @go-dashboard="goToDashboard"
        @go-back="goNavigationBack"
        @exercise-finished="handleExerciseFinished"
        @logout="handleLogout"
        @set-mode="setCurrentMode"
        @open-story="openStoryLesson"
        @start-homework-practice="startHomeworkPractice"
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
      @open-student-materials="openStudentMaterials"
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

  </div>
</template>

<script>
import AppHeader from "./components/AppHeader.vue";
import DesktopSidebar from "./components/DesktopSidebar.vue";
import DesktopTopbar from "./components/DesktopTopbar.vue";
import MobileDrawerMenu from "./components/MobileDrawerMenu.vue";
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
import {
  countHomeworkPracticeResults,
  updateHomeworkStatus,
} from "./services/homeworkService";
import {
  HOMEWORK_STATUS,
  shouldMarkHomeworkStarted,
} from "./utils/homeworkLifecycle";

export default {
  name: "App",

  components: {
    AppHeader,
    DesktopSidebar,
    DesktopTopbar,
    MobileDrawerMenu,
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
      teacherActiveSection: null,
      teacherDashboardKey: 0,
      activeHomeworkAssignment: null,

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
      isMessagesMobileConversationOpen: false,

      activityCalendar: { weeks: [], monthLabels: [], activeDays: 0 },
      navigationBackStack: [],
      navigationForwardStack: [],
      isRestoringNavigation: false,
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

    showDesktopSidebar() {
      return Boolean(this.userSession && this.windowWidth > 900);
    },

    showMobileStudentDrawer() {
      return Boolean(
        this.userSession &&
          this.userRole === "student" &&
          this.windowWidth <= 700 &&
          !this.isMessagesMobileConversationOpen,
      );
    },

    showAppHeader() {
      if (!this.userSession) return false;
      if (this.showDesktopSidebar) return false;

      return !this.currentMode || this.windowWidth > 700;
    },

    headerTitle() {
      if (this.currentMode) return this.getTaskName(this.currentMode);

      if (this.userRole === "teacher" && this.teacherActiveSection) {
        return this.teacherSectionTitle(this.teacherActiveSection);
      }

      if (this.userSession) {
        if (this.isGuestMode) return "Vendég mód";

        return this.userRole === "teacher"
          ? "Tanári felület"
          : "Diák dashboard";
      }

      return "Deutsch Übungen";
    },

    desktopTopbarTitle() {
      if (this.currentMode) return this.getTaskName(this.currentMode);

      if (this.userRole === "teacher" && this.teacherActiveSection) {
        return this.teacherSectionTitle(this.teacherActiveSection);
      }

      if (this.userRole === "teacher") return "Áttekintés";
      if (this.userRole === "student") return "Főmenü";

      return this.headerTitle;
    },

    showHeaderBackNavigation() {
      return Boolean(
        this.currentMode ||
          (this.userRole === "teacher" && this.teacherActiveSection),
      );
    },

    headerBackParentLabel() {
      if (this.userRole === "teacher") return "Tanári felület";
      if (this.isGuestMode) return "Vendég mód";
      return "Diák dashboard";
    },

    headerBackCurrentLabel() {
      if (this.currentMode) return this.getTaskName(this.currentMode);
      if (this.userRole === "teacher" && this.teacherActiveSection) {
        return this.teacherSectionTitle(this.teacherActiveSection);
      }

      return this.headerTitle;
    },

    selectedRoleLabel() {
      return this.showLoginForm === "teacher" ? "Tanár" : "Diák";
    },

    canGoDesktopBack() {
      return this.navigationBackStack.length > 0;
    },

    canGoDesktopForward() {
      return this.navigationForwardStack.length > 0;
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
      const resetScroll = () => {
        const scrollingElement =
          document.scrollingElement || document.documentElement;

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });

        scrollingElement.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetScroll();

      this.$nextTick(() => {
        resetScroll();

        window.requestAnimationFrame(() => {
          resetScroll();
          window.requestAnimationFrame(resetScroll);
        });
      });
    },

    getNavigationSnapshot() {
      return {
        currentMode: this.currentMode,
        selectedStoryId: this.selectedStoryId,
        teacherInitialSection: this.teacherInitialSection,
        teacherActiveSection: this.teacherActiveSection,
        activeHomeworkAssignment: this.activeHomeworkAssignment,
      };
    },

    isSameNavigationSnapshot(first, second) {
      if (!first || !second) return false;

      return (
        first.currentMode === second.currentMode &&
        first.selectedStoryId === second.selectedStoryId &&
        first.teacherInitialSection === second.teacherInitialSection &&
        first.teacherActiveSection === second.teacherActiveSection &&
        (first.activeHomeworkAssignment?.id || null) ===
          (second.activeHomeworkAssignment?.id || null)
      );
    },

    prepareNavigation(targetSnapshot) {
      if (this.isRestoringNavigation || !this.userSession) return;

      const currentSnapshot = this.getNavigationSnapshot();
      if (this.isSameNavigationSnapshot(currentSnapshot, targetSnapshot)) return;

      const lastSnapshot = this.navigationBackStack[this.navigationBackStack.length - 1];
      if (!this.isSameNavigationSnapshot(currentSnapshot, lastSnapshot)) {
        this.navigationBackStack.push(currentSnapshot);
      }

      if (this.navigationBackStack.length > 40) {
        this.navigationBackStack.shift();
      }

      this.navigationForwardStack = [];
    },

    applyNavigationSnapshot(snapshot) {
      if (!snapshot) return;

      this.isRestoringNavigation = true;
      this.currentMode = snapshot.currentMode || null;
      this.selectedStoryId = snapshot.selectedStoryId || null;
      this.teacherInitialSection = snapshot.teacherInitialSection || null;
      this.teacherActiveSection = snapshot.teacherActiveSection || null;
      this.activeHomeworkAssignment = snapshot.activeHomeworkAssignment || null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();

      if (
        this.userRole === "teacher" &&
        !this.currentMode &&
        !this.teacherActiveSection
      ) {
        this.teacherDashboardKey += 1;
      }

      if (
        this.userRole === "student" &&
        !this.isGuestMode &&
        !this.currentMode
      ) {
        this.fetchStudentDashboardData();
      }

      this.$nextTick(() => {
        this.isRestoringNavigation = false;
      });
    },

    goNavigationBack() {
      if (this.$refs.practiceScreen?.goBackOneStep?.()) {
        return;
      }

      if (!this.navigationBackStack.length) {
        this.goToDashboard();
        return;
      }

      const currentSnapshot = this.getNavigationSnapshot();
      const previousSnapshot = this.navigationBackStack.pop();
      this.navigationForwardStack.push(currentSnapshot);
      this.applyNavigationSnapshot(previousSnapshot);
    },

    goDesktopForward() {
      if (!this.navigationForwardStack.length) return;

      const currentSnapshot = this.getNavigationSnapshot();
      const nextSnapshot = this.navigationForwardStack.pop();
      this.navigationBackStack.push(currentSnapshot);
      this.applyNavigationSnapshot(nextSnapshot);
    },

    setCurrentMode(mode) {
      this.prepareNavigation({
        currentMode: mode,
        selectedStoryId: null,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: null,
      });

      this.currentMode = mode;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
    },

    openTeacherMaterials() {
      this.openTeacherSection("writings");
    },

    openTeacherSection(section) {
      this.prepareNavigation({
        currentMode: null,
        selectedStoryId: null,
        teacherInitialSection: section,
        teacherActiveSection: section,
        activeHomeworkAssignment: null,
      });

      this.currentMode = null;
      this.selectedStoryId = null;
      this.teacherInitialSection = section;
      this.teacherActiveSection = section;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
    },

    openStudentMaterials() {
      this.prepareNavigation({
        currentMode: "student-materials",
        selectedStoryId: null,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: null,
      });

      this.currentMode = "student-materials";
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
    },

    async startHomeworkPractice(assignment) {
      if (!assignment?.practice_type) return;

      let activeAssignment = assignment;

      if (shouldMarkHomeworkStarted(assignment.status)) {
        try {
          activeAssignment = await updateHomeworkStatus(
            assignment.id,
            HOMEWORK_STATUS.STARTED,
          );
        } catch (error) {
          console.error("Házi elkezdés státusz hiba:", error.message);
        }
      }

      this.prepareNavigation({
        currentMode: assignment.practice_type,
        selectedStoryId: null,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: activeAssignment,
      });

      this.activeHomeworkAssignment = activeAssignment;
      this.currentMode = assignment.practice_type;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
    },

    openStoryLesson(storyId) {
      this.prepareNavigation({
        currentMode: "story-reading",
        selectedStoryId: storyId,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: null,
      });

      this.selectedStoryId = storyId;
      this.currentMode = "story-reading";
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
    },

    goToDashboard() {
      if (!this.userSession) return;

      this.prepareNavigation({
        currentMode: null,
        selectedStoryId: null,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: null,
      });

      this.currentMode = null;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();

      if (this.userRole === "teacher") {
        this.teacherDashboardKey += 1;
      }

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
      await this.checkActiveHomeworkPracticeProgress();
    },

    async checkActiveHomeworkPracticeProgress() {
      const assignment = this.activeHomeworkAssignment;

      if (
        !assignment ||
        assignment.type !== "practice" ||
        assignment.status === HOMEWORK_STATUS.SUBMITTED ||
        assignment.status === HOMEWORK_STATUS.REVIEWED ||
        assignment.status === HOMEWORK_STATUS.CLOSED
      ) {
        return;
      }

      try {
        const completedCount = await countHomeworkPracticeResults(assignment);
        const targetCount = Number(assignment.target_count) || 0;

        if (targetCount && completedCount >= targetCount) {
          const updated = await updateHomeworkStatus(
            assignment.id,
            HOMEWORK_STATUS.SUBMITTED,
            {
              userId: assignment.teacher_id,
              title: "Gyakorló házi elkészült",
              message: assignment.title || "A diák teljesítette a kiadott gyakorlást.",
            },
          );
          this.activeHomeworkAssignment = updated;
          alert("A gyakorló házi elkészült.");
        }
      } catch (error) {
        console.error("Gyakorló házi haladás ellenőrzési hiba:", error.message);
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
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.navigationBackStack = [];
      this.navigationForwardStack = [];
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
      this.navigationBackStack = [];
      this.navigationForwardStack = [];
      this.isRestoringNavigation = false;

      this.showLoginForm = null;
      this.isLoginMode = true;

      this.authEmail = "";
      this.authPassword = "";
      this.authFullName = "";

      this.currentMode = null;
      this.selectedNote = null;
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;

      this.newNoteText = "";
      this.savedNotes = [];

      this.userFiles = [];
      this.recentExercises = [];

      this.notifications = [];
      this.unreadNotifications = 0;
      this.showNotificationsMenu = false;
      this.unreadMessages = 0;

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

      this.activityCalendar = { weeks: [], monthLabels: [], activeDays: 0 };
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
    },

    openMessagesPanel() {
      if (this.isGuestMode) return;

      this.prepareNavigation({
        currentMode: "messages",
        selectedStoryId: null,
        teacherInitialSection: null,
        teacherActiveSection: null,
        activeHomeworkAssignment: null,
      });

      this.currentMode = "messages";
      this.selectedStoryId = null;
      this.teacherInitialSection = null;
      this.teacherActiveSection = null;
      this.activeHomeworkAssignment = null;
      this.showNotificationsMenu = false;
      this.scrollToPageTop();
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

    teacherSectionTitle(section) {
      const titles = {
        students: "Diákkezelő",
        exercises: "Feladatkezelő",
        writings: "Beküldött írások",
      };

      return titles[section] || "Tanári felület";
    },
  },
};
</script>

<style>
@import "./assets/styles/app.css";
@import "./assets/styles/sidebar.css";
@import "./assets/styles/messages.css";
@import "./assets/styles/dashboard.css";
@import "./assets/styles/practice.css";
@import "./assets/styles/practice-layout.css";
@import "./assets/styles/tailwind-shared.css";
@import "./assets/styles/mobile-nav.css";
@import "./assets/styles/teacher-dashboard.css";

.with-desktop-sidebar .content-wrapper,
#app.with-desktop-sidebar .content-wrapper {
  padding-bottom: 0 !important;
}

.with-desktop-sidebar:has(
    .content-wrapper
      > :is(
        .dashboard-layout,
        .welcome-screen,
        .practice-screen,
        .lesson-room-shell,
        .messages-page
      )
  )
  .desktop-topbar {
  left: calc(
    var(--desktop-shell-left, 317px) + var(--desktop-dashboard-offset, 0px)
  ) !important;
  width: var(
    --desktop-dashboard-width,
    var(--desktop-shell-width, 100%)
  ) !important;
}

#app.with-desktop-sidebar
  .content-wrapper
  > :is(.dashboard-layout, .welcome-screen, .practice-screen, .lesson-room-shell, .nemet-page-shell) {
  margin-bottom: 0 !important;
  padding-bottom: var(--desktop-shell-edge, 18px) !important;
}

#app.with-desktop-sidebar .content-wrapper > .dashboard-layout {
  min-height: calc(
    100vh - var(--desktop-content-top, 102px) -
      var(--desktop-shell-edge, 18px)
  );
  display: flex;
  flex-direction: column;
}

#app.with-desktop-sidebar .dashboard-layout > .dashboard-daily-plan:last-child {
  margin-top: auto !important;
  margin-bottom: 0 !important;
}

#app.with-desktop-sidebar
    .practice-screen
  > :is(
    .nemet-page-shell,
    .profile-page,
    .student-materials-view,
    .student-lessons-view,
    .learning-library-view,
    .grammar-guide-shell,
    .story-reading.practice-container,
    .daily-challenge-practice,
    .vocab-pack-library,
    .desktop-exercise-workspace
  ) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) {
  width: var(--desktop-shell-width, 100%) !important;
  max-width: none !important;
  align-items: stretch !important;
  padding-bottom: var(--desktop-shell-edge, 18px) !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .desktop-exercise-workspace {
  width: 100% !important;
  max-width: none !important;
  margin-top: 0 !important;
  grid-template-columns: minmax(0, 1fr) !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .desktop-exercise-panel {
  display: none !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .desktop-exercise-main {
  width: 100% !important;
  max-width: none !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice .case-selector {
  margin-top: 0 !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice .btn-case {
  min-height: 340px !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice .exam-header,
#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice .back-to-sub {
  display: none !important;
}

#app.with-desktop-sidebar .practice-screen:has(.osd-practice) .osd-practice .content-area {
  width: 100% !important;
  max-width: none !important;
  align-items: stretch !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.osd-practice)
  .osd-practice
  .content-area
  > * {
  width: 100% !important;
  max-width: none !important;
}

#app.with-desktop-sidebar .adjektiv-practice .top-info-wrapper {
  display: none !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  > .desktop-exercise-hero {
  margin-bottom: 14px !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  > .desktop-exercise-workspace {
  margin-top: 0 !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .practice-box {
  margin-top: 18px !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-back-link {
  display: none !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-stage {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  gap: 24px !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-selected-pack {
  width: 100% !important;
  min-height: 116px !important;
  padding: 22px 24px !important;
  border-radius: 28px !important;
  background:
    linear-gradient(135deg, rgba(255, 194, 69, 0.12), transparent 42%),
    rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2) !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-selected-pack
  > span {
  width: 72px !important;
  height: 72px !important;
  border-radius: 22px !important;
  font-size: 2rem !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-selected-pack
  strong {
  font-size: clamp(1.35rem, 1.2vw, 1.75rem) !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-picker {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 24px !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-card {
  min-height: 330px !important;
  padding: 34px !important;
  align-content: start !important;
  gap: 18px !important;
  border-radius: 30px !important;
  background:
    linear-gradient(135deg, rgba(115, 103, 240, 0.13), transparent 48%),
    rgba(255, 255, 255, 0.06) !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-card:nth-child(2) {
  background:
    linear-gradient(135deg, rgba(255, 194, 69, 0.14), transparent 46%),
    rgba(255, 255, 255, 0.06) !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-card
  span {
  width: 86px !important;
  height: 86px !important;
  border-radius: 24px !important;
  font-size: 2rem !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-card
  strong {
  margin-top: auto !important;
  font-size: clamp(1.85rem, 1.8vw, 2.45rem) !important;
}

#app.with-desktop-sidebar
  .practice-screen:has(.vocabulary-practice)
  .vocabulary-practice
  .vocab-mode-card
  small {
  max-width: 34ch !important;
  font-size: clamp(1rem, 0.95vw, 1.15rem) !important;
  line-height: 1.45 !important;
}

@media (max-width: 700px) {
  :root {
    --mobile-page-gutter: 15px;
    --mobile-page-width: calc(100% - (var(--mobile-page-gutter) * 2));
  }

  #app,
  .content-wrapper {
    overflow-x: hidden;
  }

  .content-wrapper {
    align-items: center;
    padding-top: 0;
  }

  #app.mobile-chat-active .content-wrapper {
    padding-bottom: 0 !important;
  }

  #app.mobile-chat-active .messages-page,
  #app.mobile-chat-active .messages-layout,
  #app.mobile-chat-active .messages-conversation {
    height: calc(100dvh - var(--mobile-bottom-nav-height) + 18px) !important;
    min-height: calc(100dvh - var(--mobile-bottom-nav-height) + 18px) !important;
    max-height: calc(100dvh - var(--mobile-bottom-nav-height) + 18px) !important;
  }

  .content-wrapper:has(.vocabulary-practice.is-test-mode) {
    padding-bottom: 0 !important;
  }

  .practice-screen {
    width: 100% !important;
    max-width: none !important;
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .practice-screen:has(.vocabulary-practice):not(:has(.vocab-pack-library)):not(:has(.vocab-mode-stage)) {
    height: 100dvh !important;
    min-height: 100dvh !important;
    overflow: hidden !important;
    justify-content: flex-start !important;
    padding-top: 86px !important;
    padding-bottom: 0 !important;
  }

  .practice-screen:has(.vocabulary-practice.is-test-mode):not(:has(.vocab-pack-library)):not(:has(.vocab-mode-stage)) {
    height: 100dvh !important;
    min-height: 100dvh !important;
    overflow: hidden !important;
    padding-top: 78px !important;
    padding-bottom: calc(var(--mobile-bottom-nav-height) + 16px) !important;
  }

  .practice-screen:has(.vocabulary-practice) .vocabulary-practice {
    width: var(--mobile-page-width) !important;
    max-width: var(--mobile-page-width) !important;
    margin-right: auto !important;
    margin-left: auto !important;
  }

  .practice-screen:has(.vocab-pack-library),
  .practice-screen:has(.vocab-mode-stage) {
    height: auto !important;
    min-height: 100dvh !important;
    overflow: visible !important;
    justify-content: flex-start !important;
    padding-top: 112px !important;
    padding-bottom: 0 !important;
  }

  .practice-screen:has(.vocab-pack-library) .vocabulary-practice,
  .practice-screen:has(.vocab-mode-stage) .vocabulary-practice {
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }

  .practice-screen:has(.vocab-pack-library)
    .vocabulary-practice
    .vocab-pack-library,
  .practice-screen:has(.vocab-mode-stage)
    .vocabulary-practice
    .vocab-mode-stage {
    width: 100% !important;
    max-width: 100% !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  .desktop-exercise-main
    > :is(
      .practice-container,
      .verb-practice,
      .adjektiv-practice,
      .praeposition-practice,
      .konnektoren-practice,
      .sich-verben-practice
    ) {
    width: 100% !important;
    max-width: 100% !important;
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .student-materials-header,
  .student-homework-panel > h2 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .student-home-person,
  .student-home-stats,
  .student-home-main > p,
  .student-home-recommendation {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .profile-page > *,
  .teacher-dashboard,
  .teacher-portal,
  .teacher-workspace,
  .grammar-guide,
  .story-reading :is(.story-page-hero, .story-picker, .story-shell),
  .daily-challenge-practice :is(.challenge-hero, .practice-layout, .practice-box),
  .nemet-page-shell > * {
    max-width: 100% !important;
  }
}
</style>
