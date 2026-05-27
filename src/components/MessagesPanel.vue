<template>
  <div class="messages-backdrop" @click="$emit('close')">
    <section class="messages-panel" @click.stop>
      <header class="messages-header">
        <div>
          <strong>Üzenetek</strong>
          <span>{{ userRole === "teacher" ? "Diákok" : "Tanárok" }}</span>
        </div>

        <button class="messages-close-btn" @click="$emit('close')">✕</button>
      </header>

      <div v-if="setupError" class="messages-empty setup-error">
        <strong>Az üzenetek táblája még nincs beállítva.</strong>
        <p>Futtasd le a mellékelt SQL fájlt a Supabase SQL editorban.</p>
      </div>

      <div v-else class="messages-layout">
        <aside class="messages-contacts">
          <button
            v-for="contact in contacts"
            :key="contact.id"
            class="message-contact"
            :class="{ active: selectedContact?.id === contact.id }"
            @click="selectContact(contact)"
          >
            <span class="message-avatar">{{ getInitial(contact.full_name) }}</span>

            <span>
              <strong>{{ contact.full_name || contact.email }}</strong>
              <small>{{ contact.email }}</small>
            </span>
          </button>

          <p v-if="!isLoadingContacts && !contacts.length" class="messages-empty">
            Nincs elérhető {{ userRole === "teacher" ? "diák" : "tanár" }}.
          </p>

          <p v-if="isLoadingContacts" class="messages-empty">Partnerek betöltése...</p>
        </aside>

        <main class="messages-conversation">
          <div v-if="!selectedContact" class="messages-empty conversation-empty">
            Válassz beszélgetést.
          </div>

          <template v-else>
            <div class="conversation-title">
              <strong>{{ selectedContact.full_name || selectedContact.email }}</strong>
              <small>{{ selectedContact.email }}</small>
            </div>

            <div ref="messageList" class="message-list">
              <p v-if="isLoadingMessages" class="messages-empty">Üzenetek betöltése...</p>

              <p v-else-if="!messages.length" class="messages-empty">
                Még nincs üzenet. Írj egyet.
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
  </div>
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

  emits: ["close", "messages-read"],

  data() {
    return {
      contacts: [],
      selectedContact: null,
      messages: [],
      draft: "",
      isLoadingContacts: false,
      isLoadingMessages: false,
      isSending: false,
      setupError: false,
    };
  },

  async mounted() {
    await this.loadContacts();
  },

  methods: {
    async loadContacts() {
      this.isLoadingContacts = true;

      try {
        this.contacts = await fetchMessageContacts(
          this.userSession.id,
          this.userRole,
        );

        if (this.contacts.length === 1) {
          await this.selectContact(this.contacts[0]);
        }
      } catch (error) {
        console.error("Üzenetpartnerek betöltési hiba:", error.message);
      } finally {
        this.isLoadingContacts = false;
      }
    },

    async selectContact(contact) {
      this.selectedContact = contact;
      this.draft = "";
      await this.loadMessages();
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
