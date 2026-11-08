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
- Change the layout. "Layout: image" uses fixed positions. "Layout: auto (ELK)" uses [elkjs](https://github.com/kieler/elkjs) to place the tables and draw the lines around them.
- Share a link to one table or column, for example `#system.billing.usage.usage_metadata.warehouse_id`.

## Files

| File | What it does |
| --- | --- |
| `data.js` | Holds the tables, columns, lines, scope and key join paths. To change the diagram, edit this file only. |
| `app.js` | Draws the diagram and handles clicks, drags and search. It needs no other library. It loads elkjs from unpkg only when you select the automatic layout. |
| `styles.css` | Sets colours and layout. |
| `index.html` | Holds the page text. |

## Run the page on your computer

1. Open a terminal in this folder.
2. Run `python3 -m http.server 8765`.
3. Open http://localhost:8765 in a browser.

## Publish changes

GitHub Pages publishes the `main` branch from the root folder. Each push to `main` updates the live page in about one minute.
