# MemoryBench Platform

**Website: https://memorybench.thuir.cn/**

A sustainable learning evaluation platform built on the MemoryBench paper, featuring ELO scoring mechanism and multi-dimensional data visualization.

## Features Overview

### Home Page

1. **Hero Section**:
   - Title: MemoryBench
   - GitHub / HuggingFace / Paper links

2. **Intro Section**:
   - Three tabs: Paper / GitHub / HuggingFace
   - Code display box (terminal-style animation)
   - Fixed height, content stays stable when switching tabs

3. **Leaderboard Preview**:
   - Filters: Base Model / Memory System
   - Star ratings + ELO progress bars

4. **Tags**:
   - 4 categories: Models / Memory System / Domain / Task
   - Different colors to distinguish tag types
   - Click a tag to jump to the corresponding filtered view in Leaderboard
   - When returning from Leaderboard, tags will flash/highlight for 2 seconds

5. **Chart Section**:
   - Bar chart displaying model performance

### Page 1 - Leaderboard

1. **Overall Rankings**:
   - Table columns: Rank, Model, Memory, ELO, Avg. Tokens/Case, Domains/Tasks, Details
   - Model column highlighted in bold
   - ELO values shown with one decimal place (e.g., 1053.9)
   - Dropdown filter menus (Base Model / Memory System) with "Clear All Filters" button
   - Star ratings + ELO progress bars
   - Sortable columns (ELO, Model, Memory, Tokens)
   - The section will flash/highlight for 2 seconds after tag navigation

2. **Benchmark Rankings**:
   - "Academic & Knowledge" selected by default
   - Independent display, not affected by Overall Rankings filters
   - Switch between different cases to view rankings
   - Sortable columns (ELO, Model, Memory, Tokens, MinMax, Z-Score)
   - "← Back to Tags" return button in the top-right corner of each section

3. **Benchmark Performance Heatmaps**:
   - Grouped by Model (DeepSeek-V4-Flash, Mistral-Small-3.2-24B-Instruct-2506, Qwen3-32B, Qwen3-8B)
   - Rows are benchmarks, columns are memory systems
   - Color intensity represents MinMax normalization score magnitude

4. **Metrics Footnote**:
   - ELO: Elo rating system for relative strength comparison
   - MinMax Normalization: Linear scaling to [0,1] interval
   - Z-Score: Standardized scores with mean 0 and std 1
   - Avg. Tokens/Case: Average total tokens per test case
   - Domains/Tasks: Number of benchmark cases participated

5. **Page Styling**:
   - Page width: padding 40px 160px, max width 1600px
   - Heatmaps display horizontally without scrolling, showing all 8 memory systems
   - Responsive design with breakpoints at 1024px / 768px / 480px

### Page 2 - Case Details

1. **Case List**:
   - Card-based layout with type filters (All / Domains (3) / Tasks (4))
   - Shows case statistics (samples, systems count)
   - Top 4 systems preview with ELO scores

2. **Sample Evaluations**:
   - Title above the filter bar
   - Filters: Memory System, Model, Score (High/Medium/Low), Clear button
   - Paginated display, 10 items per page
   - Page number input for direct navigation

3. **Modal Dialog**:
   - Click any sample to expand details modal
   - Close by pressing ESC or clicking ✕
   - Shows score, metrics (checklist/reasoning/F1), evaluation details, input messages, and model response

4. **Page Styling**:
   - Responsive design, adapts to mobile

### Page 3 - System Details

1. **Header**: System name, Model name
2. **Metric Cards**: Overall ELO, Cases Participated, Best Case, Avg Rank
3. **Case List**: Filterable by case, showing ELO and rank for each case

### Page 4 - Resources

1. **Datasets Section**: 11 public datasets (LoCoMo, DialSim, LexEval, JuDGE, IdeaBench, etc.) with domain, language, task type, metric information
2. **Models Section**: 4 backbone LLMs (DeepSeek-V4-Flash, Mistral-Small-3.2-24B-Instruct-2506, Qwen3-8B, Qwen3-32B)
3. **Memory Systems Section**: No-Memory baseline, RAG systems (BM25-S/M, Embed-S/M), SOTA memory systems (A-Mem, Mem0, MemoryOS)

### Page 5 - Contributors

1. **Core Team**: 12 contributors from Tsinghua University and Quan Cheng Laboratory
2. **Acknowledgments**: Thanks to the open-source community
3. **Contact**: GitHub and Paper links

## Project Structure

```
memorybench/
├── src/                             # React frontend source code
│   ├── data/
│   │   ├── eloData.js              # ELO rating data (for leaderboard + heatmaps)
│   │   ├── summaryAverages.js       # Normalized scores for heatmaps
│   │   ├── tokenData.js             # Token usage statistics
│   │   └── samples/                 # Sample data for 7 cases
│   │       ├── domain_Academic&Knowledge.json
│   │       ├── domain_Legal.json
│   │       ├── domain_Open-Domain.json
│   │       ├── task_Long-Long.json
│   │       ├── task_Long-Short.json
│   │       ├── task_Short-Long.json
│   │       └── task_Short-Short.json
│   ├── pages/
│   │   ├── Home.jsx                 # Home (Hero + Intro + Leaderboard Preview + Tags)
│   │   ├── Leaderboard.jsx          # Page 1 - Leaderboard
│   │   ├── Cases.jsx                # Case card list
│   │   ├── CaseSamples.jsx          # Page 2 - Sample Details
│   │   ├── Detail.jsx               # Page 3 - System Details
│   │   ├── Resources.jsx             # Page 4 - Resources & Documentation
│   │   └── Contributors.jsx         # Page 5 - Contributors
│   ├── components/
│   │   └── Layout.jsx               # Layout component with header navigation
│   ├── context/
│   │   └── ThemeContext.jsx         # Light/dark theme context
│   ├── App.jsx                      # Router configuration
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/                          # Static assets
│   └── favicon.svg
├── scripts/                         # Build/deployment scripts
│   └── extract_scores.cjs
├── data-processing/                 # Data processing Python scripts
│   ├── combine_data.py              # Combine raw data into eloData.js
│   ├── update_data.py               # Update ELO data
│   ├── update_samples.py            # Update sample data
│   └── update_summary.py            # Update summary statistics
├── notebooks/                       # Standalone analysis scripts
│   ├── github.py                    # GitHub page generation
│   ├── huggingface.py               # HuggingFace page generation
│   └── newpage.py                   # New page generation
├── package.json
├── vite.config.js
└── README.md
```

## Data Description

| File | Size | Description |
|------|------|-------------|
| `eloData.js` | ~20KB | ELO ratings for all systems (overall + 7 case breakdowns) |
| `summaryAverages.js` | ~10KB | Normalized scores (MinMax, Z-Score) for heatmaps |
| `tokenData.js` | ~5KB | Token usage statistics per system |
| `samples/*.json` | ~50MB | Sample detail data for 7 cases |

**Memory Systems (11 total):**
- A-Mem, BM25-Dialog, BM25-Message, Embedder-Dialog, Embedder-Message, Mem0, MemoryOS, No Memory (Wo Memory)
- AutoSkill, Uno, Uno-Single (incomplete participation - not shown in overall rankings)

**Base Models (4 total):**
- DeepSeek-V4-Flash, Mistral-Small-3.2-24B-Instruct-2506, Qwen3-32B, Qwen3-8B

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
