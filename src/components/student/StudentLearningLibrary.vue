<template>
  <section :class="libraryUi.shell">
    <div class="dashboard-library-head">
      <span>Tanulási könyvtár</span>
      <h2>Gyakorlók és nyelvtani segédletek</h2>
      <p>
        Innen tudsz célzottan gyakorlót, challenge-et, storyt vagy nyelvtani
        segédletet választani.
      </p>
    </div>

    <section :class="libraryUi.section">
      <h2 :class="libraryUi.iconSectionTitle">Challenge</h2>

      <div :class="libraryUi.challengeIconGrid">
        <button
          v-for="item in challengeItems"
          :key="item.mode"
          type="button"
          :class="libraryUi.iconButton"
          @click="$emit('set-mode', item.mode)"
        >
          <span :class="[libraryUi.iconOnlyTile, item.iconClass]">{{ item.icon }}</span>
          <span :class="libraryUi.iconLabel">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section :class="libraryUi.section">
      <h2 :class="libraryUi.iconSectionTitle">Gyakorló feladatok</h2>

      <div :class="libraryUi.iconGrid">
        <button
          v-for="item in practiceItems"
          :key="item.mode"
          type="button"
          :class="libraryUi.iconButton"
          @click="$emit('set-mode', item.mode)"
        >
          <span :class="[libraryUi.iconOnlyTile, item.iconClass]">{{ item.icon }}</span>
          <span :class="libraryUi.iconLabel">{{ item.label }}</span>
        </button>
      </div>
    </section>

    <section :class="libraryUi.section">
      <div :class="libraryUi.sectionHeader">
        <span :class="libraryUi.sectionBadge">Segédletek</span>
        <h2 :class="libraryUi.sectionTitle">Nyelvtani segédletek</h2>
      </div>

      <section
        v-for="group in grammarGuideGroups"
        :key="group.level"
        :class="libraryUi.grammarLevel"
      >
        <div :class="libraryUi.levelHeader">
          <span :class="libraryUi.levelBadge">{{ group.level }}</span>
          <small :class="libraryUi.levelMeta">{{ group.description }}</small>
        </div>

        <div :class="libraryUi.grammarGrid">
          <article
            v-for="guide in group.guides"
            :key="guide.id"
            :class="libraryUi.grammarCard"
            @click="$emit('set-mode', guide.mode)"
          >
            <div :class="libraryUi.grammarIcon">{{ guide.icon }}</div>

            <div>
              <span :class="libraryUi.cardBadge">{{ guide.level }}</span>
              <strong :class="libraryUi.cardTitle">{{ guide.title }}</strong>
              <p :class="libraryUi.cardCopy">{{ guide.subtitle }}</p>

              <button
                v-if="guide.practice?.available"
                type="button"
                :class="libraryUi.availableChip"
                @click.stop="$emit('set-mode', guide.practice.mode)"
              >
                {{ guide.practice.label }}
              </button>

              <small
                v-else
                :class="libraryUi.plannedChip"
              >
                {{ guide.practice?.label || "Csak segédlet" }}
              </small>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section :class="libraryUi.section">
      <div :class="libraryUi.storyHeader">
        <div :class="libraryUi.sectionHeader">
          <span :class="libraryUi.sectionBadge">Olvasás</span>
          <h2 :class="libraryUi.sectionTitle">Legújabb storyk</h2>
        </div>

        <button
          type="button"
          :class="libraryUi.secondaryButton"
          @click="$emit('set-mode', 'story-reading')"
        >
          Összes story
        </button>
      </div>

      <div :class="libraryUi.storyGrid">
        <article
          v-for="story in latestStoryLessons"
          :key="story.id"
          :class="libraryUi.storyCard"
          @click="$emit('open-story', story.id)"
        >
          <div :class="libraryUi.storyMetaRow">
            <span :class="libraryUi.cardBadge">{{ story.level }}</span>
            <small :class="libraryUi.cardBadge">{{ story.sourceLabel }}</small>
          </div>

          <strong :class="libraryUi.cardTitle">{{ story.title }}</strong>
          <p :class="libraryUi.cardCopy">{{ story.subtitle }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
import { storyLessons } from "../../data/storyLessons";
import { grammarGuides } from "../../data/grammarGuides";

const LIBRARY_UI = {
  shell:
    "learning-library-view dashboard-learning-library nemet-page-shell nemet-page-shell--library",
  section: "mt-9",
  sectionHeader: "mb-5 flex flex-col items-start gap-2",
  sectionBadge:
    "inline-flex w-max max-w-full rounded-full bg-[#80caff]/15 px-3 py-2 text-xs font-black leading-none text-[#80caff]",
  sectionTitle: "m-0 text-3xl font-black leading-tight text-white sm:text-4xl",
  iconSectionTitle: "mb-7 text-3xl font-black leading-tight text-white sm:text-4xl",
  challengeIconGrid: "flex flex-wrap gap-x-9 gap-y-8",
  iconGrid: "flex flex-wrap gap-x-10 gap-y-9",
  iconButton:
    "group flex w-28 appearance-none flex-col items-center gap-3 border-0 bg-transparent p-0 text-center text-white outline-none transition hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#ffd56a]/15",
  iconOnlyTile:
    "flex size-[90px] items-center justify-center rounded-[30px] border border-white/15 text-3xl shadow-xl shadow-black/30 transition group-hover:shadow-[#ffd56a]/15",
  iconLabel:
    "block max-w-full text-sm font-black leading-tight text-white",
  grammarLevel: "mt-7 first:mt-0",
  levelHeader: "mb-4 flex flex-wrap items-baseline gap-3",
  levelBadge:
    "inline-flex rounded-full bg-[#3498db]/15 px-3 py-1.5 text-xs font-black leading-none text-[#66c3ff]",
  levelMeta: "text-sm font-semibold leading-relaxed text-white/55",
  grammarGrid:
    "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
  grammarCard:
    "grid min-h-[180px] w-full min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.055] p-5 text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-[#43e97b]/35 hover:bg-white/[0.075] sm:p-6",
  grammarIcon:
    "flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#667eea,#43e97b)] text-2xl shadow-lg shadow-black/25 sm:size-20 sm:text-3xl",
  cardBadge:
    "inline-flex w-max max-w-full rounded-full bg-[#3498db]/15 px-2.5 py-1.5 text-xs font-black leading-none text-[#66c3ff]",
  cardTitle: "mt-3 block text-xl font-black leading-tight text-white",
  cardCopy: "mt-3 text-sm font-semibold leading-relaxed text-white/60",
  availableChip:
    "mt-4 inline-flex rounded-full border border-[#43e97b]/35 bg-[#43e97b]/15 px-3 py-2 text-xs font-black leading-none text-[#71ff99] outline-none transition hover:bg-[#43e97b]/25 focus-visible:ring-4 focus-visible:ring-[#43e97b]/15",
  plannedChip:
    "mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black leading-none text-white/45",
  storyHeader:
    "mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end",
  secondaryButton:
    "inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.065] px-5 text-sm font-black text-white/80 outline-none transition hover:-translate-y-px hover:bg-white/10 hover:text-white focus-visible:ring-4 focus-visible:ring-white/10",
  storyGrid: "grid grid-cols-1 gap-4 lg:grid-cols-3",
  storyCard:
    "min-h-[210px] w-full min-w-0 cursor-pointer rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-[#667eea]/35 hover:bg-white/[0.075]",
  storyMetaRow: "mb-5 flex flex-wrap gap-2",
  iconWarm: "bg-[linear-gradient(135deg,#ff9966,#ff5e62)]",
  iconBlue: "bg-[linear-gradient(135deg,#36d1dc,#5b86e5)]",
  iconPink: "bg-[linear-gradient(135deg,#c471f5,#fa71cd)]",
  iconGreen: "bg-[linear-gradient(135deg,#43cea2,#185a9d)]",
  iconGold: "bg-[linear-gradient(135deg,#f7971e,#ffd200)]",
  iconPurple: "bg-[linear-gradient(135deg,#667eea,#764ba2)]",
  iconMint: "bg-[linear-gradient(135deg,#80caff,#43e97b)]",
  iconRose: "bg-[linear-gradient(135deg,#ffd166,#ef476f)]",
  iconStory: "bg-[linear-gradient(135deg,#11998e,#38ef7d)]",
  iconCloud:
    "bg-[linear-gradient(135deg,#8e9eab,#eef2f3)] text-[#172032]",
};

export default {
  name: "StudentLearningLibrary",

  emits: ["set-mode", "open-story"],

  data() {
    return {
      libraryUi: LIBRARY_UI,
      challengeItems: [
        {
          mode: "daily-challenge",
          label: "Passiv",
          meta: "Gyors átalakítós kör",
          icon: "🗞️",
          iconClass: LIBRARY_UI.iconMint,
        },
        {
          mode: "daily-challenge-adjektiv",
          label: "Adjektiv",
          meta: "Melléknévragozás röviden",
          icon: "🎨",
          iconClass: LIBRARY_UI.iconPink,
        },
        {
          mode: "daily-challenge-konjunktiv-ii",
          label: "Konj. II",
          meta: "Kívánságok és feltételek",
          icon: "💭",
          iconClass: LIBRARY_UI.iconCloud,
        },
      ],
      practiceItems: [
        {
          mode: "perfekt",
          label: "Perfekt",
          meta: "Múlt idejű alakok",
          icon: "🚀",
          iconClass: LIBRARY_UI.iconWarm,
        },
        {
          mode: "nomen-verb",
          label: "Nomen-Verb",
          meta: "Főnév-ige kapcsolatok",
          icon: "📚",
          iconClass: LIBRARY_UI.iconBlue,
        },
        {
          mode: "adjektiv",
          label: "Adjektiv",
          meta: "Melléknévragozás",
          icon: "🎨",
          iconClass: LIBRARY_UI.iconPink,
        },
        {
          mode: "osd",
          label: "ÖSD",
          meta: "Vizsgára hangolva",
          icon: "🇦🇹",
          iconClass: LIBRARY_UI.iconGreen,
        },
        {
          mode: "praeposition",
          label: "Präpositionen",
          meta: "Elöljárószók esetekkel",
          icon: "🔗",
          iconClass: LIBRARY_UI.iconGold,
        },
        {
          mode: "konnektoren",
          label: "Konnektoren",
          meta: "Kötőszók és szórend",
          icon: "🔀",
          iconClass: LIBRARY_UI.iconPurple,
        },
        {
          mode: "zu-infinitiv",
          label: "Zu + Inf.",
          meta: "Dass-ból infinitiv",
          icon: "✍️",
          iconClass: LIBRARY_UI.iconMint,
        },
        {
          mode: "plusquamperfekt",
          label: "Plusquamperf.",
          meta: "Előidejűség múltban",
          icon: "⏳",
          iconClass: LIBRARY_UI.iconRose,
        },
        {
          mode: "sich-verben",
          label: "Sich-Verben",
          meta: "Visszaható igék",
          icon: "🪞",
          iconClass: LIBRARY_UI.iconPink,
        },
        {
          mode: "passiv",
          label: "Passiv",
          meta: "Szenvedő szerkezet",
          icon: "🛠️",
          iconClass: LIBRARY_UI.iconMint,
        },
        {
          mode: "pronominaladverb",
          label: "Pronominaladv.",
          meta: "Da-, wo- és hier-alakok",
          icon: "🔎",
          iconClass: LIBRARY_UI.iconBlue,
        },
        {
          mode: "vocabulary",
          label: "Szókincs",
          meta: "Szókártyás ismétlés",
          icon: "🃏",
          iconClass: LIBRARY_UI.iconGold,
        },
        {
          mode: "story-reading",
          label: "Story-Lesen",
          meta: "Rövid olvasmányok",
          icon: "📰",
          iconClass: LIBRARY_UI.iconStory,
        },
      ],
    };
  },

  computed: {
    latestStoryLessons() {
      return storyLessons.slice(-3).reverse();
    },

    grammarGuideGroups() {
      const levelMeta = {
        A1: {
          order: 1,
          description: "Alapok",
        },
        A2: {
          order: 2,
          description: "Könnyebb alapozó anyagok",
        },
        "A2/B1": {
          order: 3,
          description: "Átmenet az alapoktól a középszintig",
        },
        B1: {
          order: 4,
          description: "Középszintű nyelvtan",
        },
        "B1/B2": {
          order: 5,
          description: "Haladóbb, vizsgaszintű témák",
        },
        B2: {
          order: 6,
          description: "Nehezebb, választékosabb szerkezetek",
        },
        C1: {
          order: 7,
          description: "Felsőfokú anyagok",
        },
      };

      const groups = grammarGuides.reduce((accumulator, guide) => {
        const level = guide.level || "Egyéb";

        if (!accumulator.has(level)) {
          accumulator.set(level, {
            level,
            description: levelMeta[level]?.description || "További nyelvtani témák",
            order: levelMeta[level]?.order || 99,
            guides: [],
          });
        }

        accumulator.get(level).guides.push(guide);
        return accumulator;
      }, new Map());

      return [...groups.values()].sort((a, b) => a.order - b.order);
    },
  },
};
</script>
