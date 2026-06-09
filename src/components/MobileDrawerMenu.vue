<template>
  <div class="mobile-drawer-shell">
    <button
      type="button"
      class="mobile-drawer-trigger"
      aria-label="Menü megnyitása"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click="openMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Transition name="mobile-drawer-fade">
      <div
        v-if="isOpen"
        class="mobile-drawer-backdrop"
        @click.self="closeMenu"
      >
        <aside class="mobile-drawer-panel" aria-label="Mobil menü">
          <header class="mobile-drawer-head">
            <div class="mobile-drawer-brand">
              <button type="button" class="mobile-drawer-logo" @click="activateDashboard">
                D
              </button>

              <div>
                <strong>Deutsch</strong>
                <span>{{ roleLabel }}</span>
              </div>
            </div>

            <button
              type="button"
              class="mobile-drawer-close"
              aria-label="Menü bezárása"
              @click="closeMenu"
            >
              ×
            </button>
          </header>

          <nav class="mobile-drawer-nav">
            <span class="mobile-drawer-section">Navigáció</span>

            <button
              v-for="item in primaryItems"
              :key="item.key"
              type="button"
              class="mobile-drawer-item"
              :class="{ active: isActive(item) }"
              @click="activateItem(item)"
            >
              <span class="mobile-drawer-item-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <em v-if="item.badge">{{ item.badge }}</em>
            </button>

            <span
              v-if="quickItems.length"
              class="mobile-drawer-section"
            >
              Gyors elérés
            </span>

            <button
              v-for="item in quickItems"
              :key="item.key"
              type="button"
              class="mobile-drawer-item"
              :class="{ active: isActive(item) }"
              @click="activateItem(item)"
            >
              <span class="mobile-drawer-item-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <em v-if="item.badge">{{ item.badge }}</em>
            </button>
          </nav>

          <footer class="mobile-drawer-footer">
            <button
              v-if="!isGuestMode"
              type="button"
              class="mobile-drawer-user"
              @click="activateProfile"
            >
              <span>{{ userInitial }}</span>
              <div>
                <strong>{{ authFullName || "Profil" }}</strong>
                <small>{{ userSession?.email || roleLabel }}</small>
              </div>
            </button>

            <button
              type="button"
              class="mobile-drawer-logout"
              :disabled="isLoggingOut"
              @click="activateLogout"
            >
              <span>🚪</span>
              {{ isGuestMode ? "Bejelentkezés" : isLoggingOut ? "Kilépés..." : "Kilépés" }}
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: "MobileDrawerMenu",

  props: {
    userSession: {
      type: Object,
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
    "open-student-materials",
    "open-messages",
    "toggle-notifications",
    "open-profile",
    "logout",
  ],

  data() {
    return {
      isOpen: false,
    };
  },

  computed: {
    roleLabel() {
      return this.isGuestMode ? "Vendég mód" : "Diák felület";
    },

    userInitial() {
      return (this.authFullName || this.userSession?.email || "D")
        .trim()
        .charAt(0)
        .toUpperCase();
    },

    primaryItems() {
      const items = [
        { key: "student-dashboard", label: "Főmenü", icon: "🏠", action: "dashboard" },
        { key: "student-library", label: "Tanulási könyvtár", icon: "🧭", mode: "learning-library" },
      ];

      if (!this.isGuestMode) {
        items.splice(1, 0, {
          key: "student-materials",
          label: "Házi és anyagok",
          icon: "＋",
          mode: "student-materials",
        });
      }

      return items;
    },

    quickItems() {
      if (this.isGuestMode) return [];

      return [
        { key: "messages", label: "Üzenetek", icon: "💬", action: "messages", badge: this.unreadMessages },
        { key: "notifications", label: "Értesítések", icon: "🔔", action: "notifications", badge: this.unreadNotifications },
        { key: "profile", label: "Profil", icon: "👤", action: "profile" },
      ];
    },
  },

  watch: {
    isOpen(value) {
      document.body.classList.toggle("mobile-drawer-open", value);
    },
  },

  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    document.body.classList.remove("mobile-drawer-open");
  },

  methods: {
    openMenu() {
      this.isOpen = true;
    },

    closeMenu() {
      this.isOpen = false;
    },

    handleKeydown(event) {
      if (event.key === "Escape") {
        this.closeMenu();
      }
    },

    activateDashboard() {
      this.$emit("go-dashboard");
      this.closeMenu();
    },

    activateProfile() {
      this.$emit("open-profile");
      this.closeMenu();
    },

    activateLogout() {
      this.$emit("logout");
      this.closeMenu();
    },

    activateItem(item) {
      if (item.action === "dashboard") {
        this.$emit("go-dashboard");
      } else if (item.action === "messages") {
        this.$emit("open-messages");
      } else if (item.action === "notifications") {
        this.$emit("toggle-notifications");
      } else if (item.action === "profile") {
        this.$emit("open-profile");
      } else if (item.mode === "student-materials") {
        this.$emit("open-student-materials");
      } else if (item.mode) {
        this.$emit("set-mode", item.mode);
      }

      this.closeMenu();
    },

    isActive(item) {
      if (item.action === "dashboard") return !this.currentMode;
      if (item.action === "profile") return this.currentMode === "profile";
      if (item.action === "messages") return this.currentMode === "messages";
      if (item.mode) return this.currentMode === item.mode;
      return false;
    },
  },
};
</script>
