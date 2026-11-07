/* 三刻珈琲 — 刻（とき）と営業状況の計算
   店は東京にあるので、見る人の時計がどこの時刻でも、東京の時刻で判断する。
   確認用に ?at=2026-11-07T20:30 を付けると、その時刻として表示する。 */
(function (root) {
  "use strict";

  var OPEN = 7 * 60, CLOSE = 22 * 60;           // 7:00〜22:00
  var TOKI = [
    { id: "asa",  name: "朝の刻", from: 7 * 60,  to: 11 * 60, bean: "エチオピア ゲデオ", roast: "浅煎り", food: "厚切りトースト", word: "浅煎りと、焼きたてのトースト。" },
    { id: "hiru", name: "昼の刻", from: 11 * 60, to: 17 * 60, bean: "コロンビア ウィラ", roast: "中煎り", food: "カヌレ",         word: "中煎りと、焼き菓子をひとつ。" },
    { id: "yoru", name: "夜の刻", from: 17 * 60, to: 22 * 60, bean: "インドネシア マンデリン", roast: "深煎り", food: "珈琲のプリン", word: "深煎りと、少しのお酒。" }
  ];
  var WEEK = ["日", "月", "火", "水", "木", "金", "土"];
  var HOLIDAY_WEEKDAY = 3;                        // 水曜定休

  /* 東京の年月日・曜日・時刻（分）を取り出す */
  function tokyo(date) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "short"
    }).formatToParts(date);
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { y: +o.year, m: +o.month, d: +o.day, wd: wd, min: (+o.hour) * 60 + (+o.minute) };
  }

  /* 年末年始（12/31〜1/3）と水曜は休み */
  function isClosedDay(t) {
    if (t.wd === HOLIDAY_WEEKDAY) return "定休日";
    if ((t.m === 12 && t.d === 31) || (t.m === 1 && t.d <= 3)) return "年末年始のお休み";
    return "";
  }

  function addDays(t, n) {
    var dt = new Date(Date.UTC(t.y, t.m - 1, t.d + n, 3));   // 東京の正午ごろ
    var r = tokyo(dt);
    r.min = 0;
    return r;
  }

  function nextOpenDay(t, fromTomorrow) {
    for (var i = fromTomorrow ? 1 : 0; i < 10; i++) {
      var c = i === 0 ? t : addDays(t, i);
      if (!isClosedDay(c)) return { t: c, after: i };
    }
    return { t: t, after: 0 };
  }

  function hm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ":" + (m < 10 ? "0" : "") + m;
  }

  function span(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (h === 0) return m + "分";
    return h + "時間" + (m ? m + "分" : "");
  }

  function dayLabel(after, t) {
    if (after === 0) return "今日";
    if (after === 1) return "明日";
    return t.m + "月" + t.d + "日（" + WEEK[t.wd] + "）";
  }

  /* 今の状況をまとめる */
  function status(date) {
    var t = tokyo(date || now());
    var closed = isClosedDay(t);
    var s = { t: t, week: WEEK[t.wd], date: t.m + "月" + t.d + "日（" + WEEK[t.wd] + "）", clock: hm(t.min) };
    if (!closed && t.min >= OPEN && t.min < CLOSE) {
      var k = TOKI.filter(function (x) { return t.min >= x.from && t.min < x.to; })[0];
      s.open = true;
      s.toki = k;
      s.left = CLOSE - t.min;
      s.tokiLeft = k.to - t.min;
      s.next = TOKI[TOKI.indexOf(k) + 1] || null;
      s.headline = "営業中";
      s.detail = hm(CLOSE) + "まで";
      s.longText = s.next ? "いまは" + k.name + "。" + hm(s.next.from) + "から" + s.next.name + "に替わります。" : "いまは" + k.name + "。閉店まであと" + span(s.left) + "です。";
    } else {
      var n = nextOpenDay(t, closed ? false : t.min >= CLOSE);
      if (closed) n = nextOpenDay(t, true);
      s.open = false;
      s.toki = null;
      s.reason = closed || (t.min < OPEN ? "開店前" : "本日の営業は終了");
      s.headline = closed ? "本日休み" : (t.min < OPEN ? "開店前" : "閉店");
      s.detail = dayLabel(n.after, n.t) + " " + hm(OPEN) + "から";
      s.longText = !closed && t.min < OPEN ? "開店前です。今日は" + hm(OPEN) + "に開きます。" :
                   (closed ? "今日は" + closed + "です。" : "今日は終わりました。") +
                   "次は" + dayLabel(n.after, n.t) + "の" + hm(OPEN) + "に開きます。";
    }
    /* 色と絵の刻。閉まっている時は夜の色で見せる */
    s.look = s.open ? s.toki.id : "yoru";
    s.dayRatio = Math.min(1, Math.max(0, (t.min - OPEN) / (CLOSE - OPEN)));
    return s;
  }

  function now() {
    var q = /[?&]at=([0-9T:\-]+)/.exec(root.location ? root.location.search : "");
    if (q) {
      /* ?at= は東京の時刻として読む */
      var d = new Date(q[1] + ":00+09:00");
      if (!isNaN(d)) return d;
    }
    return new Date();
  }

  root.Toki = { TOKI: TOKI, OPEN: OPEN, CLOSE: CLOSE, status: status, hm: hm, span: span, tokyo: tokyo, addDays: addDays, isClosedDay: isClosedDay, WEEK: WEEK, now: now };
})(window);
