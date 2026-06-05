<template>
  <div class="practice-container mistake-review-practice">
    <h1>Hibatár gyakorló</h1>

    <section v-if="!activeMistakes.length" class="mistake-empty">
      <span>✨</span>
      <h2>Még nincs aktív hiba</h2>
      <p>
        A hibatár akkor töltődik, amikor tesztben vagy gyakorlóban elrontasz
        valamit. Szókártyás „Nem tudom” nem számít hibának.
      </p>
      <button class="pill-button btn-blue" @click="$emit('go-dashboard')">
        Vissza a főmenübe
      </button>
    </section>

    <PracticeLayout
      v-else
      :progress="progressPercent"
      :current="currentIndex"
      :total="questionsPerRound"
    >
      <template #xp>
        <div class="xp-card">
          <div class="xp-top">
            <div class="xp-mini-card">
              <span>🎯</span>
              <div>
                <strong>{{ activeMistakes.length }}</strong>
                <small>aktív hiba</small>
              </div>
            </div>

            <div class="xp-mini-card">
              <span>🧩</span>
              <div>
                <strong>{{ typeSummary }}</strong>
                <small>vegyes kör</small>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-if="currentItem && !showStatistics" class="quiz-area">
        <div class="mistake-topic-pill">
          {{ currentItem.label }} · {{ currentItem.level }}
        </div>

        <section class="mistake-question-card ui-unit">
          <template v-if="currentItem.type === 'adjektiv'">
            <p>{{ currentItem.prompt }}</p>
            <h2>
              ({{ currentItem.meta?.article }} /
              {{ currentItem.meta?.adjective }} /
              {{ currentItem.meta?.noun }})
            </h2>
          </template>

          <template v-else>
            <p>{{ currentItem.prompt }}</p>
            <h2>{{ currentItem.meta?.isPhrase ? "Kifejezés" : "Szó névelővel" }}</h2>
          </template>
        </section>

        <div class="input-wrapper ui-unit input-with-icon mistake-answer-wrap">
          <input
            ref="answerInput"
            v-model="userAnswer"
            type="text"
            class="pill-input"
            :placeholder="answerPlaceholder"
            :disabled="isAnswered"
            :class="{
              'input-correct': isAnswered && isCorrect,
              'input-wrong': isAnswered && isCorrect === false,
            }"
            @keyup.enter="handleEnter"
          />

          <span v-if="isAnswered && isCorrect" class="input-icon correct-icon">
            ✓
          </span>

          <span
            v-if="isAnswered && isCorrect === false"
            class="input-icon wrong-icon"
          >
            ✗
          </span>
        </div>

        <div class="button-group ui-unit">
          <button
            v-if="!isAnswered"
            class="pill-button btn-green"
            :disabled="!userAnswer.trim()"
            @click="checkAnswer"
          >
            Ellenőrzés
          </button>

          <button v-else class="pill-button btn-blue" @click="nextQuestion">
            Következő
          </button>
        </div>

        <transition name="fade">
          <div
            v-if="isAnswered"
            :class="['feedback-box', isCorrect ? 'fb-correct' : 'fb-wrong']"
          >
            <p v-if="!isCorrect" class="wrong-highlight">
              Helyes:
              <span>{{ currentItem.correctAnswer }}</span>
            </p>

            <p class="feedback-text">
              {{ isCorrect ? "Richtig! A hiba gyengült." : "Ezt még visszahozzuk." }}
            </p>

            <div v-if="currentItem.explanation" class="rule-details">
              <p>
                <strong>Megjegyzés:</strong>
                {{ currentItem.explanation }}
              </p>
            </div>
          </div>
        </transition>
      </div>
    </PracticeLayout>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>
        <p>
          Helyes:
          <span class="correct-text">{{ correctAnswers }}</span>
          /
          {{ questionsPerRound }}
        </p>

        <button class="pill-button btn-green" @click="startRound">
          Új vegyes kör
        </button>

        <button class="pill-button btn-blue" @click="$emit('go-dashboard')">
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PracticeLayout from "./PracticeLayout.vue";
import {
  getActiveMistakes,
  markMistakeCorrect,
  recordMistake,
} from "../services/mistakeBankService";
import { saveExerciseResult } from "../services/exerciseResultService";

export default {
  name: "MistakeReviewPractice",

  components: {
    PracticeLayout,
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      activeMistakes: [],
      roundItems: [],
      currentItem: null,
      currentIndex: 0,
      questionsPerRound: 0,
      defaultQuestionsPerRound: 10,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      correctAnswers: 0,
      showStatistics: false,
    };
  },

  computed: {
    progressPercent() {
      if (!this.questionsPerRound) return 0;

      return Math.round((this.currentIndex / this.questionsPerRound) * 100);
    },

    answerPlaceholder() {
      if (this.currentItem?.type === "vocabulary") {
        return this.currentItem.meta?.isPhrase
          ? "pl. einen Termin vereinbaren"
          : "pl. die Entscheidung";
      }

      return "Névelő + Melléknév + Főnév";
    },

    typeSummary() {
      const types = new Set(this.activeMistakes.map((mistake) => mistake.type));

      return types.size || 0;
    },
  },

  created() {
    this.refreshMistakes();
    this.startRound();
  },

  methods: {
    refreshMistakes() {
      this.activeMistakes = getActiveMistakes();
    },

    startRound() {
      this.refreshMistakes();

      if (!this.activeMistakes.length) {
        this.roundItems = [];
        this.questionsPerRound = 0;
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.currentItem = null;
        this.showStatistics = false;
        return;
      }

      this.roundItems = this.shuffle(this.activeMistakes).slice(
        0,
        this.defaultQuestionsPerRound,
      );
      this.questionsPerRound = this.roundItems.length;
      this.currentIndex = 0;
      this.correctAnswers = 0;
      this.showStatistics = false;
      this.setNextQuestion();
    },

    shuffle(items) {
      return [...items].sort((a, b) => {
        const priority = (b.wrongCount || 1) - (a.wrongCount || 1);

        if (priority !== 0) return priority;
        return Math.random() - 0.5;
      });
    },

    setNextQuestion() {
      if (this.currentIndex >= this.questionsPerRound) {
        this.currentItem = null;
        this.showStatistics = true;
        this.saveResults();
        return;
      }

      this.currentItem = this.roundItems[this.currentIndex];
      this.currentIndex += 1;
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;

      this.$nextTick(() => {
        this.$refs.answerInput?.focus();
      });
    },

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[.!?]/g, "")
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/\s+/g, " ");
    },

    checkAnswer() {
      if (this.isAnswered || !this.currentItem || !this.userAnswer.trim()) {
        return;
      }

      const userAnswer = this.normalizeAnswer(this.userAnswer);
      const correctAnswer = this.normalizeAnswer(this.currentItem.correctAnswer);

      this.isCorrect = userAnswer === correctAnswer;
      this.isAnswered = true;

      if (this.isCorrect) {
        this.correctAnswers += 1;
        markMistakeCorrect(this.currentItem.id);
        return;
      }

      recordMistake({
        ...this.currentItem,
        userAnswer: this.userAnswer,
      });
    },

    handleEnter() {
      if (!this.isAnswered) {
        this.checkAnswer();
        return;
      }

      this.nextQuestion();
    },

    nextQuestion() {
      this.setNextQuestion();
    },

    async saveResults() {
      try {
        await saveExerciseResult(
          "mistake-review",
          this.correctAnswers,
          this.questionsPerRound,
        );

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Hibatár eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.mistake-review-practice {
  max-width: 760px;
}

.mistake-empty {
  width: min(680px, 100%);
  margin: 0 auto;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 30px;
  display: grid;
  justify-items: center;
  gap: 14px;
  background:
    linear-gradient(135deg, rgba(67, 233, 123, 0.1), transparent 44%),
    rgba(255, 255, 255, 0.055);
  text-align: center;
}

.mistake-empty > span {
  font-size: 2.5rem;
}

.mistake-empty h2 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(1.9rem, 5vw, 3rem);
  font-weight: 950;
}

.mistake-empty p {
  max-width: 46ch;
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 780;
  line-height: 1.55;
}

.mistake-review-practice :deep(.practice-box),
.mistake-review-practice :deep(.quiz-area) {
  gap: 22px;
}

.mistake-topic-pill {
  width: fit-content;
  margin: 0 auto;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.16);
  color: #8fe6ff;
  font-size: 0.78rem;
  font-weight: 950;
}

.mistake-question-card {
  width: 100%;
  max-width: 640px;
  min-height: 250px;
  padding: 28px;
  border-radius: 30px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 16px;
  background:
    linear-gradient(135deg, rgba(115, 103, 240, 0.13), transparent 46%),
    rgba(0, 0, 0, 0.18);
  text-align: center;
}

.mistake-question-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 1.1rem;
  font-weight: 850;
}

.mistake-question-card h2 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(2rem, 6vw, 3.6rem);
  font-weight: 950;
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.mistake-answer-wrap,
.mistake-review-practice :deep(.button-group),
.mistake-review-practice :deep(.feedback-box) {
  width: 100%;
  max-width: 640px;
}
</style>
