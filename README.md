# StockFlow

Inventory priority dashboard for food distribution companies. Know what needs attention first.

Extracts key product data from spreadsheets and highlights items that are low in stock or nearing expiration.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- SheetJS (`xlsx`) for CSV/XLSX import
- lucide-react icons

## Getting started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Features

- Sample FreshRoute dairy inventory loaded on first visit
- Upload CSV or XLSX to replace inventory data
- Rule-based priority lists: **Needs Attention Today** and **Next in Queue**
- Summary cards, sorting, product detail drawer, and responsive layouts

## Sample template

Download `public/sample-inventory-template.csv` from the upload modal, or open it directly from the public folder.
