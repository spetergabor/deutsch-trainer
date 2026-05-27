<template>
  <div class="grammar-guide">
    <h1>{{ guide.title }}</h1>

    <section class="grammar-guide-hero">
      <div>
        <span>{{ guide.level }}</span>
        <h2>{{ guide.title }}</h2>
        <p>{{ guide.subtitle }}</p>

        <button
          v-if="guide.practice?.available"
          class="grammar-guide-practice-btn"
          @click="$emit('set-mode', guide.practice.mode)"
        >
          {{ guide.practice.label }}
        </button>

        <div
          v-else-if="guide.practice"
          class="grammar-guide-practice-note"
        >
          {{ guide.practice.label }}
        </div>
      </div>

      <div class="grammar-guide-icon">{{ guide.icon }}</div>
    </section>

    <section class="grammar-guide-layout">
      <article class="grammar-guide-main">
        <section
          v-for="section in guide.sections"
          :key="section.title"
          class="grammar-guide-section"
        >
          <h3>{{ section.title }}</h3>
          <p>{{ section.body }}</p>

          <div v-if="section.formula" class="grammar-formula">
            {{ section.formula }}
          </div>

          <div v-if="section.table" class="grammar-tense-table">
            <div class="grammar-tense-row grammar-tense-head">
              <span>Idő</span>
              <span>Képlet</span>
              <span>Példa</span>
            </div>

            <div
              v-for="row in section.table"
              :key="row.tense"
              class="grammar-tense-row"
            >
              <strong>{{ row.tense }}</strong>
              <code>{{ row.form }}</code>
              <span>{{ row.example }}</span>
            </div>
          </div>

          <div v-if="section.examples" class="grammar-example-list">
            <div
              v-for="example in section.examples"
              :key="example.de"
              class="grammar-example"
            >
              <strong>{{ example.de }}</strong>
              <span>{{ example.hu }}</span>
            </div>
          </div>
        </section>
      </article>

      <aside class="grammar-guide-side">
        <h3>Gyors szabályok</h3>

        <ul>
          <li v-for="rule in guide.quickRules" :key="rule">
            {{ rule }}
          </li>
        </ul>

        <button
          v-if="guide.practice?.available"
          class="grammar-guide-side-practice"
          @click="$emit('set-mode', guide.practice.mode)"
        >
          Gyakorlás indítása
        </button>
      </aside>
    </section>
  </div>
</template>

<script>
import { grammarGuides } from "../data/grammarGuides";

export default {
  name: "GrammarGuideView",

  emits: ["set-mode"],

  props: {
    guideId: {
      type: String,
      default: "passiv-alle-zeiten",
    },
  },

  computed: {
    guide() {
      return (
        grammarGuides.find((guide) => guide.id === this.guideId) ||
        grammarGuides[0]
      );
    },
  },
};
</script>
