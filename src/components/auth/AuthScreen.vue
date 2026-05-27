<template>
  <section class="welcome-screen">
    <template v-if="!showLoginForm">
      <h1>Üdvözlünk!</h1>
      <p class="subtitle">Kérjük, válaszd ki a szerepkörödet:</p>

      <div class="menu-grid role-grid">
        <article class="menu-card" @click="$emit('open-auth-form', 'student')">
          <div class="card-icon">🎓</div>
          <h2>Diák vagyok</h2>
          <p>Gyakorlás és fejlődés követése</p>
          <button class="select-btn btn-pill btn-check">Tovább</button>
        </article>

        <article class="menu-card" @click="$emit('open-auth-form', 'teacher')">
          <div class="card-icon">👨‍🏫</div>
          <h2>Tanár vagyok</h2>
          <p>Feladatok és diákok kezelése</p>
          <button class="select-btn btn-pill btn-check">Tovább</button>
        </article>
      </div>
    </template>

    <template v-else>
      <div class="widget-card login-card">
        <h2>
          {{ selectedRoleLabel }}
          {{ isLoginMode ? "Bejelentkezés" : "Regisztráció" }}
        </h2>

        <input
          v-if="!isLoginMode"
          :value="authFullName"
          type="text"
          placeholder="Teljes neved"
          class="simple-input"
          @input="$emit('update:auth-full-name', $event.target.value.trim())"
        />

        <input
          :value="authEmail"
          type="email"
          placeholder="E-mail cím"
          class="simple-input"
          @input="$emit('update:auth-email', $event.target.value.trim())"
        />

        <input
          :value="authPassword"
          type="password"
          placeholder="Jelszó (min. 6 karakter)"
          class="simple-input"
          @input="$emit('update:auth-password', $event.target.value)"
          @keyup.enter="$emit('submit-auth-form')"
        />

        <button
          v-if="isLoginMode"
          class="select-btn btn-login"
          @click.prevent="$emit('login')"
          :disabled="isLoggingIn"
        >
          {{ isLoggingIn ? "Belépés..." : "Belépés" }}
        </button>

        <button
          v-else
          class="select-btn btn-register"
          @click="$emit('register')"
        >
          Fiók létrehozása
        </button>

        <div class="auth-toggle">
          <p v-if="isLoginMode">
            Nincs még fiókod?
            <a href="#" @click.prevent="$emit('set-login-mode', false)">
              Regisztrálj itt!
            </a>
          </p>

          <p v-else>
            Már van fiókod?
            <a href="#" @click.prevent="$emit('set-login-mode', true)">
              Lépj be itt!
            </a>
          </p>
        </div>

        <hr class="divider" />

        <button class="btn-outline btn-back" @click="$emit('reset-auth-form')">
          ← Vissza a választáshoz
        </button>
      </div>
    </template>
  </section>
</template>

<script>
export default {
  name: "AuthScreen",

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
  ],
};
</script>
