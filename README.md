# MemoryBench Evaluation Platform

**Live Demo: https://memorybench-leaderboard.vercel.app/**

A sustainable learning evaluation platform built on the MemoryBench paper, featuring ELO scoring mechanism and multi-dimensional data visualization.

## Features Overview

### Home Page

1. **Hero Section**:
   - Title: MemoryBench
   - ICML 2026 SpotLight badge
   - GitHub / HuggingFace / Paper links

2. **Intro Section**:
   - Three tabs: Paper / GitHub / HuggingFace
   - Code display box (terminal-style animation)
   - Fixed height, content stays stable when switching tabs

3. **Leaderboard Preview**:
   - Filters: Base Model / Memory System
   - Star ratings + ELO progress bars

4. **Tags**:
   - 4 categories: Models / Memory / Domain / Task
   - Different colors to distinguish tag types
   - Click a tag to jump to the corresponding filtered view in Leaderboard
   - When returning from Leaderboard, tags will flash/highlight for 2 seconds

5. **Chart Section**:
   - Bar chart displaying model performance

### Page 1 - Leaderboard

1. **Overall Rankings**:
   - Table columns: Rank, Model, Memory, ELO, Cases, Details
   - Model column highlighted in bold
   - ELO values shown with one decimal place (e.g., 1053.9)
   - Dropdown filter menus (Base Model / Memory System) with "Clear All Filters" button
   - Star ratings + ELO progress bars
   - The section will flash/highlight for 2 seconds after tag navigation

2. **Benchmark Rankings**:
   - "Academic & Knowledge" selected by default
   - Independent display, not affected by Overall Rankings filters
   - Switch between different cases to view rankings
   - "← Back to Tags" return button in the top-right corner of each section

3. **Benchmark Performance Heatmaps**:
   - Grouped by Model (Qwen3-8B / Qwen3-32B)
   - Rows are benchmarks, columns are memory systems
   - Color intensity represents score magnitude

4. **Page Styling**:
   - Page width: padding 40px 160px, max width 1600px
   - Heatmaps display horizontally without scrolling, showing all 8 memory systems
   - Responsive design with breakpoints at 1024px / 768px / 480px

### Page 2 - Case Details

1. **Case Header**:
   - Case name, type tags (Domain/Task)
   - Statistics: Samples (number of evaluated samples), Systems (number of systems)

2. **Systems Ranking for This Case**:
   - Fixed-height scrollable list (max height 400px)
   - Full model names displayed (Qwen3-32B / Qwen3-8B)
   - Model names in bold, Memory names secondary

3. **Sample Evaluations**:
   - Title above the filter bar
   - Filters: Memory System, Model, Score (High/Medium/Low), Clear button
   - Paginated display, 10 items per page
   - Page number input for direct navigation

4. **Modal Dialog**:
   - Click any sample to expand details modal
   - Close by pressing ESC or clicking ✕

5. **Page Styling**:
   - Responsive design, adapts to mobile

### Page 3 - System Details

1. **Header**: System name, Model name
2. **Metric Cards**: Overall ELO, Cases Participated, Best Case, Avg Rank
3. **Case List**: Filterable by case, showing ELO and rank for each case

## Project Structure

```
memorybench/
├── src/
│   ├── data/
│   │   ├── eloData.js          # ELO rating data (for leaderboard + heatmaps)
│   │   └── samples/             # Sample data for 7 cases
│   │       ├── domain_Academic_Knowledge.json
│   │       ├── domain_Legal.json
│   │       ├── domain_Open-Domain.json
│   │       ├── task_Long-Long.json
│   │       ├── task_Long-Short.json
│   │       ├── task_Short-Long.json
│   │       └── task_Short-Short.json
│   ├── pages/
│   │   ├── Home.jsx             # Home (Hero + Intro + Leaderboard Preview + Tags)
│   │   ├── Leaderboard.jsx      # Page 1 - Leaderboard
│   │   ├── Cases.jsx            # Case card list
│   │   ├── CaseSamples.jsx      # Page 2 - Sample Details
│   │   └── Detail.jsx           # Page 3 - System Details
│   ├── components/
│   │   └── Layout.jsx           # Layout component
│   └── App.jsx                  # Router configuration
├── public/
├── package.json
├── vite.config.js
└── combine_data.py              # Data processing script
```

## Data Description

| File | Size | Description |
|------|------|-------------|
| `eloData.js` | ~10KB | ELO ratings for 16 systems (overall + 7 case breakdowns) |
| `samples/*.json` | ~53MB | Sample detail data for 7 cases |

**Memory Systems (8 total):**
- A-Mem, BM25-Dialog, BM25-Message, Embedder-Dialog, Embedder-Message, Mem0, MemoryOS, No Memory

**Base Models (2 total):**
- Qwen3-8B, Qwen3-32B

**Cases (7 total):**
- Domain: Academic & Knowledge, Legal, Open-Domain
- Task: Long-Long, Long-Short, Short-Long, Short-Short

## Visual Design

**Color Theme (Gold/Caramel):**
- `--accent-golden`: #c9a962 (golden)
- `--accent-honey`: #d4b896 (honey)
- `--accent-caramel`: #b8860b (caramel)
- `--accent-warm-brown`: #8b7355 (warm brown)
- `--accent-deep`: #5c4a3a (deep brown)

**Typography:**
- IBM Plex Sans (body text)
- IBM Plex Serif (headings)

## Navigation & Interactions

### Tag Navigation
- Models tag → Overall Rankings (filtered by Model)
- Memory Systems tag → Overall Rankings (filtered by Memory)
- Domain Benchmarks tag → Benchmark Rankings (filtered by Benchmark)
- Task Benchmarks tag → Benchmark Rankings (filtered by Benchmark)

### Return Functionality
- "← Back to Tags" button in the top-right corner of each Leaderboard section
- Clicking returns to the Home page Tags section, scrolls to tag location and flashes/highlights for 2 seconds

### Highlight Effects
- Target section flashes/highlights for 2 seconds during navigation (highlight-flash animation)
- Corresponding tags flash/highlight for 2 seconds when returning (tag-highlight animation)

## Data Processing

Use the `combine_data.py` script to integrate raw data:

```bash
python combine_data.py
```

The script reads data from `MemoryBench运行数据/off-policy` and `off-policy-32b`, groups by model, memory, and case, taking up to 50 samples per group.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This is a static site that can be deployed to Vercel, GitHub Pages, and other platforms.

```bash
npm run build
```

The build output is in the `dist/` directory.

## Tech Stack

- React 19
- React Router 7
- Vite 8
- CSS (no framework, pure handwritten styles, responsive design)

## Theme Support

Supports light/dark mode toggle via the sun/moon icon in the top-right corner.