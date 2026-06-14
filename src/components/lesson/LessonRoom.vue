<template>
  <section class="lesson-room-shell">
    <header class="lesson-room-header">
      <div>
        <span>{{ roleLabel }}</span>
        <h1>{{ lesson.topic || "Online óra" }}</h1>
        <p>{{ participantLabel }} · {{ dateLabel }} · {{ statusLabel }}</p>
      </div>

      <button type="button" class="lesson-room-close" @click="$emit('close')">
        Bezárás
      </button>
    </header>

    <div class="lesson-room-grid" :class="{ 'is-note-only': isCompletedLesson }">
      <section v-if="!isCompletedLesson" class="lesson-room-video">
        <JitsiRoom
          v-if="canJoinVideo"
          :lesson="lesson"
          :display-name="participantLabel"
          @close="$emit('close')"
        />

        <div v-else class="jitsi-room jitsi-room-waiting">
          <div class="jitsi-room-state is-waiting">
            <span>Videóhívás</span>
            <strong>A tanár indítja az órát</strong>
            <p>
              Amint a tanár belép a hívásba, itt automatikusan megjelenik a videószoba.
              A jegyzetet addig is látod és használhatod.
            </p>
          </div>
        </div>
      </section>

      <aside class="lesson-room-workbook">
        <div class="lesson-room-workbook-head">
          <span>Közös munkafüzet</span>
          <h2>Órai jegyzet</h2>
          <p v-if="lesson.goal">{{ lesson.goal }}</p>
        </div>

        <label>
          Jegyzet
          <textarea
            :value="modelValue"
            placeholder="Ide írhat a tanár és a diák is..."
            @input="handleWorkbookInput"
          ></textarea>
        </label>

        <p class="lesson-room-live-status">
          {{ realtimeStatusText }}
        </p>

        <div class="lesson-room-actions">
          <a
            v-if="lesson.meet_url"
            :href="lesson.meet_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meet link
          </a>

          <button type="button" @click="$emit('save')" :disabled="isSaving">
            {{ isSaving ? "Mentés..." : "Jegyzet mentése" }}
          </button>

          <button
            v-if="canComplete"
            type="button"
            class="secondary"
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
import JitsiRoom from "./JitsiRoom.vue";

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
      realtimeChannel: null,
      realtimeStatus: "connecting",
      realtimeDebounceId: null,
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
  },

  watch: {
    "lesson.id"() {
      this.realtimeVideoStartedAt = this.lesson?.video_started_at || "";
      this.didRequestVideoStart = false;
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
    this.subscribeWorkbookRealtime();
    this.ensureTeacherVideoStarted();
  },

  beforeUnmount() {
    this.clearRealtimeDebounce();
    this.unsubscribeWorkbookRealtime();
  },

  methods: {
    handleWorkbookInput(event) {
      const sharedNotes = event.target.value;

      this.$emit("update:modelValue", sharedNotes);
      this.queueWorkbookBroadcast(sharedNotes);
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

          this.$emit("update:modelValue", payload.sharedNotes || "");
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
