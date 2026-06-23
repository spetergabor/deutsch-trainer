<template>
  <div
    v-if="note"
    class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 p-5 backdrop-blur-[14px]"
    @click="$emit('close')"
  >
    <div
      class="relative w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141414]/[0.92] p-8 text-white shadow-2xl shadow-black/50"
      @click.stop
    >
      <button
        class="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg border-0 bg-white/[0.08] text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10"
        @click="$emit('close')"
      >
        ✕
      </button>

      <small class="mb-5 block pr-10 text-sm font-extrabold text-white/55">
        <template v-if="note.author_role === 'teacher'">
          👨‍🏫 Tanári jegyzet · {{ formatDate(note.created_at) }}
        </template>

        <template v-else>
          {{ formatDate(note.created_at) }}
        </template>
      </small>

      <p class="m-0 whitespace-pre-wrap text-base leading-relaxed">
        {{ note.content }}
      </p>
    </div>
  </div>
</template>

<script>
import { formatDate } from "../../utils/formatters";

export default {
  name: "NoteModal",

  props: {
    note: {
      type: Object,
      default: null,
    },
  },

  emits: ["close"],

  methods: {
    formatDate,
  },
};
</script>
