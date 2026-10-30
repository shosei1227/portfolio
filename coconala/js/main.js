(() => {
    "use strict";

    const body = document.body;
    const header = document.querySelector("[data-header]");
    const menuButton = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const progressBar = document.querySelector(".page-progress span");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setMenu = (open) => {
        body.classList.toggle("menu-open", open);
        menuButton.setAttribute("aria-expanded", String(open));
        mobileMenu.setAttribute("aria-hidden", String(!open));
        menuButton.querySelector("span").textContent = open ? "Close" : "Menu";
    };

    menuButton.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && body.classList.contains("menu-open")) {
            setMenu(false);
            menuButton.focus();
        }
    });

    const updateScroll = () => {
        const scrollTop = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${scrollable > 0 ? scrollTop / scrollable : 0})`;
        header.classList.toggle("is-scrolled", scrollTop > 32);

        if (!reduceMotion && scrollTop < window.innerHeight * 1.2) {
            document.querySelectorAll(".hero-card").forEach((card, index) => {
                const factors = [0.07, -0.045, 0.095];
                card.style.translate = `0 ${scrollTop * factors[index]}px`;
            });
        }
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion && !window.location.hash) {
        body.classList.add("motion-ready");
        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    instance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -6%" });
        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
            observer.observe(item);
        });
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const filterButtons = document.querySelectorAll("[data-filter]");
    const workCards = document.querySelectorAll("[data-category]");
    const status = document.createElement("p");
    status.className = "sr-only";
    status.setAttribute("aria-live", "polite");
    document.querySelector(".work-filters").after(status);

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            filterButtons.forEach((item) => {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            let visibleCount = 0;
            workCards.forEach((card) => {
                const visible = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("is-filtered", !visible);
                if (visible) visibleCount += 1;
            });
            status.textContent = `${visibleCount}件の制作実績を表示しています。`;
        });
    });

    if (window.matchMedia("(pointer: fine)").matches) {
        const cursor = document.querySelector(".cursor-dot");
        document.addEventListener("pointermove", (event) => {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
            cursor.style.opacity = "1";
        });
        document.querySelectorAll("a, button").forEach((item) => {
            item.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
            item.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
        });
    }
})();
