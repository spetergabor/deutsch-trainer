<template>
  <div class="hoeren-layout">
    <div class="audio-panel">
      <div class="panel-header">Audio Player - Aufgabe {{ currentAufgabe }}</div>

      <div class="audio-container">
        <audio
          controls
          class="custom-audio"
          preload="metadata"
          :key="audioSource"
          :src="audioSource"
        >
          A böngésződ nem támogatja az audio elemet.
        </audio>

        <div class="audio-instructions">
          <p v-if="currentAufgabe === 1" class="audio-info">
            <strong>Aufgabe 1:</strong> Hallgasd meg a felvételt és oldd meg az 1. feladatot.
            <br />
            <small>A vizsgán ezt 2x hallhatod.</small>
          </p>

          <p v-else class="audio-info">
            <strong>Aufgabe 2:</strong> Hallgasd meg a felvételt és oldd meg a 2. feladatot.
            <br />
            <small>A vizsgán ezt 1x hallhatod.</small>
          </p>
        </div>
      </div>
    </div>

    <div class="hoeren-tabs">
      <button
        class="tab-btn"
        :class="{ active: currentAufgabe === 1 }"
        @click="switchAufgabe(1)"
      >
        Aufgabe 1
      </button>

      <button
        class="tab-btn"
        :class="{ active: currentAufgabe === 2 }"
        @click="switchAufgabe(2)"
      >
        Aufgabe 2
      </button>
    </div>

    <div v-if="currentAufgabe === 1" class="task-panel fade-in">
      <div class="panel-header">Aufgabe 1 - Richtig / Falsch</div>

      <div class="content-box">
        <p class="instruction">
          Situation: Sie hören jetzt eine Radiosendung. Lesen Sie die folgenden Aussagen und kreuzen Sie jeweils die richtige Lösung an.
        </p>

        <div class="tf-list">
          <div
            v-for="task in aufgabe1"
            :key="task.id"
            class="tf-item"
          >
            <span class="tf-num">{{ task.id }}.</span>

            <span class="tf-text">{{ task.text }}</span>

            <div class="tf-btns">
              <button
                class="tf-btn"
                :disabled="isA1Checked"
                :class="getA1ButtonClass(task, 'R')"
                @click="setA1(task.id, 'R')"
              >
                R
              </button>

              <button
                class="tf-btn"
                :disabled="isA1Checked"
                :class="getA1ButtonClass(task, 'F')"
                @click="setA1(task.id, 'F')"
              >
                F
              </button>
            </div>

            <span
              v-if="isA1Checked && answersA1[task.id] !== task.correct"
              class="correction-badge"
            >
              Helyes: {{ task.correct }}
            </span>
          </div>
        </div>

        <div class="button-group">
          <button
            v-if="!isA1Checked"
            class="btn-check"
            @click="checkA1"
          >
            Ellenőrzés
          </button>

          <button
            v-else
            class="btn-next"
            @click="resetA1"
          >
            Újra
          </button>
        </div>

        <ResultBox
          v-if="isA1Checked"
          :score="scoreA1"
          :total-score="totalScore"
          :show-final="isA1Checked && isA2Checked"
        />
      </div>
    </div>

    <div v-if="currentAufgabe === 2" class="task-panel fade-in">
      <div class="panel-header">Aufgabe 2 - Lückentext / Tabelle</div>

      <div class="content-box">
        <p class="instruction">
          Situation: Sie hören ein Gespräch zwischen zwei Personen. Ergänzen Sie die Informationen.
        </p>

        <div class="table-scroll-wrapper">
          <table class="hv-table">
            <thead>
              <tr>
                <th>Bibliotheken</th>
                <th>Universitätsbibliothek</th>
                <th>ZB</th>
                <th>Literaturarchiv</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Schwerpunkt</td>

                <td v-for="lib in libraries" :key="lib">
                  <label>
                    <input type="checkbox" v-model="a2[lib].schwerpunkt_allg" :disabled="isA2Checked" />
                    allgemein
                  </label>

                  <label>
                    <input type="checkbox" v-model="a2[lib].schwerpunkt_fach" :disabled="isA2Checked" />
                    Fachliteratur
                  </label>

                  <div v-if="isA2Checked" class="error-label">
                    {{ correctAnswersA2[lib].schwerpunkt }}
                  </div>
                </td>
              </tr>

              <tr v-for="row in textRows" :key="row.field">
                <td>{{ row.label }}</td>

                <td v-for="lib in libraries" :key="lib">
                  <input
                    v-model="a2[lib][row.field]"
                    type="text"
                    class="sm-input"
                    :disabled="isA2Checked"
                    :class="isCorrect(lib, row.field, a2[lib][row.field])"
                  />
                  {{ row.suffix }}

                  <div
                    v-if="isA2Checked && isCorrect(lib, row.field, a2[lib][row.field]) === 'wrong-input'"
                    class="error-label"
                  >
                    Helyes: {{ correctAnswersA2[lib][row.field] }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Buchausleihe</td>

                <td v-for="lib in libraries" :key="lib">
                  <label>
                    <input type="checkbox" v-model="a2[lib].ausleihe_post" :disabled="isA2Checked" />
                    Postversand
                  </label>

                  <label>
                    <input type="checkbox" v-model="a2[lib].ausleihe_fern" :disabled="isA2Checked" />
                    Fernleihe
                  </label>

                  <div v-if="isA2Checked" class="error-label">
                    {{ correctAnswersA2[lib].buchausleihe }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Anmeldung</td>

                <td v-for="lib in libraries" :key="lib">
                  <label>
                    <input type="checkbox" v-model="a2[lib].anmeldung_amt" :disabled="isA2Checked" />
                    amtlicher Ausweis
                  </label>

                  <label>
                    <input type="checkbox" v-model="a2[lib].anmeldung_adr" :disabled="isA2Checked" />
                    Adressnachweis
                  </label>

                  <div v-if="isA2Checked" class="error-label">
                    {{ correctAnswersA2[lib].anmeldung }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Serviceleistungen</td>

                <td v-for="lib in libraries" :key="lib">
                  <label>
                    <input type="checkbox" v-model="a2[lib].service_les" :disabled="isA2Checked" />
                    Lesungen
                  </label>

                  <label v-if="lib === 'zb'">
                    <input type="checkbox" v-model="a2[lib].service_caf" :disabled="isA2Checked" />
                    Cafeteria
                  </label>

                  <label v-else>
                    <input type="checkbox" v-model="a2[lib].service_lou" :disabled="isA2Checked" />
                    Leselounge
                  </label>

                  <div v-if="isA2Checked" class="error-label">
                    {{ correctAnswersA2[lib].service }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Zusätzliches Angebot</td>

                <td v-for="lib in libraries" :key="lib">
                  <label>
                    <input type="checkbox" v-model="a2[lib].extra_wlan" :disabled="isA2Checked" />
                    WLAN
                  </label>

                  <label>
                    <input type="checkbox" v-model="a2[lib].extra_fuehr" :disabled="isA2Checked" />
                    Führungen
                  </label>

                  <div v-if="isA2Checked" class="error-label">
                    {{ correctAnswersA2[lib].extra }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Maximale Ausleihe</td>

                <td v-for="lib in libraries" :key="lib">
                  <input
                    v-model="a2[lib].max"
                    type="text"
                    class="sm-input"
                    :disabled="isA2Checked"
                    :class="isCorrect(lib, 'max', a2[lib].max)"
                  />
                  Bücher

                  <div
                    v-if="isA2Checked && isCorrect(lib, 'max', a2[lib].max) === 'wrong-input'"
                    class="error-label"
                  >
                    Helyes: {{ correctAnswersA2[lib].max }}
                  </div>
                </td>
              </tr>

              <tr>
                <td>Öffnungszeiten</td>

                <td v-for="lib in libraries" :key="lib">
                  bis
                  <input
                    v-model="a2[lib].bis"
                    type="text"
                    class="sm-input time"
                    :disabled="isA2Checked"
                    :class="isCorrect(lib, 'bis', a2[lib].bis)"
                  />
                  Uhr

                  <div
                    v-if="isA2Checked && isCorrect(lib, 'bis', a2[lib].bis) === 'wrong-input'"
                    class="error-label"
                  >
                    Helyes: bis {{ correctAnswersA2[lib].bis }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="button-group">
          <button
            v-if="!isA2Checked"
            class="btn-check"
            @click="checkA2"
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

        <ResultBox
          v-if="isA2Checked"
          :score="scoreA2"
          :total-score="totalScore"
          :show-final="isA1Checked && isA2Checked"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { hoerenAufgabe1 } from "../data/OsdHoerverstehenData.js";

const ResultBox = {
  props: {
    score: Number,
    totalScore: Number,
    showFinal: Boolean,
  },

  template: `
    <div class="result-display fade-in">
      <div class="score-card">
        <span class="score-label">Elért pontszám ebben a feladatban:</span>
        <span class="score-value">{{ score }} / 10</span>
      </div>

      <div v-if="showFinal" class="final-summary">
        <h3>Összesített eredmény: {{ totalScore }} / 20</h3>
        <p :class="totalScore >= 10 ? 'pass' : 'fail'">
          {{ totalScore >= 10 ? 'Sikeres vizsga! 🎉' : 'Ez most nem érte el a 10 pontos ponthatárt. ❌' }}
        </p>
      </div>
    </div>
  `,
};

export default {
  name: "OsdHoerverstehen",

  components: {
    ResultBox,
  },

  data() {
    return {
      currentAufgabe: 1,
      libraries: ["uni", "zb", "lit"],
      aufgabe1: hoerenAufgabe1,
      answersA1: {},
      isA1Checked: false,
      isA2Checked: false,

      textRows: [
        { label: "Kosten Jahresausweis", field: "kosten", suffix: "Franken" },
        { label: "Ermäßigung Studierende", field: "ermaessigung", suffix: "%" },
        { label: "Ausleihdauer", field: "dauer", suffix: "Wochen" },
      ],

      a2: {
        uni: this.getEmptyCol(),
        zb: this.getEmptyCol(),
        lit: this.getEmptyCol(),
      },

      correctAnswersA2: {
        uni: {
          schwerpunkt: "allgemein & Fachliteratur",
          kosten: "27",
          ermaessigung: "50",
          dauer: "2",
          buchausleihe: "Fernleihe",
          anmeldung: "amtlicher Ausweis",
          service: "Lesungen",
          extra: "WLAN & Führungen",
          max: "40",
          bis: "20:00",
        },
        zb: {
          schwerpunkt: "allgemein & Fachliteratur",
          kosten: "35",
          ermaessigung: "35",
          dauer: "3",
          buchausleihe: "Postversand",
          anmeldung: "amtlicher Ausweis",
          service: "Lesungen",
          extra: "WLAN",
          max: "35",
          bis: "19:00",
        },
        lit: {
          schwerpunkt: "Fachliteratur",
          kosten: "42",
          ermaessigung: "10",
          dauer: "3",
          buchausleihe: "keine",
          anmeldung: "amtlicher Ausweis & Adressnachweis",
          service: "Lesungen & Leselounge",
          extra: "WLAN",
          max: "3",
          bis: "16:00",
        },
      },
    };
  },

  computed: {
audioSource() {
  const baseUrl = import.meta.env.BASE_URL;

  const fileName =
    this.currentAufgabe === 1
      ? "audio/ZB2_MS_A1_270917.mp3"
      : "audio/ZB2_MS_A2_270917.mp3";

  return `${baseUrl}${fileName}`;
},

    scoreA1() {
      let correctCount = 0;

      this.aufgabe1.forEach((task) => {
        if (this.answersA1[task.id] === task.correct) {
          correctCount += 1;
        }
      });

      const tableA1 = {
        10: 10,
        9: 9,
        8: 8,
        7: 7,
        6: 6,
        5: 5,
        4: 4,
        3: 3,
        2: 2,
        1: 1,
        0: 0,
      };

      return tableA1[correctCount] || 0;
    },

    scoreA2() {
      let messpunkte = 0;
      const fields = ["kosten", "ermaessigung", "dauer", "max", "bis"];

      this.libraries.forEach((lib) => {
        fields.forEach((field) => {
          if (this.normalize(this.a2[lib][field]) === this.normalize(this.correctAnswersA2[lib][field])) {
            messpunkte += 1;
          }
        });
      });

      if (messpunkte >= 13) return 10;
      if (messpunkte >= 12) return 9;
      if (messpunkte >= 11) return 8;
      if (messpunkte >= 10) return 7;
      if (messpunkte >= 9) return 6;
      if (messpunkte >= 8) return 5;
      if (messpunkte >= 6) return 4;
      if (messpunkte >= 4) return 3;
      if (messpunkte >= 2) return 2;
      if (messpunkte >= 1) return 1;
      return 0;
    },

    totalScore() {
      return this.scoreA1 + this.scoreA2;
    },
  },

  methods: {
    switchAufgabe(aufgabe) {
      this.currentAufgabe = aufgabe;
    },

    getEmptyCol() {
      return {
        schwerpunkt_allg: false,
        schwerpunkt_fach: false,
        kosten: "",
        ermaessigung: "",
        dauer: "",
        ausleihe_post: false,
        ausleihe_fern: false,
        anmeldung_amt: false,
        anmeldung_adr: false,
        service_les: false,
        service_caf: false,
        service_lou: false,
        extra_wlan: false,
        extra_fuehr: false,
        max: "",
        bis: "",
      };
    },

    normalize(value) {
      return String(value || "").trim().toLowerCase();
    },

    isCorrect(lib, field, value) {
      if (!this.isA2Checked) return "";

      if (!this.normalize(value)) {
        return "wrong-input";
      }

      return this.normalize(value) === this.normalize(this.correctAnswersA2[lib][field])
        ? "correct-input"
        : "wrong-input";
    },

    getA1ButtonClass(task, value) {
      return {
        active: this.answersA1[task.id] === value,
        correct: this.isA1Checked && task.correct === value && this.answersA1[task.id] === value,
        wrong: this.isA1Checked && this.answersA1[task.id] === value && task.correct !== value,
      };
    },

    setA1(id, value) {
      if (!this.isA1Checked) {
        this.answersA1[id] = value;
      }
    },

    checkA1() {
      this.isA1Checked = true;
    },

    resetA1() {
      this.answersA1 = {};
      this.isA1Checked = false;
    },

    checkA2() {
      this.isA2Checked = true;
    },

    resetA2() {
      this.a2 = {
        uni: this.getEmptyCol(),
        zb: this.getEmptyCol(),
        lit: this.getEmptyCol(),
      };

      this.isA2Checked = false;
    },
  },
};
</script>

<style scoped>
/* --- 1. ALAP ELRENDEZÉS --- */
.hoeren-layout {
  width: min(1100px, 92vw) !important;
  max-width: 1100px !important;

  padding: 0 !important;

  display: flex;
  flex-direction: column;
  gap: 28px;

  color: white;
  box-sizing: border-box;
}

/* --- 2. TABS --- */
.hoeren-tabs {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin: 0 auto 6px;
}

.tab-btn {
  min-width: 160px;
  padding: 14px 34px;
  border: none;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.1);
  color: #bdc3c7;

  cursor: pointer;
  font-weight: 900;
  transition: 0.25s ease;
}

.tab-btn.active {
  background: #3498db;
  color: white;
}

/* --- 3. EGYSÉGES PANELEK --- */
.audio-panel,
.task-panel {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto !important;

  background: rgba(255, 255, 255, 0.055);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.panel-header {
  background: rgba(52, 152, 219, 0.22);
  padding: 16px 24px;

  color: #3498db;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.5px;
}

.audio-container,
.content-box {
  width: 100% !important;
  padding: 28px !important;
  box-sizing: border-box !important;
}

.custom-audio {
  width: 100%;
  border-radius: 999px;
}

.audio-info {
  max-width: 720px;
  margin: 22px auto 0;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.55;
}

.instruction {
  max-width: 760px;
  margin: 0 auto 28px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.55;
  font-size: 1.05rem;
}

/* --- 4. AUFGABE 1 --- */
.tf-list {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  box-sizing: border-box;
}

.tf-item {
  width: 100%;
  min-height: 120px;

  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 14px;

  padding: 18px;
  border-radius: 22px;

  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.07);

  box-sizing: border-box;
}

.tf-num {
  color: #3498db;
  font-weight: 900;
  font-size: 1.1rem;
  text-align: center;
}

.tf-text {
  text-align: left;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.94);
}

.tf-btns {
  display: flex;
  gap: 10px;
}

.tf-btn {
  width: 44px;
  height: 44px;

  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);

  background: rgba(255, 255, 255, 0.1);
  color: white;

  cursor: pointer;
  font-weight: 900;
  transition: 0.2s ease;
}

.tf-btn.active {
  background: #3498db;
  border-color: #3498db;
}

.tf-btn.correct {
  background: #2ecc71 !important;
  border-color: #2ecc71 !important;
  color: white !important;
}

.tf-btn.wrong {
  background: #e74c3c !important;
  border-color: #e74c3c !important;
  color: white !important;
}

.correction-badge {
  grid-column: 1 / -1;
  color: #e74c3c;
  font-weight: 900;
  font-size: 0.85rem;
}

/* --- 5. AUFGABE 2 TÁBLÁZAT --- */
.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.hv-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  box-sizing: border-box;
}

.hv-table th,
.hv-table td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  text-align: left;
  vertical-align: top;
  background: rgba(0, 0, 0, 0.2);
}

.hv-table th {
  background: rgba(52, 152, 219, 0.22);
  color: #3498db;
  font-weight: 900;
}

/* --- 6. INPUTOK --- */
.sm-input {
  width: 70px;
  padding: 8px;

  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);

  background: rgba(255, 255, 255, 0.1);
  color: white;

  text-align: center;
  outline: none;
}

.correct-input {
  border: 2px solid #2ecc71 !important;
  background: rgba(46, 204, 113, 0.1) !important;
  color: white !important;
}

.wrong-input {
  border: 2px solid #e74c3c !important;
  background: rgba(231, 76, 60, 0.1) !important;
  color: white !important;
}

.error-label,
.correct-label {
  display: block;
  margin-top: 5px;
  font-size: 0.75rem;
  font-weight: 900;
}

.error-label {
  color: #e74c3c;
}

.correct-label {
  color: #2ecc71;
}

/* --- 7. GOMBOK / EREDMÉNY --- */
.button-group {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.btn-check,
.btn-next {
  min-width: 180px;
  padding: 14px 28px;

  border: none;
  border-radius: 999px;

  background: #3498db;
  color: white;

  cursor: pointer;
  font-weight: 900;
  transition: 0.25s ease;
}

.btn-check:hover,
.btn-next:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.result-display {
  width: 100%;
  margin-top: 24px;
  padding: 22px;

  border-radius: 22px;
  border: 1px solid #3498db;

  background: rgba(52, 152, 219, 0.1);

  text-align: center;
  box-sizing: border-box;
}

.score-value {
  margin-left: 10px;
  color: #3498db;
  font-size: 1.5rem;
  font-weight: 900;
}

.pass {
  color: #2ecc71;
  font-weight: 900;
}

.fail {
  color: #e74c3c;
  font-weight: 900;
}

/* --- 8. TABLET --- */
@media (max-width: 900px) {
  .hoeren-layout {
    width: min(760px, 94vw) !important;
  }

  .tf-list {
    grid-template-columns: 1fr;
    max-width: 680px;
  }
}

/* --- 9. MOBIL --- */

@media (max-width: 600px) {
  .hoeren-layout {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 20px;
    overflow-x: hidden;
  }

  .audio-panel,
  .task-panel {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px;
    overflow: hidden;
  }

  .audio-container,
  .content-box {
    padding: 18px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .hoeren-tabs {
    width: 100%;
    gap: 10px;
  }

  .tab-btn {
    flex: 1;
    min-width: 0;
    padding: 12px 10px;
  }

  .tf-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .tf-item {
    min-height: unset;
    grid-template-columns: 28px 1fr auto;
    padding: 14px;
  }

  .tf-text {
    font-size: 0.92rem;
  }

  .tf-btns {
    flex-direction: column;
    gap: 6px;
  }

  .tf-btn {
    width: 38px;
    height: 34px;
  }

  .table-scroll-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .hv-table,
  .hv-table tbody {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0 !important;
    gap: 20px;
  }

  .hv-table thead {
    display: none;
  }

  .hv-table tr {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    overflow: hidden;

    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.3);

    padding-bottom: 10px;
    margin: 0;

    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    -webkit-mask-image: -webkit-radial-gradient(white, black);
  }

  .hv-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
    border-radius: 0;
  }

  .hv-table td:first-child {
    margin-bottom: 5px;
    padding: 12px 15px;

    background: rgba(52, 152, 219, 0.25);
    color: #3498db;

    font-weight: 900;
    border-bottom: 1px solid rgba(52, 152, 219, 0.3);
  }

  .hv-table td:not(:first-child) {
    padding: 10px 15px;
    border: none;
  }

  .hv-table td:nth-child(2)::before {
    content: "Universitätsbibliothek:";
    display: block;
    margin-bottom: 5px;
    color: #3498db;
    font-size: 0.75rem;
  }

  .hv-table td:nth-child(3)::before {
    content: "ZB (Zentralbib.):";
    display: block;
    margin-bottom: 5px;
    color: #3498db;
    font-size: 0.75rem;
  }

  .hv-table td:nth-child(4)::before {
    content: "Literaturarchiv:";
    display: block;
    margin-bottom: 5px;
    color: #3498db;
    font-size: 0.75rem;
  }

  .sm-input {
    width: 100%;
    max-width: 120px;
    display: inline-block;
    margin-bottom: 5px;
    text-align: left;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    word-wrap: break-word;
  }
}
</style>