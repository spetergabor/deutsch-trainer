<template>
  <div class="verb-practice practice-container">
    <h1>Nomen-Verb-Verbindungen</h1>

    <PracticeLayout
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
        <div class="question-card">
          <h2 class="display-word">{{ currentQuestion.nomen }} ...</h2>

          <p class="display-meaning">({{ currentQuestion.meaning }})</p>
        </div>

        <div class="input-wrapper ui-unit">
          <input
            ref="answerInput"
            v-model="userAnswer"
            type="text"
            class="practice-input"
            placeholder="Írd be az igét..."
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
              Helyes válasz:
              <span>{{ currentQuestion.verb }}</span>
            </p>

            <p class="feedback-text">
              {{ isCorrect ? "Richtig! ✓" : "Falsch! ✗" }}
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
    </PracticeLayout>

    <div v-if="showStatistics" class="ui-overlay">
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <div class="stats-summary">
          <p>
            Helyes:
            <span class="correct-text">
              {{ correctAnswersInRound }}
            </span>
            | Helytelen:
            <span class="wrong-text">
              {{ incorrectAnswersInRound }}
            </span>
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
            {{ item.isCorrect ? "✓" : "✗" }}
            ({{ item.correctAnswer }})
          </div>
        </div>

        <button class="practice-btn-primary" @click="startNextAction">
          {{
            incorrectAnswersInRound === 0
              ? "Új kör indítása"
              : "Hibásak újragyakorlása"
          }}
        </button>

        <button class="practice-btn-secondary" @click="$emit('go-dashboard')">
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import nomenData from "../data/nomen.json";
import { fetchActiveExerciseItems } from "../services/exerciseItemService";
import { supabase } from "../supabase";
import PracticeLayout from "./PracticeLayout.vue";

export default {
  name: "NomenVerbPractice",

  components: {
    PracticeLayout,
  },

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
      return Math.min(this.currentQuestionIndex, this.totalQuestionsInRound);
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
        const databaseQuestions = await fetchActiveExerciseItems("nomen-verb");
        this.allQuestions = [...nomenData, ...databaseQuestions];
      } catch (error) {
        console.error("Nomen-Verb feladatok betöltési hiba:", error.message);
        this.allQuestions = nomenData;
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
      this.totalQuestionsInRound = Math.min(
        this.defaultQuestionsPerRound,
        this.allQuestions.length,
      );

      this.currentRoundQuestions = this.shuffle(this.allQuestions).slice(
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

      this.currentQuestion =
        this.currentRoundQuestions[this.currentQuestionIndex];

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
        this.addXp(5);
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

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Hiba a mentésnél:", error.message);
      }
    },
  },
};
</script>
