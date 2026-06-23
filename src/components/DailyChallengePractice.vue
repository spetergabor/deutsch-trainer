<template>
  <div class="practice-container daily-challenge-practice nemet-page-shell">
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
              class="practice-input"
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
            class="practice-btn-primary"
            @click="goNextStep"
          >
            Tovább a kérdésekhez
          </button>

          <button
            v-else-if="currentStep.type === 'input' && !isAnswered"
            class="practice-btn-primary"
            :disabled="!userAnswer.trim()"
            @click="checkInputAnswer"
          >
            Ellenőrzés
          </button>

          <button
            v-if="currentStep.type !== 'reading' && isAnswered"
            class="practice-btn-secondary"
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
          class="practice-btn-primary"
          @click="restartChallenge"
        >
          Újrakezdés
        </button>

        <button
          class="practice-btn-secondary"
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

<style scoped src="../assets/styles/practice-legacy.css"></style>
