<template>
  <header :class="ui.header">
    <div :class="ui.leftCluster">
      <button
        :class="ui.logoButton"
        @click="$emit('go-dashboard')"
        title="Vissza a kezdőlapra"
      >
        D
      </button>

      <button
        v-if="showBackNavigation"
        :class="ui.breadcrumb"
        @click="$emit('go-back')"
      >
        <span :class="ui.breadcrumbArrow">←</span>
        <span :class="ui.breadcrumbParent">{{ backParentLabel }}</span>
        <span :class="ui.breadcrumbSeparator">/</span>
        <span :class="ui.breadcrumbCurrent">
          {{ backCurrentLabel || headerTitle }}
        </span>
      </button>
    </div>

    <div :class="ui.currentTitle">
      {{ headerTitle }}
    </div>

    <div v-if="userSession && !isGuestMode" :class="ui.actions">
      <button
        v-if="userRole === 'teacher'"
        :class="ui.iconButton"
        title="Beküldött írások és leckék"
        @click="$emit('open-teacher-materials')"
      >
        +
      </button>

      <button
        v-else-if="userRole === 'student'"
        :class="ui.iconButton"
        title="Beküldött anyagaim"
        @click="$emit('open-student-materials')"
      >
        +
      </button>

      <button
        :class="ui.iconButton"
        title="Üzenetek"
        @click.stop="$emit('open-messages')"
      >
        💬

        <span v-if="unreadMessages" :class="notificationBadgeClass">
          {{ unreadMessages }}
        </span>
      </button>

      <div class="relative">
        <button
          :class="ui.iconButton"
          title="Értesítések"
          @click.stop="$emit('toggle-notifications')"
        >
          🔔

          <span v-if="unreadNotifications" :class="notificationBadgeClass">
            {{ unreadNotifications }}
          </span>
        </button>
      </div>

      <button
        :class="ui.iconButton"
        title="Profil"
        @click="$emit('open-profile')"
      >
        👤
      </button>

      <button
        :class="ui.logoutButton"
        @click.prevent="$emit('logout')"
        :disabled="isLoggingOut"
        :title="isLoggingOut ? 'Kilépés...' : 'Kilépés'"
      >
        🚪
      </button>
    </div>

    <div v-else-if="isGuestMode" :class="ui.actions">
      <button
        :class="ui.logoutButton"
        @click.prevent="$emit('logout')"
        title="Bejelentkezés"
      >
        🚪
      </button>
    </div>

    <div v-else class="w-[75px]"></div>
  </header>
</template>

<script>
const HEADER_UI = {
  header:
    "sticky top-3.5 z-[999] mx-auto mb-7 mt-4 flex w-[var(--layout-shell-width)] max-w-[var(--container-main)] items-center justify-between gap-4 overflow-hidden rounded-full border border-white/15 bg-[rgba(20,20,20,0.48)] px-5 py-3.5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150 max-[700px]:hidden",
  leftCluster:
    "flex min-w-0 items-center gap-3",
  logoButton:
    "flex size-11 min-w-11 items-center justify-center rounded-[15px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] font-black text-white outline-none transition hover:scale-[1.06] focus-visible:shadow-[0_8px_24px_rgba(102,126,234,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  breadcrumb:
    "flex min-h-11 min-w-0 max-w-[min(34vw,430px)] items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-white outline-none transition hover:-translate-y-px hover:bg-white/[0.11] focus-visible:ring-4 focus-visible:ring-white/10",
  breadcrumbArrow:
    "text-[1.05rem] font-black leading-none text-white",
  breadcrumbParent:
    "truncate font-black leading-none text-white/70",
  breadcrumbSeparator:
    "font-black text-white/35",
  breadcrumbCurrent:
    "truncate font-black leading-none text-white",
  currentTitle:
    "min-w-[120px] flex-1 text-center text-base font-extrabold text-white",
  actions:
    "flex shrink-0 items-center gap-3",
  iconButton:
    "relative flex size-12 items-center justify-center overflow-visible rounded-full border-0 bg-white/[0.08] text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_18px_rgba(0,0,0,0.18)] outline-none transition hover:-translate-y-0.5 hover:bg-white/[0.15] active:scale-95 focus-visible:ring-4 focus-visible:ring-white/10",
  logoutButton:
    "flex size-12 items-center justify-center rounded-full border-0 bg-white/[0.08] text-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_18px_rgba(0,0,0,0.18)] outline-none transition hover:-translate-y-0.5 hover:bg-[#e74c3c] active:scale-95 focus-visible:ring-4 focus-visible:ring-[#e74c3c]/20 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0",
};

export default {
  name: "AppHeader",

  data() {
    return {
      ui: HEADER_UI,
      notificationBadgeClass:
        "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4757] px-1.5 text-[0.7rem] font-black leading-none text-white",
    };
  },

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
    "go-back",
    "open-teacher-materials",
    "open-student-materials",
    "open-messages",
    "toggle-notifications",
    "open-profile",
    "logout",
  ],
};
</script>
