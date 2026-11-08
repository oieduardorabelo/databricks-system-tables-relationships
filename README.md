# Databricks System Tables Relationships

An interactive entity relationship diagram of the Databricks system tables. It shows primary keys, foreign keys, join paths, account vs region scope, and query best practices.

## Features

- Pan, zoom and fit the diagram. Drag tables to move them. The browser saves your layout.
- Click a table, a column or a line. The side panel shows the related joins with SQL that you can copy.
- Search tables and columns. Show or hide schemas.
- Link to a table or column with a URL hash, for example `#system.billing.usage.usage_metadata.warehouse_id`.

## Files

| File | Purpose |
| --- | --- |
| `data.js` | Tables, columns, relationships, scope and key join paths. Edit this file to change the diagram. |
| `app.js` | Draws the SVG and handles interaction. It has no dependencies. |
| `styles.css` | Styles. |
| `index.html` | Page content. |

## Run locally

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Publish on GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)`.
