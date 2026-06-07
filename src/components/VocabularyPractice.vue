<template>
  <div
    class="practice-container vocabulary-practice"
    :class="{
      'is-learn-mode': selectedMode === 'learn',
      'is-test-mode': selectedMode === 'test',
    }"
  >
    <h1>Szókincs edző</h1>

    <section
      v-if="!selectedTopic"
      class="vocab-pack-library"
    >
      <div class="vocab-library-head">
        <span>Szócsomagok</span>
        <p>Válassz témát, utána jöhet a szókártya vagy a névelős teszt.</p>
      </div>

      <section
        v-for="group in vocabularyPackGroups"
        :key="group.id"
        class="vocab-pack-group"
      >
        <div class="vocab-pack-group-head">
          <strong>{{ group.title }}</strong>
          <small>{{ group.description }}</small>
        </div>

        <div class="vocab-pack-picker">
          <button
            v-for="pack in group.packs"
            :key="pack.topic"
            class="vocab-pack-card"
            @click="selectTopic(pack.topic)"
          >
            <span>{{ pack.icon }}</span>

            <div class="vocab-pack-copy">
              <em>{{ pack.orderLabel }}</em>
              <strong>{{ pack.title }}</strong>
              <small>{{ pack.description }}</small>
            </div>

            <div class="vocab-pack-meta">
              <em>{{ pack.count }} szó</em>
              <em>{{ pack.levels }}</em>
            </div>
          </button>
        </div>
      </section>
    </section>

    <section
      v-else-if="!selectedMode"
      class="vocab-mode-stage"
    >
      <button
        class="vocab-back-link"
        @click="resetTopic"
      >
        ← Másik szócsomag
      </button>

      <div class="vocab-selected-pack">
        <span>{{ selectedPackMeta.icon }}</span>
        <div>
          <strong>{{ selectedPackMeta.title }}</strong>
          <small>{{ selectedPackMeta.count }} szó · {{ selectedPackMeta.levels }}</small>
        </div>
      </div>

      <div class="vocab-mode-picker">
      <button
        v-for="mode in practiceModes"
        :key="mode.id"
        class="vocab-mode-card"
        @click="selectMode(mode.id)"
      >
        <span>{{ mode.icon }}</span>
        <strong>{{ mode.title }}</strong>
        <small>{{ mode.description }}</small>
      </button>
      </div>
    </section>

    <PracticeLayout
      v-else
      :progress="progressPercent"
      :current="currentIndex"
      :total="questionsPerRound"
    >
      <template
        v-if="selectedMode === 'test'"
        #xp
      >
        <div class="xp-card">
          <div class="xp-top">
            <div class="xp-mini-card">
              <span>🔥</span>
              <div>
                <strong>{{ xpProfile.streak_days }}</strong>
                <small>napos széria</small>
              </div>
            </div>

            <div class="xp-mini-card">
              <span>⭐</span>
              <div>
                <strong>{{ xpProfile.xp }}</strong>
                <small>XP</small>
              </div>
            </div>
          </div>

          <div class="level-area">
            <div class="level-badge">Level {{ xpProfile.level }}</div>

            <div class="xp-progress-info">
              <span>{{ xpIntoCurrentLevel }}/100 XP</span>
              <span>Következő szint</span>
            </div>

            <div class="xp-progress">
              <div
                class="xp-progress-fill"
                :style="{ width: xpProgressPercent + '%' }"
              ></div>
            </div>

            <p class="xp-hint">+5 XP tesztben minden helyes válaszért</p>
          </div>
        </div>
      </template>

      <div v-if="currentItem && !showStatistics" class="quiz-area">
        <div v-if="selectedMode === 'learn'" class="vocab-learn-topic">
          <span>Téma</span>
          <strong>{{ selectedPackMeta.title }}</strong>
          <small>{{ selectedPackMeta.count }} szó · {{ selectedPackMeta.levels }}</small>
        </div>

        <section
          v-if="selectedMode === 'learn'"
          class="vocab-card"
          :class="[
            { flipped: isRevealed, 'is-draggable': true, 'is-dragging': isDraggingCard },
            swipeDecisionClass,
          ]"
          :style="learnCardStyle"
          tabindex="0"
          @pointerdown="startCardSwipe"
          @pointermove="moveCardSwipe"
          @pointerup="endCardSwipe"
          @pointercancel="cancelCardSwipe"
          @keydown.left.prevent="handleSwipeChoice(false)"
          @keydown.right.prevent="handleSwipeChoice(true)"
        >
          <div class="vocab-swipe-badge is-left">
            Nem tudom
          </div>

          <div class="vocab-swipe-badge is-right">
            Tudom
          </div>

          <span class="vocab-topic">{{ currentItem.topic }} · {{ currentItem.level }}</span>

          <div class="vocab-word">
            <small v-if="isRevealed && currentItem.article">
              {{ currentItem.article }}
            </small>
            <strong>{{ isRevealed ? currentItem.de : currentItem.hu }}</strong>
          </div>

          <p v-if="isRevealed && currentItem.plural" class="vocab-plural">
            Többes szám: {{ currentItem.plural }}
          </p>

          <p v-if="isRevealed && currentItem.pattern" class="vocab-plural">
            Szerkezet: {{ currentItem.pattern }}
          </p>

          <div v-if="isRevealed" class="vocab-example">
            <strong>{{ currentItem.example }}</strong>
            <span>{{ currentItem.exampleHu }}</span>
          </div>

          <p class="vocab-swipe-hint">
            Húzd jobbra, ha tudod, balra, ha még nem.
          </p>

          <button
            v-if="!isRevealed"
            class="pill-button btn-blue"
            @click="isRevealed = true"
          >
            Fordítás mutatása
          </button>
        </section>

        <div
          v-if="selectedMode === 'learn'"
          class="vocab-swipe-actions"
        >
          <button
            type="button"
            class="vocab-swipe-action is-unknown"
            aria-label="Nem tudom"
            title="Nem tudom"
            @click="handleSwipeChoice(false)"
          >
            ×
          </button>

          <button
            type="button"
            class="vocab-swipe-action is-known"
            aria-label="Tudom"
            title="Tudom"
            @click="handleSwipeChoice(true)"
          >
            ♥
          </button>
        </div>

        <section
          v-if="selectedMode !== 'learn'"
          class="vocab-card vocab-test-card"
          :class="{
            'is-correct': isAnswered && isCorrect,
            'is-wrong': isAnswered && isCorrect === false,
          }"
        >
          <span class="vocab-topic">{{ currentItem.topic }} · {{ currentItem.level }}</span>

          <transition name="fade">
            <div
              v-if="isAnswered"
              :class="[
                'feedback-box',
                'vocab-test-feedback',
                isCorrect ? 'fb-correct' : 'fb-wrong',
              ]"
            >
              <p
                v-if="!isCorrect"
                class="wrong-highlight"
              >
                Helyes válasz:
                <span>{{ fullAnswer }}</span>
              </p>

              <p class="feedback-text">
                {{ feedbackText }}
              </p>

              <div class="example-box">
                <p>{{ currentItem.example }}</p>
                <p>{{ currentItem.exampleHu }}</p>
              </div>
            </div>
          </transition>

          <p class="vocab-test-label">{{ testPromptLabel }}</p>
          <h2>{{ currentItem.hu }}</h2>

          <div class="input-wrapper ui-unit vocab-answer-wrap">
            <input
              ref="answerInput"
              v-model="userAnswer"
              type="text"
              class="pill-input"
              :placeholder="answerPlaceholder"
              :disabled="isAnswered"
              :class="{
                'input-correct': isAnswered && isCorrect,
                'input-wrong': isAnswered && isCorrect === false,
              }"
              @keyup.enter="handleTestEnter"
            />
          </div>

          <div class="button-group ui-unit vocab-test-actions">
            <button
              v-if="!isAnswered"
              class="pill-button btn-green"
              :disabled="!userAnswer.trim()"
              @click="checkTestAnswer"
            >
              Ellenőrzés
            </button>

            <button
              v-else
              class="pill-button btn-blue"
              @click="nextItem"
            >
              Következő
            </button>
          </div>
        </section>
      </div>
    </PracticeLayout>

    <div
      v-if="showStatistics"
      class="ui-overlay"
    >
      <div class="ui-modal">
        <h2>Kör vége</h2>

        <p v-if="selectedMode === 'learn'">
          Tudott szavak:
          <span class="correct-text">{{ knownCount }}/{{ questionsPerRound }}</span>
        </p>

        <p v-else>
          Eredmény:
          <span class="correct-text">{{ correctAnswersInRound }}/{{ questionsPerRound }}</span>
        </p>

        <button
          class="pill-button btn-green"
          @click="startNextAction"
        >
          {{
            weakItems.length
              ? "Gyenge szavak újragyakorlása"
              : "Új kör indítása"
          }}
        </button>

        <button
          class="pill-button btn-blue"
          @click="$emit('go-dashboard')"
        >
          Vissza a főmenübe
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PracticeLayout from "./PracticeLayout.vue";
import { vocabularyItems } from "../data/vocabulary";
import { saveExerciseResult } from "../services/exerciseResultService";
import { recordMistake } from "../services/mistakeBankService";
import { supabase } from "../supabase";

export default {
  name: "VocabularyPractice",

  components: {
    PracticeLayout,
  },

  emits: ["exercise-finished", "go-dashboard"],

  data() {
    return {
      selectedMode: null,
      selectedTopic: null,
      allItems: vocabularyItems,
      currentRoundItems: [],
      unansweredItems: [],
      weakItems: [],
      currentItem: null,
      userAnswer: "",
      isRevealed: false,
      isAnswered: false,
      isCorrect: null,
      feedbackText: "",
      isDraggingCard: false,
      swipeStartX: 0,
      swipeStartY: 0,
      swipeDeltaX: 0,
      swipeDeltaY: 0,
      swipePointerId: null,
      swipeThreshold: 110,
      showStatistics: false,
      currentIndex: 0,
      questionsPerRound: 10,
      defaultQuestionsPerRound: 10,
      knownCount: 0,
      correctAnswersInRound: 0,
      incorrectAnswersInRound: 0,
      xpProfile: {
        xp: 0,
        level: 1,
        streak_days: 0,
        today_xp: 0,
      },
      xpPerLevel: 100,
      practiceModes: [
        {
          id: "learn",
          icon: "🃏",
          title: "Szókártyák",
          description: "Gyors önellenőrzés: tudom vagy nem tudom.",
        },
        {
          id: "test",
          icon: "✍️",
          title: "Teszt",
          description: "Magyar jelentésből német szó névelővel.",
        },
      ],
    };
  },

  computed: {
    vocabularyPacks() {
      const packMeta = {
        Arbeit: {
          title: "Arbeit & Bewerbung",
          icon: "💼",
          description: "Munka, jelentkezés, interjú és szakmai szókincs.",
          group: "career",
          order: 1,
        },
        Brief: {
          title: "Brief schreiben",
          icon: "✉️",
          description: "Hasznos szavak hivatalos és félhivatalos levelekhez.",
          group: "exam",
          order: 2,
        },
        Prüfung: {
          title: "Prüfung",
          icon: "🎓",
          description: "Vizsga, tanulás és nyelvtanulási helyzetek.",
          group: "exam",
          order: 3,
        },
        Meinung: {
          title: "Meinung & Argumentation",
          icon: "💬",
          description: "Érveléshez és véleménykifejtéshez hasznos szavak.",
          group: "exam",
          order: 4,
        },
        Alltag: {
          title: "Alltag",
          icon: "🏙️",
          description: "Mindennapi helyzetekben gyakori, jól használható szavak.",
          group: "daily",
          order: 5,
        },
        Gesundheit: {
          title: "Gesundheit",
          icon: "🩺",
          description: "Orvos, betegség, panaszok és egészségügyi helyzetek.",
          group: "daily",
          order: 6,
        },
        Fitnessstudio: {
          title: "Fitnessstudio",
          icon: "🏋️",
          description: "Konditermi helyek, gépek, gyakorlatok és edzésfogalmak.",
          group: "daily",
          order: 7,
        },
        Reisen: {
          title: "Reisen & Verkehr",
          icon: "🧳",
          description: "Utazás, közlekedés, szállás és útvonalak.",
          group: "daily",
          order: 8,
        },
        Wohnen: {
          title: "Wohnen",
          icon: "🏠",
          description: "Lakás, bérlés, költözés és otthoni ügyek.",
          group: "daily",
          order: 9,
        },
        Umwelt: {
          title: "Umwelt",
          icon: "🌱",
          description: "Környezet, energia, hulladék és fenntarthatóság.",
          group: "public",
          order: 10,
        },
        Bildung: {
          title: "Bildung",
          icon: "📘",
          description: "Tanulás, iskola, képzés és továbbtanulás.",
          group: "career",
          order: 11,
        },
        Behörden: {
          title: "Behörden & Alltag",
          icon: "🏛️",
          description: "Hivatalos ügyek, dokumentumok és ügyintézés.",
          group: "public",
          order: 12,
        },
        Verbverbindungen: {
          title: "Verbverbindungen",
          icon: "🔗",
          description: "Gyakori igei szerkezetek, vonzatok és kollokációk.",
          group: "patterns",
          order: 13,
        },
      };

      const packs = this.allItems.reduce((accumulator, item) => {
        const topic = item.topic || "Alltag";

        if (!accumulator.has(topic)) {
          const meta = packMeta[topic] || {
            title: topic,
            icon: "🃏",
            description: "Vegyes szókincs gyakorláshoz.",
            group: "other",
            order: 99,
          };

          accumulator.set(topic, {
            topic,
            ...meta,
            items: [],
          });
        }

        accumulator.get(topic).items.push(item);
        return accumulator;
      }, new Map());

      return [...packs.values()]
        .map((pack) => ({
          ...pack,
          count: pack.items.length,
          levels: [...new Set(pack.items.map((item) => item.level))].join("/"),
          orderLabel: String(pack.order).padStart(2, "0"),
        }))
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    },

    vocabularyPackGroups() {
      const groupMeta = [
        {
          id: "exam",
          title: "Vizsga és írás",
          description: "Levélírás, érvelés, vizsgaszituációk.",
        },
        {
          id: "daily",
          title: "Mindennapi élet",
          description: "Utazás, egészség, lakhatás és hétköznapi ügyek.",
        },
        {
          id: "career",
          title: "Munka és tanulás",
          description: "Állás, képzés, szakmai és iskolai helyzetek.",
        },
        {
          id: "public",
          title: "Közélet és ügyintézés",
          description: "Hivatalok, környezet, dokumentumok és társadalmi témák.",
        },
        {
          id: "patterns",
          title: "Szerkezetek és kifejezések",
          description: "Nem külön szavak, hanem használható nyelvi panelek.",
        },
        {
          id: "other",
          title: "Egyéb",
          description: "További szókincs csomagok.",
        },
      ];

      return groupMeta
        .map((group) => ({
          ...group,
          packs: this.vocabularyPacks.filter((pack) => pack.group === group.id),
        }))
        .filter((group) => group.packs.length);
    },

    selectedPackMeta() {
      return (
        this.vocabularyPacks.find((pack) => pack.topic === this.selectedTopic) ||
        this.vocabularyPacks[0] || {
          topic: "",
          title: "Szócsomag",
          icon: "🃏",
          count: 0,
          levels: "B1",
        }
      );
    },

    selectedTopicItems() {
      if (!this.selectedTopic) return this.allItems;

      return this.allItems.filter((item) => item.topic === this.selectedTopic);
    },

    progressPercent() {
      if (!this.questionsPerRound) return 0;

      return Math.round((this.currentIndex / this.questionsPerRound) * 100);
    },

    xpIntoCurrentLevel() {
      return this.xpProfile.xp % this.xpPerLevel;
    },

    xpProgressPercent() {
      return Math.min((this.xpIntoCurrentLevel / this.xpPerLevel) * 100, 100);
    },

    fullAnswer() {
      if (!this.currentItem) return "";

      if (this.currentItem.type === "phrase") {
        return this.currentItem.de;
      }

      return `${this.currentItem.article} ${this.currentItem.de}`;
    },

    testPromptLabel() {
      if (this.currentItem?.type === "phrase") {
        return "Írd be németül a teljes kifejezést:";
      }

      return "Írd be németül névelővel:";
    },

    answerPlaceholder() {
      if (this.currentItem?.type === "phrase") {
        return "pl. eine Entscheidung treffen";
      }

      return "pl. die Entscheidung";
    },

    learnCardStyle() {
      if (this.selectedMode !== "learn") return {};

      const rotation = Math.max(Math.min(this.swipeDeltaX / 18, 10), -10);

      return {
        transform: `translate3d(${this.swipeDeltaX}px, ${this.swipeDeltaY}px, 0) rotate(${rotation}deg)`,
      };
    },

    swipeDecisionClass() {
      if (this.selectedMode !== "learn") return "";

      if (this.swipeDeltaX > this.swipeThreshold * 0.55) {
        return "swiping-known";
      }

      if (this.swipeDeltaX < -this.swipeThreshold * 0.55) {
        return "swiping-unknown";
      }

      return "";
    },
  },

  created() {
    this.loadXpProfile();
  },

  methods: {
    selectTopic(topic) {
      this.selectedTopic = topic;
      this.selectedMode = null;
      this.resetPageScroll();
    },

    resetTopic() {
      this.selectedTopic = null;
      this.selectedMode = null;
      this.currentItem = null;
      this.showStatistics = false;
      this.resetPageScroll();
    },

    selectMode(mode) {
      this.selectedMode = mode;
      this.pickNewSet(this.selectedTopicItems);
      this.resetPageScroll();
    },

    resetPageScroll() {
      this.$nextTick(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    },

    shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    },

    pickNewSet(sourceItems = this.allItems) {
      this.questionsPerRound = Math.min(
        this.defaultQuestionsPerRound,
        sourceItems.length,
      );

      this.currentRoundItems = this.shuffle(sourceItems).slice(
        0,
        this.questionsPerRound,
      );

      this.startRound();
    },

    startRound() {
      this.unansweredItems = this.shuffle(this.currentRoundItems);
      this.weakItems = [];
      this.knownCount = 0;
      this.correctAnswersInRound = 0;
      this.incorrectAnswersInRound = 0;
      this.currentIndex = 0;
      this.showStatistics = false;

      this.setNextItem();
    },

    setNextItem() {
      if (!this.unansweredItems.length) {
        this.currentItem = null;
        this.showStatistics = true;
        this.saveResults();
        return;
      }

      this.currentItem = this.unansweredItems.pop();
      this.currentIndex += 1;
      this.userAnswer = "";
      this.isRevealed = false;
      this.isAnswered = false;
      this.isCorrect = null;
      this.feedbackText = "";
      this.resetSwipeState();

      if (this.selectedMode === "test") {
        this.$nextTick(() => {
          this.$refs.answerInput?.focus();
        });
      }
    },

    markCard(isKnown) {
      if (isKnown) {
        this.knownCount += 1;
      } else {
        this.weakItems.push(this.currentItem);
      }

      this.nextItem();
    },

    startCardSwipe(event) {
      if (this.selectedMode !== "learn") return;
      if (event.target.closest("button")) return;

      this.isDraggingCard = true;
      this.swipePointerId = event.pointerId;
      this.swipeStartX = event.clientX;
      this.swipeStartY = event.clientY;
      this.swipeDeltaX = 0;
      this.swipeDeltaY = 0;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },

    moveCardSwipe(event) {
      if (!this.isDraggingCard || event.pointerId !== this.swipePointerId) return;

      this.swipeDeltaX = event.clientX - this.swipeStartX;
      this.swipeDeltaY = event.clientY - this.swipeStartY;
    },

    endCardSwipe(event) {
      if (!this.isDraggingCard || event.pointerId !== this.swipePointerId) return;

      const decision = Math.abs(this.swipeDeltaX) >= this.swipeThreshold;

      if (decision) {
        this.handleSwipeChoice(this.swipeDeltaX > 0);
        return;
      }

      this.cancelCardSwipe();
    },

    cancelCardSwipe() {
      this.resetSwipeState();
    },

    resetSwipeState() {
      this.isDraggingCard = false;
      this.swipeStartX = 0;
      this.swipeStartY = 0;
      this.swipeDeltaX = 0;
      this.swipeDeltaY = 0;
      this.swipePointerId = null;
    },

    handleSwipeChoice(isKnown) {
      if (this.selectedMode !== "learn") return;

      this.markCard(isKnown);
    },

    normalizeAnswer(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[.!?]/g, "")
        .replace(/\s+/g, " ");
    },

    splitArticleAndNoun(value) {
      const normalized = this.normalizeAnswer(value);
      const parts = normalized.split(" ").filter(Boolean);
      const [firstPart, ...rest] = parts;

      if (!["der", "die", "das"].includes(firstPart)) {
        return {
          article: "",
          noun: parts.join(" "),
        };
      }

      return {
        article: firstPart,
        noun: rest.join(" "),
      };
    },

    normalizeGermanSpelling(value) {
      return this.normalizeAnswer(value)
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss");
    },

    checkTestAnswer() {
      if (this.isAnswered || !this.currentItem) return;

      if (this.currentItem.type === "phrase") {
        const userAnswer = this.normalizeGermanSpelling(this.userAnswer);
        const expectedAnswer = this.normalizeGermanSpelling(this.currentItem.de);

        this.isAnswered = true;
        this.isCorrect = userAnswer === expectedAnswer;

        if (this.isCorrect) {
          this.feedbackText = "Richtig! ✓";
          this.correctAnswersInRound += 1;
          this.addXp(5);
          return;
        }

        this.feedbackText = "Falsch! ✗";
        this.incorrectAnswersInRound += 1;
        this.weakItems.push(this.currentItem);
        this.recordVocabularyMistake();
        return;
      }

      const user = this.splitArticleAndNoun(this.userAnswer);
      const expectedArticle = this.currentItem.article.toLowerCase();
      const expectedNoun = this.normalizeGermanSpelling(this.currentItem.de);

      const articleCorrect = user.article === expectedArticle;
      const nounCorrect = this.normalizeGermanSpelling(user.noun) === expectedNoun;

      this.isAnswered = true;
      this.isCorrect = articleCorrect && nounCorrect;

      if (this.isCorrect) {
        this.feedbackText = "Richtig! ✓";
        this.correctAnswersInRound += 1;
        this.addXp(5);
        return;
      }

      if (nounCorrect && !articleCorrect) {
        this.feedbackText = `A szó jó, a névelő: ${this.currentItem.article}.`;
      } else if (articleCorrect && !nounCorrect) {
        this.feedbackText = "A névelő jó, a főnév még nem.";
      } else {
        this.feedbackText = "Falsch! ✗";
      }

      this.incorrectAnswersInRound += 1;
      this.weakItems.push(this.currentItem);
      this.recordVocabularyMistake();
    },

    recordVocabularyMistake() {
      if (!this.currentItem || this.selectedMode !== "test") return;

      recordMistake({
        type: "vocabulary",
        label: "Szókincs",
        sourceId: this.currentItem.id,
        prompt: this.currentItem.hu,
        correctAnswer: this.fullAnswer,
        userAnswer: this.userAnswer,
        explanation: this.currentItem.exampleHu || this.currentItem.example || "",
        level: this.currentItem.level,
        meta: {
          article: this.currentItem.article || "",
          de: this.currentItem.de,
          topic: this.currentItem.topic,
          isPhrase: this.currentItem.type === "phrase",
        },
      });
    },

    handleTestEnter() {
      if (!this.isAnswered && this.userAnswer.trim()) {
        this.checkTestAnswer();
        return;
      }

      if (this.isAnswered) {
        this.nextItem();
      }
    },

    nextItem() {
      this.setNextItem();
    },

    startNextAction() {
      if (this.weakItems.length) {
        this.currentRoundItems = this.shuffle(this.weakItems);
        this.questionsPerRound = this.currentRoundItems.length;
        this.startRound();
        return;
      }

      this.pickNewSet(this.selectedTopicItems);
    },

    async saveResults() {
      try {
        if (this.selectedMode === "learn") {
          await saveExerciseResult(
            "vocabulary-learn",
            this.questionsPerRound,
            this.questionsPerRound,
          );
        } else {
          await saveExerciseResult(
            "vocabulary-test",
            this.correctAnswersInRound,
            this.questionsPerRound,
          );
        }

        this.$emit("exercise-finished");
      } catch (error) {
        console.error("Szókincs eredmény mentési hiba:", error.message);
      }
    },

    async loadXpProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("xp,level,streak_days,today_xp")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("XP betöltési hiba:", error.message);
          return;
        }

        if (data) {
          this.xpProfile = {
            xp: data.xp || 0,
            level: data.level || 1,
            streak_days: data.streak_days || 0,
            today_xp: data.today_xp || 0,
          };
        }
      } catch (error) {
        console.error("XP betöltési váratlan hiba:", error.message);
      }
    },

    async addXp(amount = 5) {
      const oldXp = this.xpProfile.xp || 0;
      const oldTodayXp = this.xpProfile.today_xp || 0;

      const newXp = oldXp + amount;
      const newTodayXp = oldTodayXp + amount;
      const newLevel = Math.floor(newXp / this.xpPerLevel) + 1;

      this.xpProfile.xp = newXp;
      this.xpProfile.today_xp = newTodayXp;
      this.xpProfile.level = newLevel;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) return;

        const { error } = await supabase
          .from("profiles")
          .update({
            xp: newXp,
            level: newLevel,
            today_xp: newTodayXp,
            last_activity: new Date().toISOString(),
          })
          .eq("id", session.user.id);

        if (error) {
          console.error("XP mentési hiba:", error.message);
        }
      } catch (error) {
        console.error("XP hiba:", error.message);
      }
    },
  },
};
</script>

<style scoped>
.vocabulary-practice {
  max-width: 760px;
}

.vocab-pack-library {
  width: min(980px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.vocab-library-head {
  display: grid;
  gap: 8px;
  text-align: left;
}

.vocab-library-head span {
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(247, 151, 30, 0.14);
  color: #ffd56a;
  font-size: 0.8rem;
  font-weight: 950;
}

.vocab-library-head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 1rem;
  font-weight: 850;
}

.vocab-pack-group {
  display: grid;
  gap: 12px;
}

.vocab-pack-group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.vocab-pack-group-head strong {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 950;
}

.vocab-pack-group-head small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.86rem;
  font-weight: 850;
  text-align: right;
}

.vocab-pack-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.vocab-pack-card {
  min-height: 150px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 14px;
  background:
    linear-gradient(135deg, rgba(247, 151, 30, 0.1), transparent 46%),
    rgba(255, 255, 255, 0.055);
  color: #ffffff;
  font: inherit;
  text-align: left;
  box-shadow: 0 15px 34px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.vocab-pack-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 213, 106, 0.38);
  background:
    linear-gradient(135deg, rgba(247, 151, 30, 0.16), transparent 46%),
    rgba(255, 255, 255, 0.075);
}

.vocab-pack-card > span {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f7971e, #ffd200);
  font-size: 1.55rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
}

.vocab-mode-card span {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f7971e, #ffd200);
  font-size: 2rem;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
}

.vocab-mode-card strong {
  font-size: 1.45rem;
  font-weight: 950;
  line-height: 1.08;
}

.vocab-mode-card small {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.4;
}

.vocab-pack-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.vocab-pack-copy > em {
  width: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.68rem;
  font-style: normal;
  font-weight: 950;
}

.vocab-pack-copy strong {
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 950;
  line-height: 1.12;
}

.vocab-pack-copy small {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.35;
}

.vocab-pack-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  grid-column: 2;
  margin-top: 2px;
}

.vocab-pack-meta em {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.14);
  color: #8fe6ff;
  font-size: 0.76rem;
  font-style: normal;
  font-weight: 950;
}

.vocab-mode-stage {
  width: min(760px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.vocab-back-link {
  width: fit-content;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  color: rgba(255, 255, 255, 0.72);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 900;
  cursor: pointer;
}

.vocab-selected-pack {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
}

.vocab-selected-pack > span {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f7971e, #ffd200);
  font-size: 1.6rem;
}

.vocab-selected-pack strong {
  display: block;
  font-size: 1.25rem;
  font-weight: 950;
}

.vocab-selected-pack small {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 850;
}

.vocab-mode-picker {
  width: min(760px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.vocab-mode-card {
  min-height: 240px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 28px;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 14px;
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
  font: inherit;
  text-align: left;
  box-shadow: 0 15px 34px rgba(0, 0, 0, 0.22);
  cursor: pointer;
}

.vocabulary-practice :deep(.practice-box),
.vocabulary-practice :deep(.quiz-area) {
  gap: 16px;
}

.vocabulary-practice :deep(.practice-box) {
  padding-top: 20px;
}

.vocabulary-practice :deep(.progress-container) {
  margin-bottom: 2px;
}

.vocab-card {
  width: 100%;
  max-width: 640px;
  min-height: 330px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 30px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 16px;
  background:
    linear-gradient(135deg, rgba(247, 151, 30, 0.12), transparent 44%),
    rgba(0, 0, 0, 0.18);
  text-align: center;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
}

.vocab-card.is-draggable {
  position: relative;
  cursor: grab;
  touch-action: none;
  user-select: none;
  will-change: transform;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.vocab-card.is-dragging {
  cursor: grabbing;
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
}

.vocab-card.swiping-known {
  border-color: rgba(67, 233, 123, 0.48);
  background:
    linear-gradient(135deg, rgba(67, 233, 123, 0.16), transparent 48%),
    rgba(0, 0, 0, 0.18);
  box-shadow: 0 22px 48px rgba(67, 233, 123, 0.13);
}

.vocab-card.swiping-unknown {
  border-color: rgba(255, 71, 87, 0.48);
  background:
    linear-gradient(135deg, rgba(255, 71, 87, 0.16), transparent 48%),
    rgba(0, 0, 0, 0.18);
  box-shadow: 0 22px 48px rgba(255, 71, 87, 0.13);
}

.vocab-test-card.is-wrong {
  border-color: rgba(255, 82, 82, 0.76);
  background:
    linear-gradient(135deg, rgba(255, 82, 82, 0.16), transparent 45%),
    rgba(0, 0, 0, 0.2);
  box-shadow:
    0 20px 48px rgba(255, 82, 82, 0.14),
    inset 0 0 0 1px rgba(255, 82, 82, 0.18);
}

.vocab-test-card.is-correct {
  border-color: rgba(67, 233, 123, 0.68);
  background:
    linear-gradient(135deg, rgba(67, 233, 123, 0.13), transparent 46%),
    rgba(0, 0, 0, 0.2);
  box-shadow:
    0 20px 48px rgba(67, 233, 123, 0.12),
    inset 0 0 0 1px rgba(67, 233, 123, 0.12);
}

.vocab-swipe-badge {
  position: absolute;
  top: 22px;
  z-index: 2;
  padding: 8px 12px;
  border: 2px solid currentColor;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 950;
  letter-spacing: 0;
  opacity: 0;
  transform: rotate(-8deg) scale(0.92);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  pointer-events: none;
}

.vocab-swipe-badge.is-left {
  left: 22px;
  color: #ff8b97;
  transform: rotate(-8deg) scale(0.92);
}

.vocab-swipe-badge.is-right {
  right: 22px;
  color: #8cffb6;
  transform: rotate(8deg) scale(0.92);
}

.vocab-card.swiping-unknown .vocab-swipe-badge.is-left,
.vocab-card.swiping-known .vocab-swipe-badge.is-right {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.vocab-swipe-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.88rem;
  font-weight: 850;
}

.vocab-swipe-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 42px;
  width: 100%;
  max-width: 640px;
  margin-top: -2px;
}

.vocab-swipe-action {
  width: 68px;
  height: 68px;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: #ffffff;
  font: inherit;
  font-size: 2.15rem;
  font-weight: 950;
  line-height: 1;
  cursor: pointer;
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.vocab-swipe-action:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow:
    0 22px 44px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.vocab-swipe-action:active {
  transform: translateY(0) scale(0.94);
}

.vocab-swipe-action.is-unknown {
  color: #ff6f7f;
  background:
    radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.95), rgba(255, 226, 230, 0.9));
}

.vocab-swipe-action.is-known {
  color: #2ecc71;
  background:
    radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.98), rgba(213, 255, 235, 0.92));
}

.vocab-learn-topic {
  display: none;
}

.vocab-topic {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.16);
  color: #8fe6ff;
  font-size: 0.78rem;
  font-weight: 950;
}

.vocab-word {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  color: #ffffff;
}

.vocab-word small {
  color: #ffd56a;
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  font-weight: 950;
}

.vocab-word strong,
.vocab-test-card h2 {
  color: #ffffff;
  font-size: clamp(2.3rem, 7vw, 4rem);
  font-weight: 950;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.vocab-plural,
.vocab-test-label {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-weight: 850;
}

.vocab-example {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 16px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.22);
  text-align: left;
}

.vocab-example strong {
  color: #ffffff;
}

.vocab-example span {
  color: rgba(255, 255, 255, 0.62);
}

.vocab-answer-wrap,
.vocabulary-practice :deep(.button-group),
.vocabulary-practice :deep(.feedback-box) {
  width: 100%;
  max-width: 640px;
}

.example-box {
  margin-top: 15px;
  display: grid;
  gap: 6px;
  text-align: left;
}

.example-box p {
  margin: 0;
}

.vocab-test-feedback {
  width: 100%;
  max-width: 560px;
  margin: 0;
  padding: 13px 16px;
  border-radius: 18px;
  box-shadow: none;
  text-align: left;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.vocab-test-feedback.fb-wrong {
  border: 1px solid rgba(255, 82, 82, 0.46);
  background: rgba(255, 82, 82, 0.11);
}

.vocab-test-feedback.fb-correct {
  border: 1px solid rgba(67, 233, 123, 0.38);
  background: rgba(67, 233, 123, 0.1);
}

.vocab-test-feedback .wrong-highlight {
  margin: 0 0 8px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.82rem;
  font-weight: 900;
}

.vocab-test-feedback .wrong-highlight span {
  display: block;
  margin-top: 4px;
  color: #ffffff;
  font-size: 1rem;
  text-decoration: none;
}

.vocab-test-feedback .feedback-text {
  margin: 0;
  color: #ffffff;
  font-weight: 900;
}

.vocab-test-feedback .example-box {
  margin-top: 8px;
  gap: 4px;
}

.vocab-test-feedback .example-box p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.82rem;
  line-height: 1.25;
}

@media (max-width: 700px) {
  .vocabulary-practice {
    width: 100%;
    min-height: 0;
    justify-content: flex-start;
    overflow: visible;
  }

  .vocabulary-practice:has(.practice-layout) {
    height: calc(100dvh - 190px);
    overflow: hidden;
  }

  .vocabulary-practice:has(.practice-layout) :deep(.practice-layout) {
    height: 100%;
    justify-content: flex-start;
  }

  .vocabulary-practice:has(.practice-layout) :deep(.practice-box) {
    height: 100%;
    min-height: 0;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    justify-content: flex-start;
    gap: 14px;
  }

  .vocabulary-practice:has(.practice-layout) :deep(.progress-container) {
    width: 100%;
    padding: 0 4px;
  }

  .vocabulary-practice:has(.practice-layout) :deep(.quiz-area) {
    flex: 1;
    min-height: 0;
    justify-content: stretch;
    gap: 12px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout) {
    height: 100%;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.practice-layout) {
    gap: 12px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout) :deep(.xp-card) {
    width: 100%;
    margin: 0;
    padding: 10px;
    border-radius: 26px;
    gap: 10px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout) :deep(.xp-top) {
    gap: 10px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-mini-card) {
    min-height: 54px;
    padding: 7px 10px;
    border-radius: 19px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-mini-card span) {
    font-size: 1.25rem;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-mini-card strong) {
    font-size: 1rem;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-mini-card small) {
    font-size: 0.68rem;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.level-badge) {
    padding: 7px 18px;
    font-size: 0.86rem;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-progress-info) {
    margin: 8px 0 6px;
    font-size: 0.76rem;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.xp-hint) {
    margin-top: 7px;
    font-size: 0.76rem;
    line-height: 1.25;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.practice-box) {
    flex: 1;
    height: auto;
    min-height: 0;
    gap: 11px;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.progress-container) {
    display: grid;
    gap: 9px;
    padding: 0;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.progress-bar) {
    height: 8px;
    margin: 0;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.progress-text) {
    margin: 0;
    font-size: 1.08rem;
    line-height: 1.15;
  }

  .vocabulary-practice.is-test-mode:has(.practice-layout)
    :deep(.quiz-area) {
    flex: 0 1 auto;
    justify-content: flex-start;
    gap: 12px;
  }

  .vocabulary-practice.is-test-mode .vocab-test-card {
    position: relative;
    width: 100%;
    min-height: clamp(430px, 52dvh, 460px);
    padding: 62px 20px 24px;
    border-radius: 28px;
    gap: 11px;
    align-content: center;
  }

  .vocabulary-practice.is-test-mode .vocab-test-card .vocab-topic {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
  }

  .vocabulary-practice.is-test-mode .vocab-test-label {
    max-width: 24ch;
    font-size: 1.08rem;
    line-height: 1.25;
  }

  .vocabulary-practice.is-test-mode .vocab-test-card h2 {
    max-width: 14ch;
    font-size: clamp(2.2rem, 10vw, 3.15rem);
    line-height: 1.04;
    overflow-wrap: break-word;
    text-wrap: balance;
    word-break: normal;
  }

  .vocabulary-practice.is-test-mode .vocab-answer-wrap,
  .vocabulary-practice.is-test-mode .vocab-test-actions,
  .vocabulary-practice.is-test-mode .vocab-test-feedback,
  .vocabulary-practice.is-test-mode :deep(.feedback-box) {
    width: min(calc(100% - 34px), 560px);
    max-width: 560px;
  }

  .vocabulary-practice.is-test-mode .vocab-answer-wrap {
    margin-top: 6px;
  }

  .vocabulary-practice.is-test-mode .vocab-answer-wrap .pill-input {
    min-height: 60px;
    margin: 0;
    padding: 0 22px;
    font-size: 1.05rem;
  }

  .vocabulary-practice.is-test-mode .vocab-test-actions {
    margin-top: 0;
  }

  .vocabulary-practice.is-test-mode .vocab-test-actions .pill-button {
    min-height: 60px;
    margin: 0;
    border-radius: 30px;
    font-size: 1rem;
  }

  .vocabulary-practice.is-test-mode
    .vocab-test-actions
    .pill-button:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    opacity: 1;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .vocabulary-practice.is-test-mode .vocab-test-feedback {
    padding: 12px 14px;
  }

  .vocabulary-practice.is-test-mode .vocab-test-feedback .example-box {
    display: none;
  }

  .vocab-learn-topic {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 4px 12px;
    background: rgba(255, 255, 255, 0.055);
    text-align: left;
  }

  .vocab-learn-topic span {
    grid-column: 1 / -1;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.72rem;
    font-weight: 900;
  }

  .vocab-learn-topic strong {
    min-width: 0;
    color: #ffffff;
    font-size: 1.08rem;
    font-weight: 950;
    line-height: 1.1;
  }

  .vocab-learn-topic small {
    color: #8fe6ff;
    font-size: 0.78rem;
    font-weight: 900;
    white-space: nowrap;
  }

  .vocabulary-practice:has(.vocab-pack-library),
  .vocabulary-practice:has(.vocab-mode-stage) {
    height: auto;
    min-height: 0;
    overflow: visible;
    display: block;
  }

  .vocab-pack-library {
    gap: 26px;
  }

  .vocab-pack-picker,
  .vocab-mode-picker {
    grid-template-columns: 1fr;
  }

  .vocab-pack-group {
    gap: 14px;
  }

  .vocab-pack-group-head {
    display: grid;
    gap: 8px;
    padding: 0 2px;
    justify-items: start;
    text-align: left;
  }

  .vocab-pack-group-head small {
    text-align: left;
    line-height: 1.45;
  }

  .vocab-pack-group-head strong {
    line-height: 1.12;
  }

  .vocab-pack-card {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 12px 16px;
    min-height: 168px;
    padding: 18px;
    align-items: center;
  }

  .vocab-pack-card > span {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    font-size: 1.65rem;
  }

  .vocab-pack-copy {
    gap: 7px;
    align-self: center;
  }

  .vocab-pack-copy > em {
    margin-bottom: 2px;
  }

  .vocab-pack-copy strong {
    font-size: 1.2rem;
    line-height: 1.08;
  }

  .vocab-pack-copy small {
    font-size: 0.9rem;
    line-height: 1.32;
  }

  .vocab-pack-meta {
    grid-column: 1 / -1;
    margin-top: 2px;
    gap: 8px;
  }

  .vocab-pack-meta em {
    padding: 7px 10px;
    font-size: 0.8rem;
  }

  .vocab-mode-card {
    min-height: 190px;
    padding: 24px;
  }

  .vocab-swipe-actions {
    gap: 34px;
    margin-top: -4px;
  }

  .vocab-swipe-action {
    width: 58px;
    height: 58px;
    font-size: 1.85rem;
  }

  .vocab-card {
    flex: 1;
    min-height: 0;
    max-height: none;
    padding: 28px 22px;
    border-radius: 24px;
  }
}
</style>
