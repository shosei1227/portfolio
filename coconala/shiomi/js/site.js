/* 作品のページの「書き方をコピー」と、連絡のページの入力の確かめ。 */
(function () {
  "use strict";

  // ---- 書き方をコピー：data-copy に書いた id の文をクリップボードへ。使えない時は文を選んだ状態にする
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var src = document.getElementById(btn.dataset.copy);
    var done = document.getElementById(btn.dataset.copy + "-done");
    if (!src) return;
    function selectText() {
      var r = document.createRange();
      r.selectNodeContents(src);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      if (done) done.textContent = "文を選びました。Ctrl＋C（Mac は ⌘＋C）でコピーできます。";
    }
    btn.addEventListener("click", function () {
      var text = src.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          if (done) done.textContent = "コピーしました。";
        }, selectText);
      } else {
        selectText();
      }
    });
  });

  // ---- 連絡：送る前に、空の欄とメールアドレスの形を確かめ、送る内容を並べて見せる（実際には送らない）
  var form = document.getElementById("form");
  if (!form) return;
  var err = document.getElementById("form-err");
  var sent = document.getElementById("sent");
  var sentList = document.getElementById("sent-list");
  var fields = [
    { el: document.getElementById("f-name"), label: "お名前", need: true },
    { el: document.getElementById("f-mail"), label: "メールアドレス", need: true, mail: true },
    { el: document.getElementById("f-work"), label: "作品" },
    { el: document.getElementById("f-body"), label: "内容", need: true }
  ];

  function check() {
    var bad = [];
    fields.forEach(function (f) {
      var v = f.el.value.trim();
      var ng = (f.need && !v) || (f.mail && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      f.el.setAttribute("aria-invalid", ng ? "true" : "false");
      if (ng) bad.push(f);
    });
    return bad;
  }

  fields.forEach(function (f) {
    f.el.addEventListener("input", function () {
      if (f.el.getAttribute("aria-invalid") === "true") check();
    });
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var bad = check();
    if (bad.length) {
      err.textContent = bad.map(function (f) {
        return f.mail && f.el.value.trim() ? "メールアドレスの形を確かめてください（「@」と、その後ろに「.」が要ります）" : f.label + "を書いてください";
      }).join("。") + "。";
      err.hidden = false;
      bad[0].el.focus();
      return;
    }
    err.hidden = true;
    var kind = form.querySelector('input[name="kind"]:checked');
    var rows = [["用件", kind ? kind.nextElementSibling.textContent : ""]];
    fields.forEach(function (f) {
      var v = f.el.tagName === "SELECT" ? (f.el.value ? f.el.options[f.el.selectedIndex].text : "選ばない") : f.el.value.trim();
      rows.push([f.label, v]);
    });
    sentList.textContent = "";
    rows.forEach(function (r) {
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = r[0];
      dd.textContent = r[1];
      dd.style.whiteSpace = "pre-wrap";
      sentList.appendChild(dt);
      sentList.appendChild(dd);
    });
    form.hidden = true;
    sent.hidden = false;
    sent.focus();
  });

  document.getElementById("sent-back").addEventListener("click", function () {
    sent.hidden = true;
    form.hidden = false;
    fields[0].el.focus();
  });
})();
