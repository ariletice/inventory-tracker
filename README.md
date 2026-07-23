# StockFlow

Inventory priority dashboard for food distribution companies. Know what needs attention first.

Extracts key product data from spreadsheets and highlights items that are low in stock or nearing expiration.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- SheetJS (`xlsx`) for CSV/XLSX import
- lucide-react icons

## Getting started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`). The app opens on `/upload`.

## User flow

1. `/upload` — select and validate a CSV/XLSX inventory file
2. `/dashboard` — view priority lists after a successful upload

The app opens on `/upload`. There is no separate verification step.

## Sample template

Download `public/sample-inventory-template.csv` from the upload page. Required columns: SKU, Product Name, Brand, Category, Storage Conditions, Quantity on Hand, Reorder Threshold, Reorder Quantity, Sales Rate, Expiration Date.
