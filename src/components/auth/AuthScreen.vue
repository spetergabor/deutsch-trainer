<template>
  <section
    class="auth-screen flex min-h-dvh w-[min(90%,1180px)] flex-col items-center justify-center py-[clamp(24px,6vh,64px)] text-center"
  >
    <template v-if="!showLoginForm">
      <h1 class="m-0 text-[clamp(2.35rem,6vw,4.6rem)] font-black leading-tight text-white">
        Üdvözlünk!
      </h1>
      <p class="mb-8 mt-3 text-base font-bold text-white/60 sm:text-lg">
        Kérjük, válaszd ki a szerepkörödet:
      </p>

      <div class="flex w-full flex-wrap justify-center gap-7">
        <button
          type="button"
          :class="authUi.roleCard"
          @click="$emit('open-auth-form', 'student')"
        >
          <span :class="authUi.roleIcon">
            🎓
          </span>
          <span class="mb-2 text-2xl font-black leading-tight">
            Diák vagyok
          </span>
          <span class="mb-6 block text-base font-semibold leading-normal text-white/60">
            Gyakorlás és fejlődés követése
          </span>
          <span :class="authUi.roleAction">
            Tovább
          </span>
        </button>

        <button
          type="button"
          :class="authUi.roleCard"
          @click="$emit('open-auth-form', 'teacher')"
        >
          <span :class="authUi.roleIcon">
            👨‍🏫
          </span>
          <span class="mb-2 text-2xl font-black leading-tight">
            Tanár vagyok
          </span>
          <span class="mb-6 block text-base font-semibold leading-normal text-white/60">
            Feladatok és diákok kezelése
          </span>
          <span :class="authUi.roleAction">
            Tovább
          </span>
        </button>
      </div>

      <p class="mb-0 mt-7 text-center text-base font-bold text-white/60">
        Csak körülnéznél?
        <a
          href="#"
          :class="authUi.textLink"
          @click.prevent="$emit('continue-as-guest')"
        >
          Próbáld ki vendégként
        </a>
      </p>
    </template>

    <template v-else>
      <div :class="authUi.formCard">
        <h2 class="m-0 mb-7 text-[1.55rem] font-black leading-tight text-white sm:text-[1.8rem]">
          {{ selectedRoleLabel }}
          {{ isLoginMode ? "Bejelentkezés" : "Regisztráció" }}
        </h2>

        <input
          v-if="!isLoginMode"
          :value="authFullName"
          type="text"
          placeholder="Teljes neved"
          :class="authUi.input"
          @input="$emit('update:auth-full-name', $event.target.value.trim())"
        />

        <input
          :value="authEmail"
          type="email"
          placeholder="E-mail cím"
          :class="authUi.input"
          @input="$emit('update:auth-email', $event.target.value.trim())"
        />

        <input
          :value="authPassword"
          type="password"
          placeholder="Jelszó (min. 6 karakter)"
          :class="authUi.input"
          @input="$emit('update:auth-password', $event.target.value)"
          @keyup.enter="$emit('submit-auth-form')"
        />

        <button
          v-if="isLoginMode"
          :class="authUi.primaryButton"
          @click.prevent="$emit('login')"
          :disabled="isLoggingIn"
        >
          {{ isLoggingIn ? "Belépés..." : "Belépés" }}
        </button>

        <button
          v-else
          :class="authUi.registerButton"
          @click="$emit('register')"
        >
          Fiók létrehozása
        </button>

        <div class="mt-6 text-[0.95rem] font-semibold text-white/60">
          <p v-if="isLoginMode" class="m-0">
            Nincs még fiókod?
            <a
              href="#"
              :class="authUi.inlineLink"
              @click.prevent="$emit('set-login-mode', false)"
            >
              Regisztrálj itt!
            </a>
          </p>

          <p v-else class="m-0">
            Már van fiókod?
            <a
              href="#"
              :class="authUi.inlineLink"
              @click.prevent="$emit('set-login-mode', true)"
            >
              Lépj be itt!
            </a>
          </p>
        </div>

        <hr class="my-7 h-px w-full border-0 bg-white/10" />

        <button
          :class="authUi.secondaryButton"
          @click="$emit('reset-auth-form')"
        >
          ← Vissza a választáshoz
        </button>
      </div>
    </template>
  </section>
</template>

<script>
const AUTH_UI = {
  roleCard:
    "group flex min-h-72 w-full max-w-[340px] cursor-pointer flex-col items-center rounded-3xl border border-white/10 bg-white/[0.055] px-6 py-7 text-center text-white shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-1 hover:border-[#43e97b]/40 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7b89ff]/25 sm:w-[340px]",
  roleIcon:
    "mb-5 flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7b89ff,#9163ff)] text-3xl shadow-lg shadow-black/30",
  roleAction:
    "mt-auto inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#35d06f,#2fc061)] px-5 text-base font-extrabold text-white shadow-md shadow-[#2fc061]/20 transition duration-200 group-hover:brightness-105",
  formCard:
    "w-full max-w-[430px] rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-center text-white shadow-xl shadow-black/30 backdrop-blur-2xl sm:p-8",
  input:
    "mb-3 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-base font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-white/40 focus:border-[#7b89ff] focus:bg-black/30 focus:ring-4 focus:ring-[#7b89ff]/15",
  primaryButton:
    "mt-1 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#2ecc71,#27ae60)] px-5 text-base font-black text-white shadow-md shadow-[#2ecc71]/20 outline-none transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#2ecc71]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100",
  registerButton:
    "mt-1 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-transparent bg-[linear-gradient(135deg,#667eea,#764ba2)] px-5 text-base font-black text-white shadow-md shadow-[#667eea]/20 outline-none transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-[#667eea]/25 disabled:cursor-not-allowed disabled:opacity-60",
  secondaryButton:
    "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-[0.95rem] font-black text-white outline-none transition hover:-translate-y-px hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/10",
  textLink:
    "font-black text-[#ffd56a] underline underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd56a]/20",
  inlineLink:
    "font-black text-[#9b8cff] no-underline hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9b8cff]/20",
};

export default {
  name: "AuthScreen",

  data() {
    return {
      authUi: AUTH_UI,
    };
  },

  props: {
    showLoginForm: {
      type: String,
      default: null,
    },

    isLoginMode: {
      type: Boolean,
      default: true,
    },

    selectedRoleLabel: {
      type: String,
      required: true,
    },

    authFullName: {
      type: String,
      default: "",
    },

    authEmail: {
      type: String,
      default: "",
    },

    authPassword: {
      type: String,
      default: "",
    },

    isLoggingIn: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    "open-auth-form",
    "update:auth-full-name",
    "update:auth-email",
    "update:auth-password",
    "submit-auth-form",
    "login",
    "register",
    "set-login-mode",
    "reset-auth-form",
    "continue-as-guest",
  ],
};
</script>
