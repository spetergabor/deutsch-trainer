<template>
  <section
    class="messages-page"
    :class="{ 'mobile-chat-page': isMobileConversationOpen }"
  >
    <div v-if="setupError" class="messages-empty setup-error">
      <strong>Az üzenetek táblája még nincs beállítva.</strong>
      <p>Futtasd le a mellékelt SQL fájlt a Supabase SQL editorban.</p>
    </div>

    <div
      v-else
      class="messages-layout"
      :class="{ 'mobile-conversation-open': isMobileConversationOpen }"
    >
      <aside class="messages-contacts" aria-label="Üzenetarchívum">
        <header class="messages-archive-header">
          <div>
            <strong>Beszélgetések</strong>
            <span>{{ userRole === "teacher" ? "Diákok" : "Tanárok" }}</span>
          </div>

          <label class="messages-search">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Keresés..."
              aria-label="Beszélgetések keresése"
            />
          </label>
        </header>

        <div class="messages-contact-list">
          <button
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="message-contact"
            :class="{ active: selectedContact?.id === contact.id }"
            @click="selectContact(contact, { openConversation: true })"
          >
            <span class="message-avatar">{{ getInitial(contact.full_name) }}</span>

            <span class="message-contact-copy">
              <strong>{{ contact.full_name || contact.email }}</strong>
              <small>{{ contact.email }}</small>
            </span>
          </button>

          <p v-if="!isLoadingContacts && !contacts.length" class="messages-empty">
            Nincs elérhető {{ userRole === "teacher" ? "diák" : "tanár" }}.
          </p>

          <p
            v-else-if="!isLoadingContacts && contacts.length && !filteredContacts.length"
            class="messages-empty"
          >
            Nincs találat.
          </p>

          <p v-if="isLoadingContacts" class="messages-empty">Partnerek betöltése...</p>
        </div>
      </aside>

      <main class="messages-conversation" aria-label="Aktív beszélgetés">
        <div v-if="!selectedContact" class="messages-empty conversation-empty">
          <strong>Válassz beszélgetést</strong>
          <span>Az archívumból nyisd meg azt, akinek írni szeretnél.</span>
        </div>

        <template v-else>
          <header class="conversation-title">
            <button
              type="button"
              class="conversation-mobile-back"
              aria-label="Vissza a beszélgetésekhez"
              @click="closeMobileConversation"
            >
              ←
            </button>

            <span class="message-avatar conversation-avatar">
              {{ getInitial(selectedContact.full_name) }}
            </span>

            <div>
              <strong>{{ selectedContact.full_name || selectedContact.email }}</strong>
              <small class="conversation-email">{{ selectedContact.email }}</small>
              <small class="conversation-status">Aktív beszélgetés</small>
            </div>
          </header>

          <div ref="messageList" class="message-list">
            <p v-if="isLoadingMessages" class="messages-empty">Üzenetek betöltése...</p>

            <p v-else-if="!messages.length" class="messages-empty conversation-empty">
              <strong>Még nincs üzenet</strong>
              <span>Indítsd el a beszélgetést egy rövid üzenettel.</span>
            </p>

            <div
              v-for="message in messages"
              :key="message.id"
              class="message-bubble"
              :class="message.sender_id === userSession.id ? 'own' : 'incoming'"
            >
              <p>{{ message.content }}</p>
              <small>{{ formatMessageDate(message.created_at) }}</small>
            </div>
          </div>

          <form class="message-form" @submit.prevent="sendMessage">
            <textarea
              v-model="draft"
              placeholder="Írj üzenetet..."
              :disabled="isSending"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>

            <button :disabled="isSending || !draft.trim()">
              {{ isSending ? "Küldés..." : "Küldés" }}
            </button>
          </form>
        </template>
      </main>
    </div>
  </section>
</template>

<script>
import { formatDate } from "../utils/formatters";
import {
  fetchConversationMessages,
  fetchMessageContacts,
  markConversationMessagesRead,
  sendConversationMessage,
} from "../services/messageService";

export default {
  name: "MessagesPanel",

  props: {
    userSession: {
      type: Object,
      required: true,
    },

    userRole: {
      type: String,
      required: true,
    },
  },

  emits: ["messages-read", "mobile-conversation-open-change"],

  data() {
    return {
      contacts: [],
      selectedContact: null,
      messages: [],
      draft: "",
      searchQuery: "",
      isMobileViewport: false,
      isMobileConversationOpen: false,
      mobileViewportQuery: null,
      mobileViewportHandler: null,
      isLoadingContacts: false,
      isLoadingMessages: false,
      isSending: false,
      setupError: false,
    };
  },

  computed: {
    filteredContacts() {
      const query = this.searchQuery.trim().toLowerCase();

      if (!query) return this.contacts;

      return this.contacts.filter((contact) => {
        const name = contact.full_name || "";
        const email = contact.email || "";
        return `${name} ${email}`.toLowerCase().includes(query);
      });
    },
  },

  async mounted() {
    this.setupMobileViewportWatcher();
    await this.loadContacts();
  },

  beforeUnmount() {
    this.$emit("mobile-conversation-open-change", false);

    if (!this.mobileViewportQuery || !this.mobileViewportHandler) return;

    if (this.mobileViewportQuery.removeEventListener) {
      this.mobileViewportQuery.removeEventListener(
        "change",
        this.mobileViewportHandler,
      );
      return;
    }

    this.mobileViewportQuery.removeListener?.(this.mobileViewportHandler);
  },

  methods: {
    setupMobileViewportWatcher() {
      if (typeof window === "undefined") return;

      this.mobileViewportQuery = window.matchMedia("(max-width: 700px)");
      this.isMobileViewport = this.mobileViewportQuery.matches;

      this.mobileViewportHandler = (event) => {
        this.isMobileViewport = event.matches;

        if (!event.matches) {
          this.setMobileConversationOpen(false);
        }
      };

      if (this.mobileViewportQuery.addEventListener) {
        this.mobileViewportQuery.addEventListener(
          "change",
          this.mobileViewportHandler,
        );
        return;
      }

      this.mobileViewportQuery.addListener?.(this.mobileViewportHandler);
    },

    async loadContacts() {
      this.isLoadingContacts = true;

      try {
        this.contacts = await fetchMessageContacts(
          this.userSession.id,
          this.userRole,
        );

        if (this.contacts.length) {
          await this.selectContact(this.contacts[0], { openConversation: false });
        }
      } catch (error) {
        console.error("Üzenetpartnerek betöltési hiba:", error.message);
      } finally {
        this.isLoadingContacts = false;
      }
    },

    async selectContact(contact, { openConversation = true } = {}) {
      this.selectedContact = contact;
      this.draft = "";

      if (openConversation && this.isMobileViewport) {
        this.setMobileConversationOpen(true);
      }

      await this.loadMessages();
    },

    closeMobileConversation() {
      this.setMobileConversationOpen(false);
    },

    setMobileConversationOpen(isOpen) {
      if (this.isMobileConversationOpen === isOpen) return;

      this.isMobileConversationOpen = isOpen;
      this.$emit("mobile-conversation-open-change", isOpen);
    },

    async loadMessages() {
      if (!this.selectedContact?.id) return;

      this.isLoadingMessages = true;
      this.setupError = false;

      try {
        this.messages = await fetchConversationMessages(
          this.userSession.id,
          this.selectedContact.id,
        );

        await markConversationMessagesRead(
          this.userSession.id,
          this.selectedContact.id,
        );

        this.$emit("messages-read");
        this.scrollToBottom();
      } catch (error) {
        console.error("Üzenetek betöltési hiba:", error.message);
        this.setupError = error.message?.includes("messages");
      } finally {
        this.isLoadingMessages = false;
      }
    },

    async sendMessage() {
      if (!this.selectedContact?.id || !this.draft.trim() || this.isSending) {
        return;
      }

      this.isSending = true;

      try {
        const message = await sendConversationMessage(
          this.userSession.id,
          this.selectedContact.id,
          this.draft,
        );

        if (message) {
          this.messages.push(message);
        }

        this.draft = "";
        this.scrollToBottom();
      } catch (error) {
        console.error("Üzenetküldési hiba:", error.message);
        alert("Nem sikerült elküldeni az üzenetet.");
      } finally {
        this.isSending = false;
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const list = this.$refs.messageList;
        if (list) {
          list.scrollTop = list.scrollHeight;
        }
      });
    },

    getInitial(name) {
      return name?.trim()?.charAt(0)?.toUpperCase() || "?";
    },

    formatMessageDate(dateString) {
      return formatDate(dateString);
    },
  },
};
</script>
