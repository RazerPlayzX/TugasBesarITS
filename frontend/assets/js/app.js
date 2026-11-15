import { showReward } from './reward-dialog.js';
import { createDemoSession } from "./session.js";
import { createNavigation } from "./navigation.js";
import { renderDashboard } from "./dashboard.js";
import { validateLearningInput, scoreError } from "./validation.js";
import { questProgress } from "./gamification.js";
import {
  loadState,
  saveState,
  clearState,
  emptyState,
  profileFromState,
  startQuest,
} from "./state.js";
import { recommendationService } from "./services/recommendation-service.js";
import {
  byId,
  element,
  button,
  renderResults,
  renderState,
  renderValidation,
  showFeedback,
  courseRows,
  adaptationRow,
} from "./ui.js";

const session = createDemoSession();
const navigation = createNavigation(session);
const loaded = loadState();
let state = loaded.state;
let currentResult = null;
let nextResult = null;
let lastRequest = null;
let requestVersion = 0;
let completionVersion = 0;
let completionBusy = false;
let pendingQuest = null;
let searchBusy = false;

function storageNotice(message) {
  byId("storage-notice").hidden = !message;
  byId("storage-notice").textContent = message;
}

function commit(newState) {
  state = newState;
  const saved = saveState(state);
  storageNotice(
    saved
      ? ""
      : "Browser tidak mengizinkan penyimpanan. Progres tetap bisa digunakan pada sesi ini, tetapi tidak tersimpan setelah halaman ditutup.",
  );
  renderState(state, session.user());
  renderDashboard(state);
}

function setSearchBusy(busy) {
  searchBusy = busy;
  byId("search-button").disabled = busy;
  byId("search-button").querySelector("span").textContent = busy
    ? "Memuat rekomendasi…"
    : "Cari rekomendasi";
}

async function search(request) {
  if (searchBusy) return;
  const version = ++requestVersion;
  lastRequest = request;
  currentResult = null;
  pendingQuest = null;
  setSearchBusy(true);
  renderResults(null, { loading: true });
  byId("search-status").textContent = "Sedang memuat contoh rekomendasi.";
  try {
    let result = await recommendationService.recommend(request, {
      completedIds: profileFromState(state).completedIds,
      mode: byId("demo-mode").value,
    });
    if (version !== requestVersion) return;
    // Riwayat dapat berubah ketika respons pencarian lambat masih ditunggu.
    const completedNow = profileFromState(state).completedIds;
    const eligible = result.courses.filter(
      (course) => !completedNow.includes(course.course_id),
    );
    if (eligible.length !== result.courses.length) {
      result = {
        ...result,
        courses: eligible,
        status: eligible.length ? "success" : "empty",
        message: eligible.length
          ? result.message
          : "Seluruh kandidat pada contoh ini sudah kamu selesaikan. Cari skenario lain untuk melanjutkan belajar.",
      };
    }
    currentResult = result;
    renderResults(result);
    byId("search-status").textContent =
      `${result.courses.length} kandidat. ${result.adaptation.quest_type}, level sasaran ${result.adaptation.target_level}. ${result.message}`;
  } catch (error) {
    if (version !== requestVersion) return;
    renderResults(null, { error: error.message });
    byId("search-status").textContent = error.message;
  } finally {
    if (version === requestVersion) {
      setSearchBusy(false);
      // Hasil tidak mengambil fokus jika pengguna sudah pindah ke halaman lain.
      if (!byId("view-rekomendasi").hidden)
        byId("results-title").focus({ preventScroll: true });
    }
  }
}

byId("learning-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const { errors, value } = validateLearningInput({
    topic: byId("topic").value,
    ability: byId("ability").value,
    score: byId("score").value,
  });
  renderValidation(errors);
  if (!Object.keys(errors).length) search(value);
});

const PRESETS = {
  python: { topic: "python programming", ability: "Intermediate", score: 45 },
  ml: { topic: "machine learning", ability: "Intermediate", score: 70 },
  sql: { topic: "sql database", ability: "Intermediate", score: 90 },
};
document.querySelectorAll("[data-preset]").forEach((node) =>
  node.addEventListener("click", () => {
    const preset = PRESETS[node.dataset.preset];
    Object.entries(preset).forEach(([id, value]) => {
      byId(id).value = value;
    });
    renderValidation({});
    byId("search-button").focus();
  }),
);

function activateQuest(result, courses) {
  let newState;
  try {
    newState = startQuest(state, result, courses);
  } catch (error) {
    pendingQuest = null;
    document.querySelector(".quest-replacement")?.remove();
    showFeedback(error.message);
    byId("feedback").tabIndex = -1;
    byId("feedback").focus();
    return;
  }
  // Abaikan respons asinkron yang masih berjalan dari quest sebelumnya.
  completionVersion++;
  completionBusy = false;
  commit(newState);
  pendingQuest = null;
  nextResult = null;
  byId("next-recommendations").replaceChildren();
  byId("next-recommendations").hidden = true;
  document.querySelector(".quest-replacement")?.remove();
  showFeedback(
    `Quest ${state.quest.quest_type} dimulai dengan ${state.quest.courses.length} materi. Progres dihitung dari daftar ini.`,
  );
  navigation.go("quest");
}

function requestQuest(result, courses, trigger) {
  if (!result || !courses.length) return;
  const progress = questProgress(
    state.quest,
    profileFromState(state).completedIds,
  );
  if (state.quest && progress.percent < 100) {
    pendingQuest = { result, courses, trigger };
    document.querySelector(".quest-replacement")?.remove();
    const confirmation = element("div", "notice warning quest-replacement");
    confirmation.tabIndex = -1;
    confirmation.append(
      element(
        "p",
        "",
        "Quest aktif belum selesai. Ganti daftar belajarnya dengan kandidat ini? XP dan riwayat tetap tersimpan.",
      ),
      button("Ya, ganti quest", "confirm-quest", "button primary"),
      button("Pertahankan quest", "cancel-quest"),
    );
    trigger
      .closest(".course-actions, .result-actions, .next-recommendations")
      .append(confirmation);
    confirmation.focus();
  } else activateQuest(result, courses);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "continue-learning") {
    const next = state.quest?.courses.find(
      (course) =>
        !profileFromState(state).completedIds.includes(course.course_id),
    );
    navigation.go("quest");
    if (next) {
      const row = [
        ...byId("quest-content").querySelectorAll("[data-course-id]"),
      ].find((node) => node.dataset.courseId === next.course_id);
      const title = row?.querySelector("h3");
      if (title) {
        title.tabIndex = -1;
        title.focus();
      }
    }
  }
  if (action === "retry" && lastRequest) search(lastRequest);
  if (action === "start-all")
    requestQuest(currentResult, currentResult?.courses || [], target);
  if (action === "start-next")
    requestQuest(nextResult, nextResult?.courses || [], target);
  if (action === "start-single") {
    const result =
      target.dataset.prefix === "next" ? nextResult : currentResult;
    requestQuest(
      result,
      result?.courses.filter(
        (course) => course.course_id === target.dataset.courseId,
      ) || [],
      target,
    );
  }
  if (action === "confirm-quest" && pendingQuest)
    activateQuest(pendingQuest.result, pendingQuest.courses);
  if (action === "cancel-quest") {
    const trigger = pendingQuest?.trigger;
    pendingQuest = null;
    target.closest(".quest-replacement").remove();
    trigger?.focus();
  }
  if (action === "open-completion" || action === "cancel-completion") {
    const form = byId(`complete-${target.dataset.courseId}`);
    const open = action === "open-completion";
    form.hidden = !open;
    const toggle = form.parentElement.querySelector(
      '[data-action="open-completion"]',
    );
    toggle.setAttribute("aria-expanded", String(open));
    if (open) form.querySelector("input").focus();
    else toggle.focus();
  }
});

async function showNextRecommendations(request, version) {
  const container = byId("next-recommendations");
  container.hidden = false;
  container.replaceChildren(
    element("h2", "", "Rekomendasi berikutnya"),
    element("p", "", "Menyiapkan kandidat terpisah dari quest aktif…"),
  );
  try {
    const result = await recommendationService.recommend(request, {
      completedIds: profileFromState(state).completedIds,
    });
    if (version !== completionVersion) return;
    nextResult = result;
    container.replaceChildren(
      element("h2", "", "Rekomendasi berikutnya"),
      adaptationRow(result),
      element(
        "p",
        "",
        `${result.message} Quest aktif dan penyebut progres tidak berubah.`,
      ),
    );
    if (result.courses.length)
      container.append(
        courseRows(result.courses, { prefix: "next" }),
        button(
          `Mulai quest berikutnya · ${result.courses.length} materi`,
          "start-next",
          "button primary",
        ),
      );
  } catch (error) {
    if (version === completionVersion)
      container.replaceChildren(
        element("h2", "", "Rekomendasi berikutnya"),
        element(
          "p",
          "",
          `Penyelesaian tetap tersimpan. Kandidat berikutnya belum dimuat: ${error.message}`,
        ),
      );
  }
}

byId("quest-content").addEventListener("submit", async (event) => {
  const form = event.target.closest(".completion-form");
  if (!form) return;
  event.preventDefault();
  if (completionBusy) return;
  const input = form.elements.score;
  const error = scoreError(input.value);
  const errorNode = byId(`${input.id}-error`);
  errorNode.textContent = error;
  input.setAttribute("aria-invalid", String(Boolean(error)));
  if (error) {
    input.focus();
    return;
  }
  const score = Number(input.value);
  completionBusy = true;
  const version = ++completionVersion;
  form.querySelector('button[type="submit"]').disabled = true;
  try {
    const beforeCompletion = state;
    const result = await recommendationService.complete(state, {
      course_id: form.dataset.courseId,
      score,
    });
    if (version !== completionVersion) return;
    commit(result.state);
    const profile = profileFromState(state);
    const progress = questProgress(state.quest, profile.completedIds);
    showFeedback(
      result.duplicate
        ? "Penyelesaian sudah tercatat; XP tidak ditambah."
        : `Materi selesai. +${result.xp_awarded} XP · ${progress.completed} dari ${progress.total} materi selesai. Pencapaianmu diperbarui di halaman Pencapaian.`,
    );
    byId("feedback").tabIndex = -1;
    byId("feedback").focus();
    if (!result.duplicate) showReward(beforeCompletion, result, form.dataset.courseId);
    // Hapus kandidat selesai tanpa mengubah daftar quest aktif.
    if (currentResult) {
      currentResult = {
        ...currentResult,
        courses: currentResult.courses.filter(
          (course) => !profile.completedIds.includes(course.course_id),
        ),
      };
      renderResults(currentResult);
    }
    await showNextRecommendations(
      { topic: state.quest.topic, ability: state.quest.target_level, score },
      version,
    );
  } catch (failure) {
    if (version === completionVersion) {
      errorNode.textContent = failure.message;
      form.querySelector('button[type="submit"]').disabled = false;
    }
  } finally {
    if (version === completionVersion) completionBusy = false;
  }
});

byId("reset-demo").addEventListener("click", () => {
  byId("reset-confirmation").hidden = false;
  byId("confirm-reset").focus();
});
byId("cancel-reset").addEventListener("click", () => {
  byId("reset-confirmation").hidden = true;
  byId("reset-demo").focus();
});
byId("confirm-reset").addEventListener("click", () => {
  requestVersion++;
  completionVersion++;
  completionBusy = false;
  pendingQuest = null;
  state = emptyState();
  const cleared = clearState();
  storageNotice(
    cleared
      ? ""
      : "Penyimpanan browser tidak dapat diakses. Sesi ini sudah direset, tetapi data lama di penyimpanan belum dapat dihapus.",
  );
  currentResult = null;
  nextResult = null;
  lastRequest = null;
  setSearchBusy(false);
  byId("learning-form").reset();
  byId("demo-mode").value = "normal";
  renderValidation({});
  renderResults(null);
  renderState(state, session.user());
  renderDashboard(state);
  byId("next-recommendations").hidden = true;
  byId("next-recommendations").replaceChildren();
  byId("reset-confirmation").hidden = true;
  byId("search-status").textContent = "";
  showFeedback(
    "Demo direset. Quest kosong, 0 XP, dan belum ada badge. Data situs lain tidak dihapus.",
  );
  navigation.go("beranda");
});

function updateSessionNotice() {
  byId("session-notice").textContent = session.notice();
  byId("session-notice").hidden = !session.notice();
}

byId("enter-demo").addEventListener("click", () => {
  session.enter();
  renderState(state, session.user());
  updateSessionNotice();
  storageNotice(session.notice() || loaded.notice);
  navigation.go("beranda");
});
byId("exit-demo").addEventListener("click", () => {
  // Respons tertunda dari sesi yang ditutup tidak boleh mengubah progres.
  requestVersion++;
  completionVersion++;
  completionBusy = false;
  pendingQuest = null;
  setSearchBusy(false);
  renderResults(currentResult);
  renderState(state, session.user());
  renderDashboard(state);
  document.querySelector(".quest-replacement")?.remove();
  byId("next-recommendations").hidden = true;
  byId("feedback").hidden = true;
  byId("reset-confirmation").hidden = true;
  session.exit();
  updateSessionNotice();
  navigation.go("login");
});

renderState(state, session.user());
renderDashboard(state);
renderResults(null);
storageNotice(loaded.notice);
updateSessionNotice();
navigation.render();
