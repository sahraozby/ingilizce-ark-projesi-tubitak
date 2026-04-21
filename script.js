/* Antonym Wheel — Vanilla JS, Turkish UI
   - Seviye seçmeden çevirme yok
   - Seçilen seviyeden 8 kelime (API varsa oradan, yoksa local havuzdan)
   - Çark durunca sadece İngilizce kelime görünür
   - "Anlamları Göster" ile Türkçe anlam + zıt anlam(+TR) + eş anlamlılar açılır
   - 2 şıklı anlam seçme: doğru +10 puan, yanlış seri sıfırlar
   - Web Speech API ile sıralı okuma + görsel geri bildirim
*/

(() => {
  "use strict";

  /** -----------------------------
   *  DATA (min 10 per level)
   *  Each item includes required fields:
   *  { english, antonym, turkish, antonym_turkish, level }
   *  Extended fields:
   *  { synonyms: string[], meaning_options: string[], correct_option: number }
   *  ----------------------------- */
  const WORDS = [
    // A1
    { english: "happy", antonym: "sad", turkish: "mutlu", antonym_turkish: "üzgün", level: "A1", synonyms: ["glad", "cheerful"], meaning_options: ["mutlu", "temiz"], correct_option: 0 },
    { english: "big", antonym: "small", turkish: "büyük", antonym_turkish: "küçük", level: "A1", synonyms: ["large", "huge"], meaning_options: ["büyük", "hızlı"], correct_option: 0 },
    { english: "hot", antonym: "cold", turkish: "sıcak", antonym_turkish: "soğuk", level: "A1", synonyms: ["warm"], meaning_options: ["sıcak", "yeni"], correct_option: 0 },
    { english: "fast", antonym: "slow", turkish: "hızlı", antonym_turkish: "yavaş", level: "A1", synonyms: ["quick", "rapid"], meaning_options: ["hızlı", "yumuşak"], correct_option: 0 },
    { english: "new", antonym: "old", turkish: "yeni", antonym_turkish: "eski", level: "A1", synonyms: ["fresh"], meaning_options: ["yeni", "güçlü"], correct_option: 0 },
    { english: "clean", antonym: "dirty", turkish: "temiz", antonym_turkish: "kirli", level: "A1", synonyms: ["tidy"], meaning_options: ["temiz", "pahalı"], correct_option: 0 },
    { english: "open", antonym: "closed", turkish: "açık", antonym_turkish: "kapalı", level: "A1", synonyms: ["unlocked"], meaning_options: ["açık", "uzak"], correct_option: 0 },
    { english: "up", antonym: "down", turkish: "yukarı", antonym_turkish: "aşağı", level: "A1", synonyms: ["above"], meaning_options: ["yukarı", "erken"], correct_option: 0 },
    { english: "early", antonym: "late", turkish: "erken", antonym_turkish: "geç", level: "A1", synonyms: ["soon"], meaning_options: ["erken", "dar"], correct_option: 0 },
    { english: "strong", antonym: "weak", turkish: "güçlü", antonym_turkish: "zayıf", level: "A1", synonyms: ["powerful"], meaning_options: ["güçlü", "dolu"], correct_option: 0 },

    // A2
    { english: "cheap", antonym: "expensive", turkish: "ucuz", antonym_turkish: "pahalı", level: "A2", synonyms: ["inexpensive", "low-cost"], meaning_options: ["ucuz", "sıkıcı"], correct_option: 0 },
    { english: "easy", antonym: "difficult", turkish: "kolay", antonym_turkish: "zor", level: "A2", synonyms: ["simple"], meaning_options: ["kolay", "gürültülü"], correct_option: 0 },
    { english: "noisy", antonym: "quiet", turkish: "gürültülü", antonym_turkish: "sessiz", level: "A2", synonyms: ["loud"], meaning_options: ["gürültülü", "kibar"], correct_option: 0 },
    { english: "empty", antonym: "full", turkish: "boş", antonym_turkish: "dolu", level: "A2", synonyms: ["vacant"], meaning_options: ["boş", "ıslak"], correct_option: 0 },
    { english: "near", antonym: "far", turkish: "yakın", antonym_turkish: "uzak", level: "A2", synonyms: ["close"], meaning_options: ["yakın", "geniş"], correct_option: 0 },
    { english: "busy", antonym: "free", turkish: "meşgul", antonym_turkish: "boş (müsait)", level: "A2", synonyms: ["occupied"], meaning_options: ["meşgul", "kuru"], correct_option: 0 },
    { english: "safe", antonym: "dangerous", turkish: "güvenli", antonym_turkish: "tehlikeli", level: "A2", synonyms: ["secure"], meaning_options: ["güvenli", "yavaş"], correct_option: 0 },
    { english: "healthy", antonym: "sick", turkish: "sağlıklı", antonym_turkish: "hasta", level: "A2", synonyms: ["well"], meaning_options: ["sağlıklı", "kalabalık"], correct_option: 0 },
    { english: "polite", antonym: "rude", turkish: "kibar", antonym_turkish: "kaba", level: "A2", synonyms: ["courteous"], meaning_options: ["kibar", "eski"], correct_option: 0 },
    { english: "wet", antonym: "dry", turkish: "ıslak", antonym_turkish: "kuru", level: "A2", synonyms: ["damp"], meaning_options: ["ıslak", "mutlu"], correct_option: 0 },

    // B1
    { english: "increase", antonym: "decrease", turkish: "artmak / artırmak", antonym_turkish: "azalmak / azaltmak", level: "B1", synonyms: ["raise", "grow"], meaning_options: ["artmak / artırmak", "karar vermek"], correct_option: 0 },
    { english: "accept", antonym: "refuse", turkish: "kabul etmek", antonym_turkish: "reddetmek", level: "B1", synonyms: ["agree", "approve"], meaning_options: ["kabul etmek", "unutmak"], correct_option: 0 },
    { english: "arrive", antonym: "depart", turkish: "varmak", antonym_turkish: "ayrılmak", level: "B1", synonyms: ["reach"], meaning_options: ["varmak", "şaşırmak"], correct_option: 0 },
    { english: "borrow", antonym: "lend", turkish: "ödünç almak", antonym_turkish: "ödünç vermek", level: "B1", synonyms: ["take as a loan"], meaning_options: ["ödünç almak", "davet etmek"], correct_option: 0 },
    { english: "support", antonym: "oppose", turkish: "desteklemek", antonym_turkish: "karşı çıkmak", level: "B1", synonyms: ["back", "help"], meaning_options: ["desteklemek", "incelemek"], correct_option: 0 },
    { english: "improve", antonym: "worsen", turkish: "gelişmek / iyileştirmek", antonym_turkish: "kötüleşmek", level: "B1", synonyms: ["enhance"], meaning_options: ["gelişmek / iyileştirmek", "saklamak"], correct_option: 0 },
    { english: "manage", antonym: "fail", turkish: "başarmak / yönetmek", antonym_turkish: "başarısız olmak", level: "B1", synonyms: ["handle"], meaning_options: ["başarmak / yönetmek", "tahmin etmek"], correct_option: 0 },
    { english: "reduce", antonym: "expand", turkish: "azaltmak", antonym_turkish: "genişletmek", level: "B1", synonyms: ["cut down"], meaning_options: ["azaltmak", "kırmak"], correct_option: 0 },
    { english: "include", antonym: "exclude", turkish: "dahil etmek", antonym_turkish: "hariç tutmak", level: "B1", synonyms: ["contain"], meaning_options: ["dahil etmek", "yasaklamak"], correct_option: 0 },
    { english: "discover", antonym: "hide", turkish: "keşfetmek", antonym_turkish: "gizlemek", level: "B1", synonyms: ["find out"], meaning_options: ["keşfetmek", "başvurmak"], correct_option: 0 },

    // B2
    { english: "significant", antonym: "insignificant", turkish: "önemli", antonym_turkish: "önemsiz", level: "B2", synonyms: ["important", "notable"], meaning_options: ["önemli", "geleneksel"], correct_option: 0 },
    { english: "efficient", antonym: "inefficient", turkish: "verimli", antonym_turkish: "verimsiz", level: "B2", synonyms: ["productive"], meaning_options: ["verimli", "karmaşık"], correct_option: 0 },
    { english: "reluctant", antonym: "eager", turkish: "isteksiz", antonym_turkish: "hevesli", level: "B2", synonyms: ["unwilling"], meaning_options: ["isteksiz", "uygun"], correct_option: 0 },
    { english: "maintain", antonym: "neglect", turkish: "sürdürmek / korumak", antonym_turkish: "ihmal etmek", level: "B2", synonyms: ["preserve"], meaning_options: ["sürdürmek / korumak", "geliştirmek"], correct_option: 0 },
    { english: "predict", antonym: "doubt", turkish: "tahmin etmek", antonym_turkish: "şüphe etmek", level: "B2", synonyms: ["forecast"], meaning_options: ["tahmin etmek", "geri çekilmek"], correct_option: 0 },
    { english: "complicated", antonym: "straightforward", turkish: "karmaşık", antonym_turkish: "kolay / anlaşılır", level: "B2", synonyms: ["complex"], meaning_options: ["karmaşık", "geçici"], correct_option: 0 },
    { english: "recommend", antonym: "discourage", turkish: "önermek", antonym_turkish: "vazgeçirmek", level: "B2", synonyms: ["suggest"], meaning_options: ["önermek", "denetlemek"], correct_option: 0 },
    { english: "approve", antonym: "reject", turkish: "onaylamak", antonym_turkish: "reddetmek", level: "B2", synonyms: ["authorize"], meaning_options: ["onaylamak", "azaltmak"], correct_option: 0 },
    { english: "withdraw", antonym: "advance", turkish: "geri çekilmek", antonym_turkish: "ilerlemek", level: "B2", synonyms: ["pull back"], meaning_options: ["geri çekilmek", "göz ardı etmek"], correct_option: 0 },
    { english: "increase (costs)", antonym: "cut (costs)", turkish: "artırmak (maliyet)", antonym_turkish: "azaltmak (maliyet)", level: "B2", synonyms: ["raise"], meaning_options: ["artırmak (maliyet)", "açıklamak"], correct_option: 0 },

    // C1
    { english: "ambiguity", antonym: "clarity", turkish: "belirsizlik", antonym_turkish: "açıklık", level: "C1", synonyms: ["uncertainty", "vagueness"], meaning_options: ["belirsizlik", "iyileştirme"], correct_option: 0 },
    { english: "constrain", antonym: "liberate", turkish: "kısıtlamak", antonym_turkish: "özgürleştirmek", level: "C1", synonyms: ["restrict", "limit"], meaning_options: ["kısıtlamak", "kanıtlamak"], correct_option: 0 },
    { english: "subtle", antonym: "obvious", turkish: "ince / belli belirsiz", antonym_turkish: "bariz", level: "C1", synonyms: ["delicate", "nuanced"], meaning_options: ["ince / belli belirsiz", "anlaşmazlık"], correct_option: 0 },
    { english: "coherent", antonym: "incoherent", turkish: "tutarlı", antonym_turkish: "tutarsız", level: "C1", synonyms: ["consistent"], meaning_options: ["tutarlı", "geçerli"], correct_option: 0 },
    { english: "justify", antonym: "condemn", turkish: "haklı göstermek / gerekçelendirmek", antonym_turkish: "kınamak", level: "C1", synonyms: ["explain", "defend"], meaning_options: ["haklı göstermek / gerekçelendirmek", "uyarlamak"], correct_option: 0 },
    { english: "mitigate", antonym: "aggravate", turkish: "hafifletmek", antonym_turkish: "ağırlaştırmak", level: "C1", synonyms: ["alleviate"], meaning_options: ["hafifletmek", "göç etmek"], correct_option: 0 },
    { english: "resilient", antonym: "fragile", turkish: "dayanıklı", antonym_turkish: "kırılgan", level: "C1", synonyms: ["robust"], meaning_options: ["dayanıklı", "aşırı"], correct_option: 0 },
    { english: "incentive", antonym: "deterrent", turkish: "teşvik", antonym_turkish: "caydırıcı", level: "C1", synonyms: ["motivation"], meaning_options: ["teşvik", "yansızlık"], correct_option: 0 },
    { english: "inevitable", antonym: "avoidable", turkish: "kaçınılmaz", antonym_turkish: "kaçınılabilir", level: "C1", synonyms: ["unavoidable"], meaning_options: ["kaçınılmaz", "yetersiz"], correct_option: 0 },
    { english: "compliance", antonym: "resistance", turkish: "uyum / riayet", antonym_turkish: "direniş", level: "C1", synonyms: ["adherence"], meaning_options: ["uyum / riayet", "yakınlık"], correct_option: 0 },

    // C2
    { english: "meticulous", antonym: "careless", turkish: "titiz", antonym_turkish: "dikkatsiz", level: "C2", synonyms: ["thorough", "scrupulous"], meaning_options: ["titiz", "rastgele"], correct_option: 0 },
    { english: "pervasive", antonym: "rare", turkish: "yaygın", antonym_turkish: "nadir", level: "C2", synonyms: ["widespread", "ubiquitous"], meaning_options: ["yaygın", "düzensiz"], correct_option: 0 },
    { english: "reconcile", antonym: "alienate", turkish: "uzlaştırmak", antonym_turkish: "yabancılaştırmak", level: "C2", synonyms: ["settle", "harmonize"], meaning_options: ["uzlaştırmak", "baltalamak"], correct_option: 0 },
    { english: "exacerbate", antonym: "ease", turkish: "kötüleştirmek / şiddetlendirmek", antonym_turkish: "hafifletmek", level: "C2", synonyms: ["worsen", "intensify"], meaning_options: ["kötüleştirmek / şiddetlendirmek", "yatıştırmak"], correct_option: 0 },
    { english: "imperative", antonym: "optional", turkish: "zorunlu / çok önemli", antonym_turkish: "isteğe bağlı", level: "C2", synonyms: ["essential", "crucial"], meaning_options: ["zorunlu / çok önemli", "kaygan"], correct_option: 0 },
    { english: "candid", antonym: "guarded", turkish: "açık sözlü", antonym_turkish: "ketum", level: "C2", synonyms: ["frank"], meaning_options: ["açık sözlü", "tüketici"], correct_option: 0 },
    { english: "obsolete", antonym: "current", turkish: "modası geçmiş", antonym_turkish: "güncel", level: "C2", synonyms: ["outdated"], meaning_options: ["modası geçmiş", "kapsamlı"], correct_option: 0 },
    { english: "scrutinize", antonym: "overlook", turkish: "didik didik incelemek", antonym_turkish: "göz ardı etmek", level: "C2", synonyms: ["examine", "inspect"], meaning_options: ["didik didik incelemek", "karşı koymak"], correct_option: 0 },
    { english: "conspicuous", antonym: "inconspicuous", turkish: "göze çarpan", antonym_turkish: "göze çarpmayan", level: "C2", synonyms: ["noticeable"], meaning_options: ["göze çarpan", "uysal"], correct_option: 0 },
    { english: "altruistic", antonym: "selfish", turkish: "özgeci", antonym_turkish: "bencil", level: "C2", synonyms: ["selfless"], meaning_options: ["özgeci", "zengin"], correct_option: 0 },
  ];

  /** -----------------------------
   *  DOM
   *  ----------------------------- */
  const el = {
    canvas: document.getElementById("wheelCanvas"),
    overlay: document.getElementById("wheelOverlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayText: document.getElementById("overlayText"),
    levelValue: document.getElementById("levelValue"),
    scoreValue: document.getElementById("scoreValue"),
    streakValue: document.getElementById("streakValue"),
    statusPill: document.getElementById("statusPill"),
    spinBtn: document.getElementById("spinBtn"),
    reloadBtn: document.getElementById("reloadBtn"),
    revealBtn: document.getElementById("revealBtn"),
    speakBtn: document.getElementById("speakBtn"),
    pickedEnglish: document.getElementById("pickedEnglish"),
    pickedTurkish: document.getElementById("pickedTurkish"),
    pickedAntonym: document.getElementById("pickedAntonym"),
    pickedAntonymTr: document.getElementById("pickedAntonymTr"),
    pickedSynonyms: document.getElementById("pickedSynonyms"),
    pickedLevel: document.getElementById("pickedLevel"),
    details: document.getElementById("details"),
    quizOptions: document.getElementById("quizOptions"),
    quizFeedback: document.getElementById("quizFeedback"),
    audioToggle: document.getElementById("audioToggle"),
    sfxToggle: document.getElementById("sfxToggle"),
    dataSourceNote: document.getElementById("dataSourceNote"),
    chips: Array.from(document.querySelectorAll(".chip[data-level]")),
  };

  /** -----------------------------
   *  STATE
   *  ----------------------------- */
  const state = {
    level: null,
    wheelWords: [],
    angle: 0, // radians
    isSpinning: false,
    picked: null,
    revealDone: false,
    score: 0,
    streak: 0,
    lastQuizLocked: false,
    dataSource: "local", // "api" | "local"
    audioBusy: false,
  };

  /** -----------------------------
   *  Utils
   *  ----------------------------- */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickNRandom(arr, n) {
    const copy = arr.slice();
    shuffleInPlace(copy);
    return copy.slice(0, n);
  }

  function setPill(mode, text) {
    el.statusPill.classList.remove("is-good", "is-bad", "is-info");
    if (mode) el.statusPill.classList.add(mode);
    el.statusPill.textContent = text;
  }

  function setOverlay(show, title, text) {
    if (show) {
      el.overlay.classList.remove("is-hidden");
      el.overlayTitle.textContent = title || "";
      el.overlayText.textContent = text || "";
    } else {
      el.overlay.classList.add("is-hidden");
    }
  }

  function updateStats() {
    el.scoreValue.textContent = String(state.score);
    el.streakValue.textContent = String(state.streak);
    el.levelValue.textContent = state.level || "—";
  }

  function resetResultUI() {
    state.picked = null;
    state.revealDone = false;
    state.lastQuizLocked = false;
    el.pickedEnglish.textContent = "—";
    el.pickedTurkish.textContent = "—";
    el.pickedAntonym.textContent = "—";
    el.pickedAntonymTr.textContent = "—";
    el.pickedSynonyms.textContent = "—";
    el.pickedLevel.textContent = "";
    el.quizOptions.innerHTML = "";
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quizFeedback";
    el.details.hidden = true;
    el.revealBtn.disabled = true;
    el.speakBtn.disabled = true;
  }

  /** -----------------------------
   *  API / Data loading
   *  ----------------------------- */
  function getApiBaseUrl() {
    // Deploy-friendly:
    // - If hosting frontend+backend on same domain, keep it empty and use same-origin "/words".
    // - If backend is on a different domain, pass ?api=https://api.example.com
    const qs = new URLSearchParams(window.location.search);
    const api = (qs.get("api") || "").trim();
    if (!api) return "";
    return api.replace(/\/+$/, "");
  }

  const API_BASE = getApiBaseUrl();

  async function fetchWordsFromApi(level) {
    const url = `${API_BASE}/words?level=${encodeURIComponent(level)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`API hatası: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("API yanıtı dizi değil");
    return data;
  }

  async function loadWheelWords(level) {
    setPill("is-info", "Yükleniyor…");
    el.spinBtn.disabled = true;
    el.reloadBtn.disabled = true;
    resetResultUI();

    // Overlay: loading
    setOverlay(true, "Kelimeler hazırlanıyor", "Seçtiğin seviyeye göre 8 kelime yükleniyor…");

    try {
      // Try API first (same-origin by default); fallback to local
      const apiWords = await fetchWordsFromApi(level);
      state.dataSource = "api";
      state.wheelWords = normalizeWords(apiWords, level);
    } catch {
      state.dataSource = "local";
      const pool = WORDS.filter((w) => w.level === level);
      state.wheelWords = pickNRandom(pool, 8);
    }

    el.dataSourceNote.textContent =
      state.dataSource === "api"
        ? (API_BASE ? `Veri kaynağı: API (${API_BASE})` : "Veri kaynağı: API (aynı domain)")
        : "Veri kaynağı: Uygulama içi kelime havuzu (API yoksa otomatik devreye girer)";

    drawWheel();
    setOverlay(false);
    setPill(null, "Hazır");
    el.spinBtn.disabled = false;
    el.reloadBtn.disabled = false;
  }

  function normalizeWords(apiWords, level) {
    // Accept API payloads that contain required fields. Provide safe fallbacks for extra fields.
    const clean = apiWords
      .map((w) => ({
        english: String(w.english || "").trim(),
        antonym: String(w.antonym || "").trim(),
        turkish: String(w.turkish || "").trim(),
        antonym_turkish: String(w.antonym_turkish || "").trim(),
        level: String(w.level || level).trim(),
        synonyms: Array.isArray(w.synonyms) ? w.synonyms.map(String) : [],
        meaning_options: Array.isArray(w.meaning_options) ? w.meaning_options.map(String) : [],
        correct_option: Number.isFinite(w.correct_option) ? w.correct_option : 0,
      }))
      .filter((w) => w.english && w.antonym && w.turkish && w.antonym_turkish && w.level);

    if (clean.length >= 8) return clean.slice(0, 8);
    // If API returned fewer than 8, top up from local pool of same level.
    const pool = WORDS.filter((x) => x.level === level);
    const needed = 8 - clean.length;
    const topUp = pickNRandom(pool.filter((x) => !clean.some((c) => c.english === x.english)), needed);
    return clean.concat(topUp);
  }

  /** -----------------------------
   *  Wheel rendering
   *  ----------------------------- */
  const ctx = el.canvas.getContext("2d");
  const WHEEL_COLORS = [
    ["#ffd7e1", "#ffb4c8"],
    ["#d6f5ff", "#aee8ff"],
    ["#e9ddff", "#d0c0ff"],
    ["#dff7e9", "#bfeccf"],
    ["#fff0d6", "#ffe2ae"],
    ["#dff0ff", "#b8dcff"],
    ["#ffe0f3", "#ffbfe6"],
    ["#e4fff4", "#baffdf"],
  ];

  function resizeCanvasForDPR() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const rect = el.canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    const target = Math.max(320, size);
    const px = target * dpr;
    if (el.canvas.width !== px || el.canvas.height !== px) {
      el.canvas.width = px;
      el.canvas.height = px;
    }
  }

  function drawWheel() {
    resizeCanvasForDPR();
    const dpr = el.canvas.width / el.canvas.getBoundingClientRect().width;
    const size = el.canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) * 0.95;
    const innerR = r * 0.12;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.angle);

    const segments = 8;
    const segAngle = (Math.PI * 2) / segments;
    const words = state.wheelWords;

    for (let i = 0; i < segments; i++) {
      const a0 = i * segAngle;
      const a1 = a0 + segAngle;
      const [c0, c1] = WHEEL_COLORS[i % WHEEL_COLORS.length];

      // Slice
      const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, r);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(31,35,48,.12)";
      ctx.lineWidth = Math.max(1, 1.5 * dpr);
      ctx.stroke();

      // Text
      const w = words[i]?.english || "—";
      const mid = a0 + segAngle / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(r * 0.62, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "rgba(31,35,48,.92)";
      ctx.font = `${Math.round(14 * dpr)}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(trimTo(w, 14), 0, 0);
      ctx.restore();
    }

    // Center cap
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(31,35,48,.10)";
    ctx.lineWidth = Math.max(1, 2 * dpr);
    ctx.stroke();

    ctx.restore();
  }

  function trimTo(s, max) {
    if (s.length <= max) return s;
    return s.slice(0, Math.max(0, max - 1)) + "…";
  }

  /** -----------------------------
   *  Spin animation
   *  ----------------------------- */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // SFX (WebAudio)
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playClick(freq = 640, durMs = 28, gain = 0.04) {
    if (!el.sfxToggle.checked) return;
    const ac = getAudioCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(ac.destination);
    const now = ac.currentTime;
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
    o.stop(now + durMs / 1000);
  }

  function playWhoosh() {
    if (!el.sfxToggle.checked) return;
    const ac = getAudioCtx();
    const bufferSize = 2 * ac.sampleRate;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.25;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const g = ac.createGain();
    g.gain.value = 0.05;
    src.connect(filter).connect(g).connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + 0.25);
  }

  function computePickedIndex() {
    // Pointer is at top (-90deg). We want which segment is under pointer.
    const segments = 8;
    const segAngle = (Math.PI * 2) / segments;
    const pointerAngle = -Math.PI / 2;
    // Wheel rotates by state.angle; segment i covers [i*segAngle, (i+1)*segAngle) in wheel space.
    // In world space: angle_world = angle_wheel + state.angle. We need wheel angle under pointer:
    const wheelAngleAtPointer = normalizeAngle(pointerAngle - state.angle);
    const idx = Math.floor(wheelAngleAtPointer / segAngle);
    return clamp(idx, 0, segments - 1);
  }

  function normalizeAngle(a) {
    let x = a % (Math.PI * 2);
    if (x < 0) x += Math.PI * 2;
    return x;
  }

  async function spin() {
    if (!state.level || state.isSpinning || state.wheelWords.length !== 8) return;
    state.isSpinning = true;
    el.spinBtn.disabled = true;
    el.reloadBtn.disabled = true;
    el.revealBtn.disabled = true;
    el.speakBtn.disabled = true;
    el.details.hidden = true;
    setPill("is-info", "Dönüyor…");
    state.picked = null;
    state.revealDone = false;
    state.lastQuizLocked = false;
    el.quizOptions.innerHTML = "";
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quizFeedback";

    // Spin params
    const start = state.angle;
    const extraTurns = randInt(4, 7) * Math.PI * 2;
    const jitter = (Math.random() * 0.8 - 0.4) * (Math.PI / 8);
    const target = start + extraTurns + jitter;
    const duration = randInt(2400, 3400);

    // Tick logic: play click when crossing segment boundaries (approx)
    let lastTickIdx = computePickedIndex();
    playWhoosh();

    await animate(duration, (t) => {
      const eased = easeOutCubic(t);
      state.angle = start + (target - start) * eased;
      drawWheel();

      const idx = computePickedIndex();
      if (idx !== lastTickIdx && t < 0.98) {
        lastTickIdx = idx;
        const speedFactor = 1 - t;
        const freq = 520 + Math.floor(220 * speedFactor);
        playClick(freq, 20, 0.028);
      }
    });

    // Final settle tick + stop sound
    playClick(480, 40, 0.045);

    const pickedIndex = computePickedIndex();
    const picked = state.wheelWords[pickedIndex];
    state.picked = picked;
    state.isSpinning = false;

    el.pickedEnglish.textContent = picked?.english || "—";
    el.pickedLevel.textContent = picked ? `Seviye: ${picked.level}` : "";
    el.revealBtn.disabled = !picked;
    el.speakBtn.disabled = !picked || !el.audioToggle.checked;
    setPill(null, "Durdu");
    setOverlay(false);

    if (picked && el.audioToggle.checked) {
      speakSequence(picked).catch(() => {});
    }

    el.spinBtn.disabled = false;
    el.reloadBtn.disabled = false;
  }

  function animate(durationMs, onFrame) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = clamp((now - t0) / durationMs, 0, 1);
        onFrame(t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  /** -----------------------------
   *  Reveal + Quiz
   *  ----------------------------- */
  function revealDetails() {
    if (!state.picked || state.revealDone) return;
    state.revealDone = true;
    const w = state.picked;

    el.pickedTurkish.textContent = w.turkish;
    el.pickedAntonym.textContent = w.antonym;
    el.pickedAntonymTr.textContent = w.antonym_turkish;
    el.pickedSynonyms.textContent = (w.synonyms && w.synonyms.length ? w.synonyms.join(", ") : "—");

    el.details.hidden = false;
    el.revealBtn.disabled = true;

    buildQuiz(w);
  }

  function buildQuiz(w) {
    el.quizOptions.innerHTML = "";
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quizFeedback";

    const options = Array.isArray(w.meaning_options) && w.meaning_options.length === 2
      ? w.meaning_options.slice()
      : makeMeaningOptionsFallback(w);

    const correctIdx = Number.isFinite(w.correct_option) ? clamp(w.correct_option, 0, 1) : 0;

    options.forEach((opt, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "optBtn";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (state.lastQuizLocked) return;
        state.lastQuizLocked = true;
        const correct = idx === correctIdx;
        if (correct) {
          b.classList.add("is-correct");
          state.score += 10;
          state.streak += 1;
          el.quizFeedback.textContent = "Doğru! +10 puan";
          el.quizFeedback.classList.add("good");
          setPill("is-good", "Tebrikler");
          playClick(820, 70, 0.05);
        } else {
          b.classList.add("is-wrong");
          // mark correct
          const correctBtn = el.quizOptions.querySelectorAll(".optBtn")[correctIdx];
          if (correctBtn) correctBtn.classList.add("is-correct");
          state.streak = 0;
          el.quizFeedback.textContent = "Yanlış. Seri sıfırlandı.";
          el.quizFeedback.classList.add("bad");
          setPill("is-bad", "Tekrar dene");
          playClick(240, 90, 0.05);
        }
        updateStats();
      });
      el.quizOptions.appendChild(b);
    });
  }

  function makeMeaningOptionsFallback(w) {
    // Ensure 2 options (correct + distractor). Keep it Turkish.
    const distractors = [
      "şaşırmak",
      "geleneksel",
      "uygun",
      "rastgele",
      "yansızlık",
      "kapsamlı",
      "kaygan",
      "uysal",
    ];
    const correct = w.turkish;
    let wrong = distractors[randInt(0, distractors.length - 1)];
    if (wrong === correct) wrong = "farklı anlam";
    const opts = [correct, wrong];
    shuffleInPlace(opts);
    const correctIdx = opts.indexOf(correct);
    w.meaning_options = opts;
    w.correct_option = correctIdx;
    return opts;
  }

  /** -----------------------------
   *  Speech synthesis
   *  ----------------------------- */
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function setAudioUI(isBusy) {
    state.audioBusy = isBusy;
    el.speakBtn.disabled = !state.picked || !el.audioToggle.checked || isBusy;
    if (isBusy) setPill("is-info", "Okunuyor…");
    else if (state.picked) setPill(null, "Durdu");
  }

  function speak(text, lang) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) return reject(new Error("SpeechSynthesis yok"));
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.95;
      u.pitch = 1.0;
      u.onend = () => resolve();
      u.onerror = () => reject(new Error("SpeechSynthesis hata"));
      window.speechSynthesis.speak(u);
    });
  }

  async function speakSequence(word) {
    if (!el.audioToggle.checked) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      setAudioUI(true);
      // 1) English word
      await speak(word.english, "en-US");
      await sleep(250);
      // 2) Antonym (English)
      await speak(word.antonym, "en-US");
      await sleep(250);
      // 3) Turkish translations of both (one phrase)
      const tr = `${word.turkish}. Zıt anlamı: ${word.antonym_turkish}.`;
      await speak(tr, "tr-TR");
    } finally {
      setAudioUI(false);
    }
  }

  /** -----------------------------
   *  Events
   *  ----------------------------- */
  function selectLevel(level) {
    state.level = level;
    updateStats();
    el.chips.forEach((c) => c.classList.toggle("is-active", c.dataset.level === level));
    loadWheelWords(level).catch(() => {
      setPill("is-bad", "Yüklenemedi");
      setOverlay(true, "Yüklenemedi", "Kelimeler yüklenemedi. Lütfen tekrar dene.");
    });
  }

  el.chips.forEach((btn) => {
    btn.addEventListener("click", () => selectLevel(btn.dataset.level));
  });

  el.spinBtn.addEventListener("click", () => spin());
  el.reloadBtn.addEventListener("click", () => {
    if (!state.level || state.isSpinning) return;
    loadWheelWords(state.level).catch(() => {});
  });
  el.revealBtn.addEventListener("click", () => revealDetails());
  el.speakBtn.addEventListener("click", () => {
    if (!state.picked) return;
    speakSequence(state.picked).catch(() => {});
  });

  el.audioToggle.addEventListener("change", () => {
    if (!el.audioToggle.checked) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setAudioUI(false);
    }
    el.speakBtn.disabled = !state.picked || !el.audioToggle.checked || state.audioBusy;
  });

  window.addEventListener("resize", () => drawWheel());

  // PWA / Offline
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  // Initial UI
  updateStats();
  resetResultUI();
  setOverlay(true, "Seviye seç", "Çarkı çevirmek için önce bir seviye seç.");
  setPill(null, "Hazır");

  // In case user tries to spin without selection (extra guard)
  el.spinBtn.addEventListener("mouseenter", () => {
    if (!state.level) setOverlay(true, "Seviye seç", "Önce A1–C2 seviyelerinden birini seçmelisin.");
  });
})();

