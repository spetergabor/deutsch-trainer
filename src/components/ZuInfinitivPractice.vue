<template>
  <div class="practice-container zu-infinitiv-practice">
    <h1>Zu + Infinitiv</h1>

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
        <div class="question-card zu-infinitiv-question-card">
          <span class="zu-infinitiv-type">Dass → zu + Infinitiv</span>
          <p class="zu-infinitiv-prompt">{{ currentQuestion.prompt }}</p>
          <p class="zu-infinitiv-sentence">
            {{ currentQuestion.sentence }}
          </p>
        </div>

        <div class="input-wrapper ui-unit zu-infinitiv-writing-input">
          <textarea
            ref="answerInput"
            v-model="userAnswer"
            class="zu-infinitiv-answer-textarea"
            placeholder="Írd ide az átalakított teljes mondatot..."
            :disabled="isAnswered"
            :class="{
              'input-correct': isAnswered && isCorrect,
              'input-wrong': isAnswered && isCorrect === false,
            }"
            @keydown.enter.exact.prevent="checkWritingAnswer"
          ></textarea>
        </div>

        <div class="button-group ui-unit">
          <button
            v-if="!isAnswered"
            class="pill-button btn-green"
            :disabled="!userAnswer.trim()"
            @click="checkWritingAnswer"
          >
            Ellenőrzés
          </button>

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
      </div>
    </PracticeLayout>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <p>
          Eredmény:
          <span class="correct-text">
            {{ correctAnswersInRound }}/{{ questionsPerRound }}
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
import { zuInfinitivQuestions } from "../data/zuInfinitiv";
import { supabase } from "../supabase";

export default {
  name: "ZuInfinitivPractice",

  components: {
    PracticeLayout,
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      allQuestions: zuInfinitivQuestions,
      currentRoundQuestions: [],
      unansweredQuestions: [],
      wrongQuestions: [],
      currentQuestion: null,
      userAnswer: "",
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

  created() {
    this.pickNewSet();
    this.loadXpProfile();
  },

  methods: {
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

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]/g, "")
        .replace(/\s+/g, " ");
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
      this.userAnswer = "";
      this.isAnswered = false;
      this.isCorrect = null;
      this.currentQuestionIndex += 1;

      this.$nextTick(() => {
        this.$refs.answerInput?.focus?.();
      });
    },

    checkWritingAnswer() {
      if (this.isAnswered || !this.currentQuestion || !this.userAnswer.trim()) {
        return;
      }

      this.isAnswered = true;
      this.isCorrect =
        this.normalizeAnswer(this.userAnswer) ===
        this.normalizeAnswer(this.currentQuestion.answer);

      if (this.isCorrect) {
        this.correctAnswersInRound += 1;
        this.addXp(5);
      } else {
        this.incorrectAnswersInRound += 1;
        this.wrongQuestions.push(this.currentQuestion);
      }
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
            exercise_type: "zu-infinitiv",
            score: this.correctAnswersInRound,
            max_score: this.questionsPerRound,
          },
        ]);

        if (error) throw error;

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Zu + Infinitiv eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.zu-infinitiv-practice {
  max-width: 720px;
}

.zu-infinitiv-practice :deep(.practice-box) {
  align-items: stretch;
}

.zu-infinitiv-practice :deep(.quiz-area) {
  width: 100%;
}

.zu-infinitiv-question-card {
  text-align: left;
}

.zu-infinitiv-type {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 7px 12px;
  border: 1px solid rgba(128, 202, 255, 0.36);
  border-radius: 999px;
  background: rgba(128, 202, 255, 0.14);
  color: #80caff;
  font-size: 0.78rem;
  font-weight: 950;
  text-transform: uppercase;
}

.zu-infinitiv-prompt {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.68);
  font-weight: 850;
}

.zu-infinitiv-sentence {
  margin: 0;
  padding: 22px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  font-size: clamp(1.08rem, 2vw, 1.35rem);
  font-weight: 900;
  line-height: 1.55;
}

.zu-infinitiv-writing-input {
  margin-top: 18px;
}

.zu-infinitiv-answer-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 16px 18px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font: inherit;
  font-size: 1rem;
  font-weight: 760;
  line-height: 1.5;
}

.zu-infinitiv-answer-textarea::placeholder {
  color: rgba(255, 255, 255, 0.38);
}

.zu-infinitiv-answer-textarea:focus {
  border-color: rgba(128, 202, 255, 0.75);
  outline: none;
  box-shadow: 0 0 0 4px rgba(128, 202, 255, 0.12);
}

.zu-infinitiv-answer-textarea.input-correct {
  border-color: rgba(46, 204, 113, 0.9);
  background: rgba(46, 204, 113, 0.12);
}

.zu-infinitiv-answer-textarea.input-wrong {
  border-color: rgba(255, 71, 87, 0.85);
  background: rgba(255, 71, 87, 0.1);
}

.zu-infinitiv-practice :deep(.button-group),
.zu-infinitiv-practice :deep(.feedback-box) {
  margin-top: 18px;
}
</style>
