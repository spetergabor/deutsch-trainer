<template>
  <header class="app-header">
    <div class="header-left-cluster">
      <button
        class="logo-btn"
        @click="$emit('go-dashboard')"
        title="Vissza a kezdőlapra"
      >
        D
      </button>

      <button
        v-if="showBackNavigation"
        class="header-breadcrumb"
        @click="$emit('go-dashboard')"
      >
        <span class="header-breadcrumb-arrow">←</span>
        <span class="header-breadcrumb-parent">{{ backParentLabel }}</span>
        <span class="header-breadcrumb-separator">/</span>
        <span class="header-breadcrumb-current">
          {{ backCurrentLabel || headerTitle }}
        </span>
      </button>
    </div>

    <div class="current-task-title">
      {{ headerTitle }}
    </div>

    <div v-if="userSession && !isGuestMode" class="desktop-nav-actions">
      <button
        v-if="userRole === 'teacher'"
        class="header-icon-btn"
        title="Beküldött írások és leckék"
        @click="$emit('open-teacher-materials')"
      >
        +
      </button>

      <button
        v-else-if="userRole === 'student'"
        class="header-icon-btn"
        title="Beküldött anyagaim"
        @click="$emit('open-student-materials')"
      >
        +
      </button>

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

    <div v-else-if="isGuestMode" class="desktop-nav-actions">
      <button
        class="btn-logout-small"
        @click.prevent="$emit('logout')"
      >
        Bejelentkezés
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

    userRole: {
      type: String,
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

    isGuestMode: {
      type: Boolean,
      default: false,
    },

    showBackNavigation: {
      type: Boolean,
      default: false,
    },

    backParentLabel: {
      type: String,
      default: "Főmenü",
    },

    backCurrentLabel: {
      type: String,
      default: "",
    },
  },

  emits: [
    "go-dashboard",
    "open-teacher-materials",
    "open-student-materials",
    "open-messages",
    "toggle-notifications",
    "open-profile",
    "logout",
  ],
};
</script>
