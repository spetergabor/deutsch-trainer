<template>
  <div class="schreiben-layout">
    <div v-if="currentSchreibenTask" class="task-description">
      <div class="panel-header">
        {{ currentSchreibenTask.title }}
      </div>

      <div class="scroll-text">
        <p>
          <strong>Szituáció:</strong>
          {{ currentSchreibenTask.situation }}
        </p>

        <p><strong>Hirdetés pontjai:</strong></p>

        <ul class="points-list">
          <li
            v-for="point in currentSchreibenTask.adPoints"
            :key="point"
          >
            {{ point }}
          </li>
        </ul>

        <p class="instruction">
          {{ currentSchreibenTask.instructions }}
        </p>

        <div class="phrases-container">
          <button
            class="btn-toggle-phrases"
            @click="showPhrases = !showPhrases"
          >
            {{ showPhrases ? '💡 Kifejezések elrejtése' : '💡 Hasznos kifejezések megjelenítése' }}
          </button>

          <transition name="slide">
            <ul v-if="showPhrases" class="phrases-list">
              <li
                v-for="phrase in currentSchreibenTask.usefulPhrases"
                :key="phrase"
              >
                {{ phrase }}
              </li>
            </ul>
          </transition>
        </div>
      </div>
    </div>

    <div v-else class="task-description empty-task">
      <p>Nincs elérhető Schreiben feladat.</p>
    </div>

    <div class="writing-area">
      <div class="panel-header">
        Saját levél
      </div>

      <textarea
        v-model="userText"
        placeholder="Írja ide a panaszlevelet..."
        spellcheck="false"
      ></textarea>

      <div class="word-count-bar">
        <div
          class="word-count-badge"
          :class="wordCount >= minWordCount ? 'success' : 'warning'"
        >
          Szavak száma:
          <strong>{{ wordCount }}</strong> / {{ minWordCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { schreibenTasks } from "../data/OsdSchreibenData.js";

export default {
  name: "OsdSchreiben",

  data() {
    return {
      schreibenTasks,
      showPhrases: false,
      userText: "",
      minWordCount: 120,
    };
  },

  computed: {
    currentSchreibenTask() {
      return this.schreibenTasks?.[0] || null;
    },

    wordCount() {
      const text = this.userText.trim();

      if (!text) return 0;

      return text.split(/\s+/).length;
    },
  },
};
</script>

<style scoped>
.schreiben-layout {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1100px;
  margin: 20px auto 0;
  animation: fadeIn 0.4s ease;
}

.task-description,
.writing-area {
  flex: 1;
  min-height: 500px;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.panel-header {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  background: rgba(52, 152, 219, 0.2);
  color: #3498db;

  text-align: left;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.scroll-text {
  flex: 1;
  padding: 25px;
  overflow-y: auto;

  color: #ecf0f1;
  text-align: left;
  line-height: 1.6;
}

.points-list {
  margin: 0 0 20px 20px;
  padding: 0;
}

.points-list li {
  margin-bottom: 8px;
}

.instruction {
  margin-bottom: 25px;
  padding: 15px;
  border-left: 4px solid #f1c40f;
  border-radius: 4px;

  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;

  font-weight: 800;
}

.btn-toggle-phrases {
  width: 100%;
  padding: 10px 15px;

  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;

  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;

  text-align: left;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-toggle-phrases:hover {
  background: rgba(255, 255, 255, 0.2);
}

.phrases-list {
  margin-top: 10px;
  padding: 15px 15px 15px 35px;
  border-radius: 10px;

  background: rgba(0, 0, 0, 0.2);
  color: #bdc3c7;

  font-style: italic;
}

.writing-area textarea {
  flex: 1;
  padding: 25px;
  border: 0;
  outline: none;

  background: transparent;
  color: #ffffff;

  font-size: 1.05rem;
  line-height: 1.6;
  resize: none;
}

.writing-area textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.word-count-bar {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  display: flex;
  justify-content: flex-end;

  background: rgba(0, 0, 0, 0.2);
}

.word-count-badge {
  padding: 8px 15px;
  border-radius: 999px;

  font-size: 0.9rem;
  font-weight: 800;
  transition: 0.25s ease;
}

.warning {
  border: 1px solid #e74c3c;
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.success {
  border: 1px solid #2ecc71;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.empty-task {
  min-height: 180px;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
}

.slide-enter-active,
.slide-leave-active {
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 800px) {
  .schreiben-layout {
    flex-direction: column;
  }

  .task-description,
  .writing-area {
    min-height: 420px;
  }
}
</style>