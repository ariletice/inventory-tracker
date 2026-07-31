# StockFlow

StockFlow is an inventory priority dashboard built for food distribution teams—specifically FreshRoute dairy operations. It helps an inventory coordinator like **Alicia** upload a spreadsheet and immediately see which products need action today, which need monitoring, and which are healthy.

I built this as a beginner learning project: a real end-to-end product (upload → validate → prioritize → act) without a backend, so I could focus on product thinking, TypeScript, React, and clear UX.

**Repo:** [github.com/ariletice/inventory-tracker](https://github.com/ariletice/inventory-tracker)  
**Current version:** see [`CHANGELOG.md`](CHANGELOG.md) and `package.json`

---

## Why I built it

Large inventory files are hard to scan. Alicia does not need every row at once—she needs:

- what is expired or out of stock,
- what is low or nearing expiration,
- a clear recommended next step,
- a way to mark alerts as *reviewed* (checked) without pretending the problem is fixed.

StockFlow turns a dairy inventory CSV/XLSX into a prioritized work queue.

---

## Building journey

This project grew in deliberate steps. Each milestone was a real product decision, not just a tutorial exercise.

### 1. MVP upload → dashboard
Started with a Vite + React + TypeScript app: upload a spreadsheet, parse it in the browser with SheetJS, and show inventory on a dashboard.

### 2. Simpler upload flow
Removed an extra confirmation step so a successful upload goes straight to the dashboard—faster for MVP demos.

### 3. Priority table and recommended actions
Replaced simple product cards with a prioritized expandable table, status badges, and recommended actions based on stock and expiration rules.

### 4. Dairy Goods Sales Dataset
Retargeted the data model from SKU-centric fields to dairy columns (`Product ID`, quantity in stock, minimum stock threshold, etc.). Each CSV row is one inventory record with a unique internal `recordId`. The same Product ID may appear on multiple rows (batches).

### 5. Three action sections
Grouped the work queue into:

- **Requires Action Today** — expired, out of stock, low stock  
- **Monitor Closely** — expiring within 14 days or near reorder threshold  
- **No Action Required** — healthy inventory  

Color-coded headers and status icons make urgency scannable.

### 6. Reviewed means “checked,” not “resolved”
Reviewed products stay in their original section with original status badges plus a neutral Reviewed badge. Per-section filters (Unreviewed / All / Reviewed) and pagination keep large files workable.

### 7. Stock level visualization
Added a shared Stock Level cell: quantity vs threshold, with percentage shown inside a progress bar (fill capped at 100%, real % can exceed 100%).

### 8. Visual clarity pass
Tightened hierarchy, summary cards that jump into matching sections, sticky product columns, brand tokens for success/warning/surface colors, and quieter chrome so Alicia can scan faster.

---

## What I learned

- How to parse and validate real spreadsheet data on the client
- How to encode urgency rules in one place and reuse them for badges, sections, and filters
- How UX for operations tools differs from marketing sites (scanability > decoration)
- How Git branches, pull requests, and weekly version tags keep work trackable—especially when local machines and cloud agents both touch the same repo
- How deploy targets (e.g. Netlify) only update when changes land on the branch they watch (usually `main`)

---

## Features today

- Upload CSV/XLSX; validate required dairy columns
- Summary cards for Expired, Out of Stock, Low Stock, Expiring Within 14 Days (click to focus a section)
- Inventory grouped by Requires Action Today / Monitor Closely / No Action Required
- Per-section search, status, brand, and reviewed filters with Clear Filters
- Pagination (10 / 25 / 50 rows)—no “view all” for large files
- Status badges + recommended actions + expandable row details
- Reviewed checkbox with soft row styling (does not move rows out of priority)
- Stock Level bar with in-bar percentage
- Sample template: [`public/sample-inventory-template.csv`](public/sample-inventory-template.csv)

---

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- SheetJS (`xlsx`) for CSV/XLSX import
- lucide-react icons
- Local React Context state (no backend)

---

## Getting started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://127.0.0.1:5173` or `http://localhost:5173`). The app opens on `/upload`.

### User flow

1. `/upload` — select and validate a CSV/XLSX inventory file  
2. `/dashboard` — view Needs Attention summary + prioritized inventory sections  

### Sample template

Download `public/sample-inventory-template.csv` from the upload page.

**Required columns:** Product ID, Product Name, Brand, Quantity in Stock (liters/kg), Minimum Stock Threshold (liters/kg), Reorder Quantity (liters/kg), Production Date, Expiration Date.

**Optional columns:** Shelf Life (days), Quantity Sold (liters/kg), Storage Condition, Location.

Each row is one inventory record (for example, a batch). The same Product ID may appear on more than one row; the app assigns a unique internal `recordId` per row.

---

## Deploy

Production should track **`main`**.

- **Build command:** `npm run build`  
- **Publish directory:** `dist`  
- Config in repo: [`netlify.toml`](netlify.toml)

If a hosted site looks outdated, confirm the latest features have been **merged into `main`**. Work often lands first on a feature branch and PR (see [PR #1](https://github.com/ariletice/inventory-tracker/pull/1)).

---

## Versioning

I version StockFlow **weekly when I merge meaningful work to `main`**.

1. Merge the feature PR into `main`  
2. Bump `version` in `package.json`  
3. Add a section to [`CHANGELOG.md`](CHANGELOG.md)  
4. Create an annotated tag: `git tag -a v0.x.0 -m "…"` and push tags  
5. Confirm Netlify redeployed `main`  

Commit message conventions: [`docs/COMMIT_GUIDE.md`](docs/COMMIT_GUIDE.md).

---

## Project status / next

**MVP limits (honest):**

- State lives in the browser only (refresh clears uploaded data)
- No auth, no multi-user sync, no backend API
- Designed around a dairy / FreshRoute workflow

**Possible next steps:** persist uploads, export reviewed worklists, harden Netlify/GitHub release automation, add screenshots under `docs/screenshots/`.

---

## Screenshots

Add images to `docs/screenshots/` when ready (suggested names):

- `upload.png` — upload page  
- `dashboard-summary.png` — Needs Attention cards  
- `section-requires-action.png` — Requires Action Today  
- `stock-level.png` — Stock Level bar  

Then link them here for portfolio demos.
