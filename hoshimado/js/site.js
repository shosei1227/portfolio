/* 上の帯の線・部屋の明かり・スマートフォンの下の帯・注文欄・最後の節の星 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 上の帯：少し下へ送ったら下に線を出す
  var head = document.querySelector(".head");
  function onScroll() { head.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 部屋の明かり
  var room = $("room"), roomBtn = $("room-btn");
  roomBtn.addEventListener("click", function () {
    var dark = !room.classList.contains("is-dark");
    room.classList.toggle("is-dark", dark);
    roomBtn.setAttribute("aria-pressed", String(dark));
    roomBtn.textContent = dark ? "部屋の明かりをつける" : "部屋の明かりを消す";
  });

  // スマートフォンの下の帯：1画面目を過ぎてから、注文の節に入るまで出す
  var dock = $("dock"), hero = document.querySelector(".hero"), order = $("order");
  if ("IntersectionObserver" in window) {
    var heroOut = false, orderIn = false;
    var update = function () {
      var on = heroOut && !orderIn;
      dock.classList.toggle("is-on", on);
      dock.setAttribute("aria-hidden", String(!on));
      dock.querySelector("a").tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (es) { orderIn = es[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(order);
  }

  // 注文欄：合計を出し、確かめるを押したら内容を出す（架空の製品なので、どこにも送らない）
  var form = $("buy-form"), qty = $("buy-qty"), total = $("buy-total"), done = $("buy-done");
  var PRICE = 39800;
  function yen(n) { return n.toLocaleString("ja-JP") + "円"; }
  function color() { var c = form.querySelector("input[name=color]:checked"); return c ? c.value : "夜藍"; }
  function refresh() { total.textContent = yen(PRICE * Number(qty.value)); done.hidden = true; }
  form.addEventListener("change", refresh);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    done.innerHTML = "<b>" + color() + "</b>を" + qty.value + "台、合計 <b>" + yen(PRICE * Number(qty.value)) + "</b>（税込・送料無料）。<br>このページは架空の製品のLPのため、注文は送られていません。";
    done.hidden = false;
  });
  refresh();

  // 最後の節の背景の星（飾り。位置は乱数）
  var cv = $("order-stars");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), stars = [], w = 0, h = 0, dpr = 1, seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var i = 0; i < 260; i++) stars.push({ x: rnd(), y: rnd(), r: 0.4 + Math.pow(rnd(), 3) * 1.6, a: 0.25 + rnd() * 0.6, p: rnd() * 6.28 });
    var size = function () { var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; paint(0); };
    var paint = function (t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      stars.forEach(function (s) {
        var tw = reduce ? 1 : 0.75 + 0.25 * Math.sin(t / 1400 + s.p);
        ctx.globalAlpha = s.a * tw; ctx.fillStyle = "#EEF1F6";
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283); ctx.fill();
      });
    };
    var running = false;
    var loop = function (t) { if (!running) return; paint(t); requestAnimationFrame(loop); };
    window.addEventListener("resize", size);
    size();
    if (!reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { var on = es[0].isIntersecting; if (on && !running) { running = true; requestAnimationFrame(loop); } else if (!on) running = false; }).observe(cv);
    }
  }
})();
