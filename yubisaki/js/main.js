(() => {
  'use strict';

  /****************************************
    設定（ここを変えると見た目と反応が変わる）
  *****************************************/
  const MP_VERSION = '0.10.14';
  const MP = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

  // 色の組。1組は「親指側 → 中指 → 小指側」の3色。色が変わるたびに次の組へ進む
  const PALETTES = [
    [[255, 92, 57], [255, 181, 46], [255, 238, 170]],   // 朱 → 山吹
    [[0, 168, 232], [60, 222, 200], [214, 255, 226]],   // 水 → 若葉
    [[255, 62, 140], [255, 130, 170], [255, 220, 205]], // 紅 → 桃
    [[74, 92, 255], [120, 170, 255], [215, 235, 255]],  // 藍 → 空
    [[60, 190, 90], [176, 224, 60], [250, 250, 150]],   // 緑 → 黄緑
    [[150, 70, 235], [214, 120, 255], [255, 214, 246]], // 菫 → 藤
  ];
  const CAMERA_DIM = 0.45;      // カメラ映像を暗くする割合（0で元のまま）
  const COLOR_MS = 420;         // 色が移り変わる時間
  const FLIP_SIDE = 0.22;       // 手の表裏を決める境目（大きいほど、しっかり返さないと反応しない）
  const FLICK_MS = 520;         // 指を曲げて戻すまでの長さの上限。これより遅い動きは弾きと見なさない
  const COOLDOWN_MS = 600;      // 一度色が変わった後、次に変われるまでの時間
  const LOST_MS = 900;          // 手を見失っても、同じ手として待つ時間（裏返す途中で見失うため）

  // 手の21点の番号：[付け根, 第2関節, 指先]。親指だけ1つずれる
  const FINGERS = [[2, 3, 4], [5, 6, 8], [9, 10, 12], [13, 14, 16], [17, 18, 20]];
  const PALM = [0, 5, 9, 13, 17];

  /****************************************
    画面の部品
  *****************************************/
  const $ = s => document.querySelector(s);
  const video = $('.stage-video');
  const canvas = $('.stage-canvas');
  const ctx = canvas.getContext('2d');
  const hint = $('.stage-hint');
  const startBox = $('.start');
  const startBtn = $('.start-btn');
  const startErr = $('.start-error');

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(innerWidth * dpr);
    H = canvas.height = Math.round(innerHeight * dpr);
  };
  addEventListener('resize', resize);
  resize();

  /****************************************
    計算の道具
  *****************************************/
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) });
  const mixC = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const ease = t => 1 - Math.pow(1 - t, 3);
  const avg = ps => ({ x: ps.reduce((s, p) => s + p.x, 0) / ps.length, y: ps.reduce((s, p) => s + p.y, 0) / ps.length });

  // 2本の線分の向きの近さ（1＝まっすぐ、0＝直角、-1＝折り返し）。奥行きも使う
  const straightness = (a, b, c) => {
    const u = [b.x - a.x, b.y - a.y, b.z - a.z];
    const v = [c.x - b.x, c.y - b.y, c.z - b.z];
    const n = Math.hypot(...u) * Math.hypot(...v) || 1;
    return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / n;
  };

  // 位置の揺れを取る（止まっている時は強くならし、速い時は遅れないようにする）
  class OneEuro {
    constructor(minCut = 1.6, beta = 0.008) { this.minCut = minCut; this.beta = beta; this.x = null; this.dx = 0; }
    alpha(cut, dt) { return 1 / (1 + 1 / (2 * Math.PI * cut * dt)); }
    filter(v, dt) {
      if (this.x === null) return (this.x = v);
      this.dx += this.alpha(1, dt) * ((v - this.x) / dt - this.dx);
      return (this.x += this.alpha(this.minCut + this.beta * Math.abs(this.dx) / dpr, dt) * (v - this.x));
    }
  }

  // カメラの座標を画面の座標に直す（鏡のように左右を返し、画面いっぱいに広げる）
  const toScreen = p => {
    const vw = video.videoWidth || 1280, vh = video.videoHeight || 720;
    const s = Math.max(W / vw, H / vh);
    return { x: (1 - p.x) * vw * s + (W - vw * s) / 2, y: p.y * vh * s + (H - vh * s) / 2 };
  };

  /****************************************
    手
  *****************************************/
  const hands = [];
  const bursts = [];
  let colorTurn = 0;

  class Hand {
    constructor(wrist, now) {
      this.palette = colorTurn++ % PALETTES.length;
      this.from = PALETTES[this.palette];
      this.changedAt = -1e9;
      this.reset(wrist, now);
      this.side = 0;
    }

    // 見失った後に戻ってきた時も呼ぶ。色と表裏は覚えたまま
    reset(wrist, now) {
      this.filters = Array.from({ length: 21 }, () => [new OneEuro(), new OneEuro()]);
      this.wrist = wrist;
      this.seen = now;
      this.visible = false;
      this.up = this.up || [0, 0, 0, 0, 0];         // 各指の伸び具合（0〜1、見た目用になめらか）
      this.isUp = [false, false, false, false, false];
      this.bentAt = [0, 0, 0, 0, 0];
      this.alpha = this.alpha || 0;
      this.turnedAt = now;
    }

    update(pts, world, now) {
      if (!this.visible && now - this.seen > 200) this.reset(pts[0], now);
      const dt = clamp((now - this.seen) / 1000, 1 / 240, 0.1);
      this.pts = pts.map((p, i) => ({ x: this.filters[i][0].filter(p.x, dt), y: this.filters[i][1].filter(p.y, dt) }));
      this.wrist = pts[0];
      this.seen = now;
      this.visible = true;
      this.palm = avg(PALM.map(i => this.pts[i]));
      this.size = dist(this.pts[0], this.pts[9]);
      this.tips = FINGERS.map(f => this.pts[f[2]]);
      this.readFlip(world, now);
      this.readFingers(world, now);
    }

    // 手のひらと手の甲のどちらが見えているかを、手首→人差し指と手首→小指の回る向きで見る
    readFlip(world, now) {
      const a = { x: world[5].x - world[0].x, y: world[5].y - world[0].y, z: world[5].z - world[0].z };
      const b = { x: world[17].x - world[0].x, y: world[17].y - world[0].y, z: world[17].z - world[0].z };
      const n = Math.hypot(a.x, a.y, a.z) * Math.hypot(b.x, b.y, b.z) || 1;
      this.facing = (a.x * b.y - a.y * b.x) / n;
      if (Math.abs(this.facing) < FLIP_SIDE) { this.turnedAt = now; return; }
      const side = Math.sign(this.facing);
      if (side !== this.side) {
        const first = this.side === 0;
        this.side = side;
        this.turnedAt = now;
        if (!first) this.nextColor(now, this.palm, this.size);
      }
    }

    // 指が伸びているか。伸びた手のまま1本だけさっと曲げて戻したら「弾き」
    readFingers(world, now) {
      FINGERS.forEach(([m, p, t], i) => {
        let s = straightness(world[m], world[p], world[t]);
        let on = 0.62, off = 0.38;
        if (i === 0) {                                // 親指は曲がりが小さいので、手のひらからの離れ方も見る
          const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
          s = Math.min(s, d3(world[4], world[9]) / (d3(world[0], world[9]) || 1) * 1.15);
          on = 0.68; off = 0.58;
        }
        const was = this.isUp[i];
        this.isUp[i] = was ? s > off : s > on;
        if (was && !this.isUp[i]) this.bentAt[i] = this.count() >= 3 ? now : 0;
        if (!was && this.isUp[i] && this.bentAt[i]) {
          const quick = now - this.bentAt[i] < FLICK_MS;
          const steady = this.isUp.every((u, j) => u || j === i || this.bentAt[j] < this.bentAt[i] - FLICK_MS);
          if (quick && steady && now - this.turnedAt > 350) this.nextColor(now, this.tips[i], this.size * 0.6);
          this.bentAt[i] = 0;
        }
        // 他の指も一緒に曲がったら、握る動きなので弾きにしない
        if (this.count() < 3) this.bentAt[i] = 0;
      });
    }

    count() { return this.isUp.filter(Boolean).length; }

    nextColor(now, at, size) {
      if (now - this.changedAt < COOLDOWN_MS) return;
      this.from = this.colors(now);
      this.palette = (this.palette + 1) % PALETTES.length;
      this.changedAt = now;
      bursts.push({ hand: this, x: at.x, y: at.y, r: size, t: now });
    }

    colors(now) {
      const t = ease(clamp((now - this.changedAt) / COLOR_MS));
      return PALETTES[this.palette].map((c, i) => mixC(this.from[i], c, t));
    }

    // 親指側0〜小指側1の位置の色
    colorAt(u, cols) { return u < 0.5 ? mixC(cols[0], cols[1], u * 2) : mixC(cols[1], cols[2], u * 2 - 1); }

    // 画面の1コマごとに、出現と指の伸び具合をなめらかに進める
    step(dt, now) {
      if (now - this.seen > 120) this.visible = false;
      const open = this.visible && this.count() >= 2;
      this.alpha += (Number(open) - this.alpha) * (1 - Math.exp(-dt * 10));
      for (let i = 0; i < 5; i++) this.up[i] += (Number(this.isUp[i]) - this.up[i]) * (1 - Math.exp(-dt * 16));
    }

    // 図形の頂点。曲げた指の頂点は、両隣の辺の上へ滑らかに引っ込む
    vertices() {
      const act = [0, 1, 2, 3, 4].filter(i => this.isUp[i]);
      if (act.length < 2) return this.tips.map((p, i) => mix(this.palm, p, this.up[i]));
      return this.tips.map((p, i) => {
        const prev = [...act].reverse().find(j => j < i) ?? act[act.length - 1];
        const next = act.find(j => j > i) ?? act[0];
        return mix(mix(this.tips[prev], this.tips[next], 0.5), p, clamp(this.up[i]));
      });
    }
  }

  // 読み取った手を、前の手のうち一番近い物と結びつける（左右の判定は裏返すと入れ替わるので使わない）
  function processResult(res, now) {
    const list = (res.landmarks || []).map((l, i) => ({ pts: l.map(toScreen), world: res.worldLandmarks[i] }));
    const pairs = [];
    list.forEach((it, i) => hands.forEach(h => pairs.push({ i, h, d: dist(it.pts[0], h.wrist) })));
    pairs.sort((a, b) => a.d - b.d);
    const usedI = new Set(), usedH = new Set();
    for (const { i, h, d } of pairs) {
      if (usedI.has(i) || usedH.has(h) || d > Math.max(W, H) * 0.3) continue;
      usedI.add(i); usedH.add(h);
      h.update(list[i].pts, list[i].world, now);
    }
    list.forEach((it, i) => {
      if (usedI.has(i)) return;
      const h = new Hand(it.pts[0], now);
      h.update(it.pts, it.world, now);
      hands.push(h);
    });
    for (let i = hands.length - 1; i >= 0; i--) if (now - hands[i].seen > LOST_MS) hands.splice(i, 1);
  }

  /****************************************
    描く
  *****************************************/
  const path = (ps, close = true) => {
    ctx.beginPath();
    ps.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    if (close) ctx.closePath();
  };
  const line = (a, b, col, w) => {
    ctx.strokeStyle = col; ctx.lineWidth = w * dpr;
    path([a, b], false); ctx.stroke();
  };

  function drawCamera() {
    ctx.fillStyle = '#101114';
    ctx.fillRect(0, 0, W, H);
    if (video.readyState < 2) return;
    const vw = video.videoWidth, vh = video.videoHeight, s = Math.max(W / vw, H / vh);
    ctx.save();
    ctx.translate(W, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
    ctx.restore();
    ctx.fillStyle = `rgba(16,17,20,${CAMERA_DIM})`;
    ctx.fillRect(0, 0, W, H);
  }

  // 片手：指先を頂点にした多角形。中に、辺の途中を結んだ図形を重ねる
  function drawHand(h, now) {
    if (!h.tips || h.alpha < 0.01) return;
    const cols = h.colors(now), a = h.alpha;
    const full = h.vertices(), c = avg(full);
    const v = full.map(p => mix(c, p, ease(a)));
    const col = i => h.colorAt(i / 4, cols);

    // 面：頂点ごとの色を、中心へ向かう三角形で塗り分ける
    for (let i = 0; i < 5; i++) {
      const j = (i + 1) % 5;
      const g = ctx.createLinearGradient(v[i].x, v[i].y, v[j].x, v[j].y);
      g.addColorStop(0, rgba(col(i), 0.62 * a));
      g.addColorStop(1, rgba(col(j), 0.5 * a));
      ctx.fillStyle = g;
      path([v[i], v[j], c]); ctx.fill();
    }

    // 中の図形：少しずつずらして縮めた多角形。手を開くほど回って見える
    ctx.globalCompositeOperation = 'lighter';
    let ring = v;
    for (let k = 0; k < 7; k++) {
      ring = ring.map((p, i) => mix(p, ring[(i + 1) % 5], 0.22));
      ctx.strokeStyle = rgba(mixC(cols[0], cols[2], k / 6), (0.62 - k * 0.05) * a);
      ctx.lineWidth = 1.3 * dpr;
      path(ring); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 外側の辺
    for (let i = 0; i < 5; i++) line(v[i], v[(i + 1) % 5], rgba(mixC(col(i), [255, 255, 255], 0.35), 0.95 * a), 2.6);
  }

  // 両手：同じ指どうしを結び、隣り合う指の間に帯を張る
  function drawBridge(l, r, now) {
    const a = Math.min(l.alpha, r.alpha);
    if (a < 0.01 || !l.tips || !r.tips) return;
    const cl = l.colors(now), cr = r.colors(now), vl = l.vertices(), vr = r.vertices();
    const STR = 9;
    for (let i = 0; i < 4; i++) {
      const on = a * Math.min(l.up[i], l.up[i + 1], r.up[i], r.up[i + 1]);
      if (on < 0.02) continue;
      const g = ctx.createLinearGradient(vl[i].x, vl[i].y, vr[i].x, vr[i].y);
      g.addColorStop(0, rgba(l.colorAt(i / 3, cl), 0.46 * on));
      g.addColorStop(0.5, rgba(mixC(l.colorAt(i / 3, cl), r.colorAt(i / 3, cr), 0.5), 0.3 * on));
      g.addColorStop(1, rgba(r.colorAt(i / 3, cr), 0.46 * on));
      ctx.fillStyle = g;
      path([vl[i], vl[i + 1], vr[i + 1], vr[i]]); ctx.fill();
      // 帯の中の糸：左右で順番を逆にして交差させる
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k <= STR; k++) {
        const t = k / STR;
        const p = mix(vl[i], vl[i + 1], t), q = mix(vr[i], vr[i + 1], 1 - t);
        const s = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
        s.addColorStop(0, rgba(l.colorAt(i / 3, cl), 0.55 * on));
        s.addColorStop(1, rgba(r.colorAt(i / 3, cr), 0.55 * on));
        line(p, q, s, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    for (let i = 0; i < 5; i++) {
      const on = a * Math.min(l.up[i], r.up[i]);
      if (on < 0.02) continue;
      const g = ctx.createLinearGradient(vl[i].x, vl[i].y, vr[i].x, vr[i].y);
      g.addColorStop(0, rgba(l.colorAt(i / 4, cl), 0.95 * on));
      g.addColorStop(1, rgba(r.colorAt(i / 4, cr), 0.95 * on));
      line(vl[i], vr[i], g, 2.2);
    }
  }

  // 指先の点。伸ばした指だけに出す
  function drawTips(h, now) {
    if (!h.tips || !h.visible) return;
    const cols = h.colors(now);
    h.tips.forEach((p, i) => {
      const k = h.up[i];
      if (k < 0.05) return;
      ctx.fillStyle = rgba(h.colorAt(i / 4, cols), 0.35 * k);
      ctx.beginPath(); ctx.arc(p.x, p.y, 13 * dpr * k, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rgba([255, 255, 255], k);
      ctx.beginPath(); ctx.arc(p.x, p.y, 5 * dpr * k, 0, Math.PI * 2); ctx.fill();
    });
  }

  // 色が変わった時に広がる多角形の輪
  function drawBursts(now) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i], t = (now - b.t) / 650;
      if (t >= 1) { bursts.splice(i, 1); continue; }
      const c = b.hand.colors(now)[1], r = b.r * (0.4 + 1.6 * ease(t));
      const ps = Array.from({ length: 5 }, (_, k) => {
        const w = -Math.PI / 2 + k * Math.PI * 2 / 5 + t * 0.6;
        return { x: b.x + r * Math.cos(w), y: b.y + r * Math.sin(w) };
      });
      ctx.strokeStyle = rgba(c, 0.9 * (1 - t));
      ctx.lineWidth = 6 * dpr * (1 - t);
      path(ps); ctx.stroke();
    }
  }

  /****************************************
    毎コマの処理
  *****************************************/
  let detector = null, lastVideoTime = -1, lastFrame = 0, noHandSince = 0;

  function frame(now) {
    const dt = clamp((now - lastFrame) / 1000, 0.001, 0.1);
    lastFrame = now;
    if (detector && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      processResult(detector.detectForVideo(video, now), now);
    }
    hands.forEach(h => h.step(dt, now));
    drawCamera();
    const shown = hands.filter(h => h.tips).sort((p, q) => p.palm.x - q.palm.x);
    ctx.lineJoin = ctx.lineCap = 'round';
    if (shown.length === 2) drawBridge(shown[0], shown[1], now);
    shown.forEach(h => drawHand(h, now));
    drawBursts(now);
    shown.forEach(h => drawTips(h, now));

    const any = hands.some(h => h.visible);
    if (any) noHandSince = now;
    const text = !any && now - noHandSince > 1500 ? '手をカメラに向けて広げてください' : '';
    if (hint.textContent !== text) hint.textContent = text;
    requestAnimationFrame(frame);
  }

  /****************************************
    始める
  *****************************************/
  async function loadDetector() {
    const { FilesetResolver, HandLandmarker } = await import(`${MP}/vision_bundle.mjs`);
    const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
    const make = delegate => HandLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    try { return await make('GPU'); } catch (e) { return make('CPU'); }   // GPU が使えない環境では CPU で動かす
  }

  function explain(e) {
    if (e.name === 'NotAllowedError') return 'カメラの使用が許可されていません。アドレス欄の左のカメラの設定で許可してから、もう一度押してください。';
    if (e.name === 'NotFoundError') return 'カメラが見つかりません。カメラがつながっているか確かめてください。';
    if (e.name === 'NotReadableError') return 'カメラを開けません。ほかのアプリがカメラを使っていれば閉じてください。';
    return '手を認識する部品を読み込めませんでした。インターネットにつながっているか確かめて、もう一度押してください。';
  }

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = '準備しています';
    startErr.textContent = '';
    try {
      if (!video.srcObject) {
        video.srcObject = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } },
        });
      }
      await video.play();
      detector = detector || await loadDetector();
      startBox.classList.add('__hidden');
      noHandSince = performance.now();
      requestAnimationFrame(frame);
    } catch (e) {
      console.error(e);
      startErr.textContent = explain(e);
      startBtn.disabled = false;
      startBtn.textContent = 'カメラを使って始める';
    }
  });

  // 確かめる時だけ使う入口（#check を付けて開いた時）
  if (location.hash === '#check') window.yubisaki = { hands, processResult, video };
})();
