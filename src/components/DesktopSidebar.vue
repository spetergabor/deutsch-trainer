<template>
  <aside class="desktop-sidebar">
    <div class="desktop-sidebar-brand">
      <button class="desktop-sidebar-logo" @click="$emit('go-dashboard')">
        D
      </button>

      <div>
        <strong>Deutsch</strong>
        <span>{{ roleLabel }}</span>
      </div>
    </div>

    <nav class="desktop-sidebar-nav">
      <span class="desktop-sidebar-section">Navigáció</span>

      <button
        v-for="item in primaryItems"
        :key="item.key"
        type="button"
        class="desktop-sidebar-item"
        :class="{ active: isActive(item) }"
        @click="activateItem(item)"
      >
        <span class="desktop-sidebar-item-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>

        <em v-if="item.badge">{{ item.badge }}</em>
      </button>

      <span class="desktop-sidebar-section">Gyors elérés</span>

      <button
        v-for="item in quickItems"
        :key="item.key"
        type="button"
        class="desktop-sidebar-item"
        :class="{ active: isActive(item) }"
        @click="activateItem(item)"
      >
        <span class="desktop-sidebar-item-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>

        <em v-if="item.badge">{{ item.badge }}</em>
      </button>
    </nav>

    <div class="desktop-sidebar-footer">
      <button
        v-if="!isGuestMode"
        type="button"
        class="desktop-sidebar-user"
        @click="$emit('open-profile')"
      >
        <span>{{ userInitial }}</span>
        <div>
          <strong>{{ authFullName || "Profil" }}</strong>
          <small>{{ userSession?.email || roleLabel }}</small>
        </div>
      </button>

      <button
        type="button"
        class="desktop-sidebar-logout"
        :disabled="isLoggingOut"
        @click="$emit('logout')"
      >
        <span>🚪</span>
        {{ isGuestMode ? "Bejelentkezés" : isLoggingOut ? "Kilépés..." : "Kilépés" }}
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: "DesktopSidebar",

  props: {
    userSession: {
      type: Object,
      default: null,
    },

    userRole: {
      type: String,
      default: null,
    },

    isGuestMode: {
      type: Boolean,
      default: false,
    },

    authFullName: {
      type: String,
      default: "",
    },

    currentMode: {
      type: String,
      default: null,
    },

    teacherActiveSection: {
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
  },

  emits: [
    "go-dashboard",
    "set-mode",
    "open-teacher-section",
    "open-student-materials",
    "open-messages",
    "toggle-notifications",
    "open-profile",
    "logout",
  ],

  computed: {
    roleLabel() {
      if (this.isGuestMode) return "Vendég mód";
      return this.userRole === "teacher" ? "Tanári felület" : "Diák felület";
    },

    userInitial() {
      return (this.authFullName || this.userSession?.email || "D")
        .trim()
        .charAt(0)
        .toUpperCase();
    },

    primaryItems() {
      if (this.userRole === "teacher") {
        return [
          { key: "teacher-dashboard", label: "Áttekintés", icon: "🏠", action: "dashboard" },
          { key: "teacher-students", label: "Diákkezelő", icon: "🎓", teacherSection: "students" },
          { key: "teacher-writings", label: "Anyagok", icon: "＋", teacherSection: "writings" },
          { key: "teacher-exercises", label: "Feladatkezelő", icon: "🧩", teacherSection: "exercises" },
        ];
      }

      return [
        { key: "student-dashboard", label: "Főmenü", icon: "🏠", action: "dashboard" },
        { key: "student-materials", label: "Házi és anyagok", icon: "＋", mode: "student-materials" },
        { key: "student-library", label: "Tanulási könyvtár", icon: "🧭", mode: "learning-library" },
      ];
    },

    quickItems() {
      const shared = this.isGuestMode
        ? []
        : [
            { key: "messages", label: "Üzenetek", icon: "💬", action: "messages", badge: this.unreadMessages },
            { key: "notifications", label: "Értesítések", icon: "🔔", action: "notifications", badge: this.unreadNotifications },
            { key: "profile", label: "Profil", icon: "👤", action: "profile" },
          ];

      if (this.userRole === "teacher") {
        return [
          { key: "teacher-new-homework", label: "Új házi", icon: "✍️", teacherSection: "writings" },
          { key: "teacher-lessons", label: "Online órák", icon: "🗓️", teacherSection: "students" },
          ...shared,
        ];
      }

      return [
        ...shared,
      ];
    },

  },

  methods: {
    activateItem(item) {
      if (item.action === "dashboard") {
        this.$emit("go-dashboard");
        return;
      }

      if (item.action === "messages") {
        this.$emit("open-messages");
        return;
      }

      if (item.action === "notifications") {
        this.$emit("toggle-notifications");
        return;
      }

      if (item.action === "profile") {
        this.$emit("open-profile");
        return;
      }

      if (item.teacherSection) {
        this.$emit("open-teacher-section", item.teacherSection);
        return;
      }

      if (item.mode === "student-materials") {
        this.$emit("open-student-materials");
        return;
      }

      if (item.mode) {
        this.$emit("set-mode", item.mode);
      }
    },

    isActive(item) {
      if (item.action === "dashboard") {
        return !this.currentMode && !this.teacherActiveSection;
      }

      if (item.action === "profile") {
        return this.currentMode === "profile";
      }

      if (item.action === "messages") {
        return this.currentMode === "messages";
      }

      if (item.teacherSection) {
        return this.teacherActiveSection === item.teacherSection;
      }

      if (item.mode) {
        return this.currentMode === item.mode;
      }

      return false;
    },
  },
};
</script>
