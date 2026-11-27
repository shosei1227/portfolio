"use strict";

/* viewport */
const viewport = document.querySelector('meta[name="viewport"]');

if (viewport) {
  const switchViewport = () => {
    const value = window.outerWidth > 360 ? "width=device-width, initial-scale=1" : "width=360";
    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  };
  switchViewport();
  window.addEventListener("resize", switchViewport);
}

/* opening */
const opening = document.querySelector(".js_opening");
const body = document.querySelector(".js_body");

if (opening && !sessionStorage.getItem("yukiakari-opening")) {
  sessionStorage.setItem("yukiakari-opening", "done");
  opening.classList.add("is-active");
  body.classList.add("is-active");
  setTimeout(() => {
    opening.classList.add("is-hidden");
    body.classList.remove("is-active");
  }, 2400);
}

/* hamburger */
const hamburger = document.querySelector(".js_hamburger");
const navigation = document.querySelector(".js_navigation");

if (hamburger && navigation) {
  const closeMenu = () => {
    hamburger.classList.remove("is-active");
    navigation.classList.remove("is-active");
    body.classList.remove("is-active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "メニューを開く");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("is-active");
    navigation.classList.toggle("is-active", isOpen);
    body.classList.toggle("is-active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1080) {
      closeMenu();
    }
  });
}

/* header */
const header = document.querySelector(".js_header");

if (header) {
  const toggleHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  toggleHeader();
  window.addEventListener("scroll", toggleHeader, { passive: true });
}

/* kv slider */
if (document.querySelector(".js_kv-slider")) {
  new Swiper(".js_kv-slider", {
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    loop: true,
    speed: 2000,
    allowTouchMove: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
  });
}

/* lineup slider */
if (document.querySelector(".js_lineup-slider")) {
  new Swiper(".js_lineup-slider", {
    loop: true,
    slidesPerView: 1.2,
    spaceBetween: 16,
    speed: 600,
    pagination: {
      el: ".js_lineup-pagination",
      clickable: true,
    },
    navigation: {
      prevEl: ".js_lineup-prev",
      nextEl: ".js_lineup-next",
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
      1080: {
        slidesPerView: 3,
        spaceBetween: 32,
      },
    },
  });
}

/* countdown */
const countdown = document.querySelector(".js_countdown");
const countdownNote = document.querySelector(".js_countdown-note");

if (countdown) {
  const now = new Date();
  const tokyo = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const today = new Date(tokyo.getFullYear(), tokyo.getMonth(), tokyo.getDate());
  let christmas = new Date(today.getFullYear(), 11, 25);
  if (today > christmas) {
    christmas = new Date(today.getFullYear() + 1, 11, 25);
  }
  const days = Math.round((christmas - today) / 86400000);
  countdown.textContent = String(days);

  if (countdownNote && days === 0) {
    countdownNote.textContent = "Merry Christmas. 今夜が、いちばん明るい夜に。";
  }
}

/* faq */
const faqs = document.querySelectorAll(".js_faq");

if (faqs.length && typeof gsap !== "undefined") {
  faqs.forEach((faq) => {
    const button = faq.querySelector(".js_faq-button");
    const answer = faq.querySelector(".js_faq-answer");
    const icon = faq.querySelector(".js_faq-icon");

    button.addEventListener("click", () => {
      const isOpen = icon.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        gsap.fromTo(answer, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.4, ease: "power2.out" });
      } else {
        gsap.to(answer, { height: 0, autoAlpha: 0, duration: 0.4, ease: "power2.out" });
      }
    });
  });
}

/* scroll animation */
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll(".js_fade-trigger").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
        },
      }
    );
  });

  document.querySelectorAll(".js_slide-trigger").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
        },
      }
    );
  });

  document.querySelectorAll(".js_stagger-trigger").forEach((el) => {
    gsap.fromTo(
      el.children,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
        },
      }
    );
  });
}

/* reserve form */
const form = document.querySelector(".js_form");

if (form) {
  const thanks = document.querySelector(".js_thanks");
  const telPattern = /^0\d{9,10}$/;
  const mailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const kanaPattern = /^[ァ-ヶー\s　]+$/;

  const rules = {
    name: (form) => form.name.value.trim() !== "",
    kana: (form) => kanaPattern.test(form.kana.value.trim()),
    tel: (form) => telPattern.test(form.tel.value.replace(/[-\s]/g, "")),
    mail: (form) => mailPattern.test(form.mail.value.trim()),
    item: (form) => form.querySelectorAll('input[name="item"]:checked').length > 0,
    store: (form) => form.querySelector('input[name="store"]:checked') !== null,
    date: (form) => form.date.value !== "",
    privacy: (form) => form.privacy.checked,
  };

  const check = (key) => {
    const row = form.querySelector(`[data-field="${key}"]`);
    const ok = rules[key](form);
    row.classList.toggle("is-error", !ok);
    return ok;
  };

  Object.keys(rules).forEach((key) => {
    const row = form.querySelector(`[data-field="${key}"]`);
    row.addEventListener("change", () => {
      if (row.classList.contains("is-error")) {
        check(key);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const firstError = form.querySelector(".is-error");
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
