<template>
  <div class="practice-container praeposition-practice">
    <h1>Präpositional-Ergänzungen</h1>

    <div class="progress-container ui-unit">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <p class="progress-text">
        Kérdés: <strong>{{ currentQuestionIndex }}</strong> / {{ questionsPerRound }}
      </p>
    </div>

    <div v-if="currentQuestion && !showStatistics" class="quiz-area">
      <div class="question-card">
        <h2 class="display-word">{{ currentQuestion.verb }}</h2>
        <p class="display-meaning">({{ currentQuestion.meaning }})</p>
        <p class="gap-sentence">{{ currentQuestion.gapSentence }}</p>
      </div>

      <div class="input-wrapper ui-unit">
        <input
          ref="answerInput"
          v-model="userAnswer"
          type="text"
          class="pill-input"
          placeholder="pl. auf"
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
            <span>{{ currentQuestion.preposition }}</span>
          </p>

          <p class="feedback-text">
            {{ isCorrect ? 'Richtig! ✓' : 'Falsch! ✗' }}
          </p>

          <div class="example-box">
            <p><strong>Vonzat:</strong> {{ currentQuestion.verb }} {{ currentQuestion.preposition }} + {{ currentQuestion.caseType }}</p>
            <p><strong>Példa:</strong> {{ currentQuestion.example }}</p>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <p>
          Eredmény:
          <span class="correct-text">{{ correctAnswersInRound }} / {{ questionsPerRound }}</span>
        </p>

        <button class="pill-button btn-green" @click="startNextAction">
          {{ incorrectAnswersInRound === 0 ? 'Új kör indítása' : 'Hibásak újragyakorlása' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { praepositionenData } from "../data/praepositionen.js";
import { supabase } from "../supabase";

export default {
  name: "PraepositionPractice",

  data() {
    return {
      allQuestions: praepositionenData,
      currentRoundQuestions: [],
      unansweredQuestions: [],
      currentQuestion: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      currentQuestionIndex: 0,
      questionsPerRound: 10,
    };
  },

  computed: {
    progressPercent() {
      return Math.round((this.currentQuestionIndex / this.questionsPerRound) * 100);
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
      this.currentRoundQuestions = this.shuffle(this.allQuestions).slice(0, this.questionsPerRound);
      this.startRound();
    },

    startRound() {
      this.unansweredQuestions = this.shuffle(this.currentRoundQuestions);
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.currentQuestionIndex = 0;
      this.showStatistics = false;
      this.setNextQuestion();
    },

    setNextQuestion() {
      if (!this.unansweredQuestions.length) {
        this.currentQuestion = null;
        this.showStatistics = true;
        this.saveResults();
        return;
      }

      this.currentQuestion = this.unansweredQuestions.pop();
      this.currentQuestionIndex += 1;
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

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    },

    checkAnswer() {
      if (this.isAnswered || !this.currentQuestion) return;

      const userValue = this.normalizeAnswer(this.userAnswer);
      const correctValue = this.normalizeAnswer(this.currentQuestion.preposition);

      this.isAnswered = true;
      this.isCorrect = userValue === correctValue;

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
      } else {
        this.incorrectAnswersInRound += 1;
      }
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

    nextQuestion() {
      this.setNextQuestion();
    },

    startNextAction() {
      if (this.incorrectAnswersInRound === 0) {
        this.pickNewSet();
      } else {
        this.startRound();
      }
    },

    async saveResults() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { error } = await supabase.from("exercise_results").insert([
          {
            user_id: session.user.id,
            exercise_type: "praeposition",
            score: this.correctAnswersInRound,
            max_score: this.questionsPerRound,
          },
        ]);

        if (error) throw error;
      } catch (error) {
        console.error("Präposition eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.praeposition-practice {
  max-width: 600px;
}

.gap-sentence {
  max-width: 420px;
  margin: 18px auto 24px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  font-size: 1.15rem;
  line-height: 1.6;
}

.example-box {
  margin-top: 15px;
  text-align: left;
}

.example-box p {
  margin: 8px 0;
}

.correct-text {
  color: #2ecc71;
  font-weight: 900;
}
</style>