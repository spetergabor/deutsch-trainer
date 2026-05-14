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
      const baseUrl =
        window.wpAppVars && window.wpAppVars.pluginUrl
          ? window.wpAppVars.pluginUrl
          : "/";

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
/* --- 1. ALAP ELRENDEZÉS ÉS KONSTRUKCIÓ --- */
.hoeren-layout { 
  display: flex; flex-direction: column; gap: 20px; 
  width: 100%; max-width: 900px; margin: 0 auto; 
  color: white; box-sizing: border-box !important;
}

.hoeren-tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; }
.tab-btn { background: rgba(255,255,255,0.1); border: none; color: #bdc3c7; padding: 12px 30px; border-radius: 30px; cursor: pointer; font-weight: bold; transition: 0.3s; }
.tab-btn.active { background: #3498db; color: white; }

/* --- 2. EGYSÉGES PANELEK --- */
.audio-panel, .task-panel { 
  background: rgba(255, 255, 255, 0.05); border-radius: 20px; 
  border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; 
  backdrop-filter: blur(10px); width: 100%; box-sizing: border-box !important;
}

.panel-header { 
  background: rgba(52, 152, 219, 0.2); padding: 15px 20px; font-weight: bold; 
  color: #3498db; border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-transform: uppercase; 
}

.audio-container, .content-box { padding: 20px; width: 100%; box-sizing: border-box !important; }
.custom-audio { width: 100%; border-radius: 50px; }

/* --- 3. AUFGABE 1 (R/F) STÍLUSOK --- */
.tf-list { display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box !important; }
.tf-item { 
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 20px; 
  border: 1px solid rgba(255, 255, 255, 0.05); box-sizing: border-box !important; width: 100%;
}
.tf-num { width: 30px; font-weight: bold; color: #3498db; flex-shrink: 0; }
.tf-text { flex: 1; text-align: left; padding-right: 15px; }
.tf-btns { display: flex; gap: 10px; flex-shrink: 0; }

.tf-btn { 
  width: 40px; height: 40px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
  background: rgba(255,255,255,0.1); color: white; cursor: pointer; font-weight: bold; transition: 0.2s;
}
.tf-btn.active { background: #3498db; border-color: #3498db; }
.tf-btn.correct { background: #2ecc71 !important; border-color: #2ecc71 !important; color: white !important; }
.tf-btn.wrong { background: #e74c3c !important; border-color: #e74c3c !important; color: white !important; }

/* --- 4. AUFGABE 2 TÁBLÁZAT (ASZTALI) --- */
.table-scroll-wrapper { width: 100%; overflow-x: auto; margin-bottom: 20px; box-sizing: border-box !important; }
.hv-table { width: 100%; border-collapse: collapse; min-width: 700px; box-sizing: border-box !important; }
.hv-table th, .hv-table td { border: 1px solid rgba(255,255,255,0.1); padding: 15px; text-align: left; background: rgba(0,0,0,0.2); vertical-align: top; }
.hv-table th { background: rgba(52, 152, 219, 0.2); color: #3498db; }

/* --- 5. INPUTOK ÉS ELLENŐRZÉS SZÍNEZÉSE --- */
.sm-input { 
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); 
  color: white; padding: 8px; width: 60px; border-radius: 8px; text-align: center; outline: none; 
}
.correct-input { border: 2px solid #2ecc71 !important; background: rgba(46, 204, 113, 0.1) !important; color: white !important; }
.wrong-input { border: 2px solid #e74c3c !important; background: rgba(231, 76, 60, 0.1) !important; color: white !important; }
.error-label, .correct-label { font-size: 0.75rem; margin-top: 5px; font-weight: bold; display: block; }
.error-label { color: #e74c3c; } .correct-label { color: #2ecc71; } 
.correction-badge { color: #e74c3c; font-weight: bold; margin-left: 10px; }

/* --- 6. GOMBOK ÉS EREDMÉNY --- */
.btn-check, .btn-next { background: #3498db; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; margin-top: 10px; }
.result-display { margin-top: 20px; padding: 20px; background: rgba(52, 152, 219, 0.1); border-radius: 20px; border: 1px solid #3498db; text-align: center; box-sizing: border-box; width: 100%; }
.score-value { font-size: 1.5rem; font-weight: bold; color: #3498db; margin-left: 10px; }
.pass { color: #2ecc71; font-weight: bold; }
.fail { color: #e74c3c; font-weight: bold; }

/* --- 7. MOBIL NÉZET --- */
@media (max-width: 600px) {
  /* Alap konténerek fixálása */
  .hoeren-layout, .task-panel, .content-box, .audio-panel {
    width: 100% !important;
    max-width: 100% !important;
    padding: 10px !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
  }

  /* Aufgabe 1 Fix */
  .tf-item { flex-direction: row !important; align-items: flex-start !important; padding: 12px !important; }
  .tf-text { font-size: 0.9rem !important; word-wrap: break-word !important; padding-right: 5px !important; }
  .tf-btns { flex-direction: column !important; gap: 5px !important; flex-shrink: 0 !important; }
  .tf-btn { width: 38px !important; height: 32px !important; }

  /* Aufgabe 2 - EZ OKOZTA A KILÓGÁST: a min-width felülírása! */
  .table-scroll-wrapper { width: 100% !important; margin: 0 !important; padding: 0 !important; }
  .hv-table, .hv-table tbody { 
    display: flex !important; 
    flex-direction: column !important; 
    width: 100% !important; 
    min-width: 0 !important; /* <---- ITT A MEGOLDÁS A 700PX-ES KILÓGÁSRA */
    gap: 20px !important; 
  }
  .hv-table thead { display: none !important; }

  /* A KÁRTYA (tr) */
  .hv-table tr {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    min-width: 0 !important; /* Biztosíték */
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 20px !important; 
    background: rgba(0, 0, 0, 0.3) !important;
    overflow: hidden !important; 
    padding-bottom: 10px !important;
    margin: 0 !important;
    /* Safari Fix a kerekítésre */
    -webkit-transform: translateZ(0) !important;
    transform: translateZ(0) !important;
    -webkit-mask-image: -webkit-radial-gradient(white, black) !important;
  }

  .hv-table td { 
    display: block !important; 
    width: 100% !important; 
    box-sizing: border-box !important; 
    border-radius: 0 !important; 
  }

  /* Kék Címsor (Kosten, stb.) */
  .hv-table td:first-child {
    background: rgba(52, 152, 219, 0.25) !important;
    color: #3498db !important;
    font-weight: bold !important;
    padding: 12px 15px !important;
    border-bottom: 1px solid rgba(52, 152, 219, 0.3) !important;
    margin-bottom: 5px !important;
  }

  .hv-table td:not(:first-child) { padding: 10px 15px !important; border: none !important; }

  /* Könyvtárak nevei mobilon */
  .hv-table td:nth-child(2)::before { content: "Universitätsbibliothek:"; display: block !important; color: #3498db !important; font-size: 0.75rem !important; margin-bottom: 5px !important; }
  .hv-table td:nth-child(3)::before { content: "ZB (Zentralbib.):"; display: block !important; color: #3498db !important; font-size: 0.75rem !important; margin-bottom: 5px !important; }
  .hv-table td:nth-child(4)::before { content: "Literaturarchiv:"; display: block !important; color: #3498db !important; font-size: 0.75rem !important; margin-bottom: 5px !important; }

  /* Inputok tördelése */
  .sm-input { 
    width: 100% !important; max-width: 120px !important; text-align: left !important; 
    display: inline-block !important; margin-bottom: 5px !important; 
  }
  label { display: block !important; margin-bottom: 8px !important; font-size: 0.85rem !important; word-wrap: break-word !important; }
  .error-label, .correct-label { word-wrap: break-word !important; }
}

/* A fő konténer, ami összefogja a feladatokat */
.hoeren-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px; /* Vagy amennyit jónak látsz */
  margin: 0 auto;
  box-sizing: border-box;
}

/* A konkrét feladatblokkok (Aufgabe 1 és 2) */
.task-block {
  width: 100% !important; /* Kényszerítjük, hogy töltse ki a rendelkezésre álló helyet */
  display: block;
  margin-bottom: 30px;
  box-sizing: border-box;
}
</style>