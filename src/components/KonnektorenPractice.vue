<template>
  <div class="practice-container konnektoren-practice">
    <h1>Konnektoren Trainer</h1>

    <PracticeLayout
      :progress="progressPercent"
      :current="currentQuestionIndex"
      :total="questionsPerRound"
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
        <div class="question-card">
          <div class="tag-row">
            <span class="level-tag">
              {{ currentQuestion.level }}
            </span>

            <span class="category-tag">
              {{ currentQuestion.category }}
            </span>
          </div>

          <p class="sentence-card">
            {{ currentQuestion.sentence }}
          </p>
        </div>

        <div class="options-grid ui-unit">
          <button
            v-for="option in currentQuestion.options"
            :key="option"
            class="option-pill"
            :disabled="isAnswered"
            :class="getOptionClass(option)"
            @click="checkAnswer(option)"
          >
            {{ option }}
          </button>
        </div>

        <div class="button-group ui-unit">
          <button
            v-if="isAnswered"
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
              <span>{{ currentQuestion.correct }}</span>
            </p>

            <p class="feedback-text">
              {{ isCorrect ? "Richtig! ✓" : "Falsch! ✗" }}
            </p>

            <div class="example-box">
              <p>
                <strong>Jelentés:</strong>
                {{ currentQuestion.meaning }}
              </p>

              <p>
                <strong>Magyarázat:</strong>
                {{ currentQuestion.explanation }}
              </p>

              <p>
                <strong>Szórend:</strong>
                {{ currentQuestion.grammarTip }}
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
          Eredmény:
          <span class="correct-text">
            {{ correctAnswersInRound }} / {{ questionsPerRound }}
          </span>
        </p>

        <button class="pill-button btn-green" @click="startNextAction">
          {{
            incorrectAnswersInRound === 0
              ? "Új kör indítása"
              : "Hibásak újragyakorlása"
          }}
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
import { konnektorenData } from "../data/konnektoren.js";
import { fetchActiveExerciseItems } from "../services/exerciseItemService";
import { supabase } from "../supabase";

export default {
  name: "KonnektorenPractice",

  components: {
    PracticeLayout,
  },

  data() {
    return {
      allQuestions: konnektorenData,
      currentRoundQuestions: [],
      unansweredQuestions: [],
      wrongQuestions: [],
      currentQuestion: null,
      selectedAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      currentQuestionIndex: 0,
      questionsPerRound: 10,

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
    progressPercent() {
      if (!this.questionsPerRound) return 0;

      return Math.round(
        (this.currentQuestionIndex / this.questionsPerRound) * 100,
      );
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
    async loadQuestions() {
      try {
        const databaseQuestions = await fetchActiveExerciseItems("konnektoren");

        this.allQuestions = [...konnektorenData, ...databaseQuestions];
      } catch (error) {
        console.error("Konnektoren feladatok betöltési hiba:", error.message);
        this.allQuestions = konnektorenData;
      }

      this.pickNewSet();
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

    pickNewSet() {
      this.questionsPerRound = Math.min(10, this.allQuestions.length);

      this.currentRoundQuestions = this.shuffle(this.allQuestions).slice(
        0,
        this.questionsPerRound,
      );

      this.startRound();
    },

    startRound() {
      this.unansweredQuestions = this.shuffle(this.currentRoundQuestions);
      this.wrongQuestions = [];
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
      this.selectedAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;
    },

    checkAnswer(option) {
      if (this.isAnswered || !this.currentQuestion) return;

      this.selectedAnswer = option;
      this.isAnswered = true;
      this.isCorrect = option === this.currentQuestion.correct;

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
        this.addXp(5);
      } else {
        this.incorrectAnswersInRound += 1;
        this.wrongQuestions.push(this.currentQuestion);
      }
    },

    getOptionClass(option) {
      if (!this.isAnswered) return "";

      if (option === this.currentQuestion.correct) {
        return "option-correct";
      }

      if (option === this.selectedAnswer && !this.isCorrect) {
        return "option-wrong";
      }

      return "option-disabled";
    },

    nextQuestion() {
      this.setNextQuestion();
    },

    startNextAction() {
      if (this.incorrectAnswersInRound === 0) {
        this.questionsPerRound = 10;
        this.pickNewSet();
        return;
      }

      this.currentRoundQuestions = [...this.wrongQuestions];
      this.questionsPerRound = this.currentRoundQuestions.length;
      this.startRound();
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
            exercise_type: "konnektoren",
            score: this.correctAnswersInRound,
            max_score: this.questionsPerRound,
          },
        ]);

        if (error) throw error;

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Konnektoren eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.konnektoren-practice {
  max-width: 650px;
}

.tag-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.level-tag,
.category-tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
}

.level-tag {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.5);
}

.category-tag {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.sentence-card {
  max-width: 560px;
  margin: 0 auto 24px;
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1.65;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  margin-bottom: 28px; /* tér a Következő gomb előtt */
}

.option-pill {
  width: 100%;
  min-height: 72px;
  box-sizing: border-box;
  padding: 15px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  transition: 0.2s ease;
}

.option-pill:hover:not(:disabled) {
  transform: translateY(-2px);
  background: rgba(52, 152, 219, 0.25);
  border-color: rgba(52, 152, 219, 0.6);
}

.option-correct {
  background: rgba(46, 204, 113, 0.25) !important;
  border-color: #2ecc71 !important;
  color: #ffffff !important;
}

.option-wrong {
  background: rgba(231, 76, 60, 0.25) !important;
  border-color: #e74c3c !important;
  color: #ffffff !important;
}

.option-disabled {
  opacity: 0.45;
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

@media (max-width: 520px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .sentence-card {
    font-size: 1.05rem;
    padding: 20px;
  }
}

.button-group {
  width: 100%;
  margin-top: 10px;
}

.pill-button.btn-blue {
  width: 100%;
  padding: 18px;
  border-radius: 999px;
}
</style>
