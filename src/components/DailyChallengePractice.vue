<template>
  <div class="practice-container daily-challenge-practice">
    <section class="challenge-hero">
      <div>
        <span>{{ challenge.level }} · {{ challenge.estimatedMinutes }} perc</span>
        <h1>{{ challenge.title }}</h1>
        <p>{{ challenge.subtitle }}</p>
      </div>

      <div class="challenge-hero-icon">{{ challenge.icon }}</div>
    </section>

    <PracticeLayout
      :progress="progressPercent"
      :current="currentStepIndex + 1"
      :total="challenge.steps.length"
    >
      <section
        v-if="currentStep"
        class="challenge-step"
      >
        <div class="challenge-step-head">
          <span>{{ currentStepIndex + 1 }}/{{ challenge.steps.length }}</span>
          <div>
            <h2>{{ currentStep.title }}</h2>
            <p>{{ currentStep.instruction }}</p>
          </div>
        </div>

        <article
          v-if="currentStep.type === 'reading'"
          class="challenge-reading"
        >
          <p
            v-for="paragraph in currentStep.text"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>

          <div class="challenge-highlight-box">
            <strong>{{ currentStep.highlightTitle || "Formen im Text" }}</strong>
            <div>
              <span
                v-for="highlight in currentStep.highlights"
                :key="highlight"
              >
                {{ highlight }}
              </span>
            </div>
          </div>
        </article>

        <article
          v-else-if="currentStep.type === 'choice' && currentQuestion"
          class="challenge-question"
        >
          <p>{{ currentQuestion.prompt }}</p>

          <div class="challenge-options">
            <button
              v-for="option in shuffledOptions"
              :key="option"
              :class="getOptionClass(option)"
              :disabled="isAnswered"
              @click="checkChoiceAnswer(option)"
            >
              {{ option }}
            </button>
          </div>
        </article>

        <article
          v-else-if="currentStep.type === 'input' && currentQuestion"
          class="challenge-question"
        >
          <p>{{ currentQuestion.prompt }}</p>

          <div class="input-wrapper ui-unit challenge-input-wrap">
            <input
              ref="answerInput"
              v-model="userAnswer"
              type="text"
              class="pill-input"
              :placeholder="inputPlaceholder"
              :disabled="isAnswered"
              :class="{
                'input-correct': isAnswered && isCorrect,
                'input-wrong': isAnswered && isCorrect === false,
              }"
              @keyup.enter="handleInputEnter"
            />
          </div>
        </article>

        <transition name="fade">
          <div
            v-if="isAnswered"
            :class="['feedback-box', isCorrect ? 'fb-correct' : 'fb-wrong']"
          >
            <p
              v-if="!isCorrect"
              class="wrong-highlight"
            >
              Helyes válasz:
              <span>{{ currentQuestion.answer }}</span>
            </p>

            <p class="feedback-text">
              {{ isCorrect ? "Richtig! ✓" : "Falsch! ✗" }}
            </p>

            <div class="example-box">
              <p>{{ currentQuestion.explanation }}</p>
            </div>
          </div>
        </transition>

        <div class="challenge-actions">
          <button
            v-if="currentStep.type === 'reading'"
            class="pill-button btn-green"
            @click="goNextStep"
          >
            Tovább a kérdésekhez
          </button>

          <button
            v-else-if="currentStep.type === 'input' && !isAnswered"
            class="pill-button btn-green"
            :disabled="!userAnswer.trim()"
            @click="checkInputAnswer"
          >
            Ellenőrzés
          </button>

          <button
            v-if="currentStep.type !== 'reading' && isAnswered"
            class="pill-button btn-blue"
            @click="nextQuestion"
          >
            Következő
          </button>
        </div>
      </section>
    </PracticeLayout>

    <div
      v-if="showStatistics"
      class="ui-overlay"
    >
      <div class="ui-modal">
        <h2>Challenge kész</h2>

        <p>
          Eredmény:
          <span class="correct-text">{{ correctAnswers }}/{{ totalQuestions }}</span>
        </p>

        <button
          class="pill-button btn-green"
          @click="restartChallenge"
        >
          Újrakezdés
        </button>

        <button
          class="pill-button btn-blue"
          @click="$emit('go-dashboard')"
        >
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PracticeLayout from "./PracticeLayout.vue";
import { dailyChallenges } from "../data/dailyChallenges";
import { saveExerciseResult } from "../services/exerciseResultService";

export default {
  name: "DailyChallengePractice",

  components: {
    PracticeLayout,
  },

  props: {
    challengeId: {
      type: String,
      default: "passiv-news-traffic",
    },
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      currentStepIndex: 0,
      currentQuestionIndex: 0,
      selectedAnswer: "",
      userAnswer: "",
      shuffledOptions: [],
      isAnswered: false,
      isCorrect: null,
      correctAnswers: 0,
      showStatistics: false,
    };
  },

  computed: {
    challenge() {
      return (
        dailyChallenges.find((challenge) => challenge.id === this.challengeId) ||
        dailyChallenges[0]
      );
    },

    currentStep() {
      return this.challenge.steps[this.currentStepIndex] || null;
    },

    currentQuestion() {
      return this.currentStep?.questions?.[this.currentQuestionIndex] || null;
    },

    progressPercent() {
      return Math.round((this.currentStepIndex / this.challenge.steps.length) * 100);
    },

    inputPlaceholder() {
      if (this.currentStep?.id === "vocabulary") return "pl. die Wohnung";
      if (this.currentStep?.id === "declension") return "pl. schönen";
      return this.challenge.focus === "Passiv" ? "Passiv mondat..." : "Válasz...";
    },

    totalQuestions() {
      return this.challenge.steps.reduce(
        (sum, step) => sum + (step.questions?.length || 0),
        0,
      );
    },

    resultType() {
      const resultMap = {
        "passiv-news-traffic": "daily-challenge",
        "adjektiv-apartment-viewing": "daily-challenge-adjektiv",
        "konjunktiv-ii-career-decision": "daily-challenge-konjunktiv-ii",
      };

      return resultMap[this.challengeId] || "daily-challenge";
    },
  },

  watch: {
    challengeId() {
      this.restartChallenge();
    },
  },

  mounted() {
    this.prepareChoiceOptions();
  },

  methods: {
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

    getAcceptedAnswers(question) {
      return [question.answer, ...(question.alternatives || [])].map(
        this.normalizeAnswer,
      );
    },

    shuffleOptions(options) {
      const shuffled = [...(options || [])];

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[index],
        ];
      }

      return shuffled;
    },

    prepareChoiceOptions() {
      if (this.currentStep?.type !== "choice" || !this.currentQuestion) {
        this.shuffledOptions = [];
        return;
      }

      const options = this.shuffleOptions(this.currentQuestion.options);

      if (options.length > 1 && options[0] === this.currentQuestion.answer) {
        const offset = 1 + Math.floor(Math.random() * (options.length - 1));
        [options[0], options[offset]] = [options[offset], options[0]];
      }

      this.shuffledOptions = options;
    },

    checkChoiceAnswer(option) {
      if (this.isAnswered || !this.currentQuestion) return;

      this.selectedAnswer = option;
      this.isAnswered = true;
      this.isCorrect = option === this.currentQuestion.answer;

      if (this.isCorrect) {
        this.correctAnswers += 1;
      }
    },

    checkInputAnswer() {
      if (this.isAnswered || !this.currentQuestion) return;

      const userValue = this.normalizeAnswer(this.userAnswer);
      const acceptedAnswers = this.getAcceptedAnswers(this.currentQuestion);

      this.isAnswered = true;
      this.isCorrect = acceptedAnswers.includes(userValue);

      if (this.isCorrect) {
        this.correctAnswers += 1;
      }
    },

    getOptionClass(option) {
      if (!this.isAnswered) return "";

      if (option === this.currentQuestion.answer) {
        return "correct";
      }

      if (option === this.selectedAnswer && !this.isCorrect) {
        return "wrong";
      }

      return "muted";
    },

    handleInputEnter() {
      if (!this.isAnswered && this.userAnswer.trim()) {
        this.checkInputAnswer();
        return;
      }

      if (this.isAnswered) {
        this.nextQuestion();
      }
    },

    nextQuestion() {
      if (
        this.currentStep?.questions &&
        this.currentQuestionIndex < this.currentStep.questions.length - 1
      ) {
        this.currentQuestionIndex += 1;
        this.resetQuestionState();
        return;
      }

      this.goNextStep();
    },

    goNextStep() {
      if (this.currentStepIndex < this.challenge.steps.length - 1) {
        this.currentStepIndex += 1;
        this.currentQuestionIndex = 0;
        this.resetQuestionState();
        return;
      }

      this.finishChallenge();
    },

    resetQuestionState() {
      this.selectedAnswer = "";
      this.userAnswer = "";
      this.prepareChoiceOptions();
      this.isAnswered = false;
      this.isCorrect = null;

      if (this.currentStep?.type === "input") {
        this.$nextTick(() => {
          this.$refs.answerInput?.focus();
        });
      }
    },

    async finishChallenge() {
      this.showStatistics = true;

      try {
        await saveExerciseResult(
          this.resultType,
          this.correctAnswers,
          this.totalQuestions,
        );
        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Daily Challenge eredmény mentési hiba:", error.message);
      }
    },

    restartChallenge() {
      this.currentStepIndex = 0;
      this.currentQuestionIndex = 0;
      this.correctAnswers = 0;
      this.showStatistics = false;
      this.resetQuestionState();
    },
  },
};
</script>

<style scoped>
.daily-challenge-practice {
  max-width: 920px;
}

.challenge-hero {
  width: min(920px, 100%);
  margin: 0 auto 22px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
  text-align: left;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
}

.challenge-hero > div:first-child {
  min-width: 0;
}

.challenge-hero span,
.challenge-step-head > span {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.14);
  color: #8fe6ff;
  font-size: 0.78rem;
  font-weight: 950;
}

.challenge-hero h1 {
  margin: 12px 0 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.04;
}

.challenge-hero p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 850;
}

.challenge-hero-icon {
  width: 88px;
  height: 88px;
  flex: 0 0 auto;
  border-radius: 28px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea, #43e97b);
  font-size: 2.25rem;
}

.daily-challenge-practice :deep(.practice-layout),
.daily-challenge-practice :deep(.practice-box) {
  width: min(920px, 100%);
}

.challenge-step {
  display: grid;
  gap: 22px;
  width: 100%;
}

.challenge-step-head {
  display: grid;
  gap: 12px;
  text-align: left;
}

.challenge-step-head h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.65rem;
  font-weight: 950;
}

.challenge-step-head p {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 850;
}

.challenge-reading,
.challenge-question {
  padding: 24px;
  border-radius: 26px;
  background: rgba(0, 0, 0, 0.18);
  text-align: left;
}

.challenge-reading {
  display: grid;
  gap: 16px;
}

.challenge-reading p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.02rem;
  font-weight: 750;
  line-height: 1.75;
}

.challenge-highlight-box {
  display: grid;
  gap: 12px;
  margin-top: 6px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(102, 126, 234, 0.14);
}

.challenge-highlight-box strong {
  color: #ffffff;
}

.challenge-highlight-box div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.challenge-highlight-box span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 850;
}

.challenge-question p {
  margin: 0 0 18px;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.35;
}

.challenge-options {
  display: grid;
  gap: 12px;
}

.challenge-options button {
  min-height: 58px;
  padding: 15px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
  font: inherit;
  font-size: 0.98rem;
  font-weight: 850;
  text-align: left;
  cursor: pointer;
}

.challenge-options button.correct {
  border-color: rgba(46, 204, 113, 0.45);
  background: rgba(46, 204, 113, 0.16);
}

.challenge-options button.wrong {
  border-color: rgba(255, 71, 87, 0.45);
  background: rgba(255, 71, 87, 0.14);
}

.challenge-options button.muted {
  opacity: 0.5;
}

.challenge-input-wrap,
.daily-challenge-practice :deep(.feedback-box) {
  width: 100%;
}

.challenge-actions {
  display: flex;
  justify-content: center;
}

.example-box {
  margin-top: 15px;
  text-align: left;
}

.example-box p {
  margin: 0;
}

@media (max-width: 700px) {
  .daily-challenge-practice {
    width: min(100%, calc(100vw - 30px));
  }

  .challenge-hero {
    width: 100%;
    padding: 22px;
    border-radius: 26px;
    display: block;
  }

  .challenge-hero-icon {
    display: none;
  }

  .challenge-hero h1 {
    font-size: clamp(2rem, 9vw, 2.75rem);
    overflow-wrap: anywhere;
  }

  .challenge-hero p {
    font-size: 1rem;
    line-height: 1.45;
  }

  .challenge-reading,
  .challenge-question {
    padding: 18px;
    border-radius: 22px;
  }
}
</style>
