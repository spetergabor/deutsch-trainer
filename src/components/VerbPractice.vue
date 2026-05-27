<template>
  <div class="verb-practice practice-container">
    <h1>Perfekt Gyakorló</h1>

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

    <div class="practice-box">
      <div class="progress-container ui-unit">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>

        <p class="progress-text">
          Kérdés:
          <strong>{{ currentRoundQuestionIndex }}</strong>
          / {{ questionsPerRound }}
        </p>
      </div>

      <div v-if="currentQuestion && !showStatistics" class="quiz-area">
        <div class="question-card">
          <h2 class="display-word">
            {{ currentQuestion.verb }}
          </h2>

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
              'input-wrong': isAnswered && isCorrect === false,
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
              Helyes válasz:
              <span>{{ correctAnswer }}</span>
            </p>

            <p class="feedback-text">
              {{ isCorrect ? "Richtig! ✓" : "Falsch! ✗" }}
            </p>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <div class="stats-summary">
          <p>
            Eredmény:
            <span
              :class="
                incorrectAnswersInRound === 0 ? 'correct-text' : 'wrong-text'
              "
            >
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
import verbsData from "../data/verbs.json";
import { fetchActiveExerciseItems } from "../services/exerciseItemService";
import { supabase } from "../supabase";

export default {
  name: "VerbPractice",

  components: {
    PracticeLayout,
  },

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
        (this.currentRoundQuestionIndex / this.questionsPerRound) * 100,
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

  mounted() {
    this.focusInput();
  },

  methods: {
    async loadQuestions() {
      try {
        const databaseQuestions = await fetchActiveExerciseItems("perfekt");
        this.allVerbs = [...verbsData, ...databaseQuestions];
      } catch (error) {
        console.error("Perfekt feladatok betöltési hiba:", error.message);
        this.allVerbs = verbsData;
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
      this.questionsPerRound = Math.min(
        this.defaultQuestionsPerRound,
        this.allVerbs.length,
      );

      this.currentRoundVerbs = this.shuffle(this.allVerbs).slice(
        0,
        this.questionsPerRound,
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

      if (this.isCorrect) {
        this.addXp(5);
      } else {
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

        if (error) throw error;

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Hiba az eredmény mentésekor:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.practice-box h2 {
  font-weight: 900;

  color: white;

  margin: 0;
}

.translation {
  font-size: 1.8rem;

  font-style: italic;

  opacity: 0.7;

  margin-top: -10px;
}

@media (max-width: 700px) {
  .practice-box h2 {
    font-size: 3rem;
  }

  .translation {
    font-size: 1.4rem;
  }
}
</style>
