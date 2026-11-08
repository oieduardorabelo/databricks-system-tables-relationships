# Databricks system tables: how they connect

**Live page: https://oieduardorabelo.github.io/databricks-system-tables-relationships/**

[![The diagram with system.billing.usage selected. Its joins show in red and the side panel shows the SQL.](docs/screenshot.png)](https://oieduardorabelo.github.io/databricks-system-tables-relationships/#system.billing.usage)

Databricks keeps operational data about your account in system tables. These tables record billing, compute, jobs, queries and access events. You read them with SQL.

This repository is a web page with an interactive diagram of these tables. Each box is a table. Each line connects a column in one table to a column in another table. The page also explains scope (global or regional tables) and gives rules for good queries.

## What you can do on the page

- Drag or scroll to move the view. Pinch, or hold Ctrl/Cmd and scroll, to zoom.
- Drag a table to move it. Your browser keeps the new position.
- Click a table, a column or a line. The side panel shows the joins, with SQL that you can copy.
- Search for a table or a column. Show or hide each schema.
- Change the layout. "Layout: standard" uses fixed positions. "Layout: automatic" uses [elkjs](https://github.com/kieler/elkjs) to place the tables and route the lines around them.
- Share a link to one table or column, for example `#system.billing.usage.usage_metadata.warehouse_id`.

## What it covers

Every system table: 58 tables in 18 schemas of the `system` catalog. It leaves out `system.information_schema`, which describes data objects, not account activity. Each box shows its key columns first. "+ more columns" shows every column.

## Data sources

The page combines two sources. Each source covers what the other cannot.

| Data | Source | How it is kept correct |
| --- | --- | --- |
| Table list | Unity Catalog export and the Databricks docs | `scripts/check-docs.mjs` compares both. |
| Columns and types | Unity Catalog export (Databricks CLI) | The export is the real schema. |
| Columns of tables that the exported workspace did not have (`data_classification`, `data_quality_monitoring`, `lakebase`, `marketplace`, `replication`) | Databricks docs, entered by hand in `data.js` | Read by hand. For `lakebase`, only the main columns. |
| Scope (global or regional) | Databricks docs overview | `scripts/check-docs.mjs` |
| Release status (preview, beta, unlisted) | Databricks docs overview | `scripts/check-docs.mjs` |
| Lines (joins) | See below | Each line has its source in `data.js`. |

**Lines.** Each line in `ERD_RELS` (`data.js`) has a source:

- `ERD`: the entity relationship diagram in the [docs overview](https://docs.databricks.com/aws/en/admin/system-tables/#system-tables-relationships) (52 lines).
- `SRC.*`: a docs table page that names the join, for example the alerts or pipelines page (12 lines).
- No source: the columns have matching names and meaning, but no docs page describes the join (38 lines). The side panel says "Matching column names" for these lines.

**Known differences.** `ERD_DOCS` in `data.js` lists where this page differs from the docs on purpose, with the reason. For example, the docs name `storage.table_auto_upgrade_operations_history`, but the real table is `storage.auto_upgrade_operations_history`. The docs diagram also has errors that the export corrects: `job_tasks.depends_on_task_keys` is really `depends_on_keys`, and `compute.warehouses` has no `change_date` or `create_time`.

## Files

| File | What it does |
| --- | --- |
| `data.js` | Written by hand. Key columns, primary keys, lines and their sources, scope, release status, positions and known docs differences. |
| `columns.js` | Generated. Every real column and type, and the table descriptions. Do not edit it by hand. |
| `app.js` | Draws the diagram and handles clicks, drags and search. It needs no other library. It loads elkjs from unpkg only when you select the automatic layout. |
| `styles.css` | Sets colours and layout. |
| `index.html` | Holds the page text. |
| `scripts/` | Exports the system catalog, builds `columns.js` and checks the data against the docs. |

## Update the data

You need the [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/) with a profile for a workspace with Unity Catalog, Python 3 and Node.js 18 or later.

1. Run `scripts/export-system-tables.sh <profile>`. The raw export goes to `scripts/.uc-export/`. Git ignores this folder, because it has workspace details.
2. Run `python3 scripts/build-columns.py`. This writes `columns.js`. The "Last updated" date on the page comes from this step.
3. Run `node scripts/check-docs.mjs`. It compares the table list, scope, release status and the docs diagram with the docs. It ends with "No differences" or a list to review. Fix each item in `data.js`, or add it to `ERD_DOCS` with the reason.
4. Open the page. The browser console warns about any line in `data.js` that points to a column that no longer exists.

## Run the page on your computer

1. Open a terminal in this folder.
2. Run `python3 -m http.server 8765`.
3. Open http://localhost:8765 in a browser.

## Publish changes

GitHub Pages publishes the `main` branch from the root folder. Each push to `main` updates the live page in about one minute.
