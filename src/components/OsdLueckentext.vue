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
        class="practice-btn-primary"
        @click="checkLuecken"
      >
        Ellenőrzés
      </button>

      <button
        v-else
        class="practice-btn-secondary"
        @click="resetLuecken"
      >
        Újra
      </button>
    </div>
  </div>
</template>

<script>
import { lueckenTextFull } from "../data/OsdLueckentextData.js";
import { saveExerciseResult } from "../services/exerciseResultService";

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
    async checkLuecken() {
      this.isLueckenChecked = true;

      try {
        await saveExerciseResult(
          "osd-lueckentext",
          this.correctLueckenCount(),
          this.lueckenData.parts.length,
        );

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Lückentext eredmény mentési hiba:", error.message);
      }
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

    correctLueckenCount() {
      return this.lueckenData.parts.filter((part) => this.isLueckenCorrect(part.id))
        .length;
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

/* =========================================================
   LÜCKENTEXT FIX
========================================================= */

.luecken-card{
  width:100%;
  max-width:100%;

  margin:35px auto;
  padding:38px;

  border-radius:32px;

  background:
  linear-gradient(
    145deg,
    rgba(255,255,255,.08),
    rgba(255,255,255,.03)
  );

  border:1px solid rgba(255,255,255,.12);

  backdrop-filter:blur(28px);
  -webkit-backdrop-filter:blur(28px);

  box-shadow:
  0 20px 60px rgba(0,0,0,.35);

  text-align:left;
}

@media(min-width:900px){

.luecken-layout{
  width:100%;
  max-width:1100px;
  margin:20px auto 0;
  display:flex;
  flex-direction:column;
  align-items:center;
  box-sizing:border-box;
}

.luecken-card{
  width:100%;
  box-sizing:border-box;
  margin-left:auto;
  margin-right:auto;
  padding:52px 64px;
}

.luecken-layout > .panel-header{
  width:100%;
  box-sizing:border-box;
  text-align:center;
}

.luecken-full-text,
.luecken-paragraph{
  font-size:1.22rem;
  line-height:2.35;
}

}

/* cím */

.luecken-card h3{
  margin:0 0 28px;
  padding-bottom:20px;

  font-size:1.7rem;
  font-weight:900;

  border-bottom:
  1px solid rgba(255,255,255,.08);

  color:white;
}

/* A SZÖVEG */

.luecken-full-text,
.luecken-paragraph{

  color:white;

  font-size:1.15rem;

  line-height:2.4;

  font-weight:600;

  text-align:left;

  word-break:normal;

  white-space:normal;
}

/* inline maradjon */

.input-wrapper-inline{

display:inline;

white-space:nowrap;

vertical-align:baseline;
}

/* input */

.osd-practice .luecken-input{

display:inline-block;

vertical-align:middle;

width:58px;
height:26px;

margin:0 5px;

padding:0;

border:none;
border-radius:0;

border-bottom:
3px solid #38bdf8;

background:transparent;

color:#f1c40f;

font-size:1.05rem;
font-weight:900;

text-align:center;

outline:none;
}

.osd-practice .luecken-input:focus{

border-bottom-color:#f1c40f;

background:
rgba(255,255,255,.04);

}

/* sorszámok */

.luecken-full-text sup{

font-size:.75rem;

color:rgba(255,255,255,.45);

margin-left:2px;

}

/* mobil */

@media(max-width:700px){

.luecken-card{

padding:24px;

border-radius:26px;

}

.luecken-full-text,
.luecken-paragraph{

font-size:1rem;

line-height:2.1;

}

.osd-practice .luecken-input{

width:46px;

margin:0 4px;

}

}
</style>
