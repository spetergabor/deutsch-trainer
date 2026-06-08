<template>
  <section
    class="practice-screen"
    :class="{
      'grammar-practice-screen': isGrammarGuide,
      'profile-practice-screen': currentMode === 'profile',
    }"
  >
    <header class="practice-nav app-header mobile-practice-nav">
      <button class="practice-back-btn" @click="$emit('go-dashboard')"></button>

      <div class="practice-title">
        {{ headerTitle }}
      </div>

      <div class="practice-nav-spacer"></div>
    </header>

    <nav
      v-if="desktopBreadcrumb"
      class="desktop-page-breadcrumb"
      aria-label="Oldal útvonala"
    >
      <button
        type="button"
        class="desktop-page-breadcrumb-back"
        @click="handleDesktopBreadcrumbBack"
      >
        <span aria-hidden="true">←</span>
        {{ desktopBreadcrumb.parentLabel }}
      </button>

      <span class="desktop-page-breadcrumb-separator">/</span>

      <span
        v-if="desktopBreadcrumb.groupLabel"
        class="desktop-page-breadcrumb-group"
      >
        {{ desktopBreadcrumb.groupLabel }}
      </span>

      <span
        v-if="desktopBreadcrumb.groupLabel"
        class="desktop-page-breadcrumb-separator"
      >
        /
      </span>

      <strong class="desktop-page-breadcrumb-current">
        {{ desktopBreadcrumb.currentLabel }}
      </strong>
    </nav>

    <div
      v-if="
        currentMode !== 'profile' &&
        currentMode !== 'student-materials' &&
        currentMode !== 'learning-library'
      "
      class="desktop-practice-return desktop-practice-title"
    >
      <h1>{{ headerTitle }}</h1>
    </div>

    <section v-if="isExerciseMode" class="desktop-exercise-hero">
      <div class="desktop-exercise-hero-copy">
        <span class="desktop-exercise-kicker">Gyakorló</span>
        <h2>{{ headerTitle }}</h2>
        <p>{{ exercisePanelCopy }}</p>
      </div>

      <div class="desktop-exercise-hero-stats" aria-label="Gyakorló adatok">
        <div>
          <span>Streak</span>
          <strong>🔥 {{ displayStreak }} nap</strong>
        </div>

        <div>
          <span>XP</span>
          <strong>⭐ {{ xpProfile.xp || 0 }}</strong>
        </div>

        <div>
          <span>{{ exerciseFocusLabel }}</span>
          <strong>{{ exerciseFocusValue }}</strong>
        </div>

        <button
          v-if="currentMode === 'vocabulary'"
          type="button"
          class="desktop-exercise-hero-action"
          @click="resetVocabularyTopic"
        >
          Másik szócsomag
        </button>
      </div>
    </section>

    <div v-if="isExerciseMode" class="desktop-exercise-workspace">
      <div class="desktop-exercise-main">
        <VerbPractice
          v-if="currentMode === 'perfekt'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <NomenVerbPractice
          v-if="currentMode === 'nomen-verb'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <AdjektivPractice
          v-if="currentMode === 'adjektiv'"
          ref="adjektivPractice"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <OsdPractice
          v-if="currentMode === 'osd'"
          :user-session="userSession"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <PraepositionPractice
          v-if="currentMode === 'praeposition'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <KonnektorenPractice
          v-if="currentMode === 'konnektoren'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <SichVerbenPractice
          v-if="currentMode === 'sich-verben'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <PassivPractice
          v-if="currentMode === 'passiv'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <PronominaladverbPractice
          v-if="currentMode === 'pronominaladverb'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />

        <VocabularyPractice
          v-if="currentMode === 'vocabulary'"
          ref="vocabularyPractice"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
          @round-state-change="updateVocabularyRoundPanel"
        />

        <MistakeReviewPractice
          v-if="currentMode === 'mistake-review'"
          @exercise-finished="$emit('exercise-finished')"
          @go-dashboard="$emit('go-dashboard')"
        />
      </div>

      <aside
        class="desktop-exercise-panel"
        :class="{ 'is-vocabulary-round-panel': currentMode === 'vocabulary' }"
        aria-label="Gyakorló infó"
      >
        <template v-if="currentMode === 'vocabulary'">
          <div class="vocabulary-round-panel-head">
            <span class="desktop-exercise-kicker">
              {{ vocabularyRoundPanel.modeLabel || "Kör" }}
            </span>
            <h2>Megválaszolt szavak</h2>
            <p v-if="vocabularyRoundPanel.topicTitle">
              {{ vocabularyRoundPanel.topicIcon }}
              {{ vocabularyRoundPanel.topicTitle }}
            </p>
            <p v-else>
              Válassz szócsomagot, és itt látod majd az aktuális kör szavait.
            </p>
          </div>

          <div class="vocabulary-round-summary">
            <div>
              <span>Jó</span>
              <strong>{{ vocabularyRoundPanel.correct }}</strong>
            </div>

            <div>
              <span>Hiba</span>
              <strong>{{ vocabularyRoundPanel.wrong }}</strong>
            </div>

            <div>
              <span>Állás</span>
              <strong>
                {{ vocabularyRoundPanel.current }}/{{ vocabularyRoundPanel.total }}
              </strong>
            </div>
          </div>

          <ol
            v-if="vocabularyRoundPanel.items.length"
            class="vocabulary-round-list"
          >
            <li
              v-for="(item, index) in vocabularyRoundPanel.items"
              :key="item.id"
              :class="`is-${item.status}`"
            >
              <span class="vocabulary-round-index">
                {{ String(index + 1).padStart(2, "0") }}
              </span>

              <div>
                <strong>{{ item.hu }}</strong>
                <small>{{ item.answer }}</small>
              </div>
            </li>
          </ol>

          <div v-else class="vocabulary-round-empty">
            Itt csak azok a szavak jelennek meg, amelyeket már megválaszoltál.
          </div>

          <button
            type="button"
            class="desktop-exercise-secondary"
            @click="handleDesktopBreadcrumbBack"
          >
            {{ desktopBreadcrumb?.parentLabel || "Tanulási könyvtár" }}
          </button>
        </template>

        <template v-else>
          <span class="desktop-exercise-kicker">Gyakorló</span>
          <h2>{{ headerTitle }}</h2>
          <p>{{ exercisePanelCopy }}</p>

          <div class="desktop-exercise-stat-grid">
            <div>
              <span>Streak</span>
              <strong>🔥 {{ displayStreak }} nap</strong>
            </div>

            <div>
              <span>XP</span>
              <strong>⭐ {{ xpProfile.xp || 0 }}</strong>
            </div>

            <div>
              <span>Szint</span>
              <strong>Level {{ xpProfile.level || 1 }}</strong>
            </div>
          </div>

          <div class="desktop-exercise-focus">
            <span>{{ exerciseFocusLabel }}</span>
            <strong>{{ exerciseFocusValue }}</strong>
          </div>

          <button
            v-if="currentMode === 'adjektiv'"
            type="button"
            class="desktop-exercise-secondary"
            @click="openAdjektivTable"
          >
            ℹ️ Táblázat megnyitása
          </button>

          <button
            type="button"
            class="desktop-exercise-secondary"
            @click="handleDesktopBreadcrumbBack"
          >
            {{ desktopBreadcrumb?.parentLabel || "Tanulási könyvtár" }}
          </button>
        </template>
      </aside>
    </div>

    <DailyChallengePractice
      v-if="isDailyChallenge"
      :challenge-id="dailyChallengeId"
      @exercise-finished="$emit('exercise-finished')"
      @go-dashboard="$emit('go-dashboard')"
    />

    <StoryReadingPractice
      v-if="currentMode === 'story-reading'"
      :initial-lesson-id="initialStoryId"
      @exercise-finished="$emit('exercise-finished')"
      @go-dashboard="$emit('go-dashboard')"
    />

    <StudentLearningLibrary
      v-if="currentMode === 'learning-library'"
      @set-mode="$emit('set-mode', $event)"
      @open-story="$emit('open-story', $event)"
    />

    <div
      v-if="activeGrammarGuide"
      class="grammar-guide-shell"
    >
      <GrammarGuideView
        :guide-id="activeGrammarGuide.id"
        @set-mode="$emit('set-mode', $event)"
      />
    </div>

    <ProfileView
      v-if="currentMode === 'profile'"
      :userSession="userSession"
      :user-role="userRole"
      :authFullName="authFullName"
      :stats="stats"
      :activityStats="activityStats"
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
      @set-mode="$emit('set-mode', $event)"
      @upload-file="$emit('upload-file', $event)"
      @update:new-note-text="$emit('update:new-note-text', $event)"
      @save-note="$emit('save-note')"
      @delete-note="$emit('delete-note', $event)"
      @select-note="$emit('select-note', $event)"
      @logout="$emit('logout')"
    />

    <StudentMaterialsView
      v-if="currentMode === 'student-materials'"
      :user-session="userSession"
      @go-dashboard="$emit('go-dashboard')"
      @set-mode="$emit('set-mode', $event)"
      @start-homework-practice="$emit('start-homework-practice', $event)"
    />
  </section>
</template>

<script>
import ProfileView from "./ProfileView.vue";
import StudentMaterialsView from "./student/StudentMaterialsView.vue";
import StudentLearningLibrary from "./student/StudentLearningLibrary.vue";
import KonnektorenPractice from "./KonnektorenPractice.vue";
import PraepositionPractice from "./PraepositionPractice.vue";
import VerbPractice from "./VerbPractice.vue";
import NomenVerbPractice from "./NomenVerbPractice.vue";
import AdjektivPractice from "./AdjektivPractice.vue";
import OsdPractice from "./OsdPractice.vue";
import SichVerbenPractice from "./SichVerbenPractice.vue";
import PassivPractice from "./PassivPractice.vue";
import PronominaladverbPractice from "./PronominaladverbPractice.vue";
import VocabularyPractice from "./VocabularyPractice.vue";
import MistakeReviewPractice from "./MistakeReviewPractice.vue";
import DailyChallengePractice from "./DailyChallengePractice.vue";
import StoryReadingPractice from "./StoryReadingPractice.vue";
import GrammarGuideView from "./GrammarGuideView.vue";
import { grammarGuides } from "../data/grammarGuides";
import { getHomeworkStatusLabel } from "../utils/homeworkLifecycle";

export default {
  name: "PracticeScreen",

  components: {
    ProfileView,
    StudentMaterialsView,
    StudentLearningLibrary,
    VerbPractice,
    NomenVerbPractice,
    AdjektivPractice,
    OsdPractice,
    PraepositionPractice,
    KonnektorenPractice,
    SichVerbenPractice,
    PassivPractice,
    PronominaladverbPractice,
    VocabularyPractice,
    MistakeReviewPractice,
    DailyChallengePractice,
    StoryReadingPractice,
    GrammarGuideView,
  },

  props: {
    currentMode: {
      type: String,
      required: true,
    },

    headerTitle: {
      type: String,
      required: true,
    },

    userSession: {
      type: Object,
      default: null,
    },

    isGuestMode: {
      type: Boolean,
      default: false,
    },

    userRole: {
      type: String,
      default: "student",
    },

    authFullName: {
      type: String,
      default: "",
    },

    stats: {
      type: Object,
      required: true,
    },

    activityStats: {
      type: Object,
      required: true,
    },

    xpProfile: {
      type: Object,
      default: () => ({
        xp: 0,
        level: 1,
        today_xp: 0,
        coins: 0,
      }),
    },

    activityCalendar: {
      type: Array,
      default: () => [],
    },

    recentExercises: {
      type: Array,
      default: () => [],
    },

    userFiles: {
      type: Array,
      default: () => [],
    },

    isUploading: {
      type: Boolean,
      default: false,
    },

    newNoteText: {
      type: String,
      default: "",
    },

    savedNotes: {
      type: Array,
      default: () => [],
    },

    last30ChartPoints: {
      type: String,
      default: "",
    },

    last30AveragePercent: {
      type: Number,
      default: 0,
    },

    last30CorrectAnswers: {
      type: Number,
      default: 0,
    },

    last30WrongAnswers: {
      type: Number,
      default: 0,
    },

    recommendedPractice: {
      type: Object,
      default: () => ({
        type: "perfekt",
        label: "Perfekt",
        reason: "Kezdésnek jó bemelegítő feladat",
      }),
    },

    weakTopics: {
      type: Array,
      default: () => [],
    },

    last30Trend: {
      type: Object,
      default: () => ({
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      }),
    },

    initialStoryId: {
      type: String,
      default: null,
    },

    activeHomeworkAssignment: {
      type: Object,
      default: null,
    },
  },

  emits: [
    "go-dashboard",
    "exercise-finished",
    "logout",
    "set-mode",
    "open-story",
    "start-homework-practice",
    "upload-file",
    "update:new-note-text",
    "save-note",
    "delete-note",
    "select-note",
  ],

  data() {
    return {
      vocabularyRoundPanel: {
        selectedTopic: null,
        topicTitle: "",
        topicIcon: "",
        mode: null,
        modeLabel: "Szócsomag",
        current: 0,
        total: 0,
        correct: 0,
        wrong: 0,
        items: [],
      },
    };
  },

  computed: {
    isGrammarGuide() {
      return this.currentMode?.startsWith("grammar-guide");
    },

    isDailyChallenge() {
      return [
        "daily-challenge",
        "daily-challenge-adjektiv",
        "daily-challenge-konjunktiv-ii",
      ].includes(this.currentMode);
    },

    dailyChallengeId() {
      const challengeMap = {
        "daily-challenge": "passiv-news-traffic",
        "daily-challenge-adjektiv": "adjektiv-apartment-viewing",
        "daily-challenge-konjunktiv-ii": "konjunktiv-ii-career-decision",
      };

      return challengeMap[this.currentMode] || "passiv-news-traffic";
    },

    isExerciseMode() {
      return [
        "perfekt",
        "nomen-verb",
        "adjektiv",
        "osd",
        "praeposition",
        "konnektoren",
        "sich-verben",
        "passiv",
        "pronominaladverb",
        "vocabulary",
        "mistake-review",
      ].includes(this.currentMode);
    },

    activeGrammarGuide() {
      if (!this.isGrammarGuide) return null;

      return (
        grammarGuides.find((guide) => guide.mode === this.currentMode) || null
      );
    },

    desktopBreadcrumb() {
      if (!this.currentMode) return null;
      if (this.isTopLevelDesktopPage) return null;

      const parent = this.breadcrumbParent;

      return {
        ...parent,
        groupLabel: this.breadcrumbGroupLabel,
        currentLabel: this.breadcrumbCurrentLabel,
      };
    },

    isTopLevelDesktopPage() {
      return ["student-materials", "learning-library", "profile"].includes(
        this.currentMode,
      );
    },

    breadcrumbParent() {
      if (this.activeHomeworkAssignment) {
        return {
          parentLabel: "Házi és anyagok",
          targetMode: "student-materials",
        };
      }

      return {
        parentLabel: "Tanulási könyvtár",
        targetMode: "learning-library",
      };
    },

    breadcrumbGroupLabel() {
      if (this.activeHomeworkAssignment) return "Házi feladat";
      if (this.currentMode === "student-materials") return null;
      if (this.currentMode === "learning-library") return null;
      if (this.currentMode === "profile") return null;
      if (this.isGrammarGuide) return "Nyelvtani segédletek";
      if (this.isDailyChallenge) return "Challenge";
      if (this.currentMode === "story-reading") return "Storyk";
      return "Gyakorló feladatok";
    },

    breadcrumbCurrentLabel() {
      const labels = {
        "student-materials": "Házi és anyagok",
        "learning-library": "Tanulási könyvtár",
        profile: "Profil",
      };

      if (labels[this.currentMode]) return labels[this.currentMode];
      if (this.activeHomeworkAssignment?.title) {
        return this.activeHomeworkAssignment.title;
      }
      if (this.activeGrammarGuide?.title) return this.activeGrammarGuide.title;

      return this.headerTitle;
    },

    displayStreak() {
      return (
        this.xpProfile?.streak_days ||
        this.activityStats?.streak ||
        0
      );
    },

    exercisePanelCopy() {
      if (this.activeHomeworkAssignment) {
        return "Házi feladathoz kapcsolt gyakorló kör.";
      }

      const copyByMode = {
        perfekt: "Igealakok és Partizip II gyors automatizálása.",
        "nomen-verb": "Tipikus Nomen-Verb-Verbindungen gyakorlása.",
        adjektiv: "Melléknévragozás eset, névelő és nem alapján.",
        osd: "Vizsgahelyzetek és írásfeladatok gyakorlása.",
        praeposition: "Vonzatok és prepozíciós kapcsolatok rögzítése.",
        konnektoren: "Mondatkapcsolók és kötőszórend gyakorlása.",
        "sich-verben": "Sich-Verben és reflexív szerkezetek ismétlése.",
        passiv: "Passiv szerkezetek felismerése és átalakítása.",
        pronominaladverb: "Worauf, darauf és hasonló alakok használata.",
        vocabulary: "Szókártyák és névelős szókincs teszt.",
        "mistake-review": "10 vegyes kérdés a korábbi hibáidból.",
      };

      return copyByMode[this.currentMode] || "Célzott gyakorló kör.";
    },

    exerciseFocusLabel() {
      if (this.activeHomeworkAssignment) return "Házi állapot";
      if (this.currentMode === "vocabulary") return "Teszt XP";
      if (this.currentMode === "mistake-review") return "Forrás";
      if (this.currentMode === "osd") return "Feladattípus";
      return "Kör";
    },

    exerciseFocusValue() {
      if (this.activeHomeworkAssignment) {
        return getHomeworkStatusLabel(this.activeHomeworkAssignment.status);
      }

      if (this.currentMode === "vocabulary") return "+5 XP tesztben";
      if (this.currentMode === "mistake-review") return "Vegyes";
      if (this.currentMode === "osd") return "ÖSD Schreiben";
      return "10 kérdés";
    },
  },

  methods: {
    openAdjektivTable() {
      this.$refs.adjektivPractice?.openTable?.();
    },

    resetVocabularyTopic() {
      this.$refs.vocabularyPractice?.resetTopic?.();
    },

    createEmptyVocabularyRoundPanel() {
      return {
        selectedTopic: null,
        topicTitle: "",
        topicIcon: "",
        mode: null,
        modeLabel: "Szócsomag",
        current: 0,
        total: 0,
        correct: 0,
        wrong: 0,
        items: [],
      };
    },

    updateVocabularyRoundPanel(payload) {
      this.vocabularyRoundPanel = {
        ...this.createEmptyVocabularyRoundPanel(),
        ...(payload || {}),
      };
    },

    handleDesktopBreadcrumbBack() {
      const targetMode = this.desktopBreadcrumb?.targetMode;

      if (targetMode) {
        this.$emit("set-mode", targetMode);
        return;
      }

      this.$emit("go-dashboard");
    },
  },
};
</script>
