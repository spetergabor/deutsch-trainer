<template>
  <div class="verb-practice practice-container">
    <h1>Perfekt Gyakorló</h1>

    <div class="progress-container ui-unit">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <p class="progress-text">
        Kérdés: <strong>{{ currentRoundQuestionIndex }}</strong> / {{ questionsPerRound }}
      </p>
    </div>

    <div v-if="currentQuestion && !showStatistics" class="quiz-area">
      <div class="question-card">
        <h2 class="display-word">{{ currentQuestion.verb }}</h2>
        <p class="display-meaning">({{ currentQuestion.meaning }})</p>
      </div>

      <div class="input-wrapper ui-unit">
        <input
          ref="answerInput"
          v-model="userAnswer"
          type="text"
          class="pill-input"
          placeholder="pl. hat geholfen"
          :disabled="isAnswered"
          :class="{
            'input-correct': isAnswered && isCorrect,
            'input-wrong': isAnswered && isCorrect === false
          }"
          @keyup.enter="handleEnter"
        />
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

        <button
          v-else
          class="pill-button btn-blue"
          @click="nextQuestion"
        >
          Következő
        </button>
      </div>

      <transition name="fade">
        <div
          v-if="isAnswered"
          :class="['feedback-box', isCorrect ? 'fb-correct' : 'fb-wrong']"
        >
          <p v-if="!isCorrect" class="wrong-highlight">
            Helyes válasz:
            <span>{{ correctAnswer }}</span>
          </p>

          <p class="feedback-text">
            {{ isCorrect ? 'Richtig! ✓' : 'Falsch! ✗' }}
          </p>
        </div>
      </transition>
    </div>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <div class="stats-summary">
          <p>
            Eredmény:
            <span :class="incorrectAnswersInRound === 0 ? 'correct-text' : 'wrong-text'">
              {{ correctAnswersInRound }} / {{ questionsPerRound }}
            </span>
          </p>
        </div>

        <p v-if="incorrectAnswersInRound === 0" class="success-msg">
          🌟 Hibátlan! Jöhet a következő 10!
        </p>

        <p v-else class="fail-msg">
          ❌ Volt benne hiba. Csak a hibásakat ismételjük újra!
        </p>

        <button class="pill-button btn-green" @click="startNextAction">
          {{ incorrectAnswersInRound === 0 ? 'Új kör indítása' : 'Hibásak újragyakorlása' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import verbsData from "../data/verbs.json";
import { supabase } from "../supabase";

export default {
  name: "VerbPractice",

  data() {
    return {
      allVerbs: verbsData,
      currentRoundVerbs: [],
      unansweredInRound: [],
      wrongQuestions: [],
      currentQuestion: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      incorrectAnswersInRound: 0,
      currentRoundQuestionIndex: 0,
      questionsPerRound: 10,
      defaultQuestionsPerRound: 10,
    };
  },

  computed: {
    correctAnswer() {
      if (!this.currentQuestion) return "";

      return `${this.currentQuestion.auxiliary} ${this.currentQuestion.pastParticiple}`;
    },

    correctAnswersInRound() {
      return this.questionsPerRound - this.incorrectAnswersInRound;
    },

    progressPercent() {
      if (!this.questionsPerRound) return 0;

      return Math.round(
        (this.currentRoundQuestionIndex / this.questionsPerRound) * 100
      );
    },
  },

  created() {
    this.pickNewSet();
  },

  mounted() {
    this.focusInput();
  },

  methods: {
    shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    },

    pickNewSet() {
      this.questionsPerRound = this.defaultQuestionsPerRound;
      this.currentRoundVerbs = this.shuffle(this.allVerbs).slice(
        0,
        this.questionsPerRound
      );

      this.startRound();
    },

    startRound() {
      this.unansweredInRound = this.shuffle(this.currentRoundVerbs);
      this.wrongQuestions = [];
      this.incorrectAnswersInRound = 0;
      this.currentRoundQuestionIndex = 0;
      this.showStatistics = false;
      this.setNextQuestion();
    },

    setNextQuestion() {
      if (!this.unansweredInRound.length) {
        this.currentQuestion = null;
        this.showStatistics = true;
        this.saveResults();
        return;
      }

      this.currentQuestion = this.unansweredInRound.pop();
      this.currentRoundQuestionIndex += 1;
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;

      this.$nextTick(() => {
        this.focusInput();
      });
    },

    focusInput() {
      this.$refs.answerInput?.focus();
    },

    handleEnter() {
      if (!this.isAnswered && this.userAnswer.trim()) {
        this.checkAnswer();
        return;
      }

      if (this.isAnswered) {
        this.nextQuestion();
      }
    },

    checkAnswer() {
      if (this.isAnswered || !this.currentQuestion) return;

      const userValue = this.normalizeAnswer(this.userAnswer);
      const correctValue = this.normalizeAnswer(this.correctAnswer);

      this.isAnswered = true;
      this.isCorrect = userValue === correctValue;

      if (!this.isCorrect) {
        this.incorrectAnswersInRound += 1;
        this.wrongQuestions.push(this.currentQuestion);
      }
    },

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    },

    nextQuestion() {
      this.setNextQuestion();
    },

    startNextAction() {
      if (this.incorrectAnswersInRound === 0) {
        this.pickNewSet();
        return;
      }

      this.currentRoundVerbs = this.shuffle(this.wrongQuestions);
      this.questionsPerRound = this.currentRoundVerbs.length;
      this.startRound();
    },

    async saveResults() {
      const maxScore = this.questionsPerRound;
      const currentScore = maxScore - this.incorrectAnswersInRound;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { error } = await supabase.from("exercise_results").insert([
          {
            user_id: session.user.id,
            exercise_type: "perfekt",
            score: currentScore,
            max_score: maxScore,
          },
        ]);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Hiba az eredmény mentésekor:", error.message);
      }
    },
  },
};
</script>