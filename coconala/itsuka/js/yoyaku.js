/* ご予約ページ：空いている日の一覧、日付に応じた椀の表示、入力の確認。
   架空の店なので送信はしない。入力した内容はどこにも保存しない。 */
(function () {
  "use strict";
  var K = window.Koyomi;
  var form = document.querySelector("[data-form]");
  if (!form) return;
  var dateSel = form.elements.date;
  var info = document.querySelector("[data-dayinfo]");
  var done = document.querySelector("[data-done]");
  var WEEK = ["日", "月", "火", "水", "木", "金", "土"];

  /* 営業日（火〜土）を今日の3日後から18日分だけ出す */
  var t = K.today();
  var day = new Date(t.y, t.m - 1, t.d + 3);
  var count = 0;
  while (count < 18) {
    var w = day.getDay();
    if (w >= 2 && w <= 6) {
      var o = document.createElement("option");
      o.value = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();
      o.textContent = (day.getMonth() + 1) + "月" + day.getDate() + "日（" + WEEK[w] + "）";
      dateSel.appendChild(o);
      count++;
    }
    day.setDate(day.getDate() + 1);
  }

  function showDay() {
    var p = dateSel.value.split("-").map(Number);
    var k = K.info(K.indexOf(p[1], p[2]));
    info.textContent = "";
    var b = document.createElement("b");
    b.textContent = k.wan;
    info.append(k.sekki.n + " " + k.phase + "「" + k.name + "」の日です。この日の椀は ", b, " です。");
  }
  dateSel.addEventListener("change", showDay);
  showDay();

  /* 入力の確認。項目ごとに直し方を言葉で出す */
  var RULES = {
    name: function (v) { return v.trim() ? "" : "お名前を入力してください。"; },
    tel: function (v) { return /^[0-9０-９+\-\s()]{9,}$/.test(v.trim()) ? "" : "電話番号を数字で入力してください。"; },
    mail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "メールアドレスの形を確かめてください。"; }
  };
  function check(name) {
    var el = form.elements[name];
    var msg = RULES[name](el.value);
    var out = form.querySelector('[data-err="' + name + '"]');
    out.textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  Object.keys(RULES).forEach(function (n) {
    form.elements[n].addEventListener("blur", function () { check(n); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = Object.keys(RULES).filter(function (n) { return !check(n); });
    var agree = form.elements.agree.checked;
    form.querySelector('[data-err="agree"]').textContent = agree ? "" : "内容をご確認のうえ、チェックを入れてください。";
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    if (!agree) { form.elements.agree.focus(); return; }

    var rows = [
      ["日にち", dateSel.options[dateSel.selectedIndex].text + " 18時30分"],
      ["人数", form.elements.people.value + "名"],
      ["お名前", form.elements.name.value.trim()]
    ];
    var dl = done.querySelector("dl");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      var d = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = r[0];
      dd.textContent = r[1];
      d.append(dt, dd);
      dl.appendChild(d);
    });
    form.hidden = true;
    done.hidden = false;
    done.querySelector("h2").focus();
  });

  done.querySelector("[data-again]").addEventListener("click", function () {
    done.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
