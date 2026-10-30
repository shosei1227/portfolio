(() => {
    "use strict";

    const projects = {
        astra: {
            index: "01", title: "ASTRA", subtitle: "観測と想像のあいだ", category: "Digital space archive",
            type: "自主制作 / Learning project", year: "2026", image: "img/nasa-carina.jpg", secondary: "img/nasa-pillars.jpg", imageAlt: "オレンジ色に輝くカリーナ星雲", secondaryAlt: "星空へ伸びる創造の柱", domain: "astra-archive.local", accent: "#a8d9db",
            summary: "NASAの宇宙写真を、情報過多にせず静かに鑑賞するためのデジタルアーカイブ。写真、余白、タイポグラフィを一体で設計しました。",
            role: "Planning / Design / Front-end", scope: "1 page / Responsive", duration: "Learning project", tools: "HTML / CSS / JavaScript", live: "astra.html",
            disclosure: "自主制作の学習プロジェクトです。NASAとは関係がなく、画像クレジットは元ページ内に記載しています。",
            challengeLead: "強い写真を使いながら、情報を埋もれさせない。", challenge: "宇宙写真はそれ自体の情報量が大きく、装飾を重ねるほど鑑賞の妨げになります。一方、写真を並べるだけではサイト独自の視点が生まれません。観測記録としての信頼感と、個人アーカイブとしての余韻をどう両立するかを課題に設定しました。",
            approachLead: "速度を落とすレイアウトで、見る行為そのものを体験に。", approach: "大きな余白、低彩度の色設計、縦書きの短い言葉で視線にリズムを作りました。画像の出典や距離などの事実情報は写真の近くへ配置し、詩的な表現と混同しないよう階層を分けています。",
            decisions: [["大きな余白","一画面に詰め込まず、写真ごとに視線を止める距離を確保。"],["情報の二層化","観測データはサンセリフ、短いステートメントは明朝体で役割を分離。"],["静かな動き","スクロール表示と画像の微細な移動に限定し、写真より動きが前に出ない設計。"]],
            font: "Noto Serif JP / Space Grotesk", palette: [["#070808","Night"],["#f1f0eb","Starlight"],["#a8d9db","Signal"],["#6b5141","Nebula"]],
            outcome: "既存の1ページを、レスポンシブ表示、キーボード操作、動きを減らす設定まで含む実装へ発展させました。視覚表現だけでなく、クレジットと外部リンクを明確にする重要性も確認できました。", deliverables: ["Information structure","Visual direction","Responsive design","HTML / CSS / JS","Motion design","Accessibility pass"], next: "lune"
        },
        lune: {
            index: "02", title: "LUNE", subtitle: "季節を包んで、日常へ。", category: "Florist & online store", type: "自主制作 / Concept project", year: "2026", image: "img/project-lune.jpg", secondary: "img/project-lune.jpg", imageAlt: "季節の花束を置いた花店の作業台", secondaryAlt: "季節の花束のディテール", domain: "lune-fleurs.local", accent: "#b35c52",
            summary: "小さな花店の世界観と、用途から迷わず選べる買い物体験を両立するブランド・ECサイトのコンセプト。",
            role: "Art direction / UI design", scope: "Brand site / Store flow", duration: "Concept project", tools: "Wireframe / UI prototype", live: null,
            disclosure: "架空の花店を想定した自主制作です。掲載する店名、商品、サービスはコンセプト上のものです。",
            challengeLead: "雰囲気だけで終わらず、贈る理由から選べる花店へ。", challenge: "花店サイトは美しい写真が中心になる一方、購入者は花の名前より『誕生日』『お礼』『予算』から探すことが多いと想定しました。ブランドの繊細さを保ちつつ、初めてでも選びやすい導線が必要です。",
            approachLead: "感性で惹きつけ、条件で迷いを減らす二段構成。", approach: "トップでは季節の花を大きく見せ、一覧では用途・色・価格帯を同じ優先度で提示。カードの情報量を抑え、詳細ページでサイズ感、花材変更、受取方法をまとめて確認できる構成にしました。",
            decisions: [["用途起点の入口","商品名の前に、贈る相手や場面から選べるショートカットを配置。"],["写真と文字の余白","花の輪郭を邪魔しない大きな余白と、低コントラストの背景色を採用。"],["不安の先回り","季節による花材変更、サイズ、配送日を購入前の同じ画面で確認可能に。"]],
            font: "Shippori Mincho / DM Sans", palette: [["#f1e9dc","Petal"],["#b35c52","Dahlia"],["#5b6954","Stem"],["#271f1b","Soil"]],
            outcome: "ブランドの情緒と、ECに必要な比較・確認を一つのUI方針に統合しました。次の段階では商品点数と配送条件を入れた操作テストを行う想定です。", deliverables: ["Brand direction","Content map","Home UI","Product listing","Product detail","Checkout concept"], next: "kasane"
        },
        kasane: {
            index: "03", title: "KASANE", subtitle: "季節を、ひと口に重ねる。", category: "Seasonal wagashi", type: "自主制作 / Concept project", year: "2026", image: "img/project-kasane.jpg", secondary: "img/project-kasane.jpg", imageAlt: "濃紺の器に並んだ季節の和菓子", secondaryAlt: "季節の和菓子のディテール", domain: "kasane-wagashi.local", accent: "#d77b52",
            summary: "伝統的な和菓子を、季節の物語と贈り物の選びやすさから再編集したオンラインストア。",
            role: "Brand system / E-commerce UI", scope: "Store / Editorial", duration: "Concept project", tools: "Content design / UI prototype", live: null,
            disclosure: "架空の和菓子店を想定した自主制作です。商品名や販売情報はすべてデザイン検討用です。",
            challengeLead: "伝統を古く見せず、説明を難しくしない。", challenge: "和菓子の文化背景を伝えようとすると文章が長くなり、商品選びが後回しになりがちです。季節感や職人性を残しながら、贈答用途のユーザーが価格・日持ち・配送を素早く比較できることを目指しました。",
            approachLead: "物語と実用情報を、読む深さで分ける。", approach: "一覧では色・形・価格・日持ちに絞り、商品詳細で意匠の由来や素材の話を展開。縦書きの見出しはアクセントに限定し、重要な購入情報は横書きで統一しました。",
            decisions: [["季節の編集棚","暦に沿った特集と定番商品の入口を分け、再訪時にも選びやすく。"],["贈答情報の固定","のし、日持ち、配送温度帯を商品画像の近くに集約。"],["伝統色の抑制","濃紺を土台に、商品色を主役にする最小限の配色。"]],
            font: "Shippori Mincho / Noto Sans JP", palette: [["#101c2d","Indigo"],["#d77b52","Persimmon"],["#e9ded0","Rice"],["#727d48","Matcha"]],
            outcome: "文化的な読み物とオンライン購入を同じページ内で競合させず、必要な深さへ進める構造を作りました。", deliverables: ["Brand concept","Seasonal campaign","Product grid","Gift guide","Detail template","Mobile navigation"], next: "trace"
        },
        trace: {
            index: "04", title: "TRACE", subtitle: "数字から、次の一手へ。", category: "Analytics dashboard", type: "自主制作 / Product UI", year: "2026", image: "img/trace-dashboard.svg", secondary: "img/trace-dashboard.svg", imageAlt: "アクセス指標を整理した分析ダッシュボード", secondaryAlt: "TRACEダッシュボードの全体画面", domain: "trace-dashboard.local", accent: "#d7ff45",
            summary: "小規模チームが毎朝確認する指標を、判断の優先度に沿って並べたWeb分析ダッシュボード。",
            role: "Product UI / Design system", scope: "Dashboard / Responsive", duration: "Concept project", tools: "UI system / HTML / CSS", live: null,
            disclosure: "架空プロダクトの自主制作です。画面内の数値はUI検討用のサンプルデータで、実績値ではありません。",
            challengeLead: "数字を増やすのではなく、見る順番を決める。", challenge: "分析画面では指標を追加し続けるほど、異常や変化に気づきにくくなります。利用者を小規模事業の担当者と想定し、朝の短時間で概況、変化、詳細の順に確認できる情報階層を課題にしました。",
            approachLead: "概要から原因へ、同じ視線の流れで掘り下げる。", approach: "最上段は3つの主要指標、中央は時系列、右側は寄与したページに限定。色は状態の意味を持つ場合だけ使い、カードの形や余白を共通トークンとして整理しました。",
            decisions: [["3段階の情報階層","概況、変化、内訳の順に画面を走査できる配置。"],["色の役割を限定","青は選択、黄緑は好調など、装飾ではなく状態として使用。"],["サンプル明示","画面内の数値が架空であることをモックアップ上にも表示。"]],
            font: "DM Sans / Noto Sans JP", palette: [["#17191d","Sidebar"],["#f8f9f5","Canvas"],["#2155e8","Active"],["#d7ff45","Positive"]],
            outcome: "再利用できるカード、ナビゲーション、チャートの見た目をまとめ、デスクトップからモバイルまで優先順位を保つUIルールを作成しました。", deliverables: ["User scenario","Information hierarchy","Dashboard UI","Component rules","Responsive states","Accessible colors"], next: "komorebi"
        },
        komorebi: {
            index: "05", title: "KOMOREBI", subtitle: "来院前の不安を、ひとつずつ。", category: "Neighborhood clinic", type: "自主制作 / Concept project", year: "2026", image: "img/project-komorebi.jpg", secondary: "img/project-komorebi.jpg", imageAlt: "木と自然光を生かした明るいクリニック", secondaryAlt: "クリニックの受付と待合室", domain: "komorebi-clinic.local", accent: "#85b9aa",
            summary: "診療内容、受診方法、当日の持ち物を、幅広い年齢の人が迷わず確認できる地域クリニックサイト。",
            role: "Information design / Accessibility", scope: "Clinic site / 6 templates", duration: "Concept project", tools: "Content audit / UI design", live: null,
            disclosure: "架空のクリニックを想定した自主制作です。医療情報・診療時間・所在地はすべてデザイン検討用です。",
            challengeLead: "具合が悪いときでも、探さずに分かる。", challenge: "医療サイトでは、診療科の説明、初診手順、アクセス、休診情報など目的が異なる情報が混在します。年齢や端末にかかわらず、緊急性の高い情報へ短い操作で到達できる構造が必要です。",
            approachLead: "利用場面を入口にし、専門語を補助情報へ。", approach: "『初めての方』『症状から探す』『本日の診療』を主導線に設定。文字サイズ、行間、色コントラストを広めに取り、スマートフォンでは電話と受付時間を常に確認できる想定にしました。",
            decisions: [["目的別ナビゲーション","組織側の診療科分類より、利用者が置かれた状況を優先。"],["読みやすい密度","一文を短くし、見出し・要点・補足の3階層で整理。"],["更新情報を近くに","休診や当番医など変化する情報を、関連する診療時間の近くに表示。"]],
            font: "Noto Sans JP / DM Sans", palette: [["#f5f2e9","Calm"],["#85b9aa","Care"],["#285c54","Trust"],["#e1a65e","Notice"]],
            outcome: "来院前に多い確認事項をページ構造へ反映し、アクセシビリティを装飾後の確認ではなく初期設計の条件として扱いました。", deliverables: ["Content audit","Sitemap","Home UI","First-visit guide","Clinic template","Accessibility notes"], next: "haku"
        },
        haku: {
            index: "06", title: "HAKU", subtitle: "静けさを予約する。", category: "Lakeside cabin stay", type: "自主制作 / Concept project", year: "2026", image: "img/project-haku.jpg", secondary: "img/project-haku.jpg", imageAlt: "朝霧の湖畔に建つ木のキャビン", secondaryAlt: "湖と山に囲まれたキャビン", domain: "haku-stay.local", accent: "#d9aa62",
            summary: "滞在の空気感を伝えながら、設備・料金・空室確認へ自然につなぐ一棟貸し宿の予約サイト。",
            role: "Art direction / Booking flow", scope: "Hospitality / Booking", duration: "Concept project", tools: "Journey map / UI design", live: null,
            disclosure: "架空の宿泊施設を想定した自主制作です。施設、料金、空室情報はコンセプト上のものです。",
            challengeLead: "憧れを高めたまま、現実的な確認へつなぐ。", challenge: "宿泊サイトでは写真による期待づくりと、定員・設備・アクセス・キャンセル条件などの確認が同時に必要です。没入感を壊さず、予約前の不安を段階的に解消することを目標にしました。",
            approachLead: "体験、条件、予約をスクロールの物語に。", approach: "ファーストビューでは風景を優先し、その後に滞在の過ごし方、客室、設備、料金、アクセスの順で具体度を上げます。予約CTAは常に同じ文言と色で示し、空室確認後の戻り道も短くしました。",
            decisions: [["具体度のグラデーション","感情的な写真から、比較に必要な表へ段階的に移行。"],["予約条件の可視化","追加料金やキャンセル条件を最後まで隠さず、料金の近くに表示。"],["モバイル優先のCTA","日付入力と人数選択を親指で操作しやすい順に配置。"]],
            font: "Shippori Mincho / DM Sans", palette: [["#1f2b2f","Lake"],["#e2e0d7","Mist"],["#6a765d","Moss"],["#d9aa62","Cabin light"]],
            outcome: "ブランド体験と予約タスクを別物にせず、情報の具体度を上げる順序として一つの導線にまとめました。", deliverables: ["Experience concept","Journey map","Home UI","Room detail","Rate table","Booking flow"], next: "kissa"
        },
        kissa: {
            index: "07", title: "KISSA SHIRO", subtitle: "街の余白になる喫茶店。", category: "Cafe multi-page website", type: "自主制作 / Learning project", year: "2026", image: "img/project-kissa.jpg", secondary: "img/project-kissa-detail.jpg", imageAlt: "木を基調としたカフェの店内", secondaryAlt: "エスプレッソマシンでコーヒーを抽出する様子", domain: "kissa-shiro.local", accent: "#e55a34",
            summary: "コンセプト、メニュー、お知らせ、アクセスを複数ページで整理したカフェサイトの学習プロジェクト。",
            role: "Front-end / Multi-page", scope: "4 pages / Responsive", duration: "Learning project", tools: "HTML / CSS", live: null,
            disclosure: "学習教材をもとに発展させた自主制作です。実在店舗の制作実績ではありません。",
            challengeLead: "ページが増えても、同じルールで整う構造へ。", challenge: "複数ページでは、見出し、余白、カード、ナビゲーションを個別に作るほど更新しづらくなります。カフェらしい温度感を保ちながら、共通部品を再利用できるCSS構造を課題にしました。",
            approachLead: "共通する型を先に決め、ページ固有の内容を載せる。", approach: "ヘッダー、フッター、セクション見出し、記事カードを共通化し、トップ、メニュー、一覧、詳細の各ページへ展開。写真の色温度に合わせ、オレンジと墨色の明快なブランドカラーを設定しました。",
            decisions: [["共通部品の整理","ページ名に依存しないクラスへ分け、同じUIを再利用。"],["現在地の明示","ナビゲーションとページ見出しで、どこを見ているかを常に確認可能に。"],["写真の役割分担","空間、商品、手元の写真を目的別に使い、同じ見せ方の繰り返しを回避。"]],
            font: "Noto Sans JP / Shippori Mincho", palette: [["#171513","Coffee"],["#e55a34","Orange"],["#f0e7d7","Milk"],["#6e7b59","Leaf"]],
            outcome: "単一ページの制作から一歩進み、複数ページで一貫性を保つための部品化と命名を学ぶ成果物として整理しました。", deliverables: ["Home page","Menu page","News index","Article template","Shared navigation","Responsive layout"], next: "astra"
        }
    };

    const order = Object.keys(projects);
    const requested = new URLSearchParams(window.location.search).get("project");
    const key = Object.prototype.hasOwnProperty.call(projects, requested) ? requested : "astra";
    const project = projects[key];
    document.body.classList.add(`theme-${key}`);
    document.documentElement.style.setProperty("--accent", project.accent);
    document.title = `${project.title} — Case Study | SH`;
    document.querySelector('meta[name="description"]').content = project.summary;

    const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
    setText("[data-case-index]", `Case ${project.index} / ${String(order.length).padStart(2, "0")}`);
    setText("[data-type]", project.type); setText("[data-year]", project.year); setText("[data-category]", project.category);
    setText("[data-title]", project.title); setText("[data-device-title]", project.title); setText("[data-subtitle]", project.subtitle); setText("[data-summary]", project.summary);
    setText("[data-role]", project.role); setText("[data-scope]", project.scope); setText("[data-duration]", project.duration); setText("[data-tools]", project.tools); setText("[data-disclosure]", project.disclosure);
    setText("[data-challenge-lead]", project.challengeLead); setText("[data-challenge]", project.challenge); setText("[data-approach-lead]", project.approachLead); setText("[data-approach]", project.approach);
    setText("[data-domain]", project.domain); setText("[data-font-label]", project.font); setText("[data-outcome]", project.outcome);

    const mainImage = document.querySelector("[data-image]"); mainImage.src = project.image; mainImage.alt = project.imageAlt;
    const secondaryImage = document.querySelector("[data-image-secondary]"); secondaryImage.src = project.secondary; secondaryImage.alt = project.secondaryAlt;
    const live = document.querySelector("[data-live]");
    if (project.live) live.href = project.live; else live.hidden = true;

    document.querySelector("[data-decisions]").innerHTML = project.decisions.map((item, index) => `<li><span>0${index + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></li>`).join("");
    document.querySelector("[data-palette]").innerHTML = project.palette.map(([color, label]) => {
        const light = ["#f1e9dc", "#f8f9f5", "#e9ded0", "#f5f2e9", "#e2e0d7", "#f0e7d7", "#d7ff45"].includes(color.toLowerCase());
        return `<span style="background:${color};color:${light ? "#141513" : "#fff"}">${label}<br>${color}</span>`;
    }).join("");
    document.querySelector("[data-deliverables]").innerHTML = project.deliverables.map((item) => `<li>${item}</li>`).join("");

    const next = projects[project.next];
    const nextLink = document.querySelector("[data-next]");
    nextLink.href = `case-study.html?project=${project.next}`;
    setText("[data-next-title]", next.title);

    const progress = document.querySelector(".case-progress span");
    const updateProgress = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
})();
