<template>
  <section class="learning-library-view dashboard-learning-library">
    <div class="dashboard-library-head">
      <span>Tanulási könyvtár</span>
      <h2>Gyakorlók és nyelvtani segédletek</h2>
      <p>
        Innen tudsz célzottan gyakorlót, challenge-et, storyt vagy nyelvtani
        segédletet választani.
      </p>
    </div>

    <section class="dashboard-challenge-section">
      <h2 class="section-title">Challenge</h2>

      <div class="lessons-ios-grid challenge-ios-grid">
        <div class="ios-app" @click="$emit('set-mode', 'daily-challenge')">
          <div class="ios-icon daily-challenge">🗞️</div>
          <span>Passiv</span>
        </div>

        <div class="ios-app" @click="$emit('set-mode', 'daily-challenge-adjektiv')">
          <div class="ios-icon challenge-adjektiv">🎨</div>
          <span>Adjektiv</span>
        </div>

        <div
          class="ios-app"
          @click="$emit('set-mode', 'daily-challenge-konjunktiv-ii')"
        >
          <div class="ios-icon challenge-konjunktiv">💭</div>
          <span>Konj. II</span>
        </div>
      </div>
    </section>

    <h2 class="section-title">Gyakorló feladatok</h2>

    <div class="lessons-ios-grid">
      <div class="ios-app" @click="$emit('set-mode', 'perfekt')">
        <div class="ios-icon perfekt">🚀</div>
        <span>Perfekt</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'nomen-verb')">
        <div class="ios-icon nomen">📚</div>
        <span>Nomen-Verb</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'adjektiv')">
        <div class="ios-icon adjektiv">🎨</div>
        <span>Adjektiv</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'osd')">
        <div class="ios-icon osd">🇦🇹</div>
        <span>ÖSD</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'praeposition')">
        <div class="ios-icon praeposition">🔗</div>
        <span>Präpositionen</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'konnektoren')">
        <div class="ios-icon konnektoren">🔀</div>
        <span>Konnektoren</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'sich-verben')">
        <div class="ios-icon sich">🪞</div>
        <span>Sich-Verben</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'passiv')">
        <div class="ios-icon passiv">🛠️</div>
        <span>Passiv</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'pronominaladverb')">
        <div class="ios-icon pronominaladverb">🔎</div>
        <span>Pronominaladv.</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'vocabulary')">
        <div class="ios-icon vocabulary">🃏</div>
        <span>Szókincs</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'mistake-review')">
        <div class="ios-icon mistake-review">🎯</div>
        <span>Hibatár</span>
      </div>

      <div class="ios-app" @click="$emit('set-mode', 'story-reading')">
        <div class="ios-icon story">📰</div>
        <span>Story-Lesen</span>
      </div>
    </div>

    <section class="dashboard-grammar-strip">
      <h2 class="section-title">Nyelvtani segédletek</h2>

      <section
        v-for="group in grammarGuideGroups"
        :key="group.level"
        class="dashboard-grammar-level"
      >
        <div class="dashboard-grammar-level-head">
          <span>{{ group.level }}</span>
          <small>{{ group.description }}</small>
        </div>

        <div class="dashboard-grammar-grid">
          <article
            v-for="guide in group.guides"
            :key="guide.id"
            class="dashboard-grammar-card"
            @click="$emit('set-mode', guide.mode)"
          >
            <div class="grammar-card-icon">{{ guide.icon }}</div>

            <div>
              <span>{{ guide.level }}</span>
              <strong>{{ guide.title }}</strong>
              <p>{{ guide.subtitle }}</p>

              <button
                v-if="guide.practice?.available"
                class="grammar-practice-chip is-available"
                @click.stop="$emit('set-mode', guide.practice.mode)"
              >
                {{ guide.practice.label }}
              </button>

              <small
                v-else
                class="grammar-practice-chip is-planned"
              >
                {{ guide.practice?.label || "Csak segédlet" }}
              </small>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="dashboard-story-strip">
      <div class="dashboard-story-heading">
        <h2 class="section-title">Legújabb storyk</h2>

        <button @click="$emit('set-mode', 'story-reading')">
          Összes story
        </button>
      </div>

      <div class="dashboard-story-grid">
        <article
          v-for="story in latestStoryLessons"
          :key="story.id"
          class="dashboard-story-card"
          @click="$emit('open-story', story.id)"
        >
          <div>
            <span>{{ story.level }}</span>
            <small>{{ story.sourceLabel }}</small>
          </div>

          <strong>{{ story.title }}</strong>
          <p>{{ story.subtitle }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
import { storyLessons } from "../../data/storyLessons";
import { grammarGuides } from "../../data/grammarGuides";

export default {
  name: "StudentLearningLibrary",

  emits: ["set-mode", "open-story"],

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
