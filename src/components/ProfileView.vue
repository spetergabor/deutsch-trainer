<template>
  <div class="profile-page">
    <div class="profile-dashboard-grid">
      <div class="profile-top-card">
        <div class="profile-avatar-wrapper">
          <img :src="avatarUrl" class="profile-avatar-image" alt="Profilkép" />

          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden-avatar-input"
            @change="uploadAvatar"
          />

          <button
            class="change-avatar-btn"
            @click="$refs.avatarInput.click()"
            :disabled="isUploadingAvatar"
          >
            {{ isUploadingAvatar ? "Töltés..." : "📸 Profilkép módosítása" }}
          </button>
        </div>

        <h1>{{ editableName || "Diák" }}</h1>
        <p>{{ userSession?.email }}</p>

        <div class="profile-badges">
          <span>🔥 {{ activityStats.streak }} nap</span>
          <span>⭐ {{ xpProfile.xp }} XP</span>
          <span>📚 {{ stats.totalDone }} feladat</span>
        </div>
      </div>

      <article class="widget-card profile-summary-card">
        <h3>📌 Összkép</h3>

        <div class="profile-summary-list">
          <div>
            <span>Mai cél</span>
            <strong>{{ activityStats.today }}/10</strong>
          </div>

          <div>
            <span>Átlag</span>
            <strong>{{ last30AveragePercent }}%</strong>
          </div>

          <div>
            <span>Ajánlott</span>
            <strong>{{ recommendedPractice.label }}</strong>
          </div>
        </div>

        <button @click="$emit('set-mode', recommendedPractice.type)">
          Gyakorlás indítása
        </button>
      </article>

      <article class="widget-card profile-account-card">
        <h3>👤 Fiók adatok</h3>

        <div class="setting-row">
          <span>Név</span>
          <input v-model="editableName" class="profile-input" />
        </div>

        <div class="setting-row">
          <span>Email</span>
          <input :value="userSession?.email" disabled class="profile-input disabled" />
        </div>

        <div class="setting-row">
          <span>Regisztrált</span>
          <strong>{{ registrationDate }}</strong>
        </div>

        <button
          class="save-profile-btn"
          @click="saveProfile"
          :disabled="isSavingProfile"
        >
          {{ isSavingProfile ? "Mentés..." : "Mentés" }}
        </button>
      </article>

      <article class="widget-card activity-card">
        <div class="activity-header">
          <div>
            <h3>🔥 Aktivitás</h3>
            <p class="activity-subtitle">Tanulási lendület</p>
          </div>

          <div class="streak-badge">
            <span class="fire-icon">🔥</span>
            <strong>{{ activityStats.streak }}</strong>
            <small>nap</small>
          </div>
        </div>

        <div class="activity-stats-row">
          <div>
            <strong>{{ activityStats.today }}</strong>
            <span>ma</span>
          </div>

          <div>
            <strong>{{ activityStats.activeDays }}</strong>
            <span>aktív nap</span>
          </div>

          <div>
            <strong>{{ activityStats.last30Days }}</strong>
            <span>30 nap</span>
          </div>
        </div>

        <div class="dashboard-xp-row">
          <div>
            <strong>⭐ {{ xpProfile.xp }}</strong>
            <span>XP</span>
          </div>

          <div>
            <strong>Level {{ xpProfile.level }}</strong>
            <span>szint</span>
          </div>

          <div>
            <strong>🪙 {{ xpProfile.coins }}</strong>
            <span>coin</span>
          </div>
        </div>

        <div class="activity-grid">
          <div
            v-for="day in activityCalendar"
            :key="day.date"
            class="activity-dot"
            :class="day.level"
            :title="`${day.date}: ${day.count} feladat`"
          ></div>
        </div>
      </article>

      <article class="widget-card daily-goal-card">
        <h3>🎯 Mai cél</h3>

        <div class="goal-inline-stats">
          <span class="goal-big-number">{{ activityStats.today }}/10</span>
          <span class="goal-inline-label">feladat kész</span>
        </div>

        <div class="goal-bar">
          <div
            class="goal-fill"
            :style="{ width: Math.min((activityStats.today / 10) * 100, 100) + '%' }"
          ></div>
        </div>

        <div class="goal-status-box">
          <span class="goal-status-icon">
            {{ activityStats.today >= 10 ? "✅" : "🎯" }}
          </span>
          <span v-if="activityStats.today >= 10">Mai cél teljesítve 🎉</span>
          <span v-else>Még {{ Math.max(10 - activityStats.today, 0) }} feladat hiányzik</span>
        </div>
      </article>

      <article class="widget-card recent-tasks-card">
        <h3>🕒 Legutóbbi feladatok</h3>

        <div v-if="recentExercises.length" class="recent-tasks-scroll">
          <div
            v-for="task in recentExercises.slice(0, 30)"
            :key="task.id || task.created_at"
            class="recent-task-row"
          >
            <span>{{ getTaskName(task.exercise_type) }}</span>
            <strong>{{ task.score }} / {{ task.max_score }}</strong>
          </div>
        </div>

        <p v-else class="empty-text">Még nem oldottál meg feladatot.</p>
      </article>

      <article class="widget-card stats-card visual-stats-card profile-wide-card">
        <h3>📊 Statisztikák</h3>

        <div class="practice-recommendation">
          <span>Ma ezt gyakorold</span>
          <strong>{{ recommendedPractice.label }}</strong>
          <small>{{ recommendedPractice.reason }}</small>

          <button @click="$emit('set-mode', recommendedPractice.type)">
            Indítás
          </button>
        </div>

        <div class="trend-box" :class="last30Trend.direction">
          <strong>{{ last30Trend.label }}</strong>
          <span>{{ last30Trend.detail }}</span>
        </div>

        <div class="stats-chart-box">
          <div class="stats-chart-header">
            <strong>{{ last30AveragePercent }}%</strong>
            <span>átlag az utolsó 30 feladatból</span>
          </div>

          <div class="stats-axis-labels" aria-hidden="true">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
          </div>

          <div class="stats-chart-plot">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="25" x2="100" y2="25" />
              <line x1="0" y1="50" x2="100" y2="50" />
              <line x1="0" y1="75" x2="100" y2="75" />
              <path v-if="last30ChartPath" :d="last30ChartPath" />
            </svg>
          </div>
        </div>

        <div class="stats-answer-row">
          <div>
            <strong>{{ last30CorrectAnswers }}</strong>
            <span>helyes</span>
          </div>

          <div>
            <strong>{{ last30WrongAnswers }}</strong>
            <span>hibás</span>
          </div>
        </div>

        <div class="weak-topic-list">
          <strong>Gyenge pontok</strong>

          <div v-if="weakTopics.length">
            <div
              v-for="topic in weakTopics"
              :key="topic.type"
              class="weak-topic-row"
            >
              <span>{{ topic.label }}</span>
              <small>{{ topic.accuracy }}% · {{ topic.attempts }} próba</small>
            </div>
          </div>

          <p v-else class="empty-text">
            Nincs kiugró gyenge téma az utolsó feladatok alapján.
          </p>
        </div>
      </article>

      <article class="widget-card documents-widget">
        <h3>📂 Dokumentumok</h3>

        <button class="upload-btn" @click="triggerFileInput" :disabled="isUploading">
          {{ isUploading ? "Töltés... ⏳" : "+ Új fájl feltöltése" }}
        </button>

        <input
          ref="fileInput"
          type="file"
          class="hidden-file-input"
          accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          @change="$emit('upload-file', $event)"
        />

        <ul v-if="userFiles.length" class="file-list">
          <li v-for="file in userFiles.slice(0, 3)" :key="file.name">
            📄 {{ file.name }}
          </li>
        </ul>

        <p v-else class="empty-text">Nincsenek feltöltött fájlok.</p>
      </article>

      <article class="widget-card notes-widget">
        <h3>📝 Gyors jegyzet</h3>

        <textarea
          :value="newNoteText"
          placeholder="Írd ide a jegyzeted..."
          class="simple-textarea"
          @input="$emit('update:new-note-text', $event.target.value)"
        ></textarea>

        <button
          class="select-btn btn-save-note"
          @click="$emit('save-note')"
          :disabled="!newNoteText.trim()"
        >
          Mentés
        </button>

        <div v-if="savedNotes.length" class="notes-scroll-list">
          <div
            v-for="note in savedNotes"
            :key="note.id"
            :class="['mini-note', note.author_role === 'teacher' ? 'teacher-note' : '']"
            @click="$emit('select-note', note)"
          >
            <div class="note-header">
              <small>
                <template v-if="note.author_role === 'teacher'">
                  👨‍🏫 Tanári jegyzet · {{ formatDate(note.created_at) }}
                </template>
                <template v-else>
                  {{ formatDate(note.created_at) }}
                </template>
              </small>

              <button
                class="delete-note-btn"
                @click.stop="$emit('delete-note', note.id)"
                title="Jegyzet törlése"
              >
                ✕
              </button>
            </div>

            <p>{{ note.content }}</p>
          </div>
        </div>

        <p v-else class="empty-text">Még nincs jegyzeted.</p>
      </article>

      <article class="widget-card danger-zone">
        <h3>⚠️ Fiók műveletek</h3>

        <button class="danger-btn" @click="handleLogout">Kilépés</button>
        <button class="danger-btn red" @click="deleteAccount">Fiók törlése</button>
      </article>
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabase";
import { formatDate, getTaskName } from "../utils/formatters";

export default {
  name: "ProfileView",

  props: {
    userSession: {
      type: Object,
      default: null,
    },
    authFullName: {
      type: String,
      default: "",
    },
    stats: {
      type: Object,
      default: () => ({ accuracy: 0, totalDone: 0 }),
    },
    activityStats: {
      type: Object,
      default: () => ({ streak: 0, today: 0, activeDays: 0, last30Days: 0 }),
    },
    xpProfile: {
      type: Object,
      default: () => ({ xp: 0, level: 1, today_xp: 0, coins: 0 }),
    },
    activityCalendar: {
      type: Array,
      default: () => [],
    },
    recentExercises: {
      type: Array,
      default: () => [],
    },
    userFiles: {
      type: Array,
      default: () => [],
    },
    isUploading: {
      type: Boolean,
      default: false,
    },
    newNoteText: {
      type: String,
      default: "",
    },
    savedNotes: {
      type: Array,
      default: () => [],
    },
    last30ChartPoints: {
      type: String,
      default: "",
    },
    last30AveragePercent: {
      type: Number,
      default: 0,
    },
    last30CorrectAnswers: {
      type: Number,
      default: 0,
    },
    last30WrongAnswers: {
      type: Number,
      default: 0,
    },
    recommendedPractice: {
      type: Object,
      default: () => ({
        type: "perfekt",
        label: "Perfekt",
        reason: "Kezdésnek jó bemelegítő feladat",
      }),
    },
    weakTopics: {
      type: Array,
      default: () => [],
    },
    last30Trend: {
      type: Object,
      default: () => ({
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      }),
    },
  },

  emits: [
    "logout",
    "set-mode",
    "upload-file",
    "update:new-note-text",
    "save-note",
    "delete-note",
    "select-note",
  ],

  data() {
    return {
      editableName: this.authFullName || "",
      avatarUrl: "",
      isUploadingAvatar: false,
      isSavingProfile: false,
    };
  },

  computed: {
    registrationDate() {
      if (!this.userSession?.created_at) return "-";

      return new Date(this.userSession.created_at).toLocaleDateString("hu-HU");
    },

    last30ChartPath() {
      const points = this.last30ChartPoints
        .split(" ")
        .filter(Boolean)
        .map((point) => {
          const [x, y] = point.split(",").map(Number);

          return { x, y };
        })
        .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

      if (!points.length) return "";

      if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
      }

      const commands = [`M ${points[0].x} ${points[0].y}`];

      points.slice(0, -1).forEach((point, index) => {
        const next = points[index + 1];
        const previous = points[index - 1] || point;
        const following = points[index + 2] || next;
        const controlOne = {
          x: point.x + (next.x - previous.x) / 10,
          y: point.y + (next.y - previous.y) / 10,
        };
        const controlTwo = {
          x: next.x - (following.x - point.x) / 10,
          y: next.y - (following.y - point.y) / 10,
        };

        controlOne.y = Math.min(Math.max(controlOne.y, 0), 100);
        controlTwo.y = Math.min(Math.max(controlTwo.y, 0), 100);
        commands.push(
          `C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${next.x} ${next.y}`,
        );
      });

      return commands.join(" ");
    },
  },

  mounted() {
    this.loadAvatar();
  },

  watch: {
    authFullName(newValue) {
      this.editableName = newValue || "";
    },

    userSession: {
      handler() {
        this.loadAvatar();
      },
      deep: true,
    },
  },

  methods: {
    formatDate,
    getTaskName,

    triggerFileInput() {
      this.$refs.fileInput?.click();
    },

    loadAvatar() {
      const savedAvatar = this.userSession?.user_metadata?.avatar_url;

      if (savedAvatar) {
        this.avatarUrl = `${savedAvatar}?t=${Date.now()}`;
        return;
      }

      this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.editableName || "Diák",
      )}&background=667eea&color=ffffff&bold=true`;
    },

    async uploadAvatar(event) {
      const file = event.target.files?.[0];

      if (!file || !this.userSession?.id) return;

      this.isUploadingAvatar = true;

      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `${this.userSession.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrl,
          },
        });

        if (updateError) throw updateError;

        this.avatarUrl = `${publicUrl}?t=${Date.now()}`;
        alert("Profilkép frissítve");
      } catch (error) {
        console.error("Profilkép feltöltési hiba:", error.message);
        alert("Hiba a profilkép feltöltésénél.");
      } finally {
        this.isUploadingAvatar = false;

        if (event.target) {
          event.target.value = "";
        }
      }
    },

    async saveProfile() {
      if (!this.editableName.trim()) {
        alert("A név nem lehet üres.");
        return;
      }

      this.isSavingProfile = true;

      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: this.editableName.trim(),
          },
        });

        if (error) throw error;

        alert("Profil mentve");
      } catch (error) {
        alert(error.message);
      } finally {
        this.isSavingProfile = false;
      }
    },

    handleLogout() {
      this.$emit("logout");
    },

    deleteAccount() {
      alert("Fiók törlés később kerül bekötésre");
    },
  },
};
</script>

<style scoped>
.profile-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 0 0 90px;
  box-sizing: border-box;
  color: white;
}

.profile-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  align-items: stretch;
}

.profile-top-card {
  grid-column: span 2;
  height: 100%;
  min-height: 360px;
  padding: 34px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 15px 34px rgba(0, 0, 0, 0.22);
}

.profile-summary-card {
  height: 100%;
  justify-content: space-between;
}

.profile-summary-list {
  display: grid;
  gap: 14px;
}

.profile-summary-list div {
  padding: 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: rgba(0, 0, 0, 0.2);
}

.profile-summary-list span {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 850;
}

.profile-summary-list strong {
  color: #ffffff;
  font-weight: 950;
  text-align: right;
}

.profile-summary-card button {
  width: 100%;
  margin-top: 22px;
  padding: 14px 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4facfe, #3498db);
  color: white;
  font: inherit;
  font-weight: 950;
  cursor: pointer;
}

.profile-avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.profile-avatar-image {
  width: 118px;
  height: 118px;
  padding: 4px;
  border: 4px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  object-fit: cover;
  box-shadow: 0 0 35px rgba(118, 92, 255, 0.35);
}

.hidden-avatar-input,
.hidden-file-input {
  display: none !important;
}

.change-avatar-btn,
.save-profile-btn,
.danger-btn {
  font-family: inherit;
}

.change-avatar-btn {
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: white;
  font-weight: 850;
  cursor: pointer;
}

.profile-top-card h1 {
  margin: 0 0 6px;
  color: white;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 950;
}

.profile-top-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 750;
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.profile-badges span {
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  font-weight: 850;
}

.profile-account-card {
  min-height: 360px;
}

.setting-row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.setting-row span {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 800;
}

.profile-input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.22);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  outline: none;
}

.profile-input.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.save-profile-btn {
  width: 100%;
  margin-top: 22px;
  padding: 14px 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  font-size: 1rem;
  font-weight: 950;
  cursor: pointer;
}

.profile-wide-card {
  grid-column: 1 / -1;
}

@media (min-width: 1101px) {
  .profile-dashboard-grid > .visual-stats-card {
    grid-row: 3;
    grid-column: 1 / -1;
    min-height: auto;
  }

  .profile-dashboard-grid > .documents-widget {
    grid-row: 4;
    grid-column: 2;
  }

  .profile-dashboard-grid > .notes-widget {
    grid-row: 4;
    grid-column: 3;
  }

  .profile-dashboard-grid > .recent-tasks-card {
    grid-row: 4;
    grid-column: 1;
  }

  .profile-dashboard-grid > .danger-zone {
    grid-row: 5;
    grid-column: 1 / -1;
    min-height: auto;
  }
}

.danger-zone {
  border-color: rgba(231, 76, 60, 0.22);
  gap: 14px;
}

.danger-zone h3 {
  color: #ff7676;
}

.danger-btn {
  width: 100%;
  margin-top: 0;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-weight: 900;
  cursor: pointer;
}

.danger-btn.red {
  border-color: rgba(231, 76, 60, 0.4);
  background: rgba(231, 76, 60, 0.12);
  color: #ff7676;
}

@media (max-width: 1100px) {
  .profile-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-top-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .profile-page {
    width: calc(100% - 20px);
    padding-bottom: 120px;
  }

  .profile-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .profile-top-card {
    grid-column: auto;
    min-height: auto;
    padding: 28px 20px;
    border-radius: 28px;
  }

  .setting-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
