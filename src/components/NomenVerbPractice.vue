<template>
  <div class="verb-practice practice-container">
    <h1>Nomen-Verb-Verbindungen</h1>

    <div class="progress-container ui-unit">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <p class="progress-text">
        Kérdés: <strong>{{ displayIndex }}</strong> / {{ totalQuestionsInRound }}
      </p>
    </div>

    <div v-if="currentQuestion && !showStatistics" class="quiz-area">
      <div class="question-card">
        <h2 class="display-word">{{ currentQuestion.nomen }} ...</h2>
        <p class="display-meaning">({{ currentQuestion.meaning }})</p>
      </div>

      <div class="input-wrapper ui-unit">
        <input
          ref="answerInput"
          v-model="userAnswer"
          type="text"
          class="pill-input"
          placeholder="Írd be az igét..."
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
            <span>{{ currentQuestion.verb }}</span>
          </p>

          <p class="feedback-text">
            {{ isCorrect ? 'Richtig! ✓' : 'Falsch! ✗' }}
          </p>

          <div class="example-box">
            <div class="german-example">
              <strong>Beispiel:</strong>
              <p>{{ currentQuestion.example }}</p>
            </div>

            <div class="hungarian-translation">
              <strong>Magyarul:</strong>
              <p>{{ currentQuestion.translation }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <div class="stats-summary">
          <p>
            Helyes:
            <span class="correct-text">{{ correctAnswersInRound }}</span>
            |
            Helytelen:
            <span class="wrong-text">{{ incorrectAnswersInRound }}</span>
          </p>
        </div>

        <p v-if="incorrectAnswersInRound === 0" class="success-msg">
          🌟 Hibátlan! Jöhet a következő 10!
        </p>

        <p v-else class="fail-msg">
          ❌ Volt benne hiba. Csak a hibásakat ismételjük újra!
        </p>

        <div class="solved-list">
          <div
            v-for="item in roundHistory"
            :key="`${item.nomen}-${item.correctAnswer}`"
            :class="['history-item', item.isCorrect ? 'h-correct' : 'h-wrong']"
          >
            <strong>{{ item.nomen }}</strong>
            {{ item.isCorrect ? '✓' : '✗' }}
            ({{ item.correctAnswer }})
          </div>
        </div>

        <button class="pill-button btn-green" @click="startNextAction">
          {{ incorrectAnswersInRound === 0 ? 'Új kör indítása' : 'Hibásak újragyakorlása' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import nomenData from "../data/nomen.json";
import { supabase } from "../supabase";

export default {
  name: "NomenVerbPractice",

  data() {
    return {
      allQuestions: nomenData,
      currentRoundQuestions: [],
      currentQuestionIndex: 0,
      roundHistory: [],
      wrongQuestions: [],
      currentQuestion: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      totalQuestionsInRound: 10,
      defaultQuestionsPerRound: 10,
    };
  },

  computed: {
    progressPercentage() {
      if (!this.totalQuestionsInRound) return 0;

      return Math.round(
        (this.roundHistory.length / this.totalQuestionsInRound) * 100
      );
    },

    displayIndex() {
      return Math.min(
        this.currentQuestionIndex,
        this.totalQuestionsInRound
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
      this.totalQuestionsInRound = this.defaultQuestionsPerRound;
      this.currentRoundQuestions = this.shuffle(this.allQuestions).slice(
        0,
        this.totalQuestionsInRound
      );

      this.startRound();
    },

    startRound() {
      this.roundHistory = [];
      this.wrongQuestions = [];
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.currentQuestionIndex = 0;
      this.showStatistics = false;
      this.setNextQuestion();
    },

    setNextQuestion() {
      if (this.currentQuestionIndex >= this.currentRoundQuestions.length) {
        this.currentQuestion = null;
        this.showStatistics = true;
        this.saveResultToDatabase();
        return;
      }

      this.currentQuestion = this.currentRoundQuestions[this.currentQuestionIndex];
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
      if (this.isAnswered || !this.userAnswer.trim() || !this.currentQuestion) {
        return;
      }

      const userValue = this.normalizeAnswer(this.userAnswer);
      const correctValue = this.normalizeAnswer(this.currentQuestion.verb);

      this.isAnswered = true;
      this.isCorrect = userValue === correctValue;

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
      } else {
        this.incorrectAnswersInRound += 1;
        this.wrongQuestions.push(this.currentQuestion);
      }

      this.roundHistory.push({
        nomen: this.currentQuestion.nomen,
        userAnswer: this.userAnswer.trim(),
        correctAnswer: this.currentQuestion.verb,
        isCorrect: this.isCorrect,
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

    startNextAction() {
      if (this.incorrectAnswersInRound === 0) {
        this.pickNewSet();
        return;
      }

      this.currentRoundQuestions = this.shuffle(this.wrongQuestions);
      this.totalQuestionsInRound = this.currentRoundQuestions.length;
      this.startRound();
    },

    async saveResultToDatabase() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { error } = await supabase.from("exercise_results").insert([
          {
            user_id: session.user.id,
            exercise_type: "nomen-verb",
            score: this.correctAnswersInRound,
            max_score: this.totalQuestionsInRound,
          },
        ]);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Hiba a mentésnél:", error.message);
      }
    },
  },
};
</script>