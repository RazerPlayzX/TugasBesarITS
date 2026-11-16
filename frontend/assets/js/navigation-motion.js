// Motion changes presentation only; routes, focus and application state update immediately.
export function createNavigationMotion(menu, views) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(document.documentElement);
  const duration = Number.parseFloat(tokens.getPropertyValue('--duration-nav')) || 220;
  const distance = Number.parseFloat(tokens.getPropertyValue('--nav-slide-distance')) || 32;
  const easing = tokens.getPropertyValue('--ease').trim() || 'ease-out';
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  menu.prepend(indicator);

  let pageAnimation = null;
  let indicatorAnimation = null;
  let target = null;

  function positionIndicator(animate = false) {
    const active = menu.querySelector('[aria-current="page"]');
    if (!active || !menu.checkVisibility()) {
      indicatorAnimation?.cancel();
      menu.removeAttribute('data-indicator-ready');
      target = null;
      return;
    }

    const menuRect = menu.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const next = {
      x: activeRect.left - menuRect.left - menu.clientLeft,
      y: activeRect.top - menuRect.top - menu.clientTop,
      width: activeRect.width,
      height: activeRect.height,
    };
    if (target && Object.keys(next).every(key => Math.abs(next[key] - target[key]) < 0.5)) return;

    // Capture the current interpolated position so rapid clicks do not jump back.
    const current = target ? indicator.getBoundingClientRect() : null;
    indicatorAnimation?.cancel();
    indicator.style.width = `${next.width}px`;
    indicator.style.height = `${next.height}px`;
    indicator.style.transform = `translate(${next.x}px, ${next.y}px)`;
    menu.setAttribute('data-indicator-ready', '');

    if (animate && current && !reducedMotion.matches) {
      indicatorAnimation = indicator.animate([
        { transform: `translate(${current.left - menuRect.left - menu.clientLeft}px, ${current.top - menuRect.top - menu.clientTop}px) scale(${current.width / next.width}, ${current.height / next.height})` },
        { transform: `translate(${next.x}px, ${next.y}px) scale(1)` },
      ], { duration, easing });
    }
    target = next;
  }

  function update(view, previous, animate) {
    pageAnimation?.cancel();
    pageAnimation = null;
    positionIndicator(animate);
    if (!animate || reducedMotion.matches || !previous || view === previous) return;

    if (view === 'login') {
      pageAnimation = document.getElementById('login-main').animate([
        { transform: 'translateY(8px)', opacity: 0.65 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration, easing });
      return;
    }
    if (!views.includes(view)) return;
    const direction = views.indexOf(view) > views.indexOf(previous) ? 1 : -1;
    pageAnimation = document.getElementById(`view-${view}`).animate([
      { transform: `translateX(${direction * distance}px)`, opacity: 0.65 },
      { transform: 'translateX(0)', opacity: 1 },
    ], { duration, easing });
  }

  // Navbar size also changes when quest counts or responsive breakpoints change.
  new ResizeObserver(() => positionIndicator()).observe(menu);
  reducedMotion.addEventListener('change', () => {
    pageAnimation?.cancel();
    indicatorAnimation?.cancel();
    positionIndicator();
  });
  return { update };
}
