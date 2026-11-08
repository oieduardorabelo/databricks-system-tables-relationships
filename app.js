// Wait for the web font before the diagram measures text (at most 2.5 seconds).
const erdStart = () => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const HEAD_H = 26;
  const LINE_H = 13;
  const MIN_ROW_H = 18;
  const MIN_W = 200;
  const GAP = 22;
  const FONT_FAMILY = getComputedStyle(document.body).fontFamily;
  const LAYOUT_KEY = "erd-layout-v2"; // v2: tables and heights changed
  const MODE_KEY = "erd-layout-mode";
  const ELK_URL = "https://unpkg.com/elkjs@0.12.1/lib/elk.bundled.js";
  let layoutMode = (() => { try { return localStorage.getItem(MODE_KEY) || "image"; } catch { return "image"; } })();
  let elkRoutes = null; // Map: relationship index -> { pts, sDir, tDir } from ELK
  const CARD_TEXT = { one: "exactly one", many: "many", zmany: "zero or many", omany: "one or many" };
  const SCHEMA_COLOURS = {
    access: "#e3ecff", billing: "#fff1c9", compute: "#e2f5e0", lakeflow: "#f3e3fb",
    query: "#ffe3dc", serving: "#dcf3f5", mlflow: "#fde4ef", marketplace: "#ece9e2",
    ai_gateway: "#e8e3ff", alert: "#ffe6d2", data_classification: "#e7f1dc", data_quality_monitoring: "#dcf1ea",
    lakebase: "#dbe9f7", lakeflow_pipeline_events_preview: "#efe1f7", replication: "#f2e7da", sharing: "#dff0ff",
    storage: "#ecebdf", tags: "#f7e6f1",
  };
  const STATUS_LABEL = { preview: "Preview", beta: "Beta", unlisted: "Unlisted" };
  const STATUS_TEXT = {
    preview: "Public Preview. Databricks can still change this table.",
    beta: "Beta. An early release that Databricks can change or remove.",
    unlisted: "Unlisted. The table exists in Unity Catalog, but the Databricks docs do not list it yet.",
  };
  const SCOPE_TEXT = {
    global: "Contains data from all workspaces in all regions of the account.",
    regional: "Contains data only from workspaces in the region of the metastore that you query from.",
  };
  const HIDDEN_BY_DEFAULT = [];
  const COMMON_KEYS = ["account_id", "workspace_id"];
  // Shorten long nested types, for example array<struct<a:int,b:int>> -> array<…>.
  const shortType = (s) => (!s ? "" : s.length <= 24 ? s : s.replace(/<.*>/, "<…>"));

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ctx = document.createElement("canvas").getContext("2d");
  const measure = (text, size, weight = "normal") => {
    ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
    return ctx.measureText(text).width;
  };

  // ---------- Model ----------
  // data.js gives the key columns; columns.js (generated) gives every real column.
  const COLUMNS = window.ERD_COLUMNS || {};
  const COMMENTS = window.ERD_COMMENTS || {};
  const STATUS = window.ERD_STATUS || {};
  const defs = new Map(window.ERD_TABLES.map((d) => [d.id, d]));
  for (const id of Object.keys(COLUMNS)) if (!defs.has(id)) defs.set(id, { id, cols: [] });

  const relEnds = new Map();
  for (const [pt, pc, ct, cc] of window.ERD_RELS) {
    for (const [t, c] of [[pt, pc], [ct, cc]]) {
      if (!c) continue;
      if (!relEnds.has(t)) relEnds.set(t, new Set());
      relEnds.get(t).add(c);
    }
  }

  const parseCol = (raw) => {
    const pk = raw.startsWith("!");
    const s = pk ? raw.slice(1) : raw;
    const sp = s.indexOf(" ");
    return { pk, path: sp < 0 ? s : s.slice(0, sp), type: sp < 0 ? "" : s.slice(sp + 1) };
  };
  const makeCol = (path, type, pk) => {
    const parts = path.split(".");
    return { pk, path, type, shown: shortType(type), depth: parts.length - 1, display: parts[parts.length - 1], key: false };
  };

  const tables = new Map();
  const schemas = [];
  for (const def of defs.values()) {
    const [, schema, name] = def.id.split(".");
    if (!schemas.includes(schema)) schemas.push(schema);
    const listed = def.cols.map(parseCol);
    const pkSet = new Set(listed.filter((c) => c.pk).map((c) => c.path));
    const real = COLUMNS[def.id];
    const cols = real
      ? real.map(([p, ty]) => makeCol(p, ty, pkSet.has(p)))
      : listed.map((c) => makeCol(c.path, c.type, c.pk));
    const colByPath = new Map(cols.map((c) => [c.path, c]));
    // Key columns: the listed ones (or all, for docs-only tables), line ends and common IDs.
    const keys = new Set(real ? listed.map((c) => c.path) : cols.map((c) => c.path));
    for (const c of relEnds.get(def.id) || []) keys.add(c);
    for (const k of COMMON_KEYS) if (colByPath.has(k)) keys.add(k);
    if (keys.size < 3) for (const c of cols.filter((c) => !c.depth).slice(0, 4)) keys.add(c.path);
    for (const k of [...keys]) {
      const parts = k.split(".");
      for (let n = 1; n < parts.length; n++) keys.add(parts.slice(0, n).join("."));
    }
    for (const c of cols) c.key = keys.has(c.path);
    tables.set(def.id, {
      id: def.id, schema, name, x0: def.x, y0: def.y, cols, colByPath,
      scope: window.ERD_SCOPE[def.id] || null, status: STATUS[def.id] || null,
      source: real ? "export" : "docs", partial: !!def.partial, comment: COMMENTS[def.id] || "",
      expanded: false, hiddenCount: cols.filter((c) => !c.key).length,
    });
  }

  // Size each table from its text. The width fits every column, so expanding keeps the width.
  for (const t of tables.values()) {
    let nameW = 0, typeW = 0;
    for (const c of t.cols) {
      nameW = Math.max(nameW, measure((c.depth ? "• " : "") + c.display, 11) + c.depth * 8);
      typeW = Math.max(typeW, measure(c.shown, 11));
    }
    nameW += 16; typeW += 16;
    t.badges = [
      t.scope && { cls: t.scope, text: t.scope.toUpperCase(), title: SCOPE_TEXT[t.scope] },
      t.status && { cls: "st-" + t.status, text: STATUS_LABEL[t.status].toUpperCase(), title: STATUS_TEXT[t.status] },
    ].filter(Boolean).map((b) => ({ ...b, w: measure(b.text, 9, 700) + 12 }));
    t.badgesW = t.badges.reduce((a, b) => a + b.w + 4, 0);
    const titleW = measure(t.id, 13, 600) + 24 + t.badgesW;
    t.w = Math.ceil(Math.max(MIN_W, nameW + typeW, titleW));
    t.colW = Math.max(nameW, Math.round(t.w * 0.48));
    layoutRows(t);
  }

  function layoutRows(t) {
    let y = HEAD_H;
    for (const c of t.cols) {
      c.visible = t.expanded || c.key;
      if (c.visible) { c.y = y; c.h = MIN_ROW_H; y += MIN_ROW_H; }
    }
    if (t.hiddenCount) { t.moreY = y; y += MIN_ROW_H; }
    t.h = y;
  }

  // Image layout: fixed positions from data.js, pushed down when they overlap.
  // Tables without a position go in columns to the right, grouped by schema.
  function defaultLayout() {
    const placed = [];
    const fixed = [...tables.values()].filter((t) => Number.isFinite(t.x0)).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
    for (const t of fixed) {
      t.x = t.x0; t.y = t.y0;
      let moved = true;
      while (moved) {
        moved = false;
        for (const o of placed) {
          const xOverlap = t.x < o.x + o.w + 12 && o.x < t.x + t.w + 12;
          const yOverlap = t.y < o.y + o.h + GAP && o.y < t.y + t.h + GAP;
          if (xOverlap && yOverlap) { t.y = o.y + o.h + GAP; moved = true; }
        }
      }
      placed.push(t);
    }
    const auto = [...tables.values()].filter((t) => !Number.isFinite(t.x0));
    const maxH = Math.max(1600, ...placed.map((t) => t.y + t.h));
    let x = Math.max(0, ...placed.map((t) => t.x + t.w)) + 180, y = 0, colW = 0;
    for (const sc of schemas) {
      const list = auto.filter((t) => t.schema === sc);
      if (!list.length) continue;
      for (const t of list) {
        if (y > 0 && y + t.h > maxH) { x += colW + 60; y = 0; colW = 0; }
        t.x = x; t.y = y;
        y += t.h + GAP;
        colW = Math.max(colW, t.w);
      }
      y += GAP * 2; // extra space between schemas
    }
  }
  function imageLayout() {
    defaultLayout();
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "{}");
      for (const [id, p] of Object.entries(saved)) {
        const t = tables.get(id);
        if (t && Number.isFinite(p.x) && Number.isFinite(p.y)) { t.x = p.x; t.y = p.y; }
      }
    } catch { /* ignore broken saved layout */ }
  }
  imageLayout();
  const saveLayout = () => {
    if (layoutMode !== "image") return; // ELK layouts are recalculated, not saved
    const out = {};
    for (const t of tables.values()) out[t.id] = { x: Math.round(t.x), y: Math.round(t.y) };
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(out)); } catch { /* storage off */ }
  };

  const rels = window.ERD_RELS.map(([pt, pc, ct, cc, pCard, cCard], i) => {
    for (const [tid, col] of [[pt, pc], [ct, cc]]) {
      const t = tables.get(tid);
      if (!t || (col && !t.colByPath.has(col))) console.warn("Unknown relationship end:", tid, col);
    }
    return { i, pt, pc, ct, cc, pCard, cCard };
  });

  // ---------- SVG rendering ----------
  const svg = $("#svg");
  const viewport = $("#viewport");
  const gEdges = $("#edges");
  const gEdgesTop = $("#edges-top");
  const gTables = $("#tables");

  function drawTable(t) {
    const g = t.g;
    while (g.firstChild) g.firstChild.remove();
    el("rect", { class: "head", x: 0, y: 0, width: t.w, height: HEAD_H }, g);
    const title = el("text", { class: "title", x: (t.w - t.badgesW) / 2, y: 17, "text-anchor": "middle" }, g);
    title.textContent = t.id;
    let bx = t.w - 5;
    for (const b of [...t.badges].reverse()) {
      bx -= b.w;
      const bg = el("g", { class: "badge-svg" }, g);
      el("rect", { class: b.cls, x: bx, y: 6, width: b.w, height: 14, rx: 3 }, bg);
      el("text", { x: bx + b.w / 2, y: 16, "text-anchor": "middle" }, bg).textContent = b.text;
      el("title", {}, bg).textContent = b.title;
      bx -= 4;
    }
    let idx = 0;
    for (const c of t.cols) {
      c.g = null;
      if (!c.visible) continue;
      const r = el("g", { class: "colrow", "data-col": c.path }, g);
      c.g = r;
      el("rect", { class: "row" + (idx++ % 2 ? " alt" : ""), x: 0, y: c.y, width: t.w, height: c.h }, r);
      el("text", { class: "cname" + (c.pk ? " pk" : ""), x: 6 + c.depth * 8, y: c.y + 13 }, r).textContent = (c.depth ? "• " : "") + c.display;
      el("text", { class: "ctype", x: t.colW + 6, y: c.y + 13 }, r).textContent = c.shown;
      el("title", {}, r).textContent = `${c.path} : ${c.type}${c.pk ? " (primary key)" : ""}`;
    }
    const sepEnd = t.hiddenCount ? t.moreY : t.h;
    el("line", { class: "sep", x1: t.colW, y1: HEAD_H, x2: t.colW, y2: sepEnd }, g);
    if (t.hiddenCount) {
      const m = el("g", { class: "morerow" }, g);
      el("rect", { class: "row more", x: 0, y: t.moreY, width: t.w, height: MIN_ROW_H }, m);
      el("text", { class: "more-text", x: 6, y: t.moreY + 13 }, m).textContent = t.expanded
        ? "− Show key columns only"
        : `+ ${t.hiddenCount} more column${t.hiddenCount > 1 ? "s" : ""}`;
    }
    el("rect", { class: "frame", x: 0, y: 0, width: t.w, height: t.h, rx: 2, fill: "none" }, g);
  }

  for (const t of tables.values()) {
    t.g = el("g", { class: "tbl", "data-id": t.id }, gTables);
    drawTable(t);
    placeTable(t);
  }

  function setExpanded(t, expanded) {
    if (t.expanded === expanded || !t.hiddenCount) return;
    t.expanded = expanded;
    layoutRows(t);
    drawTable(t);
    if (elkRoutes) for (const r of rels) if (r.pt === t.id || r.ct === t.id) elkRoutes.delete(r.i);
    renderEdges();
    applyHighlight();
  }

  function placeTable(t) { t.g.setAttribute("transform", `translate(${t.x},${t.y})`); }

  function portY(t, col) {
    const c = col && t.colByPath.get(col);
    if (!c || !c.visible) return t.y + HEAD_H / 2;
    return t.y + c.y + c.h / 2;
  }

  function roundPath(pts, r = 6) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const d1 = Math.hypot(x1 - x0, y1 - y0), d2 = Math.hypot(x2 - x1, y2 - y1);
      if (!d1 || !d2) { d += ` L${x1},${y1}`; continue; }
      const rr = Math.min(r, d1 / 2, d2 / 2);
      const ax = x1 - ((x1 - x0) / d1) * rr, ay = y1 - ((y1 - y0) / d1) * rr;
      const bx = x1 + ((x2 - x1) / d2) * rr, by = y1 + ((y2 - y1) / d2) * rr;
      d += ` L${ax},${ay} Q${x1},${y1} ${bx},${by}`;
    }
    const [lx, ly] = pts[pts.length - 1];
    return d + ` L${lx},${ly}`;
  }

  // Crow's foot marker at (x, y). dir = +1 if the line leaves to the right, -1 to the left.
  function marker(card, x, y, dir) {
    const crow = `M${x + dir * 12},${y} L${x},${y - 6} M${x + dir * 12},${y} L${x},${y + 6}`;
    switch (card) {
      case "one": return { d: `M${x + dir * 9},${y - 6} V${y + 6}` };
      case "many": return { d: crow };
      case "omany": return { d: `${crow} M${x + dir * 16},${y - 6} V${y + 6}` };
      case "zmany": return { d: crow, circle: [x + dir * 17, y] };
      default: return { d: "" };
    }
  }

  for (const r of rels) {
    const g = el("g", { class: "edge", "data-i": r.i }, gEdges);
    r.g = g;
    r.hit = el("path", { class: "hit" }, g);
    r.line = el("path", { class: "line" }, g);
    r.m1 = el("path", { class: "mk" }, g);
    r.m2 = el("path", { class: "mk" }, g);
    r.c1 = el("circle", { r: 4, class: "hidden" }, g);
    r.c2 = el("circle", { r: 4, class: "hidden" }, g);
    el("title", {}, g).textContent = `${r.pt}.${r.pc}  →  ${r.ct}${r.cc ? "." + r.cc : ""}`;
  }

  function renderEdges() {
    // One vertical "trunk" lane per source column on each side of a table.
    const lanes = new Map();
    const lane = (tid, col, side) => {
      const key = `${tid}|${side}`;
      if (!lanes.has(key)) lanes.set(key, []);
      const list = lanes.get(key);
      if (!list.includes(col)) list.push(col);
      return 22 + list.indexOf(col) * 10;
    };

    for (const r of rels) {
      const A = tables.get(r.pt), B = tables.get(r.ct);
      const yA = portY(A, r.pc), yB = portY(B, r.cc);
      let pts, sDir, tDir;
      if (elkRoutes && elkRoutes.has(r.i)) {
        ({ pts, sDir, tDir } = elkRoutes.get(r.i));
      } else if (A === B) {
        const trunk = A.x - lane(A.id, r.pc, "L");
        pts = [[A.x, yA], [trunk, yA], [trunk, yB], [A.x, yB]];
        sDir = -1; tDir = -1;
      } else {
        const s = B.x + B.w / 2 >= A.x + A.w / 2 ? 1 : -1;
        const off = lane(A.id, r.pc, s > 0 ? "R" : "L");
        let xs, trunk, xe;
        if (s > 0) {
          xs = A.x + A.w; trunk = xs + off;
          if (B.x >= trunk + 28) { xe = B.x; tDir = -1; }
          else { trunk = Math.max(trunk, B.x + B.w + off); xe = B.x + B.w; tDir = 1; }
        } else {
          xs = A.x; trunk = xs - off;
          if (B.x + B.w <= trunk - 28) { xe = B.x + B.w; tDir = 1; }
          else { trunk = Math.min(trunk, B.x - off); xe = B.x; tDir = -1; }
        }
        sDir = s;
        pts = [[xs, yA], [trunk, yA], [trunk, yB], [xe, yB]];
      }
      const d = roundPath(pts);
      r.line.setAttribute("d", d);
      r.hit.setAttribute("d", d);
      const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
      const m1 = marker(r.pCard, sx, sy, sDir), m2 = marker(r.cCard, ex, ey, tDir);
      r.m1.setAttribute("d", m1.d);
      r.m2.setAttribute("d", m2.d);
      for (const [c, m] of [[r.c1, m1], [r.c2, m2]]) {
        c.classList.toggle("hidden", !m.circle);
        if (m.circle) { c.setAttribute("cx", m.circle[0]); c.setAttribute("cy", m.circle[1]); }
      }
    }
  }
  renderEdges();

  // ---------- Pan and zoom ----------
  const view = { k: 1, x: 0, y: 0 };
  const applyView = () => viewport.setAttribute("transform", `translate(${view.x},${view.y}) scale(${view.k})`);
  const clampK = (k) => Math.min(3, Math.max(0.08, k));

  function zoomAt(factor, cx, cy) {
    const k = clampK(view.k * factor);
    view.x = cx - ((cx - view.x) * k) / view.k;
    view.y = cy - ((cy - view.y) * k) / view.k;
    view.k = k;
    applyView();
  }

  let anim = null;
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateTo(target, ms = reduceMotion ? 0 : 300) {
    cancelAnimationFrame(anim);
    if (ms <= 0) { Object.assign(view, target); applyView(); return; }
    const from = { ...view }, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      view.k = from.k + (target.k - from.k) * e;
      view.x = from.x + (target.x - from.x) * e;
      view.y = from.y + (target.y - from.y) * e;
      applyView();
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function boundsOf(list) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const t of list) {
      x1 = Math.min(x1, t.x); y1 = Math.min(y1, t.y);
      x2 = Math.max(x2, t.x + t.w); y2 = Math.max(y2, t.y + t.h);
    }
    return { x1: x1 - 60, y1: y1 - 30, x2: x2 + 60, y2: y2 + 30 };
  }

  function fitTo(list, animate = true, maxK = 1.4) {
    if (!list.length) return;
    const b = boundsOf(list);
    const W = svg.clientWidth, H = svg.clientHeight;
    const k = clampK(Math.min(W / (b.x2 - b.x1), H / (b.y2 - b.y1), maxK));
    const target = { k, x: W / 2 - ((b.x1 + b.x2) / 2) * k, y: H / 2 - ((b.y1 + b.y2) / 2) * k };
    if (animate) animateTo(target); else { Object.assign(view, target); applyView(); }
  }
  const visibleTables = () => [...tables.values()].filter((t) => !hiddenSchemas.has(t.schema));
  const fitAll = (animate = true) => fitTo(visibleTables(), animate);

  // ---------- Pointer handling: pan, pinch, drag, click ----------
  const pointers = new Map();
  let gesture = null;

  const svgPoint = (e) => {
    const r = svg.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  svg.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, svgPoint(e));
    cancelAnimationFrame(anim);

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gesture = { type: "pinch", dist: Math.hypot(a[0] - b[0], a[1] - b[1]) };
      return;
    }
    const tg = e.target.closest(".tbl");
    const eg = e.target.closest(".edge");
    const [px, py] = svgPoint(e);
    if (tg) {
      const t = tables.get(tg.dataset.id);
      gesture = { type: "table", t, sx: px, sy: py, ox: t.x, oy: t.y, moved: false, target: e.target };
      gTables.appendChild(tg); // bring to front
    } else {
      gesture = { type: "pan", sx: px, sy: py, ox: view.x, oy: view.y, moved: false, edge: eg };
      svg.classList.add("panning");
    }
  });

  svg.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, svgPoint(e));
    if (!gesture) return;
    if (gesture.type === "pinch" && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      zoomAt(dist / gesture.dist, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      gesture.dist = dist;
      return;
    }
    const [px, py] = svgPoint(e);
    const dx = px - gesture.sx, dy = py - gesture.sy;
    if (!gesture.moved && Math.hypot(dx, dy) < 4) return;
    gesture.moved = true;
    if (gesture.type === "pan") {
      view.x = gesture.ox + dx; view.y = gesture.oy + dy; applyView();
    } else if (gesture.type === "table") {
      const t = gesture.t;
      t.x = Math.round(gesture.ox + dx / view.k);
      t.y = Math.round(gesture.oy + dy / view.k);
      placeTable(t);
      // Lines of a moved table fall back to the simple router; other ELK lines stay.
      if (elkRoutes) for (const r of rels) if (r.pt === t.id || r.ct === t.id) elkRoutes.delete(r.i);
      renderEdges();
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    svg.classList.remove("panning");
    const g = gesture;
    if (pointers.size > 0) { gesture = null; return; }
    gesture = null;
    if (!g || g.type === "pinch") return;
    if (g.type === "table") {
      if (g.moved) { saveLayout(); return; }
      if (g.target.closest(".morerow")) { setExpanded(g.t, !g.t.expanded); return; }
      const row = g.target.closest(".colrow");
      if (row) select({ kind: "col", table: g.t.id, col: row.dataset.col });
      else select({ kind: "table", table: g.t.id });
    } else if (!g.moved) {
      if (g.edge) select({ kind: "edge", rel: rels[+g.edge.dataset.i] });
      else select(null);
    }
  }
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);

  // Scroll pans; Ctrl/Cmd + scroll (and trackpad pinch) zooms.
  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    cancelAnimationFrame(anim);
    if (e.ctrlKey || e.metaKey) {
      const [cx, cy] = svgPoint(e);
      zoomAt(Math.exp(-e.deltaY * 0.01), cx, cy);
    } else {
      const f = e.deltaMode === 1 ? 16 : 1;
      view.x -= e.deltaX * f; view.y -= e.deltaY * f;
      if (e.shiftKey && !e.deltaX) { view.y += e.deltaY * f; view.x -= e.deltaY * f; }
      applyView();
    }
  }, { passive: false });

  const center = () => [svg.clientWidth / 2, svg.clientHeight / 2];
  $("#zoom-in").onclick = () => zoomAt(1.25, ...center());
  $("#zoom-out").onclick = () => zoomAt(0.8, ...center());
  $("#fit").onclick = () => fitAll();
  $("#reset").onclick = () => {
    if (layoutMode === "elk") { runElk(); return; }
    try { localStorage.removeItem(LAYOUT_KEY); } catch { /* ignore */ }
    defaultLayout();
    for (const t of tables.values()) placeTable(t);
    renderEdges();
    fitAll();
  };

  // ---------- Automatic layout with ELK (elkjs, loaded on demand) ----------
  const modeBtn = $("#layout-mode");
  const updateModeBtn = () => {
    modeBtn.textContent = layoutMode === "elk" ? "Layout: auto (ELK)" : "Layout: image";
    modeBtn.setAttribute("aria-pressed", String(layoutMode === "elk"));
  };

  let elkLoading = null;
  const loadElk = () => elkLoading || (elkLoading = window.ELK ? Promise.resolve() : new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = ELK_URL;
    s.onload = res;
    s.onerror = () => { elkLoading = null; rej(new Error("Could not load elkjs from unpkg.")); };
    document.head.appendChild(s);
  }));

  async function runElk() {
    modeBtn.disabled = true;
    modeBtn.textContent = "Laying out…";
    try {
      await loadElk();
      // One port per column and side: lines leave a parent on the right (EAST)
      // and enter a child on the left (WEST), at the exact column row.
      const nodes = new Map(visibleTables().map((t) => [t.id, {
        id: t.id, width: t.w, height: t.h, ports: [],
        layoutOptions: { "elk.portConstraints": "FIXED_POS" },
      }]));
      const port = (tid, col, side) => {
        const id = `${tid}|${col || "#"}|${side}`;
        const n = nodes.get(tid), t = tables.get(tid);
        if (!n.ports.some((p) => p.id === id)) {
          n.ports.push({ id, width: 0, height: 0, x: side === "E" ? t.w : 0, y: portY(t, col) - t.y,
            layoutOptions: { "elk.port.side": side === "E" ? "EAST" : "WEST" } });
        }
        return id;
      };
      const edges = rels.filter(relShown).map((r) => ({ id: "e" + r.i, sources: [port(r.pt, r.pc, "E")], targets: [port(r.ct, r.cc, "W")] }));
      const out = await new window.ELK().layout({
        id: "root",
        layoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "RIGHT",
          "elk.edgeRouting": "ORTHOGONAL",
          "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
          "elk.layered.spacing.nodeNodeBetweenLayers": "100",
          "elk.layered.spacing.edgeNodeBetweenLayers": "30",
          "elk.layered.spacing.edgeEdgeBetweenLayers": "10",
          "elk.spacing.nodeNode": "30",
          "elk.spacing.edgeEdge": "10",
          "elk.separateConnectedComponents": "true",
          "elk.spacing.componentComponent": "80",
        },
        children: [...nodes.values()],
        edges,
      });
      if (layoutMode !== "elk") return; // user switched back while ELK was running
      for (const n of out.children) {
        const t = tables.get(n.id);
        t.x = Math.round(n.x); t.y = Math.round(n.y);
        placeTable(t);
      }
      elkRoutes = new Map();
      for (const e of out.edges) {
        const s = e.sections && e.sections[0];
        if (!s) continue;
        const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint].map((p) => [p.x, p.y]);
        elkRoutes.set(+e.id.slice(1), { pts, sDir: 1, tDir: -1 });
      }
      renderEdges();
      fitAll();
    } catch (err) {
      console.error(err);
      setMode("image");
      panel.insertAdjacentHTML("afterbegin", `<p class="muted">The automatic layout did not load: ${esc(err.message)}</p>`);
    } finally {
      modeBtn.disabled = false;
      updateModeBtn();
    }
  }

  function setMode(mode) {
    layoutMode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
    updateModeBtn();
    if (mode === "elk") { runElk(); return; }
    elkRoutes = null;
    imageLayout();
    for (const t of tables.values()) placeTable(t);
    renderEdges();
    fitAll();
  }
  modeBtn.onclick = () => setMode(layoutMode === "elk" ? "image" : "elk");
  updateModeBtn();
  const erd = $(".erd");
  $("#fullscreen").onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else erd.requestFullscreen?.();
  };
  document.addEventListener("fullscreenchange", () => setTimeout(() => fitAll(false), 50));

  // ---------- Highlighting ----------
  let selection = null;
  let hover = null;
  let searchHits = null;

  function relsFor(focus) {
    if (!focus) return [];
    if (focus.kind === "edge") return [focus.rel];
    if (focus.kind === "table") return rels.filter((r) => r.pt === focus.table || r.ct === focus.table);
    return rels.filter((r) => (r.pt === focus.table && r.pc === focus.col) || (r.ct === focus.table && r.cc === focus.col));
  }

  function applyHighlight() {
    const focus = selection || hover;
    for (const t of tables.values()) {
      t.g.classList.remove("focus", "selected", "match");
      for (const n of t.g.querySelectorAll(".selected, .linked, .match")) n.classList.remove("selected", "linked", "match");
    }
    const rowOf = (t, path) => { const c = t.colByPath.get(path); return c && c.g; };
    for (const r of rels) { r.g.classList.remove("hl"); if (r.g.parentNode !== gEdges) gEdges.appendChild(r.g); }

    let dim = false;
    if (focus) {
      dim = true;
      const list = relsFor(focus);
      const focusTable = focus.table || null;
      if (focusTable) {
        tables.get(focusTable).g.classList.add("focus");
        if (focus === selection) tables.get(focusTable).g.classList.add("selected");
      }
      if (focus.kind === "col") rowOf(tables.get(focus.table), focus.col)?.classList.add("selected");
      for (const r of list) {
        r.g.classList.add("hl");
        gEdgesTop.appendChild(r.g);
        for (const [tid, col] of [[r.pt, r.pc], [r.ct, r.cc]]) {
          const t = tables.get(tid);
          t.g.classList.add("focus");
          if (col && !(tid === focus.table && col === focus.col)) rowOf(t, col)?.classList.add("linked");
        }
      }
    } else if (searchHits) {
      dim = true;
      for (const { t, cols } of searchHits) {
        t.g.classList.add("focus", "match");
        for (const c of cols) (c.g || t.g.querySelector(".morerow"))?.classList.add("match");
      }
    }
    viewport.classList.toggle("dim", dim);
  }

  gTables.addEventListener("pointerover", (e) => {
    if (gesture) return;
    const tg = e.target.closest(".tbl");
    if (!tg) return;
    const row = e.target.closest(".colrow");
    const next = row ? { kind: "col", table: tg.dataset.id, col: row.dataset.col } : { kind: "table", table: tg.dataset.id };
    if (!hover || hover.kind !== next.kind || hover.table !== next.table || hover.col !== next.col) {
      hover = next;
      if (!selection) applyHighlight();
    }
  });
  gTables.addEventListener("pointerleave", () => { hover = null; if (!selection) applyHighlight(); });
  gEdges.addEventListener("pointerover", (e) => {
    if (gesture || selection) return;
    const eg = e.target.closest(".edge");
    if (eg) { hover = { kind: "edge", rel: rels[+eg.dataset.i] }; applyHighlight(); }
  });
  gEdges.addEventListener("pointerout", () => { if (hover && hover.kind === "edge") { hover = null; applyHighlight(); } });

  // ---------- Selection and side panel ----------
  const panel = $("#panel");

  function select(sel, { zoom = false } = {}) {
    if (sel && sel.table) {
      const t = tables.get(sel.table);
      if (hiddenSchemas.has(t.schema)) toggleSchema(t.schema);
      if (sel.kind === "col" && !t.colByPath.get(sel.col)?.visible) setExpanded(t, true);
    }
    selection = sel;
    applyHighlight();
    renderPanel();
    const hash = sel && sel.table ? "#" + sel.table + (sel.kind === "col" ? "." + sel.col : "") : " ";
    history.replaceState(null, "", hash === " " ? location.pathname + location.search : hash);
    if (zoom && sel) {
      const ids = new Set(sel.table ? [sel.table] : [sel.rel.pt, sel.rel.ct]);
      for (const r of relsFor(sel)) { ids.add(r.pt); ids.add(r.ct); }
      fitTo([...ids].map((id) => tables.get(id)), true, 1.2);
    }
  }

  const alias = (() => {
    return (id, taken) => {
      const name = id.split(".")[2];
      let a = name.split("_").map((p) => p[0]).join("");
      let n = a, i = 2;
      while (taken.includes(n)) n = a + i++;
      taken.push(n);
      return n;
    };
  })();

  function joinSQL(r) {
    const taken = [];
    const c = alias(r.ct, taken), p = alias(r.pt, taken);
    const childCol = tables.get(r.ct).colByPath.get(r.cc);
    let on;
    if (!r.cc) on = `-- ${r.ct} has no ${r.pc} column in this diagram\n  ${c}.<${r.pc} column> = ${p}.${r.pc}`;
    else if (childCol && childCol.type.startsWith("array")) on = `array_contains(${c}.${r.cc}, ${p}.${r.pc})`;
    else on = `${c}.${r.cc} = ${p}.${r.pc}`;
    return `SELECT *\nFROM ${r.ct} AS ${c}\nJOIN ${r.pt} AS ${p}\n  ON ${on}`;
  }

  const tableLink = (id, col) =>
    `<button class="link" data-table="${esc(id)}"${col ? ` data-col="${esc(col)}"` : ""}>${esc(id)}${col ? "." + esc(col) : ""}</button>`;

  const badgesHTML = (t) => t.badges.map((b) => ` <span class="badge ${b.cls}">${esc(b.text.toLowerCase())}</span>`).join("");
  const statusHTML = (t) => !t.status ? "" :
    `<p><span class="badge st-${t.status}">${esc(STATUS_LABEL[t.status].toLowerCase())}</span> ${esc(STATUS_TEXT[t.status])}</p>`;
  const scopeHTML = (t) => !t.scope ? "" :
    `<p><span class="badge ${t.scope}">${t.scope}</span> ${t.scope === "global"
      ? "Contains data from all workspaces in all regions of the account."
      : "Contains data only from workspaces in the region of the metastore that you query from."}</p>`;

  function joinCard(r) {
    const childDesc = r.cc ? `${r.ct}.${r.cc}` : r.ct;
    return `<div class="join">
      <div>${tableLink(r.pt, r.pc)}</div>
      <div class="card">One value here matches ${CARD_TEXT[r.cCard]} rows in</div>
      <div>${r.cc ? tableLink(r.ct, r.cc) : tableLink(r.ct)}</div>
      <p class="card">Each value in <code>${esc(childDesc)}</code> matches ${CARD_TEXT[r.pCard]} row in <code>${esc(r.pt)}</code>.</p>
      <pre><button class="copy">Copy</button>${esc(joinSQL(r))}</pre>
    </div>`;
  }

  function renderPanel() {
    const s = selection;
    if (!s) {
      const groups = schemas.map((sc) => {
        const items = [...tables.values()].filter((t) => t.schema === sc)
          .map((t) => `<li>${tableLink(t.id)}${badgesHTML(t)}</li>`).join("");
        return `<h4>${esc(sc)}${hiddenSchemas.has(sc) ? " <span class=\"muted\">(hidden)</span>" : ""}</h4><ul>${items}</ul>`;
      }).join("");
      const exp = window.ERD_EXPORT;
      panel.innerHTML = `<h3>Overview</h3>
        <p>The diagram has ${tables.size} tables and ${rels.length} lines. Click a table, a column or a line. This panel then shows how it joins to other tables, with SQL that you can copy.</p>
        <p>Each box shows its key columns first. Click <strong>+ more columns</strong> to see every column.</p>
        ${exp ? `<p class="muted">Columns come from Unity Catalog in a Databricks workspace (${esc(exp.date)}). Tables that were not enabled there use the columns in the Databricks docs.</p>` : ""}
        <p class="muted">Keyboard: <code>/</code> to search, <code>F</code> to fit, <code>+</code> and <code>−</code> to zoom, <code>Esc</code> to clear.</p>
        ${groups}`;
      return;
    }
    if (s.kind === "edge") {
      panel.innerHTML = `<h3>Relationship</h3>${joinCard(s.rel)}`;
      return;
    }
    const t = tables.get(s.table);
    const list = relsFor(s);
    if (s.kind === "table") {
      const cols = t.cols.map((c) =>
        `<li${c.key ? ' class="key"' : ""}><button class="link${c.pk ? " pk" : ""}" data-table="${esc(t.id)}" data-col="${esc(c.path)}">${esc(c.path)}</button><span class="t">${esc(c.type)}</span></li>`).join("");
      const source = t.source === "export"
        ? ""
        : `<p class="muted">${t.partial ? "Key columns only. " : ""}Columns from the <a href="https://docs.databricks.com/aws/en/admin/system-tables/" target="_blank" rel="noreferrer">Databricks docs</a>. This table was not enabled in the workspace that the column list comes from.</p>`;
      panel.innerHTML = `<h3>${esc(t.id)}</h3>
        ${t.comment ? `<p>${esc(t.comment).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>` : ""}${scopeHTML(t)}${statusHTML(t)}${source}
        <h4>Columns (${t.cols.length})</h4>
        ${t.hiddenCount ? `<p class="muted">Key columns are in bold.</p>` : ""}<ul class="cols">${cols}</ul>
        <h4>Relationships (${list.length})</h4>${list.map(joinCard).join("") || '<p>This table has no lines in the diagram.</p>'}`;
    } else {
      const c = t.colByPath.get(s.col);
      panel.innerHTML = `<h3>${esc(t.id)}.<wbr>${esc(c.path)}</h3>
        <p><code>${esc(c.type)}</code>${c.pk ? " · primary key" : ""}${c.depth ? " · struct field: read it with a dot" : ""}</p>
        <p>${tableLink(t.id)}</p>
        <h4>Joins (${list.length})</h4>${list.map(joinCard).join("") || "<p>This column has no lines in the diagram.</p>"}`;
    }
  }

  panel.addEventListener("click", (e) => {
    const copy = e.target.closest(".copy");
    if (copy) {
      const text = copy.parentElement.textContent.replace(/^Copy/, "");
      navigator.clipboard?.writeText(text).then(() => {
        copy.textContent = "Copied";
        setTimeout(() => (copy.textContent = "Copy"), 1200);
      });
      return;
    }
    const link = e.target.closest(".link");
    if (link) {
      const tid = link.dataset.table;
      select(link.dataset.col ? { kind: "col", table: tid, col: link.dataset.col } : { kind: "table", table: tid }, { zoom: true });
    }
  });

  // ---------- Schema filter ----------
  const hiddenSchemas = new Set(HIDDEN_BY_DEFAULT.filter((sc) => schemas.includes(sc)));
  const chips = $("#schemas");
  for (const sc of schemas) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = sc;
    b.style.background = SCHEMA_COLOURS[sc] || "#eee";
    b.setAttribute("aria-pressed", "true");
    b.title = `Show or hide system.${sc}`;
    b.onclick = () => toggleSchema(sc);
    chips.appendChild(b);
  }
  function syncSchemas() {
    [...chips.children].forEach((b) => b.setAttribute("aria-pressed", String(!hiddenSchemas.has(b.textContent))));
    for (const t of tables.values()) t.g.classList.toggle("hidden", hiddenSchemas.has(t.schema));
    for (const r of rels) r.g.classList.toggle("hidden", !relShown(r));
  }
  const relShown = (r) => !hiddenSchemas.has(tables.get(r.pt).schema) && !hiddenSchemas.has(tables.get(r.ct).schema);
  function toggleSchema(sc) {
    if (hiddenSchemas.has(sc)) hiddenSchemas.delete(sc); else hiddenSchemas.add(sc);
    syncSchemas();
    if (layoutMode === "elk") runElk();
    if (!selection) renderPanel();
  }
  syncSchemas();

  // ---------- Search ----------
  const search = $("#search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (!q) { searchHits = null; applyHighlight(); return; }
    searchHits = [];
    for (const t of tables.values()) {
      const cols = t.cols.filter((c) => c.path.toLowerCase().includes(q));
      if (t.id.toLowerCase().includes(q) || cols.length) searchHits.push({ t, cols });
    }
    if (selection) { selection = null; renderPanel(); }
    applyHighlight();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchHits && searchHits.length) {
      for (const sc of new Set(searchHits.map((h) => h.t.schema))) if (hiddenSchemas.has(sc)) toggleSchema(sc);
      applyHighlight();
      fitTo(searchHits.map((h) => h.t), true, 1.2);
    }
    if (e.key === "Escape") { search.value = ""; search.dispatchEvent(new Event("input")); search.blur(); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "/") { e.preventDefault(); search.focus(); }
    else if (e.key === "f" || e.key === "F") fitAll();
    else if (e.key === "+" || e.key === "=") zoomAt(1.25, ...center());
    else if (e.key === "-") zoomAt(0.8, ...center());
    else if (e.key === "Escape") select(null);
  });

  // ---------- Key join paths ----------
  const kj = $("#key-joins");
  for (const [at, ac, bt, bc] of window.ERD_KEY_JOINS) {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#${esc(at)}.${esc(ac)}"><code>${esc(at)}.${esc(ac)}</code></a> joins to <code>${esc(bt)}.${esc(bc)}</code>`;
    li.querySelector("a").onclick = (e) => {
      e.preventDefault();
      erd.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      select({ kind: "col", table: at, col: ac }, { zoom: true });
    };
    kj.appendChild(li);
  }

  // ---------- Start ----------
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return false;
    for (const t of tables.values()) {
      if (h === t.id) { select({ kind: "table", table: t.id }, { zoom: true }); return true; }
      if (h.startsWith(t.id + ".") && t.colByPath.has(h.slice(t.id.length + 1))) {
        select({ kind: "col", table: t.id, col: h.slice(t.id.length + 1) }, { zoom: true });
        return true;
      }
    }
    return false;
  }

  renderPanel();
  fitAll(false);
  fromHash();
  if (layoutMode === "elk") runElk();
  window.addEventListener("hashchange", fromHash);
};

(() => {
  const fonts = document.fonts;
  if (!fonts || !fonts.load) { erdStart(); return; }
  const family = '"Atkinson Hyperlegible Next"';
  const loads = Promise.all([fonts.load(`11px ${family}`), fonts.load(`600 13px ${family}`), fonts.load(`700 9px ${family}`)]);
  const timeout = new Promise((res) => setTimeout(res, 2500));
  let started = false;
  const go = () => { if (!started) { started = true; erdStart(); } };
  Promise.race([loads, timeout]).then(go, go);
})();

// Theme toggle: light by default; the choice is saved in the browser.
(() => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => {
    const dark = root.dataset.theme === "dark";
    btn.innerHTML = `<span class="icon" aria-hidden="true">${dark ? "☀" : "☾"}</span><span class="label">${dark ? "Light mode" : "Dark mode"}</span>`;
    btn.setAttribute("aria-label", dark ? "Light mode" : "Dark mode");
  };
  btn.addEventListener("click", () => {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    try { localStorage.setItem("erd-theme", dark ? "dark" : "light"); } catch { /* storage off */ }
    sync();
  });
  sync();
})();
