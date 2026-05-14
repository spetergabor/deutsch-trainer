<template>
  <div class="lese-layout">
    <div class="lese-tabs">
      <button
        class="tab-btn"
        :class="{ active: currentLeseAufgabe === 1 }"
        @click="switchAufgabe(1)"
      >
        Aufgabe 1
      </button>

      <button
        class="tab-btn"
        :class="{ active: currentLeseAufgabe === 2 }"
        @click="switchAufgabe(2)"
      >
        Aufgabe 2
      </button>
    </div>

    <div v-if="currentLeseAufgabe === 1 && !showStatistics" class="lese-wrapper">
      <div class="lese-text-panel">
        <div class="panel-header">Test 1 - Aufgabe 1</div>

        <div class="scroll-text">
          <h3>{{ leseTextData.title }}</h3>
          <p class="sub-title">{{ leseTextData.subtitle }}</p>
          <div v-html="leseTextData.content"></div>
        </div>
      </div>

      <div class="lese-quiz-panel">
        <div class="progress-bar small">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>

        <div v-if="currentLeseTask" class="lese-card">
          <p class="lese-question">
            <strong>{{ currentIdx + 1 }}.</strong>
            {{ currentLeseTask.question }}
          </p>

          <div class="lese-options">
            <button
              v-for="option in currentLeseTask.options"
              :key="option.id"
              class="opt-btn"
              :class="getLeseBtnClass(option.id)"
              :disabled="isAnswered"
              @click="checkLeseAnswer(option.id)"
            >
              <span class="opt-label">{{ option.id }}</span>
              {{ option.text }}
            </button>
          </div>
        </div>

        <div v-if="isAnswered" class="button-group">
          <button class="btn-next" @click="nextLeseQuestion">
            Következő
          </button>
        </div>
      </div>
    </div>

    <div v-if="currentLeseAufgabe === 2 && !showStatistics" class="lese-aufgabe2-wrapper">
      <div class="headings-panel">
        <div class="panel-header">Überschriften (A-K)</div>

        <div class="headings-list">
          <div
            v-for="heading in leseAufgabe2Headings"
            :key="heading.id"
            class="heading-item"
          >
            <strong>{{ heading.id }}</strong>: {{ heading.text }}
          </div>
        </div>
      </div>

      <div class="texts-panel">
        <div
          v-for="textObj in leseAufgabe2Texts"
          :key="textObj.id"
          class="text-match-card"
        >
          <div class="text-match-header">
            <span class="text-number">Text {{ textObj.id }}</span>

            <select
              v-model="answersA2[textObj.id]"
              class="a2-select"
              :disabled="isA2Checked"
              :class="getA2SelectClass(textObj.id)"
            >
              <option value="" disabled>Válassz...</option>

              <option
                v-for="heading in leseAufgabe2Headings"
                :key="heading.id"
                :value="heading.id"
              >
                {{ heading.id }}
              </option>
            </select>

            <span
              v-if="isA2Checked && answersA2[textObj.id] !== textObj.correct"
              class="a2-correction"
            >
              Helyes: {{ textObj.correct }}
            </span>
          </div>

          <p class="match-text">{{ textObj.text }}</p>
        </div>

        <div class="button-group">
          <button
            v-if="!isA2Checked"
            class="btn-check"
            :disabled="!allA2Answered"
            @click="checkAufgabe2"
          >
            Ellenőrzés
          </button>

          <button
            v-else
            class="btn-next"
            @click="resetA2"
          >
            Újra
          </button>
        </div>
      </div>
    </div>

    <div v-if="showStatistics" class="popup-overlay">
      <div class="popup-content">
        <h2>Aufgabe {{ currentLeseAufgabe }} vége</h2>

        <p v-if="currentLeseAufgabe === 1">
          Eredmény:
          <span class="correct-text">{{ correctAnswers }} / {{ totalTasks }}</span>
        </p>

        <button class="btn-popup-action" @click="resetCurrentAufgabe">
          Újrakezdés
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  leseTasks,
  leseTexts,
  leseAufgabe2Headings,
  leseAufgabe2Texts,
} from "../data/OsdLeseverstehenData.js";

export default {
  name: "OsdLeseverstehen",

  data() {
    return {
      leseTasks,
      leseTextData: leseTexts.universitaetLaufsteg,
      leseAufgabe2Headings,
      leseAufgabe2Texts,

      currentLeseAufgabe: 1,
      currentIdx: 0,
      isAnswered: false,
      isCorrect: null,
      selectedOption: null,
      correctAnswers: 0,
      showStatistics: false,

      answersA2: {
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
      },
      isA2Checked: false,
    };
  },

  computed: {
    currentLeseTask() {
      return this.leseTasks[this.currentIdx] || null;
    },

    totalTasks() {
      return this.currentLeseAufgabe === 1
        ? this.leseTasks.length
        : this.leseAufgabe2Texts.length;
    },

    progressPercentage() {
      if (!this.totalTasks) return 0;

      return Math.round((this.currentIdx / this.totalTasks) * 100);
    },

    allA2Answered() {
      return this.leseAufgabe2Texts.every((textObj) => this.answersA2[textObj.id]);
    },
  },

  methods: {
    switchAufgabe(num) {
      this.currentLeseAufgabe = num;
      this.showStatistics = false;
    },

    checkLeseAnswer(optionId) {
      if (this.isAnswered || !this.currentLeseTask) return;

      this.selectedOption = optionId;
      this.isCorrect = optionId === this.currentLeseTask.correct;
      this.isAnswered = true;

      if (this.isCorrect) {
        this.correctAnswers += 1;
      }
    },

    getLeseBtnClass(optionId) {
      if (!this.isAnswered || !this.currentLeseTask) return "";

      if (optionId === this.currentLeseTask.correct) {
        return "opt-correct";
      }

      if (this.selectedOption === optionId && !this.isCorrect) {
        return "opt-wrong";
      }

      return "opt-disabled";
    },

    nextLeseQuestion() {
      if (this.currentIdx < this.totalTasks - 1) {
        this.currentIdx += 1;
        this.isAnswered = false;
        this.isCorrect = null;
        this.selectedOption = null;
        return;
      }

      this.showStatistics = true;
    },

    checkAufgabe2() {
      this.isA2Checked = true;
    },

    getA2SelectClass(textId) {
      if (!this.isA2Checked) return "";

      const textObj = this.leseAufgabe2Texts.find((item) => item.id === textId);

      if (!textObj) return "";

      return this.answersA2[textId] === textObj.correct
        ? "select-correct"
        : "select-wrong";
    },

    resetA2() {
      this.answersA2 = {
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
      };

      this.isA2Checked = false;
    },

    resetCurrentAufgabe() {
      if (this.currentLeseAufgabe === 1) {
        this.currentIdx = 0;
        this.correctAnswers = 0;
        this.isAnswered = false;
        this.isCorrect = null;
        this.selectedOption = null;
      } else {
        this.resetA2();
      }

      this.showStatistics = false;
    },
  },
};
</script>

<style scoped>
.lese-layout {
  width: 100%;
  max-width: 800px;
  margin: 20px auto 0;
  animation: fadeIn 0.4s ease;
}

.lese-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: fit-content;
  margin: 0 auto 25px;
  padding: 8px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lese-tabs .tab-btn {
  padding: 12px 35px;
  border: none;
  border-radius: 30px;
  background: transparent;
  color: #bdc3c7;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lese-tabs .tab-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.lese-tabs .tab-btn.active {
  background: #3498db;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.lese-wrapper {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.lese-text-panel {
  width: 100%;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  padding: 12px 20px;
  background: rgba(52, 152, 219, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  color: #3498db;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.scroll-text {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  text-align: left;
  line-height: 1.7;
  color: #ecf0f1;
}

.scroll-text h3 {
  margin-top: 0;
  color: #ffffff;
}

.sub-title {
  color: #bdc3c7;
  font-style: italic;
}

.scroll-text::-webkit-scrollbar {
  width: 6px;
}

.scroll-text::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.lese-quiz-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lese-card {
  width: 100%;
  padding: 25px;
  border-radius: 20px;
  box-sizing: border-box;

  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  text-align: left;
}

.lese-question {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
}

.lese-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.opt-btn {
  width: 100%;
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;

  display: flex;
  align-items: center;
  gap: 15px;

  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;

  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.opt-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.opt-label {
  color: #3498db;
  font-size: 1.2rem;
  font-weight: 900;
}

.opt-correct {
  background: rgba(46, 204, 113, 0.2) !important;
  border-color: #2ecc71 !important;
}

.opt-wrong {
  background: rgba(231, 76, 60, 0.2) !important;
  border-color: #e74c3c !important;
}

.opt-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lese-aufgabe2-wrapper {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.headings-panel {
  overflow: hidden;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.headings-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 20px;
  color: #ecf0f1;
  font-size: 0.9rem;
}

.heading-item strong {
  margin-right: 5px;
  color: #3498db;
}

.texts-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.text-match-card {
  padding: 20px;
  border-radius: 15px;

  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-match-header {
  display: flex;
  align-items: center;
  gap: 15px;

  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.text-number {
  color: #3498db;
  font-size: 1.1rem;
  font-weight: 900;
}

.a2-select {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 800;
  cursor: pointer;
}

.select-correct {
  background: #2ecc71 !important;
  color: #ffffff !important;
}

.select-wrong {
  background: #e74c3c !important;
  color: #ffffff !important;
}

.a2-correction {
  margin-left: 10px;
  color: #e74c3c;
  font-weight: 800;
}

.match-text {
  color: #bdc3c7;
  font-size: 0.95rem;
  line-height: 1.6;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.btn-next,
.btn-check {
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  background: #3498db;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-check {
  background: #2ecc71;
}

.btn-next:hover,
.btn-check:hover {
  transform: translateY(-2px);
  filter: brightness(0.95);
}

.btn-next:disabled,
.btn-check:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.correct-text {
  color: #2ecc71;
  font-weight: 900;
}

@media (max-width: 768px) {
  .headings-list {
    grid-template-columns: 1fr;
  }

  .text-match-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .lese-tabs {
    width: 100%;
  }

  .lese-tabs .tab-btn {
    flex: 1;
    padding: 12px 14px;
  }

  .lese-text-panel {
    max-height: 400px;
  }

  .scroll-text {
    padding: 22px;
  }

  .lese-card {
    padding: 20px;
  }
}
</style>