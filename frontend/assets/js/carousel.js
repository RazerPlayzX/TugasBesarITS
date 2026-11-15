let carouselId = 0;

export function createCarousel(list) {
  const region = document.createElement("section");
  region.className = "carousel";
  region.setAttribute("aria-label", "Kandidat materi, geser untuk menjelajah");
  const trackId = `course-slider-${++carouselId}`;
  list.id = trackId;
  list.classList.add("carousel-track");
  list.tabIndex = 0;
  list.setAttribute(
    "aria-label",
    "Daftar materi. Gunakan panah kiri atau kanan untuk menggeser.",
  );
  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  const position = document.createElement("span");
  position.setAttribute("aria-live", "polite");
  function control(label, direction) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button secondary";
    button.textContent = label;
    button.setAttribute("aria-controls", trackId);
    button.addEventListener("click", () => move(direction));
    return button;
  }
  const previous = control("Sebelumnya", -1);
  const next = control("Berikutnya", 1);
  function update() {
    const max = list.scrollWidth - list.clientWidth;
    previous.disabled = list.scrollLeft <= 2;
    next.disabled = list.scrollLeft >= max - 2;
    const items = [...list.children];
    const current = items.reduce((closest, item, index) => {
      const distance = Math.abs(
        item.offsetLeft - list.offsetLeft - list.scrollLeft,
      );
      const previousDistance = Math.abs(
        items[closest].offsetLeft - list.offsetLeft - list.scrollLeft,
      );
      return distance < previousDistance ? index : closest;
    }, 0);
    position.textContent = `Posisi ${Math.max(0, current) + 1} dari ${items.length} materi`;
  }
  function move(direction) {
    const first = list.firstElementChild;
    if (!first) return;
    list.scrollBy({
      left: direction * (first.getBoundingClientRect().width + 16),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  list.addEventListener("keydown", (event) => {
    if (event.target !== list) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  list.addEventListener("scroll", update, { passive: true });
  controls.append(previous, position, next);
  region.append(controls, list);
  // Ukuran baru tersedia setelah hasil dimasukkan ke DOM.
  const observer = new ResizeObserver(() => {
    if (!region.isConnected) {
      observer.disconnect();
      return;
    }
    update();
  });
  requestAnimationFrame(() => {
    if (region.isConnected) {
      observer.observe(list);
      update();
    }
  });
  return region;
}
