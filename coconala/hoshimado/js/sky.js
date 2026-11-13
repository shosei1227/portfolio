/* 今夜の空：選んだ日付・時刻・場所で、明るい星の高度と方位を計算し、頭の真上を中心にした星図に描く。
   星の位置は js/stars-data.js（data/stars.json から作る）。式は cg/sky.py と同じ。 */
(function () {
  "use strict";
  var DATA = window.HOSHI_STARS;
  var canvas = document.getElementById("sky-canvas");
  if (!DATA || !canvas) return;
  var ctx = canvas.getContext("2d");
  var $ = function (id) { return document.getElementById(id); };
  var dateIn = $("sky-date"), timeIn = $("sky-time"), timeOut = $("sky-time-out"), placeIn = $("sky-place"), linesIn = $("sky-lines"), playBtn = $("sky-play"), nowOut = $("sky-now");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var byId = {};
  DATA.stars.forEach(function (s) { byId[s[0]] = s; });
  var TINT = { betelgeuse: "#FFC08A", aldebaran: "#FFCB98", antares: "#FFB27F", pollux: "#FFE0BA", rigel: "#CFE0FF", sirius: "#DDE8FF", capella: "#FFF0CF", vega: "#E4ECFF", spica: "#D6E3FF", arcturus: "#FFDDB0" };
  var PLACE_NAME = { "43.06,141.35": "札幌", "38.27,140.87": "仙台", "35.68,139.69": "東京", "34.69,135.50": "大阪", "33.59,130.40": "福岡", "26.21,127.68": "那覇" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // 日本時間の暦の日付と、夕方6時からの分 → 世界時の Date
  function toDate(dateStr, minutes) {
    var p = dateStr.split("-").map(Number);
    var ms = Date.UTC(p[0], p[1] - 1, p[2], 18, 0) + minutes * 60000 - 9 * 3600000;
    return new Date(ms);
  }
  function clock(minutes) { var t = (18 * 60 + minutes) % 1440; return pad(Math.floor(t / 60)) + ":" + pad(t % 60); }
  function altaz(raH, decD, date, lat, lon) {
    var jd = date.getTime() / 86400000 + 2440587.5, d = jd - 2451545.0;
    var gmst = ((18.697374558 + 24.06570982441908 * d) % 24 + 24) % 24;
    var lst = (gmst + lon / 15) % 24;
    var H = (lst - raH) * 15 * Math.PI / 180, dec = decD * Math.PI / 180, phi = lat * Math.PI / 180;
    var alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    var x = -Math.sin(H) * Math.cos(dec), y = Math.cos(phi) * Math.sin(dec) - Math.sin(phi) * Math.cos(dec) * Math.cos(H);
    return [alt, Math.atan2(x, y)];
  }

  var size = 0, dpr = 1;
  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = Math.max(200, Math.round(r.width));
    canvas.width = size * dpr; canvas.height = size * dpr;
    draw();
  }

  function draw() {
    if (!size) return;
    var place = placeIn.value.split(",").map(Number);
    var minutes = Number(timeIn.value);
    var date = toDate(dateIn.value, minutes);
    var c = size / 2, R = size / 2 - 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.clip();
    // 高度30°・60°の目安の輪
    ctx.strokeStyle = "rgba(152,162,182,0.16)"; ctx.lineWidth = 1;
    [30, 60].forEach(function (a) { ctx.beginPath(); ctx.arc(c, c, R * (90 - a) / 90, 0, Math.PI * 2); ctx.stroke(); });
    var pos = {};
    DATA.stars.forEach(function (s) {
      var aa = altaz(s[2], s[3], date, place[0], place[1]);
      var alt = aa[0] * 180 / Math.PI, r = R * (90 - alt) / 90;
      pos[s[0]] = { x: c - r * Math.sin(aa[1]), y: c - r * Math.cos(aa[1]), alt: alt, s: s };
    });
    if (linesIn.checked) {
      ctx.strokeStyle = "rgba(194,154,91,0.55)"; ctx.lineWidth = 1;
      DATA.lines.forEach(function (g) {
        var dashed = g[0].indexOf("大三角") >= 0 || g[0].indexOf("四辺形") >= 0;
        ctx.setLineDash(dashed ? [4, 5] : []);
        g[1].forEach(function (pair) {
          var a = pos[pair[0]], b = pos[pair[1]];
          if (a.alt < -2 && b.alt < -2) return;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        });
      });
      ctx.setLineDash([]);
    }
    var visible = [];
    DATA.stars.forEach(function (s) {
      var p = pos[s[0]];
      if (p.alt < 0) return;
      var mag = s[4], rad = Math.max(0.9, 3.7 - 0.72 * mag) * (size / 560);
      var col = TINT[s[0]] || "#F4F6FB";
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 4);
      g.addColorStop(0, col); g.addColorStop(0.25, col); g.addColorStop(1, "rgba(244,246,251,0)");
      ctx.globalAlpha = 0.35; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rad * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
      if (mag < 1.0 || s[0] === "alcyone" || s[0] === "polaris") {
        ctx.font = (11 * size / 560 + 1).toFixed(1) + "px 'Zen Kaku Gothic New', sans-serif";
        ctx.fillStyle = "rgba(233,236,242,0.72)";
        ctx.fillText(s[1], p.x + rad + 5, p.y + 4);
      }
      visible.push(s);
    });
    ctx.restore();
    timeOut.textContent = clock(minutes);
    var d = toDate(dateIn.value, minutes); var j = new Date(d.getTime() + 9 * 3600000);
    visible.sort(function (a, b) { return a[4] - b[4]; });
    nowOut.textContent = j.getUTCFullYear() + "年" + (j.getUTCMonth() + 1) + "月" + j.getUTCDate() + "日 " + clock(minutes) + "、" + (PLACE_NAME[placeIn.value] || "") + "の空。明るい星：" + visible.slice(0, 4).map(function (s) { return s[1]; }).join("・");
  }

  // 初めの日時：今が夕方6時〜朝5時なら今、それ以外は今夜の10時
  (function init() {
    var now = new Date(), j = new Date(now.getTime() + 9 * 3600000);
    var h = j.getUTCHours(), m = j.getUTCMinutes();
    var base = new Date(j.getTime());
    var minutes = 240;
    if (h >= 18) minutes = (h - 18) * 60 + m;
    else if (h < 5) { minutes = (h + 6) * 60 + m; base = new Date(j.getTime() - 86400000); }
    dateIn.value = base.getUTCFullYear() + "-" + pad(base.getUTCMonth() + 1) + "-" + pad(base.getUTCDate());
    timeIn.value = String(Math.round(minutes / 5) * 5);
  })();

  var playing = false, last = 0, acc = 0;
  function step(t) {
    if (!playing) return;
    if (last) acc += (t - last) / 1000 * 30; // 1時間を2秒（1秒で30分）
    last = t;
    var v = Number(timeIn.value) + Math.floor(acc);
    acc -= Math.floor(acc);
    if (v >= Number(timeIn.max)) { v = Number(timeIn.max); stop(); }
    timeIn.value = String(v);
    draw();
    if (playing) requestAnimationFrame(step);
  }
  function stop() { playing = false; playBtn.setAttribute("aria-pressed", "false"); playBtn.textContent = "1時間を2秒で動かす"; }
  playBtn.addEventListener("click", function () {
    if (playing) { stop(); return; }
    if (Number(timeIn.value) >= Number(timeIn.max)) timeIn.value = "0";
    if (reduce) { timeIn.value = String(Math.min(Number(timeIn.max), Number(timeIn.value) + 60)); draw(); return; }
    playing = true; last = 0; acc = 0;
    playBtn.setAttribute("aria-pressed", "true"); playBtn.textContent = "止める";
    requestAnimationFrame(step);
  });
  [dateIn, timeIn, placeIn, linesIn].forEach(function (el) { el.addEventListener("input", draw); el.addEventListener("change", draw); });
  window.addEventListener("resize", resize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  resize();
})();
