<template>
  <div class="luecken-layout">
    <div class="panel-header">Aufgabe 3 - Lückentext</div>

    <div class="luecken-card">
      <p class="instruction">
        Olvasd el a szöveget, és egészítsd ki a hiányzó szórészleteket a vonalakra kattintva!
      </p>

      <hr class="divider" />

      <div class="luecken-full-text">
        <h3>{{ lueckenData.title }}</h3>

        <p class="luecken-paragraph">
          <template
            v-for="part in lueckenData.parts"
            :key="part.id"
          >
            <span class="text-part">{{ part.text }}</span>

            <span class="input-wrapper-inline">
              <input
                v-model="answersLuecken[part.id]"
                type="text"
                class="luecken-input"
                :disabled="isLueckenChecked"
                :class="getLueckenClass(part.id)"
                maxlength="6"
              />

              <span class="gap-number">({{ part.id }})</span>

              <span
                v-if="isLueckenChecked && !isLueckenCorrect(part.id)"
                class="luecken-correction"
              >
                {{ part.correct }}
              </span>
            </span>
          </template>

          <span class="text-part">{{ lueckenData.ending }}</span>
        </p>
      </div>
    </div>

    <div class="button-group">
      <button
        v-if="!isLueckenChecked"
        class="pill-button btn-blue"
        @click="checkLuecken"
      >
        Ellenőrzés
      </button>

      <button
        v-else
        class="pill-button btn-blue"
        @click="resetLuecken"
      >
        Újra
      </button>
    </div>
  </div>
</template>

<script>
import { lueckenTextFull } from "../data/OsdLueckentextData.js";

export default {
  name: "OsdLueckentext",

  data() {
    return {
      lueckenData: lueckenTextFull,
      answersLuecken: {},
      isLueckenChecked: false,
    };
  },

  methods: {
    checkLuecken() {
      this.isLueckenChecked = true;
    },

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-zäöüß-]/g, "");
    },

    isLueckenCorrect(id) {
      const part = this.lueckenData.parts.find((item) => item.id === id);

      if (!part) return false;

      const answer = this.normalizeAnswer(this.answersLuecken[id]);
      const correctAnswer = this.normalizeAnswer(part.correct);

      if (id === 7 && ["der", "dieser"].includes(answer)) {
        return true;
      }

      return answer === correctAnswer;
    },

    getLueckenClass(id) {
      if (!this.isLueckenChecked) return "";

      return this.isLueckenCorrect(id) ? "luecken-correct" : "luecken-wrong";
    },

    resetLuecken() {
      this.answersLuecken = {};
      this.isLueckenChecked = false;
    },
  },
};
</script>

<style scoped>
.input-wrapper-inline {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.luecken-input {
  width: 48px;
  padding: 0;
  border: none;
  border-bottom: 2px solid #3498db;
  border-radius: 0;
  background: transparent;
  color: #f1c40f;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
}

.luecken-input:focus {
  border-bottom-color: #f1c40f;
  background: rgba(255,255,255,0.05);
}

.luecken-correct {
  border-bottom-color: #2ecc71;
  color: #2ecc71;
}

.luecken-wrong {
  border-bottom-color: #e74c3c;
  color: #e74c3c;
}

.gap-number {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.45);
}

.luecken-correction {
  margin-left: 6px;
  color: #e74c3c;
  font-weight: 700;
}

@media (max-width: 600px) {
  .luecken-layout {
    gap: 14px;
  }

  .luecken-full-text h3 {
    font-size: 1.05rem;
  }
}
</style>