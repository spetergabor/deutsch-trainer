<template>
  <nav class="mobile-bottom-nav">
    <button class="mobile-nav-item" @click="$emit('go-dashboard')">
      <span class="mobile-nav-icon">🏠</span>
      <span>Főmenü</span>
    </button>

    <button
      v-if="userRole === 'teacher' && !isGuestMode"
      class="mobile-nav-item"
      @click="$emit('open-teacher-materials')"
    >
      <span class="mobile-nav-icon">＋</span>
      <span>Anyagok</span>
    </button>

    <button
      v-else-if="userRole === 'student' && !isGuestMode"
      class="mobile-nav-item"
      @click="$emit('open-student-materials')"
    >
      <span class="mobile-nav-icon">＋</span>
      <span>Anyagok</span>
    </button>

    <button
      v-if="!isGuestMode"
      class="mobile-nav-item"
      @click.stop="$emit('open-messages')"
    >
      <span class="mobile-nav-icon">💬</span>
      <span>Üzenetek</span>

      <span
        v-if="unreadMessages"
        :class="notificationBadgeClass"
      >
        {{ unreadMessages }}
      </span>
    </button>

    <button
      v-if="!isGuestMode"
      class="mobile-nav-item"
      @click.stop="$emit('toggle-notifications')"
    >
      <span class="mobile-nav-icon">🔔</span>
      <span>Értesítés</span>

      <span
        v-if="unreadNotifications"
        :class="notificationBadgeClass"
      >
        {{ unreadNotifications }}
      </span>
    </button>

    <button
      v-if="!isGuestMode"
      class="mobile-nav-item"
      @click="$emit('open-profile')"
    >
      <span class="mobile-nav-icon">👤</span>
      <span>Profil</span>
    </button>

    <button class="mobile-nav-item logout-item" @click="$emit('logout')">
      <span class="mobile-nav-icon">🚪</span>
      <span>{{ isGuestMode ? "Belépés" : "Kilépés" }}</span>
    </button>
  </nav>
</template>

<script>
export default {
  name: "MobileBottomNav",

  data() {
    return {
      notificationBadgeClass:
        "absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4757] px-1.5 text-[0.7rem] font-black leading-none text-white",
    };
  },

  props: {
    unreadNotifications: {
      type: Number,
      default: 0,
    },

    unreadMessages: {
      type: Number,
      default: 0,
    },

    isGuestMode: {
      type: Boolean,
      default: false,
    },

    userRole: {
      type: String,
      default: null,
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
