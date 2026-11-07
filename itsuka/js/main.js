/* 全ページ共通の動き：今日の暦の反映、ヘッダーの色、表示の演出、湯気 */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var K = window.Koyomi;
  var today = K.today();
  var idx = K.indexOf(today.m, today.d);
  var now = K.info(idx);
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 今日の暦を、色と文字に反映する */
  K.paint(now.sekki);
  K.fill(document, now, today);

  /* 御品書きを今の候の内容にする（献立ページは dial.js が受け持つ） */
  var list = document.querySelector("[data-menu=now]");
  if (list) renderMenu(list, now);

  function renderMenu(el, k) {
    el.innerHTML = "";
    k.menu.forEach(function (row) {
      var li = document.createElement("li");
      if (row[0] === "椀") li.className = "is-wan";
      var b = document.createElement("b");
      b.textContent = row[0];
      var s = document.createElement("span");
      s.textContent = row[1];
      li.append(b, s);
      el.appendChild(li);
    });
  }
  window.renderMenu = renderMenu;

  /* 小さな暦の輪（トップの左下）：72本の目盛りと今日の位置 */
  var hand = document.querySelector("[data-hand]");
  if (hand) {
    var NS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 72; i++) {
      var a = (i / 72) * Math.PI * 2 - Math.PI / 2;
      var on = i === idx;
      var r1 = on ? 30 : i % 3 === 0 ? 40 : 43;
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", 50 + Math.cos(a) * r1);
      line.setAttribute("y1", 50 + Math.sin(a) * r1);
      line.setAttribute("x2", 50 + Math.cos(a) * 47);
      line.setAttribute("y2", 50 + Math.sin(a) * 47);
      line.setAttribute("stroke", on ? "var(--shun)" : "currentColor");
      line.setAttribute("stroke-opacity", on ? "1" : "0.5");
      line.setAttribute("stroke-width", on ? "1.6" : "0.7");
      hand.appendChild(line);
    }
  }

  /* 紙の面に重なった時だけ、ヘッダーの文字を黒にする */
  var head = document.querySelector(".head");
  var papers = document.querySelectorAll(".paper");
  if (head && papers.length) {
    var hit = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) hit.add(e.target);
        else hit.delete(e.target);
      });
      head.classList.toggle("on-paper", hit.size > 0);
    }, { rootMargin: "-34px 0px -92% 0px" });
    papers.forEach(function (p) { io.observe(p); });
  }

  /* スクロールしたらヘッダーに地の色を敷く */
  if (head) {
    var solid = function () { head.classList.toggle("is-solid", window.scrollY > 40); };
    window.addEventListener("scroll", solid, { passive: true });
    solid();
  }

  /* 画面に入った要素を静かに出す */
  var rvs = document.querySelectorAll(".rv");
  if (calm || !("IntersectionObserver" in window)) {
    rvs.forEach(function (e) { e.classList.add("is-in"); });
  } else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    rvs.forEach(function (e) { ro.observe(e); });
  }

  /* 湯気：椀の上にやわらかい粒を上らせる */
  var cv = document.querySelector(".hero__steam");
  if (cv && !calm) steam(cv);

  function steam(canvas) {
    var ctx = canvas.getContext("2d");
    var img = document.querySelector(".hero__img");
    /* 画像の中で椀の中心がある位置（0〜1） */
    var FX = 0.69, FY = 0.42, IW = 1920, IH = 1080;
    var W = 0, H = 0, ox = 0, oy = 0, spread = 0, ps = [], running = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    var sprite = document.createElement("canvas");
    sprite.width = sprite.height = 128;
    var sc = sprite.getContext("2d");
    var g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(236,226,210,0.5)");
    g.addColorStop(0.5, "rgba(236,226,210,0.14)");
    g.addColorStop(1, "rgba(236,226,210,0)");
    sc.fillStyle = g;
    sc.fillRect(0, 0, 128, 128);

    function resize() {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* object-fit: cover での画像の拡大率と、はみ出した分を計算する */
      var s = Math.max(W / IW, H / IH);
      var pos = getComputedStyle(img).objectPosition.split(" ").map(parseFloat);
      ox = (W - IW * s) * (pos[0] / 100) + IW * s * FX;
      oy = (H - IH * s) * (pos[1] / 100) + IH * s * FY;
      spread = IW * s * 0.1;
    }
    function spawn(p, fresh) {
      p.x = ox + (Math.random() - 0.5) * spread * 1.6;
      p.y = oy + (fresh ? 0 : -Math.random() * spread * 3);
      p.r = spread * (0.35 + Math.random() * 0.4);
      p.v = 0.16 + Math.random() * 0.2;
      p.ph = Math.random() * 6.28;
      p.life = fresh ? 0 : Math.random();
      p.span = 520 + Math.random() * 400;
    }
    resize();
    for (var i = 0; i < 26; i++) { var p = {}; spawn(p, false); ps.push(p); }
    window.addEventListener("resize", resize);

    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.life += 1 / p.span;
        if (p.life >= 1) spawn(p, true);
        p.y -= p.v;
        p.x += Math.sin(t * 0.0005 + p.ph + p.life * 5) * 0.2;
        var a = Math.sin(p.life * Math.PI) * 0.1;
        var r = p.r * (1 + p.life * 1.5);
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
      }
      requestAnimationFrame(frame);
    }
    /* 画面から外れている間は止める */
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !running) { running = true; requestAnimationFrame(frame); }
      if (!v) running = false;
    }).observe(canvas);
    requestAnimationFrame(frame);
  }
})();
