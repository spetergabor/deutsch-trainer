<template>
  <div class="practice-layout">
    <slot name="xp"></slot>

    <div class="practice-box">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>

        <p class="progress-text">
          Kérdés:
          <strong>{{ current }}</strong>
          /
          {{ total }}
        </p>
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PracticeLayout",

  props: {
    progress: {
      type: Number,
      default: 0,
    },

    current: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 10,
    },
  },
};
</script>

