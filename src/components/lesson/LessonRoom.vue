<template>
  <section :class="lessonUi.shell">
    <header :class="lessonUi.header">
      <div class="min-w-0 flex-1 text-left">
        <span :class="lessonUi.kicker">{{ roleLabel }}</span>
        <h1 :class="lessonUi.title">{{ lesson.topic || "Online óra" }}</h1>
        <p :class="lessonUi.mutedText">{{ participantLabel }} · {{ dateLabel }} · {{ statusLabel }}</p>
      </div>

      <button type="button" :class="lessonUi.closeButton" @click="$emit('close')">
        Bezárás
      </button>
    </header>

    <div :class="getGridClass()">
      <section v-if="!isCompletedLesson" :class="lessonUi.videoPanel">
        <JitsiRoom
          v-if="canJoinVideo"
          :lesson="lesson"
          :display-name="participantLabel"
        />

        <div v-else :class="lessonUi.jitsiRoom">
          <div :class="lessonUi.jitsiState">
            <span :class="lessonUi.kicker">Videóhívás</span>
            <strong :class="lessonUi.jitsiTitle">A tanár indítja az órát</strong>
            <p :class="lessonUi.jitsiText">
              Amint a tanár belép a hívásba, itt automatikusan megjelenik a videószoba.
              A jegyzetet addig is látod és használhatod.
            </p>
          </div>
        </div>
      </section>

      <aside :class="getWorkbookClass()">
        <div>
          <span :class="lessonUi.kicker">Közös munkafüzet</span>
          <h2 :class="lessonUi.workbookTitle">Órai jegyzet</h2>
          <p v-if="lesson.goal" :class="lessonUi.mutedText">{{ lesson.goal }}</p>
        </div>

        <label :class="lessonUi.label">
          Jegyzet
          <textarea
            :value="modelValue"
            :class="lessonUi.textarea"
            placeholder="Ide írhat a tanár és a diák is..."
            @input="handleWorkbookInput"
          ></textarea>
        </label>

        <p :class="lessonUi.liveStatus">
          {{ realtimeStatusText }}
        </p>

        <div class="flex flex-wrap gap-2.5">
          <a
            v-if="lesson.meet_url"
            :href="lesson.meet_url"
            target="_blank"
            rel="noopener noreferrer"
            :class="lessonUi.actionButton"
          >
            Meet link
          </a>

          <button type="button" :class="lessonUi.actionButton" @click="$emit('save')" :disabled="isSaving">
            {{ isSaving ? "Mentés..." : "Jegyzet mentése" }}
          </button>

          <button
            v-if="canComplete"
            type="button"
            :class="lessonUi.secondaryActionButton"
            @click="$emit('complete')"
          >
            Óra lezárása
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import { supabase } from "../../supabase";
import { updateLessonWorkbook } from "../../services/lessonSessionService";
import JitsiRoom from "./JitsiRoom.vue";

const LESSON_UI = {
  shell:
    "lesson-room-shell min-h-[calc(100vh-32px)] w-full rounded-[28px] border border-[#80caff]/20 bg-[radial-gradient(circle_at_18%_12%,rgba(79,172,254,0.16),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,213,106,0.10),transparent_30%),rgba(10,8,15,0.78)] p-[clamp(18px,2.2vw,32px)] text-white max-[700px]:min-h-screen max-[700px]:rounded-none max-[700px]:p-3.5 [.with-desktop-sidebar_&]:min-h-[calc(100vh-var(--desktop-content-top,102px)-var(--desktop-shell-edge,18px))]",
  header:
    "mb-[clamp(18px,2.2vw,32px)] flex items-start justify-between gap-4 max-[700px]:flex-col",
  kicker:
    "block text-[0.8rem] font-black uppercase text-[#80caff]",
  title:
    "my-2 text-left text-[clamp(1.7rem,3vw,2.7rem)] font-black leading-none text-white",
  mutedText:
    "m-0 font-bold leading-snug text-white/60",
  closeButton:
    "inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-4 py-2.5 font-black text-white outline-none transition hover:bg-white/[0.13] focus-visible:ring-4 focus-visible:ring-white/10 max-[700px]:w-full",
  grid:
    "grid min-h-[calc(100vh-190px)] gap-[clamp(16px,2vw,24px)] max-[980px]:grid-cols-1 min-[981px]:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] [.with-desktop-sidebar_&]:min-h-[calc(100vh-var(--desktop-content-top,102px)-var(--desktop-shell-edge,18px)-142px)]",
  noteOnlyGrid:
    "grid min-h-[calc(100vh-190px)] grid-cols-1 gap-[clamp(16px,2vw,24px)] [.with-desktop-sidebar_&]:min-h-[calc(100vh-var(--desktop-content-top,102px)-var(--desktop-shell-edge,18px)-142px)]",
  videoPanel:
    "flex min-h-[420px] min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] max-[980px]:min-h-[300px]",
  jitsiRoom:
    "relative min-h-full min-w-0 flex-1 bg-black/25",
  jitsiState:
    "absolute inset-0 z-[2] flex min-h-full flex-1 flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,rgba(128,202,255,0.14),transparent_42%),rgba(0,0,0,0.18)] p-[clamp(22px,3vw,42px)] text-center",
  jitsiTitle:
    "text-[clamp(1.7rem,4vw,3.5rem)] font-black leading-none text-white",
  jitsiText:
    "m-0 max-w-[440px] font-bold leading-snug text-white/60",
  workbook:
    "flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-[clamp(18px,2vw,24px)]",
  noteOnlyWorkbook:
    "mx-auto flex w-[min(100%,980px)] max-w-[980px] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-[clamp(18px,2vw,24px)]",
  workbookTitle:
    "mb-1.5 mt-1 text-[clamp(1.25rem,2vw,1.8rem)] font-black text-white",
  label:
    "flex min-h-80 flex-1 flex-col gap-2 font-black text-white/70 max-[700px]:min-h-[260px]",
  textarea:
    "min-h-80 w-full flex-1 resize-y rounded-2xl border border-[#80caff]/20 bg-black/20 p-4 font-semibold leading-relaxed text-white outline-none transition placeholder:text-white/35 focus:ring-4 focus:ring-[#80caff]/25 max-[700px]:min-h-[260px]",
  liveStatus:
    "-mt-1 m-0 text-[0.78rem] font-black text-[#80caff]/70",
  actionButton:
    "inline-flex items-center justify-center rounded-full border border-white/10 bg-[#4facfe]/20 px-4 py-3 font-black text-[#80caff] no-underline outline-none transition hover:bg-[#4facfe]/25 focus-visible:ring-4 focus-visible:ring-[#4facfe]/20 disabled:cursor-wait disabled:opacity-60 max-[700px]:w-full",
  secondaryActionButton:
    "inline-flex items-center justify-center rounded-full border border-white/10 bg-[#ffd56a]/15 px-4 py-3 font-black text-[#ffdc7a] outline-none transition hover:bg-[#ffd56a]/20 focus-visible:ring-4 focus-visible:ring-[#ffd56a]/20 max-[700px]:w-full",
};

export default {
  name: "LessonRoom",

  components: {
    JitsiRoom,
  },

  props: {
    lesson: {
      type: Object,
      required: true,
    },

    modelValue: {
      type: String,
      default: "",
    },

    roleLabel: {
      type: String,
      default: "Online óra",
    },

    participantLabel: {
      type: String,
      default: "Résztvevő",
    },

    dateLabel: {
      type: String,
      default: "",
    },

    statusLabel: {
      type: String,
      default: "",
    },

    isSaving: {
      type: Boolean,
      default: false,
    },

    canComplete: {
      type: Boolean,
      default: false,
    },

    canStartVideo: {
      type: Boolean,
      default: false,
    },

    realtimeAuthorRole: {
      type: String,
      default: "participant",
    },
  },

  data() {
    return {
      lessonUi: LESSON_UI,
      realtimeChannel: null,
      realtimeStatus: "connecting",
      realtimeDebounceId: null,
      autosaveDebounceId: null,
      lastAutosavedNotes: "",
      realtimeClientId: "",
      realtimeVideoStartedAt: "",
      didRequestVideoStart: false,
    };
  },

  computed: {
    realtimeStatusText() {
      const labels = {
        connected: "Élő jegyzetkapcsolat aktív",
        connecting: "Élő jegyzetkapcsolat indítása...",
        error: "Az élő jegyzetkapcsolat nem elérhető",
      };

      return labels[this.realtimeStatus] || labels.connecting;
    },

    isCompletedLesson() {
      return this.lesson?.status === "completed";
    },

    videoStartedAt() {
      return this.realtimeVideoStartedAt || this.lesson?.video_started_at || "";
    },

    canJoinVideo() {
      return this.canStartVideo || Boolean(this.videoStartedAt);
    },

    draftStorageKey() {
      return this.lesson?.id ? `lesson-workbook-draft:${this.lesson.id}` : "";
    },
  },

  watch: {
    "lesson.id"() {
      this.realtimeVideoStartedAt = this.lesson?.video_started_at || "";
      this.didRequestVideoStart = false;
      this.lastAutosavedNotes = this.modelValue || "";
      this.restoreCachedWorkbookDraft();
      this.subscribeWorkbookRealtime();
      this.ensureTeacherVideoStarted();
    },

    "lesson.video_started_at"(videoStartedAt) {
      if (!videoStartedAt) {
        return;
      }

      this.realtimeVideoStartedAt = videoStartedAt;

      if (this.canStartVideo) {
        this.broadcastVideoStarted(videoStartedAt);
      }
    },
  },

  mounted() {
    this.realtimeClientId =
      window.crypto?.randomUUID?.() ||
      `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.realtimeVideoStartedAt = this.lesson?.video_started_at || "";
    this.lastAutosavedNotes = this.modelValue || "";
    this.restoreCachedWorkbookDraft();
    this.subscribeWorkbookRealtime();
    this.ensureTeacherVideoStarted();
  },

  beforeUnmount() {
    this.flushWorkbookAutosave();
    this.clearRealtimeDebounce();
    this.clearAutosaveDebounce();
    this.unsubscribeWorkbookRealtime();
  },

  methods: {
    getGridClass() {
      return this.isCompletedLesson
        ? this.lessonUi.noteOnlyGrid
        : this.lessonUi.grid;
    },

    getWorkbookClass() {
      return this.isCompletedLesson
        ? this.lessonUi.noteOnlyWorkbook
        : this.lessonUi.workbook;
    },

    handleWorkbookInput(event) {
      const sharedNotes = event.target.value;

      this.$emit("update:modelValue", sharedNotes);
      this.writeCachedWorkbookDraft(sharedNotes);
      this.queueWorkbookBroadcast(sharedNotes);
      this.queueWorkbookAutosave(sharedNotes);
    },

    ensureTeacherVideoStarted() {
      if (
        !this.canStartVideo ||
        this.isCompletedLesson ||
        this.videoStartedAt ||
        this.didRequestVideoStart
      ) {
        return;
      }

      this.didRequestVideoStart = true;
      this.$emit("start-video");
    },

    syncVideoStarted(videoStartedAt) {
      const startedAt = videoStartedAt || new Date().toISOString();

      this.realtimeVideoStartedAt = startedAt;
      this.broadcastVideoStarted(startedAt);
    },

    async broadcastVideoStarted(videoStartedAt) {
      if (!this.realtimeChannel) {
        return;
      }

      try {
        await this.realtimeChannel.send({
          type: "broadcast",
          event: "video-started",
          payload: {
            videoStartedAt,
            authorRole: this.realtimeAuthorRole,
            clientId: this.realtimeClientId,
            lessonId: this.lesson.id,
            sentAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Videóindítás jelzési hiba:", error);
      }
    },

    queueWorkbookBroadcast(sharedNotes) {
      this.clearRealtimeDebounce();

      this.realtimeDebounceId = window.setTimeout(() => {
        this.broadcastWorkbookDraft(sharedNotes);
      }, 120);
    },

    clearRealtimeDebounce() {
      if (this.realtimeDebounceId) {
        window.clearTimeout(this.realtimeDebounceId);
        this.realtimeDebounceId = null;
      }
    },

    clearAutosaveDebounce() {
      if (this.autosaveDebounceId) {
        window.clearTimeout(this.autosaveDebounceId);
        this.autosaveDebounceId = null;
      }
    },

    queueWorkbookAutosave(sharedNotes) {
      this.clearAutosaveDebounce();

      this.autosaveDebounceId = window.setTimeout(() => {
        this.saveWorkbookDraft(sharedNotes);
      }, 700);
    },

    flushWorkbookAutosave() {
      if (!this.autosaveDebounceId) {
        return;
      }

      this.clearAutosaveDebounce();
      this.saveWorkbookDraft(this.modelValue || "");
    },

    async saveWorkbookDraft(sharedNotes) {
      if (!this.lesson?.id || sharedNotes === this.lastAutosavedNotes) {
        return;
      }

      try {
        const updated = await updateLessonWorkbook(this.lesson.id, { sharedNotes });
        this.lastAutosavedNotes = updated?.shared_notes || sharedNotes || "";
        this.writeCachedWorkbookDraft(this.lastAutosavedNotes);
      } catch (error) {
        console.error("Órai jegyzet autosave hiba:", error);
      }
    },

    restoreCachedWorkbookDraft() {
      const cachedNotes = this.readCachedWorkbookDraft();

      if (!cachedNotes || cachedNotes === this.modelValue) {
        return;
      }

      if (!this.modelValue || cachedNotes.length >= this.modelValue.length) {
        this.$emit("update:modelValue", cachedNotes);
        this.queueWorkbookBroadcast(cachedNotes);
        this.queueWorkbookAutosave(cachedNotes);
      }
    },

    readCachedWorkbookDraft() {
      if (!this.draftStorageKey || typeof window === "undefined") {
        return "";
      }

      try {
        const rawDraft = window.sessionStorage.getItem(this.draftStorageKey);

        if (!rawDraft) {
          return "";
        }

        const draft = JSON.parse(rawDraft);
        return draft?.sharedNotes || "";
      } catch (error) {
        console.error("Órai jegyzet cache olvasási hiba:", error);
        return "";
      }
    },

    writeCachedWorkbookDraft(sharedNotes) {
      if (!this.draftStorageKey || typeof window === "undefined") {
        return;
      }

      try {
        window.sessionStorage.setItem(
          this.draftStorageKey,
          JSON.stringify({
            sharedNotes: sharedNotes || "",
            savedAt: new Date().toISOString(),
          }),
        );
      } catch (error) {
        console.error("Órai jegyzet cache mentési hiba:", error);
      }
    },

    async broadcastWorkbookDraft(sharedNotes) {
      if (!this.realtimeChannel) {
        return;
      }

      try {
        await this.realtimeChannel.send({
          type: "broadcast",
          event: "workbook-draft",
          payload: {
            sharedNotes,
            authorRole: this.realtimeAuthorRole,
            clientId: this.realtimeClientId,
            lessonId: this.lesson.id,
            sentAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Élő munkafüzet küldési hiba:", error);
        this.realtimeStatus = "error";
      }
    },

    subscribeWorkbookRealtime() {
      this.unsubscribeWorkbookRealtime();

      if (!this.lesson?.id) {
        this.realtimeStatus = "error";
        return;
      }

      this.realtimeStatus = "connecting";
      this.realtimeChannel = supabase
        .channel(`lesson-workbook:${this.lesson.id}`, {
          config: {
            broadcast: {
              self: false,
            },
          },
        })
        .on("broadcast", { event: "workbook-draft" }, ({ payload }) => {
          if (!payload || payload.clientId === this.realtimeClientId) {
            return;
          }

          if (payload.lessonId && payload.lessonId !== this.lesson.id) {
            return;
          }

          const sharedNotes = payload.sharedNotes || "";

          this.$emit("update:modelValue", sharedNotes);
          this.writeCachedWorkbookDraft(sharedNotes);
          this.queueWorkbookAutosave(sharedNotes);
        })
        .on("broadcast", { event: "video-started" }, ({ payload }) => {
          if (!payload || payload.clientId === this.realtimeClientId) {
            return;
          }

          if (payload.lessonId && payload.lessonId !== this.lesson.id) {
            return;
          }

          const startedAt = payload.videoStartedAt || new Date().toISOString();

          this.realtimeVideoStartedAt = startedAt;
          this.$emit("video-started", startedAt);
        })
        .subscribe((status) => {
          this.realtimeStatus =
            status === "SUBSCRIBED" ? "connected" : "connecting";
        });
    },

    unsubscribeWorkbookRealtime() {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
    },
  },

  emits: ["update:modelValue", "close", "save", "complete", "start-video", "video-started"],
};
</script>
