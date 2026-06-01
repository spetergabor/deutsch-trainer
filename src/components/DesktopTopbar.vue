<template>
  <header class="desktop-topbar">
    <div class="desktop-topbar-left">
      <div class="desktop-topbar-nav" aria-label="Oldal navigáció">
        <button
          type="button"
          :disabled="!canGoBack"
          aria-label="Vissza"
          @click="$emit('go-back')"
        >
          ‹
        </button>

        <button
          type="button"
          :disabled="!canGoForward"
          aria-label="Előre"
          @click="$emit('go-forward')"
        >
          ›
        </button>
      </div>

      <strong>{{ headerTitle }}</strong>
    </div>

    <div class="desktop-topbar-search-wrap">
      <label class="desktop-topbar-search">
        <span>⌕</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Keresés..."
          @keydown.enter.prevent="activateFirstResult"
          @keydown.esc="searchQuery = ''"
        />
      </label>

      <div v-if="filteredSearchItems.length" class="desktop-topbar-search-results">
        <button
          v-for="item in filteredSearchItems"
          :key="item.key"
          type="button"
          @click="activateItem(item)"
        >
          <span>{{ item.icon }}</span>
          <div>
            <strong>{{ item.label }}</strong>
            <small>{{ item.group }}</small>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { getDesktopSearchItems } from "../utils/desktopNavigation";

export default {
  name: "DesktopTopbar",

  props: {
    headerTitle: {
      type: String,
      default: "",
    },

    userRole: {
      type: String,
      default: null,
    },

    canGoBack: {
      type: Boolean,
      default: false,
    },

    canGoForward: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    "go-back",
    "go-forward",
    "set-mode",
    "open-teacher-section",
    "open-student-materials",
  ],

  data() {
    return {
      searchQuery: "",
    };
  },

  computed: {
    searchItems() {
      return getDesktopSearchItems(this.userRole);
    },

    filteredSearchItems() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return [];

      return this.searchItems
        .filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(query))
        .slice(0, 7);
    },
  },

  methods: {
    activateFirstResult() {
      if (!this.filteredSearchItems.length) return;
      this.activateItem(this.filteredSearchItems[0]);
    },

    activateItem(item) {
      this.searchQuery = "";

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
  },
};
</script>
