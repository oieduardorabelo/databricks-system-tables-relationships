#!/usr/bin/env node
// Compare this page's data with the Databricks system tables docs.
//
// Usage: node scripts/check-docs.mjs
//
// It reads the raw HTML of the docs overview page (no summary tool) and reports:
//   - tables in the docs that the diagram does not have
//   - tables in the diagram that the docs do not list, unless their status is "unlisted"
//   - "unlisted" tables that the docs now list
//   - differences in scope (global or regional) and release status
//   - a change to the docs diagram image (review the lines that come from it)
// Known differences in window.ERD_DOCS (data.js) are not reported.
// The exit code is 1 when there is something to review.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const DOCS_URL = "https://docs.databricks.com/aws/en/admin/system-tables/";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------- This page's data ----------
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ["columns.js", "data.js"]) vm.runInContext(readFileSync(join(root, f), "utf8"), sandbox, { filename: f });
const W = sandbox.window;
const known = W.ERD_DOCS || { renamed: {}, status: {}, scope: {} };
const pageTables = new Set([...W.ERD_TABLES.map((t) => t.id), ...Object.keys(W.ERD_COLUMNS || {})]);
const pageStatus = (id) => (W.ERD_STATUS || {})[id] || "ga";
const pageScope = (id) => (W.ERD_SCOPE || {})[id] || null;

// ---------- The docs ----------
const res = await fetch(DOCS_URL, { headers: { "User-Agent": "databricks-system-tables-relationships docs check" } });
if (!res.ok) { console.error(`Could not read ${DOCS_URL}: HTTP ${res.status}`); process.exit(2); }
const html = await res.text();

const text = (s) => s.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const start = html.indexOf("<table"), end = html.indexOf("</table>", start);
if (start < 0 || end < 0) { console.error("The docs page has no table. Its layout changed: update this script."); process.exit(2); }

// The docs HTML omits closing tags, so split on <tr> and <td>.
const docs = new Map(); // id -> { name, status, scope }
for (const row of html.slice(start, end).split("<tr>").slice(1)) {
  const cells = row.split(/<td[^>]*>/).slice(1);
  if (cells.length < 5) continue; // header row
  const name = text(cells[0]);
  const status = /\(Beta\)/i.test(name) ? "beta" : /Private Preview/i.test(name) ? "private" : /Preview/i.test(name) ? "preview" : "ga";
  const scopeText = text(cells[cells.length - 1]);
  const scope = /^global/i.test(scopeText) ? "global" : /^regional/i.test(scopeText) ? "regional" : null;
  let ids = [...cells[1].matchAll(/<code>(system\.[a-z0-9_]+\.[a-z0-9_*]+)<\/code>/gi)].map((m) => m[1]);
  if (!ids.length && /^Clusters\b/.test(name)) ids = ["system.compute.clusters"]; // the docs row has no table path
  if (!ids.length) { console.warn(`Note: no table path in the docs row "${name}".`); continue; }
  for (const id of ids) docs.set(id, { name: name.replace(/\s*\(.*?\)\s*/g, " ").trim(), status, scope, scopeText });
}

// ---------- Compare ----------
const issues = [];
const resolve = (id) => known.renamed?.[id] || id;
const docIds = new Set([...docs.keys()].map(resolve));

for (const [rawId, d] of docs) {
  const id = resolve(rawId);
  if (id.endsWith(".*")) {
    const prefix = id.slice(0, -1);
    if (![...pageTables].some((t) => t.startsWith(prefix))) issues.push(`Missing: the docs list ${id}, but the diagram has no table in that schema.`);
    continue;
  }
  if (!pageTables.has(id)) { issues.push(`Missing: the docs list ${id} (${d.name}), but the diagram does not have it.`); continue; }
  if (pageStatus(id) !== d.status && !known.status?.[id]) {
    issues.push(`Status: ${id} is "${pageStatus(id)}" here, but "${d.status}" in the docs.`);
  }
  if (d.scope && pageScope(id) !== d.scope && !known.scope?.[id]) {
    issues.push(`Scope: ${id} is "${pageScope(id) || "none"}" here, but "${d.scope}" in the docs (${d.scopeText}).`);
  }
}
for (const id of pageTables) {
  const inDocs = docIds.has(id) || [...docIds].some((d) => d.endsWith(".*") && id.startsWith(d.slice(0, -1)));
  if (!inDocs && pageStatus(id) !== "unlisted") issues.push(`Not in docs: ${id} is in the diagram, but the docs do not list it. Mark it "unlisted" or remove it.`);
  if (inDocs && pageStatus(id) === "unlisted") issues.push(`Now listed: the docs now list ${id}. Change its status from "unlisted".`);
}

const diagram = html.match(/system-tables-erd-[0-9a-f]+\.svg/);
if (!diagram) issues.push("Diagram: the docs page has no system tables diagram any more. Review the lines that use ERD in data.js.");
else if (known.diagram && diagram[0] !== known.diagram) {
  issues.push(`Diagram: the docs diagram changed (${known.diagram} -> ${diagram[0]}). Review the lines that use ERD in data.js, then update ERD_DOCS.diagram.`);
}

// ---------- Report ----------
console.log(`Docs: ${docs.size} table entries. Diagram: ${pageTables.size} tables.`);
const accepted = [...Object.keys(known.renamed || {}), ...Object.keys(known.status || {}), ...Object.keys(known.scope || {})];
if (accepted.length) console.log(`Known differences, not reported: ${accepted.length} (see ERD_DOCS in data.js).`);
if (!issues.length) { console.log("No differences. The page matches the docs."); process.exit(0); }
console.log(`\n${issues.length} difference(s) to review:`);
for (const i of issues) console.log(`- ${i}`);
process.exit(1);
