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
      <div
        v-if="showTable"
        class="modal-overlay"
        @click.self="showTable = false"
      >
        <div class="modal-content">
          <button class="close-modal" @click="showTable = false">×</button>

          <h2>Adjektivdeklinationen</h2>

          <div class="table-scroll">
            <h3>Schwache Deklination</h3>
            <table>
              <tr>
                <th>Kasus</th>
                <th>Maskulin</th>
                <th>Feminin</th>
                <th>Neutral</th>
                <th>Plural</th>
              </tr>
              <tr>
                <td>Nom.</td>
                <td>-e</td>
                <td>-e</td>
                <td>-e</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Akk.</td>
                <td>-en</td>
                <td>-e</td>
                <td>-e</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Dat.</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Gen.</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
              </tr>
            </table>

            <h3>Gemischte Deklination</h3>
            <table>
              <tr>
                <th>Kasus</th>
                <th>Maskulin</th>
                <th>Feminin</th>
                <th>Neutral</th>
                <th>Plural</th>
              </tr>
              <tr>
                <td>Nom.</td>
                <td>-er</td>
                <td>-e</td>
                <td>-es</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Akk.</td>
                <td>-en</td>
                <td>-e</td>
                <td>-es</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Dat.</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Gen.</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
                <td>-en</td>
              </tr>
            </table>

            <h3>Starke Deklination</h3>
            <table>
              <tr>
                <th>Kasus</th>
                <th>Maskulin</th>
                <th>Feminin</th>
                <th>Neutral</th>
                <th>Plural</th>
              </tr>
              <tr>
                <td>Nom.</td>
                <td>-er</td>
                <td>-e</td>
                <td>-es</td>
                <td>-e</td>
              </tr>
              <tr>
                <td>Akk.</td>
                <td>-en</td>
                <td>-e</td>
                <td>-es</td>
                <td>-e</td>
              </tr>
              <tr>
                <td>Dat.</td>
                <td>-em</td>
                <td>-er</td>
                <td>-em</td>
                <td>-en</td>
              </tr>
              <tr>
                <td>Gen.</td>
                <td>-en</td>
                <td>-er</td>
                <td>-en</td>
                <td>-er</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="!selectedCase" class="case-selector">
      <p class="subtitle">Válaszd ki, melyik esetet szeretnéd gyakorolni:</p>

      <div class="case-grid ui-unit">
        <button class="btn-case" @click="selectCase('Nominativ')">
          Nominativ
        </button>

        <button class="btn-case" @click="selectCase('Akkusativ')">
          Akkusativ
        </button>

        <button class="btn-case" @click="selectCase('Dativ')">Dativ</button>

        <button class="btn-case" @click="selectCase('Genitiv')">Genitiv</button>

        <button class="btn-case btn-mixed" @click="selectCase('Mixed')">
          Vegyes gyakorlat
        </button>
      </div>
    </div>

    <PracticeLayout
      v-else
      :progress="progressPercentage"
      :current="displayIndex"
      :total="totalQuestionsInRound"
    >
      <template #xp>
        <div class="xp-card">
          <div class="xp-top">
            <div class="xp-mini-card">
              <span>🔥</span>

              <div>
                <strong>{{ xpProfile.streak_days }}</strong>
                <small>napos széria</small>
              </div>
            </div>

            <div class="xp-mini-card">
              <span>⭐</span>

              <div>
                <strong>{{ xpProfile.xp }}</strong>
                <small>XP</small>
              </div>
            </div>
          </div>

          <div class="level-area">
            <div class="level-badge">Level {{ xpProfile.level }}</div>

            <div class="xp-progress-info">
              <span>{{ xpIntoCurrentLevel }}/100 XP</span>
              <span>Következő szint</span>
            </div>

            <div class="xp-progress">
              <div
                class="xp-progress-fill"
                :style="{ width: xpProgressPercent + '%' }"
              ></div>
            </div>

            <p class="xp-hint">+5 XP következő helyes válaszért</p>
          </div>
        </div>
      </template>

      <div v-if="currentQuestion && !showStatistics" class="quiz-area">
        <div class="case-indicator">
          Mód: <strong>{{ selectedCase }}</strong>
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
            class="practice-input"
            placeholder="Névelő + Melléknév + Főnév"
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
            class="practice-btn-primary"
            :disabled="!userAnswer.trim()"
            @click="checkAnswer"
          >
            Ellenőrzés
          </button>

          <button v-else class="practice-btn-secondary" @click="nextQuestion">
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
              <p>
                <strong>Szabály:</strong>
                {{ currentQuestion.rule }}
              </p>
            </div>
          </div>
        </transition>
      </div>
    </PracticeLayout>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>
          {{
            correctAnswersInRound === totalQuestionsInRound
              ? "Tökéletes!"
              : "Kör vége"
          }}
        </h2>

        <div class="stats-summary">
          <p>
            Helyes:
            <span class="correct-text">{{ correctAnswersInRound }}</span>
            | Helytelen:
            <span class="wrong-text">{{ incorrectAnswersInRound }}</span>
          </p>
        </div>

        <p v-if="incorrectAnswersInRound === 0" class="success-msg">
          🌟 Hibátlan! Jöhet a következő kör!
        </p>

        <p v-else class="fail-msg">
          ❌ Volt benne hiba. Csak a hibásakat ismételjük újra!
        </p>

        <button class="practice-btn-dark" @click="startNextAction">
          {{
            incorrectAnswersInRound === 0
              ? "Következő kör"
              : "Hibásak újragyakorlása"
          }}
        </button>

        <button class="practice-btn-secondary" @click="resetToSelector">
          Másik eset választása
        </button>

        <button class="practice-btn-primary" @click="$emit('go-dashboard')">
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import adjektivData from "../data/adjektiv.json";
import { fetchActiveExerciseItems } from "../services/exerciseItemService";
import { recordMistake } from "../services/mistakeBankService";
import { supabase } from "../supabase";
import PracticeLayout from "./PracticeLayout.vue";

export default {
  name: "AdjektivPractice",

  components: {
    PracticeLayout,
  },

  data() {
    return {
      showTable: false,
      selectedCase: null,
      allQuestions: adjektivData,
      filteredDeck: [],
      currentRoundBatch: [],
      wrongQuestions: [],
      roundHistory: [],
      currentQuestion: null,
      userAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      totalQuestionsInRound: 5,
      defaultQuestionsPerRound: 5,

      xpProfile: {
        xp: 0,
        level: 1,
        streak_days: 0,
        today_xp: 0,
      },

      xpPerLevel: 100,
    };
  },

  computed: {
    progressPercentage() {
      if (!this.totalQuestionsInRound) return 0;

      return Math.round(
        (this.roundHistory.length / this.totalQuestionsInRound) * 100,
      );
    },

    displayIndex() {
      return Math.min(this.roundHistory.length + 1, this.totalQuestionsInRound);
    },

    xpIntoCurrentLevel() {
      return this.xpProfile.xp % this.xpPerLevel;
    },

    xpProgressPercent() {
      return Math.min((this.xpIntoCurrentLevel / this.xpPerLevel) * 100, 100);
    },
  },

  async created() {
    await this.loadQuestions();
    this.loadXpProfile();
  },

  methods: {
    openTable() {
      this.showTable = true;
    },

    async loadQuestions() {
      try {
        const databaseQuestions = await fetchActiveExerciseItems("adjektiv");
        this.allQuestions = [...adjektivData, ...databaseQuestions];
      } catch (error) {
        console.error("Adjektiv feladatok betöltési hiba:", error.message);
        this.allQuestions = adjektivData;
      }
    },

    async loadXpProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("xp,level,streak_days,today_xp")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("XP betöltési hiba:", error.message);
          return;
        }

        if (data) {
          this.xpProfile = {
            xp: data.xp || 0,
            level: data.level || 1,
            streak_days: data.streak_days || 0,
            today_xp: data.today_xp || 0,
          };
        }
      } catch (error) {
        console.error("XP betöltési váratlan hiba:", error.message);
      }
    },

    async addXp(amount = 5) {
      const oldXp = this.xpProfile.xp || 0;
      const oldTodayXp = this.xpProfile.today_xp || 0;

      const newXp = oldXp + amount;
      const newTodayXp = oldTodayXp + amount;
      const newLevel = Math.floor(newXp / this.xpPerLevel) + 1;

      this.xpProfile.xp = newXp;
      this.xpProfile.today_xp = newTodayXp;
      this.xpProfile.level = newLevel;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { error } = await supabase
          .from("profiles")
          .update({
            xp: newXp,
            level: newLevel,
            today_xp: newTodayXp,
            last_activity: new Date().toISOString(),
          })
          .eq("id", session.user.id);

        if (error) {
          console.error("XP mentési hiba:", error.message);
        }
      } catch (error) {
        console.error("XP hiba:", error.message);
      }
    },

    shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    },

    selectCase(selectedCase) {
      this.selectedCase = selectedCase;
      this.pickNewSet();
    },

    pickNewSet() {
      const pool =
        this.selectedCase === "Mixed"
          ? [...this.allQuestions]
          : this.allQuestions.filter(
              (question) => question.case === this.selectedCase,
            );

      this.totalQuestionsInRound = Math.min(
        this.defaultQuestionsPerRound,
        pool.length,
      );

      this.currentRoundBatch = this.shuffle(pool).slice(
        0,
        this.totalQuestionsInRound,
      );

      this.startRound();
    },

    startRound() {
      this.roundHistory = [];
      this.wrongQuestions = [];
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.showStatistics = false;

      this.filteredDeck = this.shuffle(this.currentRoundBatch);
      this.setNextQuestion();
    },

    setNextQuestion() {
      if (
        this.roundHistory.length >= this.totalQuestionsInRound ||
        !this.filteredDeck.length
      ) {
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
      const correctValue = this.normalizeAnswer(this.currentQuestion.correct);

      this.isCorrect = userValue === correctValue;
      this.isAnswered = true;

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
        this.addXp(5);
      } else {
        this.incorrectAnswersInRound += 1;
        this.wrongQuestions.push(this.currentQuestion);
        this.recordAdjektivMistake();
      }

      this.roundHistory.push({
        isCorrect: this.isCorrect,
      });
    },

    recordAdjektivMistake() {
      if (!this.currentQuestion) return;

      recordMistake({
        type: "adjektiv",
        label: "Adjektivdekl.",
        sourceId: this.currentQuestion.id || this.currentQuestion.correct,
        prompt: `${this.currentQuestion.context} ...`,
        correctAnswer: this.currentQuestion.correct,
        userAnswer: this.userAnswer,
        explanation: this.currentQuestion.rule,
        level: "B1",
        meta: {
          article: this.currentQuestion.elements.article,
          adjective: this.currentQuestion.elements.adj,
          noun: this.currentQuestion.elements.noun,
          case: this.currentQuestion.case,
          rule: this.currentQuestion.rule,
        },
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

      this.currentRoundBatch = this.shuffle(this.wrongQuestions);
      this.totalQuestionsInRound = this.currentRoundBatch.length;
      this.startRound();
    },

    resetToSelector() {
      this.selectedCase = null;
      this.showStatistics = false;
      this.currentRoundBatch = [];
      this.filteredDeck = [];
      this.wrongQuestions = [];
      this.roundHistory = [];
      this.currentQuestion = null;
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.totalQuestionsInRound = this.defaultQuestionsPerRound;
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

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Hiba az eredmény mentésekor:", error.message);
      }
    },
  },
};
</script>

<style scoped src="./AdjektivPractice.css"></style>
