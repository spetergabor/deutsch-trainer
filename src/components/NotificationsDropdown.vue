<template>
  <div :class="ui.dropdown" @click.stop>
    <div :class="ui.header">
      <strong class="text-base font-black">Értesítések</strong>

      <button
        v-if="unreadNotifications"
        :class="ui.markReadButton"
        @click="$emit('mark-all-read')"
      >
        Mind olvasott
      </button>
    </div>

    <div v-if="notifications.length" :class="ui.list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="getNotificationClass(notification)"
      >
        <strong class="mb-1.5 block text-[0.95rem]">{{ notification.title }}</strong>
        <p class="mb-2 mt-0 text-[0.88rem] leading-snug text-white/70">{{ notification.message }}</p>
        <small class="text-[0.78rem] text-white/45">{{ formatDate(notification.created_at) }}</small>
      </div>
    </div>

    <p v-else class="empty-text">Nincs értesítésed.</p>
  </div>
</template>

<script>
import { formatDate } from "../utils/formatters";

const NOTIFICATION_UI = {
  dropdown:
    "fixed right-[calc((100vw-min(1180px,var(--layout-viewport-shell-width)))/2)] top-[12%] z-[99999] max-h-[460px] w-[360px] overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(20,20,20,0.86)] p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150 max-[700px]:bottom-24 max-[700px]:left-2.5 max-[700px]:right-2.5 max-[700px]:top-auto max-[700px]:max-h-[420px] max-[700px]:w-auto [.with-desktop-sidebar_&]:bottom-[18px] [.with-desktop-sidebar_&]:left-[var(--desktop-shell-left,317px)] [.with-desktop-sidebar_&]:right-auto [.with-desktop-sidebar_&]:top-[18px] [.with-desktop-sidebar_&]:flex [.with-desktop-sidebar_&]:max-h-none [.with-desktop-sidebar_&]:w-[380px] [.with-desktop-sidebar_&]:flex-col",
  header:
    "mb-3.5 flex items-center justify-between gap-3 text-white",
  markReadButton:
    "inline-flex items-center rounded-full border-0 bg-white/[0.08] px-3 py-2 text-xs font-extrabold text-white outline-none transition hover:bg-white/[0.15] focus-visible:ring-4 focus-visible:ring-white/10",
  list:
    "max-h-[360px] overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] max-[700px]:max-h-[300px] [.with-desktop-sidebar_&]:min-h-0 [.with-desktop-sidebar_&]:max-h-none",
  item:
    "mb-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.055] p-3.5 text-white",
  unreadItem:
    "border-[#667eea]/45 bg-[#667eea]/15",
};

export default {
  name: "NotificationsDropdown",

  data() {
    return {
      ui: NOTIFICATION_UI,
    };
  },

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

    getNotificationClass(notification) {
      return [
        this.ui.item,
        notification.is_read ? "" : this.ui.unreadItem,
      ];
    },
  },
};
</script>
