import { byId } from "./ui.js";
import { createNavigationMotion } from './navigation-motion.js';

const VIEWS = {
  beranda: "Beranda",
  rekomendasi: "Rekomendasi Materi",
  quest: "Quest Saya",
  progres: "Pencapaian",
};

export function createNavigation(session) {
  const menu = byId("main-navigation");
  const motion = createNavigationMotion(menu, Object.keys(VIEWS));
  let activeView = null;
  function render({ animate = false } = {}) {
    const requested = location.hash.slice(1);
    const view = session.isActive()
      ? requested in VIEWS
        ? requested
        : "beranda"
      : "login";
    if (requested !== view) history.replaceState(null, "", `#${view}`);
    byId("login-view").hidden = view !== "login";
    byId("app-shell").hidden = view === "login";
    byId("skip-link").href = view === "login" ? "#login-main" : "#main";
    Object.keys(VIEWS).forEach((name) => {
      byId(`view-${name}`).hidden = name !== view;
    });
    menu.querySelectorAll("[data-view]").forEach((link) => {
      if (link.dataset.view === view) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const title = VIEWS[view] || "Masuk";
    byId("breadcrumb").textContent = title;
    document.title = `${title} — Alur`;
    byId(view === "login" ? "login-main" : "main").focus({
      preventScroll: true,
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    motion.update(view, activeView, animate);
    activeView = view;
  }

  function go(view, options) {
    if (location.hash !== `#${view}`) history.pushState(null, "", `#${view}`);
    render(options);
  }

  // Intersepsi rute juga menangani klik tautan ke halaman yang sudah aktif.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (link.id === "skip-link") {
      event.preventDefault();
      byId(session.isActive() ? "main" : "login-main").focus();
      return;
    }
    const view = link.hash.slice(1);
    if (view in VIEWS) {
      event.preventDefault();
      go(view, { animate: menu.contains(link) && event.detail > 0 });
    }
  });
  window.addEventListener("hashchange", () => {
    if (["main", "login-main"].includes(location.hash.slice(1))) return;
    render();
  });
  window.addEventListener("popstate", render);
  return { render, go };
}
