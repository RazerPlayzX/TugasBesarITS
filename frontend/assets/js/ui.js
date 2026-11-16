import { DEMO_USER } from './session.js';
import { createCarousel } from './carousel.js';
import {
  BADGES,
  ACTIVITY_THRESHOLDS,
  activityLevel,
  questProgress,
} from "./gamification.js";
import { profileFromState } from "./state.js";
import { safeCourseUrl } from "./validation.js";

export const byId = (id) => document.getElementById(id);
export const element = (tag, className = "", text = "") => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
};

function icon(kind) {
  const paths = {
    external: "M7 3h6v6M13 3 5 11M3 5v8h8",
    check: "m4 12 5 5L20 6",
    badge: "m12 3 3 3 4 1v5l-3 4-4 2-4-2-3-4V7l4-1Zm-4 13-1 6 5-3 5 3-1-6",
  };
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", kind === "external" ? "0 0 16 16" : "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", paths[kind]);
  svg.append(path);
  return svg;
}

export function button(text, action, className = "button secondary") {
  const node = element("button", className, text);
  node.type = "button";
  node.dataset.action = action;
  return node;
}

export function routeLink(text, route, className = "button secondary") {
  const link = element("a", className, text);
  link.href = `#${route}`;
  return link;
}

function courseLink(course) {
  const url = safeCourseUrl(course.url);
  if (!url) return element("span", "hint", "Tautan materi belum tersedia.");
  const link = element("a", "course-link", "Buka materi");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `Buka materi ${course.title} (tab baru)`);
  link.append(icon("external"));
  return link;
}

function descriptionExcerpt(text) {
  if (typeof text !== "string" || !text.trim()) return "";
  const plain = text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 175
    ? `${plain.slice(0, 175).replace(/\s+\S*$/, "")}…`
    : plain;
}

export function emptyPanel(title, message, link = null) {
  const node = element("div", "empty-state");
  node.append(element("h3", "", title), element("p", "", message));
  if (link) node.append(link);
  return node;
}

export function progressBar(progress, label) {
  const wrap = element("div");
  const caption = element("div", "progress-label");
  caption.append(
    element("span", "", label),
    element("strong", "", `${progress.percent.toLocaleString("id-ID")}%`),
  );
  const bar = element("progress");
  bar.max = 100;
  bar.value = progress.percent;
  bar.setAttribute("aria-label", label);
  wrap.append(caption, bar);
  return wrap;
}

export function courseRows(
  courses,
  { mode = "results", state = null, prefix = "candidate" } = {},
) {
  const list = element(
    "ol",
    `course-list ${mode === "quest" ? "quest-list" : ""}`,
  );
  const completed = state ? profileFromState(state).completedIds : [];
  courses.forEach((course, index) => {
    const done = completed.includes(course.course_id);
    const row = element("li", "course-row");
    row.dataset.courseId = course.course_id;
    const number = element(
      "span",
      `course-index${done ? " done" : ""}`,
      done ? "" : String(index + 1).padStart(2, "0"),
    );
    number.setAttribute("aria-hidden", "true");
    if (done) number.append(icon("check"));
    const body = element("div");
    body.append(
      element("span", "tag", course.difficulty || "Level belum tersedia"),
    );
    if (mode === "quest")
      body.append(
        element("span", "tag", done ? "Sudah selesai" : "Belum selesai"),
      );
    const title = element("h3", "", course.title);
    title.lang = "en";
    body.append(title);
    if (course.provider)
      body.append(element("p", "course-provider", course.provider));
    const excerpt = descriptionExcerpt(course.description);
    if (excerpt) {
      const p = element("p", "course-description", excerpt);
      p.lang = "en";
      body.append(p);
    }
    if (course.description && course.description.length > 175) {
      const details = element('details', 'course-detail');
      const full = element('p', '', course.description.replace(/<[^>]*>/g, ' '));
      full.lang = 'en';
      details.append(element('summary', '', 'Baca deskripsi lengkap'), full);
      body.append(details);
    }
    const meta = element("div", "course-meta");
    meta.append(
      element(
        "span",
        "",
        `Rating: ${course.rating != null && String(course.rating).trim() ? course.rating : "Belum tersedia"}`,
      ),
    );
    if (Number.isFinite(course.cosine_similarity))
      meta.append(
        element(
          "span",
          "",
          `Kemiripan teks (cosine): ${course.cosine_similarity.toFixed(3)}`,
        ),
      );
    body.append(meta);
    const actions = element("div", "course-actions");
    actions.append(courseLink(course));
    if (mode === "results") {
      const start = button("Mulai dari materi ini", "start-single");
      start.dataset.courseId = course.course_id;
      start.dataset.prefix = prefix;
      actions.append(start);
    } else if (!done) {
      const complete = button("Catat penyelesaian", "open-completion");
      complete.dataset.courseId = course.course_id;
      complete.setAttribute("aria-expanded", "false");
      complete.setAttribute("aria-controls", `complete-${course.course_id}`);
      actions.append(complete);
    } else {
      const entry = state.history.find(
        (item) => item.course_id === course.course_id,
      );
      actions.append(
        element("span", "hint", `Tercatat · nilai simulasi ${entry.score}`),
      );
    }
    body.append(actions);
    if (mode === "quest" && !done) body.append(completionForm(course));
    row.append(number, body);
    list.append(row);
  });
  return mode === "results" && courses.length ? createCarousel(list) : list;
}

function completionForm(course) {
  const form = element("form", "completion-form");
  form.id = `complete-${course.course_id}`;
  form.dataset.courseId = course.course_id;
  form.noValidate = true;
  form.hidden = true;
  const inputId = `quiz-${course.course_id}`;
  const label = element("label", "", "Nilai kuis mandiri setelah belajar");
  label.htmlFor = inputId;
  const input = element("input");
  Object.assign(input, {
    id: inputId,
    name: "score",
    type: "number",
    min: "0",
    max: "100",
    step: "any",
    required: true,
    placeholder: "0–100",
  });
  input.inputMode = "decimal";
  input.setAttribute("aria-describedby", `${inputId}-error ${inputId}-hint`);
  const actions = element("div", "input-actions");
  const submit = button(
    "Simpan penyelesaian",
    "submit-completion",
    "button primary",
  );
  submit.type = "submit";
  const cancel = button("Batal", "cancel-completion");
  cancel.dataset.courseId = course.course_id;
  actions.append(input, submit, cancel);
  const error = element("p", "field-error");
  error.id = `${inputId}-error`;
  error.setAttribute("role", "alert");
  const hint = element(
    "p",
    "hint",
    "Simpan setelah mempelajari materi. Membuka tautan saja tidak menandai selesai.",
  );
  hint.id = `${inputId}-hint`;
  form.append(label, actions, error, hint);
  return form;
}

export function renderResults(result, { loading = false, error = null } = {}) {
  const content = byId("results-content");
  content.replaceChildren();
  byId("results-region").setAttribute("aria-busy", String(loading));
  byId("result-count").textContent = loading
    ? "Sedang memuat"
    : result?.courses.length
      ? `${result.courses.length} kandidat`
      : result
        ? "0 kandidat"
        : "Belum ada pencarian";
  if (loading) {
    const node = element("div", "loading-state");
    node.append(
      element("span", "spinner"),
      element("span", "", "Menghitung rekomendasi…"),
    );
    content.append(node);
    return;
  }
  if (error) {
    content.append(
      emptyPanel(
        "Data belum berhasil dimuat",
        error,
        button("Coba lagi", "retry"),
      ),
    );
    return;
  }
  if (!result) {
    content.append(
      emptyPanel(
        "Materi yang tepat dimulai dari kebutuhanmu.",
        "Isi form di atas atau coba skenario Python. Kandidat materi akan tampil di sini sebelum kamu memulai quest.",
      ),
    );
    return;
  }
  content.append(adaptationRow(result));
  if (!result.courses.length) {
    content.append(
      emptyPanel(
        result.status === "unsupported"
          ? "Topik di luar skenario demo"
          : "Belum ada kandidat sesuai kebutuhanmu",
        result.message,
      ),
    );
    return;
  }
  content.append(
    element("p", "source-note", result.message),
    courseRows(result.courses),
  );
  const action = element("div", "result-actions");
  action.append(
    button(
      `Mulai quest · ${result.courses.length} materi`,
      "start-all",
      "button primary",
    ),
    element(
      "p",
      "",
      "Urutan ini adalah rekomendasi prototipe, bukan relasi prasyarat. Skor cosine adalah kemiripan teks, bukan akurasi atau kemampuanmu.",
    ),
  );
  content.append(action);
}

export function adaptationRow(result) {
  const row = element("div", "adaptation");
  row.append(
    element("span", "tag", result.adaptation.quest_type),
    element(
      "span",
      "hint",
      `Level sasaran: ${result.adaptation.target_level} · Nilai kuis: ${result.request.score}`,
    ),
  );
  return row;
}

export function renderState(state, user = DEMO_USER) {
  const account = user || DEMO_USER;
  byId("account-name").textContent = account.name;
  byId("account-name").title = account.name;
  byId("account-avatar").textContent = account.name.trim().slice(0, 1).toUpperCase();
  const profile = profileFromState(state);
  const progress = state.progress ?? questProgress(state.quest, profile.completedIds);
  const level = profile.level ?? activityLevel(profile.xp);
  byId("sidebar-level").textContent = `Level Aktivitas ${level}`;
  byId("sidebar-xp").textContent = `${profile.xp} XP`;
  byId("nav-quest-count").textContent = String(
    progress.total - progress.completed,
  );
  renderQuestPreview(state, progress);
  renderQuest(state, progress);
  renderProgress(state, profile, progress, level);
}

function renderQuestPreview(state, progress) {
  const container = byId("quest-preview-content");
  container.replaceChildren();
  if (!state.quest) {
    container.append(
      element("h3", "", "Ruang untuk langkah pertamamu"),
      element(
        "p",
        "",
        "Pilih rekomendasi, lalu mulai quest untuk menyimpan daftar belajarmu.",
      ),
    );
    const track = element("div", "empty-track");
    track.setAttribute("aria-hidden", "true");
    for (let i = 1; i <= 3; i++) {
      if (i > 1) track.append(element("i"));
      track.append(element("span", "", String(i)));
    }
    container.append(track, element("p", "", "Belum ada quest aktif"));
  } else {
    container.append(
      element("span", "tag", state.quest.quest_type),
      element("h3", "", state.quest.topic),
      progressBar(
        progress,
        `${progress.completed} dari ${progress.total} materi selesai`,
      ),
      routeLink("Lanjutkan quest", "quest"),
    );
  }
}

function renderQuest(state, progress) {
  const container = byId("quest-content");
  container.replaceChildren();
  if (!state.quest) {
    container.append(
      emptyPanel(
        "Quest pertamamu belum dimulai.",
        "Cari materi sesuai kebutuhanmu, lalu pilih Mulai quest. Daftar ini tetap tersimpan saat kamu mencari rekomendasi berikutnya.",
        routeLink("Cari rekomendasi", "rekomendasi", "button primary"),
      ),
    );
    return;
  }
  const header = element("div", "quest-header");
  header.append(
    element(
      "span",
      "tag",
      `${state.quest.quest_type} · ${state.quest.target_level}`,
    ),
    element("h2", "", state.quest.topic),
    element(
      "p",
      "",
      "Urutan rekomendasi, bukan prasyarat pedagogis. Membuka materi tidak otomatis menyelesaikannya.",
    ),
    progressBar(
      progress,
      `${progress.completed} dari ${progress.total} materi selesai`,
    ),
  );
  if (progress.percent === 100)
    header.append(
      element(
        "p",
        "",
        "Quest selesai. Kamu dapat memulai quest baru dari rekomendasi berikutnya.",
      ),
    );
  container.append(
    header,
    courseRows(state.quest.courses, { mode: "quest", state }),
  );
}

function renderProgress(state, profile, progress, level) {
  const container = byId("progress-content");
  container.replaceChildren();
  const overview = element("div", "progress-overview");
  const xp = element("section", "xp-panel");
  xp.append(
    element("h2", "", `Level Aktivitas ${level}`),
    element("strong", "", `${profile.xp} XP`),
    element(
      "p",
      "",
      "XP mencatat aktivitas. Bukan level kemampuan atau tingkat kesulitan kursus.",
    ),
  );
  const nextThreshold = ACTIVITY_THRESHOLDS[level];
  const percent = nextThreshold
    ? ((profile.xp - ACTIVITY_THRESHOLDS[level - 1]) /
        (nextThreshold - ACTIVITY_THRESHOLDS[level - 1])) *
      100
    : 100;
  xp.append(
    progressBar(
      { percent },
      nextThreshold
        ? `${nextThreshold - profile.xp} XP menuju Level Aktivitas ${level + 1}`
        : "Level aktivitas tertinggi tercapai",
    ),
  );
  const detail = element("section", "progress-detail");
  detail.append(
    element("h2", "", "Progres quest aktif"),
    element("p", "", state.quest?.topic || "Belum ada quest aktif"),
    progressBar(
      progress,
      `${progress.completed} dari ${progress.total} materi`,
    ),
    element(
      "p",
      "",
      `${profile.completedIds.length} materi selesai di seluruh riwayat belajar.`,
    ),
  );
  overview.append(xp, detail);
  container.append(overview, element("h2", "", "Pencapaian belajar"));
  const badges = element("div", "badge-grid");
  BADGES.forEach((badge) => {
    const earned = profile.badges.includes(badge.name);
    const item = element("section", `badge-item${earned ? " earned" : ""}`);
    item.append(
      icon("badge"),
      element("h3", "", badge.name),
      element("p", "", badge.description),
      element("span", "", earned ? "Sudah diperoleh" : "Belum diperoleh"),
    );
    badges.append(item);
  });
  container.append(badges, element("h2", "", "Riwayat belajar"));
  if (!state.history.length)
    container.append(
      emptyPanel(
        "Belum ada materi yang selesai.",
        "Pencapaian pertama akan muncul setelah kamu mencatat penyelesaian materi dalam quest.",
      ),
    );
  else {
    const list = element("ul", "history-list");
    [...state.history].reverse().forEach((entry) => {
      const li = element("li");
      const label = element("div", "", entry.title);
      label.append(
        element("small", "", `${entry.topic} · Nilai mandiri ${entry.score}`),
      );
      // XP per riwayat berasal dari aturan terpusat melalui perbedaan profil satu entri.
      li.append(
        label,
        element(
          "strong",
          "",
          `+${profileFromState({ history: [entry] }).xp} XP`,
        ),
      );
      list.append(li);
    });
    container.append(list);
  }
}

export function showFeedback(message) {
  byId("feedback").hidden = false;
  byId("feedback").textContent = message;
}

export function renderValidation(errors) {
  const summary = byId("form-errors");
  summary.replaceChildren();
  for (const id of ["topic", "ability", "score"]) {
    const error = byId(`${id}-error`);
    error.hidden = !errors[id];
    error.textContent = errors[id] || "";
    byId(id).setAttribute("aria-invalid", String(Boolean(errors[id])));
  }
  summary.hidden = !Object.keys(errors).length;
  if (!summary.hidden) {
    summary.append(element("strong", "", "Periksa kembali isianmu."));
    const list = element("ul");
    Object.entries(errors).forEach(([id, message]) => {
      const li = element("li");
      const link = element("a", "", message);
      link.href = `#${id}`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        byId(id).focus();
      });
      li.append(link);
      list.append(li);
    });
    summary.append(list);
    summary.focus();
  }
}
