/* 三刻珈琲 — 全ページ共通の動き
   1 営業状況を文字と色に反映する  2 焙煎の記録  3 刻の見本の切り替え  4 ヘッダー  5 表示の演出 */
(function () {
  "use strict";
  var T = window.Toki;
  var root = document.documentElement;
  root.classList.add("js");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var picked = null;   // 見本で選んだ刻（無ければ今の刻）

  /* ---------- 1 営業状況 ---------- */
  var THEME = { asa: "#efe6d8", hiru: "#f4f2ed", yoru: "#16100c" };

  function setText(key, text) {
    document.querySelectorAll('[data-s="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }

  function paint() {
    var s = T.status(T.now());
    var look = picked || s.look;
    root.dataset.toki = look;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME[look]);

    document.querySelectorAll('[data-s="state"]').forEach(function (el) { el.classList.toggle("is-open", !!s.open); });
    setText("headline", s.headline);
    setText("detail", s.detail);
    setText("long", s.longText);
    setText("clock", s.clock);
    setText("date", s.date);

    /* 1画面目に出す「この刻の一杯」。閉まっている時は、次に開いた時の朝の刻を出す */
    var k = s.open ? s.toki : T.TOKI[0];
    var shown = picked ? T.TOKI.filter(function (x) { return x.id === picked; })[0] : k;
    setText("toki-name", s.open ? s.toki.name : s.detail);
    setText("pick-label", picked ? "見本の刻の一杯" : s.open ? "この刻の一杯" : "次に開いた時の一杯");
    setText("bean", shown.bean);
    setText("roast", shown.roast);
    setText("word", shown.word);

    var pin = document.querySelector('[data-s="pin"]');
    if (pin) {
      pin.hidden = !s.open;
      pin.style.setProperty("--p", s.dayRatio.toFixed(4));
    }
    document.querySelectorAll("[data-seg]").forEach(function (el) { el.classList.toggle("is-now", !!s.open && el.dataset.seg === s.toki.id); });
    document.querySelectorAll("[data-now]").forEach(function (el) { el.hidden = !(s.open && el.dataset.now === s.toki.id); });
    document.querySelectorAll("[data-today]").forEach(function (el) { el.classList.toggle("is-today", +el.dataset.today === s.t.wd); });
    document.dispatchEvent(new CustomEvent("toki:paint", { detail: s }));
  }

  /* ---------- 2 焙煎の記録 ---------- */
  /* 月曜と木曜に焙煎する。今日から遡って、最近の焙煎日を求める */
  var ROAST_PLAN = {
    1: [["エチオピア ゲデオ", "浅煎り"], ["コロンビア ウィラ", "中煎り"], ["三刻ブレンド", "中深煎り"]],
    4: [["インドネシア マンデリン", "深煎り"], ["ケニア ニエリ", "浅煎り"], ["グアテマラ アンティグア", "中煎り"]]
  };
  function roastDays(count) {
    var t = T.tokyo(T.now());
    var out = [];
    for (var i = 0; out.length < count && i < 30; i++) {
      var d = T.addDays(t, -i);
      /* 焙煎は閉店後なので、今日の焙煎は22時を過ぎてから記録に載る */
      if (i === 0 && t.min < T.CLOSE) continue;
      if (ROAST_PLAN[d.wd]) out.push({ d: d, after: i, beans: ROAST_PLAN[d.wd] });
    }
    return out;
  }
  window.roastDays = roastDays;
  var log = document.querySelector('[data-s="roastlog"]');
  if (log) {
    var days = roastDays(2), rows = [];
    days.forEach(function (r) {
      r.beans.slice(0, 2).forEach(function (b) {
        rows.push("<tr><td class=\"mono\">" + r.d.m + "/" + (r.d.d < 10 ? "0" : "") + r.d.d + "（" + T.WEEK[r.d.wd] + "）</td><td>" + b[0] + "</td><td>" + b[1] + "</td></tr>");
      });
    });
    log.innerHTML = rows.join("");
  }

  /* ---------- 3 刻の見本の切り替え ---------- */
  document.querySelectorAll("[data-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.dataset.pick;
      picked = v === "reset" ? null : v;
      document.querySelectorAll(".tk[data-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.pick === picked)); });
      var reset = document.querySelector('[data-pick="reset"]');
      if (reset) reset.hidden = !picked;
      paint();
    });
  });

  /* ---------- 4 ヘッダー ---------- */
  var head = document.querySelector(".head");
  if (head) {
    var solid = function () { head.classList.toggle("is-solid", window.scrollY > 40); };
    window.addEventListener("scroll", solid, { passive: true });
    solid();
  }

  /* ---------- 5 表示の演出 ---------- */
  /* 最初の画面より下にある要素だけを、画面に入った時に持ち上げる */
  if (!calm && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove("is-before"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("is-before"); io.observe(el); }
    });
  }

  paint();
  setInterval(paint, 30000);
  window.paintToki = paint;
})();
