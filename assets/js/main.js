(() => {
  "use strict";

  const body = document.body;
  const header = document.getElementById("site-header");
  const nav = document.getElementById("site-nav");
  const navToggle = document.getElementById("nav-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    body.classList.remove("nav-open");
  };

  const openNav = () => {
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    body.classList.add("nav-open");
  };

  navToggle.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 1120px)");
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) closeNav();
  });

  /* ---------- reveal on scroll ---------- */

  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- menu filter ---------- */

  const tabs = Array.from(document.querySelectorAll(".menu-tab"));
  const groups = Array.from(document.querySelectorAll(".menu-group"));

  const filterMenu = (filter) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.filter === filter;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });

    groups.forEach((group) => {
      group.hidden = filter !== "all" && group.dataset.cat !== filter;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => filterMenu(tab.dataset.filter));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const index = tabs.indexOf(tab);
      const next =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      filterMenu(tabs[next].dataset.filter);
    });
  });

  /* ---------- gallery lightbox ---------- */

  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCount = document.getElementById("lightbox-count");
  const closeButton = lightbox ? lightbox.querySelector(".lightbox__close") : null;
  const prevButton = lightbox ? lightbox.querySelector(".lightbox__nav--prev") : null;
  const nextButton = lightbox ? lightbox.querySelector(".lightbox__nav--next") : null;

  let currentIndex = 0;
  let lastTrigger = null;

  const pad = (number) => String(number).padStart(2, "0");

  const renderLightbox = (index) => {
    const trigger = galleryItems[index];
    const thumb = trigger.querySelector("img");
    currentIndex = index;

    lightboxImg.src = trigger.dataset.full || thumb.src;
    lightboxImg.alt = thumb.alt || "";
    lightboxCaption.textContent = trigger.dataset.caption || "";
    lightboxCount.textContent = `${pad(index + 1)} / ${pad(galleryItems.length)}`;
  };

  const openLightbox = (index, trigger) => {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    lastTrigger = trigger;
    renderLightbox(index);
    lightbox.showModal();
    body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.open) return;
    lightbox.close();
  };

  const stepLightbox = (direction) => {
    const next = (currentIndex + direction + galleryItems.length) % galleryItems.length;
    renderLightbox(next);
  };

  if (lightbox && galleryItems.length) {
    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index, item));
    });

    closeButton.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", () => stepLightbox(-1));
    nextButton.addEventListener("click", () => stepLightbox(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
    });

    lightbox.addEventListener("close", () => {
      body.classList.remove("lightbox-open");
      lightboxImg.removeAttribute("src");
      if (lastTrigger) lastTrigger.focus();
    });
  }

  /* ---------- scrollspy ---------- */

  const navLinks = Array.from(document.querySelectorAll("[data-link]"));
  const spySections = Array.from(document.querySelectorAll("[data-spy]"));

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const active = link.dataset.link === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if ("IntersectionObserver" in window && spySections.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach((section) => spyObserver.observe(section));
  }

  /* ---------- footer year ---------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
