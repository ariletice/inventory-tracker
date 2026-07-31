# Changelog

All notable changes to StockFlow are documented here.

Format inspired by [Keep a Changelog](https://keepachangelog.com/).  
Versioning follows [Semantic Versioning](https://semver.org/) for this portfolio MVP (`MAJOR.MINOR.PATCH`).

I aim to cut a new version **weekly** when work is merged to `main`.

## [Unreleased]

<!-- Add next week’s work here before bumping to 0.2.0 -->

## [0.1.0] - 2026-07-31

First tagged portfolio release of the current StockFlow MVP (feature branch work ready to merge to `main`).

### Added
- Dairy Goods Sales Dataset upload model (`productId`, `recordId` per row; duplicate Product IDs allowed)
- Needs Attention Today summary cards with click-to-focus section behavior
- Three inventory sections: Requires Action Today, Monitor Closely, No Action Required
- Color-coded section headers with status icons
- Per-section search, status, brand, and reviewed filters with Clear Filters
- True pagination (10 / 25 / 50) and results count
- Reviewed badge + soft row styling (reviewed = checked, not resolved)
- Stock Level progress bar with percentage inside the fill
- Brand tokens for success, warning, and surface muted colors
- Sample dairy CSV template and Netlify build config

### Changed
- Replaced SKU-centric template/docs with Product ID dairy columns
- Visual clarity pass: hierarchy, sticky product columns, quieter summary cards

### Docs
- Building-journey README for portfolio storytelling
- Commit guide and weekly versioning ritual

## How to release next week

1. Move items from **Unreleased** into a new `## [0.2.0] - YYYY-MM-DD` section  
2. Set `"version": "0.2.0"` in `package.json`  
3. Commit: `chore: release v0.2.0`  
4. Tag: `git tag -a v0.2.0 -m "StockFlow v0.2.0"` and `git push origin v0.2.0`  
