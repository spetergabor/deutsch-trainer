<template>
  <div class="teacher-dashboard">
    <section v-if="!activeTeacherSection" class="teacher-portal">
      <div class="teacher-portal-header">
        <div>
          <h1>Tanári áttekintés</h1>
          <p>Gyors kép arról, kivel érdemes ma foglalkozni.</p>
        </div>
      </div>

      <section class="teacher-upcoming-lessons">
        <div class="teacher-upcoming-lessons-head">
          <div>
            <span>Következő órák</span>
            <h2>Online órák ma és hamarosan</h2>
          </div>

          <button @click="openTeacherSection('students')">
            Óra ütemezése
          </button>
        </div>

        <div v-if="lessonSessionSetupError" class="teacher-upcoming-empty">
          Az órák táblája még nincs beállítva.
        </div>

        <div v-else-if="isLessonSessionsLoading" class="teacher-upcoming-empty">
          Órák betöltése...
        </div>

        <div v-else-if="!upcomingTeacherLessons.length" class="teacher-upcoming-empty">
          Nincs közelgő online óra.
        </div>

        <div v-else class="teacher-upcoming-grid">
          <article
            v-for="lesson in upcomingTeacherLessons.slice(0, 4)"
            :key="lesson.id"
            class="teacher-upcoming-lesson"
          >
            <div class="teacher-upcoming-date">
              <strong>{{ getLessonDayLabel(lesson.scheduled_at) }}</strong>
              <span>{{ getLessonTimeLabel(lesson.scheduled_at) }}</span>
            </div>

            <div class="teacher-upcoming-body">
              <small>{{ lesson.student?.full_name || lesson.student?.email || "Diák" }}</small>
              <h3>{{ lesson.topic || "Online óra" }}</h3>
              <p>{{ lesson.goal || "Közös munkafüzet előkészítve." }}</p>
            </div>

            <div class="teacher-upcoming-actions">
              <a
                v-if="lesson.meet_url"
                :href="lesson.meet_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meet
              </a>

              <button @click="openLessonFromPortal(lesson)">
                Munkafüzet
              </button>
            </div>
          </article>
        </div>
      </section>

      <div class="teacher-overview-grid">
        <article class="teacher-overview-card highlight">
          <span class="teacher-overview-icon">🎓</span>
          <small>Diákok</small>
          <strong>{{ students.length }}</strong>
          <p>{{ isLoading ? "Betöltés..." : "regisztrált diák" }}</p>
        </article>

        <article class="teacher-overview-card">
          <span class="teacher-overview-icon green">✅</span>
          <small>Ma aktív</small>
          <strong>{{ teacherOverview.activeTodayCount }}</strong>
          <p>diák oldott meg feladatot</p>
        </article>

        <article class="teacher-overview-card warning">
          <span class="teacher-overview-icon amber">⚠️</span>
          <small>Figyelmet igényel</small>
          <strong>{{ teacherOverview.attentionStudents.length }}</strong>
          <p>
            {{
              teacherOverview.attentionStudents.length
                ? teacherOverview.attentionStudents.map((item) => item.name).join(", ")
                : "nincs kiugró gyenge pont"
            }}
          </p>
        </article>

        <article class="teacher-overview-card">
          <span class="teacher-overview-icon blue">📉</span>
          <small>Gyenge téma</small>
          <strong>{{ teacherOverview.weakestTopic?.label || "Nincs adat" }}</strong>
          <p>
            {{
              teacherOverview.weakestTopic
                ? `${teacherOverview.weakestTopic.accuracy}% átlag · ${teacherOverview.weakestTopic.attempts} próba`
                : "még kevés feladat alapján"
            }}
          </p>
        </article>
      </div>

      <div class="teacher-focus-panel">
        <div>
          <span class="teacher-focus-kicker">Mai tanári fókusz</span>
          <h2>{{ teacherFocusTitle }}</h2>
          <p>{{ teacherFocusText }}</p>
        </div>

        <div class="teacher-focus-actions">
          <button @click="openTeacherSection('students')">Diákok megnyitása</button>
          <button class="secondary" @click="openTeacherSection('exercises')">
            Feladat készítése
          </button>
        </div>
      </div>

      <div v-if="teacherOverview.attentionStudents.length" class="teacher-focus-list">
        <div class="teacher-focus-list-header">
          <h2>Figyelmet igénylő diákok</h2>
          <span>{{ teacherOverview.attentionStudents.length }} javaslat</span>
        </div>

        <div class="teacher-focus-students">
          <article
            v-for="student in teacherOverview.attentionStudents"
            :key="student.id"
            class="teacher-focus-student"
          >
            <div class="avatar">{{ getInitial(student.name) }}</div>

            <div class="teacher-focus-student-body">
              <strong>{{ student.name }}</strong>
              <span>{{ student.reason }}</span>
              <small>Utolsó aktivitás: {{ formatDate(student.lastActivity) }}</small>
            </div>

            <button @click="openStudentFromOverview(student.id)">Megnyitás</button>
          </article>
        </div>
      </div>

      <div class="teacher-section-grid">
        <button class="teacher-section-card" @click="openTeacherSection('students')">
          <span class="teacher-section-icon students">🎓</span>
          <strong>Diákkezelő</strong>
          <small>Diákok, statisztikák, jegyzetek és feltöltött fájlok.</small>
          <em>{{ students.length }} diák</em>
        </button>

        <button class="teacher-section-card" @click="openTeacherSection('exercises')">
          <span class="teacher-section-icon exercises">🧩</span>
          <strong>Feladatkezelő</strong>
          <small>Feladatok hozzáadása, szerkesztése és deaktiválása.</small>
          <em>5 feladattípus</em>
        </button>

        <button class="teacher-section-card" @click="openTeacherSection('writings')">
          <span class="teacher-section-icon writings">✍️</span>
          <strong>Beküldött írások</strong>
          <small>ÖSD levelek, beadott fogalmazások és javításra váró szövegek.</small>
          <em>{{ writingSubmissions.length }} beküldés</em>
        </button>
      </div>
    </section>

    <section v-else class="teacher-workspace">
      <header class="teacher-workspace-header">
        <button class="btn-outline btn-small" @click="goToTeacherPortal">
          ← Vissza
        </button>

        <div>
          <h1>
            {{ activeTeacherSectionTitle }}
          </h1>
          <p>{{ activeTeacherSectionDescription }}</p>
        </div>
      </header>

      <div v-if="activeTeacherSection === 'students'" class="teacher-container">
        <aside class="student-list">
          <div class="student-list-header">
            <h2>Diákjaim</h2>
            <span>{{ students.length }} fő</span>
          </div>

          <div v-if="isLoading" class="no-students">Diákok betöltése...</div>

          <div v-else-if="students.length === 0" class="no-students">
            Még nincsenek regisztrált diákok.
          </div>

          <div
            v-for="student in students"
            :key="student.id"
            class="student-item"
            :class="{ active: selectedStudent?.id === student.id }"
            @click="selectStudent(student)"
          >
            <div class="avatar">{{ getInitial(student.full_name) }}</div>

            <div class="student-info">
              <span class="student-name">
                {{ student.full_name || "Névtelen diák" }}
              </span>

              <span class="student-email">
                {{ student.email }}
              </span>
            </div>
          </div>
        </aside>

        <main class="student-details">
          <div v-if="selectedStudent" class="details-content">
            <header class="details-header">
              <div>
                <h1>{{ selectedStudent.full_name || "Névtelen diák" }}</h1>
                <p>{{ selectedStudent.email }}</p>
              </div>

              <button class="btn-outline btn-small" @click="clearSelectedStudent">
                Bezárás
              </button>
            </header>

            <div v-if="isStudentDataLoading" class="empty-state small">
              Adatok betöltése...
            </div>

            <div v-else class="details-grid">
              <div class="detail-card">
                <h3>📊 Statisztikák</h3>

                <div class="stat-row">
                  <span>Megoldott feladatok:</span>
                  <strong>{{ studentStats.totalDone }} db</strong>
                </div>

                <div class="stat-row">
                  <span>Átlagos eredmény:</span>
                  <strong>{{ studentStats.accuracy }}%</strong>
                </div>

                <div class="student-trend-box" :class="studentTrend.direction">
                  <strong>{{ studentTrend.label }}</strong>
                  <span>{{ studentTrend.detail }}</span>
                </div>
              </div>

              <div class="detail-card smart-alert-card">
                <h3>🧠 Figyelmeztetések</h3>

                <div v-if="studentAlerts.length" class="teacher-alert-list">
                  <div
                    v-for="alert in studentAlerts"
                    :key="alert.type + alert.text"
                    class="teacher-alert"
                    :class="alert.level"
                  >
                    {{ alert.text }}
                  </div>
                </div>

                <p v-else class="empty-text">
                  Nincs kritikus gyenge pont az utolsó feladatok alapján.
                </p>

                <div v-if="studentWeakTopics.length" class="teacher-topic-list">
                  <strong>Témánkénti gyenge pontok</strong>

                  <div
                    v-for="topic in studentWeakTopics"
                    :key="topic.type"
                    class="teacher-topic-row"
                  >
                    <span>{{ topic.label }}</span>
                    <small>{{ topic.accuracy }}% · {{ topic.attempts }} próba</small>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h3>🕒 Legutóbbi feladatok</h3>

                <div v-if="studentResults.length">
                  <div
                    v-for="result in studentResults.slice(0, 5)"
                    :key="result.id || result.created_at"
                    class="mini-row"
                  >
                    <span>{{ getTaskName(result.exercise_type) }}</span>
                    <strong>{{ result.score }} / {{ result.max_score }}</strong>
                  </div>
                </div>

                <p v-else class="empty-text">Még nincs megoldott feladat.</p>
              </div>

              <div class="detail-card teacher-note-card">
                <h3>✍️ Tanári jegyzet küldése</h3>

                <textarea
                  v-model="teacherNoteText"
                  class="teacher-note-textarea"
                  placeholder="Írj jegyzetet, instrukciót vagy házi feladatot a diáknak..."
                ></textarea>

                <button
                  class="send-teacher-note-btn"
                  @click="sendTeacherNote"
                  :disabled="isSendingTeacherNote || !teacherNoteText.trim()"
                >
                  {{ isSendingTeacherNote ? "Küldés..." : "Jegyzet küldése" }}
                </button>
              </div>

              <div class="detail-card lesson-workbook-card">
                <div class="lesson-card-head">
                  <div>
                    <h3>📅 Online órák</h3>
                    <p>Következő óra és közös munkafüzet.</p>
                  </div>

                  <span v-if="selectedStudentNextLesson">
                    {{ formatDate(selectedStudentNextLesson.scheduled_at) }}
                  </span>
                </div>

                <div class="lesson-schedule-form">
                  <label>
                    Időpont
                    <input v-model="newLesson.scheduledAt" type="datetime-local" />
                  </label>

                  <label>
                    Meet link
                    <input v-model.trim="newLesson.meetUrl" type="url" placeholder="https://meet.google.com/..." />
                  </label>

                  <label>
                    Téma
                    <input v-model.trim="newLesson.topic" type="text" placeholder="pl. Passiv ismétlés" />
                  </label>

                  <label>
                    Óra célja
                    <input v-model.trim="newLesson.goal" type="text" placeholder="pl. panaszlevél javítása + szókincs" />
                  </label>
                </div>

                <button
                  class="send-teacher-note-btn"
                  @click="scheduleLessonForSelectedStudent"
                  :disabled="isSavingLesson || !newLesson.scheduledAt"
                >
                  {{ isSavingLesson ? "Mentés..." : "Óra ütemezése" }}
                </button>

                <div v-if="lessonSessionSetupError" class="empty-text warning">
                  Az órák táblája még nincs beállítva.
                </div>

                <div v-else-if="isLessonSessionsLoading" class="empty-text">
                  Órák betöltése...
                </div>

                <div v-else-if="selectedStudentLessons.length" class="lesson-session-list">
                  <button
                    v-for="lesson in selectedStudentLessons"
                    :key="lesson.id"
                    class="lesson-session-item"
                    :class="{ active: selectedLesson?.id === lesson.id }"
                    @click="selectLessonSession(lesson)"
                  >
                    <strong>{{ lesson.topic || "Online óra" }}</strong>
                    <span>{{ formatDate(lesson.scheduled_at) }}</span>
                    <small>{{ getLessonStatusLabel(lesson.status) }}</small>
                  </button>
                </div>

                <div v-else class="empty-text">
                  Még nincs ütemezett óra ehhez a diákhoz.
                </div>

                <div v-if="selectedLesson" class="lesson-workbook-editor">
                  <div class="lesson-workbook-title">
                    <div>
                      <strong>{{ selectedLesson.topic || "Online óra" }}</strong>
                      <span>{{ selectedLesson.goal || "Közös munkafüzet" }}</span>
                    </div>

                    <div class="lesson-workbook-title-actions">
                      <a
                        v-if="selectedLesson.meet_url"
                        :href="selectedLesson.meet_url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Meet
                      </a>

                      <button
                        class="lesson-workbook-close"
                        type="button"
                        @click="closeSelectedLesson"
                      >
                        Bezárás
                      </button>
                    </div>
                  </div>

                  <label>
                    Közös jegyzet
                    <textarea v-model="lessonWorkbookDraft.sharedNotes"></textarea>
                  </label>

                  <label>
                    Új szavak
                    <textarea v-model="lessonWorkbookDraft.vocabularyNotes"></textarea>
                  </label>

                  <label>
                    Hibák és javítások
                    <textarea v-model="lessonWorkbookDraft.correctionsNotes"></textarea>
                  </label>

                  <label>
                    Házi / következő lépés
                    <textarea v-model="lessonWorkbookDraft.nextSteps"></textarea>
                  </label>

                  <div class="lesson-workbook-actions">
                    <button
                      @click="saveSelectedLessonWorkbook"
                      :disabled="isSavingLessonWorkbook"
                    >
                      {{ isSavingLessonWorkbook ? "Mentés..." : "Munkafüzet mentése" }}
                    </button>

                    <button
                      v-if="selectedLesson.status !== 'completed'"
                      class="secondary"
                      @click="completeSelectedLesson"
                    >
                      Óra lezárása
                    </button>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h3>📝 Jegyzetek</h3>

                <div v-if="studentNotes.length">
                  <div
                    v-for="note in studentNotes"
                    :key="note.id"
                    :class="[
                      'note-item',
                      note.author_role === 'teacher' ? 'teacher-note-item' : '',
                    ]"
                  >
                    <small>
                      <template v-if="note.author_role === 'teacher'">
                        👨‍🏫 Tanári jegyzet
                        <span v-if="note.author_name">
                          · {{ note.author_name }}
                        </span>
                        · {{ formatDate(note.created_at) }}
                      </template>

                      <template v-else>
                        {{ formatDate(note.created_at) }}
                      </template>
                    </small>

                    <p>{{ note.content }}</p>
                  </div>
                </div>

                <p v-else class="empty-text">Nincsenek jegyzetek.</p>
              </div>

              <div class="detail-card">
                <h3>📂 Feltöltött dokumentumok</h3>

                <div v-if="studentFiles.length">
                  <a
                    v-for="file in studentFiles"
                    :key="file.path"
                    class="file-item"
                    :href="file.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 {{ file.name }}
                  </a>
                </div>

                <p v-else class="empty-text">Nincsenek feltöltött fájlok.</p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🎓</div>
            <h2>Válassz diákot</h2>
            <p>Bal oldalt kattints egy diákra a részletek megnyitásához.</p>
          </div>
        </main>
      </div>

      <section v-else-if="activeTeacherSection === 'writings'" class="writing-submissions-manager">
        <div v-if="writingSubmissionSetupError" class="setup-warning-card">
          <strong>A beküldött írások táblája még nincs beállítva.</strong>
          <p>Futtasd le a `supabase/writing_submissions.sql` fájlt a Supabase SQL editorban.</p>
        </div>

        <section class="teacher-homework-panel">
          <div class="teacher-homework-panel-head">
            <div>
              <h2>Diákanyagok</h2>
              <p>Válassz diákot, majd egy helyen látod a házijait és a beküldött írásait.</p>
            </div>

            <div class="teacher-homework-actions">
              <button
                class="btn-outline btn-small"
                @click="fetchWritingSubmissions"
                :disabled="isWritingSubmissionsLoading"
              >
                Frissítés
              </button>

              <button
                class="btn-outline btn-small"
                @click="openNewHomeworkForSelectedStudent"
              >
                + Új házi
              </button>
            </div>
          </div>

          <div class="teacher-materials-unified">
            <aside class="teacher-materials-list">
              <button
                v-for="student in teacherMaterialStudents"
                :key="student.id"
                class="teacher-materials-item"
                :class="{ active: selectedTeacherMaterialStudentId === student.id }"
                @click="selectTeacherMaterialStudent(student.id)"
              >
                <strong>{{ student.full_name || student.email || "Diák" }}</strong>
                <span>{{ student.email }}</span>
                <small>
                  {{ student.homeworkCount }} házi · {{ student.submissionCount }} írás
                </small>
              </button>
            </aside>

            <article class="teacher-materials-detail">
              <template v-if="selectedTeacherHomeworkKey === 'new'">
                <div class="teacher-materials-detail-head">
                  <span>Új házi</span>
                  <h2>Feladat kiadása</h2>
                  <p>
                    {{
                      selectedTeacherMaterialStudent
                        ? `${selectedTeacherMaterialStudent.full_name || selectedTeacherMaterialStudent.email} számára`
                        : "Válaszd ki a diákot, a feladattípust, majd írd le pontosan a kérést."
                    }}
                  </p>
                </div>

                <div class="homework-form-grid">
                  <label>
                    Diák
                    <select v-model="newHomework.studentId">
                      <option value="">Válassz diákot</option>
                      <option
                        v-for="student in students"
                        :key="student.id"
                        :value="student.id"
                      >
                        {{ student.full_name || student.email }}
                      </option>
                    </select>
                  </label>

                  <label>
                    Feladat típusa
                    <select v-model="newHomework.type">
                      <option value="writing">Fogalmazás / levélírás</option>
                      <option value="practice">Gyakorló feladat</option>
                    </select>
                  </label>

                  <label v-if="newHomework.type === 'practice'">
                    Gyakorló típus
                    <select v-model="newHomework.practiceType">
                      <option value="perfekt">Perfekt</option>
                      <option value="adjektiv">Adjektivdeklination</option>
                      <option value="passiv">Passiv</option>
                      <option value="pronominaladverb">Pronominaladverbien</option>
                      <option value="vocabulary">Szókincs</option>
                    </select>
                  </label>

                  <label>
                    Cím
                    <input v-model.trim="newHomework.title" type="text" placeholder="pl. Panaszlevél írása" />
                  </label>

                  <label v-if="newHomework.type === 'writing'">
                    Elvárt szószám
                    <input v-model.number="newHomework.expectedWordCount" type="number" min="40" />
                  </label>

                  <label v-else>
                    Feladatok száma
                    <input v-model.number="newHomework.targetCount" type="number" min="1" />
                  </label>

                  <label>
                    Határidő
                    <input v-model="newHomework.dueAt" type="datetime-local" />
                  </label>
                </div>

                <label class="homework-wide-field">
                  Instrukció / kérés
                  <textarea
                    v-model.trim="newHomework.instructions"
                    placeholder="Írd le pontosan, mit kérsz a diáktól..."
                  ></textarea>
                </label>

                <button
                  class="send-teacher-note-btn"
                  @click="saveHomeworkAssignment"
                  :disabled="isSavingHomework || !canSaveHomework"
                >
                  {{ isSavingHomework ? "Kiadás..." : "Házi kiadása" }}
                </button>
              </template>

              <template v-else-if="selectedTeacherMaterialStudent">
                <div class="teacher-selected-student-summary">
                  <div>
                    <strong>{{ selectedTeacherMaterialStudent.full_name || selectedTeacherMaterialStudent.email }}</strong>
                    <span>{{ selectedTeacherMaterialStudent.email }}</span>
                  </div>

                  <em>{{ selectedTeacherStudentMaterials.length }} anyag</em>
                </div>

                <div v-if="!selectedTeacherStudentMaterials.length" class="empty-state small">
                  Ennek a diáknak még nincs kiadott vagy beküldött anyaga.
                </div>

                <div v-else class="teacher-student-materials-layout">
                  <aside class="teacher-student-material-list">
                    <button
                      v-for="item in selectedTeacherStudentMaterials"
                      :key="item.key"
                      class="teacher-student-material-item"
                      :class="{ active: selectedTeacherMaterialKey === item.key }"
                      @click="selectTeacherMaterial(item)"
                    >
                      <div class="teacher-student-material-title-row">
                        <strong>{{ item.title }}</strong>
                        <span
                          :class="['teacher-status-dot', item.statusKey]"
                          :title="item.statusLabel"
                          :aria-label="item.statusLabel"
                        ></span>
                      </div>
                      <span>{{ item.statusLabel }}</span>
                      <small>{{ item.typeLabel }} · {{ formatDate(item.createdAt) }}</small>
                    </button>
                  </aside>

                  <article v-if="selectedTeacherMaterial" class="teacher-student-material-detail">
                    <div class="teacher-materials-detail-head compact">
                      <span>{{ selectedTeacherMaterial.statusLabel }}</span>
                      <h2>{{ selectedTeacherMaterial.title }}</h2>
                      <p>{{ selectedTeacherMaterial.typeLabel }}</p>
                    </div>

                    <div class="teacher-materials-meta">
                      <div v-if="selectedTeacherMaterial.expectedWordCount">
                        <span>Elvárt</span>
                        <strong>{{ selectedTeacherMaterial.expectedWordCount }} szó</strong>
                      </div>

                      <div v-if="selectedTeacherMaterial.wordCount">
                        <span>Szószám</span>
                        <strong>{{ selectedTeacherMaterial.wordCount }} szó</strong>
                      </div>

                      <div v-if="selectedTeacherMaterial.targetCount">
                        <span>Cél</span>
                        <strong>{{ selectedTeacherMaterial.targetCount }} feladat</strong>
                      </div>

                      <div v-if="selectedTeacherMaterial.dueAt">
                        <span>Határidő</span>
                        <strong>{{ formatDate(selectedTeacherMaterial.dueAt) }}</strong>
                      </div>
                    </div>

                    <template v-if="selectedTeacherMaterial.kind === 'homework'">
                      <section>
                        <h3>Instrukció</h3>
                        <p>{{ selectedTeacherMaterial.raw.instructions }}</p>
                      </section>
                    </template>

                    <template v-else>
                      <section class="writing-submission-task">
                        <h3>Levél témája</h3>
                        <p>{{ selectedTeacherMaterial.raw.task_situation }}</p>

                        <template v-if="selectedTeacherMaterial.raw.task_points?.length">
                          <h3>Feladat pontjai</h3>
                          <ul>
                            <li
                              v-for="point in selectedTeacherMaterial.raw.task_points"
                              :key="point"
                            >
                              {{ point }}
                            </li>
                          </ul>
                        </template>

                        <h3>Instrukció</h3>
                        <p>{{ selectedTeacherMaterial.raw.task_instructions }}</p>
                      </section>

                      <section class="writing-submission-content">
                        <h3>Diák levele</h3>
                        <p>{{ selectedTeacherMaterial.raw.content }}</p>
                      </section>

                      <section class="writing-review-panel">
                        <h3>Tanári értékelés</h3>

                        <label>
                          Osztályzat / értékelés
                          <input
                            v-model.trim="writingReviewGrade"
                            type="text"
                            placeholder="pl. 4, B2: gut, 82%"
                          />
                        </label>

                        <label>
                          Vélemény a diáknak
                          <textarea
                            v-model.trim="writingReviewFeedback"
                            placeholder="Írd le röviden, mi sikerült jól, min kell javítani, mire figyeljen legközelebb..."
                          ></textarea>
                        </label>

                        <button
                          @click="saveWritingReview"
                          :disabled="isSavingWritingReview || !selectedWritingSubmission"
                        >
                          {{ isSavingWritingReview ? "Mentés..." : "Értékelés mentése" }}
                        </button>
                      </section>
                    </template>
                  </article>
                </div>
              </template>

              <div v-else class="empty-state small">
                Válassz diákot a listából.
              </div>
            </article>
          </div>
        </section>
      </section>

      <section v-else class="exercise-manager">
        <div class="exercise-manager-header">
          <div>
            <h2>Feladatok kezelése</h2>
            <p>Válassz feladattípust, majd adj hozzá vagy szerkessz feladatokat.</p>
          </div>

          <button
            class="btn-outline btn-small"
            @click="fetchExerciseItems"
            :disabled="isExerciseItemsLoading"
          >
            Frissítés
          </button>
        </div>

        <div class="teacher-exercise-apps">
          <button
            v-for="exerciseType in exerciseTypes"
            :key="exerciseType.type"
            class="teacher-exercise-app"
            :class="{ active: selectedExerciseType === exerciseType.type }"
            @click="selectExerciseType(exerciseType.type)"
          >
            <span :class="['teacher-exercise-icon', exerciseType.iconClass]">
              {{ exerciseType.icon }}
            </span>
            <strong>{{ exerciseType.label }}</strong>
          </button>
        </div>

        <div class="exercise-editor-card">
          <h3>
            {{
              editingExerciseId
                ? selectedExerciseConfig.editTitle
                : selectedExerciseConfig.newTitle
            }}
          </h3>

          <div class="exercise-form-grid">
            <label v-for="field in compactExerciseFields" :key="field.key">
              {{ field.label }}
              <input
                v-model.trim="newExercise[field.key]"
                type="text"
                :placeholder="field.placeholder"
              />
            </label>
          </div>

          <label
            v-for="field in fullExerciseFields"
            :key="field.key"
            class="exercise-field"
          >
            {{ field.label }}
            <textarea
              v-if="field.type === 'textarea'"
              v-model.trim="newExercise[field.key]"
              :placeholder="field.placeholder"
            ></textarea>

            <input
              v-else
              v-model.trim="newExercise[field.key]"
              type="text"
              :placeholder="field.placeholder"
            />
          </label>

          <button
            class="send-teacher-note-btn"
            @click="saveExercise"
            :disabled="isExerciseSaving || !canSaveExercise"
          >
            {{
              isExerciseSaving
                ? "Mentés..."
                : editingExerciseId
                  ? "Módosítás mentése"
                  : "Feladat hozzáadása"
            }}
          </button>

          <button
            v-if="editingExerciseId"
            class="cancel-edit-btn"
            @click="cancelExerciseEdit"
            :disabled="isExerciseSaving"
          >
            Mégse
          </button>
        </div>

        <div class="exercise-list-card">
          <div class="exercise-list-header">
            <div>
              <h3>{{ selectedExerciseConfig.label }} feladatlista</h3>
              <p>
                Tanári feladat:
                <strong>{{ exerciseItems.length }}</strong>
                · Alap feladatbank:
                <strong>{{ baseExerciseItems.length }}</strong>
              </p>
            </div>

            <button class="btn-outline btn-small" @click="showBaseExercises = !showBaseExercises">
              {{ showBaseExercises ? "Alap feladatok elrejtése" : "Alap feladatok mutatása" }}
            </button>
          </div>

          <div v-if="isExerciseItemsLoading" class="empty-text">
            Feladatok betöltése...
          </div>

          <div v-else-if="!visibleExerciseItems.length" class="empty-text">
            Még nincs {{ selectedExerciseConfig.label }} feladat.
          </div>

          <div v-else class="exercise-item-list">
            <article
              v-for="item in visibleExerciseItems"
              :key="item.id"
              class="exercise-item-row"
              :class="{
                inactive: !item.is_active,
                'base-exercise-row': item.isBaseExercise,
              }"
            >
              <div>
                <div class="exercise-item-meta">
                  <span>{{ selectedExerciseConfig.label }}</span>
                  <span>{{ item.isBaseExercise ? "Alap feladat" : "Tanári feladat" }}</span>
                  <span v-if="getExerciseMeta(item)">{{ getExerciseMeta(item) }}</span>
                  <span>{{ item.is_active ? "Aktív" : "Inaktív" }}</span>
                </div>

                <strong>{{ getExercisePrimaryText(item) }}</strong>
                <small>{{ getExerciseSecondaryText(item) }}</small>
              </div>

              <div class="exercise-row-actions">
                <button
                  v-if="!item.isBaseExercise"
                  class="btn-outline btn-small"
                  @click="startExerciseEdit(item)"
                >
                  Szerkesztés
                </button>

                <button
                  v-if="!item.isBaseExercise"
                  class="btn-outline btn-small"
                  @click="deactivateExercise(item.id)"
                  :disabled="!item.is_active"
                >
                  Deaktiválás
                </button>

                <span v-if="item.isBaseExercise" class="readonly-exercise-label">
                  Beépített
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<script>
import { formatDate, getTaskName } from "../utils/formatters";
import {
  createTeacherNote,
  fetchTeacherStudents,
  fetchTeacherStudentFiles,
  fetchTeacherStudentNotes,
  fetchTeacherStudentResults,
  fetchTeacherOverview,
} from "../services/teacherService";
import {
  createExerciseItem,
  deactivateExerciseItem,
  fetchTeacherExerciseItems,
  updateExerciseItem,
} from "../services/exerciseItemService";
import {
  fetchTeacherWritingSubmissions,
  reviewWritingSubmission,
  updateWritingSubmissionStatus,
} from "../services/writingSubmissionService";
import {
  createHomeworkAssignment,
  fetchTeacherHomeworkAssignments,
} from "../services/homeworkService";
import {
  createLessonSession,
  fetchTeacherLessonSessions,
  updateLessonStatus,
  updateLessonWorkbook,
} from "../services/lessonSessionService";
import verbsData from "../data/verbs.json";
import nomenData from "../data/nomen.json";
import adjektivData from "../data/adjektiv.json";
import { praepositionenData } from "../data/praepositionen";
import { konnektorenData } from "../data/konnektoren";
import { sichVerbenData } from "../data/sichVerben";

export default {
  name: "TeacherDashboard",

  props: {
    initialSection: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      activeTeacherSection: null,
      students: [],
      selectedStudent: null,

      studentNotes: [],
      studentFiles: [],
      studentResults: [],
      studentAlerts: [],
      studentWeakTopics: [],
      studentTrend: {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      },

      studentStats: {
        accuracy: 0,
        totalDone: 0,
      },
      teacherOverview: {
        activeTodayCount: 0,
        inactiveCount: 0,
        inactiveStudents: [],
        attentionStudents: [],
        weakestTopic: null,
        totalResults: 0,
      },

      teacherNoteText: "",
      isSendingTeacherNote: false,
      lessonSessions: [],
      selectedLessonId: "",
      isLessonSessionsLoading: false,
      isSavingLesson: false,
      isSavingLessonWorkbook: false,
      lessonSessionSetupError: false,
      newLesson: {
        scheduledAt: "",
        meetUrl: "",
        topic: "",
        goal: "",
      },
      lessonWorkbookDraft: {
        sharedNotes: "",
        vocabularyNotes: "",
        correctionsNotes: "",
        nextSteps: "",
      },

      isLoading: false,
      isStudentDataLoading: false,

      exerciseItems: [],
      isExerciseItemsLoading: false,
      isExerciseSaving: false,
      writingSubmissions: [],
      selectedWritingSubmission: null,
      isWritingSubmissionsLoading: false,
      writingSubmissionSetupError: false,
      writingReviewGrade: "",
      writingReviewFeedback: "",
      isSavingWritingReview: false,
      homeworkAssignments: [],
      selectedTeacherHomeworkKey: "new",
      selectedTeacherMaterialStudentId: "",
      selectedTeacherMaterialKey: "",
      isSavingHomework: false,
      newHomework: {
        studentId: "",
        type: "writing",
        practiceType: "adjektiv",
        title: "",
        instructions: "",
        expectedWordCount: 120,
        targetCount: 10,
        dueAt: "",
      },
      showBaseExercises: false,
      selectedExerciseType: "perfekt",
      exerciseTypes: [
        {
          type: "perfekt",
          label: "Perfekt",
          icon: "🚀",
          iconClass: "perfekt",
          newTitle: "Új Perfekt feladat",
          editTitle: "Perfekt feladat szerkesztése",
        },
        {
          type: "nomen-verb",
          label: "Nomen-Verb",
          icon: "📚",
          iconClass: "nomen",
          newTitle: "Új Nomen-Verb feladat",
          editTitle: "Nomen-Verb feladat szerkesztése",
        },
        {
          type: "adjektiv",
          label: "Adjektiv",
          icon: "🎨",
          iconClass: "adjektiv",
          newTitle: "Új Adjektiv feladat",
          editTitle: "Adjektiv feladat szerkesztése",
        },
        {
          type: "praeposition",
          label: "Präpositionen",
          icon: "🔗",
          iconClass: "praeposition",
          newTitle: "Új Präposition feladat",
          editTitle: "Präposition feladat szerkesztése",
        },
        {
          type: "konnektoren",
          label: "Konnektoren",
          icon: "🔀",
          iconClass: "konnektoren",
          newTitle: "Új Konnektoren feladat",
          editTitle: "Konnektoren feladat szerkesztése",
        },
        {
          type: "sich-verben",
          label: "Sich-Verben",
          icon: "🪞",
          iconClass: "sich",
          newTitle: "Új Sich-Verben feladat",
          editTitle: "Sich-Verben feladat szerkesztése",
        },
      ],
      newExercise: {
        verb: "",
        auxiliary: "hat",
        pastParticiple: "",
        nomen: "",
        context: "",
        article: "",
        adj: "",
        noun: "",
        case: "",
        rule: "",
        preposition: "",
        caseType: "",
        example: "",
        gapSentence: "",
        level: "B1",
        category: "",
        sentence: "",
        optionsText: "",
        correct: "",
        meaning: "",
        explanation: "",
        grammarTip: "",
        infinitive: "",
        answer: "",
      },
      editingExerciseId: null,
    };
  },

  computed: {
    selectedExerciseConfig() {
      return (
        this.exerciseTypes.find((item) => item.type === this.selectedExerciseType) ||
        this.exerciseTypes[0]
      );
    },

    currentTeacherId() {
      return this.$root?.userSession?.id || null;
    },

    activeTeacherSectionTitle() {
      const titles = {
        students: "Diákkezelő",
        exercises: "Feladatkezelő",
        writings: "Beküldött írások",
      };

      return titles[this.activeTeacherSection] || "Tanári felület";
    },

    activeTeacherSectionDescription() {
      const descriptions = {
        students: "Diákok áttekintése, teljesítmény és tanári jegyzetek.",
        exercises: "Nem ÖSD feladatok szerkesztése és bővítése.",
        writings: "ÖSD levelek és fogalmazások áttekintése, javítási állapottal.",
      };

      return descriptions[this.activeTeacherSection] || "";
    },

    exerciseFields() {
      const fieldsByType = {
        perfekt: [
          { key: "verb", label: "Ige *", placeholder: "gehen" },
          { key: "auxiliary", label: "Segédige *", placeholder: "ist" },
          { key: "pastParticiple", label: "Partizip II *", placeholder: "gegangen" },
          { key: "meaning", label: "Jelentés", placeholder: "megy" },
        ],
        "nomen-verb": [
          { key: "nomen", label: "Nomen *", placeholder: "eine Entscheidung" },
          { key: "verb", label: "Verb *", placeholder: "treffen" },
          { key: "meaning", label: "Jelentés", placeholder: "sich entscheiden" },
          {
            key: "example",
            label: "Példamondat",
            placeholder: "Wir müssen eine Entscheidung treffen.",
            type: "textarea",
          },
          {
            key: "translation",
            label: "Fordítás",
            placeholder: "Döntést kell hoznunk.",
            type: "textarea",
          },
        ],
        adjektiv: [
          { key: "context", label: "Kontextus *", placeholder: "Das ist" },
          { key: "article", label: "Névelő *", placeholder: "der" },
          { key: "adj", label: "Melléknév *", placeholder: "alt" },
          { key: "noun", label: "Főnév *", placeholder: "Schlüssel" },
          { key: "correct", label: "Helyes válasz *", placeholder: "der alte Schlüssel" },
          { key: "case", label: "Eset", placeholder: "Nominativ" },
          { key: "rule", label: "Szabály", placeholder: "Határozott (Hímnem)" },
        ],
        praeposition: [
          { key: "verb", label: "Ige *", placeholder: "warten" },
          { key: "preposition", label: "Prepozíció *", placeholder: "auf" },
          { key: "caseType", label: "Eset", placeholder: "Akk" },
          { key: "meaning", label: "Jelentés", placeholder: "várni valamire" },
          {
            key: "example",
            label: "Példamondat",
            placeholder: "Immer muss man auf dich warten.",
            type: "textarea",
          },
          {
            key: "gapSentence",
            label: "Hiányos mondat *",
            placeholder: "Immer muss man ___ dich warten.",
            type: "textarea",
          },
        ],
        konnektoren: [
          { key: "level", label: "Szint", placeholder: "B1" },
          { key: "category", label: "Kategória", placeholder: "kausal" },
          {
            key: "sentence",
            label: "Mondat *",
            placeholder: "Ich bleibe zu Hause, _____ ich krank bin.",
            type: "textarea",
          },
          {
            key: "optionsText",
            label: "Válaszlehetőségek vesszővel elválasztva *",
            placeholder: "weil, obwohl, trotzdem, während",
          },
          { key: "correct", label: "Helyes válasz *", placeholder: "weil" },
          { key: "meaning", label: "Jelentés", placeholder: "mert" },
          {
            key: "explanation",
            label: "Magyarázat",
            placeholder: "A weil okot fejez ki.",
            type: "textarea",
          },
          {
            key: "grammarTip",
            label: "Nyelvtani tipp",
            placeholder: "weil után az ige a mellékmondat végére kerül.",
            type: "textarea",
          },
        ],
        "sich-verben": [
          { key: "infinitive", label: "Alapige *", placeholder: "sich freuen auf" },
          { key: "meaning", label: "Jelentés", placeholder: "örülni valaminek" },
          {
            key: "sentence",
            label: "Hiányos mondat *",
            placeholder: "Ich _____ auf den Urlaub.",
            type: "textarea",
          },
          { key: "answer", label: "Helyes válasz *", placeholder: "freue mich" },
          {
            key: "optionsText",
            label: "Alternatív válaszok vesszővel elválasztva",
            placeholder: "freue mich sehr, freue mich darauf",
          },
          {
            key: "explanation",
            label: "Magyarázat",
            placeholder: "Ich esetén a reflexív névmás: mich.",
            type: "textarea",
          },
        ],
      };

      return fieldsByType[this.selectedExerciseType] || [];
    },

    compactExerciseFields() {
      return this.exerciseFields.filter((field) => field.type !== "textarea");
    },

    fullExerciseFields() {
      return this.exerciseFields.filter((field) => field.type === "textarea");
    },

    canSaveExercise() {
      const requiredFieldsByType = {
        perfekt: ["verb", "auxiliary", "pastParticiple"],
        "nomen-verb": ["nomen", "verb"],
        adjektiv: ["context", "article", "adj", "noun", "correct"],
        praeposition: ["verb", "preposition", "gapSentence"],
        konnektoren: ["sentence", "optionsText", "correct"],
        "sich-verben": ["infinitive", "sentence", "answer"],
      };

      const requiredFields = requiredFieldsByType[this.selectedExerciseType] || [];

      return requiredFields.every((field) => this.newExercise[field]?.trim());
    },

    baseExerciseData() {
      const itemsByType = {
        perfekt: verbsData,
        "nomen-verb": nomenData,
        adjektiv: adjektivData,
        praeposition: praepositionenData,
        konnektoren: konnektorenData,
        "sich-verben": sichVerbenData,
      };

      return itemsByType[this.selectedExerciseType] || [];
    },

    baseExerciseItems() {
      return this.baseExerciseData.map((payload, index) => ({
        id: `base-${this.selectedExerciseType}-${payload.id || index}`,
        type: this.selectedExerciseType,
        title: this.getExerciseTitle(payload),
        payload,
        is_active: true,
        isBaseExercise: true,
      }));
    },

    visibleExerciseItems() {
      return this.showBaseExercises
        ? [...this.exerciseItems, ...this.baseExerciseItems]
        : this.exerciseItems;
    },

    canSaveHomework() {
      return Boolean(
        this.newHomework.studentId &&
          this.newHomework.title?.trim() &&
          this.newHomework.instructions?.trim(),
      );
    },

    selectedTeacherHomework() {
      if (this.selectedTeacherHomeworkKey === "new") {
        return null;
      }

      return this.homeworkAssignments.find((assignment) => {
        return assignment.id === this.selectedTeacherHomeworkKey;
      }) || null;
    },

    teacherMaterialStudents() {
      return this.students.map((student) => {
        const homeworkCount = this.homeworkAssignments.filter((assignment) => {
          return assignment.student_id === student.id;
        }).length;

        const submissionCount = this.writingSubmissions.filter((submission) => {
          return submission.student_id === student.id;
        }).length;

        return {
          ...student,
          homeworkCount,
          submissionCount,
        };
      });
    },

    selectedTeacherMaterialStudent() {
      return this.teacherMaterialStudents.find((student) => {
        return student.id === this.selectedTeacherMaterialStudentId;
      }) || this.teacherMaterialStudents[0] || null;
    },

    selectedTeacherStudentMaterials() {
      const studentId = this.selectedTeacherMaterialStudent?.id;

      if (!studentId) {
        return [];
      }

      const homeworkItems = this.homeworkAssignments
        .filter((assignment) => assignment.student_id === studentId)
        .map((assignment) => ({
          key: `homework-${assignment.id}`,
          kind: "homework",
          raw: assignment,
          title: assignment.title,
          statusKey: assignment.status,
          statusLabel: this.getHomeworkStatusLabel(assignment.status),
          typeLabel: this.getHomeworkTypeLabel(assignment),
          expectedWordCount: assignment.expected_word_count,
          targetCount: assignment.target_count,
          dueAt: assignment.due_at,
          createdAt: assignment.created_at,
        }));

      const submissionItems = this.writingSubmissions
        .filter((submission) => submission.student_id === studentId)
        .map((submission) => ({
          key: `submission-${submission.id}`,
          kind: "submission",
          raw: submission,
          title: submission.task_title,
          statusKey: submission.status,
          statusLabel: this.getSubmissionStatusLabel(submission.status),
          typeLabel: "Beküldött írás",
          expectedWordCount: submission.expected_word_count,
          wordCount: submission.word_count,
          createdAt: submission.created_at,
        }));

      return [...homeworkItems, ...submissionItems].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    },

    selectedTeacherMaterial() {
      if (!this.selectedTeacherStudentMaterials.length) {
        return null;
      }

      return this.selectedTeacherStudentMaterials.find((item) => {
        return item.key === this.selectedTeacherMaterialKey;
      }) || this.selectedTeacherStudentMaterials[0];
    },

    selectedStudentLessons() {
      if (!this.selectedStudent?.id) {
        return [];
      }

      return this.lessonSessions
        .filter((lesson) => lesson.student_id === this.selectedStudent.id)
        .sort((a, b) => new Date(b.scheduled_at || 0) - new Date(a.scheduled_at || 0));
    },

    selectedStudentNextLesson() {
      const now = new Date();
      const upcoming = this.selectedStudentLessons
        .filter((lesson) => {
          return lesson.status === "scheduled" && new Date(lesson.scheduled_at) >= now;
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

      return upcoming[0] || null;
    },

    selectedLesson() {
      if (!this.selectedStudentLessons.length || !this.selectedLessonId) {
        return null;
      }

      return this.selectedStudentLessons.find((lesson) => {
        return lesson.id === this.selectedLessonId;
      }) || null;
    },

    upcomingTeacherLessons() {
      const now = new Date();

      return this.lessonSessions
        .filter((lesson) => {
          return lesson.status === "scheduled" && new Date(lesson.scheduled_at) >= now;
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },

    teacherFocusTitle() {
      const attentionStudent = this.teacherOverview.attentionStudents[0];

      if (attentionStudent) {
        return `${attentionStudent.name} most figyelmet kér`;
      }

      if (this.teacherOverview.inactiveStudents.length) {
        return "Van pár csendesebb diák";
      }

      if (this.teacherOverview.weakestTopic) {
        return `${this.teacherOverview.weakestTopic.label} lehet a mai fókusz`;
      }

      return "Kezdd egy gyors ellenőrzéssel";
    },

    teacherFocusText() {
      const attentionStudent = this.teacherOverview.attentionStudents[0];

      if (attentionStudent) {
        return `Érdemes ránézni: ${attentionStudent.reason}. Innen gyorsan tudsz jegyzetet írni vagy célzott feladatot adni.`;
      }

      if (this.teacherOverview.inactiveStudents.length) {
        return `${this.teacherOverview.inactiveStudents.join(", ")} nem volt aktív az elmúlt 7 napban.`;
      }

      if (this.teacherOverview.weakestTopic) {
        return `Az elmúlt 30 nap alapján ez a leggyengébb közös téma: ${this.teacherOverview.weakestTopic.accuracy}%.`;
      }

      return "Nyisd meg a diákkezelőt, vagy készíts egy rövid gyakorlófeladatot a következő órára.";
    },
  },

  async mounted() {
    await this.fetchStudents();

    if (this.initialSection) {
      await this.openTeacherSection(this.initialSection);
    }
  },

  watch: {
    async initialSection(section) {
      if (section) {
        await this.openTeacherSection(section);
      }
    },

    selectedWritingSubmission(submission) {
      this.writingReviewGrade = submission?.grade || "";
      this.writingReviewFeedback = submission?.teacher_feedback || "";
    },

    selectedTeacherMaterial(material) {
      this.selectedWritingSubmission =
        material?.kind === "submission" ? material.raw : null;
    },

    selectedLesson(lesson) {
      this.syncLessonWorkbookDraft(lesson);
    },
  },

  methods: {
    async openTeacherSection(section) {
      this.activeTeacherSection = section;

      if (section === "exercises" && !this.exerciseItems.length) {
        await this.fetchExerciseItems();
      }

      if (section === "writings" && !this.writingSubmissions.length) {
        await Promise.all([
          this.fetchWritingSubmissions(),
          this.fetchHomeworkAssignments(),
        ]);
      }
    },

    async openStudentFromOverview(studentId) {
      const student = this.students.find((item) => item.id === studentId);

      if (!student) return;

      this.activeTeacherSection = "students";
      await this.selectStudent(student);
    },

    async openLessonFromPortal(lesson) {
      const studentId = lesson.student_id || lesson.student?.id;
      const student = this.students.find((item) => item.id === studentId);

      if (!student) return;

      this.activeTeacherSection = "students";
      await this.selectStudent(student);
      this.selectedLessonId = lesson.id;
      this.syncLessonWorkbookDraft(lesson);
    },

    goToTeacherPortal() {
      this.activeTeacherSection = null;
      this.clearSelectedStudent();
      this.selectedWritingSubmission = null;
      this.resetExerciseForm();
    },

    async fetchStudents() {
      this.isLoading = true;

      try {
        this.students = await fetchTeacherStudents();
        this.selectedTeacherMaterialStudentId =
          this.selectedTeacherMaterialStudentId || this.students[0]?.id || "";
        await Promise.all([
          this.fetchTeacherOverview(),
          this.fetchWritingSubmissions(),
          this.fetchHomeworkAssignments(),
          this.fetchLessonSessions(),
        ]);
      } catch (error) {
        console.error("Hiba a diákok lekérésekor:", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTeacherOverview() {
      try {
        this.teacherOverview = await fetchTeacherOverview(this.students);
      } catch (error) {
        console.error("Tanári áttekintés lekérési hiba:", error.message);
      }
    },

    async fetchWritingSubmissions() {
      this.isWritingSubmissionsLoading = true;
      this.writingSubmissionSetupError = false;

      try {
        this.writingSubmissions = await fetchTeacherWritingSubmissions();
        this.selectedWritingSubmission = this.writingSubmissions[0] || null;
      } catch (error) {
        console.error("Beküldött írások lekérési hiba:", error.message);
        this.writingSubmissionSetupError = error.message?.includes("writing_submissions");
      } finally {
        this.isWritingSubmissionsLoading = false;
      }
    },

    async fetchHomeworkAssignments() {
      try {
        this.homeworkAssignments = await fetchTeacherHomeworkAssignments();

        if (
          this.selectedTeacherHomeworkKey !== "new" &&
          !this.homeworkAssignments.some((item) => item.id === this.selectedTeacherHomeworkKey)
        ) {
          this.selectedTeacherHomeworkKey = "new";
        }
      } catch (error) {
        console.error("Kiadott házik lekérési hiba:", error.message);
      }
    },

    async fetchLessonSessions() {
      this.isLessonSessionsLoading = true;
      this.lessonSessionSetupError = false;

      try {
        this.lessonSessions = await fetchTeacherLessonSessions();
        this.syncLessonWorkbookDraft(this.selectedLesson);
      } catch (error) {
        console.error("Online órák lekérési hiba:", error.message);
        this.lessonSessionSetupError = error.message?.includes("lesson_sessions");
      } finally {
        this.isLessonSessionsLoading = false;
      }
    },

    async saveHomeworkAssignment() {
      if (!this.canSaveHomework || this.isSavingHomework) return;

      this.isSavingHomework = true;

      try {
        const assignment = await createHomeworkAssignment({
          teacherId: this.currentTeacherId,
          studentId: this.newHomework.studentId,
          type: this.newHomework.type,
          practiceType:
            this.newHomework.type === "practice" ? this.newHomework.practiceType : null,
          title: this.newHomework.title,
          instructions: this.newHomework.instructions,
          expectedWordCount:
            this.newHomework.type === "writing"
              ? this.newHomework.expectedWordCount
              : null,
          targetCount:
            this.newHomework.type === "practice" ? this.newHomework.targetCount : null,
          dueAt: this.newHomework.dueAt
            ? new Date(this.newHomework.dueAt).toISOString()
            : null,
        });

        if (assignment) {
          await this.fetchHomeworkAssignments();
          this.selectedTeacherMaterialStudentId = assignment.student_id;
          this.selectedTeacherMaterialKey = `homework-${assignment.id}`;
          this.selectedTeacherHomeworkKey = "";
        }

        this.newHomework = {
          studentId: "",
          type: "writing",
          practiceType: "adjektiv",
          title: "",
          instructions: "",
          expectedWordCount: 120,
          targetCount: 10,
          dueAt: "",
        };
      } catch (error) {
        console.error("Házi kiadási hiba:", error.message);
        alert("Nem sikerült kiadni a házit.");
      } finally {
        this.isSavingHomework = false;
      }
    },

    async changeWritingSubmissionStatus(submission, status) {
      try {
        const updated = await updateWritingSubmissionStatus(submission.id, status);

        this.writingSubmissions = this.writingSubmissions.map((item) =>
          item.id === submission.id ? { ...item, status: updated.status } : item,
        );
        this.selectedWritingSubmission = {
          ...this.selectedWritingSubmission,
          status: updated.status,
        };
      } catch (error) {
        console.error("Beküldött írás státusz hiba:", error.message);
        alert("Nem sikerült módosítani a státuszt.");
      }
    },

    async saveWritingReview() {
      if (!this.selectedWritingSubmission || this.isSavingWritingReview) {
        return;
      }

      this.isSavingWritingReview = true;

      try {
        const updated = await reviewWritingSubmission(this.selectedWritingSubmission.id, {
          grade: this.writingReviewGrade,
          teacherFeedback: this.writingReviewFeedback,
        });

        this.writingSubmissions = this.writingSubmissions.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        this.selectedWritingSubmission = {
          ...this.selectedWritingSubmission,
          ...updated,
        };
      } catch (error) {
        console.error("Írás értékelési hiba:", error.message);
        alert("Nem sikerült menteni az értékelést.");
      } finally {
        this.isSavingWritingReview = false;
      }
    },

    getSubmissionStatusLabel(status) {
      const labels = {
        submitted: "Új beküldés",
        reviewing: "Javítás alatt",
        reviewed: "Javítva",
      };

      return labels[status] || "Beküldve";
    },

    getHomeworkStatusLabel(status) {
      const labels = {
        assigned: "Kiadva",
        opened: "Megnyitva",
        submitted: "Beküldve",
        reviewed: "Javítva",
      };

      return labels[status] || "Kiadva";
    },

    getHomeworkTypeLabel(assignment) {
      if (assignment.type === "practice") {
        return `Gyakorló: ${assignment.practice_type || "feladat"}`;
      }

      return "Fogalmazás / levélírás";
    },

    selectTeacherHomework(key) {
      this.selectedTeacherHomeworkKey = key;
    },

    selectTeacherMaterialStudent(studentId) {
      this.selectedTeacherMaterialStudentId = studentId;
      this.selectedTeacherHomeworkKey = "";
      this.selectedTeacherMaterialKey = "";
    },

    selectTeacherMaterial(item) {
      this.selectedTeacherMaterialKey = item.key;
      this.selectedTeacherHomeworkKey = "";
      this.selectedWritingSubmission = item.kind === "submission" ? item.raw : null;
    },

    openNewHomeworkForSelectedStudent() {
      this.selectedTeacherHomeworkKey = "new";
      this.selectedTeacherMaterialKey = "";
      this.newHomework.studentId = this.selectedTeacherMaterialStudent?.id || "";
    },

    async selectStudent(student) {
      this.selectedStudent = student;
      this.isStudentDataLoading = true;
      this.selectedLessonId = "";

      this.teacherNoteText = "";
      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
      this.studentAlerts = [];
      this.studentWeakTopics = [];
      this.studentTrend = {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      };

      this.studentStats = {
        accuracy: 0,
        totalDone: 0,
      };

      await Promise.all([
        this.fetchStudentNotes(student.id),
        this.fetchStudentFiles(student.id),
        this.fetchStudentResults(student.id),
      ]);

      this.selectedLessonId = this.selectedLesson?.id || "";
      this.syncLessonWorkbookDraft(this.selectedLesson);
      this.isStudentDataLoading = false;
    },

    clearSelectedStudent() {
      this.selectedStudent = null;
      this.selectedLessonId = "";
      this.teacherNoteText = "";
      this.studentNotes = [];
      this.studentFiles = [];
      this.studentResults = [];
      this.studentAlerts = [];
      this.studentWeakTopics = [];
      this.studentTrend = {
        direction: "neutral",
        label: "Még kevés adat",
        detail: "Oldj meg pár feladatot, és kirajzolódik a trend.",
        change: 0,
      };

      this.studentStats = {
        accuracy: 0,
        totalDone: 0,
      };
      this.syncLessonWorkbookDraft(null);
    },

    async fetchStudentNotes(studentId) {
      try {
        this.studentNotes = await fetchTeacherStudentNotes(studentId);
      } catch (error) {
        console.error("Diák jegyzetek lekérési hiba:", error.message);
      }
    },

    async sendTeacherNote() {
      if (!this.selectedStudent?.id || !this.teacherNoteText.trim()) {
        return;
      }

      this.isSendingTeacherNote = true;

      try {
        const note = await createTeacherNote(
          this.selectedStudent.id,
          this.teacherNoteText,
        );

        if (note) {
          this.studentNotes.unshift(note);
        }

        this.teacherNoteText = "";
      } catch (error) {
        console.error("Tanári jegyzet mentési hiba:", error.message);
        alert("Nem sikerült elküldeni a jegyzetet.");
      } finally {
        this.isSendingTeacherNote = false;
      }
    },

    selectLessonSession(lesson) {
      if (this.selectedLessonId === lesson.id) {
        this.closeSelectedLesson();
        return;
      }

      this.selectedLessonId = lesson.id;
      this.syncLessonWorkbookDraft(lesson);
    },

    closeSelectedLesson() {
      this.selectedLessonId = "";
      this.syncLessonWorkbookDraft(null);
    },

    syncLessonWorkbookDraft(lesson) {
      this.lessonWorkbookDraft = {
        sharedNotes: lesson?.shared_notes || "",
        vocabularyNotes: lesson?.vocabulary_notes || "",
        correctionsNotes: lesson?.corrections_notes || "",
        nextSteps: lesson?.next_steps || "",
      };
    },

    async scheduleLessonForSelectedStudent() {
      if (!this.selectedStudent?.id || !this.newLesson.scheduledAt || this.isSavingLesson) {
        return;
      }

      this.isSavingLesson = true;

      try {
        const lesson = await createLessonSession({
          teacherId: this.currentTeacherId,
          studentId: this.selectedStudent.id,
          scheduledAt: new Date(this.newLesson.scheduledAt).toISOString(),
          meetUrl: this.newLesson.meetUrl,
          topic: this.newLesson.topic,
          goal: this.newLesson.goal,
        });

        this.newLesson = {
          scheduledAt: "",
          meetUrl: "",
          topic: "",
          goal: "",
        };

        await this.fetchLessonSessions();

        if (lesson) {
          this.selectedLessonId = lesson.id;
          this.syncLessonWorkbookDraft(lesson);
        }
      } catch (error) {
        console.error("Óra ütemezési hiba:", error.message);
        alert("Nem sikerült ütemezni az órát.");
      } finally {
        this.isSavingLesson = false;
      }
    },

    async saveSelectedLessonWorkbook() {
      if (!this.selectedLesson?.id || this.isSavingLessonWorkbook) {
        return;
      }

      this.isSavingLessonWorkbook = true;

      try {
        const updated = await updateLessonWorkbook(
          this.selectedLesson.id,
          this.lessonWorkbookDraft,
        );

        this.lessonSessions = this.lessonSessions.map((lesson) =>
          lesson.id === updated.id ? { ...lesson, ...updated } : lesson,
        );
      } catch (error) {
        console.error("Munkafüzet mentési hiba:", error.message);
        alert("Nem sikerült menteni a munkafüzetet.");
      } finally {
        this.isSavingLessonWorkbook = false;
      }
    },

    async completeSelectedLesson() {
      if (!this.selectedLesson?.id) {
        return;
      }

      try {
        const updated = await updateLessonStatus(this.selectedLesson.id, "completed");

        this.lessonSessions = this.lessonSessions.map((lesson) =>
          lesson.id === updated.id ? { ...lesson, ...updated } : lesson,
        );
        this.closeSelectedLesson();
      } catch (error) {
        console.error("Óra lezárási hiba:", error.message);
        alert("Nem sikerült lezárni az órát.");
      }
    },

    getLessonStatusLabel(status) {
      const labels = {
        scheduled: "Ütemezve",
        completed: "Lezárva",
        cancelled: "Lemondva",
      };

      return labels[status] || "Óra";
    },

    getLessonDayLabel(dateValue) {
      if (!dateValue) {
        return "";
      }

      return new Intl.DateTimeFormat("hu-HU", {
        month: "short",
        day: "numeric",
      }).format(new Date(dateValue));
    },

    getLessonTimeLabel(dateValue) {
      if (!dateValue) {
        return "";
      }

      return new Intl.DateTimeFormat("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateValue));
    },

    async fetchStudentFiles(studentId) {
      try {
        this.studentFiles = await fetchTeacherStudentFiles(studentId);
      } catch (error) {
        console.error("Diák fájlok lekérési hiba:", error.message);
      }
    },

    async fetchStudentResults(studentId) {
      try {
        const { results, stats, alerts, weakTopics, trend } =
          await fetchTeacherStudentResults(studentId);

        this.studentResults = results;
        this.studentStats = stats;
        this.studentAlerts = alerts;
        this.studentWeakTopics = weakTopics;
        this.studentTrend = trend;
      } catch (error) {
        console.error("Diák statisztika lekérési hiba:", error.message);
      }
    },

    async fetchExerciseItems() {
      this.isExerciseItemsLoading = true;

      try {
        this.exerciseItems = await fetchTeacherExerciseItems(this.selectedExerciseType);
      } catch (error) {
        console.error("Feladatok lekérési hiba:", error.message);
      } finally {
        this.isExerciseItemsLoading = false;
      }
    },

    async selectExerciseType(type) {
      if (this.selectedExerciseType === type) return;

      this.selectedExerciseType = type;
      this.showBaseExercises = false;
      this.resetExerciseForm();
      await this.fetchExerciseItems();
    },

    buildExercisePayload() {
      if (this.selectedExerciseType === "perfekt") {
        return {
          verb: this.newExercise.verb.trim(),
          auxiliary: this.newExercise.auxiliary.trim() || "hat",
          pastParticiple: this.newExercise.pastParticiple.trim(),
          meaning: this.newExercise.meaning.trim(),
        };
      }

      if (this.selectedExerciseType === "nomen-verb") {
        return {
          nomen: this.newExercise.nomen.trim(),
          verb: this.newExercise.verb.trim(),
          meaning: this.newExercise.meaning.trim(),
          example: this.newExercise.example.trim(),
          translation: this.newExercise.translation.trim(),
        };
      }

      if (this.selectedExerciseType === "adjektiv") {
        return {
          context: this.newExercise.context.trim(),
          elements: {
            article: this.newExercise.article.trim(),
            adj: this.newExercise.adj.trim(),
            noun: this.newExercise.noun.trim(),
          },
          correct: this.newExercise.correct.trim(),
          case: this.newExercise.case.trim(),
          rule: this.newExercise.rule.trim(),
        };
      }

      if (this.selectedExerciseType === "praeposition") {
        return {
          verb: this.newExercise.verb.trim(),
          preposition: this.newExercise.preposition.trim(),
          caseType: this.newExercise.caseType.trim(),
          meaning: this.newExercise.meaning.trim(),
          example: this.newExercise.example.trim(),
          gapSentence: this.newExercise.gapSentence.trim(),
        };
      }

      if (this.selectedExerciseType === "sich-verben") {
        return {
          infinitive: this.newExercise.infinitive.trim(),
          sentence: this.newExercise.sentence.trim(),
          meaning: this.newExercise.meaning.trim(),
          answer: this.newExercise.answer.trim(),
          alternatives: this.newExercise.optionsText
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean),
          explanation: this.newExercise.explanation.trim(),
        };
      }

      return {
        category: this.newExercise.category.trim() || "egyéb",
        level: this.newExercise.level.trim() || "B1",
        sentence: this.newExercise.sentence.trim(),
        options: this.newExercise.optionsText
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
        correct: this.newExercise.correct.trim(),
        meaning: this.newExercise.meaning.trim(),
        explanation: this.newExercise.explanation.trim(),
        grammarTip: this.newExercise.grammarTip.trim(),
      };
    },

    getExerciseTitle(payload) {
      if (this.selectedExerciseType === "perfekt") {
        return payload.verb;
      }

      if (this.selectedExerciseType === "nomen-verb") {
        return payload.nomen;
      }

      if (this.selectedExerciseType === "adjektiv") {
        return `${payload.context} ${payload.correct}`;
      }

      if (this.selectedExerciseType === "praeposition") {
        return `${payload.verb} + ${payload.preposition}`;
      }

      if (this.selectedExerciseType === "sich-verben") {
        return payload.infinitive || payload.sentence;
      }

      return payload.sentence;
    },

    resetExerciseForm() {
      this.newExercise = {
        verb: "",
        auxiliary: "hat",
        pastParticiple: "",
        nomen: "",
        context: "",
        article: "",
        adj: "",
        noun: "",
        case: "",
        rule: "",
        preposition: "",
        caseType: "",
        example: "",
        gapSentence: "",
        level: "B1",
        category: "",
        sentence: "",
        optionsText: "",
        correct: "",
        meaning: "",
        explanation: "",
        grammarTip: "",
        translation: "",
        infinitive: "",
        answer: "",
      };

      this.editingExerciseId = null;
    },

    startExerciseEdit(item) {
      const payload = item?.payload || {};

      this.editingExerciseId = item.id;
      this.newExercise = {
        verb: payload.verb || "",
        auxiliary: payload.auxiliary || "hat",
        pastParticiple: payload.pastParticiple || "",
        nomen: payload.nomen || "",
        context: payload.context || "",
        article: payload.elements?.article || payload.article || "",
        adj: payload.elements?.adj || payload.adj || "",
        noun: payload.elements?.noun || payload.noun || "",
        case: payload.case || "",
        rule: payload.rule || "",
        preposition: payload.preposition || "",
        caseType: payload.caseType || "",
        example: payload.example || "",
        gapSentence: payload.gapSentence || "",
        level: payload.level || "B1",
        category: payload.category || "",
        sentence: payload.sentence || "",
        optionsText: Array.isArray(payload.options)
          ? payload.options.join(", ")
          : "",
        correct: payload.correct || "",
        meaning: payload.meaning || "",
        explanation: payload.explanation || "",
        grammarTip: payload.grammarTip || "",
        translation: payload.translation || "",
        infinitive: payload.infinitive || "",
        answer: payload.answer || "",
      };
    },

    cancelExerciseEdit() {
      this.resetExerciseForm();
    },

    async saveExercise() {
      if (!this.canSaveExercise) return;

      this.isExerciseSaving = true;

      try {
        const payload = this.buildExercisePayload();
        const title = this.getExerciseTitle(payload);

        if (this.editingExerciseId) {
          await updateExerciseItem(this.editingExerciseId, {
            type: this.selectedExerciseType,
            title,
            payload,
          });
        } else {
          await createExerciseItem({
            type: this.selectedExerciseType,
            title,
            payload,
          });
        }

        this.resetExerciseForm();
        await this.fetchExerciseItems();
      } catch (error) {
        console.error("Feladat mentési hiba:", error.message);
        alert("Nem sikerült menteni a feladatot.");
      } finally {
        this.isExerciseSaving = false;
      }
    },

    async deactivateExercise(itemId) {
      if (!itemId) return;

      const confirmed = confirm("Biztosan deaktiválod ezt a feladatot?");

      if (!confirmed) return;

      try {
        await deactivateExerciseItem(itemId);
        await this.fetchExerciseItems();
      } catch (error) {
        console.error("Feladat deaktiválási hiba:", error.message);
        alert("Nem sikerült deaktiválni a feladatot.");
      }
    },

    getExercisePrimaryText(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") return payload.verb || item.title;
      if (item.type === "nomen-verb") return payload.nomen || item.title;
      if (item.type === "adjektiv") {
        return `${payload.context || ""} ${payload.correct || item.title}`.trim();
      }
      if (item.type === "praeposition") {
        return `${payload.verb || ""} + ${payload.preposition || ""}`.trim() || item.title;
      }
      if (item.type === "sich-verben") {
        return payload.infinitive || item.title;
      }

      return payload.sentence || item.title;
    },

    getExerciseSecondaryText(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") {
        return `${payload.auxiliary || ""} ${payload.pastParticiple || ""} · ${payload.meaning || ""}`;
      }
      if (item.type === "nomen-verb") {
        return `${payload.verb || "-"} · ${payload.meaning || ""}`;
      }
      if (item.type === "adjektiv") {
        return `${payload.case || "-"} · ${payload.rule || ""}`;
      }
      if (item.type === "praeposition") {
        return `${payload.caseType || "-"} · ${payload.gapSentence || ""}`;
      }
      if (item.type === "sich-verben") {
        return `${payload.sentence || ""} · válasz: ${payload.answer || "-"}`;
      }

      return `Helyes válasz: ${payload.correct || "-"}`;
    },

    getExerciseMeta(item) {
      const payload = item?.payload || {};

      if (item.type === "perfekt") return payload.auxiliary || "";
      if (item.type === "nomen-verb") return payload.verb || "";
      if (item.type === "adjektiv") return payload.case || "";
      if (item.type === "praeposition") return payload.caseType || "";
      if (item.type === "sich-verben") return payload.answer || "";

      return payload.category || payload.level || "";
    },

    getInitial(name) {
      return name?.trim()?.charAt(0)?.toUpperCase() || "S";
    },

    formatDate,
    getTaskName,
  },
};
</script>
