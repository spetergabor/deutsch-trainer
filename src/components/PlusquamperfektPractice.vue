<template>
  <div class="practice-container plusquamperfekt-practice">
    <h1>Plusquamperfekt</h1>

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
        <div class="question-card plusquamperfekt-question-card">
          <span class="plusquamperfekt-type">{{ currentQuestion.tag }}</span>
          <p class="plusquamperfekt-prompt">{{ currentQuestion.prompt }}</p>
          <p class="plusquamperfekt-sentence">
            {{ currentQuestion.sentence }}
          </p>
        </div>

        <div
          v-if="currentQuestion.type === 'choice'"
          class="options-grid ui-unit"
          :class="{ 'is-sentence-options': choiceOptionsAreSentences }"
        >
          <button
            v-for="option in currentQuestion.options"
            :key="option"
            class="option-pill"
            :disabled="isAnswered"
            :class="getOptionClass(option)"
            @click="checkChoiceAnswer(option)"
          >
            {{ option }}
          </button>
        </div>

        <div
          v-else
          class="input-wrapper ui-unit plusquamperfekt-writing-input"
        >
          <textarea
            ref="answerInput"
            v-model="userAnswer"
            class="plusquamperfekt-answer-textarea"
            placeholder="Írd ide a teljes helyes mondatot..."
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
            v-if="!isAnswered && currentQuestion.type !== 'choice'"
            class="practice-btn-primary"
            :disabled="!userAnswer.trim()"
            @click="checkWritingAnswer"
          >
            Ellenőrzés
          </button>

          <button
            v-if="isAnswered"
            class="practice-btn-secondary"
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
import PracticeLayout from "./PracticeLayout.vue";
import { plusquamperfektQuestions } from "../data/plusquamperfekt";
import { supabase } from "../supabase";

export default {
  name: "PlusquamperfektPractice",

  components: {
    PracticeLayout,
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      allQuestions: plusquamperfektQuestions,
      currentRoundQuestions: [],
      unansweredQuestions: [],
      wrongQuestions: [],
      currentQuestion: null,
      userAnswer: "",
      selectedAnswer: "",
      isAnswered: false,
      isCorrect: null,
      showStatistics: false,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      currentQuestionIndex: 0,
      questionsPerRound: 5,
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

    choiceOptionsAreSentences() {
      if (this.currentQuestion?.type !== "choice") return false;

      return (this.currentQuestion.options || []).some(
        (option) => option.length > 24 || option.includes(","),
      );
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

    isAcceptedAnswer(answer) {
      const normalizedAnswer = this.normalizeAnswer(answer);
      const acceptedAnswers = [
        this.currentQuestion.answer,
        ...(this.currentQuestion.acceptedAnswers || []),
      ];

      return acceptedAnswers.some(
        (acceptedAnswer) =>
          this.normalizeAnswer(acceptedAnswer) === normalizedAnswer,
      );
    },

    shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    },

    pickNewSet() {
      this.questionsPerRound = Math.min(5, this.allQuestions.length);
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
      this.selectedAnswer = "";
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

      this.selectedAnswer = this.userAnswer;
      this.resolveAnswer(this.isAcceptedAnswer(this.userAnswer));
    },

    checkChoiceAnswer(option) {
      if (this.isAnswered || !this.currentQuestion) return;

      this.selectedAnswer = option;
      this.resolveAnswer(option === this.currentQuestion.answer);
    },

    resolveAnswer(isCorrect) {
      this.isAnswered = true;
      this.isCorrect = isCorrect;

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
      if (option === this.currentQuestion.answer) return "option-correct";
      if (option === this.selectedAnswer) return "option-wrong";
      return "";
    },

    nextQuestion() {
      this.setNextQuestion();
    },

    startNextAction() {
      if (this.incorrectAnswersInRound === 0) {
        this.questionsPerRound = 5;
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
            exercise_type: "plusquamperfekt",
            score: this.correctAnswersInRound,
            max_score: this.questionsPerRound,
          },
        ]);

        if (error) throw error;

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Plusquamperfekt eredmény mentési hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped src="../assets/styles/practice-legacy.css"></style>
