const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    }
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const heroFollowSection = document.querySelector(".hero-follow");

if (heroFollowSection) {
  let heroFollowFrame;

  function syncHeroFollowOpacity() {
    heroFollowFrame = undefined;

    const { top } = heroFollowSection.getBoundingClientRect();
    const fadeStart = window.innerHeight * 0.65;
    const fadeEnd = window.innerHeight * 0.4;
    const opacity = Math.min(1, Math.max(0, (fadeStart - top) / (fadeStart - fadeEnd)));

    heroFollowSection.style.setProperty("--hero-section-opacity", opacity);
  }

  function queueHeroFollowOpacity() {
    if (heroFollowFrame) return;
    heroFollowFrame = window.requestAnimationFrame(syncHeroFollowOpacity);
  }

  syncHeroFollowOpacity();
  window.addEventListener("scroll", queueHeroFollowOpacity, { passive: true });
  window.addEventListener("resize", queueHeroFollowOpacity);
}

const heroTransition = document.querySelector(".hero-transition");

const heroHome = document.querySelector(".hero-home");
const heroFloatingContent = heroHome?.querySelector(".hero-content");
const heroFloatingVisual = heroHome?.querySelector(".hero-visual");

if (heroHome && heroFloatingContent && heroFloatingVisual) {
  let heroFloatFrame;

  function syncHeroFloat() {
    heroFloatFrame = undefined;

    const heroBounds = heroHome.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -heroBounds.top / (heroBounds.height * 0.72)));
    heroFloatingContent.style.setProperty("--hero-content-shift", `${progress * 24}px`);
    heroFloatingVisual.style.setProperty("--hero-visual-shift", `${-progress * 20}px`);
  }

  function queueHeroFloat() {
    if (heroFloatFrame) return;
    heroFloatFrame = window.requestAnimationFrame(syncHeroFloat);
  }

  syncHeroFloat();
  window.addEventListener("scroll", queueHeroFloat, { passive: true });
  window.addEventListener("resize", queueHeroFloat);
}

if (heroTransition) {
  const mountainPeaks = heroTransition.querySelectorAll(".mountain-peak");
  const peakParallax = [
    { travel: 24, drift: -14 },
    { travel: 34, drift: 0 },
    { travel: 24, drift: 14 },
  ];
  let hasUserScrolled = false;
  let transitionIsVisible = false;
  const peakObserver = new IntersectionObserver(
    ([entry]) => {
      transitionIsVisible = entry.isIntersecting;
      heroTransition.classList.toggle("peaks-in-view", hasUserScrolled && transitionIsVisible);
    },
    { threshold: 0.2 }
  );

  peakObserver.observe(heroTransition);
  window.addEventListener(
    "scroll",
    () => {
      hasUserScrolled = true;
      heroTransition.classList.toggle("peaks-in-view", transitionIsVisible);
    },
    { once: true, passive: true }
  );

  let peakFrame;

  function syncPeakPosition() {
    peakFrame = undefined;

    const { top } = heroTransition.getBoundingClientRect();
    const enterAt = window.innerHeight * 0.9;
    const settleAt = window.innerHeight * 0.55;
    const progress = Math.min(1, Math.max(0, (enterAt - top) / (enterAt - settleAt)));

    heroTransition.style.setProperty("--mountain-shift", "0px");
    mountainPeaks.forEach((peak, index) => {
      const { travel, drift } = peakParallax[index];
      peak.style.setProperty("--peak-shift", `${-progress * travel}px`);
      peak.style.setProperty("--peak-drift", `${progress * drift}px`);
    });
  }

  function queuePeakPosition() {
    if (peakFrame) return;
    peakFrame = window.requestAnimationFrame(syncPeakPosition);
  }

  syncPeakPosition();
  window.addEventListener("scroll", queuePeakPosition, { passive: true });
  window.addEventListener("resize", queuePeakPosition);
}

const heroContent = document.querySelector(".hero-content");
const heroHeading = heroContent?.querySelector("h1");
const heroWideQuery = window.matchMedia("(min-width: 1181px)");

function syncHeroContentWidth() {
  if (!heroContent || !heroHeading) return;

  if (heroWideQuery.matches) {
    heroContent.style.width = `${Math.ceil(heroHeading.getBoundingClientRect().width)}px`;
  } else {
    heroContent.style.width = "";
  }
}

if (heroHeading) {
  syncHeroContentWidth();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      syncHeroContentWidth();
    });
  }

  if (typeof ResizeObserver !== "undefined") {
    const heroResizeObserver = new ResizeObserver(syncHeroContentWidth);
    heroResizeObserver.observe(heroHeading);
  }

  heroWideQuery.addEventListener("change", syncHeroContentWidth);
  window.addEventListener("resize", syncHeroContentWidth);
}

const navMenu = document.querySelector("[data-nav-menu]");
const topbar = document.querySelector(".topbar");
const heroTransitionForHeader = document.querySelector(".hero-transition");
const navTriggers = navMenu ? Array.from(navMenu.querySelectorAll(".nav-trigger")) : [];
const navPanels = navMenu ? Array.from(navMenu.querySelectorAll(".nav-menu-section")) : [];

function syncStickyTopbar() {
  if (!topbar || !heroTransitionForHeader) return;

  const hasPassedTransition = heroTransitionForHeader.getBoundingClientRect().bottom <= 0;
  topbar.classList.toggle("is-sticky", hasPassedTransition);
}

syncStickyTopbar();
window.addEventListener("scroll", syncStickyTopbar, { passive: true });
window.addEventListener("resize", syncStickyTopbar);

function syncNavMenu(menuName) {
  if (!navMenu || !menuName) return;

  navMenu.dataset.open = "true";

  navTriggers.forEach((trigger) => {
    const isActive = trigger.dataset.menu === menuName;
    trigger.classList.toggle("is-active", isActive);
    trigger.setAttribute("aria-expanded", String(isActive));
  });

  navPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.menuPanel === menuName);
  });
}

function closeNavMenu() {
  if (!navMenu) return;
  delete navMenu.dataset.open;

  navTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
    trigger.setAttribute("aria-expanded", "false");
  });
}

navTriggers.forEach((trigger) => {
  const menuName = trigger.dataset.menu;
  trigger.addEventListener("mouseenter", () => syncNavMenu(menuName));
  trigger.addEventListener("focus", () => syncNavMenu(menuName));
  trigger.addEventListener("click", () => syncNavMenu(menuName));
});

topbar?.addEventListener("mouseleave", closeNavMenu);
topbar?.addEventListener("focusout", (event) => {
  if (!topbar.contains(event.relatedTarget)) {
    closeNavMenu();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".topbar")) {
    closeNavMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavMenu();
  }
});

closeNavMenu();
