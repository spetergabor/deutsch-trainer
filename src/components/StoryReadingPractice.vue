<template>
  <div class="story-reading practice-container nemet-page-shell">
    <section v-if="!showStatistics" class="story-page-hero">
      <div class="story-page-hero-copy">
        <span>Story-Lesen</span>
        <h1>Olvasás német szövegekkel</h1>
        <p>
          Cikkek, szókincs és rövid szövegértés egy helyen, hogy a nyelvtan
          használat közben is rögzüljön.
        </p>
      </div>

      <div class="story-page-hero-meta">
        <div>
          <small>Aktuális</small>
          <strong>{{ lesson?.level || "B1/B2" }}</strong>
        </div>

        <div>
          <small>Szókincs</small>
          <strong>{{ activeVocabularyCount }} szó</strong>
        </div>

        <div>
          <small>Kérdések</small>
          <strong>{{ activeQuestionCount }} kérdés</strong>
        </div>
      </div>
    </section>

    <section v-if="!lesson && !showStatistics" class="story-picker">
      <article
        v-for="item in lessons"
        :key="item.id"
        class="story-picker-card"
        @click="selectLesson(item.id)"
      >
        <div class="story-source-row">
          <span>{{ item.level }}</span>
          <span>{{ item.sourceLabel }}</span>
        </div>

        <h2>{{ item.title }}</h2>
        <p>{{ item.subtitle }}</p>

        <div class="story-picker-meta">
          <span>{{ item.vocabulary.length }} szó</span>
          <span>{{ item.grammar.length }} nyelvtan</span>
          <span>{{ item.questions.length }} kérdés</span>
        </div>
      </article>
    </section>

    <section v-if="lesson && !showStatistics" class="story-shell">
      <article class="story-main">
        <div class="story-source-row">
          <span>{{ lesson.level }}</span>
          <a :href="lesson.sourceUrl" target="_blank" rel="noopener noreferrer">
            Quelle: {{ lesson.sourceLabel }}
          </a>
          <button class="story-switch-btn" @click="backToStoryList">
            Másik cikk
          </button>
        </div>

        <h2>{{ lesson.title }}</h2>
        <p class="story-subtitle">{{ lesson.subtitle }}</p>

        <div class="story-text">
          <p v-for="paragraph in lesson.paragraphs" :key="paragraph">
            {{ paragraph }}
          </p>
        </div>
      </article>

      <aside class="story-side">
        <section class="story-info-card">
          <h3>Wortschatz B1+</h3>

          <div class="story-vocab-list">
            <button
              v-for="item in lesson.vocabulary"
              :key="item.word"
              class="story-vocab-item"
              :class="{ active: selectedVocab?.word === item.word }"
              @click="selectedVocab = item"
            >
              <strong>{{ item.word }}</strong>
              <span>{{ item.level }}</span>
            </button>
          </div>

          <div v-if="selectedVocab" class="story-detail-box">
            <strong>{{ selectedVocab.meaning }}</strong>
            <p>{{ selectedVocab.example }}</p>
          </div>
        </section>

        <section class="story-info-card">
          <h3>Nyelvtan a szövegből</h3>

          <div class="grammar-list">
            <article
              v-for="item in lesson.grammar"
              :key="item.title"
              class="grammar-item"
            >
              <strong>{{ item.title }}</strong>
              <code>{{ item.example }}</code>
              <p>{{ item.explanation }}</p>
            </article>
          </div>
        </section>
      </aside>

      <section class="story-quiz">
        <div class="story-quiz-header">
          <div>
            <span>Leseverstehen</span>
            <strong>{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</strong>
          </div>

          <div class="story-progress">
            <div :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <div v-if="currentQuestion" class="story-question-card">
          <p>{{ currentQuestion.question }}</p>

          <div class="story-options">
            <button
              v-for="option in currentQuestion.options"
              :key="option.id"
              :class="getOptionClass(option.id)"
              :disabled="isAnswered"
              @click="checkAnswer(option.id)"
            >
              <span>{{ option.id }}</span>
              {{ option.text }}
            </button>
          </div>

          <button
            v-if="isAnswered"
            class="practice-btn-secondary story-next-btn"
            @click="nextQuestion"
          >
            Következő
          </button>
        </div>
      </section>
    </section>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Story vége</h2>

        <p>
          Eredmény:
          <span class="correct-text">{{ correctAnswers }} / {{ totalQuestions }}</span>
        </p>

        <button class="practice-btn-primary" @click="resetStory">
          Újrakezdés
        </button>

        <button class="practice-btn-secondary" @click="$emit('go-dashboard')">
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { storyLessons } from "../data/storyLessons";
import { saveExerciseResult } from "../services/exerciseResultService";

export default {
  name: "StoryReadingPractice",

  props: {
    initialLessonId: {
      type: String,
      default: null,
    },
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      lessons: storyLessons,
      lesson: null,
      selectedVocab: null,
      currentQuestionIndex: 0,
      selectedOption: null,
      isAnswered: false,
      isCorrect: null,
      correctAnswers: 0,
      showStatistics: false,
    };
  },

  computed: {
    currentQuestion() {
      return this.lesson?.questions?.[this.currentQuestionIndex] || null;
    },

    totalQuestions() {
      return this.lesson?.questions?.length || 0;
    },

    progressPercent() {
      if (!this.totalQuestions) return 0;

      return Math.round((this.currentQuestionIndex / this.totalQuestions) * 100);
    },

    activeVocabularyCount() {
      if (this.lesson) return this.lesson.vocabulary?.length || 0;

      return this.lessons.reduce(
        (total, item) => total + (item.vocabulary?.length || 0),
        0,
      );
    },

    activeQuestionCount() {
      if (this.lesson) return this.lesson.questions?.length || 0;

      return this.lessons.reduce(
        (total, item) => total + (item.questions?.length || 0),
        0,
      );
    },
  },

  mounted() {
    if (this.initialLessonId) {
      this.selectLesson(this.initialLessonId);
    }
  },

  watch: {
    initialLessonId(nextLessonId) {
      if (nextLessonId) {
        this.selectLesson(nextLessonId);
      }
    },
  },

  methods: {
    selectLesson(lessonId) {
      const nextLesson = this.lessons.find((item) => item.id === lessonId);

      if (!nextLesson) return;

      this.lesson = nextLesson;
      this.selectedVocab = nextLesson.vocabulary?.[0] || null;
      this.resetStoryProgress();
      this.scrollStoryToTop();
    },

    backToStoryList() {
      this.lesson = null;
      this.selectedVocab = null;
      this.resetStoryProgress();
      this.scrollStoryToTop();
    },

    scrollStoryToTop() {
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

      this.$nextTick(() => {
        resetScroll();
        window.requestAnimationFrame(resetScroll);
      });
    },

    resetStoryProgress() {
      this.currentQuestionIndex = 0;
      this.selectedOption = null;
      this.isAnswered = false;
      this.isCorrect = null;
      this.correctAnswers = 0;
      this.showStatistics = false;
    },

    checkAnswer(optionId) {
      if (this.isAnswered || !this.currentQuestion) return;

      this.selectedOption = optionId;
      this.isCorrect = optionId === this.currentQuestion.correct;
      this.isAnswered = true;

      if (this.isCorrect) {
        this.correctAnswers += 1;
      }
    },

    getOptionClass(optionId) {
      if (!this.isAnswered || !this.currentQuestion) return "";

      if (optionId === this.currentQuestion.correct) {
        return "correct";
      }

      if (optionId === this.selectedOption && !this.isCorrect) {
        return "wrong";
      }

      return "muted";
    },

    async nextQuestion() {
      if (this.currentQuestionIndex < this.totalQuestions - 1) {
        this.currentQuestionIndex += 1;
        this.selectedOption = null;
        this.isAnswered = false;
        this.isCorrect = null;
        return;
      }

      this.showStatistics = true;
      await this.saveResult();
    },

    resetStory() {
      this.resetStoryProgress();
    },

    async saveResult() {
      try {
        await saveExerciseResult(
          "story-reading",
          this.correctAnswers,
          this.totalQuestions,
        );

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Story eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.story-reading.practice-container {
  width: min(1080px, var(--layout-shell-width));
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 0;
  padding-right: 0;
  box-sizing: border-box;
  overflow: visible;
}

.story-shell {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 26px;
  align-items: start;
}

.story-page-hero {
  width: 100%;
  margin: 0 0 24px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  background:
    radial-gradient(circle at 18% 8%, rgba(102, 126, 234, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.055);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  color: #ffffff;
  text-align: left;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.44fr);
  gap: 24px;
  align-items: center;
}

.story-page-hero-copy {
  min-width: 0;
}

.story-page-hero-copy span {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 213, 106, 0.15);
  color: #ffdc7a;
  font-size: 0.78rem;
  font-weight: 950;
}

.story-page-hero h1 {
  margin: 12px 0 0;
  color: #ffffff;
  font-size: clamp(2.1rem, 4vw, 3.5rem);
  font-weight: 950;
  line-height: 1.04;
}

.story-page-hero p {
  max-width: 760px;
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 1.04rem;
  font-weight: 560;
  line-height: 1.55;
}

.story-page-hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.story-page-hero-meta div {
  min-width: 0;
  padding: 14px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.18);
}

.story-page-hero-meta small {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.78rem;
  font-weight: 850;
}

.story-page-hero-meta strong {
  display: block;
  overflow: hidden;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 950;
  line-height: 1.2;
  text-overflow: ellipsis;
}

.story-picker {
  display: grid;
  gap: 18px;
  width: 100%;
}

.story-picker-card {
  width: 100%;
  padding: 28px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.story-picker-card:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.45);
  background: rgba(255, 255, 255, 0.075);
}

.story-picker-card h2 {
  margin: 14px 0 8px;
  color: #ffffff;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.08;
}

.story-picker-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 1.05rem;
  font-weight: 850;
}

.story-picker-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.story-picker-meta span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
  font-weight: 900;
}

.story-main,
.story-side,
.story-quiz {
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.story-main {
  padding: 24px 18px;
  text-align: left;
}

.story-main *,
.story-side *,
.story-quiz * {
  max-width: 100%;
  box-sizing: border-box;
}

.story-source-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.story-source-row span,
.story-source-row a,
.story-switch-btn {
  padding: 7px 11px;
  border: 0;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.14);
  color: #66c3ff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  text-decoration: none;
}

.story-switch-btn {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
}

.story-switch-btn:hover {
  background: rgba(102, 126, 234, 0.18);
  color: #ffffff;
}

.story-main h2 {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: clamp(2rem, 4vw, 2.4rem);
  line-height: 1.05;
  white-space: normal;
  overflow-wrap: break-word;
}

.story-subtitle {
  margin: 0 0 28px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 1.18rem;
  font-weight: 850;
}

.story-text {
  display: grid;
  gap: 18px;
  min-width: 0;
  max-width: 100%;
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.04rem;
  line-height: 1.82;
  white-space: normal;
  overflow-wrap: break-word;
}

.story-text p {
  margin: 0;
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: break-word;
}

.story-side {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.story-info-card {
  padding: 22px;
  border-radius: 22px;
  background: rgba(0, 0, 0, 0.2);
}

.story-info-card h3 {
  margin: 0 0 14px;
  color: #ffffff;
}

.story-vocab-list {
  display: grid;
  gap: 9px;
}

.story-vocab-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  color: #ffffff;
  font-family: inherit;
  cursor: pointer;
}

.story-vocab-item.active {
  border-color: rgba(102, 126, 234, 0.55);
  background: rgba(102, 126, 234, 0.16);
}

.story-vocab-item span {
  color: #8fe6ff;
  font-weight: 900;
}

.story-detail-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(52, 152, 219, 0.1);
  color: rgba(255, 255, 255, 0.78);
  text-align: left;
}

.story-detail-box strong {
  color: #ffffff;
}

.story-detail-box p {
  margin: 8px 0 0;
  line-height: 1.45;
}

.grammar-list {
  display: grid;
  gap: 12px;
}

.grammar-item {
  text-align: left;
}

.grammar-item strong,
.grammar-item code,
.grammar-item p {
  display: block;
}

.grammar-item strong {
  color: #ffffff;
}

.grammar-item code {
  margin: 7px 0;
  color: #71ff99;
  white-space: normal;
}

.grammar-item p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.45;
}

.story-quiz {
  grid-column: 1 / -1;
  padding: 24px;
  text-align: left;
}

.story-quiz-header {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.story-quiz-header > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 850;
}

.story-quiz-header strong {
  color: #ffffff;
}

.story-progress {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.story-progress div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4facfe, #43e97b);
}

.story-question-card p {
  margin: 0 0 16px;
  color: #ffffff;
  font-size: 1.22rem;
  font-weight: 900;
}

.story-options {
  display: grid;
  gap: 10px;
}

.story-options button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.22);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.story-options button span {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 950;
}

.story-options button.correct {
  border-color: rgba(46, 204, 113, 0.45);
  background: rgba(46, 204, 113, 0.16);
}

.story-options button.wrong {
  border-color: rgba(255, 71, 87, 0.45);
  background: rgba(255, 71, 87, 0.14);
}

.story-options button.muted {
  opacity: 0.5;
}

.story-next-btn {
  margin-top: 16px;
}

@media (max-width: 900px) {
  .story-reading.practice-container {
    width: min(100%, var(--layout-shell-width));
    max-width: min(100%, var(--layout-shell-width));
  }

  .story-page-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .story-page-hero {
    padding: 22px;
    border-radius: 26px;
  }

  .story-page-hero h1 {
    font-size: clamp(2rem, 9vw, 2.75rem);
    overflow-wrap: anywhere;
  }

  .story-page-hero p {
    font-size: 1rem;
    line-height: 1.45;
  }

  .story-page-hero-meta {
    grid-template-columns: 1fr;
  }

  .story-text {
    font-size: 0.98rem;
    line-height: 1.7;
  }
}
</style>
