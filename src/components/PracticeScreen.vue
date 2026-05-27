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

    <div
      v-if="currentMode !== 'profile'"
      class="desktop-practice-return"
    >
      <button class="btn-outline btn-small" @click="$emit('go-dashboard')">
        ← Vissza
      </button>

      <h1>{{ headerTitle }}</h1>
    </div>

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
      @exercise-finished="$emit('exercise-finished')"
      @go-dashboard="$emit('go-dashboard')"
    />

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
  </section>
</template>

<script>
import ProfileView from "./ProfileView.vue";
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
import DailyChallengePractice from "./DailyChallengePractice.vue";
import StoryReadingPractice from "./StoryReadingPractice.vue";
import GrammarGuideView from "./GrammarGuideView.vue";
import { grammarGuides } from "../data/grammarGuides";

export default {
  name: "PracticeScreen",

  components: {
    ProfileView,
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
  },

  emits: [
    "go-dashboard",
    "exercise-finished",
    "logout",
    "set-mode",
    "upload-file",
    "update:new-note-text",
    "save-note",
    "delete-note",
    "select-note",
  ],

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

    activeGrammarGuide() {
      if (!this.isGrammarGuide) return null;

      return (
        grammarGuides.find((guide) => guide.mode === this.currentMode) || null
      );
    },
  },
};
</script>
