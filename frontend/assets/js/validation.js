export const ABILITY_LEVELS = Object.freeze([
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export function scoreError(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "")
    return "Isi nilai kuis. Nilai 0 tetap valid.";
  if (
    typeof raw === "boolean" ||
    !Number.isFinite(Number(raw)) ||
    Number(raw) < 0 ||
    Number(raw) > 100
  )
    return "Gunakan angka antara 0 dan 100.";
  return "";
}

export function validateLearningInput({ topic, ability, score }) {
  const errors = {};
  if (!topic.trim())
    errors.topic = "Isi topik atau keterampilan yang ingin dipelajari.";
  else if (topic.trim().length > 150)
    errors.topic = "Gunakan paling banyak 150 karakter.";
  if (!ABILITY_LEVELS.includes(ability))
    errors.ability = "Pilih Beginner, Intermediate, atau Advanced.";
  const error = scoreError(score);
  if (error) errors.score = error;
  return {
    errors,
    value: { topic: topic.trim(), ability, score: Number(score) },
  };
}

export function safeCourseUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
