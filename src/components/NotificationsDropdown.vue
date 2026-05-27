<template>
  <div class="notifications-dropdown global-notifications-dropdown" @click.stop>
    <div class="notifications-dropdown-header">
      <strong>Értesítések</strong>

      <button
        v-if="unreadNotifications"
        class="mark-read-btn"
        @click="$emit('mark-all-read')"
      >
        Mind olvasott
      </button>
    </div>

    <div v-if="notifications.length" class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', notification.is_read ? 'read' : 'unread']"
      >
        <strong>{{ notification.title }}</strong>
        <p>{{ notification.message }}</p>
        <small>{{ formatDate(notification.created_at) }}</small>
      </div>
    </div>

    <p v-else class="empty-text">Nincs értesítésed.</p>
  </div>
</template>

<script>
import { formatDate } from "../utils/formatters";

export default {
  name: "NotificationsDropdown",

  props: {
    notifications: {
      type: Array,
      default: () => [],
    },

    unreadNotifications: {
      type: Number,
      default: 0,
    },
  },

  emits: ["mark-all-read"],

  methods: {
    formatDate,
  },
};
</script>
