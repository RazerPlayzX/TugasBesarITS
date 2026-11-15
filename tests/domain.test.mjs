import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptation,
  completionReward,
  activityLevel,
  questProgress,
} from "../frontend/assets/js/gamification.js";
import {
  scoreError,
  safeCourseUrl,
  validateLearningInput,
} from "../frontend/assets/js/validation.js";
import {
  emptyState,
  recordCompletion,
  startQuest,
  profileFromState,
  loadState,
  saveState,
  clearState,
  STORAGE_KEY,
} from "../frontend/assets/js/state.js";

for (const [score, type, level] of [
  [0, "Remedial", "Beginner"],
  [59, "Remedial", "Beginner"],
  [60, "Improvement", "Intermediate"],
  [79, "Improvement", "Intermediate"],
  [80, "Mastery", "Advanced"],
  [100, "Mastery", "Advanced"],
]) {
  test(`adaptasi ${score}`, () =>
    assert.deepEqual(adaptation(score, "Intermediate"), {
      quest_type: type,
      target_level: level,
    }));
}
test("batas level Beginner dan Advanced", () => {
  assert.equal(adaptation(0, "Beginner").target_level, "Beginner");
  assert.equal(adaptation(100, "Advanced").target_level, "Advanced");
});
for (const value of ["Conversant", "Not Calibrated", ""])
  test(`level tidak dipetakan: ${value || "kosong"}`, () =>
    assert.throws(() => adaptation(70, value)));
for (const score of [-1, 101, NaN, Infinity, true, ""])
  test(`nilai invalid ${String(score)}`, () =>
    assert.throws(() => completionReward(score)));
test("nilai kosong berbeda dari 0", () => {
  assert.ok(scoreError(""));
  assert.equal(scoreError("0"), "");
});
test("topik kosong ditolak", () =>
  assert.ok(
    validateLearningInput({ topic: " ", ability: "Beginner", score: "0" })
      .errors.topic,
  ));
for (const [score, xp] of [
  [0, 30],
  [59, 30],
  [60, 40],
  [79, 40],
  [80, 50],
  [89, 50],
  [90, 70],
  [100, 70],
])
  test(`XP ${score} = ${xp}`, () =>
    assert.equal(completionReward(score).xp, xp));
test("badge nilai 90 kumulatif", () =>
  assert.deepEqual(completionReward(90).badges, [
    "Learning Explorer",
    "Quiz Master",
    "Smart Learner",
  ]));
test("badge remedial", () =>
  assert.deepEqual(completionReward(0).badges, [
    "Learning Explorer",
    "Keep Learning",
  ]));
for (const [xp, level] of [
  [0, 1],
  [99, 1],
  [100, 2],
  [199, 2],
  [200, 3],
  [299, 3],
  [300, 4],
  [500, 4],
])
  test(`level aktivitas ${xp}`, () => assert.equal(activityLevel(xp), level));
const courses = ["one", "two", "three"].map((course_id) => ({
  course_id,
  title: course_id,
  url: "https://example.com",
  difficulty: "Beginner",
}));
const result = {
  request: { topic: "python programming" },
  adaptation: adaptation(45, "Intermediate"),
  courses,
};
test("quest kosong 0%", () => assert.equal(questProgress(null, []).percent, 0));
test("penyelesaian berulang tidak menambah XP atau badge", () => {
  const first = recordCompletion(startQuest(emptyState(), result), "one", 90);
  const duplicate = recordCompletion(first.state, "one", 90);
  assert.equal(duplicate.xp_awarded, 0);
  assert.equal(profileFromState(duplicate.state).xp, 70);
  assert.equal(profileFromState(duplicate.state).badges.length, 3);
  assert.deepEqual(questProgress(first.state.quest, ["one"]), {
    total: 3,
    completed: 1,
    percent: 33.33,
  });
  assert.equal(first.state.quest.courses.length, 3);
});
test("materi di luar quest ditolak", () =>
  assert.throws(() =>
    recordCompletion(startQuest(emptyState(), result), "outsider", 90),
  ));
test("semua materi selesai mencapai 100%", () =>
  assert.equal(
    questProgress({ courses }, ["one", "two", "three"]).percent,
    100,
  ));
test("URL javascript dan data ditolak", () => {
  assert.equal(safeCourseUrl("javascript:alert(1)"), null);
  assert.equal(safeCourseUrl("data:text/html,test"), null);
  assert.equal(safeCourseUrl("https://example.com"), "https://example.com/");
});
test("storage rusak memulai profil kosong", () => {
  const loaded = loadState({ getItem: () => "{broken" });
  assert.equal(profileFromState(loaded.state).xp, 0);
  assert.ok(loaded.notice);
});
test("storage skema lain ditolak", () =>
  assert.ok(
    loadState({
      getItem: () => JSON.stringify({ schema_version: 9, history: [] }),
    }).notice,
  ));
test("riwayat duplikat storage ditolak", () => {
  const value = recordCompletion(
    startQuest(emptyState(), result),
    "one",
    90,
  ).state;
  value.history.push(value.history[0]);
  assert.ok(loadState({ getItem: () => JSON.stringify(value) }).notice);
});
test("storage tidak tersedia ditangani", () => {
  const storage = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
    removeItem() {
      throw Error();
    },
  };
  assert.ok(loadState(storage).notice);
  assert.equal(saveState(emptyState(), storage), false);
  assert.equal(clearState(storage), false);
});
test("reset menghapus key khusus saja", () => {
  const removed = [];
  clearState({ removeItem: (key) => removed.push(key) });
  assert.deepEqual(removed, [STORAGE_KEY]);
});
