(() => {
  "use strict";

  const root = document.documentElement;
  const contentScroll = document.querySelector(".content-scroll");
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const profilePanel = document.querySelector(".profile-panel");
  const profileToggle = document.querySelector(".profile-mobile-toggle");
  const profileDetails = document.querySelector("#profile-details");
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sections = [...document.querySelectorAll(".section")];
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector(".form-status");
  const year = document.querySelector("#year");
  const scrollTopButton = document.querySelector("#scroll-top");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = window.matchMedia("(max-width: 850px)");

  /* ---------- Theme ---------- */
  const themeStorageKey = "portfolio-theme-v2";
  const storedTheme = localStorage.getItem(themeStorageKey);
  // Light mode is deliberately the default.
  const initialTheme = storedTheme === "dark" ? "dark" : "light";

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);

    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");
    const dark = theme === "dark";

    if (icon) icon.className = dark ? "ri-sun-line" : "ri-moon-line";
    themeToggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.setAttribute(
      "title",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  setTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  /* ---------- Mobile profile card ---------- */
  profileToggle?.addEventListener("click", () => {
    const open = !profilePanel.classList.contains("is-open");

    profilePanel.classList.toggle("is-open", open);
    profileDetails?.classList.toggle("open", open);
    profileToggle.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Mobile navigation ---------- */
  function closeMobileNav() {
    mobileNav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");

    const icon = menuToggle?.querySelector("i");
    if (icon) icon.className = "ri-menu-3-line";
  }

  menuToggle?.addEventListener("click", () => {
    const open = mobileNav?.classList.toggle("open") ?? false;

    menuToggle.setAttribute("aria-expanded", String(open));

    const icon = menuToggle.querySelector("i");
    if (icon) icon.className = open ? "ri-close-line" : "ri-menu-3-line";
  });

  document.addEventListener("click", (event) => {
    if (!mobileNav?.classList.contains("open")) return;
    if (!mobileNav.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMobileNav();
    }
  });

  /* ---------- Navigation ---------- */
  let navigationInProgress = false;
  let navigationFrame = 0;
  let targetScrollTop = 0;

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === id);
    });
  }

  function getCurrentScroll() {
    return mobileQuery.matches
      ? window.scrollY
      : (contentScroll?.scrollTop || 0);
  }

  function getTargetScroll(target) {
    if (!target) return 0;

    if (mobileQuery.matches) {
      const headerOffset = 76;
      return Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top - headerOffset
      );
    }

    const containerRect = contentScroll.getBoundingClientRect();
    return Math.max(
      0,
      contentScroll.scrollTop +
        target.getBoundingClientRect().top -
        containerRect.top -
        8
    );
  }

  function stopNavigationLock() {
    navigationInProgress = false;
    cancelAnimationFrame(navigationFrame);
    updateActiveSection();
  }

  // Wait for the actual smooth-scroll destination instead of using a fixed timeout.
  // This prevents the active nav item from flickering or jumping to another section.
  function watchNavigationDestination() {
    if (!navigationInProgress) return;

    const distance = Math.abs(getCurrentScroll() - targetScrollTop);

    if (distance <= 2) {
      stopNavigationLock();
      return;
    }

    navigationFrame = requestAnimationFrame(watchNavigationDestination);
  }

  function updateActiveSection() {
    if (navigationInProgress) return;

    const mobile = mobileQuery.matches;
    const scrollTop = mobile
      ? window.scrollY
      : (contentScroll?.scrollTop || 0);

    const probe = scrollTop + (mobile ? 120 : 170);
    let currentId = sections[0]?.id || "home";

    sections.forEach((section) => {
      const top = mobile
        ? section.getBoundingClientRect().top + window.scrollY
        : section.offsetTop;

      if (top <= probe) currentId = section.id;
    });

    setActiveNav(currentId);
  }

  function navigateTo(id) {
    const target = document.getElementById(id);
    if (!target) return;

    closeMobileNav();
    setActiveNav(id);

    targetScrollTop = getTargetScroll(target);
    navigationInProgress = true;
    cancelAnimationFrame(navigationFrame);

    if (mobileQuery.matches) {
      window.scrollTo({
        top: targetScrollTop,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    } else {
      contentScroll.scrollTo({
        top: targetScrollTop,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    if (reduceMotion) {
      stopNavigationLock();
    } else {
      navigationFrame = requestAnimationFrame(watchNavigationDestination);
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(link.dataset.nav);
    });
  });

  contentScroll?.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", () => {
    closeMobileNav();
    updateActiveSection();
  });

  updateActiveSection();

  /* ---------- Scroll-to-top ---------- */
  function updateScrollTopButton() {
    const current = getCurrentScroll();
    scrollTopButton?.classList.toggle("show", current > 120);
  }

  contentScroll?.addEventListener("scroll", updateScrollTopButton, { passive: true });
  window.addEventListener("scroll", updateScrollTopButton, { passive: true });
  window.addEventListener("resize", updateScrollTopButton);

  scrollTopButton?.addEventListener("click", () => {
    navigationInProgress = true;
    targetScrollTop = 0;
    setActiveNav("home");

    if (mobileQuery.matches) {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    } else {
      contentScroll?.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    if (reduceMotion) {
      stopNavigationLock();
    } else {
      cancelAnimationFrame(navigationFrame);
      navigationFrame = requestAnimationFrame(watchNavigationDestination);
    }
  });

  updateScrollTopButton();

  /* ---------- Reveal animations ---------- */
  const revealItems = [...document.querySelectorAll(".reveal, .reveal-card")];

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      root: contentScroll,
      threshold: 0.08
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Lightweight 3D tilt ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 8;
        const rotateX = (0.5 - y) * 8;

        element.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  /* ---------- Static frontend contact form ---------- */
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(
      `Hi Darshan,\n\n${message}\n\nName: ${name}\nEmail: ${email}`
    );

    if (formStatus) formStatus.textContent = "Opening your email application…";
    window.location.href =
      `mailto:darshan08m@gmail.com?subject=${subject}&body=${body}`;
  });

  /* ---------- Misc ---------- */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  if (year) year.textContent = new Date().getFullYear();
})();
