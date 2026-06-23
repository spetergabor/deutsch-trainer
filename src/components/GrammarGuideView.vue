<template>
  <div :class="ui.page">
    <h1 class="hidden">{{ guide.title }}</h1>

    <section :class="ui.hero">
      <div>
        <span :class="ui.levelBadge">{{ guide.level }}</span>
        <h2 :class="ui.heroTitle">{{ guide.title }}</h2>
        <p :class="ui.heroText">{{ guide.subtitle }}</p>

        <button
          v-if="guide.practice?.available"
          :class="ui.practiceButton"
          @click="$emit('set-mode', guide.practice.mode)"
        >
          {{ guide.practice.label }}
        </button>

        <div
          v-else-if="guide.practice"
          :class="ui.practiceNote"
        >
          {{ guide.practice.label }}
        </div>
      </div>

      <div :class="ui.icon">{{ guide.icon }}</div>
    </section>

    <section :class="ui.layout">
      <article :class="ui.main">
        <section
          v-for="section in guide.sections"
          :key="section.title"
          :class="ui.section"
        >
          <h3 :class="ui.sectionTitle">{{ section.title }}</h3>
          <p :class="ui.sectionBody">{{ section.body }}</p>

          <div v-if="section.formula" :class="ui.formula">
            {{ section.formula }}
          </div>

          <div v-if="section.table" class="mt-4 grid gap-2">
            <div :class="[ui.tableRow, ui.tableHead]">
              <span>Idő</span>
              <span>Képlet</span>
              <span>Példa</span>
            </div>

            <div
              v-for="row in section.table"
              :key="row.tense"
              :class="ui.tableRow"
            >
              <strong class="text-white">{{ row.tense }}</strong>
              <code class="whitespace-normal text-[#71ff99]">{{ row.form }}</code>
              <span>{{ row.example }}</span>
            </div>
          </div>

          <div v-if="section.examples" class="mt-4 grid gap-2.5">
            <div
              v-for="example in section.examples"
              :key="example.de"
              :class="ui.example"
            >
              <strong class="text-white">{{ example.de }}</strong>
              <span class="text-white/60">{{ example.hu }}</span>
            </div>
          </div>
        </section>
      </article>

      <aside :class="ui.side">
        <h3 :class="ui.sectionTitle">Gyors szabályok</h3>

        <ul class="m-0 grid list-none gap-3 p-0">
          <li v-for="rule in guide.quickRules" :key="rule" :class="ui.quickRule">
            {{ rule }}
          </li>
        </ul>

        <button
          v-if="guide.practice?.available"
          :class="ui.sidePracticeButton"
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

const GUIDE_UI = {
  page:
    "grammar-guide nemet-page-shell w-full !max-w-none overflow-visible !p-0 py-3 text-left text-white",
  panel:
    "min-w-0 max-w-full rounded-[28px] border border-white/10 bg-white/[0.055] shadow-[0_18px_42px_rgba(0,0,0,0.28)]",
  hero:
    "mb-6 flex items-center justify-between gap-6 rounded-[28px] border border-white/10 bg-white/[0.055] p-8 text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] max-[900px]:p-5",
  levelBadge:
    "mb-3.5 inline-flex rounded-full bg-[#3498db]/15 px-3 py-1.5 text-[0.78rem] font-black text-[#66c3ff]",
  heroTitle:
    "m-0 break-words text-[clamp(2.2rem,5vw,4rem)] font-black leading-none text-white",
  heroText:
    "mb-0 mt-3 text-[1.08rem] font-extrabold text-white/60",
  practiceButton:
    "mt-5 inline-flex items-center justify-center rounded-full border border-[#43e97b]/40 bg-[#43e97b]/15 px-5 py-3 text-base font-black text-white outline-none transition hover:-translate-y-px hover:bg-[#43e97b]/25 focus-visible:ring-4 focus-visible:ring-[#43e97b]/15",
  practiceNote:
    "mt-5 w-fit rounded-full border border-white/[0.08] bg-white/[0.055] px-4 py-2.5 text-sm font-black text-white/50",
  icon:
    "grid size-[92px] shrink-0 place-items-center rounded-[28px] bg-[linear-gradient(135deg,#667eea,#43e97b)] text-[2.35rem] shadow-[0_16px_36px_rgba(0,0,0,0.25)] max-[900px]:hidden",
  layout:
    "grid w-full min-w-0 max-w-full items-start gap-6 min-[901px]:grid-cols-[minmax(0,1fr)_300px]",
  main:
    "grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.055] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.28)] max-[900px]:p-5",
  section:
    "border-b border-white/[0.08] pb-5 last:border-b-0 last:pb-0",
  sectionTitle:
    "mb-3 mt-0 text-[1.35rem] font-black text-white",
  sectionBody:
    "m-0 text-base leading-[1.7] text-white/75",
  formula:
    "mt-3.5 rounded-2xl bg-[#667eea]/15 px-4 py-3.5 font-black text-white",
  tableRow:
    "grid items-center gap-3 rounded-[14px] bg-black/20 px-3.5 py-3 text-white/70 max-[900px]:grid-cols-1 max-[900px]:gap-1.5 min-[901px]:grid-cols-[130px_minmax(0,1fr)_minmax(0,1.2fr)]",
  tableHead:
    "bg-white/[0.08] text-[0.78rem] font-black uppercase text-white/50",
  example:
    "grid gap-1 rounded-2xl bg-black/20 p-3.5",
  side:
    "sticky top-[var(--desktop-content-top,102px)] self-start rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.28)] max-[900px]:static",
  quickRule:
    "rounded-[14px] bg-white/[0.055] px-3.5 py-3 text-white/80 font-extrabold leading-snug",
  sidePracticeButton:
    "mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#43e97b]/40 bg-[#43e97b]/15 px-4 py-3 text-base font-black text-white outline-none transition hover:-translate-y-px hover:bg-[#43e97b]/25 focus-visible:ring-4 focus-visible:ring-[#43e97b]/15",
};

export default {
  name: "GrammarGuideView",

  data() {
    return {
      ui: GUIDE_UI,
    };
  },

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
