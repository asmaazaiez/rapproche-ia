import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Mono', monospace; background: #0a0e1a; color: #e2e8f4; min-height: 100vh; }
  .app { min-height: 100vh; background: #0a0e1a;
    background-image: radial-gradient(ellipse 80% 50% at 20% 0%,rgba(56,189,248,.06) 0%,transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%,rgba(99,102,241,.07) 0%,transparent 60%); }

  /* HEADER */
  .header { display:flex; align-items:center; justify-content:space-between; padding:18px 40px;
    border-bottom:1px solid rgba(255,255,255,.06); backdrop-filter:blur(10px);
    position:sticky; top:0; z-index:100; background:rgba(10,14,26,.9); }
  .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:20px; letter-spacing:-.5px; color:#fff; }
  .logo span { color:#38bdf8; }
  .badge { font-size:10px; background:rgba(56,189,248,.12); color:#38bdf8;
    border:1px solid rgba(56,189,248,.25); border-radius:20px; padding:4px 10px; letter-spacing:1px; text-transform:uppercase; }

  /* NAV */
  .nav-tabs { display:flex; gap:0; padding:0 40px; border-bottom:1px solid rgba(255,255,255,.06);
    background:rgba(10,14,26,.7); overflow-x:auto; }
  .nav-tab { padding:13px 18px; font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
    text-transform:uppercase; letter-spacing:1.5px; border:none; background:transparent; color:#475569;
    cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; margin-bottom:-1px; white-space:nowrap; }
  .nav-tab.active { color:#38bdf8; border-bottom-color:#38bdf8; }
  .nav-tab:hover:not(.active) { color:#94a3b8; }
  .nav-tab .hist-count { display:inline-block; background:rgba(56,189,248,.15); color:#38bdf8;
    border-radius:10px; padding:1px 7px; font-size:9px; margin-left:6px; }

  .main { padding:36px 40px; max-width:1400px; margin:0 auto; }
  .hero { margin-bottom:32px; }
  .hero h1 { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#fff; line-height:1.1; margin-bottom:5px; }
  .hero p { color:#64748b; font-size:13px; }

  /* UPLOAD */
  .upload-grid { display:grid; gap:18px; margin-bottom:20px; }
  .upload-card { border:1.5px dashed rgba(255,255,255,.1); border-radius:16px; padding:20px;
    background:rgba(255,255,255,.02); transition:all .25s; }
  .upload-card.drag-over { border-color:#38bdf8; background:rgba(56,189,248,.04); }
  .upload-card.has-data { border-color:rgba(52,211,153,.35); background:rgba(52,211,153,.025); }
  .upload-card.loading-pdf { border-color:rgba(251,191,36,.35); background:rgba(251,191,36,.025); }
  .upload-label { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase;
    letter-spacing:2px; color:#64748b; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
  .dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .ftype-tabs { display:flex; gap:4px; margin-bottom:12px; }
  .ftype-tab { padding:5px 12px; font-family:'DM Mono',monospace; font-size:11px; border-radius:6px;
    border:1px solid rgba(255,255,255,.07); cursor:pointer; transition:all .2s; background:transparent; color:#475569; }
  .ftype-tab.active { background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.2); color:#38bdf8; }
  .drop-area { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:80px; gap:8px; }
  .drop-icon { font-size:26px; opacity:.22; }
  .drop-text { font-size:12px; color:#475569; text-align:center; line-height:1.6; }
  .drop-btn { background:rgba(56,189,248,.1); color:#38bdf8; border:1px solid rgba(56,189,248,.2);
    border-radius:8px; padding:7px 16px; font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:all .2s; }
  .drop-btn:hover { background:rgba(56,189,248,.18); }
  .acct-input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:8px; padding:9px 13px; font-family:'DM Mono',monospace; font-size:13px; color:#e2e8f4;
    outline:none; margin-bottom:12px; transition:border-color .2s; }
  .acct-input:focus { border-color:rgba(56,189,248,.4); }
  .acct-input::placeholder { color:#334155; }
  .pdf-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(251,191,36,.08);
    border:1px solid rgba(251,191,36,.2); color:#fbbf24; border-radius:6px; padding:3px 9px; font-size:11px; margin-bottom:8px; }
  .pdf-proc { display:flex; align-items:center; gap:10px; color:#fbbf24; font-size:12px; padding:14px 0; }
  .spinner { width:15px; height:15px; border:2px solid rgba(251,191,36,.2); border-top-color:#fbbf24;
    border-radius:50%; animation:spin .8s linear infinite; flex-shrink:0; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .prev-tbl { width:100%; border-collapse:collapse; font-size:11px; }
  .prev-tbl th { text-align:left; color:#475569; padding:5px 7px; border-bottom:1px solid rgba(255,255,255,.06); font-weight:500; }
  .prev-tbl td { padding:4px 7px; border-bottom:1px solid rgba(255,255,255,.03); color:#94a3b8; }
  .prev-tbl td.neg { color:#f87171; }
  .more-rows { font-size:11px; color:#334155; text-align:center; padding:6px; }
  .data-ta { width:100%; min-height:100px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
    border-radius:8px; padding:11px; font-family:'DM Mono',monospace; font-size:11px; color:#94a3b8;
    outline:none; resize:vertical; line-height:1.6; transition:border-color .2s; }
  .data-ta:focus { border-color:rgba(56,189,248,.3); }
  .data-ta::placeholder { color:#1e293b; }

  /* BUTTONS */
  .analyze-sec { display:flex; flex-direction:column; align-items:center; gap:10px; margin:22px 0; }
  .analyze-btn { background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; border:none;
    border-radius:12px; padding:14px 36px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700;
    cursor:pointer; transition:all .25s; box-shadow:0 4px 24px rgba(56,189,248,.2); }
  .analyze-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(56,189,248,.3); }
  .analyze-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .loading-bar { height:2px; background:rgba(255,255,255,.05); border-radius:2px; overflow:hidden; width:260px; }
  .loading-fill { height:100%; background:linear-gradient(90deg,#38bdf8,#6366f1,#38bdf8);
    background-size:200% 100%; animation:shimmer 1.5s linear infinite; }
  @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
  .loading-msg { font-size:11px; color:#475569; }
  .add-btn { font-family:'DM Mono',monospace; font-size:11px; color:#38bdf8; background:transparent;
    border:1px dashed rgba(56,189,248,.2); border-radius:8px; padding:7px 14px; cursor:pointer; transition:all .2s; }
  .add-btn:hover { background:rgba(56,189,248,.06); }
  .reset-btn { background:transparent; border:1px solid rgba(255,255,255,.08); color:#475569;
    border-radius:8px; padding:9px 20px; font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:all .2s; }
  .reset-btn:hover { border-color:rgba(255,255,255,.15); color:#94a3b8; }

  /* RESULTS COMMON */
  .results { animation:fadeUp .4s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .sum-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .stat-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:16px 20px; }
  .stat-lbl { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#475569; margin-bottom:8px; }
  .stat-val { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; }
  .sv-green{color:#34d399} .sv-red{color:#f87171} .sv-blue{color:#38bdf8} .sv-purple{color:#a78bfa} .sv-yellow{color:#fbbf24}
  .ai-box { background:rgba(99,102,241,.05); border:1px solid rgba(99,102,241,.15); border-radius:16px;
    padding:20px 24px; margin-bottom:22px; position:relative; overflow:hidden; }
  .ai-box::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#6366f1,#38bdf8); }
  .ai-box-title { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase;
    letter-spacing:2px; color:#a78bfa; margin-bottom:12px; }
  .ai-content { font-size:13px; line-height:1.8; color:#cbd5e1; white-space:pre-wrap; }
  .sec-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase;
    letter-spacing:1.5px; color:#64748b; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
  .sec-title::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.05); }
  .tbl { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:22px; }
  .tbl th { text-align:left; padding:10px 13px; font-size:10px; text-transform:uppercase; letter-spacing:1.5px;
    color:#475569; border-bottom:1px solid rgba(255,255,255,.07); font-weight:500; }
  .tbl th.r { text-align:right; }
  .tbl td { padding:10px 13px; border-bottom:1px solid rgba(255,255,255,.04); color:#94a3b8; vertical-align:middle; }
  .tbl td.r { text-align:right; }
  .tbl tr:hover td { background:rgba(255,255,255,.02); }
  .tbl tr.total-row td { border-top:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.025); font-weight:600; }
  .pill { display:inline-block; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:600;
    text-transform:uppercase; letter-spacing:.8px; }
  .pill-ok { background:rgba(52,211,153,.1); color:#34d399; border:1px solid rgba(52,211,153,.2); }
  .pill-warn { background:rgba(251,191,36,.1); color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .pill-err { background:rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
  .pill-conf { background:rgba(52,211,153,.1); color:#34d399; border:1px solid rgba(52,211,153,.2); }
  .pill-uni { background:rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
  .pill-part { background:rgba(251,191,36,.1); color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .sub-tabs { display:flex; gap:4px; margin-bottom:16px; flex-wrap:wrap; }
  .sub-tab { padding:7px 15px; font-family:'DM Mono',monospace; font-size:11px; border-radius:8px;
    border:1px solid transparent; cursor:pointer; transition:all .2s; background:transparent; color:#475569; }
  .sub-tab.active { background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.2); color:#38bdf8; }
  .sub-tab:hover:not(.active) { color:#94a3b8; }
  .apos{color:#34d399} .aneg{color:#f87171}
  .empty { text-align:center; color:#334155; padding:50px 0; font-size:13px; }
  .empty-ok { text-align:center; color:#34d399; padding:50px 0; font-size:13px; }

  /* INTERCOMPTES */
  .ic-sum { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:22px; }
  .flow-arr { display:flex; align-items:center; gap:8px; font-size:12px; }
  .flt-bar { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
  .flt-lbl { font-size:11px; color:#475569; }
  .flt-btn { padding:5px 12px; font-family:'DM Mono',monospace; font-size:11px; border-radius:6px;
    border:1px solid rgba(255,255,255,.08); cursor:pointer; transition:all .2s; background:transparent; color:#64748b; }
  .flt-btn.active { background:rgba(99,102,241,.1); border-color:rgba(99,102,241,.25); color:#a78bfa; }
  .mx-wrap { margin-bottom:26px; overflow-x:auto; }
  .mx-tbl { border-collapse:collapse; font-size:12px; }
  .mx-tbl th { padding:10px 16px; font-size:10px; text-transform:uppercase; letter-spacing:1.2px;
    color:#475569; font-weight:500; text-align:center; }
  .mx-tbl th.rh { text-align:left; color:#64748b; }
  .mx-tbl td { padding:10px 16px; border:1px solid rgba(255,255,255,.05); text-align:center; font-size:12px; }
  .mx-tbl td.self { background:rgba(255,255,255,.02); color:#1e293b; }
  .mx-tbl td.hf { color:#e2e8f4; font-weight:500; background:rgba(99,102,241,.05); }

  /* QB CONCILIATION */
  .qb-layout { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .qb-card { border:1.5px solid rgba(255,255,255,.08); border-radius:16px; padding:22px; background:rgba(255,255,255,.02); }
  .qb-title { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase;
    letter-spacing:2px; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .qb-title.bank { color:#38bdf8; } .qb-title.qb { color:#a78bfa; }
  .mrow { display:grid; grid-template-columns:1fr 1fr 28px; gap:8px; align-items:center; margin-bottom:8px; }
  .mi { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:7px;
    padding:8px 12px; font-family:'DM Mono',monospace; font-size:12px; color:#e2e8f4; outline:none;
    width:100%; transition:border-color .2s; }
  .mi:focus { border-color:rgba(56,189,248,.35); }
  .mi::placeholder { color:#334155; }
  .rm-btn { background:none; border:none; color:#334155; cursor:pointer; font-size:16px;
    transition:color .2s; padding:0; line-height:1; }
  .rm-btn:hover { color:#f87171; }
  .qb-note { font-size:11px; color:#475569; margin-top:12px; line-height:1.6; padding:10px 12px;
    background:rgba(99,102,241,.04); border:1px solid rgba(99,102,241,.1); border-radius:8px; }
  .qb-sum { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .bar-chart { margin-bottom:28px; }
  .bar-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
  .bar-mo { font-size:11px; color:#64748b; width:55px; flex-shrink:0; text-align:right; }
  .bar-track { flex:1; height:26px; background:rgba(255,255,255,.03); border-radius:6px;
    position:relative; overflow:visible; display:flex; align-items:center; }
  .bar-fill { height:100%; border-radius:6px; transition:width .6s ease; }
  .bar-ecart { font-size:11px; width:90px; flex-shrink:0; text-align:right; font-family:'DM Mono',monospace; }
  .bar-leg { display:flex; gap:20px; margin-bottom:12px; }
  .leg-item { display:flex; align-items:center; gap:6px; font-size:11px; color:#64748b; }
  .leg-dot { width:10px; height:10px; border-radius:3px; }
  .mo-chip { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11px;
    background:rgba(56,189,248,.07); border:1px solid rgba(56,189,248,.15); color:#38bdf8; }
  .ez{color:#34d399;font-weight:600} .ep{color:#fbbf24;font-weight:600} .en{color:#f87171;font-weight:600}

  /* HISTORY */
  .hist-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .hist-filters { display:flex; gap:6px; flex-wrap:wrap; }
  .hist-flt { padding:6px 14px; font-family:'DM Mono',monospace; font-size:11px; border-radius:8px;
    border:1px solid rgba(255,255,255,.08); cursor:pointer; transition:all .2s; background:transparent; color:#64748b; }
  .hist-flt.active { background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.2); color:#38bdf8; }
  .hist-flt:hover:not(.active) { color:#94a3b8; }
  .hist-actions { display:flex; gap:8px; }
  .hist-act-btn { padding:7px 14px; font-family:'DM Mono',monospace; font-size:11px; border-radius:8px;
    border:1px solid rgba(255,255,255,.1); cursor:pointer; transition:all .2s; background:transparent; color:#64748b; }
  .hist-act-btn:hover { color:#e2e8f4; border-color:rgba(255,255,255,.2); }
  .hist-act-btn.danger:hover { color:#f87171; border-color:rgba(248,113,113,.3); }
  .hist-act-btn.export { color:#34d399; border-color:rgba(52,211,153,.25); }
  .hist-act-btn.export:hover { background:rgba(52,211,153,.06); }

  .hist-grid { display:flex; flex-direction:column; gap:10px; }
  .hist-card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:14px;
    padding:18px 20px; transition:all .2s; cursor:pointer; position:relative; }
  .hist-card:hover { border-color:rgba(56,189,248,.2); background:rgba(56,189,248,.03); }
  .hist-card.selected { border-color:#38bdf8; background:rgba(56,189,248,.05); }
  .hist-card.compare-a { border-color:#38bdf8; background:rgba(56,189,248,.05); }
  .hist-card.compare-b { border-color:#a78bfa; background:rgba(167,139,250,.05); }
  .hist-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
  .hist-card-meta { display:flex; align-items:center; gap:10px; margin-bottom:8px; flex-wrap:wrap; }
  .hist-type-pill { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700;
    text-transform:uppercase; letter-spacing:1px; }
  .ht-rapp { background:rgba(56,189,248,.1); color:#38bdf8; border:1px solid rgba(56,189,248,.2); }
  .ht-ic { background:rgba(167,139,250,.1); color:#a78bfa; border:1px solid rgba(167,139,250,.2); }
  .ht-qb { background:rgba(52,211,153,.1); color:#34d399; border:1px solid rgba(52,211,153,.2); }
  .hist-date { font-size:11px; color:#475569; }
  .hist-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#e2e8f4; margin-bottom:6px; }
  .hist-kpis { display:flex; gap:16px; flex-wrap:wrap; }
  .hist-kpi { font-size:11px; color:#64748b; }
  .hist-kpi span { color:#94a3b8; font-weight:500; }
  .hist-card-actions { display:flex; gap:6px; flex-shrink:0; }
  .hca-btn { padding:5px 10px; font-family:'DM Mono',monospace; font-size:10px; border-radius:6px;
    border:1px solid rgba(255,255,255,.08); cursor:pointer; background:transparent; color:#64748b; transition:all .2s; white-space:nowrap; }
  .hca-btn:hover { color:#e2e8f4; }
  .hca-btn.del:hover { color:#f87171; border-color:rgba(248,113,113,.3); }
  .hca-btn.cmp { color:#a78bfa; border-color:rgba(167,139,250,.2); }
  .hca-btn.cmp:hover { background:rgba(167,139,250,.08); }
  .hca-btn.view { color:#38bdf8; border-color:rgba(56,189,248,.2); }
  .hca-btn.view:hover { background:rgba(56,189,248,.08); }

  .compare-banner { background:rgba(167,139,250,.07); border:1px solid rgba(167,139,250,.2);
    border-radius:12px; padding:14px 18px; margin-bottom:20px; display:flex; align-items:center;
    justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .compare-banner-txt { font-size:13px; color:#cbd5e1; }
  .compare-banner-txt strong { color:#a78bfa; }
  .compare-do-btn { background:linear-gradient(135deg,#a78bfa,#6366f1); color:#fff; border:none;
    border-radius:8px; padding:8px 18px; font-family:'Syne',sans-serif; font-size:12px; font-weight:700;
    cursor:pointer; transition:all .2s; }
  .compare-do-btn:hover { transform:translateY(-1px); }

  .compare-panel { animation:fadeUp .4s ease; }
  .compare-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
  .cmp-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:20px; }
  .cmp-card.a { border-color:rgba(56,189,248,.2); }
  .cmp-card.b { border-color:rgba(167,139,250,.2); }
  .cmp-card-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; text-transform:uppercase;
    letter-spacing:1.5px; margin-bottom:14px; }
  .cmp-card.a .cmp-card-title { color:#38bdf8; }
  .cmp-card.b .cmp-card-title { color:#a78bfa; }
  .cmp-row { display:flex; justify-content:space-between; align-items:center; padding:7px 0;
    border-bottom:1px solid rgba(255,255,255,.04); font-size:12px; }
  .cmp-row:last-child { border-bottom:none; }
  .cmp-key { color:#64748b; }
  .cmp-val { color:#e2e8f4; font-weight:500; }

  .no-hist { display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:80px 0; gap:16px; color:#334155; }
  .no-hist-icon { font-size:48px; opacity:.3; }
  .no-hist-txt { font-size:13px; text-align:center; line-height:1.8; }

  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const HIST_KEY = "rapproche-history";

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (!lines.length) return [];
  const header = lines[0].split(/[,;\t]/);
  return lines.slice(1).map(line => {
    const cols = line.split(/[,;\t]/);
    const obj = {};
    header.forEach((h, i) => { obj[h.trim()] = (cols[i] || "").trim(); });
    return obj;
  });
}
const gAmt = row => { const k = Object.keys(row).find(k => /montant|amount|debit|credit|solde/i.test(k)); return k ? parseFloat(row[k].replace(",",".")) || 0 : 0; };
const gDate = row => { const k = Object.keys(row).find(k => /date|day|jour/i.test(k)); return k ? row[k] : ""; };
const gLabel = row => { const k = Object.keys(row).find(k => /libelle|label|description|ref|memo|narration/i.test(k)); return k ? row[k] : Object.values(row).slice(0,2).join(" - "); };
function fmt(n) { if (n === undefined || n === null || isNaN(n)) return "—"; return new Intl.NumberFormat("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }
function fileToBase64(file) { return new Promise((res,rej) => { const r = new FileReader(); r.onload = e => res(e.target.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); }); }
function nowStr() { return new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); }

const ACCT_COLORS = [
  {bg:"rgba(56,189,248,.08)",bd:"rgba(56,189,248,.25)",tx:"#38bdf8"},
  {bg:"rgba(52,211,153,.08)",bd:"rgba(52,211,153,.25)",tx:"#34d399"},
  {bg:"rgba(167,139,250,.08)",bd:"rgba(167,139,250,.25)",tx:"#a78bfa"},
  {bg:"rgba(251,191,36,.08)",bd:"rgba(251,191,36,.25)",tx:"#fbbf24"},
  {bg:"rgba(248,113,113,.08)",bd:"rgba(248,113,113,.25)",tx:"#f87171"},
];

// ⚡ Parse robustement un JSON renvoyé par Claude (tolère markdown, texte avant/après)
function safeParseJSON(text) {
  if (!text) throw new Error("Réponse vide de Claude");
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Pas de JSON trouvé dans la réponse");
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON brut reçu:", cleaned.slice(0, 500) + "...");
    throw new Error(`JSON mal formé: ${e.message}. La réponse de Claude a peut-être été tronquée — essaie avec moins de données.`);
  }
}

// ⚡ MODIFIÉ : appel Claude via notre proxy serverless (sécurisé)
async function callClaude(messages, maxTokens = 4000) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, max_tokens: maxTokens })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("API error:", err);
    throw new Error(`API error: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

async function extractPDFTransactions(b64, accountName) {
  const text = await callClaude([{role:"user",content:[
    {type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
    {type:"text",text:`Relevé bancaire pour "${accountName}". Extrais TOUTES les transactions. Retourne UNIQUEMENT ce JSON (sans markdown) :\n{"transactions":[{"date":"YYYY-MM-DD","label":"libellé","amount":0}]}\nDébits=négatif, crédits=positif.`}
  ]}]);
  const parsed = safeParseJSON(text);
  return (parsed.transactions||[]).map(t=>({date:t.date||"",libelle:t.label||"",montant:String(t.amount||0)}));
}
function defaultMonths() {
  const now = new Date(); const months = [];
  for (let i=5;i>=0;i--) { const d = new Date(now.getFullYear(),now.getMonth()-i,1); months.push({id:Date.now()+i,label:`${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`,bankSolde:"",qbSolde:""}); }
  return months;
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY STORAGE — ⚡ MODIFIÉ : utilise localStorage du navigateur
// ─────────────────────────────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
async function saveHistory(hist) {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(hist));
  } catch(e) { console.error("Storage error:", e); }
}

// Export helpers
function exportCSV(hist) {
  const rows = [["ID","Type","Titre","Date","Détail 1","Détail 2","Détail 3"]];
  hist.forEach(h => {
    if (h.type==="rapprochement") rows.push([h.id,h.type,h.title,h.date,`Taux: ${h.summary?.taux_rapprochement}%`,`Rapprochées: ${h.summary?.matched}`,`Écart: ${fmt(h.summary?.ecart)} €`]);
    else if (h.type==="intercomptes") rows.push([h.id,h.type,h.title,h.date,`Flux: ${h.summary?.total_flows}`,`Confirmés: ${h.summary?.confirmed}`,`Volume: ${fmt(h.summary?.total_volume)} €`]);
    else rows.push([h.id,h.type,h.title,h.date,`Mois: ${h.summary?.months}`,`Problématiques: ${h.summary?.problems}`,`Écart moy: ${fmt(h.summary?.avg_ecart)} €`]);
  });
  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "historique-rapprochement.csv"; a.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP (inchangé)
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [feature, setFeature] = useState("rapprochement");
  const [accounts, setAccounts] = useState([
    {id:1,name:"Compte A",rows:[],fileType:"pdf",pdfLoading:false,pdfName:""},
    {id:2,name:"Compte B",rows:[],fileType:"pdf",pdfLoading:false,pdfName:""},
  ]);
  const [subTab, setSubTab] = useState(0);
  const [icFilter, setIcFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [rapproResult, setRapproResult] = useState(null);
  const [icResult, setIcResult] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const fileRefs = useRef({});

  // QB
  const [qbAcctName, setQbAcctName] = useState("Compte principal");
  const [qbMonths, setQbMonths] = useState(defaultMonths());
  const [qbResult, setQbResult] = useState(null);

  // History
  const [history, setHistory] = useState([]);
  const [histFilter, setHistFilter] = useState("all");
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => { loadHistory().then(h => { setHistory(h); setHistLoading(false); }); }, []);

  const addToHistory = useCallback(async (entry) => {
    const newHist = [entry, ...history].slice(0, 50);
    setHistory(newHist);
    await saveHistory(newHist);
  }, [history]);

  const deleteEntry = async (id) => {
    const newHist = history.filter(h => h.id !== id);
    setHistory(newHist);
    await saveHistory(newHist);
    if (compareA?.id === id) setCompareA(null);
    if (compareB?.id === id) setCompareB(null);
  };

  const clearHistory = async () => {
    setHistory([]); setCompareA(null); setCompareB(null); setShowCompare(false);
    await saveHistory([]);
  };

  // Upload helpers
  const upd = (id, patch) => setAccounts(a => a.map(x => x.id===id ? {...x,...patch} : x));
  const handlePDF = async (id,file,name) => {
    upd(id,{pdfLoading:true,pdfName:file.name,rows:[]});
    try { const b64=await fileToBase64(file); const rows=await extractPDFTransactions(b64,name); upd(id,{pdfLoading:false,rows}); }
    catch { upd(id,{pdfLoading:false,pdfName:"",rows:[]}); }
  };
  const handleCSV = (id,file) => { const r=new FileReader(); r.onload=e=>upd(id,{rows:parseCSV(e.target.result),pdfName:file.name}); r.readAsText(file); };
  const handleFile = (id,file,name,ft) => { if(file.name.toLowerCase().endsWith(".pdf")||ft==="pdf") handlePDF(id,file,name); else handleCSV(id,file); };
  const canAnalyze = accounts.every(a=>a.rows.length>0) && !accounts.some(a=>a.pdfLoading);

  // QB helpers
  const updMonth = (id,patch) => setQbMonths(m=>m.map(x=>x.id===id?{...x,...patch}:x));
  const canQb = qbMonths.length>0 && qbMonths.every(m=>m.label&&m.bankSolde!==""&&m.qbSolde!=="");

  const analyzeRapprochement = async () => {
    setLoading(true); setRapproResult(null); setLoadingMsg("Rapprochement en cours…");
    try {
      const sections = accounts.map(a=>`=== ${a.name} ===\n${a.rows.map((r,i)=>`  ${i+1}. ${r.date||gDate(r)} | ${r.libelle||gLabel(r)} | ${fmt(parseFloat(r.montant||0)||gAmt(r))} €`).join("\n")}`).join("\n\n");
      const prompt = `Tu es expert en rapprochement bancaire. ${accounts.length} comptes.\n\n${sections}\n\nRetourne UNIQUEMENT ce JSON (sans markdown) :\n{"summary":{"totalA":0,"totalB":0,"matched":0,"unmatched":0,"ecart":0,"taux_rapprochement":0},"pairs":[{"dateA":"","labelA":"","amountA":0,"dateB":"","labelB":"","amountB":0,"delta":0,"status":"matched"}],"unmatched":[{"account":"","date":"","label":"","amount":0,"reason":""}],"analysis":"Analyse 3-5 phrases en français."}`;
      const text = await callClaude([{role:"user",content:prompt}]);
      const r = safeParseJSON(text);
      setRapproResult(r);
      await addToHistory({id:Date.now(),type:"rapprochement",title:`${accounts.map(a=>a.name).join(" vs ")}`,date:nowStr(),result:r,summary:{taux_rapprochement:r.summary?.taux_rapprochement,matched:r.summary?.matched,unmatched:r.summary?.unmatched,ecart:r.summary?.ecart},accounts:accounts.map(a=>a.name)});
    } catch(e){console.error(e); alert("Erreur d'analyse: "+e.message);}
    setLoading(false); setLoadingMsg("");
  };

  const analyzeIntercomptes = async () => {
    setLoading(true); setIcResult(null); setLoadingMsg("Détection des flux intercomptes…");
    try {
      const names = accounts.map(a=>a.name);
      const sections = accounts.map(a=>`=== ${a.name} ===\n${a.rows.map((r,i)=>`  ${i+1}. ${r.date||gDate(r)} | ${r.libelle||gLabel(r)} | ${fmt(parseFloat(r.montant||0)||gAmt(r))} €`).join("\n")}`).join("\n\n");
      const mxInit = JSON.stringify(names.reduce((acc,a)=>{names.forEach(b=>{if(!acc[a])acc[a]={};acc[a][b]=0});return acc},{}));
      const prompt = `Expert flux bancaires intercomptes. Comptes: ${names.join(", ")}.\n\n${sections}\n\nRetourne UNIQUEMENT ce JSON:\n{"summary":{"total_flows":0,"confirmed":0,"unilateral":0,"partial":0,"total_volume":0},"flows":[{"date":"","label":"","amount":0,"source":"","destination":"","status":"confirmed","source_label":"","dest_label":"","ecart":0,"note":""}],"matrix":${mxInit},"analysis":"Analyse en français."}`;
      const text = await callClaude([{role:"user",content:prompt}],4000);
      const r = safeParseJSON(text);
      setIcResult(r);
      await addToHistory({id:Date.now(),type:"intercomptes",title:`Flux: ${names.join(", ")}`,date:nowStr(),result:r,summary:{total_flows:r.summary?.total_flows,confirmed:r.summary?.confirmed,total_volume:r.summary?.total_volume},accounts:names});
    } catch(e){console.error(e); alert("Erreur d'analyse: "+e.message);}
    setLoading(false); setLoadingMsg("");
  };

  const analyzeQB = async () => {
    setLoading(true); setQbResult(null); setLoadingMsg("Conciliation QuickBooks…");
    try {
      const rows = qbMonths.map(m=>({month:m.label,bank:parseFloat(m.bankSolde.replace(",","."))||0,qb:parseFloat(m.qbSolde.replace(",","."))||0}));
      const dataStr = rows.map(r=>`  - ${r.month}: Bancaire=${fmt(r.bank)}€, QB=${fmt(r.qb)}€, Écart=${fmt(r.bank-r.qb)}€`).join("\n");
      const prompt = `Expert-comptable conciliation QB. Compte "${qbAcctName}".\n\n${dataStr}\n\nRetourne UNIQUEMENT ce JSON:\n{"months":[{"month":"","bank":0,"qb":0,"ecart":0,"ecart_pct":0,"status":"ok","causes_possibles":"","actions":""}],"global":{"ecart_total":0,"ecart_moyen":0,"mois_problematiques":0,"tendance":"stable"},"analysis":"Analyse 4-6 phrases en français avec recommandations QB concrètes."}`;
      const text = await callClaude([{role:"user",content:prompt}],4000);
      const r = safeParseJSON(text);
      setQbResult(r);
      await addToHistory({id:Date.now(),type:"conciliation",title:`QB: ${qbAcctName}`,date:nowStr(),result:r,summary:{months:rows.length,problems:r.global?.mois_problematiques,avg_ecart:r.global?.ecart_moyen,tendance:r.global?.tendance},qbData:{accountName:qbAcctName,months:qbMonths}});
    } catch(e){console.error(e); alert("Erreur d'analyse: "+e.message);}
    setLoading(false); setLoadingMsg("");
  };

  const renderUpload = () => {
    const cols = Math.min(accounts.length,3);
    return (
      <>
        <div className="upload-grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>
          {accounts.map((acc,idx) => (
            <div key={acc.id} className={`upload-card ${dragOver===acc.id?"drag-over":""} ${acc.rows.length>0?"has-data":""} ${acc.pdfLoading?"loading-pdf":""}`}
              onDragOver={e=>{e.preventDefault();setDragOver(acc.id);}} onDragLeave={()=>setDragOver(null)}
              onDrop={e=>{e.preventDefault();setDragOver(null);const f=e.dataTransfer.files[0];if(f)handleFile(acc.id,f,acc.name,acc.fileType);}}>
              <div className="upload-label">
                <span className="dot" style={{background:acc.rows.length>0?"#34d399":acc.pdfLoading?"#fbbf24":"#38bdf8"}}/>
                Compte {idx+1}
                {accounts.length>2&&<button onClick={()=>setAccounts(a=>a.filter(x=>x.id!==acc.id))} style={{marginLeft:"auto",background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:14}}>×</button>}
              </div>
              <input className="acct-input" value={acc.name} placeholder="Nom du compte..." onChange={e=>upd(acc.id,{name:e.target.value})}/>
              {acc.rows.length===0&&!acc.pdfLoading&&<div className="ftype-tabs"><button className={`ftype-tab ${acc.fileType==="pdf"?"active":""}`} onClick={()=>upd(acc.id,{fileType:"pdf"})}>📄 PDF</button><button className={`ftype-tab ${acc.fileType==="csv"?"active":""}`} onClick={()=>upd(acc.id,{fileType:"csv"})}>📊 CSV</button></div>}
              {acc.pdfLoading&&<div className="pdf-proc"><div className="spinner"/><span>Claude lit <em style={{color:"#64748b"}}>{acc.pdfName}</em>…</span></div>}
              {acc.rows.length===0&&!acc.pdfLoading&&acc.fileType==="pdf"&&(<div className="drop-area"><div className="drop-icon">📄</div><div className="drop-text">Glissez votre PDF<br/><span style={{color:"#334155"}}>Claude extrait les transactions</span></div><input ref={el=>fileRefs.current[`${acc.id}-pdf`]=el} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handlePDF(acc.id,e.target.files[0],acc.name)}/><button className="drop-btn" onClick={()=>fileRefs.current[`${acc.id}-pdf`]?.click()}>Choisir un PDF</button></div>)}
              {acc.rows.length===0&&!acc.pdfLoading&&acc.fileType==="csv"&&(<><div className="drop-area"><div className="drop-icon">📂</div><div className="drop-text">Glissez un CSV / TXT</div><input ref={el=>fileRefs.current[`${acc.id}-csv`]=el} type="file" accept=".csv,.txt,.tsv" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleCSV(acc.id,e.target.files[0])}/><button className="drop-btn" onClick={()=>fileRefs.current[`${acc.id}-csv`]?.click()}>Choisir un fichier</button></div><div style={{marginTop:10}}><textarea className="data-ta" placeholder="date,libelle,montant" onChange={e=>upd(acc.id,{rows:parseCSV(e.target.value)})}/></div></>)}
              {acc.rows.length>0&&!acc.pdfLoading&&(<>{acc.pdfName&&<div className="pdf-badge">📄 {acc.pdfName}</div>}<div style={{color:"#34d399",fontSize:12,marginBottom:10}}>✓ {acc.rows.length} transactions</div><table className="prev-tbl"><thead><tr><th>Date</th><th>Libellé</th><th>Montant</th></tr></thead><tbody>{acc.rows.slice(0,4).map((r,i)=>{const amt=parseFloat(r.montant||0)||gAmt(r);return<tr key={i}><td>{r.date||gDate(r)||"—"}</td><td>{(r.libelle||gLabel(r)).slice(0,22)}</td><td className={amt<0?"neg":""}>{fmt(amt)}</td></tr>})}</tbody></table>{acc.rows.length>4&&<div className="more-rows">+{acc.rows.length-4} lignes</div>}<button style={{marginTop:8,fontSize:11,color:"#475569",background:"none",border:"none",cursor:"pointer"}} onClick={()=>upd(acc.id,{rows:[],pdfName:""})}>↺ Réinitialiser</button></>)}
            </div>
          ))}
        </div>
        <div style={{marginBottom:18}}><button className="add-btn" onClick={()=>{const id=Date.now();setAccounts(a=>[...a,{id,name:`Compte ${a.length+1}`,rows:[],fileType:"pdf",pdfLoading:false,pdfName:""}]);}}>+ Ajouter un compte</button></div>
      </>
    );
  };

  const renderRapproResult = (r, isHistory=false) => (
    <div className="results">
      <div className="sum-strip">
        <div className="stat-card"><div className="stat-lbl">Taux rapprochement</div><div className="stat-val sv-blue">{r.summary?.taux_rapprochement??0}%</div></div>
        <div className="stat-card"><div className="stat-lbl">Rapprochées</div><div className="stat-val sv-green">{r.summary?.matched??0}</div></div>
        <div className="stat-card"><div className="stat-lbl">Non rapprochées</div><div className="stat-val sv-red">{r.summary?.unmatched??0}</div></div>
        <div className="stat-card"><div className="stat-lbl">Écart global</div><div className={`stat-val ${Math.abs(r.summary?.ecart??0)<.01?"sv-green":"sv-red"}`}>{fmt(r.summary?.ecart??0)} €</div></div>
      </div>
      {r.analysis&&<div className="ai-box"><div className="ai-box-title">✦ Analyse IA</div><div className="ai-content">{r.analysis}</div></div>}
      <div className="sub-tabs">
        <button className={`sub-tab ${subTab===0?"active":""}`} onClick={()=>setSubTab(0)}>Rapprochées ({r.pairs?.length??0})</button>
        <button className={`sub-tab ${subTab===1?"active":""}`} onClick={()=>setSubTab(1)}>Non rapprochées ({r.unmatched?.length??0})</button>
      </div>
      {subTab===0&&(r.pairs?.length>0?(<><div className="sec-title">Paires identifiées</div><table className="tbl"><thead><tr><th>Date A</th><th>Libellé A</th><th>Montant A</th><th>Date B</th><th>Libellé B</th><th>Montant B</th><th>Écart</th><th>Statut</th></tr></thead><tbody>{r.pairs.map((p,i)=><tr key={i}><td>{p.dateA||"—"}</td><td>{p.labelA}</td><td className={p.amountA>=0?"apos":"aneg"}>{fmt(p.amountA)} €</td><td>{p.dateB||"—"}</td><td>{p.labelB}</td><td className={p.amountB>=0?"apos":"aneg"}>{fmt(p.amountB)} €</td><td style={{color:Math.abs(p.delta)<.01?"#34d399":"#fbbf24"}}>{fmt(p.delta)} €</td><td><span className={`pill ${p.status==="matched"?"pill-ok":"pill-warn"}`}>{p.status==="matched"?"✓ Rapproché":"≈ Partiel"}</span></td></tr>)}</tbody></table></>):<div className="empty">Aucune paire rapprochée.</div>)}
      {subTab===1&&(r.unmatched?.length>0?(<><div className="sec-title">Non rapprochées</div><table className="tbl"><thead><tr><th>Compte</th><th>Date</th><th>Libellé</th><th>Montant</th><th>Motif</th></tr></thead><tbody>{r.unmatched.map((u,i)=><tr key={i}><td style={{color:"#a78bfa"}}>{u.account}</td><td>{u.date||"—"}</td><td>{u.label}</td><td className={u.amount>=0?"apos":"aneg"}>{fmt(u.amount)} €</td><td style={{color:"#64748b",fontStyle:"italic"}}>{u.reason}</td></tr>)}</tbody></table></>):<div className="empty-ok">✓ Tout est rapproché !</div>)}
      {!isHistory&&<div className="analyze-sec"><button className="reset-btn" onClick={()=>{setRapproResult(null);setSubTab(0);}}>↺ Nouvelle analyse</button></div>}
    </div>
  );

  const renderIcResult = (r, isHistory=false) => {
    const accountNames = accounts.map(a=>a.name);
    const flows = r?.flows||[];
    const filtered = icFilter==="all"?flows:flows.filter(f=>f.status===icFilter);
    const getC = name => { const idx=accounts.findIndex(a=>a.name===name); return ACCT_COLORS[Math.max(idx,0)%ACCT_COLORS.length]; };
    return (
      <div className="results">
        <div className="ic-sum">
          <div className="stat-card"><div className="stat-lbl">Flux détectés</div><div className="stat-val sv-purple">{r.summary?.total_flows??0}</div></div>
          <div className="stat-card"><div className="stat-lbl">Confirmés</div><div className="stat-val sv-green">{r.summary?.confirmed??0}</div></div>
          <div className="stat-card"><div className="stat-lbl">Volume total</div><div className="stat-val sv-blue">{fmt(r.summary?.total_volume??0)} €</div></div>
        </div>
        {r.analysis&&<div className="ai-box"><div className="ai-box-title">✦ Analyse des flux</div><div className="ai-content">{r.analysis}</div></div>}
        {r.matrix&&accountNames.length>=2&&(<><div className="sec-title">Matrice des flux</div><div style={{fontSize:10,color:"#475569",textAlign:"center",marginBottom:8}}>Volume transféré (€) — ligne=source, colonne=destinataire</div><div className="mx-wrap"><table className="mx-tbl"><thead><tr><th className="rh">Source↓/Dest→</th>{accountNames.map(n=><th key={n}>{n}</th>)}</tr></thead><tbody>{accountNames.map(src=><tr key={src}><th className="rh" style={{textAlign:"left",color:"#94a3b8"}}>{src}</th>{accountNames.map(dst=>{const v=r.matrix?.[src]?.[dst]??0;return<td key={dst} className={src===dst?"self":v>0?"hf":""}>{src===dst?"—":v>0?`${fmt(v)} €`:"—"}</td>})}</tr>)}</tbody></table></div></>)}
        <div className="sec-title">Détail des flux</div>
        <div className="flt-bar"><span className="flt-lbl">Filtrer :</span>{[["all","Tous"],["confirmed","Confirmés"],["unilateral","Unilatéraux"],["partial","Partiels"]].map(([v,l])=><button key={v} className={`flt-btn ${icFilter===v?"active":""}`} onClick={()=>setIcFilter(v)}>{l} ({v==="all"?flows.length:flows.filter(f=>f.status===v).length})</button>)}</div>
        {filtered.length>0?<table className="tbl"><thead><tr><th>Date</th><th>Flux</th><th>Libellé source</th><th>Libellé destinataire</th><th>Montant</th><th>Écart</th><th>Statut</th></tr></thead><tbody>{filtered.map((f,i)=>{const sc=getC(f.source);const dc=getC(f.destination);return<tr key={i}><td>{f.date||"—"}</td><td><div className="flow-arr"><span style={{background:sc.bg,border:`1px solid ${sc.bd}`,color:sc.tx,borderRadius:6,padding:"3px 9px",fontSize:11,whiteSpace:"nowrap"}}>{f.source}</span><span style={{color:"#475569"}}>→</span><span style={{background:dc.bg,border:`1px solid ${dc.bd}`,color:dc.tx,borderRadius:6,padding:"3px 9px",fontSize:11,whiteSpace:"nowrap"}}>{f.destination}</span></div></td><td style={{color:"#cbd5e1",maxWidth:150}}>{f.source_label||f.label}</td><td style={{color:"#94a3b8",maxWidth:150,fontStyle:f.dest_label?"normal":"italic"}}>{f.dest_label||"Non trouvé"}</td><td className="aneg" style={{fontWeight:600}}>{fmt(Math.abs(f.amount))} €</td><td style={{color:Math.abs(f.ecart||0)<.01?"#34d399":"#fbbf24"}}>{fmt(f.ecart||0)} €</td><td><span className={`pill ${f.status==="confirmed"?"pill-conf":f.status==="unilateral"?"pill-uni":"pill-part"}`}>{f.status==="confirmed"?"✓ Confirmé":f.status==="unilateral"?"⚠ Unilatéral":"≈ Partiel"}</span></td></tr>})}</tbody></table>:<div className="empty">Aucun flux avec ce filtre.</div>}
        {!isHistory&&<div className="analyze-sec"><button className="reset-btn" onClick={()=>setIcResult(null)}>↺ Nouvelle analyse</button></div>}
      </div>
    );
  };

  const renderQBInput = () => (
    <>
      <div style={{marginBottom:20}}><div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontFamily:"Syne,sans-serif",fontWeight:700}}>Nom du compte</div><input className="acct-input" style={{maxWidth:360}} value={qbAcctName} onChange={e=>setQbAcctName(e.target.value)} placeholder="Ex: BNP - Compte courant"/></div>
      <div className="qb-layout">
        <div className="qb-card">
          <div className="qb-title bank">🏦 Soldes bancaires</div>
          {qbMonths.map(m=><div key={m.id} className="mrow"><input className="mi" value={m.label} onChange={e=>updMonth(m.id,{label:e.target.value})} placeholder="Mois (ex: Janvier 2025)"/><input className="mi" value={m.bankSolde} onChange={e=>updMonth(m.id,{bankSolde:e.target.value})} placeholder="Solde bancaire (€)" type="number" step="0.01"/><button className="rm-btn" onClick={()=>setQbMonths(m2=>m2.filter(x=>x.id!==m.id))}>×</button></div>)}
          <button className="add-btn" style={{marginTop:4}} onClick={()=>setQbMonths(m=>[...m,{id:Date.now(),label:"",bankSolde:"",qbSolde:""}])}>+ Ajouter un mois</button>
        </div>
        <div className="qb-card">
          <div className="qb-title qb">📒 Soldes QuickBooks</div>
          {qbMonths.map(m=><div key={m.id} className="mrow"><div style={{fontSize:12,color:"#94a3b8",padding:"8px 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label||"—"}</div><input className="mi" value={m.qbSolde} onChange={e=>updMonth(m.id,{qbSolde:e.target.value})} placeholder="Solde QuickBooks (€)" type="number" step="0.01"/><div/></div>)}
          <div className="qb-note">💡 Dans QB : <strong>Comptabilité → Plan comptable → Voir le registre</strong>, filtrez par mois.</div>
        </div>
      </div>
      <div className="analyze-sec">
        <button className="analyze-btn" onClick={analyzeQB} disabled={!canQb||loading}>{loading?"Analyse en cours…":"📊 Analyser la conciliation QB"}</button>
        {loading&&<><div className="loading-bar"><div className="loading-fill"/></div><div className="loading-msg">{loadingMsg}</div></>}
        {!canQb&&!loading&&<div className="loading-msg" style={{color:"#334155"}}>Renseignez tous les mois (nom + soldes)</div>}
      </div>
    </>
  );

  const renderQBResult = (r, isHistory=false) => {
    const months = r.months||[];
    const g = r.global||{};
    const maxAbs = Math.max(...months.map(m=>Math.max(Math.abs(m.bank),Math.abs(m.qb))),1);
    return (
      <div className="results">
        <div className="qb-sum">
          <div className="stat-card"><div className="stat-lbl">Mois analysés</div><div className="stat-val sv-blue">{months.length}</div></div>
          <div className="stat-card"><div className="stat-lbl">Problématiques</div><div className="stat-val sv-red">{g.mois_problematiques??0}</div></div>
          <div className="stat-card"><div className="stat-lbl">Écart moyen / mois</div><div className={`stat-val ${Math.abs(g.ecart_moyen||0)<1?"sv-green":"sv-yellow"}`}>{fmt(g.ecart_moyen??0)} €</div></div>
          <div className="stat-card"><div className="stat-lbl">Tendance</div><div className={`stat-val ${g.tendance==="stable"?"sv-green":g.tendance==="croissant"?"sv-red":"sv-yellow"}`} style={{fontSize:15,paddingTop:4}}>{g.tendance==="stable"?"↔ Stable":g.tendance==="croissant"?"↑ Croissant":"↓ Décroissant"}</div></div>
        </div>
        {r.analysis&&<div className="ai-box"><div className="ai-box-title">✦ Analyse IA — Conciliation QB</div><div className="ai-content">{r.analysis}</div></div>}
        <div className="sec-title">Soldes par mois</div>
        <div className="bar-leg"><div className="leg-item"><div className="leg-dot" style={{background:"rgba(56,189,248,.5)"}}/>Solde bancaire</div><div className="leg-item"><div className="leg-dot" style={{background:"rgba(167,139,250,.5)"}}/>Solde QuickBooks</div></div>
        <div className="bar-chart">{months.map((m,i)=>{const bW=Math.abs(m.bank)/maxAbs*100;const qW=Math.abs(m.qb)/maxAbs*100;const ec=m.bank-m.qb;return<div className="bar-row" key={i}><div className="bar-mo">{m.month.slice(0,7)}</div><div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}><div className="bar-track"><div className="bar-fill" style={{width:`${bW}%`,minWidth:2,background:"rgba(56,189,248,.3)"}}/><span style={{position:"absolute",left:`${Math.min(bW,70)}%`,paddingLeft:6,fontSize:10,color:"#38bdf8",whiteSpace:"nowrap"}}>{fmt(m.bank)} €</span></div><div className="bar-track"><div className="bar-fill" style={{width:`${qW}%`,minWidth:2,background:"rgba(167,139,250,.3)"}}/><span style={{position:"absolute",left:`${Math.min(qW,70)}%`,paddingLeft:6,fontSize:10,color:"#a78bfa",whiteSpace:"nowrap"}}>{fmt(m.qb)} €</span></div></div><div className={`bar-ecart ${Math.abs(ec)<.01?"ez":ec>0?"ep":"en"}`}>{ec>0?"+":""}{fmt(ec)} €</div></div>})}</div>
        <div className="sec-title">Détail mois par mois</div>
        <table className="tbl">
          <thead><tr><th>Mois</th><th className="r">Solde bancaire</th><th className="r">Solde QB</th><th className="r">Écart</th><th className="r">Écart %</th><th>Statut</th><th>Causes possibles</th><th>Action QB</th></tr></thead>
          <tbody>
            {months.map((m,i)=>{const ec=m.bank-m.qb;const cls=Math.abs(ec)<.01?"ez":ec>0?"ep":"en";return<tr key={i}><td><span className="mo-chip">{m.month}</span></td><td className="r" style={{color:"#38bdf8",fontWeight:500}}>{fmt(m.bank)} €</td><td className="r" style={{color:"#a78bfa",fontWeight:500}}>{fmt(m.qb)} €</td><td className={`r ${cls}`}>{ec>0?"+":""}{fmt(ec)} €</td><td className="r" style={{color:"#64748b",fontSize:11}}>{m.ecart_pct!=null?`${m.ecart_pct>0?"+":""}${m.ecart_pct.toFixed(2)}%`:"—"}</td><td><span className={`pill ${m.status==="ok"?"pill-ok":m.status==="warning"?"pill-warn":"pill-err"}`}>{m.status==="ok"?"✓ OK":m.status==="warning"?"⚠ Attention":"✗ Erreur"}</span></td><td style={{color:"#94a3b8",fontSize:12,maxWidth:180}}>{m.causes_possibles||"—"}</td><td style={{color:"#64748b",fontSize:11,fontStyle:"italic",maxWidth:180}}>{m.actions||"—"}</td></tr>})}
            <tr className="total-row"><td style={{color:"#e2e8f4"}}>Total</td><td className="r" style={{color:"#38bdf8"}}>{fmt(months.reduce((s,m)=>s+m.bank,0))} €</td><td className="r" style={{color:"#a78bfa"}}>{fmt(months.reduce((s,m)=>s+m.qb,0))} €</td><td className={`r ${Math.abs(g.ecart_total||0)<.01?"ez":g.ecart_total>0?"ep":"en"}`}>{(g.ecart_total||0)>0?"+":""}{fmt(g.ecart_total||0)} €</td><td colSpan={4}/></tr>
          </tbody>
        </table>
        {!isHistory&&<div className="analyze-sec"><button className="reset-btn" onClick={()=>setQbResult(null)}>↺ Modifier les données</button></div>}
      </div>
    );
  };

  const filteredHist = histFilter==="all" ? history : history.filter(h=>h.type===histFilter);

  const renderComparePanel = () => {
    if (!compareA||!compareB) return null;
    const sameType = compareA.type===compareB.type;
    return (
      <div className="compare-panel">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <button className="reset-btn" onClick={()=>{setShowCompare(false);setCompareA(null);setCompareB(null);}}>← Retour à l'historique</button>
          <div style={{fontSize:13,color:"#64748b"}}>Comparaison de deux analyses</div>
        </div>
        <div className="compare-grid">
          {[{entry:compareA,cls:"a",col:"#38bdf8"},{entry:compareB,cls:"b",col:"#a78bfa"}].map(({entry,cls,col})=>(
            <div key={entry.id} className={`cmp-card ${cls}`}>
              <div className="cmp-card-title" style={{color:col}}>{entry.title}</div>
              <div className="cmp-row"><span className="cmp-key">Type</span><span className="cmp-val">{entry.type}</span></div>
              <div className="cmp-row"><span className="cmp-key">Date</span><span className="cmp-val">{entry.date}</span></div>
              {entry.type==="rapprochement"&&<>
                <div className="cmp-row"><span className="cmp-key">Taux rapprochement</span><span className="cmp-val" style={{color:col}}>{entry.summary?.taux_rapprochement}%</span></div>
                <div className="cmp-row"><span className="cmp-key">Rapprochées</span><span className="cmp-val">{entry.summary?.matched}</span></div>
                <div className="cmp-row"><span className="cmp-key">Non rapprochées</span><span className="cmp-val">{entry.summary?.unmatched}</span></div>
                <div className="cmp-row"><span className="cmp-key">Écart global</span><span className="cmp-val" style={{color:Math.abs(entry.summary?.ecart||0)<.01?"#34d399":"#f87171"}}>{fmt(entry.summary?.ecart||0)} €</span></div>
              </>}
              {entry.type==="intercomptes"&&<>
                <div className="cmp-row"><span className="cmp-key">Flux détectés</span><span className="cmp-val" style={{color:col}}>{entry.summary?.total_flows}</span></div>
                <div className="cmp-row"><span className="cmp-key">Confirmés</span><span className="cmp-val">{entry.summary?.confirmed}</span></div>
                <div className="cmp-row"><span className="cmp-key">Volume total</span><span className="cmp-val">{fmt(entry.summary?.total_volume||0)} €</span></div>
              </>}
              {entry.type==="conciliation"&&<>
                <div className="cmp-row"><span className="cmp-key">Mois analysés</span><span className="cmp-val" style={{color:col}}>{entry.summary?.months}</span></div>
                <div className="cmp-row"><span className="cmp-key">Mois problématiques</span><span className="cmp-val" style={{color:"#f87171"}}>{entry.summary?.problems}</span></div>
                <div className="cmp-row"><span className="cmp-key">Écart moyen</span><span className="cmp-val">{fmt(entry.summary?.avg_ecart||0)} €</span></div>
                <div className="cmp-row"><span className="cmp-key">Tendance</span><span className="cmp-val">{entry.summary?.tendance}</span></div>
              </>}
            </div>
          ))}
        </div>
        {sameType&&compareA.type==="rapprochement"&&(
          <><div className="sec-title">Évolution entre les deux analyses</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[["Taux rapprochement",`${compareA.summary?.taux_rapprochement}%`,`${compareB.summary?.taux_rapprochement}%`,compareB.summary?.taux_rapprochement>=compareA.summary?.taux_rapprochement],["Non rapprochées",compareA.summary?.unmatched,compareB.summary?.unmatched,compareB.summary?.unmatched<=compareA.summary?.unmatched],["Écart global",`${fmt(compareA.summary?.ecart||0)} €`,`${fmt(compareB.summary?.ecart||0)} €`,Math.abs(compareB.summary?.ecart||0)<=Math.abs(compareA.summary?.ecart||0)]].map(([k,va,vb,good])=>(
              <div className="stat-card" key={k}>
                <div className="stat-lbl">{k}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
                  <span style={{color:"#38bdf8",fontSize:16,fontWeight:700,fontFamily:"Syne,sans-serif"}}>{va}</span>
                  <span style={{color:"#475569"}}>→</span>
                  <span style={{color:good?"#34d399":"#f87171",fontSize:16,fontWeight:700,fontFamily:"Syne,sans-serif"}}>{vb}</span>
                  <span style={{fontSize:14}}>{good?"📈":"📉"}</span>
                </div>
              </div>
            ))}
          </div></>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    if (histLoading) return <div className="empty"><div className="spinner" style={{width:20,height:20,border:"2px solid rgba(56,189,248,.2)",borderTopColor:"#38bdf8",margin:"0 auto 12px"}}/><span>Chargement…</span></div>;
    if (showCompare&&compareA&&compareB) return renderComparePanel();

    return (
      <div className="results">
        <div className="hist-toolbar">
          <div className="hist-filters">
            {[["all","Toutes"],["rapprochement","Rapprochement"],["intercomptes","Intercomptes"],["conciliation","QuickBooks"]].map(([v,l])=>(
              <button key={v} className={`hist-flt ${histFilter===v?"active":""}`} onClick={()=>setHistFilter(v)}>
                {l} {v==="all"?`(${history.length})`:`(${history.filter(h=>h.type===v).length})`}
              </button>
            ))}
          </div>
          <div className="hist-actions">
            {compareA&&compareB&&<button className="hist-act-btn" style={{color:"#a78bfa",borderColor:"rgba(167,139,250,.25)"}} onClick={()=>setShowCompare(true)}>🔍 Comparer</button>}
            {history.length>0&&<button className="hist-act-btn export" onClick={()=>exportCSV(history)}>⬇ Exporter CSV</button>}
            {history.length>0&&<button className="hist-act-btn danger" onClick={clearHistory}>🗑 Tout effacer</button>}
          </div>
        </div>

        {(compareA||compareB)&&!(compareA&&compareB)&&(
          <div className="compare-banner">
            <div className="compare-banner-txt">
              {compareA?<><strong>A sélectionné :</strong> {compareA.title} — Sélectionnez une 2e entrée (B) à comparer.</>:<><strong>B sélectionné :</strong> {compareB.title} — Sélectionnez une entrée A.</>}
            </div>
            <button className="reset-btn" onClick={()=>{setCompareA(null);setCompareB(null);}}>Annuler</button>
          </div>
        )}
        {compareA&&compareB&&!showCompare&&(
          <div className="compare-banner">
            <div className="compare-banner-txt"><strong>A:</strong> {compareA.title} &nbsp;|&nbsp; <strong>B:</strong> {compareB.title}</div>
            <div style={{display:"flex",gap:8}}><button className="compare-do-btn" onClick={()=>setShowCompare(true)}>Voir la comparaison</button><button className="reset-btn" onClick={()=>{setCompareA(null);setCompareB(null);}}>Annuler</button></div>
          </div>
        )}

        {viewEntry&&(
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button className="reset-btn" onClick={()=>setViewEntry(null)}>← Retour</button>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"#e2e8f4",fontSize:15}}>{viewEntry.title}</div>
              <div style={{fontSize:11,color:"#475569"}}>{viewEntry.date}</div>
            </div>
            {viewEntry.type==="rapprochement"&&renderRapproResult(viewEntry.result,true)}
            {viewEntry.type==="intercomptes"&&renderIcResult(viewEntry.result,true)}
            {viewEntry.type==="conciliation"&&renderQBResult(viewEntry.result,true)}
          </div>
        )}

        {!viewEntry&&(filteredHist.length>0 ? (
          <div className="hist-grid">
            {filteredHist.map(h=>{
              const isA = compareA?.id===h.id;
              const isB = compareB?.id===h.id;
              return (
                <div key={h.id} className={`hist-card ${isA?"compare-a":isB?"compare-b":""}`}>
                  <div className="hist-card-header">
                    <div style={{flex:1,minWidth:0}}>
                      <div className="hist-card-meta">
                        <span className={`hist-type-pill ${h.type==="rapprochement"?"ht-rapp":h.type==="intercomptes"?"ht-ic":"ht-qb"}`}>
                          {h.type==="rapprochement"?"⚖ Rapprochement":h.type==="intercomptes"?"🔀 Intercomptes":"📒 QB"}
                        </span>
                        {isA&&<span style={{fontSize:10,color:"#38bdf8",background:"rgba(56,189,248,.1)",padding:"2px 8px",borderRadius:10}}>A</span>}
                        {isB&&<span style={{fontSize:10,color:"#a78bfa",background:"rgba(167,139,250,.1)",padding:"2px 8px",borderRadius:10}}>B</span>}
                        <span className="hist-date">{h.date}</span>
                      </div>
                      <div className="hist-title">{h.title}</div>
                      <div className="hist-kpis">
                        {h.type==="rapprochement"&&<><span className="hist-kpi">Taux: <span style={{color:"#38bdf8"}}>{h.summary?.taux_rapprochement}%</span></span><span className="hist-kpi">Rapprochées: <span>{h.summary?.matched}</span></span><span className="hist-kpi">Écart: <span style={{color:Math.abs(h.summary?.ecart||0)<.01?"#34d399":"#f87171"}}>{fmt(h.summary?.ecart||0)} €</span></span></>}
                        {h.type==="intercomptes"&&<><span className="hist-kpi">Flux: <span style={{color:"#a78bfa"}}>{h.summary?.total_flows}</span></span><span className="hist-kpi">Confirmés: <span>{h.summary?.confirmed}</span></span><span className="hist-kpi">Volume: <span>{fmt(h.summary?.total_volume||0)} €</span></span></>}
                        {h.type==="conciliation"&&<><span className="hist-kpi">Mois: <span style={{color:"#38bdf8"}}>{h.summary?.months}</span></span><span className="hist-kpi">Problèmes: <span style={{color:h.summary?.problems>0?"#f87171":"#34d399"}}>{h.summary?.problems}</span></span><span className="hist-kpi">Écart moy: <span>{fmt(h.summary?.avg_ecart||0)} €</span></span></>}
                      </div>
                    </div>
                    <div className="hist-card-actions">
                      <button className="hca-btn view" onClick={()=>setViewEntry(h)}>👁 Voir</button>
                      <button className={`hca-btn cmp`} onClick={()=>{if(!compareA||compareA.id===h.id){setCompareA(isA?null:h);}else if(!compareB||compareB.id===h.id){setCompareB(isB?null:h);}else{setCompareB(h);}}}>{isA?"✓ A":isB?"✓ B":"+ Comparer"}</button>
                      {h.type==="conciliation"&&h.qbData&&<button className="hca-btn" style={{color:"#38bdf8"}} onClick={()=>{setQbAcctName(h.qbData.accountName);setQbMonths(h.qbData.months);setFeature("conciliation");setQbResult(null);}}>↺ Réutiliser</button>}
                      <button className="hca-btn del" onClick={()=>deleteEntry(h.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-hist">
            <div className="no-hist-icon">🕐</div>
            <div className="no-hist-txt">Aucune analyse dans l'historique{histFilter!=="all"?" pour ce type":""} pour l'instant.<br/>Lancez une analyse pour la retrouver ici automatiquement.</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">Rapproche<span>.</span>IA</div>
          <div className="badge">✦ Powered by Claude</div>
        </header>

        <nav className="nav-tabs">
          <button className={`nav-tab ${feature==="rapprochement"?"active":""}`} onClick={()=>{setFeature("rapprochement");setRapproResult(null);}}>⚖ Rapprochement</button>
          <button className={`nav-tab ${feature==="intercomptes"?"active":""}`} onClick={()=>{setFeature("intercomptes");setIcResult(null);}}>🔀 Intercomptes</button>
          <button className={`nav-tab ${feature==="conciliation"?"active":""}`} onClick={()=>{setFeature("conciliation");setQbResult(null);}}>📒 Conciliation QB</button>
          <button className={`nav-tab ${feature==="historique"?"active":""}`} onClick={()=>{setFeature("historique");setViewEntry(null);}}>🕐 Historique{history.length>0&&<span className="hist-count">{history.length}</span>}</button>
        </nav>

        <main className="main">
          <div className="hero">
            {feature==="rapprochement"&&<><h1>Rapprochement Bancaire</h1><p>Importez vos relevés PDF ou CSV — l'IA identifie les correspondances et les écarts.</p></>}
            {feature==="intercomptes"&&<><h1>Transactions Intercomptes</h1><p>Détectez tous les flux entre vos comptes avec source et destinataire.</p></>}
            {feature==="conciliation"&&<><h1>Conciliation QuickBooks</h1><p>Comparez les soldes bancaires réels avec QuickBooks, mois par mois.</p></>}
            {feature==="historique"&&<><h1>Historique des analyses</h1><p>Retrouvez, comparez et exportez toutes vos analyses précédentes.</p></>}
          </div>

          {feature==="rapprochement"&&!rapproResult&&(<>{renderUpload()}<div className="analyze-sec"><button className="analyze-btn" onClick={analyzeRapprochement} disabled={!canAnalyze||loading}>{loading?"Analyse…":"⚡ Lancer le rapprochement IA"}</button>{loading&&<><div className="loading-bar"><div className="loading-fill"/></div><div className="loading-msg">{loadingMsg}</div></>}</div></>)}
          {feature==="rapprochement"&&rapproResult&&renderRapproResult(rapproResult)}

          {feature==="intercomptes"&&!icResult&&(<>{renderUpload()}<div className="analyze-sec"><button className="analyze-btn" onClick={analyzeIntercomptes} disabled={!canAnalyze||loading}>{loading?"Analyse…":"🔀 Analyser les flux"}</button>{loading&&<><div className="loading-bar"><div className="loading-fill"/></div><div className="loading-msg">{loadingMsg}</div></>}</div></>)}
          {feature==="intercomptes"&&icResult&&renderIcResult(icResult)}

          {feature==="conciliation"&&!qbResult&&renderQBInput()}
          {feature==="conciliation"&&qbResult&&renderQBResult(qbResult)}

          {feature==="historique"&&renderHistory()}
        </main>
      </div>
    </>
  );
}
