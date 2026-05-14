<template>
  <div class="adjektiv-practice practice-container">
    <div class="top-info-wrapper">
      <button
        v-if="selectedCase && !showStatistics"
        class="info-btn"
        @click="showTable = true"
      >
        ℹ️ Táblázat megnyitása
      </button>
    </div>

    <h1>Adjektivdeklination</h1>

    <transition name="fade">
      <div v-if="showTable" class="modal-overlay" @click.self="showTable = false">
        <div class="modal-content">
          <button class="close-modal" @click="showTable = false">×</button>

          <h2>Adjektivdeklinationen</h2>

          <div class="table-scroll">
            <h3>Schwache Deklination</h3>
            <table>
              <tr><th>Kasus</th><th>Maskulin</th><th>Feminin</th><th>Neutral</th><th>Plural</th></tr>
              <tr><td>Nom.</td><td>-e</td><td>-e</td><td>-e</td><td>-en</td></tr>
              <tr><td>Akk.</td><td>-en</td><td>-e</td><td>-e</td><td>-en</td></tr>
              <tr><td>Dat.</td><td>-en</td><td>-en</td><td>-en</td><td>-en</td></tr>
              <tr><td>Gen.</td><td>-en</td><td>-en</td><td>-en</td><td>-en</td></tr>
            </table>

            <h3>Gemischte Deklination</h3>
            <table>
              <tr><th>Kasus</th><th>Maskulin</th><th>Feminin</th><th>Neutral</th><th>Plural</th></tr>
              <tr><td>Nom.</td><td>-er</td><td>-e</td><td>-es</td><td>-en</td></tr>
              <tr><td>Akk.</td><td>-en</td><td>-e</td><td>-es</td><td>-en</td></tr>
              <tr><td>Dat.</td><td>-en</td><td>-en</td><td>-en</td><td>-en</td></tr>
              <tr><td>Gen.</td><td>-en</td><td>-en</td><td>-en</td><td>-en</td></tr>
            </table>

            <h3>Starke Deklination</h3>
            <table>
              <tr><th>Kasus</th><th>Maskulin</th><th>Feminin</th><th>Neutral</th><th>Plural</th></tr>
              <tr><td>Nom.</td><td>-er</td><td>-e</td><td>-es</td><td>-e</td></tr>
              <tr><td>Akk.</td><td>-en</td><td>-e</td><td>-es</td><td>-e</td></tr>
              <tr><td>Dat.</td><td>-em</td><td>-er</td><td>-em</td><td>-en</td></tr>
              <tr><td>Gen.</td><td>-en</td><td>-er</td><td>-en</td><td>-er</td></tr>
            </table>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="!selectedCase" class="case-selector">
      <p class="subtitle">Válaszd ki, melyik esetet szeretnéd gyakorolni:</p>

      <div class="case-grid ui-unit">
        <button class="btn-case" @click="selectCase('Nominativ')">Nominativ</button>
        <button class="btn-case" @click="selectCase('Akkusativ')">Akkusativ</button>
        <button class="btn-case" @click="selectCase('Dativ')">Dativ</button>
        <button class="btn-case" @click="selectCase('Genitiv')">Genitiv</button>
        <button class="btn-case btn-mixed" @click="selectCase('Mixed')">Vegyes gyakorlat</button>
      </div>
    </div>

    <div v-else-if="currentQuestion && !showStatistics" class="quiz-area">
      <div class="case-indicator">
        Mód: <strong>{{ selectedCase }}</strong>
      </div>

      <div class="progress-container ui-unit">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>

        <p class="progress-text">
          Kérdés: <strong>{{ displayIndex }}</strong> / {{ totalQuestionsInRound }}
        </p>
      </div>

      <div class="question-card ui-unit">
        <p class="display-meaning">{{ currentQuestion.context }} ...</p>

        <h2 class="adjektiv-display">
          ({{ currentQuestion.elements.article }} /
          {{ currentQuestion.elements.adj }} /
          {{ currentQuestion.elements.noun }})
        </h2>
      </div>

      <div class="input-wrapper ui-unit input-with-icon">
        <input
          ref="answerInput"
          v-model="userAnswer"
          type="text"
          class="pill-input"
          placeholder="Névelő + Melléknév + Főnév"
          :disabled="isAnswered"
          :class="{
            'input-correct': isAnswered && isCorrect,
            'input-wrong': isAnswered && isCorrect === false
          }"
          @keyup.enter="handleEnter"
        />

        <span v-if="isAnswered && isCorrect" class="input-icon correct-icon">✓</span>
        <span v-if="isAnswered && isCorrect === false" class="input-icon wrong-icon">✗</span>
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
            Helyes:
            <span>{{ currentQuestion.correct }}</span>
          </p>

          <div class="rule-details">
            <p><strong>Szabály:</strong> {{ currentQuestion.rule }}</p>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>{{ correctAnswersInRound === totalQuestionsInRound ? 'Tökéletes!' : 'Kör vége' }}</h2>

        <div class="stats-summary">
          <p>
            Helyes:
            <span class="correct-text">{{ correctAnswersInRound }}</span>
            |
            Helytelen:
            <span class="wrong-text">{{ incorrectAnswersInRound }}</span>
          </p>
        </div>

        <button class="pill-button btn-dark" @click="startRound(correctAnswersInRound !== totalQuestionsInRound)">
          {{ correctAnswersInRound === totalQuestionsInRound ? 'Következő kör' : 'Újrapróbálás ugyanazokkal' }}
        </button>

        <button class="pill-button btn-blue" @click="resetToSelector">
          Másik eset választása
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import adjektivData from "../data/adjektiv.json";
import { supabase } from "../supabase";

export default {
  name: "AdjektivPractice",

  data() {
    return {
      showTable: false,
      selectedCase: null,
      allQuestions: adjektivData,
      filteredDeck: [],
      currentRoundBatch: [],
      roundHistory: [],
      currentQuestion: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      totalQuestionsInRound: 5,
    };
  },

  computed: {
    progressPercentage() {
      return Math.round((this.roundHistory.length / this.totalQuestionsInRound) * 100);
    },

    displayIndex() {
      return Math.min(this.roundHistory.length + 1, this.totalQuestionsInRound);
    },
  },

  methods: {
    shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    },

    selectCase(selectedCase) {
      this.selectedCase = selectedCase;
      this.startRound(false);
    },

    startRound(isRepeat = false) {
      this.roundHistory = [];
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.showStatistics = false;

      if (!isRepeat) {
        const pool =
          this.selectedCase === "Mixed"
            ? [...this.allQuestions]
            : this.allQuestions.filter((question) => question.case === this.selectedCase);

        this.currentRoundBatch = this.shuffle(pool).slice(0, this.totalQuestionsInRound);
      }

      this.filteredDeck = this.shuffle(this.currentRoundBatch);
      this.setNextQuestion();
    },

    setNextQuestion() {
      if (this.roundHistory.length >= this.totalQuestionsInRound || !this.filteredDeck.length) {
        this.currentQuestion = null;
        this.showStatistics = true;
        this.saveResults();
        return;
      }

      this.currentQuestion = this.filteredDeck.pop();
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;

      this.$nextTick(() => {
        this.$refs.answerInput?.focus();
      });
    },

    normalizeAnswer(value) {
      return value.trim().toLowerCase().replace(/\s+/g, " ");
    },

    checkAnswer() {
      if (this.isAnswered || !this.userAnswer.trim() || !this.currentQuestion) return;

      const userValue = this.normalizeAnswer(this.userAnswer);
      const correctValue = this.normalizeAnswer(this.currentQuestion.correct);

      this.isCorrect = userValue === correctValue;
      this.isAnswered = true;

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
      } else {
        this.incorrectAnswersInRound += 1;
      }

      this.roundHistory.push({
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

    resetToSelector() {
      this.selectedCase = null;
      this.showStatistics = false;
      this.currentRoundBatch = [];
      this.filteredDeck = [];
      this.currentQuestion = null;
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;
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
            exercise_type: "adjektiv",
            score: this.correctAnswersInRound,
            max_score: this.totalQuestionsInRound,
          },
        ]);

        if (error) throw error;
      } catch (error) {
        console.error("Hiba az eredmény mentésekor:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.adjektiv-practice {
  max-width: 600px;
}

.top-info-wrapper {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.info-btn {
  width: auto;
  padding: 9px 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.case-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.btn-case {
  width: 100%;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-case:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.16);
}

.btn-mixed {
  grid-column: span 2;
  background: #3498db;
  border: 0;
}

.case-indicator {
  margin-bottom: 12px;
  color: #3498db;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.question-card {
  margin-bottom: 25px;
}

.adjektiv-display {
  margin: 0;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.25;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 15px;
  right: 18px;
  font-size: 20px;
  font-weight: 900;
}

.correct-icon {
  color: #2ecc71;
}

.wrong-icon {
  color: #e74c3c;
}

.rule-details {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  text-align: left;
  font-size: 0.9rem;
}

.correct-text {
  color: #2ecc71;
  font-weight: 900;
}

.wrong-text {
  color: #e74c3c;
  font-weight: 900;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
}

.modal-content {
  position: relative;
  width: min(760px, 100%);
  max-height: 85vh;
  padding: 30px;
  border-radius: 24px;
  background: #ffffff;
  color: #2c3e50;
  overflow: hidden;
}

.close-modal {
  position: absolute;
  top: 12px;
  right: 16px;
  width: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #2c3e50;
  font-size: 32px;
  cursor: pointer;
}

.table-scroll {
  overflow-y: auto;
  max-height: 68vh;
  margin-top: 12px;
}

.modal-content h3 {
  margin: 22px 0 10px;
  color: #3498db;
  font-size: 1.1rem;
}

table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th,
td {
  padding: 8px;
  border: 1px solid #dddddd;
  text-align: center;
}

th {
  background: #f8f9fa;
  font-weight: 800;
}

@media (max-width: 520px) {
  .case-grid {
    grid-template-columns: 1fr;
  }

  .btn-mixed {
    grid-column: auto;
  }

  .adjektiv-display {
    font-size: 1.45rem;
  }

  .modal-content {
    padding: 24px 16px;
  }
}
</style>