(() => {
    "use strict";

    const body = document.body;
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-button");
    const menu = document.querySelector(".global-menu");
    const menuLinks = menu.querySelectorAll("a");
    const progressBar = document.querySelector(".progress__bar");
    const heroImage = document.querySelector(".hero__media img");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setMenu = (isOpen) => {
        body.classList.toggle("menu-open", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menu.setAttribute("aria-hidden", String(!isOpen));
        menuButton.querySelector(".menu-button__label").textContent = isOpen ? "Close" : "Menu";
    };

    menuButton.addEventListener("click", () => {
        setMenu(!body.classList.contains("menu-open"));
    });

    menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && body.classList.contains("menu-open")) {
            setMenu(false);
            menuButton.focus();
        }
    });

    const updateScroll = () => {
        const scrollTop = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? scrollTop / scrollable : 0;

        progressBar.style.transform = `scaleX(${progress})`;
        header.classList.toggle("is-scrolled", scrollTop > 40);

        if (!reduceMotion && scrollTop < window.innerHeight * 1.25) {
            heroImage.style.transform = `translateY(${scrollTop * 0.13}px) scale(1.02)`;
        }
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const revealItems = document.querySelectorAll(".reveal, .image-reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -8%" });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    window.addEventListener("load", () => body.classList.add("is-ready"));
})();
