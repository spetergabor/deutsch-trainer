<template>
  <div class="jitsi-room">
    <div ref="jitsiRoot" class="jitsi-room-frame"></div>

    <div v-if="isLoading || hasLoadError" class="jitsi-room-state">
      <span>Videóhívás</span>
      <strong>{{ hasLoadError ? "Nem sikerült betölteni a hívást" : "Jitsi hívás betöltése" }}</strong>
      <p>
        {{
          hasLoadError
            ? "Nyisd meg külön lapon, vagy próbáld újra az óra újranyitásával."
            : "Engedélyezd a kamerát és a mikrofont, amikor a böngésző kéri."
        }}
      </p>

      <a :href="roomUrl" target="_blank" rel="noopener noreferrer">
        Megnyitás külön lapon
      </a>
    </div>
  </div>
</template>

<script>
const JITSI_SCRIPT_ID = "jitsi-external-api";

let jitsiScriptPromise = null;

function loadJitsiScript(domain) {
  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }

  if (jitsiScriptPromise) {
    return jitsiScriptPromise;
  }

  jitsiScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(JITSI_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = JITSI_SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return jitsiScriptPromise;
}

export default {
  name: "JitsiRoom",

  props: {
    lesson: {
      type: Object,
      required: true,
    },

    displayName: {
      type: String,
      default: "Résztvevő",
    },

    domain: {
      type: String,
      default: "meet.jit.si",
    },
  },

  data() {
    return {
      api: null,
      hasLoadError: false,
      isLoading: true,
      isDestroyed: false,
    };
  },

  computed: {
    roomName() {
      const existingRoom =
        this.lesson.video_room_name ||
        this.lesson.jitsi_room_name ||
        this.lesson.videoRoomName;

      return this.sanitizeRoomName(
        existingRoom || `nemetapp-lesson-${this.lesson.id}`,
      );
    },

    roomUrl() {
      return `https://${this.domain}/${this.roomName}`;
    },
  },

  watch: {
    roomName() {
      this.createMeeting();
    },
  },

  mounted() {
    this.createMeeting();
  },

  beforeUnmount() {
    this.isDestroyed = true;
    this.disposeMeeting();
  },

  methods: {
    sanitizeRoomName(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 96);
    },

    disposeMeeting() {
      if (this.api) {
        this.api.dispose();
        this.api = null;
      }

      if (this.$refs.jitsiRoot) {
        this.$refs.jitsiRoot.innerHTML = "";
      }
    },

    async createMeeting() {
      if (!this.$refs.jitsiRoot || !this.roomName) {
        return;
      }

      this.disposeMeeting();
      this.hasLoadError = false;
      this.isLoading = true;

      try {
        await loadJitsiScript(this.domain);

        if (this.isDestroyed || !this.$refs.jitsiRoot) {
          return;
        }

        this.api = new window.JitsiMeetExternalAPI(this.domain, {
          roomName: this.roomName,
          parentNode: this.$refs.jitsiRoot,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: this.displayName,
          },
          configOverwrite: {
            disableDeepLinking: true,
            prejoinPageEnabled: true,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
          },
        });

        this.api.addListener("videoConferenceJoined", () => {
          this.isLoading = false;
        });
        this.api.addListener("readyToClose", () => {
          this.$emit("close");
        });

        window.setTimeout(() => {
          if (this.api && !this.hasLoadError) {
            this.isLoading = false;
          }
        }, 3200);
      } catch (error) {
        console.error("Jitsi betöltési hiba:", error);
        this.hasLoadError = true;
        this.isLoading = false;
      }
    },
  },

  emits: ["close"],
};
</script>
