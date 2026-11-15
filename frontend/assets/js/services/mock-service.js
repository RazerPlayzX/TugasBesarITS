import { adaptation } from "../gamification.js";
import { recordCompletion } from "../state.js";

const DATA_URL = new URL("../../data/demo-scenarios.json", import.meta.url);
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
let fixturePromise;

async function loadFixtures() {
  if (!fixturePromise) {
    fixturePromise = fetch(DATA_URL)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            "Data contoh tidak dapat dimuat. Jalankan melalui server HTTP lokal lalu coba lagi.",
          );
        return response.json();
      })
      .then((data) => {
        if (data.schema_version !== 1 || !Array.isArray(data.scenarios))
          throw new Error("Format data contoh tidak sesuai.");
        return data;
      })
      .catch((error) => {
        fixturePromise = undefined;
        throw error;
      });
  }
  return fixturePromise;
}

export async function mockRecommend(
  request,
  { completedIds = [], mode = "normal" } = {},
) {
  await delay(mode === "slow" ? 3000 : 500);
  const adapted = adaptation(request.score, request.ability);
  const base = { mode: "demo", request, adaptation: adapted, courses: [] };
  if (mode === "error")
    throw new Error(
      "Simulasi: data rekomendasi gagal dimuat. Pilih respons Normal di Pengaturan demonstrasi, lalu coba lagi.",
    );
  if (mode === "empty")
    return {
      ...base,
      status: "empty",
      message:
        "Simulasi hasil kosong. Tidak ada kandidat pada respons pengujian ini. Quest aktif tetap tersimpan.",
    };
  const data = await loadFixtures();
  // Pencocokan label skenario saja, bukan normalisasi atau pencarian NLP.
  const topic = request.topic.trim().toLowerCase().replace(/\s+/g, " ");
  const scenario = data.scenarios.find((item) => item.topic === topic);
  if (!scenario)
    return {
      ...base,
      status: "unsupported",
      message:
        "Topik ini belum tersedia dalam skenario demo. Coba python programming, machine learning, atau sql database. Pencarian model untuk kueri lain tersedia setelah integrasi langkah 6.",
    };
  const courses = scenario.courses.filter(
    (course) =>
      course.difficulty === adapted.target_level &&
      !completedIds.includes(course.course_id),
  );
  return {
    ...base,
    status: courses.length ? "success" : "empty",
    courses,
    message: courses.length
      ? "Contoh ekspor Colab, disaring berdasarkan level sasaran dan materi yang belum selesai. Ini subset data, bukan pencarian model langsung."
      : "Belum ada kandidat dalam subset demo untuk level sasaran ini, atau semuanya sudah selesai. Ini bukan kesimpulan tentang seluruh katalog. Coba skenario lain.",
  };
}

export async function mockComplete(state, { course_id, score }) {
  await delay(180);
  return { ...recordCompletion(state, course_id, score), source: "simulasi" };
}
