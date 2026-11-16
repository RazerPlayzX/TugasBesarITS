import { completionReward } from "./gamification.js";
import { ABILITY_LEVELS, scoreError } from "./validation.js";

export const STORAGE_KEY = "alur.its.demo.v1";
export const SCHEMA_VERSION = 1;
export const emptyState = () => ({
  schema_version: SCHEMA_VERSION,
  quest: null,
  history: [],
});

export function profileFromState(state) {
  if (state.profile) return state.profile;
  const badges = new Set();
  let xp = 0;
  for (const entry of state.history) {
    const reward = completionReward(entry.score);
    xp += reward.xp;
    reward.badges.forEach((badge) => badges.add(badge));
  }
  return {
    xp,
    badges: [...badges],
    completedIds: state.history.map((entry) => entry.course_id),
  };
}

function validStoredState(value) {
  if (
    !value ||
    value.schema_version !== SCHEMA_VERSION ||
    !Array.isArray(value.history)
  )
    return false;
  const ids = new Set();
  for (const entry of value.history) {
    if (
      !entry ||
      typeof entry.course_id !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.topic !== "string" ||
      typeof entry.score !== "number" ||
      scoreError(entry.score) ||
      ids.has(entry.course_id)
    )
      return false;
    ids.add(entry.course_id);
  }
  if (value.quest === null) return true;
  const quest = value.quest;
  return (
    quest &&
    typeof quest.topic === "string" &&
    ABILITY_LEVELS.includes(quest.target_level) &&
    ["Remedial", "Improvement", "Mastery"].includes(quest.quest_type) &&
    Array.isArray(quest.courses) &&
    quest.courses.length > 0 &&
    new Set(quest.courses.map((course) => course?.course_id)).size ===
      quest.courses.length &&
    quest.courses.every(
      (course) =>
        course &&
        typeof course.course_id === "string" &&
        typeof course.title === "string" &&
        typeof course.url === "string" &&
        ABILITY_LEVELS.includes(course.difficulty),
    )
  );
}

export function loadState(storage) {
  try {
    const raw = (storage ?? window.localStorage).getItem(STORAGE_KEY);
    if (!raw) return { state: emptyState(), notice: "" };
    const value = JSON.parse(raw);
    if (!validStoredState(value)) throw new Error("Invalid demo state");
    return { state: value, notice: "" };
  } catch {
    return {
      state: emptyState(),
      notice:
        "Progres tersimpan tidak dapat dibaca. Sesi dimulai dari keadaan kosong; jika penyimpanan diblokir, progres hanya bertahan selama halaman ini terbuka.",
    };
  }
}

export function saveState(state, storage) {
  try {
    (storage ?? window.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearState(storage) {
  try {
    (storage ?? window.localStorage).removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function startQuest(state, result, courses = result.courses) {
  const completed = profileFromState(state).completedIds;
  const eligible = courses.filter(
    (course) => !completed.includes(course.course_id),
  );
  if (!eligible.length)
    throw new Error("Semua kandidat ini sudah selesai. Cari rekomendasi lain.");
  return {
    ...state,
    quest: {
      topic: result.request.topic,
      ...result.adaptation,
      courses: structuredClone(eligible),
    },
  };
}

export function recordCompletion(state, courseId, score) {
  const course = state.quest?.courses.find(
    (item) => item.course_id === courseId,
  );
  if (!course) throw new Error("Materi bukan bagian dari quest aktif.");
  const reward = completionReward(score);
  if (profileFromState(state).completedIds.includes(courseId))
    return { state, xp_awarded: 0, duplicate: true };
  const entry = {
    course_id: courseId,
    title: course.title,
    topic: state.quest.topic,
    score,
  };
  return {
    state: { ...state, history: [...state.history, entry] },
    xp_awarded: reward.xp,
    duplicate: false,
  };
}
