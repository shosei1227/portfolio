/* 豆のページ：量と値段、焙煎日の計算、かご（見本。送信しない） */
(function () {
  "use strict";
  var T = window.Toki;
  var KEY = "mitoki-cart";
  var yen = function (n) { return n.toLocaleString("ja-JP") + "円"; };

  /* ---------- 豆ごとの焙煎日 ---------- */
  var WHEN = { gedeo: 1, huila: 1, blend: 1, mandheling: 4, nyeri: 4, antigua: 4 };   // 1=月曜 4=木曜
  var t = T.tokyo(T.now());
  document.querySelectorAll(".bean").forEach(function (b) {
    var wd = WHEN[b.dataset.id], last = null, next = null;
    for (var i = 0; i < 8; i++) {
      var d = T.addDays(t, -i);
      if (d.wd === wd && !(i === 0 && t.min < T.CLOSE)) { last = { d: d, after: i }; break; }
    }
    for (var j = 0; j < 8; j++) {
      var e = T.addDays(t, j);
      if (e.wd === wd && !(j === 0 && t.min >= T.CLOSE)) { next = e; break; }
    }
    var el = b.querySelector("[data-roasted]");
    if (el && last && next) {
      el.textContent = "焙煎　前回 " + last.d.m + "/" + last.d.d + "（" + T.WEEK[last.d.wd] + "）・次回 " + next.m + "/" + next.d + "（" + T.WEEK[next.wd] + "）";
    }
  });

  /* ---------- 焙煎の記録（最近4回） ---------- */
  var full = document.querySelector('[data-s="roastlog-full"]');
  if (full && window.roastDays) {
    full.innerHTML = window.roastDays(4).map(function (r) {
      var age = r.after === 0 ? "今夜" : r.after + "日";
      return "<tr><td class=\"mono\">" + r.d.m + "/" + (r.d.d < 10 ? "0" : "") + r.d.d + "（" + T.WEEK[r.d.wd] + "）</td><td>" +
        r.beans.map(function (x) { return x[0]; }).join("、") + "</td><td class=\"mono\">" + age + "</td></tr>";
    }).join("");
  }

  /* ---------- かご ---------- */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { cart = []; }
  var box = document.querySelector("[data-cart]");

  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  function render() {
    var lines = box.querySelector("[data-lines]");
    lines.innerHTML = "";
    var sum = 0, count = 0;
    cart.forEach(function (c, i) {
      sum += c.price * c.qty;
      count += c.qty;
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.textContent = c.name + " " + c.g + "g × " + c.qty;
      var p = document.createElement("span");
      p.className = "mono";
      p.textContent = yen(c.price * c.qty);
      var del = document.createElement("button");
      del.type = "button";
      del.textContent = "−";
      del.setAttribute("aria-label", c.name + " " + c.g + "g を1つ減らす");
      del.addEventListener("click", function () {
        c.qty -= 1;
        if (c.qty <= 0) cart.splice(i, 1);
        save(); render();
      });
      li.append(name, p, del);
      lines.appendChild(li);
    });
    var ship = sum >= 3000 || sum === 0 ? 0 : 500;
    box.querySelector("[data-sum]").textContent = yen(sum + ship);
    box.querySelector("[data-ship]").textContent = sum === 0 ? "かごは空です" : ship ? "送料500円を含みます（あと" + yen(3000 - sum) + "で無料）" : "送料は無料です";
    box.querySelector("[data-order]").disabled = sum === 0;
    document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = count; });
  }

  document.querySelectorAll(".bean").forEach(function (b) {
    var sel = b.querySelector("select"), out = b.querySelector(".yen");
    var price = function () { return +b.dataset["p" + sel.value]; };
    sel.addEventListener("change", function () { out.textContent = yen(price()); });
    b.querySelector("[data-add]").addEventListener("click", function () {
      var name = b.querySelector("h2").textContent, g = sel.value;
      var hit = cart.filter(function (c) { return c.id === b.dataset.id && c.g === g; })[0];
      if (hit) hit.qty += 1; else cart.push({ id: b.dataset.id, name: name, g: g, price: price(), qty: 1 });
      save(); render();
      box.hidden = false;
      box.querySelector("[data-done]").hidden = true;
    });
  });
  box.querySelector("[data-close]").addEventListener("click", function () { box.hidden = true; });
  box.querySelector("[data-order]").addEventListener("click", function () { box.querySelector("[data-done]").hidden = false; });
  document.querySelectorAll("[data-open-cart]").forEach(function (b) { b.addEventListener("click", function () { box.hidden = !box.hidden; }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") box.hidden = true; });
  render();
})();
