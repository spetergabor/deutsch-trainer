<template>
  <div class="profile-page text-white">
    <div
      class="profile-dashboard-grid"
      :class="{ 'teacher-profile-grid': isTeacherProfile }"
    >
      <div :class="profileUi.heroCard">
        <div class="flex flex-col items-center gap-4">
          <img :src="avatarUrl" :class="profileUi.avatar" alt="Profilkép" />

          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden-avatar-input"
            @change="uploadAvatar"
          />

          <button
            :class="profileUi.secondaryButton"
            @click="$refs.avatarInput.click()"
            :disabled="isUploadingAvatar"
          >
            {{ isUploadingAvatar ? "Töltés..." : "📸 Profilkép módosítása" }}
          </button>
        </div>

        <h1 class="mb-1 mt-5 text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-white">
          {{ editableName || "Diák" }}
        </h1>
        <p class="m-0 text-base font-bold text-white/60">
          {{ userSession?.email }}
        </p>

        <div class="mt-5 flex flex-wrap justify-center gap-2.5">
          <span :class="profileUi.badge">🔥 {{ activityStats.streak }} nap</span>
          <span :class="profileUi.badge">⭐ {{ xpProfile.xp }} XP</span>
          <span :class="profileUi.badge">📚 {{ stats.totalDone }} feladat</span>
        </div>
      </div>

      <article v-if="!isTeacherProfile" class="widget-card profile-summary-card">
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

        <button :class="profileUi.infoButton" @click="$emit('set-mode', recommendedPractice.type)">
          Gyakorlás indítása
        </button>
      </article>

      <article class="widget-card profile-account-card">
        <h3>👤 Fiók adatok</h3>

        <div :class="profileUi.settingRow">
          <span :class="profileUi.settingLabel">Név</span>
          <input v-model="editableName" :class="profileUi.input" />
        </div>

        <div :class="profileUi.settingRow">
          <span :class="profileUi.settingLabel">Email</span>
          <input :value="userSession?.email" disabled :class="[profileUi.input, profileUi.disabledInput]" />
        </div>

        <div :class="profileUi.settingRow">
          <span :class="profileUi.settingLabel">Regisztrált</span>
          <strong class="text-right font-black text-white">{{ registrationDate }}</strong>
        </div>

        <button
          :class="profileUi.primaryButton"
          @click="saveProfile"
          :disabled="isSavingProfile"
        >
          {{ isSavingProfile ? "Mentés..." : "Mentés" }}
        </button>
      </article>

      <article v-if="!isTeacherProfile" class="widget-card activity-card">
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

      <article v-if="!isTeacherProfile" class="widget-card daily-goal-card">
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

      <article v-if="!isTeacherProfile" class="widget-card recent-tasks-card">
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

      <article v-if="!isTeacherProfile" class="widget-card stats-card visual-stats-card profile-wide-card">
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

        <button :class="profileUi.uploadButton" @click="triggerFileInput" :disabled="isUploading">
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
          :class="profileUi.textarea"
          @input="$emit('update:new-note-text', $event.target.value)"
        ></textarea>

        <button
          :class="profileUi.noteButton"
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

        <button :class="profileUi.dangerButton" @click="handleLogout">Kilépés</button>
        <button :class="profileUi.destructiveButton" @click="deleteAccount">Fiók törlése</button>
      </article>
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabase";
import { formatDate, getTaskName } from "../utils/formatters";

const PROFILE_UI = {
  heroCard:
    "profile-hero-card flex h-full min-h-[360px] flex-col items-center rounded-3xl border border-white/10 bg-white/[0.055] px-6 py-8 text-center shadow-lg shadow-black/25 backdrop-blur-2xl sm:px-8 sm:py-9",
  avatar:
    "size-[118px] rounded-full border-4 border-white/10 bg-[linear-gradient(135deg,#667eea,#764ba2)] p-1 object-cover shadow-[0_0_35px_rgba(118,92,255,0.35)] transition hover:scale-[1.03]",
  badge:
    "inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-sm font-extrabold text-white",
  settingRow:
    "grid grid-cols-1 gap-2 border-b border-white/[0.07] py-3.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-3.5",
  settingLabel: "text-sm font-extrabold text-white/60 sm:text-base",
  input:
    "h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-white/40 focus:border-[#7b89ff] focus:bg-black/30 focus:ring-4 focus:ring-[#7b89ff]/15",
  disabledInput: "cursor-not-allowed opacity-60",
  textarea:
    "min-h-[130px] w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-base font-semibold leading-relaxed text-white outline-none transition placeholder:font-medium placeholder:text-white/40 focus:border-[#7b89ff] focus:bg-black/30 focus:ring-4 focus:ring-[#7b89ff]/15",
  primaryButton:
    "mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#2ecc71,#27ae60)] px-5 text-base font-black text-white shadow-md shadow-[#2ecc71]/20 outline-none transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#2ecc71]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100",
  infoButton:
    "mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#4facfe,#3498db)] px-5 text-base font-black text-white shadow-md shadow-[#3498db]/20 outline-none transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#3498db]/20",
  secondaryButton:
    "inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-[0.95rem] font-black text-white outline-none transition hover:-translate-y-px hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
  uploadButton:
    "mb-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-dashed border-[#53e37b]/45 bg-[#53e37b]/10 px-5 py-3 text-base font-black text-[#53e37b] outline-none transition hover:-translate-y-0.5 hover:bg-[#53e37b]/15 hover:shadow-md hover:shadow-[#53e37b]/10 focus-visible:ring-4 focus-visible:ring-[#53e37b]/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
  noteButton:
    "mt-4 inline-flex h-12 w-full shrink-0 items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#667eea,#764ba2)] px-5 text-base font-black text-white shadow-md shadow-[#667eea]/20 outline-none transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#667eea]/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100",
  dangerButton:
    "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-base font-black text-white outline-none transition hover:-translate-y-px hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/10",
  destructiveButton:
    "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#e74c3c]/40 bg-[#e74c3c]/15 px-5 text-base font-black text-[#ff7676] outline-none transition hover:-translate-y-px hover:bg-[#e74c3c]/25 focus-visible:ring-4 focus-visible:ring-[#e74c3c]/20",
};

export default {
  name: "ProfileView",

  props: {
    userSession: {
      type: Object,
      default: null,
    },
    userRole: {
      type: String,
      default: "student",
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
      profileUi: PROFILE_UI,
      editableName: this.authFullName || "",
      avatarUrl: "",
      isUploadingAvatar: false,
      isSavingProfile: false,
    };
  },

  computed: {
    isTeacherProfile() {
      return this.userRole === "teacher";
    },

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

.profile-hero-card {
  grid-column: span 2;
  height: 100%;
  min-height: 360px;
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

.hidden-avatar-input,
.hidden-file-input {
  display: none !important;
}

.profile-account-card {
  min-height: 360px;
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

  .profile-dashboard-grid.teacher-profile-grid > .profile-hero-card {
    grid-row: 1;
    grid-column: span 2;
  }

  .profile-dashboard-grid.teacher-profile-grid > .profile-account-card {
    grid-row: 1;
    grid-column: 3;
  }

  .profile-dashboard-grid.teacher-profile-grid > .documents-widget {
    grid-row: 2;
    grid-column: 1;
  }

  .profile-dashboard-grid.teacher-profile-grid > .notes-widget {
    grid-row: 2;
    grid-column: 2 / 4;
  }

  .profile-dashboard-grid.teacher-profile-grid > .danger-zone {
    grid-row: 3;
    grid-column: 1 / -1;
  }
}

.danger-zone {
  border-color: rgba(231, 76, 60, 0.22);
  gap: 14px;
}

.danger-zone h3 {
  color: #ff7676;
}

@media (max-width: 1100px) {
  .profile-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-hero-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .profile-page {
    width: var(--mobile-page-width, calc(100% - 30px));
    max-width: var(--mobile-page-width, calc(100% - 30px));
    padding-bottom: 0;
  }

  .profile-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .profile-hero-card {
    grid-column: auto;
    min-height: auto;
  }
}
</style>
