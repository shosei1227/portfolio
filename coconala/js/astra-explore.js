(() => {
    "use strict";

    const API = "https://images-api.nasa.gov/search";
    const PAGE_SIZE = 24;

    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const grid = document.getElementById("results-grid");
    const status = document.getElementById("results-status");
    const more = document.getElementById("results-more");
    const chips = document.querySelectorAll(".search__chips button");

    let query = "";
    let page = 1;
    let shown = 0;
    let request = null;

    const formatDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    };

    const createCard = (item) => {
        const data = item.data && item.data[0];
        const thumb = item.links && item.links.find((link) => link.rel === "preview") || (item.links && item.links[0]);
        if (!data || !thumb) return null;

        const li = document.createElement("li");
        li.className = "result";

        const link = document.createElement("a");
        link.href = `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const figure = document.createElement("div");
        figure.className = "result__image";
        const img = document.createElement("img");
        img.src = thumb.href;
        img.alt = data.title || "";
        img.loading = "lazy";
        img.decoding = "async";
        figure.append(img);

        const title = document.createElement("h3");
        title.textContent = data.title || data.nasa_id;

        const meta = document.createElement("p");
        meta.className = "result__meta";
        meta.textContent = [formatDate(data.date_created), data.center].filter(Boolean).join(" / ");

        const open = document.createElement("span");
        open.className = "result__open";
        open.setAttribute("aria-hidden", "true");
        open.textContent = "↗";

        link.append(figure, title, meta, open);
        li.append(link);
        return li;
    };

    const search = async (nextQuery, append = false) => {
        if (!nextQuery) return;
        if (request) request.abort();
        request = new AbortController();

        if (!append) {
            query = nextQuery;
            page = 1;
            shown = 0;
            grid.replaceChildren();
        }

        chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.q === query)));
        status.textContent = "読み込み中…";
        more.hidden = true;
        grid.setAttribute("aria-busy", "true");

        const params = new URLSearchParams({ q: query, media_type: "image", page: String(page), page_size: String(PAGE_SIZE) });

        try {
            const response = await fetch(`${API}?${params}`, { signal: request.signal });
            if (!response.ok) throw new Error(String(response.status));
            const json = await response.json();
            const items = json.collection.items || [];
            const total = json.collection.metadata ? json.collection.metadata.total_hits : items.length;

            const cards = items.map(createCard).filter(Boolean);
            grid.append(...cards);
            shown += cards.length;

            status.textContent = shown
                ? `「${query}」 ${total.toLocaleString("ja-JP")}件中 ${shown}件を表示`
                : `「${query}」に合う画像は見つかりませんでした。別の英語のキーワードを試してください。`;
            more.hidden = !(shown && items.length === PAGE_SIZE && shown < total);
        } catch (error) {
            if (error.name === "AbortError") return;
            status.textContent = "NASAの画像ライブラリに接続できませんでした。時間をおいて、もう一度お試しください。";
        } finally {
            grid.removeAttribute("aria-busy");
        }
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        search(input.value.trim());
    });

    chips.forEach((chip) => chip.addEventListener("click", () => {
        input.value = chip.dataset.q;
        search(chip.dataset.q);
    }));

    more.addEventListener("click", () => {
        page += 1;
        search(query, true);
    });

    search(input.value.trim());
})();
