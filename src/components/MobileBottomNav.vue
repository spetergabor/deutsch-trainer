<template>
  <nav class="mobile-bottom-nav">
    <button class="mobile-nav-item" @click="$emit('go-dashboard')">
      <span class="mobile-nav-icon">🏠</span>
      <span>Főmenü</span>
    </button>

    <button class="mobile-nav-item" @click.stop="$emit('open-messages')">
      <span class="mobile-nav-icon">💬</span>
      <span>Üzenetek</span>

      <span
        v-if="unreadMessages"
        class="notification-badge mobile-notification-badge"
      >
        {{ unreadMessages }}
      </span>
    </button>

    <button class="mobile-nav-item" @click.stop="$emit('toggle-notifications')">
      <span class="mobile-nav-icon">🔔</span>
      <span>Értesítés</span>

      <span
        v-if="unreadNotifications"
        class="notification-badge mobile-notification-badge"
      >
        {{ unreadNotifications }}
      </span>
    </button>

    <button class="mobile-nav-item" @click="$emit('open-profile')">
      <span class="mobile-nav-icon">👤</span>
      <span>Profil</span>
    </button>

    <button class="mobile-nav-item logout-item" @click="$emit('logout')">
      <span class="mobile-nav-icon">🚪</span>
      <span>Kilépés</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: "MobileBottomNav",

  props: {
    unreadNotifications: {
      type: Number,
      default: 0,
    },

    unreadMessages: {
      type: Number,
      default: 0,
    },
  },

  emits: ["go-dashboard", "open-messages", "toggle-notifications", "open-profile", "logout"],
};
</script>
