<template>
  <div class="profile-page text-white nemet-page-shell">
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

      <article v-if="!isTeacherProfile" class="widget-card profile-activity-card flex flex-col gap-5 max-[700px]:gap-4">
        <div class="flex items-start justify-between gap-4 max-[700px]:items-center">
          <div>
            <h3>🔥 Aktivitás</h3>
            <p class="m-0 font-extrabold text-white/55">Tanulási lendület</p>
          </div>

          <div class="flex min-w-[104px] items-center justify-center gap-2 rounded-full border border-[#ff8964]/30 bg-[#ff6b57]/15 px-4 py-2.5 text-white max-[700px]:min-w-[92px] max-[700px]:px-3">
            <span class="text-lg">🔥</span>
            <strong class="text-2xl font-black leading-none max-[700px]:text-xl">{{ activityStats.streak }}</strong>
            <small class="text-xs font-black opacity-80">nap</small>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <div :class="profileUi.activityMetricCard">
            <strong :class="profileUi.activityMetricValue">{{ activityStats.today }}</strong>
            <span :class="profileUi.activityMetricLabel">ma</span>
          </div>

          <div :class="profileUi.activityMetricCard">
            <strong :class="profileUi.activityMetricValue">{{ activityStats.activeDays }}</strong>
            <span :class="profileUi.activityMetricLabel">aktív nap</span>
          </div>

          <div :class="profileUi.activityMetricCard">
            <strong :class="profileUi.activityMetricValue">{{ activityStats.last30Days }}</strong>
            <span :class="profileUi.activityMetricLabel">30 nap</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5 rounded-2xl bg-black/15 p-2.5">
          <div :class="profileUi.xpMetricCard">
            <strong :class="profileUi.xpMetricValue">⭐ {{ xpProfile.xp }}</strong>
            <span :class="profileUi.xpMetricLabel">XP</span>
          </div>

          <div :class="profileUi.xpMetricCard">
            <strong :class="profileUi.xpMetricValue">Level {{ xpProfile.level }}</strong>
            <span :class="profileUi.xpMetricLabel">szint</span>
          </div>

          <div :class="profileUi.xpMetricCard">
            <strong :class="profileUi.xpMetricValue">🪙 {{ xpProfile.coins }}</strong>
            <span :class="profileUi.xpMetricLabel">coin</span>
          </div>
        </div>

        <div class="mt-auto rounded-2xl bg-black/10 p-3">
          <div class="mb-2 flex items-center justify-between gap-3">
            <span class="text-xs font-black uppercase text-white/45">Éves aktivitás</span>
            <small class="font-extrabold text-white/45">{{ yearlyActivityCount }} aktív nap</small>
          </div>

          <div class="overflow-x-auto pb-1 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
            <div class="min-w-max">
              <div
                class="mb-1 ml-7 grid h-4 items-end gap-[3px] overflow-hidden"
                :style="activityMonthGridStyle"
                aria-hidden="true"
              >
                <span
                  v-for="month in activityMonthLabels"
                  :key="month.key"
                  class="text-[0.68rem] font-bold text-white/45"
                  :style="getActivityMonthStyle(month)"
                >
                  {{ month.label }}
                </span>
              </div>

              <div class="flex gap-2">
                <div class="grid grid-rows-7 gap-[3px] pr-1 text-[0.62rem] font-bold text-white/35">
                  <span></span>
                  <span>H</span>
                  <span></span>
                  <span>Sze</span>
                  <span></span>
                  <span>P</span>
                  <span></span>
                </div>

                <div
                  class="grid grid-flow-col grid-rows-7 gap-[3px]"
                  :style="activityGridStyle"
                  aria-label="Éves aktivitási naptár"
                >
                  <div
                    v-for="day in activityCells"
                    :key="day.date"
                    :class="getYearActivityCellClass(day)"
                    :title="`${day.date}: ${day.count ? 'aktív nap' : 'nincs aktivitás'}`"
                  ></div>
                </div>
              </div>

              <div class="mt-2 flex items-center justify-end gap-1.5 text-[0.68rem] font-bold text-white/45">
                <span>Kevesebb</span>
                <span :class="profileUi.activityLegendCellEmpty"></span>
                <span :class="profileUi.activityLegendCellOne"></span>
                <span :class="profileUi.activityLegendCellTwo"></span>
                <span :class="profileUi.activityLegendCellThree"></span>
                <span>Több</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article v-if="!isTeacherProfile" class="widget-card profile-daily-goal-card">
        <h3>🎯 Mai cél</h3>

        <div class="my-9 flex items-end gap-3">
          <span class="text-[4.2rem] font-black leading-none text-white">
            {{ activityStats.today }}/10
          </span>
          <span class="mb-2.5 text-2xl font-bold text-white/60">
            feladat kész
          </span>
        </div>

        <div class="mb-9 h-[22px] w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            class="h-full rounded-full bg-[linear-gradient(90deg,#7c6cff,#9d7bff)] transition-[width] duration-500"
            :style="{ width: Math.min((activityStats.today / 10) * 100, 100) + '%' }"
          ></div>
        </div>

        <div class="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/15 px-7 py-6 text-lg font-extrabold text-white">
          <span class="flex size-[42px] items-center justify-center rounded-full border-2 border-[#9d7bff]/70 bg-[#7c6cff]/15 text-lg font-black text-[#a58cff]">
            {{ activityStats.today >= 10 ? "✅" : "🎯" }}
          </span>
          <span v-if="activityStats.today >= 10">Mai cél teljesítve 🎉</span>
          <span v-else>Még {{ Math.max(10 - activityStats.today, 0) }} feladat hiányzik</span>
        </div>
      </article>

      <article v-if="!isTeacherProfile" class="widget-card recent-tasks-card">
        <h3>🕒 Legutóbbi feladatok</h3>

        <div
          v-if="recentExercises.length"
          class="max-h-80 overflow-y-auto pr-1.5 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]"
        >
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

      <article
        v-if="!isTeacherProfile"
        class="widget-card stats-card min-[701px]:col-span-2"
      >
        <div class="mx-auto grid w-full max-w-[860px] gap-4 2xl:grid-cols-[minmax(0,0.82fr)_minmax(320px,1.18fr)] 2xl:items-start">
          <h3 class="mb-1 2xl:col-span-2">📊 Statisztikák</h3>

          <div class="grid gap-3.5">
            <div :class="profileUi.statsPanel">
              <span :class="profileUi.statsSubtleText">Ma ezt gyakorold</span>
              <strong class="my-1 block text-[1.35rem] font-black text-white">
                {{ recommendedPractice.label }}
              </strong>
              <small :class="profileUi.statsSubtleText">{{ recommendedPractice.reason }}</small>

              <button
                class="mt-3 inline-flex w-full items-center justify-center rounded-lg border-0 bg-[linear-gradient(135deg,#4facfe,#43e97b)] px-3.5 py-2.5 font-black text-white transition hover:-translate-y-px hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#43e97b]/15"
                @click="$emit('set-mode', recommendedPractice.type)"
              >
                Indítás
              </button>
            </div>

            <div :class="getTrendBoxClass(last30Trend.direction)">
              <strong class="mb-1.5 block font-black text-white">{{ last30Trend.label }}</strong>
              <span :class="profileUi.statsSubtleText">{{ last30Trend.detail }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3.5">
              <div :class="profileUi.statsAnswerCard">
                <strong class="block text-[1.6rem] font-black text-white">{{ last30CorrectAnswers }}</strong>
                <span :class="profileUi.statsAnswerLabel">helyes</span>
              </div>

              <div :class="profileUi.statsAnswerCard">
                <strong class="block text-[1.6rem] font-black text-white">{{ last30WrongAnswers }}</strong>
                <span :class="profileUi.statsAnswerLabel">hibás</span>
              </div>
            </div>
          </div>

          <div class="grid gap-3.5">
            <div class="relative grid h-[240px] grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl bg-black/20 py-4 pl-14 pr-4 sm:h-[260px]">
              <div>
                <strong class="block text-5xl font-black leading-none text-[#53e37b]">
                  {{ last30AveragePercent }}%
                </strong>
                <span class="text-sm font-extrabold text-white/55">átlag az utolsó 30 feladatból</span>
              </div>

              <div
                class="pointer-events-none absolute bottom-4 left-4 top-24 flex flex-col justify-between text-[0.68rem] font-black text-white/35"
                aria-hidden="true"
              >
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
              </div>

              <div class="h-full min-h-0 w-full overflow-hidden">
                <svg class="block h-full min-h-0 w-full overflow-hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line :class="profileUi.chartGridLine" x1="0" y1="25" x2="100" y2="25" />
                  <line :class="profileUi.chartGridLine" x1="0" y1="50" x2="100" y2="50" />
                  <line :class="profileUi.chartGridLine" x1="0" y1="75" x2="100" y2="75" />
                  <path v-if="last30ChartPath" :class="profileUi.chartPath" :d="last30ChartPath" />
                </svg>
              </div>
            </div>

            <div :class="profileUi.statsPanel">
              <strong class="mb-1.5 block font-black text-white">Gyenge pontok</strong>

              <div v-if="weakTopics.length">
                <div
                  v-for="topic in weakTopics"
                  :key="topic.type"
                  class="flex justify-between gap-3 border-t border-white/[0.07] py-2.5"
                >
                  <span class="font-extrabold text-white">{{ topic.label }}</span>
                  <small :class="profileUi.statsSubtleText">{{ topic.accuracy }}% · {{ topic.attempts }} próba</small>
                </div>
              </div>

              <p v-else class="empty-text">
                Nincs kiugró gyenge téma az utolsó feladatok alapján.
              </p>
            </div>
          </div>
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

        <div v-if="userFiles.length" :class="profileUi.fileList">
          <strong :class="profileUi.fileListTitle">📄 Feltöltött fájlok</strong>

          <ul class="m-0 grid list-none gap-2.5 p-0">
            <li v-for="file in userFiles.slice(0, 3)" :key="file.name" :class="profileUi.fileListItem">
              📄 {{ file.name }}
            </li>
          </ul>
        </div>

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

        <div v-if="savedNotes.length" :class="profileUi.notesScrollList">
          <div
            v-for="note in savedNotes"
            :key="note.id"
            :class="getNoteCardClass(note)"
            @click="$emit('select-note', note)"
          >
            <div :class="profileUi.noteHeader">
              <small :class="profileUi.noteMeta">
                <template v-if="note.author_role === 'teacher'">
                  👨‍🏫 Tanári jegyzet · {{ formatDate(note.created_at) }}
                </template>
                <template v-else>
                  {{ formatDate(note.created_at) }}
                </template>
              </small>

              <button
                :class="profileUi.deleteNoteButton"
                @click.stop="$emit('delete-note', note.id)"
                title="Jegyzet törlése"
              >
                ✕
              </button>
            </div>

            <p :class="profileUi.noteText">{{ note.content }}</p>
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
  notesScrollList:
    "mt-5 max-h-[260px] overflow-y-auto pr-1.5 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]",
  noteCard:
    "relative mb-3 cursor-pointer rounded-2xl border border-white/[0.07] bg-black/20 py-3.5 pl-4 pr-10 transition hover:bg-white/[0.06]",
  teacherNoteCard:
    "border-[#667eea]/35 bg-[#667eea]/10",
  noteHeader:
    "flex items-center justify-between gap-3",
  noteMeta:
    "mb-1.5 block text-[0.82rem] font-bold text-white/50",
  deleteNoteButton:
    "inline-flex size-7 shrink-0 items-center justify-center rounded-full border-0 bg-white/[0.08] text-sm font-black text-white/70 outline-none transition hover:bg-[#ff4757] hover:text-white focus-visible:ring-4 focus-visible:ring-[#ff4757]/20",
  noteText:
    "m-0 text-[0.95rem] font-bold leading-snug text-white",
  fileList:
    "mt-6",
  fileListTitle:
    "mb-3.5 block border-b border-white/[0.08] pb-3 text-base font-black text-white",
  fileListItem:
    "flex items-center gap-3 break-all rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3.5 text-[0.95rem] font-extrabold text-white transition hover:bg-white/[0.06]",
  dangerButton:
    "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-base font-black text-white outline-none transition hover:-translate-y-px hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/10",
  destructiveButton:
    "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#e74c3c]/40 bg-[#e74c3c]/15 px-5 text-base font-black text-[#ff7676] outline-none transition hover:-translate-y-px hover:bg-[#e74c3c]/25 focus-visible:ring-4 focus-visible:ring-[#e74c3c]/20",
  activityMetricCard:
    "flex min-h-[76px] flex-col items-center justify-center rounded-2xl bg-black/18 px-2.5 py-3 max-[700px]:min-h-[72px]",
  activityMetricValue:
    "text-[1.7rem] font-black leading-none text-[#4ee47d] max-[700px]:text-[1.45rem]",
  activityMetricLabel:
    "mt-1.5 text-center text-[0.7rem] font-black uppercase text-white/55",
  xpMetricCard:
    "flex min-h-[62px] flex-col items-center justify-center rounded-xl bg-white/[0.055] px-2 py-2.5",
  xpMetricValue:
    "text-center text-base font-black leading-tight text-white max-[700px]:text-sm",
  xpMetricLabel:
    "mt-1 text-center text-[0.68rem] font-black uppercase text-white/50",
  statsPanel:
    "rounded-2xl border border-white/[0.08] bg-white/[0.055] p-4",
  statsSubtleText:
    "block text-[0.78rem] font-extrabold text-white/60",
  statsAnswerCard:
    "rounded-2xl bg-white/[0.055] p-4 text-center",
  statsAnswerLabel:
    "text-xs font-black uppercase text-white/55",
  chartGridLine:
    "stroke-white/[0.08] [stroke-width:1]",
  chartPath:
    "fill-none stroke-[#53e37b] [filter:drop-shadow(0_0_8px_rgba(83,227,123,0.45))] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.05] [vector-effect:non-scaling-stroke]",
  activityLegendCellEmpty:
    "inline-block size-2.5 rounded-sm bg-white/[0.07]",
  activityLegendCellOne:
    "inline-block size-2.5 rounded-sm bg-[#2ecc71]/30",
  activityLegendCellTwo:
    "inline-block size-2.5 rounded-sm bg-[#2ecc71]/65",
  activityLegendCellThree:
    "inline-block size-2.5 rounded-sm bg-[#2ecc71]",
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
      type: [Array, Object],
      default: () => ({ weeks: [], monthLabels: [], activeDays: 0 }),
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

    activityWeeks() {
      return Array.isArray(this.activityCalendar)
        ? []
        : this.activityCalendar?.weeks || [];
    },

    activityCells() {
      return this.activityWeeks.flatMap((week) => week.days || []);
    },

    activityMonthLabels() {
      return Array.isArray(this.activityCalendar)
        ? []
        : this.activityCalendar?.monthLabels || [];
    },

    yearlyActivityCount() {
      if (!Array.isArray(this.activityCalendar)) {
        return this.activityCalendar?.activeDays || 0;
      }

      return this.activityStats.activeDays || 0;
    },

    activityGridStyle() {
      return {
        gridTemplateRows: "repeat(7, 10px)",
        gridAutoColumns: "10px",
      };
    },

    activityMonthGridStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.max(this.activityWeeks.length, 1)}, 10px)`,
        gridTemplateRows: "1rem",
      };
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

    getActivityDotClass(level) {
      const base =
        "size-[18px] rounded-md transition duration-200 hover:scale-125 max-[700px]:aspect-square max-[700px]:size-auto max-[700px]:rounded";
      const levels = {
        "level-1": "bg-[#2ecc71]/25",
        "level-2": "bg-[#2ecc71]/45",
        "level-3": "bg-[#2ecc71]/70",
        "level-4": "bg-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.45)]",
      };

      return [base, levels[level] || "bg-white/[0.08]"];
    },

    getActivityMonthStyle(month) {
      return {
        gridColumn: `${month.weekIndex + 1} / span 5`,
        gridRow: "1",
      };
    },

    getYearActivityCellClass(day) {
      const base =
        "size-2.5 rounded-sm transition duration-150 hover:scale-125 hover:ring-2 hover:ring-white/20";

      if (!day?.isInYearRange) {
        return [base, "bg-transparent"];
      }

      const levels = {
        "level-1": "bg-[#2ecc71]/30",
        "level-2": "bg-[#2ecc71]/50",
        "level-3": "bg-[#2ecc71]/70",
        "level-4": "bg-[#2ecc71]",
      };

      return [base, levels[day.level] || "bg-white/[0.07]"];
    },

    getTrendBoxClass(direction) {
      const states = {
        up: "border-[#53e37b]/25",
        down: "border-[#ff6384]/35",
      };

      return [this.profileUi.statsPanel, states[direction] || ""];
    },

    getNoteCardClass(note) {
      return [
        this.profileUi.noteCard,
        note.author_role === "teacher" ? this.profileUi.teacherNoteCard : "",
      ];
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
