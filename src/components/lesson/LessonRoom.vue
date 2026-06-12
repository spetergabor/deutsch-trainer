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

    <div class="lesson-room-grid">
      <section class="lesson-room-video">
        <JitsiRoom
          :lesson="lesson"
          :display-name="participantLabel"
          @close="$emit('close')"
        />
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
            @input="$emit('update:modelValue', $event.target.value)"
          ></textarea>
        </label>

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
  },

  emits: ["update:modelValue", "close", "save", "complete"],
};
</script>
