<template>
  <div :class="ui.room">
    <div ref="jitsiRoot" :class="ui.frame"></div>

    <div v-if="isLoading || hasLoadError" :class="ui.state">
      <span :class="ui.kicker">Videóhívás</span>
      <strong :class="ui.title">{{ hasLoadError ? "Nem sikerült betölteni a hívást" : "Jitsi hívás betöltése" }}</strong>
      <p :class="ui.text">
        {{
          hasLoadError
            ? "Nyisd meg külön lapon, vagy próbáld újra az óra újranyitásával."
            : "Engedélyezd a kamerát és a mikrofont, amikor a böngésző kéri."
        }}
      </p>

      <a :href="roomUrl" target="_blank" rel="noopener noreferrer" :class="ui.link">
        Megnyitás külön lapon
      </a>
    </div>
  </div>
</template>

<script>
const JITSI_SCRIPT_ID = "jitsi-external-api";

let jitsiScriptPromise = null;

const JITSI_UI = {
  room:
    "relative min-h-full min-w-0 flex-1 bg-black/25",
  frame:
    "absolute inset-0 [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0",
  state:
    "absolute inset-0 z-[2] flex min-h-full flex-1 flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,rgba(128,202,255,0.14),transparent_42%),rgba(0,0,0,0.18)] p-[clamp(22px,3vw,42px)] text-center",
  kicker:
    "block text-[0.8rem] font-black uppercase text-[#80caff]",
  title:
    "text-[clamp(1.7rem,4vw,3.5rem)] font-black leading-none text-white",
  text:
    "m-0 max-w-[440px] font-bold leading-snug text-white/60",
  link:
    "mt-2 inline-flex items-center justify-center rounded-full border border-white/10 bg-[#4facfe]/20 px-4 py-3 font-black text-[#80caff] no-underline outline-none transition hover:bg-[#4facfe]/25 focus-visible:ring-4 focus-visible:ring-[#4facfe]/20 max-[700px]:w-full",
};

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
      ui: JITSI_UI,
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
