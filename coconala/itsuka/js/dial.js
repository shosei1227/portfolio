/* 献立ページの暦の輪。回すと七十二候を選べる。 */
(function () {
  "use strict";
  var K = window.Koyomi;
  var dial = document.querySelector("[data-dial]");
  if (!dial) return;

  var NS = "http://www.w3.org/2000/svg";
  var ring = dial.querySelector(".dial__ring");
  var panel = document.querySelector("[data-kou]");
  var today = K.today();
  var todayIndex = K.indexOf(today.m, today.d);
  var turns = 0;       /* 輪を回した総量。71から0へ移る時に逆回転しないために持つ */
  var cur = todayIndex;
  var sekkiLabels = [];

  /* 72本の目盛りと24の節気を描く */
  for (var i = 0; i < 72; i++) {
    var deg = i * 5;
    var major = i % 3 === 0;
    var t = document.createElementNS(NS, "line");
    t.setAttribute("x1", 500);
    t.setAttribute("x2", 500);
    t.setAttribute("y1", major ? 34 : 44);
    t.setAttribute("y2", 66);
    t.setAttribute("class", "dial__tick" + (major ? " is-major" : ""));
    t.setAttribute("transform", "rotate(" + deg + " 500 500)");
    ring.appendChild(t);
    if (major) {
      var s = document.createElementNS(NS, "text");
      s.textContent = K.SEKKI[i / 3].n;
      s.setAttribute("class", "dial__sekki");
      s.setAttribute("x", 500);
      s.setAttribute("y", 84);
      s.setAttribute("writing-mode", "vertical-rl");
      s.setAttribute("text-anchor", "start");
      s.setAttribute("transform", "rotate(" + deg + " 500 500)");
      ring.appendChild(s);
      sekkiLabels.push(s);
    }
  }

  function show(i, animate) {
    var k = K.info(i);
    cur = k.index;
    K.paint(k.sekki);
    K.fill(panel, k);
    K.fill(dial, k);
    window.renderMenu(panel.querySelector("[data-menu=dial]"), k);
    sekkiLabels.forEach(function (l, n) { l.classList.toggle("is-now", n === Math.floor(cur / 3)); });
    dial.setAttribute("aria-valuenow", String(cur + 1));
    dial.setAttribute("aria-valuetext", k.sekki.n + " " + k.phase + " " + k.name + "（" + k.yomi + "）" + k.range);
    var isToday = cur === todayIndex;
    panel.querySelector("[data-when]").textContent = isToday ? "いまの候" : "この候の御品書き";
    document.querySelector("[data-back]").hidden = isToday;
  }

  function turnTo(i) {
    /* 近い向きへ回す */
    var base = ((turns % 72) + 72) % 72;
    var diff = ((i - base + 108) % 72) - 36;
    turns += diff;
    ring.style.transform = "rotate(" + -turns * 5 + "deg)";
    show(i);
  }

  /* つまんで回す */
  var drag = null;
  function angle(e) {
    var r = dial.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  }
  dial.addEventListener("pointerdown", function (e) {
    drag = { a: angle(e), t: turns };
    dial.setPointerCapture(e.pointerId);
    dial.classList.add("is-drag");
  });
  dial.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var d = angle(e) - drag.a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    drag.a += d;
    drag.t -= d / 5;
    ring.style.transform = "rotate(" + -drag.t * 5 + "deg)";
    var n = Math.round(drag.t);
    if (n !== turns) { turns = n; show(((n % 72) + 72) % 72); }
  });
  function end() {
    if (!drag) return;
    drag = null;
    dial.classList.remove("is-drag");
    ring.style.transform = "rotate(" + -turns * 5 + "deg)";
  }
  dial.addEventListener("pointerup", end);
  dial.addEventListener("pointercancel", end);

  /* 矢印キーでも回せる */
  dial.addEventListener("keydown", function (e) {
    var step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 3, PageDown: -3 }[e.key];
    if (step) {
      e.preventDefault();
      turnTo((cur + step + 72) % 72);
    }
    if (e.key === "Home") { e.preventDefault(); turnTo(todayIndex); }
  });

  document.querySelector("[data-prev]").addEventListener("click", function () { turnTo((cur + 71) % 72); });
  document.querySelector("[data-next]").addEventListener("click", function () { turnTo((cur + 1) % 72); });
  document.querySelector("[data-back]").addEventListener("click", function () { turnTo(todayIndex); });

  /* 最初は今日の位置から始める */
  turns = todayIndex;
  ring.style.transition = "none";
  ring.style.transform = "rotate(" + -turns * 5 + "deg)";
  requestAnimationFrame(function () { requestAnimationFrame(function () { ring.style.transition = ""; }); });
  show(todayIndex);
})();
