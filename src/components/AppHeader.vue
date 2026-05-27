<template>
  <header class="app-header">
    <button
      class="logo-btn"
      @click="$emit('go-dashboard')"
      title="Vissza a kezdőlapra"
    >
      D
    </button>

    <div class="current-task-title">
      {{ headerTitle }}
    </div>

    <div v-if="userSession" class="desktop-nav-actions">
      <button
        class="header-icon-btn"
        title="Üzenetek"
        @click.stop="$emit('open-messages')"
      >
        💬

        <span v-if="unreadMessages" class="notification-badge">
          {{ unreadMessages }}
        </span>
      </button>

      <div class="notification-wrapper">
        <button
          class="header-icon-btn"
          title="Értesítések"
          @click.stop="$emit('toggle-notifications')"
        >
          🔔

          <span v-if="unreadNotifications" class="notification-badge">
            {{ unreadNotifications }}
          </span>
        </button>
      </div>

      <button
        class="header-icon-btn"
        title="Profil"
        @click="$emit('open-profile')"
      >
        👤
      </button>

      <button
        class="btn-logout-small"
        @click.prevent="$emit('logout')"
        :disabled="isLoggingOut"
      >
        {{ isLoggingOut ? "Kilépés..." : "Kilépés" }}
      </button>
    </div>

    <div v-else class="header-spacer"></div>
  </header>
</template>

<script>
export default {
  name: "AppHeader",

  props: {
    headerTitle: {
      type: String,
      required: true,
    },

    userSession: {
      type: Object,
      default: null,
    },

    unreadNotifications: {
      type: Number,
      default: 0,
    },

    unreadMessages: {
      type: Number,
      default: 0,
    },

    isLoggingOut: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["go-dashboard", "open-messages", "toggle-notifications", "open-profile", "logout"],
};
</script>
