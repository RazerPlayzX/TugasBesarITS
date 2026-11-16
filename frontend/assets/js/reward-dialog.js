import { byId, element } from "./ui.js";

const dialog = byId("reward-dialog");
let returnCourseId = null;

function close() {
  dialog.close();
}
byId("reward-close").addEventListener("click", close);
byId("reward-return").addEventListener("click", close);
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [
    ...dialog.querySelectorAll("button:not([disabled]),a[href],input"),
  ];
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
dialog.addEventListener("close", () => {
  // Render state mengganti form pemicu. Kembalikan fokus ke materi yang sama.
  const row = [...byId("quest-content").querySelectorAll(".course-row")].find(
    (node) => node.dataset.courseId === returnCourseId,
  );
  const target = row?.querySelector("h3") || byId("quest-title");
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
});

export function showReward(result, courseId) {
  if (result.duplicate || result.xp_awarded <= 0) return;
  const oldLevel = result.level_before;
  const level = result.level_after;
  returnCourseId = courseId;
  byId("reward-earned").textContent = `+${result.xp_awarded} XP`;
  const summary = byId("reward-summary");
  summary.replaceChildren();
  [
    ["Total XP", `${result.total_xp} XP`],
    [
      "Level aktivitas",
      oldLevel === level ? `${level}` : `${oldLevel} \u2192 ${level}`,
    ],
  ].forEach(([label, value]) => {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    summary.append(row);
  });
  const badges = result.new_badges;
  const container = byId("reward-badges");
  container.replaceChildren(
    element(
      "h3",
      "",
      badges.length ? "Badge baru" : "Langkahmu tetap berarti.",
    ),
  );
  if (badges.length)
    badges.forEach((badge) => container.append(element("span", "tag", badge)));
  else
    container.append(
      element(
        "p",
        "",
        "Belum ada badge baru dari aktivitas ini. Progres dan XP sudah tercatat.",
      ),
    );
  dialog.showModal();
  byId("reward-return").focus();
}
