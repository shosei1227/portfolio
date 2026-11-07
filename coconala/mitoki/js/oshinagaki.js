/* お品書きのタブ。最初は今の刻（閉まっている時は朝）を開く。#hiru のように付けて開くと、その刻から見せる。
   矢印キー・Home・End でも動く（WAI-ARIA のタブの作法） */
(function () {
  "use strict";
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  if (!tabs.length) return;

  function select(id, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      select(t.dataset.tab);
      history.replaceState(null, "", "#" + t.dataset.tab);
    });
    t.addEventListener("keydown", function (e) {
      var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      n = (n + tabs.length) % tabs.length;
      select(tabs[n].dataset.tab, true);
    });
  });

  var hash = location.hash.replace("#", "");
  var s = window.Toki.status(window.Toki.now());
  select(["asa", "hiru", "yoru"].indexOf(hash) >= 0 ? hash : (s.open ? s.toki.id : "asa"));
})();
