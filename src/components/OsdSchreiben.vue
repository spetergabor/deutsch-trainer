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

        <button
          class="submit-writing-btn"
          :disabled="!canSubmit || isSubmitting"
          @click="submitWriting"
        >
          {{ isSubmitting ? "Küldés..." : "Beküldés tanárnak" }}
        </button>
      </div>

      <p
        v-if="submitFeedback"
        class="submit-feedback"
        :class="submitStatus"
      >
        {{ submitFeedback }}
      </p>
    </div>
  </div>
</template>

<script>
import { schreibenTasks } from "../data/OsdSchreibenData.js";
import { createWritingSubmission } from "../services/writingSubmissionService";

export default {
  name: "OsdSchreiben",

  props: {
    userSession: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      schreibenTasks,
      showPhrases: false,
      userText: "",
      minWordCount: 120,
      isSubmitting: false,
      submitFeedback: "",
      submitStatus: "",
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

    canSubmit() {
      return Boolean(this.currentSchreibenTask && this.userText.trim() && this.userSession?.id);
    },
  },

  methods: {
    async submitWriting() {
      if (!this.canSubmit || this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.submitFeedback = "";
      this.submitStatus = "";

      try {
        const { teacher } = await createWritingSubmission({
          studentId: this.userSession.id,
          taskType: "osd-schreiben",
          taskTitle: this.currentSchreibenTask.title,
          taskSituation: this.currentSchreibenTask.situation,
          taskInstructions: this.currentSchreibenTask.instructions,
          taskPoints: this.currentSchreibenTask.adPoints,
          expectedWordCount: this.minWordCount,
          wordCount: this.wordCount,
          content: this.userText,
        });

        this.submitStatus = "success";
        this.submitFeedback = teacher
          ? `Beküldve ${teacher.full_name || teacher.email || "a tanár"} részére.`
          : "Beküldve a tanári írások közé.";
      } catch (error) {
        console.error("ÖSD Schreiben beküldési hiba:", error.message);
        this.submitStatus = "error";
        this.submitFeedback = error.message?.includes("writing_submissions")
          ? "A beküldött írások táblája még nincs beállítva Supabase-ben."
          : error.message || "Nem sikerült beküldeni a levelet.";
      } finally {
        this.isSubmitting = false;
      }
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;

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

.submit-writing-btn {
  min-width: 180px;
  padding: 11px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #35d06f, #2fc061);
  color: white;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
}

.submit-writing-btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.submit-feedback {
  margin: 0;
  padding: 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
  font-weight: 800;
}

.submit-feedback.success {
  color: #79f2a8;
}

.submit-feedback.error {
  color: #ff8a8a;
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

  .word-count-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .submit-writing-btn {
    width: 100%;
  }
}
</style>
