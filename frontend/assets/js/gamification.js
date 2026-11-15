import { ABILITY_LEVELS, scoreError } from "./validation.js";

export const SCORE_THRESHOLDS = Object.freeze({
  improvement: 60,
  mastery: 80,
  quizMaster: 90,
});
export const XP_RULES = Object.freeze({
  completion: 20,
  remedial: 10,
  improvement: 20,
  mastery: 30,
  quizMaster: 50,
});
export const ACTIVITY_THRESHOLDS = Object.freeze([0, 100, 200, 300]);
export const BADGES = Object.freeze([
  { name: "Learning Explorer", description: "Selesaikan satu materi." },
  { name: "Smart Learner", description: "Raih nilai kuis minimal 80." },
  { name: "Quiz Master", description: "Raih nilai kuis minimal 90." },
  {
    name: "Keep Learning",
    description: "Tetap belajar saat nilai di bawah 60.",
  },
]);

function assertScore(score) {
  if (typeof score !== "number" || scoreError(score))
    throw new Error("Nilai kuis harus angka 0–100.");
}

export function adaptation(score, ability) {
  assertScore(score);
  if (!ABILITY_LEVELS.includes(ability))
    throw new Error("Level kemampuan tidak valid.");
  const index = ABILITY_LEVELS.indexOf(ability);
  const delta =
    score < SCORE_THRESHOLDS.improvement
      ? -1
      : score >= SCORE_THRESHOLDS.mastery
        ? 1
        : 0;
  return {
    quest_type: delta < 0 ? "Remedial" : delta > 0 ? "Mastery" : "Improvement",
    target_level:
      ABILITY_LEVELS[
        Math.max(0, Math.min(ABILITY_LEVELS.length - 1, index + delta))
      ],
  };
}

export function completionReward(score) {
  assertScore(score);
  const bonus =
    score >= SCORE_THRESHOLDS.quizMaster
      ? XP_RULES.quizMaster
      : score >= SCORE_THRESHOLDS.mastery
        ? XP_RULES.mastery
        : score >= SCORE_THRESHOLDS.improvement
          ? XP_RULES.improvement
          : XP_RULES.remedial;
  const badges = ["Learning Explorer"];
  if (score >= SCORE_THRESHOLDS.quizMaster) badges.push("Quiz Master");
  if (score >= SCORE_THRESHOLDS.mastery) badges.push("Smart Learner");
  if (score < SCORE_THRESHOLDS.improvement) badges.push("Keep Learning");
  return { xp: XP_RULES.completion + bonus, badges };
}

export function activityLevel(xp) {
  return ACTIVITY_THRESHOLDS.filter((threshold) => xp >= threshold).length;
}

export function questProgress(quest, completedIds) {
  const total = quest?.courses.length ?? 0;
  const completed =
    quest?.courses.filter((course) => completedIds.includes(course.course_id))
      .length ?? 0;
  return {
    total,
    completed,
    percent: total
      ? Math.min(
          100,
          Math.max(0, Math.round((completed / total) * 10000) / 100),
        )
      : 0,
  };
}
