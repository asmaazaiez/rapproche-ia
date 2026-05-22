import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CHARGEMENT pdf.js DEPUIS CDN
// ═══════════════════════════════════════════════════════════════════════════
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 🆕 Charge jsPDF + autoTable depuis CDN (pour le PDF des flux intercomptes)
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable) {
      return resolve(window.jspdf);
    }
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload = () => resolve(window.jspdf);
      s2.onerror = () => reject(new Error("Échec chargement jspdf-autotable"));
      document.head.appendChild(s2);
    };
    s1.onerror = () => reject(new Error("Échec chargement jsPDF"));
    document.head.appendChild(s1);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// CSS AVEC VARIABLES (toggle thème)
// ═══════════════════════════════════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0e1a;
    --bg-glow1: rgba(56,189,248,.06);
    --bg-glow2: rgba(99,102,241,.07);
    --text: #e2e8f4;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --text-very-dim: #475569;
    --card: rgba(15,23,42,.6);
    --card-solid: rgba(15,23,42,.5);
    --card-darker: rgba(15,23,42,.9);
    --header-bg: rgba(10,14,26,.9);
    --nav-bg: rgba(10,14,26,.7);
    --border: rgba(255,255,255,.07);
    --border-light: rgba(255,255,255,.04);
    --border-input: rgba(255,255,255,.1);
    --input-bg: rgba(15,23,42,.8);
    --hover-row: rgba(56,189,248,.03);
    --accent: #38bdf8;
    --accent-dark: #0ea5e9;
    --primary-text: #fff;
    --shadow: rgba(0,0,0,.2);
  }

  .theme-light {
    --bg: #f8fafc;
    --bg-glow1: rgba(56,189,248,.10);
    --bg-glow2: rgba(99,102,241,.08);
    --text: #0f172a;
    --text-muted: #475569;
    --text-dim: #64748b;
    --text-very-dim: #94a3b8;
    --card: rgba(255,255,255,.85);
    --card-solid: rgba(241,245,249,.9);
    --card-darker: rgba(248,250,252,.95);
    --header-bg: rgba(255,255,255,.9);
    --nav-bg: rgba(255,255,255,.7);
    --border: rgba(15,23,42,.08);
    --border-light: rgba(15,23,42,.05);
    --border-input: rgba(15,23,42,.12);
    --input-bg: #fff;
    --hover-row: rgba(56,189,248,.06);
    --primary-text: #fff;
    --shadow: rgba(15,23,42,.08);
  }

  body { font-family: 'DM Mono', monospace; background: var(--bg); color: var(--text); min-height: 100vh; transition: background .25s, color .25s; }
  .app { min-height: 100vh; background: var(--bg);
    background-image: radial-gradient(ellipse 80% 50% at 20% 0%, var(--bg-glow1) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, var(--bg-glow2) 0%, transparent 60%); }

  .header { display:flex; align-items:center; justify-content:space-between; padding:18px 40px;
    border-bottom:1px solid var(--border); backdrop-filter:blur(10px);
    position:sticky; top:0; z-index:100; background:var(--header-bg); }
  .header-left { display:flex; align-items:center; gap:16px; }
  .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:20px; letter-spacing:-.5px; color:var(--text); }
  .logo span { color:var(--accent); }
  .badge { font-size:10px; background:rgba(56,189,248,.12); color:var(--accent);
    border:1px solid rgba(56,189,248,.25); border-radius:20px; padding:4px 10px; letter-spacing:1px; text-transform:uppercase; }
  .theme-toggle { background: var(--input-bg); border: 1px solid var(--border-input); color: var(--text);
    width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center; transition: all .2s; }
  .theme-toggle:hover { transform: scale(1.1); border-color: var(--accent); }

  .nav-tabs { display:flex; gap:0; padding:0 40px; border-bottom:1px solid var(--border);
    background:var(--nav-bg); overflow-x:auto; }
  .nav-tab { padding:13px 18px; font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
    text-transform:uppercase; letter-spacing:1.5px; border:none; background:transparent; color:var(--text-very-dim);
    cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; margin-bottom:-1px; white-space:nowrap; }
  .nav-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
  .nav-tab:hover:not(.active) { color:var(--text-muted); }

  .main { padding:40px; max-width:1400px; margin:0 auto; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:14px;
    padding:28px; margin-bottom:20px; backdrop-filter:blur(10px); box-shadow:0 4px 24px var(--shadow); }

  .upload-zone { border:2px dashed rgba(56,189,248,.25); border-radius:12px; padding:32px; text-align:center;
    cursor:pointer; transition:all .25s; background:rgba(56,189,248,.02); position:relative; }
  .upload-zone:hover { border-color:var(--accent); background:rgba(56,189,248,.06); }
  .upload-zone.active { border-color:#10b981; background:rgba(16,185,129,.06); }
  .upload-zone.loading { border-color:#fbbf24; background:rgba(251,191,36,.06); cursor:wait; }
  .upload-icon { font-size:40px; margin-bottom:12px; color:var(--accent); }
  .upload-label { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:var(--text); margin-bottom:6px; }
  .upload-hint { font-size:11px; color:var(--text-dim); letter-spacing:.5px; }
  .upload-badge { display:inline-block; background:rgba(16,185,129,.15); color:#10b981; padding:5px 14px;
    border-radius:20px; font-size:11px; font-weight:600; margin-top:10px; border:1px solid rgba(16,185,129,.3); }
  .upload-badge.pdf { background:rgba(239,68,68,.15); color:#f87171; border-color:rgba(239,68,68,.3); }

  .btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase;
    letter-spacing:1px; padding:10px 20px; border-radius:8px; border:none; cursor:pointer; transition:all .2s; }
  .btn-primary { background:linear-gradient(135deg,#38bdf8 0%,#0ea5e9 100%); color:#fff; box-shadow:0 4px 14px rgba(56,189,248,.3); }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(56,189,248,.4); }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .btn-secondary { background:rgba(100,116,139,.15); color:var(--text-muted); border:1px solid rgba(100,116,139,.3); }
  .btn-secondary:hover { background:rgba(100,116,139,.25); color:var(--text); }
  .btn-danger { background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3); }
  .btn-danger:hover { background:rgba(239,68,68,.25); }
  .btn-export { background:rgba(16,185,129,.15); color:#10b981; border:1px solid rgba(16,185,129,.3); }
  .btn-export:hover { background:rgba(16,185,129,.25); }

  .table-wrapper { overflow-x:auto; border-radius:10px; border:1px solid var(--border); }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  thead { background:var(--card-darker); position:sticky; top:0; z-index:10; }
  th { padding:12px 16px; text-align:left; font-weight:700; font-size:10px; text-transform:uppercase;
    letter-spacing:1.2px; color:var(--text-muted); border-bottom:1px solid var(--border); }
  td { padding:11px 16px; border-bottom:1px solid var(--border-light); color: var(--text); }
  tbody tr { transition:background .15s; }
  tbody tr:hover { background:var(--hover-row); }
  .tag { display:inline-block; padding:3px 10px; border-radius:12px; font-size:10px; font-weight:700; letter-spacing:.5px; }
  .tag-matched { background:rgba(16,185,129,.15); color:#10b981; border:1px solid rgba(16,185,129,.3); }
  .tag-matched-delayed { background:rgba(56,189,248,.15); color:var(--accent); border:1px solid rgba(56,189,248,.3); }
  .tag-partial { background:rgba(251,191,36,.15); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }
  .tag-mismatch { background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3); }
  .tag-unmatched-out { background:rgba(239,68,68,.1); color:#fca5a5; border:1px solid rgba(239,68,68,.25); }
  .tag-unmatched-in { background:rgba(168,85,247,.1); color:#c4b5fd; border:1px solid rgba(168,85,247,.25); }
  .tag-scale-error { background:rgba(168,85,247,.15); color:#a855f7; border:1px solid rgba(168,85,247,.3); }
  .tag-coherent { background:rgba(16,185,129,.15); color:#10b981; border:1px solid rgba(16,185,129,.3); }
  .tag-incoherent { background:rgba(251,191,36,.15); color:#fbbf24; border:1px solid rgba(251,191,36,.3); }

  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:24px; }
  .stat-card { background:var(--card-solid); border:1px solid var(--border); border-radius:10px; padding:18px; }
  .stat-value { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:var(--text); margin-bottom:4px; }
  .stat-label { font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .loading { display:inline-block; width:16px; height:16px; border:2px solid rgba(56,189,248,.2);
    border-top-color:var(--accent); border-radius:50%; animation:spin .6s linear infinite; margin-right:8px; }

  .compte-section { display:flex; gap:16px; flex-wrap:wrap; align-items:end; margin-bottom:24px; }
  .compte-input { flex:1; min-width:200px; }
  .compte-input label { display:block; font-size:11px; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; }
  .compte-input input, .styled-input, .styled-select { width:100%; padding:10px 14px; background:var(--input-bg);
    border:1px solid var(--border-input); border-radius:8px; color:var(--text); font-size:13px; font-family:'DM Mono',monospace; }
  .compte-input input:focus, .styled-input:focus, .styled-select:focus { outline:none; border-color:var(--accent); }
  .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:20px; }
  .setting-row { display:flex; gap:16px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
  .setting-row label { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }
  .setting-row input[type=number] { width:80px; padding:6px 10px; background:var(--input-bg);
    border:1px solid var(--border-input); border-radius:6px; color:var(--text); font-family:'DM Mono',monospace; }

  .history-item, .balance-card { background:var(--card-solid); border:1px solid var(--border); border-radius:10px; padding:18px;
    margin-bottom:12px; transition: all .2s; }
  .history-item:hover, .balance-card:hover { border-color: var(--accent); }
  .history-header { display:flex; justify-content:space-between; align-items:start; margin-bottom:10px; flex-wrap:wrap; gap:10px; }
  .history-title { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:var(--text); }
  .history-date { font-size:11px; color:var(--text-dim); }
  .history-comptes { font-size:12px; color:var(--text-muted); margin-bottom:8px; }
  .history-stats { display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-dim); margin-bottom:10px; }
  .history-stats span { color:var(--text-muted); }
  .history-stats strong { color:var(--text); font-weight:700; }
  .history-actions { display:flex; gap:8px; }
  .empty-history { text-align:center; padding:40px; color:var(--text-dim); font-size:13px; }

  /* SOLDES */
  .balance-info { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 8px 14px;
    background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.2); border-radius: 8px;
    font-size: 11px; color: #10b981; font-weight: 600; }
  .balance-info.warning { background: rgba(251,191,36,.08); border-color: rgba(251,191,36,.2); color: #fbbf24; }
  .balance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 12px; }
  .balance-item { background: var(--input-bg); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-input); }
  .balance-item-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .balance-item-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: var(--text); }
  .balance-formula { margin-top: 10px; padding: 10px 14px; background: var(--input-bg); border-radius: 6px;
    font-size: 11px; color: var(--text-muted); font-family: 'DM Mono', monospace; }
`;

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS — Nettoyage montants/dates
// ═══════════════════════════════════════════════════════════════════════════
const cleanAmount = (val) => {
  if (typeof val === "number") return val;
  let str = String(val || "").replace(/\s/g, "");
  str = str.replace(/[$€£¥]/g, "");
  if (str.includes(",") && str.includes(".")) {
    str = str.replace(/,/g, "");
  } else if (str.includes(",")) {
    const parts = str.split(",");
    if (parts[1] && parts[1].length <= 2) str = str.replace(",", ".");
    else str = str.replace(/,/g, "");
  }
  const match = str.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const formatAmount = (val) => {
  const num = typeof val === "number" ? val : cleanAmount(val);
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(num);
};

const normalizeDate = (str) => {
  if (!str) return "";
  const s = String(str).trim();
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const slashMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    let [, a, b, y] = slashMatch;
    if (y.length === 2) y = "20" + y;
    // Smart format detection: if a > 12, it's D/M/Y (European)
    // If b > 12, it's M/D/Y (North American — QuickBooks Canada)
    // Default to M/D/Y (most common in Canadian accounting exports)
    let day, month;
    if (parseInt(a) > 12) { day = a; month = b; }
    else if (parseInt(b) > 12) { day = b; month = a; }
    else { day = b; month = a; } // ambiguous → default M/D/Y
    return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return s;
};

// 🆕 Détection auto du séparateur (virgule, point-virgule, tab)
const detectSeparator = (lines) => {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  for (const line of lines) {
    // Compter seulement les séparateurs HORS guillemets
    let inQ = false;
    for (const c of line) {
      if (c === '"') { inQ = !inQ; continue; }
      if (inQ) continue;
      if (c === ",") counts[","]++;
      else if (c === ";") counts[";"]++;
      else if (c === "\t") counts["\t"]++;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

// 🆕 Découpe une ligne CSV en respectant les guillemets (gère "1,279.44")
const splitCSVLine = (line, sep) => {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      // Guillemet échappé ("")
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (c === sep && !inQuotes) {
      result.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  result.push(cur);
  return result.map((v) => v.trim());
};

const isDateLike = (s) => /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$|^\d{4}-\d{2}-\d{2}$|^\d{8}$/.test(String(s || "").trim());

const parseCSV = (text) => {
  text = text.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  // 🆕 Détecter le séparateur (hors guillemets)
  const sep = detectSeparator(lines.slice(0, 5));

  const headerKeywords = /\b(date|amount|montant|description|libell|memo|m[eé]mo|debit|credit|d[eé]p[oô]t|paiement|transaction|posted)\b/i;
  let headerIdx = -1;
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const fields = splitCSVLine(lines[i], sep);
    if (fields.filter((f) => headerKeywords.test(f)).length >= 2) {
      headerIdx = i;
      break;
    }
  }

  // 🆕 Pas de header trouvé → format QuickBooks sans en-tête
  if (headerIdx === -1) {
    const firstRow = splitCSVLine(lines[0], sep);
    if (firstRow.length >= 5 && isDateLike(firstRow[0])) {
      const qbHeaders = ["Date", "Numéro", "Payeur", "Description", "Debit", "Credit", "Statut", "Cat", "Solde", "Type", "Compte", "Notes"];
      return lines.map((line) => {
        const vals = splitCSVLine(line, sep);
        const row = {};
        qbHeaders.forEach((h, i) => (row[h] = vals[i] || ""));
        row["Libellé"] = [row.Payeur, row.Description].filter((x) => x && x !== "Annulé").join(" - ");
        return row;
      }).filter((r) => isDateLike(r.Date));
    }
    return [];
  }

  const headers = splitCSVLine(lines[headerIdx], sep);
  return lines.slice(headerIdx + 1)
    .map((line) => {
      const vals = splitCSVLine(line, sep);
      const row = {};
      headers.forEach((h, i) => (row[h] = vals[i] || ""));
      return row;
    })
    .filter((row) => {
      const firstVal = Object.values(row)[0] || "";
      return firstVal && !headerKeywords.test(firstVal.substring(0, 30));
    });
};

const findKey = (row, patterns) => {
  for (const key of Object.keys(row)) {
    const k = key.trim().toLowerCase();
    for (const p of patterns) {
      if (k === p.toLowerCase() || k.includes(p.toLowerCase())) return key;
    }
  }
  return null;
};

const gDate = (row) => {
  const k = findKey(row, ["Date Posted", "Posting Date", "Transaction Date", "Date"]);
  return k ? normalizeDate(row[k]) : "";
};

const gLabel = (row) => {
  const k = findKey(row, ["Description", "Libellé", "Libelle", "Label", "Memo", "Mémo"]);
  return k ? String(row[k] || "").trim() : "";
};

const getAmount = (row) => {
  const k = findKey(row, ["Transaction Amount", "Montant", "Amount"]);
  if (k) return cleanAmount(row[k]);
  const dk = findKey(row, ["Debit", "Paiement", "Retrait"]);
  const ck = findKey(row, ["Credit", "Dépôt", "Depot"]);
  if (dk && ck) return cleanAmount(row[ck] || 0) - cleanAmount(row[dk] || 0);
  return 0;
};

// 🆕 Récupère la valeur de la colonne Solde d'une ligne
const getSolde = (row) => {
  const k = findKey(row, ["Solde", "Balance", "Running Balance"]);
  return k ? cleanAmount(row[k]) : null;
};

// 🆕 Cherche les soldes dans le TEXTE BRUT du CSV (ligne de titre type
// "Solde bancaire: 300.00 ... Solde de fermeture: $28,211.43")
const extractSoldesFromHeader = (text) => {
  if (!text) return null;
  // Regarder seulement les 5 premières lignes (la ligne de titre)
  const head = text.replace(/^\uFEFF/, "").split(/\r?\n/).slice(0, 5).join(" ");

  // Patterns pour solde d'ouverture
  const ouvMatch = head.match(/solde\s+(?:bancaire|d['e\s]?ouverture|initial|d['e\s]?d[ée]but)\s*:?\s*\$?\s*([\d\s.,]+)/i);
  // Patterns pour solde de fermeture
  const fermMatch = head.match(/solde\s+(?:de\s+)?(?:fermeture|final|de\s+fin|de\s+cl[ôo]ture)\s*:?\s*\$?\s*([\d\s.,]+)/i);

  if (!ouvMatch && !fermMatch) return null;
  return {
    ouverture: ouvMatch ? cleanAmount(ouvMatch[1]) : null,
    fermeture: fermMatch ? cleanAmount(fermMatch[1]) : null,
  };
};

// 🆕 Calcule soldes ouverture/fermeture depuis la colonne Solde des données
const computeSoldesFromData = (data) => {
  if (!data || !data.length) return null;
  const first = data[0];
  const last = data[data.length - 1];
  const soldeFirst = getSolde(first);
  const soldeLast = getSolde(last);
  // Totaux débits/crédits (toujours calculables)
  let totalDebits = 0, totalCredits = 0;
  data.forEach((row) => {
    const m = getAmount(row);
    if (m < 0) totalDebits += Math.abs(m);
    else totalCredits += m;
  });
  if (soldeFirst == null || soldeLast == null) {
    return { ouverture: null, fermeture: null,
      totalDebits: +totalDebits.toFixed(2), totalCredits: +totalCredits.toFixed(2) };
  }
  const ouverture = +(soldeFirst - getAmount(first)).toFixed(2);
  const fermeture = +soldeLast.toFixed(2);
  return {
    ouverture, fermeture,
    totalDebits: +totalDebits.toFixed(2),
    totalCredits: +totalCredits.toFixed(2),
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE API
// ═══════════════════════════════════════════════════════════════════════════
// 🆕 Extracteur JSON ultra-robuste — balanced brace matching, gère les chaînes échappées
const extractJSON = (text) => {
  if (!text) throw new Error("Réponse API vide");
  // Enlever blocs markdown ```json et ```
  let cleaned = text.replace(/```(?:json)?/gi, "").trim();

  // Stratégie 1 : parse direct
  try { return JSON.parse(cleaned); } catch {}

  // Stratégie 2 : trouver le premier { ou [ et matcher avec balanced braces
  const firstObj = cleaned.indexOf("{");
  const firstArr = cleaned.indexOf("[");
  let start;
  if (firstObj === -1 && firstArr === -1) {
    console.error("Réponse Claude sans JSON détecté:", cleaned);
    throw new Error("Pas de JSON dans la réponse : " + cleaned.substring(0, 200));
  }
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);

  const openChar = cleaned[start];
  const closeChar = openChar === "{" ? "}" : "]";

  // Balanced brace matching (ignore les chars dans les strings)
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (escape) { escape = false; continue; }
    if (c === "\\") { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === openChar) depth++;
    else if (c === closeChar) {
      depth--;
      if (depth === 0) {
        const jsonStr = cleaned.substring(start, i + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.error("JSON extrait mais invalide:", jsonStr);
          console.error("Texte brut reçu:", cleaned);
          throw new Error("JSON extrait mais invalide à la position " + e.message);
        }
      }
    }
  }
  // Si on arrive ici, c'est que les braces ne sont pas équilibrées (réponse tronquée)
  console.error("Réponse Claude tronquée (max_tokens dépassé ?):", cleaned);
  throw new Error("Réponse tronquée — max_tokens probablement dépassé. Reçu " + cleaned.length + " caractères.");
};

const callClaude = async (prompt, maxTokens = 4000) => {
  let resp;
  try {
    resp = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        // Instruction système stricte pour forcer le JSON pur
        system: "Tu es un parseur de données. Tu réponds UNIQUEMENT avec du JSON valide. Aucun texte avant, aucun texte après, aucun bloc markdown. Ta réponse commence par { ou [ et se termine par } ou ].",
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch (e) {
    throw new Error("Connexion au serveur échouée : " + e.message);
  }

  let data;
  try {
    data = await resp.json();
  } catch (e) {
    throw new Error(`Réponse serveur illisible (HTTP ${resp.status})`);
  }

  if (!resp.ok) {
    const msg = data?.error?.message || data?.error || JSON.stringify(data);
    console.error("Erreur API Claude:", data);
    throw new Error(`API erreur (HTTP ${resp.status}) : ${msg}`);
  }
  if (data?.error) {
    console.error("Erreur dans la réponse Claude:", data);
    throw new Error(`API erreur : ${data.error.message || data.error}`);
  }
  if (!data?.content || !Array.isArray(data.content) || data.content.length === 0) {
    console.error("Réponse Claude sans contenu:", data);
    throw new Error("L'API a répondu sans contenu. Vérifiez votre clé API et votre crédit Anthropic.");
  }

  const text = data.content[0]?.text || "";
  if (!text) {
    console.error("Bloc de contenu vide:", data);
    throw new Error("L'API a renvoyé un contenu vide. stop_reason: " + (data.stop_reason || "inconnu"));
  }

  return text;
};

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACTION PDF
// ═══════════════════════════════════════════════════════════════════════════
const extractPDFText = async (file) => {
  const lib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const linesByY = {};
    textContent.items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!linesByY[y]) linesByY[y] = [];
      linesByY[y].push({ x: item.transform[4], text: item.str });
    });
    const sortedLines = Object.entries(linesByY)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      .map(([, items]) => items.sort((a, b) => a.x - b.x).map((i) => i.text).join(" "));
    fullText += `\n--- PAGE ${pageNum} ---\n` + sortedLines.join("\n");
  }
  return fullText;
};

// 🆕 Extraction des SOLDES + transactions en un seul appel
const parsePDFViaClaude = async (rawText, sourceHint = "") => {
  const prompt = `Tu es un parseur de relevés bancaires. Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.

Texte du PDF${sourceHint ? ` (${sourceHint})` : ""}:
${rawText.slice(0, 18000)}

Extrais et retourne ce JSON exact (remplir les valeurs depuis le PDF) :

{"metadata":{"compte":"","banque":"","dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD"},"soldes":{"ouverture":0,"totalDebits":0,"totalCredits":0,"fermeture":0},"transactions":[{"Date":"YYYY-MM-DD","Libellé":"texte","Montant":0}]}

RÈGLES :
- Montant POSITIF pour crédit/dépôt, NÉGATIF pour débit/retrait
- IGNORE "Opening balance", "Closing totals", "Number of items processed"
- Si solde introuvable : mettre null (pas 0)
- Date au format YYYY-MM-DD (déduire l'année de la période si nécessaire)
- N'AJOUTE AUCUN texte explicatif, JSON pur uniquement`;

  const txt = await callClaude(prompt, 8000);
  const parsed = extractJSON(txt);
  return {
    transactions: parsed.transactions || [],
    soldes: parsed.soldes || null,
    metadata: parsed.metadata || null,
  };
};

const parseFile = async (file, compteName = "") => {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const rawText = await extractPDFText(file);
    if (!rawText.trim() || rawText.length < 100) {
      throw new Error("Le PDF semble vide ou scanné. OCR requis pour les PDF scannés.");
    }
    const result = await parsePDFViaClaude(rawText, compteName);
    return { data: result.transactions, soldes: result.soldes, metadata: result.metadata, rawText: null };
  } else if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    return { data: parseCSV(text), soldes: null, metadata: null, rawText: text };
  } else {
    throw new Error(`Type non supporté : ${file.name}`);
  }
};

// 🆕 Vérification cohérence comptable : Ouverture − Débits + Crédits = Fermeture
const verifySoldes = (soldes) => {
  if (!soldes || soldes.ouverture == null || soldes.fermeture == null) return null;
  const debits = soldes.totalDebits || 0;
  const credits = soldes.totalCredits || 0;
  const expected = soldes.ouverture - debits + credits;
  const ecart = +(soldes.fermeture - expected).toFixed(2);
  return {
    expected: +expected.toFixed(2),
    ecart,
    coherent: Math.abs(ecart) < 0.01,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// DÉTECTION INTERCOMPTES DÉTERMINISTE (date réception ≥ date envoi)
// ═══════════════════════════════════════════════════════════════════════════
const daysBetween = (d1, d2) =>
  Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24));

const looksLikeIntercompte = (label) => {
  if (!label) return false;
  const l = label.toLowerCase();
  return /\binter[\s-]?compte\b/.test(l) || /\btf\s+[0-9#]/.test(l) || /transfert?\s+(inter|entre)/.test(l);
};

const buildFluxRow = (sent, rcv, status) => ({
  Date: sent.date,
  "Compte source": sent.compte,
  "Date réception": rcv.date,
  "Compte destination": rcv.compte,
  Montant: sent.absAmount,
  "Délai (jours)": daysBetween(sent.date, rcv.date),
  "Libellé source": sent.label,
  "Libellé destination": rcv.label,
  Statut: status,
});

const buildUnmatchedRow = (tx, status) => ({
  Date: tx.isDebit ? tx.date : "—",
  "Compte source": tx.isDebit ? tx.compte : "(non identifié)",
  "Date réception": tx.isDebit ? "—" : tx.date,
  "Compte destination": tx.isDebit ? "(non identifié)" : tx.compte,
  Montant: tx.absAmount,
  "Délai (jours)": "—",
  "Libellé source": tx.isDebit ? tx.label : "—",
  "Libellé destination": tx.isDebit ? "—" : tx.label,
  Statut: status,
});

const pickBestCandidate = (candidates, sent) =>
  candidates.sort((a, b) => {
    const dA = daysBetween(sent.date, a.date);
    const dB = daysBetween(sent.date, b.date);
    if (dA !== dB) return dA - dB;
    const scoreA = looksLikeIntercompte(a.label) ? 1 : 0;
    const scoreB = looksLikeIntercompte(b.label) ? 1 : 0;
    return scoreB - scoreA;
  })[0];

const detectIntercomptesLocally = (comptes, options = {}) => {
  const { dateTolerance = 7, amountTolerance = 0.01, detectScaleErrors = true, mainCompte = null } = options;
  const allTxs = [];
  comptes.forEach((compte) => {
    compte.data.forEach((row, idx) => {
      const date = gDate(row);
      const amount = getAmount(row);
      if (!date || amount === 0) return;
      allTxs.push({
        compte: compte.nom, idx, date, amount,
        absAmount: Math.abs(amount), label: gLabel(row), isDebit: amount < 0,
      });
    });
  });

  // 🆕 Un transfert est pertinent seulement s'il touche le compte principal
  const touchesMain = (compteA, compteB) =>
    !mainCompte || compteA === mainCompte || compteB === mainCompte;

  const matched = new Set();
  const flux = [];
  const debits = allTxs.filter((t) => t.isDebit).sort((a, b) => a.date.localeCompare(b.date));

  for (const sent of debits) {
    const key = `${sent.compte}|${sent.idx}`;
    if (matched.has(key)) continue;

    let candidates = allTxs.filter((rcv) => {
      if (rcv.compte === sent.compte) return false;
      if (rcv.amount <= 0) return false;
      if (matched.has(`${rcv.compte}|${rcv.idx}`)) return false;
      // 🆕 Garder seulement les transferts touchant le compte principal
      if (!touchesMain(sent.compte, rcv.compte)) return false;
      const dDelta = daysBetween(sent.date, rcv.date);
      if (dDelta < 0 || dDelta > dateTolerance) return false;
      return Math.abs(rcv.absAmount - sent.absAmount) <= amountTolerance;
    });

    if (candidates.length === 0 && detectScaleErrors) {
      candidates = allTxs.filter((rcv) => {
        if (rcv.compte === sent.compte) return false;
        if (rcv.amount <= 0) return false;
        if (matched.has(`${rcv.compte}|${rcv.idx}`)) return false;
        if (!touchesMain(sent.compte, rcv.compte)) return false;
        const dDelta = daysBetween(sent.date, rcv.date);
        if (dDelta < 0 || dDelta > dateTolerance) return false;
        const ratio = sent.absAmount / rcv.absAmount;
        return (ratio > 95 && ratio < 105) || (ratio > 0.0095 && ratio < 0.0105);
      });
      if (candidates.length > 0) {
        const best = pickBestCandidate(candidates, sent);
        matched.add(key);
        matched.add(`${best.compte}|${best.idx}`);
        flux.push(buildFluxRow(sent, best, "scale_error"));
        continue;
      }
    }

    if (candidates.length === 0) {
      // 🆕 Envoi non apparié : seulement si depuis le compte principal
      if (looksLikeIntercompte(sent.label) && (!mainCompte || sent.compte === mainCompte)) {
        flux.push(buildUnmatchedRow(sent, "unmatched_sent"));
      }
      continue;
    }

    const best = pickBestCandidate(candidates, sent);
    matched.add(key);
    matched.add(`${best.compte}|${best.idx}`);
    const delta = daysBetween(sent.date, best.date);
    flux.push(buildFluxRow(sent, best, delta === 0 ? "matched" : "matched_delayed"));
  }

  for (const rcv of allTxs.filter((t) => !t.isDebit && t.amount > 0)) {
    if (matched.has(`${rcv.compte}|${rcv.idx}`)) continue;
    // 🆕 Réception non appariée : seulement si sur le compte principal
    if (looksLikeIntercompte(rcv.label) && (!mainCompte || rcv.compte === mainCompte)) {
      flux.push(buildUnmatchedRow(rcv, "unmatched_received"));
    }
  }

  flux.sort((a, b) => a.Date.localeCompare(b.Date));
  return flux;
};

// ═══════════════════════════════════════════════════════════════════════════
// HISTORIQUE — localStorage
// ═══════════════════════════════════════════════════════════════════════════
const HISTORY_KEY = "rapproche_history_v1";
const MAX_HISTORY = 50;
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const saveHistory = (h) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY))); } catch {} };
const addToHistory = (entry) => { const h = loadHistory(); h.unshift({ ...entry, id: Date.now() }); saveHistory(h); return h; };
const formatHistoryDate = (iso) => new Date(iso).toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState("rapprochement");
  const [theme, setTheme] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("rapproche_theme") || "dark" : "dark"));
  const [history, setHistory] = useState(() => loadHistory());

  const [accA, setAccA] = useState({ nom: "", data: [], loading: false, soldes: null, metadata: null });
  const [accB, setAccB] = useState({ nom: "", data: [], loading: false, soldes: null, metadata: null });
  const [rapproResult, setRapproResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [comptes, setComptes] = useState([]);
  const [fluxResult, setFluxResult] = useState(null);
  const [sourceFilter, setSourceFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateTolerance, setDateTolerance] = useState(7);

  // 🆕 Soldes — onglet dédié
  const [pdfsSoldes, setPdfsSoldes] = useState([]); // [{ id, fileName, soldes, metadata, loading }]
  const [loadingPdfBatch, setLoadingPdfBatch] = useState(false);

  const refA = useRef(null);
  const refB = useRef(null);
  const refPdfBatch = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.className = theme === "light" ? "theme-light" : "";
      localStorage.setItem("rapproche_theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ─── HANDLERS COMMUNS ────────────────────────────────────────────────────
  const handleFile = async (e, setter, current) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter({ ...current, loading: true });
    try {
      const result = await parseFile(file, current.nom);
      // 🆕 Soldes : priorité 1 = PDF, priorité 2 = ligne de titre CSV, priorité 3 = colonne Solde
      let soldes = result.soldes;
      if (!soldes && result.rawText) {
        // Chercher d'abord dans la ligne de titre ("Solde bancaire: ... Solde de fermeture: ...")
        const headerSoldes = extractSoldesFromHeader(result.rawText);
        const dataSoldes = computeSoldesFromData(result.data);
        if (headerSoldes) {
          soldes = {
            ouverture: headerSoldes.ouverture != null ? headerSoldes.ouverture : dataSoldes?.ouverture ?? null,
            fermeture: headerSoldes.fermeture != null ? headerSoldes.fermeture : dataSoldes?.fermeture ?? null,
            totalDebits: dataSoldes?.totalDebits ?? null,
            totalCredits: dataSoldes?.totalCredits ?? null,
          };
        } else {
          soldes = dataSoldes;
        }
      }
      setter({
        nom: current.nom || file.name.replace(/\.[^.]+$/, ""),
        data: result.data,
        loading: false,
        fileType: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "csv",
        soldes,
        metadata: result.metadata,
      });
    } catch (err) {
      alert("Erreur de lecture : " + err.message);
      setter({ ...current, loading: false });
    }
  };

  const handleFileA = (e) => handleFile(e, setAccA, accA);
  const handleFileB = (e) => handleFile(e, setAccB, accB);

  // ─── RAPPROCHEMENT ───────────────────────────────────────────────────────
  const runRapprochement = async () => {
    if (!accA.data.length || !accB.data.length) {
      alert("Chargez les deux comptes d'abord !");
      return;
    }
    setLoading(true);
    setRapproResult(null);

    const promptA = accA.data.slice(0, 80).map((r, i) => `${i}| ${gDate(r)} | ${gLabel(r)} | ${getAmount(r)}`).join("\n");
    const promptB = accB.data.slice(0, 80).map((r, i) => `${i}| ${gDate(r)} | ${gLabel(r)} | ${getAmount(r)}`).join("\n");

    const prompt = `Rapproche ces 2 comptes (paires de transactions identiques).

IMPORTANT : si un montant dans A est 100x un montant dans B (ex. 3920 vs 39.20), c'est probablement la MÊME transaction avec une erreur d'extraction PDF. Apparie quand même.

Compte A (${accA.nom}):
${promptA}

Compte B (${accB.nom}):
${promptB}

JSON uniquement (sans markdown) :
{"p": [[indexA, indexB], ...], "aOnly": [...], "bOnly": [...]}`;

    try {
      const txt = await callClaude(prompt, 8000);
      const raw = extractJSON(txt);
      const pairs = (raw.p || []).map(([ia, ib]) => {
        const ra = accA.data[ia], rb = accB.data[ib];
        const amountA = getAmount(ra), amountB = getAmount(rb);
        const delta = +(amountA - amountB).toFixed(2);
        const absD = Math.abs(delta);
        const ratio = Math.abs(amountA) / Math.max(Math.abs(amountB), 0.0001);
        const isScale = (ratio > 95 && ratio < 105) || (ratio > 0.0095 && ratio < 0.0105);
        let status;
        if (isScale) status = "scale-error";
        else if (absD < 0.01) status = "matched";
        else if (absD < 5 || absD / Math.max(Math.abs(amountA), Math.abs(amountB), 1) < 0.05) status = "partial";
        else status = "mismatch";
        return { dateA: gDate(ra), labelA: gLabel(ra), amountA, dateB: gDate(rb), labelB: gLabel(rb), amountB, delta, status };
      });
      const aOnly = (raw.aOnly || []).map((i) => { const r = accA.data[i]; return { date: gDate(r), label: gLabel(r), amount: getAmount(r) }; });
      const bOnly = (raw.bOnly || []).map((i) => { const r = accB.data[i]; return { date: gDate(r), label: gLabel(r), amount: getAmount(r) }; });
      const result = { pairs, aOnly, bOnly };
      setRapproResult(result);

      const newHistory = addToHistory({
        type: "rapprochement",
        date: new Date().toISOString(),
        comptes: [accA.nom, accB.nom],
        stats: {
          matched: pairs.filter((p) => p.status === "matched").length,
          partial: pairs.filter((p) => p.status === "partial").length,
          mismatch: pairs.filter((p) => p.status === "mismatch").length,
          scaleError: pairs.filter((p) => p.status === "scale-error").length,
          aOnly: aOnly.length, bOnly: bOnly.length,
        },
        data: result,
      });
      setHistory(newHistory);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Réinitialiser tout l'onglet rapprochement
  const resetRapprochement = () => {
    if (!confirm("Réinitialiser le rapprochement ? Les comptes chargés et les résultats seront effacés.")) return;
    setAccA({ nom: "", data: [], loading: false, soldes: null, metadata: null });
    setAccB({ nom: "", data: [], loading: false, soldes: null, metadata: null });
    setRapproResult(null);
    if (refA.current) refA.current.value = "";
    if (refB.current) refB.current.value = "";
  };

  const exportExcel = () => {
    if (!rapproResult) return;
    let csv = `=== TRANSACTIONS APPARIÉES ===\n`;
    csv += `Date ${accA.nom},Libellé ${accA.nom},Montant ${accA.nom},Date ${accB.nom},Libellé ${accB.nom},Montant ${accB.nom},Écart,Statut\n`;
    rapproResult.pairs.forEach((p) => {
      csv += `${p.dateA},"${p.labelA}",${p.amountA},${p.dateB},"${p.labelB}",${p.amountB},${p.delta},${p.status}\n`;
    });
    csv += `\n=== SEULEMENT DANS ${accA.nom || "COMPTE A"} (NON RAPPROCHÉ) ===\n`;
    csv += `Date,Libellé,Montant\n`;
    rapproResult.aOnly.forEach((r) => {
      csv += `${r.date},"${r.label}",${r.amount}\n`;
    });
    csv += `\n=== SEULEMENT DANS ${accB.nom || "COMPTE B"} (NON RAPPROCHÉ) ===\n`;
    csv += `Date,Libellé,Montant\n`;
    rapproResult.bOnly.forEach((r) => {
      csv += `${r.date},"${r.label}",${r.amount}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rapprochement_${Date.now()}.csv`;
    link.click();
  };

  // ─── INTERCOMPTES ───────────────────────────────────────────────────────
  const addCompte = () => setComptes([...comptes, { id: Date.now(), nom: "", data: [], loading: false }]);
  const removeCompte = (id) => setComptes(comptes.filter((c) => c.id !== id));
  const updateCompteNom = (id, nom) => setComptes(comptes.map((c) => (c.id === id ? { ...c, nom } : c)));

  const handleCompteFile = async (id, file) => {
    if (!file) return;
    setComptes((prev) => prev.map((c) => (c.id === id ? { ...c, loading: true } : c)));
    try {
      const current = comptes.find((c) => c.id === id);
      const result = await parseFile(file, current?.nom);
      setComptes((prev) => prev.map((c) =>
        c.id === id ? {
          ...c, data: result.data,
          nom: c.nom || file.name.replace(/\.[^.]+$/, ""),
          loading: false,
          fileType: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "csv",
          soldes: result.soldes, metadata: result.metadata,
        } : c
      ));
    } catch (err) {
      alert("Erreur : " + err.message);
      setComptes((prev) => prev.map((c) => (c.id === id ? { ...c, loading: false } : c)));
    }
  };

  const runFluxAnalysis = () => {
    const valid = comptes.filter((c) => c.nom && c.data.length > 0);
    if (valid.length < 2) {
      alert("Il faut au moins 2 comptes avec des données et un nom !");
      return;
    }
    // 🆕 Le premier compte de la liste est le compte principal
    const mainCompte = valid[0].nom;
    const result = detectIntercomptesLocally(valid, { dateTolerance, mainCompte });
    setFluxResult(result);

    const newHistory = addToHistory({
      type: "flux",
      date: new Date().toISOString(),
      comptes: valid.map((c) => c.nom),
      stats: {
        matched: result.filter((f) => f.Statut === "matched" || f.Statut === "matched_delayed").length,
        unmatchedSent: result.filter((f) => f.Statut === "unmatched_sent").length,
        unmatchedReceived: result.filter((f) => f.Statut === "unmatched_received").length,
        scaleError: result.filter((f) => f.Statut === "scale_error").length,
      },
      data: result, dateTolerance,
    });
    setHistory(newHistory);
  };

  const filteredFlux = fluxResult ? fluxResult.filter((f) => {
    const matchSource = !sourceFilter || f["Compte source"] === sourceFilter;
    const matchDest = !destFilter || f["Compte destination"] === destFilter;
    const matchStatus = !statusFilter || f.Statut === statusFilter;
    return matchSource && matchDest && matchStatus;
  }) : [];

  const exportFluxExcel = () => {
    if (!filteredFlux.length) return;
    const headers = Object.keys(filteredFlux[0]);
    let csv = headers.join(",") + "\n";
    filteredFlux.forEach((f) => {
      csv += headers.map((h) => `"${String(f[h] ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const suffix = sourceFilter || destFilter || statusFilter ? `_filtré` : "";
    link.download = `Flux_Intercomptes${suffix}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // 🆕 Génère un PDF téléchargeable des flux intercomptes
  const exportFluxPDF = async () => {
    if (!filteredFlux.length) {
      alert("Aucun flux à exporter. Lancez d'abord une analyse.");
      return;
    }
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();

      // Libellés lisibles des statuts
      const statusText = (s) => ({
        matched: "Apparié",
        matched_delayed: "Apparié (délai)",
        unmatched_sent: "Envoi sans réception",
        unmatched_received: "Réception sans envoi",
        scale_error: "Erreur x100",
      }[s] || s);

      // ─── En-tête ───
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Résumé des flux intercomptes", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const dateGen = new Date().toLocaleDateString("fr-CA", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
      doc.text("Généré le " + dateGen, 14, 28);

      // Comptes analysés
      const comptesNoms = [...new Set([
        ...filteredFlux.map((f) => f["Compte source"]),
        ...filteredFlux.map((f) => f["Compte destination"]),
      ])].filter((c) => c && !c.includes("non identifié"));
      doc.text("Comptes : " + comptesNoms.join("  /  "), 14, 34);

      // ─── Statistiques ───
      const nbMatched = filteredFlux.filter((f) => f.Statut === "matched" || f.Statut === "matched_delayed").length;
      const nbUnsent = filteredFlux.filter((f) => f.Statut === "unmatched_sent").length;
      const nbUnrec = filteredFlux.filter((f) => f.Statut === "unmatched_received").length;
      const nbScale = filteredFlux.filter((f) => f.Statut === "scale_error").length;
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${filteredFlux.length} flux  -  ${nbMatched} appariés  -  ${nbUnsent} envois seuls  -  ${nbUnrec} réceptions seules  -  ${nbScale} erreurs x100`,
        14, 41
      );

      // ─── Tableau des transferts ───
      const rows = filteredFlux.map((f) => [
        f.Date || "—",
        f["Compte source"] || "—",
        f["Date réception"] || "—",
        f["Compte destination"] || "—",
        formatAmount(f.Montant),
        String(f["Délai (jours)"] ?? "—"),
        statusText(f.Statut),
      ]);

      doc.autoTable({
        head: [["Date envoi", "Banque source", "Date récep.", "Banque destination", "Montant", "Délai", "Statut"]],
        body: rows,
        startY: 47,
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [56, 189, 248], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        columnStyles: {
          4: { halign: "right" },
          5: { halign: "center" },
        },
        // Colorer la ligne selon le statut
        didParseCell: (data) => {
          if (data.section === "body") {
            const statut = filteredFlux[data.row.index].Statut;
            if (statut === "unmatched_sent" || statut === "unmatched_received") {
              data.cell.styles.textColor = [180, 83, 9];
            } else if (statut === "scale_error") {
              data.cell.styles.textColor = [168, 85, 247];
            }
          }
        },
      });

      // ─── Totaux par compte ───
      let finalY = doc.lastAutoTable.finalY + 10;
      const totaux = {};
      filteredFlux.forEach((f) => {
        const src = f["Compte source"];
        const dst = f["Compte destination"];
        const m = typeof f.Montant === "number" ? f.Montant : 0;
        if (src && !src.includes("non identifié")) {
          totaux[src] = totaux[src] || { envoye: 0, recu: 0 };
          totaux[src].envoye += m;
        }
        if (dst && !dst.includes("non identifié")) {
          totaux[dst] = totaux[dst] || { envoye: 0, recu: 0 };
          totaux[dst].recu += m;
        }
      });

      if (Object.keys(totaux).length > 0) {
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("Totaux par compte", 14, finalY);
        const totauxRows = Object.entries(totaux).map(([compte, t]) => [
          compte,
          formatAmount(t.envoye),
          formatAmount(t.recu),
          formatAmount(t.recu - t.envoye),
        ]);
        doc.autoTable({
          head: [["Compte", "Total envoyé", "Total reçu", "Solde net"]],
          body: totauxRows,
          startY: finalY + 4,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
          columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
        });
      }

      // ─── Pied de page ───
      const nbPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= nbPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Rapproche.IA - Résumé des flux intercomptes", 14, doc.internal.pageSize.getHeight() - 8);
        doc.text(`Page ${i} / ${nbPages}`, pageW - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
      }

      doc.save(`Flux_Intercomptes_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      alert("Erreur lors de la génération du PDF : " + err.message);
    }
  };

  // ─── HISTORIQUE ──────────────────────────────────────────────────────────
  const deleteHistoryItem = (id) => { const h = history.filter((x) => x.id !== id); saveHistory(h); setHistory(h); };
  const clearHistory = () => { if (!confirm("Effacer tout l'historique ?")) return; saveHistory([]); setHistory([]); };
  const replayHistoryItem = (item) => {
    if (item.type === "rapprochement") { setRapproResult(item.data); setActiveTab("rapprochement"); }
    else if (item.type === "flux") { setFluxResult(item.data); setActiveTab("intercomptes"); }
  };

  // ─── 🆕 SOLDES — handlers ────────────────────────────────────────────────
  const handlePdfBatch = async (files) => {
    if (!files || !files.length) return;
    setLoadingPdfBatch(true);
    const fileArr = Array.from(files);

    const startingId = Date.now();
    const placeholders = fileArr.map((f, idx) => ({
      id: startingId + idx, fileName: f.name, loading: true, soldes: null, metadata: null, error: null,
    }));
    setPdfsSoldes((prev) => [...prev, ...placeholders]);

    for (let idx = 0; idx < fileArr.length; idx++) {
      const file = fileArr[idx];
      const id = startingId + idx;
      try {
        const result = await parseFile(file, file.name);
        setPdfsSoldes((prev) => prev.map((p) =>
          p.id === id ? { ...p, loading: false, soldes: result.soldes, metadata: result.metadata } : p
        ));
      } catch (err) {
        setPdfsSoldes((prev) => prev.map((p) =>
          p.id === id ? { ...p, loading: false, error: err.message } : p
        ));
      }
    }
    setLoadingPdfBatch(false);
  };

  const removePdfSolde = (id) => setPdfsSoldes(pdfsSoldes.filter((p) => p.id !== id));
  const clearAllSoldes = () => { if (!confirm("Effacer tous les soldes ?")) return; setPdfsSoldes([]); };

  const exportSoldesCSV = () => {
    if (!pdfsSoldes.length) return;
    let csv = "Fichier,Banque,Compte,Date début,Date fin,Solde ouverture,Total débits,Total crédits,Solde fermeture,Solde calculé,Écart,Cohérent\n";
    pdfsSoldes.forEach((p) => {
      if (!p.soldes) {
        csv += `"${p.fileName}",,,,,,,,,,${p.error || "Erreur"}\n`;
        return;
      }
      const v = verifySoldes(p.soldes);
      csv += `"${p.fileName}","${p.metadata?.banque || ""}","${p.metadata?.compte || ""}",${p.metadata?.dateDebut || ""},${p.metadata?.dateFin || ""},${p.soldes.ouverture ?? ""},${p.soldes.totalDebits ?? ""},${p.soldes.totalCredits ?? ""},${p.soldes.fermeture ?? ""},${v?.expected ?? ""},${v?.ecart ?? ""},${v?.coherent ? "OUI" : "NON"}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Soldes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // ─── Sélecteurs pour filtres intercomptes ────────────────────────────────
  const uniqueSources = fluxResult ? [...new Set(fluxResult.map((f) => f["Compte source"]))] : [];
  const uniqueDests = fluxResult ? [...new Set(fluxResult.map((f) => f["Compte destination"]))] : [];
  const uniqueStatuses = fluxResult ? [...new Set(fluxResult.map((f) => f.Statut))] : [];

  const matchedCount = fluxResult?.filter((f) => f.Statut === "matched" || f.Statut === "matched_delayed").length || 0;
  const unmatchedSentCount = fluxResult?.filter((f) => f.Statut === "unmatched_sent").length || 0;
  const unmatchedReceivedCount = fluxResult?.filter((f) => f.Statut === "unmatched_received").length || 0;
  const scaleErrorCount = fluxResult?.filter((f) => f.Statut === "scale_error").length || 0;

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="logo">Rapproche<span>.IA</span></div>
          <div className="badge">v5 · {theme === "dark" ? "Sombre" : "Clair"}</div>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Passer en clair" : "Passer en sombre"}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="nav-tabs">
        <button className={`nav-tab ${activeTab === "rapprochement" ? "active" : ""}`} onClick={() => setActiveTab("rapprochement")}>🏦 Rapprochement</button>
        <button className={`nav-tab ${activeTab === "intercomptes" ? "active" : ""}`} onClick={() => setActiveTab("intercomptes")}>🔀 Flux Intercomptes</button>
        <button className={`nav-tab ${activeTab === "soldes" ? "active" : ""}`} onClick={() => setActiveTab("soldes")}>📄 Soldes</button>
        <button className={`nav-tab ${activeTab === "historique" ? "active" : ""}`} onClick={() => setActiveTab("historique")}>📜 Historique {history.length > 0 && `(${history.length})`}</button>
      </div>

      <div className="main">
        {/* ═════ RAPPROCHEMENT ═════ */}
        {activeTab === "rapprochement" && (
          <>
            <div className="card">
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 20 }}>📂 Charger les comptes</h2>
              <div className="compte-section">
                <div className="compte-input">
                  <label>Nom du compte A</label>
                  <input type="text" value={accA.nom} onChange={(e) => setAccA({ ...accA, nom: e.target.value })} placeholder="Ex: QuickBooks" />
                </div>
                <div className="compte-input">
                  <label>Nom du compte B</label>
                  <input type="text" value={accB.nom} onChange={(e) => setAccB({ ...accB, nom: e.target.value })} placeholder="Ex: BMO Chèque" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <UploadZone refInput={refA} acc={accA} label="Compte A" onChange={handleFileA} />
                  {accA.soldes && <SoldesInline soldes={accA.soldes} metadata={accA.metadata} />}
                  {accA.data.length > 0 && <TransactionsPreview data={accA.data} nom={accA.nom} />}
                </div>
                <div>
                  <UploadZone refInput={refB} acc={accB} label="Compte B" onChange={handleFileB} />
                  {accB.soldes && <SoldesInline soldes={accB.soldes} metadata={accB.metadata} />}
                  {accB.data.length > 0 && <TransactionsPreview data={accB.data} nom={accB.nom} />}
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-primary" onClick={runRapprochement} disabled={loading || accA.loading || accB.loading}>
                  {loading && <span className="loading"></span>}
                  {loading ? "Analyse en cours..." : "🔍 Analyser"}
                </button>
                <button className="btn btn-secondary" onClick={resetRapprochement} disabled={loading}>
                  🔄 Réinitialiser
                </button>
              </div>
            </div>

            {rapproResult && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18 }}>📊 Résultats</h2>
                  <button className="btn btn-export" onClick={exportExcel}>📥 Exporter Excel</button>
                </div>
                <div className="stats">
                  <div className="stat-card"><div className="stat-value">{rapproResult.pairs.length}</div><div className="stat-label">Rapprochés</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ color: "#a855f7" }}>{rapproResult.pairs.filter((p) => p.status === "scale-error").length}</div><div className="stat-label">Erreurs ×100</div></div>
                  <div className="stat-card"><div className="stat-value">{rapproResult.aOnly.length}</div><div className="stat-label">Seulement A</div></div>
                  <div className="stat-card"><div className="stat-value">{rapproResult.bOnly.length}</div><div className="stat-label">Seulement B</div></div>
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 14, marginBottom: 12, marginTop: 8, color: "var(--text)" }}>
                  ✓ Transactions appariées ({rapproResult.pairs.length})
                </h3>
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Date A</th><th>Libellé A</th><th>Montant A</th><th>Date B</th><th>Libellé B</th><th>Montant B</th><th>Écart</th><th>Statut</th></tr></thead>
                    <tbody>
                      {rapproResult.pairs.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-dim)", padding: 20 }}>Aucune transaction appariée</td></tr>
                      ) : (
                        rapproResult.pairs.map((p, i) => (
                          <tr key={i}>
                            <td>{p.dateA}</td><td>{p.labelA}</td><td>{formatAmount(p.amountA)}</td>
                            <td>{p.dateB}</td><td>{p.labelB}</td><td>{formatAmount(p.amountB)}</td>
                            <td>{formatAmount(p.delta)}</td>
                            <td><span className={`tag tag-${p.status}`}>
                              {p.status === "matched" && "✓ Rapproché"}
                              {p.status === "partial" && "≈ Partiel"}
                              {p.status === "mismatch" && "✗ Mismatch"}
                              {p.status === "scale-error" && "⚠ Erreur ×100"}
                            </span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 🆕 Seulement dans A (QuickBooks) */}
                {rapproResult.aOnly.length > 0 && (
                  <>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 14, marginBottom: 12, marginTop: 28, color: "var(--text)" }}>
                      → Seulement dans {accA.nom || "Compte A"} ({rapproResult.aOnly.length})
                      <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 12, fontWeight: 400 }}>
                        — Transactions non rapprochées dans {accA.nom || "Compte A"}
                      </span>
                    </h3>
                    <div className="table-wrapper">
                      <table>
                        <thead><tr><th>Date</th><th>Libellé</th><th>Montant</th></tr></thead>
                        <tbody>
                          {rapproResult.aOnly.map((r, i) => (
                            <tr key={i}>
                              <td>{r.date}</td>
                              <td>{r.label}</td>
                              <td style={{ color: r.amount < 0 ? "#f87171" : "#10b981", fontWeight: 600 }}>
                                {formatAmount(r.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* 🆕 Seulement dans B (Banque) */}
                {rapproResult.bOnly.length > 0 && (
                  <>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 14, marginBottom: 12, marginTop: 28, color: "var(--text)" }}>
                      ← Seulement dans {accB.nom || "Compte B"} ({rapproResult.bOnly.length})
                      <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 12, fontWeight: 400 }}>
                        — Transactions non rapprochées dans {accB.nom || "Compte B"}
                      </span>
                    </h3>
                    <div className="table-wrapper">
                      <table>
                        <thead><tr><th>Date</th><th>Libellé</th><th>Montant</th></tr></thead>
                        <tbody>
                          {rapproResult.bOnly.map((r, i) => (
                            <tr key={i}>
                              <td>{r.date}</td>
                              <td>{r.label}</td>
                              <td style={{ color: r.amount < 0 ? "#f87171" : "#10b981", fontWeight: 600 }}>
                                {formatAmount(r.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ═════ INTERCOMPTES ═════ */}
        {activeTab === "intercomptes" && (
          <>
            <div className="card">
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 8 }}>🏢 Comptes à analyser</h2>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.6 }}>
                Le <strong style={{ color: "#10b981" }}>compte #1 est le compte principal</strong>. L'analyse ne détecte que les transferts qui le touchent — soit comme source, soit comme destination. Les transferts entre deux comptes secondaires sont ignorés.
              </p>
              {comptes.map((c, idx) => (
                <div key={c.id} style={{ marginBottom: 20, padding: 16, background: "var(--card-solid)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
                    <div style={{ flex: "0 0 90px" }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 14, color: "var(--text-dim)" }}>#{idx + 1}</div>
                      {idx === 0 && (
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 10, padding: "2px 7px", marginTop: 4, textAlign: "center", letterSpacing: ".5px" }}>
                          PRINCIPAL
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Nom du compte</label>
                      <input className="styled-input" type="text" value={c.nom} onChange={(e) => updateCompteNom(c.id, e.target.value)} placeholder="Ex: BMO Chèque" />
                    </div>
                    <div>
                      <input type="file" accept=".csv,.pdf" onChange={(e) => handleCompteFile(c.id, e.target.files?.[0])} style={{ display: "none" }} id={`file-${c.id}`} />
                      <label htmlFor={`file-${c.id}`} className="btn btn-secondary" style={{ cursor: "pointer" }}>
                        {c.loading ? "⏳ Lecture..." : "📂 Charger PDF/CSV"}
                      </label>
                    </div>
                    <button className="btn btn-danger" onClick={() => removeCompte(c.id)}>🗑️</button>
                  </div>
                  {c.data.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 11, color: "#10b981" }}>
                      ✓ {c.data.length} transactions chargées {c.fileType === "pdf" && "(PDF)"}
                    </div>
                  )}
                  {c.soldes && <SoldesInline soldes={c.soldes} metadata={c.metadata} />}
                </div>
              ))}

              <div className="setting-row">
                <label>Tolérance date (jours):</label>
                <input type="number" min="0" max="30" value={dateTolerance} onChange={(e) => setDateTolerance(parseInt(e.target.value) || 7)} />
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Réception doit être ≥ envoi, dans les N jours.</span>
              </div>

              <div className="actions">
                <button className="btn btn-secondary" onClick={addCompte}>➕ Ajouter un compte</button>
                <button className="btn btn-primary" onClick={runFluxAnalysis}>🔀 Analyser les flux</button>
              </div>
            </div>

            {fluxResult && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18 }}>🔄 Flux intercomptes ({filteredFlux.length}/{fluxResult.length})</h2>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-export" onClick={exportFluxExcel}>📥 Excel ({filteredFlux.length})</button>
                    <button className="btn btn-primary" onClick={exportFluxPDF}>📄 Télécharger PDF</button>
                  </div>
                </div>

                <div className="stats">
                  <div className="stat-card"><div className="stat-value" style={{ color: "#10b981" }}>{matchedCount}</div><div className="stat-label">Appariés</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ color: "#fca5a5" }}>{unmatchedSentCount}</div><div className="stat-label">Envois sans réception</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ color: "#c4b5fd" }}>{unmatchedReceivedCount}</div><div className="stat-label">Réceptions sans envoi</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ color: "#a855f7" }}>{scaleErrorCount}</div><div className="stat-label">Erreurs ×100</div></div>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Source</label>
                    <select className="styled-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                      <option value="">-- Toutes --</option>
                      {uniqueSources.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Destination</label>
                    <select className="styled-select" value={destFilter} onChange={(e) => setDestFilter(e.target.value)}>
                      <option value="">-- Toutes --</option>
                      {uniqueDests.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Statut</label>
                    <select className="styled-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="">-- Tous --</option>
                      {uniqueStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date envoi</th><th>Source</th><th>Date réception</th><th>Destination</th>
                        <th>Montant</th><th>Délai</th><th>Libellé source</th><th>Libellé destination</th><th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlux.map((f, i) => {
                        const cls =
                          f.Statut === "matched" ? "tag-matched" :
                          f.Statut === "matched_delayed" ? "tag-matched-delayed" :
                          f.Statut === "unmatched_sent" ? "tag-unmatched-out" :
                          f.Statut === "unmatched_received" ? "tag-unmatched-in" :
                          f.Statut === "scale_error" ? "tag-scale-error" : "tag-partial";
                        const label =
                          f.Statut === "matched" ? "✓ Apparié" :
                          f.Statut === "matched_delayed" ? `≈ Délai ${f["Délai (jours)"]}j` :
                          f.Statut === "unmatched_sent" ? "→ Envoi seul" :
                          f.Statut === "unmatched_received" ? "← Réception seule" :
                          f.Statut === "scale_error" ? "⚠ ×100" : f.Statut;
                        return (
                          <tr key={i}>
                            <td>{f.Date}</td>
                            <td>{f["Compte source"]}</td>
                            <td>{f["Date réception"]}</td>
                            <td>{f["Compte destination"]}</td>
                            <td>{formatAmount(f.Montant)}</td>
                            <td>{f["Délai (jours)"]}</td>
                            <td style={{ fontSize: 11 }}>{f["Libellé source"]}</td>
                            <td style={{ fontSize: 11 }}>{f["Libellé destination"]}</td>
                            <td><span className={`tag ${cls}`}>{label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═════ 🆕 SOLDES ═════ */}
        {activeTab === "soldes" && (
          <>
            <div className="card">
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 12 }}>📄 Extraction des soldes</h2>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>
                Chargez un ou plusieurs PDF de relevés bancaires. L'app extrait automatiquement le solde d'ouverture, le solde de fermeture, les totaux débits/crédits, et vérifie la cohérence comptable.
              </p>

              <div className="upload-zone" onClick={() => refPdfBatch.current?.click()}>
                <div className="upload-icon">📤</div>
                <div className="upload-label">Charger des PDFs</div>
                <div className="upload-hint">Cliquez pour sélectionner un ou plusieurs relevés bancaires PDF</div>
                <input ref={refPdfBatch} type="file" accept=".pdf" multiple onChange={(e) => handlePdfBatch(e.target.files)} style={{ display: "none" }} />
              </div>

              {loadingPdfBatch && (
                <div style={{ marginTop: 16, fontSize: 12, color: "#fbbf24" }}>
                  <span className="loading"></span> Extraction en cours… (chaque PDF prend 3-10s)
                </div>
              )}

              {pdfsSoldes.length > 0 && (
                <div className="actions">
                  <button className="btn btn-export" onClick={exportSoldesCSV}>📥 Exporter CSV</button>
                  <button className="btn btn-danger" onClick={clearAllSoldes}>🗑️ Tout effacer</button>
                </div>
              )}
            </div>

            {pdfsSoldes.length > 0 && (
              <div className="card">
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 20 }}>
                  📊 Récapitulatif ({pdfsSoldes.length} relevé{pdfsSoldes.length > 1 ? "s" : ""})
                </h2>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Fichier</th><th>Banque</th><th>Compte</th><th>Période</th>
                        <th>Ouverture</th><th>Débits</th><th>Crédits</th><th>Fermeture</th>
                        <th>Vérification</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pdfsSoldes.map((p) => {
                        const v = p.soldes ? verifySoldes(p.soldes) : null;
                        return (
                          <tr key={p.id}>
                            <td style={{ fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.fileName}>{p.fileName}</td>
                            <td>{p.loading ? <span className="loading" /> : p.metadata?.banque || "—"}</td>
                            <td style={{ fontSize: 11 }}>{p.metadata?.compte || "—"}</td>
                            <td style={{ fontSize: 11 }}>
                              {p.metadata?.dateDebut && p.metadata?.dateFin
                                ? `${p.metadata.dateDebut} → ${p.metadata.dateFin}`
                                : "—"}
                            </td>
                            <td>{p.soldes?.ouverture != null ? formatAmount(p.soldes.ouverture) : "—"}</td>
                            <td>{p.soldes?.totalDebits != null ? formatAmount(p.soldes.totalDebits) : "—"}</td>
                            <td>{p.soldes?.totalCredits != null ? formatAmount(p.soldes.totalCredits) : "—"}</td>
                            <td>{p.soldes?.fermeture != null ? formatAmount(p.soldes.fermeture) : "—"}</td>
                            <td>
                              {p.error ? (
                                <span className="tag tag-mismatch">✗ Erreur</span>
                              ) : p.loading ? (
                                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Lecture…</span>
                              ) : v == null ? (
                                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>—</span>
                              ) : v.coherent ? (
                                <span className="tag tag-coherent">✓ Cohérent</span>
                              ) : (
                                <span className="tag tag-incoherent" title={`Écart : ${formatAmount(v.ecart)}`}>
                                  ⚠ Écart {formatAmount(v.ecart)}
                                </span>
                              )}
                            </td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => removePdfSolde(p.id)}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="balance-formula" style={{ marginTop: 16 }}>
                  💡 Formule de vérification : <strong>Ouverture − Débits + Crédits = Fermeture</strong> (tolérance 1 cent)
                </div>
              </div>
            )}
          </>
        )}

        {/* ═════ HISTORIQUE ═════ */}
        {activeTab === "historique" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 18 }}>📜 Historique des conciliations ({history.length})</h2>
              {history.length > 0 && <button className="btn btn-danger" onClick={clearHistory}>🗑️ Tout effacer</button>}
            </div>

            {history.length === 0 ? (
              <div className="empty-history">Aucun historique pour l'instant. Lancez une conciliation ou une analyse de flux pour commencer.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-header">
                    <div>
                      <div className="history-title">{item.type === "rapprochement" ? "🏦 Rapprochement" : "🔀 Flux intercomptes"}</div>
                      <div className="history-comptes">{item.comptes.join(" ↔ ")}</div>
                    </div>
                    <div className="history-date">{formatHistoryDate(item.date)}</div>
                  </div>
                  <div className="history-stats">
                    {item.type === "rapprochement" ? (
                      <>
                        <span><strong>{item.stats.matched}</strong> rapprochés</span>
                        {item.stats.partial > 0 && <span><strong>{item.stats.partial}</strong> partiels</span>}
                        {item.stats.mismatch > 0 && <span><strong>{item.stats.mismatch}</strong> mismatch</span>}
                        {item.stats.scaleError > 0 && <span><strong>{item.stats.scaleError}</strong> ×100</span>}
                        <span><strong>{item.stats.aOnly}</strong> seulement A</span>
                        <span><strong>{item.stats.bOnly}</strong> seulement B</span>
                      </>
                    ) : (
                      <>
                        <span><strong>{item.stats.matched}</strong> appariés</span>
                        <span><strong>{item.stats.unmatchedSent}</strong> envois seuls</span>
                        <span><strong>{item.stats.unmatchedReceived}</strong> réceptions seules</span>
                        {item.stats.scaleError > 0 && <span><strong>{item.stats.scaleError}</strong> ×100</span>}
                      </>
                    )}
                  </div>
                  <div className="history-actions">
                    <button className="btn btn-secondary" onClick={() => replayHistoryItem(item)}>👁️ Revoir</button>
                    <button className="btn btn-danger" onClick={() => deleteHistoryItem(item.id)}>🗑️ Supprimer</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════
function UploadZone({ refInput, acc, label, onChange }) {
  const zoneClass = acc.loading ? "upload-zone loading" : acc.data.length ? "upload-zone active" : "upload-zone";
  return (
    <div className={zoneClass} onClick={() => !acc.loading && refInput.current?.click()}>
      <div className="upload-icon">{acc.loading ? "⏳" : "📤"}</div>
      <div className="upload-label">{label}</div>
      <div className="upload-hint">{acc.loading ? "Extraction en cours..." : "Cliquez : PDF bancaire ou CSV"}</div>
      {acc.data.length > 0 && !acc.loading && (
        <div className={`upload-badge ${acc.fileType === "pdf" ? "pdf" : ""}`}>
          ✓ {acc.data.length} transactions {acc.fileType === "pdf" ? "(PDF)" : "(CSV)"}
        </div>
      )}
      <input ref={refInput} type="file" accept=".csv,.pdf" onChange={onChange} style={{ display: "none" }} />
    </div>
  );
}

// 🆕 Aperçu des transactions chargées (sous l'upload zone)
function TransactionsPreview({ data, nom }) {
  if (!data || !data.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Aperçu — {data.length} transaction{data.length > 1 ? "s" : ""} {nom ? `· ${nom}` : ""}
      </div>
      <div className="table-wrapper" style={{ maxHeight: 260, overflowY: "auto" }}>
        <table>
          <thead>
            <tr><th>Date</th><th>Libellé</th><th>Montant</th></tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const montant = getAmount(row);
              return (
                <tr key={i}>
                  <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>{gDate(row)}</td>
                  <td style={{ fontSize: 11 }}>{gLabel(row)}</td>
                  <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color: montant < 0 ? "#f87171" : "#10b981" }}>
                    {formatAmount(montant)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 🆕 Affiche les soldes extraits d'un PDF (sous l'upload zone)
function SoldesInline({ soldes, metadata }) {
  const v = verifySoldes(soldes);
  return (
    <div style={{ marginTop: 12 }}>
      <div className={`balance-info ${v && !v.coherent ? "warning" : ""}`}>
        {v && v.coherent ? "✓" : v ? "⚠" : "ℹ️"}
        {metadata?.banque && ` ${metadata.banque}`}
        {metadata?.compte && ` · ${metadata.compte}`}
        {metadata?.dateDebut && metadata?.dateFin && ` · ${metadata.dateDebut} → ${metadata.dateFin}`}
        {v && !v.coherent && ` · Écart ${formatAmount(v.ecart)}`}
      </div>
      <div className="balance-grid">
        {soldes.ouverture != null && (
          <div className="balance-item">
            <div className="balance-item-label">Ouverture</div>
            <div className="balance-item-value">{formatAmount(soldes.ouverture)}</div>
          </div>
        )}
        {soldes.totalDebits != null && (
          <div className="balance-item">
            <div className="balance-item-label">Débits</div>
            <div className="balance-item-value" style={{ color: "#f87171" }}>−{formatAmount(soldes.totalDebits)}</div>
          </div>
        )}
        {soldes.totalCredits != null && (
          <div className="balance-item">
            <div className="balance-item-label">Crédits</div>
            <div className="balance-item-value" style={{ color: "#10b981" }}>+{formatAmount(soldes.totalCredits)}</div>
          </div>
        )}
        {soldes.fermeture != null && (
          <div className="balance-item">
            <div className="balance-item-label">Fermeture</div>
            <div className="balance-item-value">{formatAmount(soldes.fermeture)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
