/* 作品目録の見方（格子・表・色）と絞り込み（連作・年代・素材）。
   選んだ条件はアドレスの ?view=…&series=…&decade=…&material=… に残すので、そのまま人に送れる。
   JavaScript が動かない時は、30点が格子で番号の順に並んだまま見える。 */
(function () {
  "use strict";
  var form = document.getElementById("ctrl");
  var cat = document.getElementById("cat");
  var list = document.getElementById("list");
  var count = document.getElementById("count");
  var empty = document.getElementById("empty");
  if (!form || !cat || !list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll(".item"));
  var KEYS = ["view", "series", "decade", "material"];
  var DEFAULT = { view: "grid", series: "all", decade: "all", material: "all" };

  // 色の見方の並び順：影の色の色相（赤→紫）、無色に近い物は最後。同じなら番号の順
  var colorOrder = items.slice().sort(function (a, b) {
    var d = Number(a.dataset.hue) - Number(b.dataset.hue);
    return d !== 0 ? d : Number(a.dataset.no) - Number(b.dataset.no);
  });
  colorOrder.forEach(function (li, i) { li.dataset.colorOrder = String(i); });

  function labelOf(name, value) {
    var input = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    return input ? input.nextElementSibling.textContent : "";
  }

  function read() {
    var s = {};
    KEYS.forEach(function (k) {
      var el = form.querySelector('input[name="' + k + '"]:checked');
      s[k] = el ? el.value : DEFAULT[k];
    });
    return s;
  }

  function set(s) {
    KEYS.forEach(function (k) {
      var el = form.querySelector('input[name="' + k + '"][value="' + s[k] + '"]');
      if (el) el.checked = true;
    });
  }

  function fromURL() {
    var q = new URLSearchParams(location.search);
    var s = {};
    KEYS.forEach(function (k) {
      var v = q.get(k);
      s[k] = v && form.querySelector('input[name="' + k + '"][value="' + v + '"]') ? v : DEFAULT[k];
    });
    return s;
  }

  function toURL(s) {
    var q = new URLSearchParams();
    KEYS.forEach(function (k) { if (s[k] !== DEFAULT[k]) q.set(k, s[k]); });
    var str = q.toString();
    try { history.replaceState(null, "", location.pathname + (str ? "?" + str : "") + location.hash); } catch (e) { /* file:// などでは書き換えない */ }
  }

  function apply(s) {
    cat.dataset.view = s.view;
    var shown = 0;
    items.forEach(function (li) {
      var ok = (s.series === "all" || li.dataset.series === s.series) &&
               (s.decade === "all" || li.dataset.decade === s.decade) &&
               (s.material === "all" || li.dataset.material === s.material);
      li.hidden = !ok;
      li.style.order = s.view === "color" ? li.dataset.colorOrder : "";
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;

    var conds = [];
    if (s.series !== "all") conds.push("連作「" + labelOf("series", s.series) + "」");
    if (s.decade !== "all") conds.push(labelOf("decade", s.decade));
    if (s.material !== "all") conds.push(labelOf("material", s.material));
    var order = s.view === "color" ? "光の色の順" : "番号の順";
    if (!conds.length) count.textContent = "30点すべてを" + order + "に表示しています";
    else count.textContent = conds.join("・") + "の" + shown + "点を" + order + "に表示しています（30点中）";

    var filtered = s.series !== "all" || s.decade !== "all" || s.material !== "all";
    document.getElementById("reset").hidden = !filtered;
    toURL(s);
  }

  form.addEventListener("change", function () { apply(read()); });
  form.addEventListener("submit", function (ev) { ev.preventDefault(); });

  // 「絞り込みを外す」は見方を変えずに、連作・年代・素材だけを「すべて」に戻す
  function clearFilters(ev) {
    if (ev) ev.preventDefault();
    var s = read();
    s.series = s.decade = s.material = "all";
    set(s);
    apply(s);
  }
  form.addEventListener("reset", clearFilters);
  document.getElementById("empty-reset").addEventListener("click", function () {
    clearFilters();
    form.querySelector('input[name="series"]:checked').focus();
  });

  var start = fromURL();
  set(start);
  apply(start);
})();
