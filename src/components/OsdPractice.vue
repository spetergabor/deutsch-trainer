<template>
  <div class="osd-practice practice-container">
    <div class="exam-header">
      <h1>ÖSD B2 Gyakorló</h1>

      <p class="exam-info">
        {{ selectedPart ? getPartName(selectedPart) : 'Válaszd ki a vizsgarészt!' }}
      </p>

      <button
        class="info-icon-btn"
        title="Vizsgainformáció"
        @click="showInfoPopup = true"
      >
        ℹ️
      </button>
    </div>

    <div v-if="!selectedPart" class="case-selector">
      <div class="case-grid ui-unit">
        <button class="btn-case" @click="selectPart('lueckentext')">
          <span class="part-icon">📝</span>
          Lückentext
        </button>

        <button class="btn-case" @click="selectPart('leseverstehen')">
          <span class="part-icon">📖</span>
          Leseverstehen
        </button>

        <button class="btn-case" @click="selectPart('hoereverstehen')">
          <span class="part-icon">🎧</span>
          Hörverstehen
        </button>

        <button class="btn-case" @click="selectPart('schreiben')">
          <span class="part-icon">✍️</span>
          Schreiben
        </button>
      </div>
    </div>

    <div v-else class="content-area">
      <button class="back-to-sub" @click="resetSelectedPart">
        ← Vissza az ÖSD menübe
      </button>

      <OsdLueckentext v-if="selectedPart === 'lueckentext'" />
      <OsdLeseverstehen v-else-if="selectedPart === 'leseverstehen'" />
      <OsdHoerverstehen v-else-if="selectedPart === 'hoereverstehen'" />
      <OsdSchreiben v-else-if="selectedPart === 'schreiben'" />
    </div>

    <transition name="fade">
      <div
        v-if="showInfoPopup"
        class="modal-overlay"
        @click.self="showInfoPopup = false"
      >
        <div class="modal-content info-modal">
          <button class="close-modal" @click="showInfoPopup = false">
            ×
          </button>

          <h2>{{ examDetails.title }}</h2>

          <div class="info-scroll-area">
            <div
              v-for="section in examDetails.sections"
              :key="section.name"
              class="info-section"
            >
              <h3>{{ section.icon }} {{ section.name }}</h3>

              <p class="intro-text">
                {{ section.desc }}
              </p>

              <ul>
                <li
                  v-for="detail in section.details"
                  :key="detail"
                >
                  {{ detail }}
                </li>
              </ul>
            </div>
          </div>

          <button class="pill-button btn-green" @click="showInfoPopup = false">
            Értem
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import OsdLueckentext from "./OsdLueckentext.vue";
import OsdLeseverstehen from "./OsdLeseverstehen.vue";
import OsdSchreiben from "./OsdSchreiben.vue";
import OsdHoerverstehen from "./OsdHoerverstehen.vue";

import { examInfo } from "../data/OsdExamInfo.js";

export default {
  name: "OsdPractice",

  components: {
    OsdLueckentext,
    OsdLeseverstehen,
    OsdSchreiben,
    OsdHoerverstehen,
  },

  data() {
    return {
      selectedPart: null,
      showInfoPopup: false,
      examDetails: examInfo,
    };
  },

  methods: {
    selectPart(part) {
      this.selectedPart = part;
    },

    resetSelectedPart() {
      this.selectedPart = null;
    },

    getPartName(part) {
      const names = {
        lueckentext: "Lückentext",
        leseverstehen: "Leseverstehen",
        hoereverstehen: "Hörverstehen",
        schreiben: "Schreiben",
      };

      return names[part] || "ÖSD gyakorlat";
    },
  },
};
</script>

<style scoped src="./OsdStyles.css"></style>