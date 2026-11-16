import { byId, element, routeLink, button, progressBar, courseRows, emptyPanel } from "./ui.js";
import { profileFromState } from "./state.js";
import { activityLevel, questProgress } from "./gamification.js";

let homeResult = null;
let completedIds = [];
export const homeRecommendation = () => homeResult;

export function renderHomeRecommendations(result) {
  homeResult = result ? {...result, courses: result.courses.filter(course => !completedIds.includes(course.course_id))} : null;
  const container = byId('home-recommendations-content');
  container.replaceChildren();
  if (!homeResult?.courses.length) {
    container.append(emptyPanel('Temukan materi sesuai kebutuhanmu.',
      result?.message || 'Isi topik, level kemampuan, dan nilai kuis mandiri untuk mendapatkan rekomendasi model.'));
    return;
  }
  container.append(element('p', 'source-note', `Berdasarkan topik ${homeResult.request.topic} · ${homeResult.adaptation.quest_type}. Kandidat ini terpisah dari quest aktif.`),
    courseRows(homeResult.courses, {prefix: 'home'}));
}

export function renderDashboard(state) {
  const profile = profileFromState(state);
  completedIds = profile.completedIds;
  const progress = state.progress ?? questProgress(state.quest, profile.completedIds);
  const next = state.quest?.courses.find(
    (course) => !profile.completedIds.includes(course.course_id),
  );
  const activity = byId("dashboard-activity");
  activity.replaceChildren();

  if (!state.quest) {
    activity.append(
      element("h2", "", "Belajarmu dimulai dari satu topik."),
      element(
        "p",
        "",
        "Belum ada quest aktif. Pilih topik, isi kemampuan awal dan nilai kuis mandiri, lalu pilih materi untuk dipelajari.",
      ),
      routeLink("Cari Materi", "rekomendasi", "button primary"),
    );
    const steps = element("ol", "start-steps");
    [
      "Tentukan kebutuhan belajar",
      "Pilih materi dari kandidat",
      "Mulai quest dan catat progres",
    ].forEach((text) => steps.append(element("li", "", text)));
    activity.append(steps);
  } else {
    const heading = element("div", "section-heading");
    heading.append(
      element(
        "h2",
        "",
        next ? "Lanjutkan dari sini." : "Quest ini sudah selesai.",
      ),
      element("span", "tag", state.quest.quest_type),
    );
    activity.append(
      heading,
      element("p", "dashboard-topic", `Quest: ${state.quest.topic}`),
    );
    if (next) {
      const course = element("div", "next-lesson");
      course.append(
        element(
          "p",
          "subtle",
          `Materi ${state.quest.courses.indexOf(next) + 1} dari ${progress.total} · Belum selesai`,
        ),
      );
      const title = element("h3", "", next.title);
      title.lang = "en";
      course.append(
        title,
        element(
          "p",
          "hint",
          `Kesulitan materi: ${next.difficulty} · ${next.provider || "Penyedia belum tersedia"}`,
        ),
      );
      const actions = element('div', 'course-actions');
      actions.append(
        button("Lanjutkan Belajar", "continue-learning", "button primary"),
        routeLink("Cari Materi", "rekomendasi", "button secondary"),
      );
      course.append(actions);
      activity.append(course);
    } else {
      activity.append(
        element(
          "p",
          "",
          "Seluruh materi pada quest aktif telah tercatat selesai. Kamu bisa mencari kandidat untuk langkah berikutnya.",
        ),
        routeLink("Cari Materi", "rekomendasi", "button primary"),
      );
    }
    activity.append(
      progressBar(progress, `${progress.completed} dari ${progress.total} materi selesai`),
      routeLink("Lihat seluruh quest", "quest", "text-link"),
    );
  }

  const summary = byId("dashboard-summary");
  summary.replaceChildren(element("h2", "", "Pencapaian belajarmu"));
  const stats = element("dl", "dashboard-stats");
  [
    ["XP terkumpul", `${profile.xp} XP`],
    ["Level aktivitas", `${profile.level ?? activityLevel(profile.xp)}`],
    ["Badge diperoleh", `${profile.badges.length}`],
  ].forEach(([label, value]) => {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    stats.append(row);
  });
  summary.append(
    stats,
    element(
      "p",
      "hint",
      "Level aktivitas mengikuti XP. Ini berbeda dari kemampuan belajar dan kesulitan materi.",
    ),
    routeLink("Lihat pencapaian", "progres", "text-link"),
  );

  const recent = byId("dashboard-recent");
  recent.hidden = !state.history.length;
  recent.replaceChildren(element("h2", "", "Aktivitas terakhir"));
  const list = element("ol", "recent-activities");
  state.history
    .slice(-3)
    .reverse()
    .forEach((entry) => {
      const row = element("li");
      row.append(
        element("strong", "", entry.title),
        element(
          "span",
          "hint",
          `Materi selesai · Nilai kuis mandiri ${entry.score}/100`,
        ),
      );
      list.append(row);
    });
  recent.append(list);
}
