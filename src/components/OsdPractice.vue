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
      <div class="case-grid">
        <button
          v-for="part in examParts"
          :key="part.id"
          class="btn-case"
          :class="{ recommended: part.recommended }"
          @click="selectPart(part.id)"
        >
          <span class="part-icon">{{ part.icon }}</span>

          <span class="part-copy">
            <strong>{{ part.title }}</strong>
            <small>{{ part.description }}</small>
          </span>

          <span class="part-meta">
            <span>{{ part.duration }}</span>
            <span>{{ part.skill }}</span>
          </span>

          <span class="part-action" aria-hidden="true">→</span>
        </button>
      </div>
    </div>

    <div v-else class="content-area">
      <button class="back-to-sub" @click="resetSelectedPart">
        ← Vissza az ÖSD menübe
      </button>

      <OsdLueckentext
        v-if="selectedPart === 'lueckentext'"
        @exercise-finished="$emit('exercise-finished')"
      />
      <OsdLeseverstehen
        v-else-if="selectedPart === 'leseverstehen'"
        @exercise-finished="$emit('exercise-finished')"
        @go-dashboard="$emit('go-dashboard')"
      />
      <OsdHoerverstehen
        v-else-if="selectedPart === 'hoereverstehen'"
        @exercise-finished="$emit('exercise-finished')"
      />
      <OsdSchreiben
        v-else-if="selectedPart === 'schreiben'"
        :user-session="userSession"
      />
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

          <button class="practice-btn-primary" @click="showInfoPopup = false">
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

  props: {
    userSession: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      selectedPart: null,
      showInfoPopup: false,
      examDetails: examInfo,
      examParts: [
        {
          id: "lueckentext",
          title: "Lückentext",
          icon: "📝",
          duration: "15 perc",
          skill: "Nyelvhelyesség",
          description:
            "Hiányzó szavak, kötőelemek és szerkezetek gyakorlása vizsgatempóban.",
        },
        {
          id: "leseverstehen",
          title: "Leseverstehen",
          icon: "📖",
          duration: "25 perc",
          skill: "Olvasás",
          description:
            "Szövegértés, cím-hozzárendelés és részletes kérdések ÖSD formátumban.",
        },
        {
          id: "hoereverstehen",
          title: "Hörverstehen",
          icon: "🎧",
          duration: "20 perc",
          skill: "Hallásértés",
          description:
            "Audio alapú igaz-hamis, párosító és részletértési feladatok.",
        },
        {
          id: "schreiben",
          title: "Schreiben",
          icon: "✍️",
          duration: "30 perc",
          skill: "Írás",
          description:
            "Panaszlevél, e-mail és érvelő szöveg gyakorlása javítható beküldéssel.",
          recommended: true,
        },
      ],
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
