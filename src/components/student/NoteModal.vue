<template>
  <div v-if="note" class="note-modal-backdrop" @click="$emit('close')">
    <div class="note-modal" @click.stop>
      <button class="note-modal-close" @click="$emit('close')">✕</button>

      <small>
        <template v-if="note.author_role === 'teacher'">
          👨‍🏫 Tanári jegyzet · {{ formatDate(note.created_at) }}
        </template>

        <template v-else>
          {{ formatDate(note.created_at) }}
        </template>
      </small>

      <p>{{ note.content }}</p>
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
