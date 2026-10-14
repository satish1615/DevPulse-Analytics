# DevPulse Analytics

### Interactive Developer Workforce, AI Adoption & Technology Trends Dashboard

**Live dashboard:** https://satish1615.github.io/DevPulse-Analytics/  
**GitHub source:** https://github.com/satish1615/DevPulse-Analytics  
**Data source:** [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/)

DevPulse Analytics is a free, mobile-friendly **Data Analysis and Business Intelligence** project exploring how software developers use AI, how their confidence compares with their sentiment, how AI agents are adopted, and which languages, databases, cloud platforms, and AI models are most widely used. Every reported data point comes from Stack Overflow's publicly published 2025 survey aggregates.

## Research questions

1. How frequently do people working in software development use AI tools?
2. Does favorable sentiment toward AI correspond to trust in AI accuracy?
3. Which programming languages, databases, cloud services, and AI models lead in reported adoption?
4. How prevalent is daily or weekly AI agent usage?

## What the dashboard provides

- **Four interactive Plotly charts:** AI tool usage frequency, AI sentiment vs. reported trust in accuracy, technology rankings, and AI agent adoption.
- **Dynamic KPIs:** daily AI usage, positive reported AI accuracy trust, active AI agent usage, and most-used technology in the selected category.
- **Audience filtering:** all respondents, professional developers, and learners (where official subgroup counts are available).
- **Technology filtering:** languages, databases, infrastructure platforms, and AI models.
- **CSV export:** download the current view with denominators and counts included.
- **Responsive design:** desktop, tablet and mobile; interactive hover detail and reusable URL query parameters.
- **Reproducible ETL:** Python and Pandas script, data profiling/quality report, tidy analytical CSV and offline unit tests.
- **GitHub Actions deployment:** the pipeline validates data and publishes the static site to GitHub Pages.

## Findings from the official 2025 aggregate data

| Indicator | Finding | Question base |
|---|---:|---:|
| Uses AI tools daily | **47.09%** | n = 33,662 |
| Favorable or very favorable toward AI tools | **59.70%** | n = 33,412 |
| Highly or somewhat trusts AI accuracy | **32.77%** | n = 33,244 |
| Uses AI agents at work daily or weekly | **23.11%** | n = 31,877 |
| Uses JavaScript | **66.04%** | n = 31,771 |

The positive-attitude versus accuracy-trust gap is **26.93 percentage points** when comparing those aggregate questions. These are separate respondent bases, so the gap does **not** measure changes within the same person. Multi-select technology percentages should not be added together.

## Dataset and cleaning

The checked-in dataset contains **795 validated aggregate observations** from **49 published question-segment groups** across **11 questions**. It is real data, rather than synthetic data or anonymized person-level responses.

The raw official source is a set of nested JSON files in the [Stack Exchange Survey GitHub archive](https://github.com/StackExchange/Survey/tree/main/packages/archive/2025/json).

The preparation process:

1. Profiles the nested source dataset and identifies the questions, subgroup names, record counts, and response formats.
2. Selects 11 relevant questions about AI, technologies and work.
3. Strips presentation-only HTML in category text and normalizes whitespace.
4. Validates response frequencies, percentages and denominators. Excludes nonnumeric/invalid records if any appear.
5. Removes duplicate response labels within each question/segment.
6. Converts published percentage fractions to percentage points.
7. Writes a browser-ready JSON dataset and a tidy CSV including original response counts and denominators.
8. Writes a data-quality report showing what was checked, cleaned and excluded.

The published snapshot required **no removal of invalid or duplicate selected aggregate records**. Cleaning primarily normalizes text, nested structure, percentages, and types. We deliberately do not discard legitimate unknown or unreported data categories without a reason.

### Reproduce the data transformation

With Python 3.10+ and Internet access:

```bash
python -m pip install -r requirements.txt
python scripts/prepare_data.py
python -m unittest discover -s tests -v
```

The script downloads the three official published aggregate JSON source files and rewrites the checked-in analytical data. It intentionally does not require private data or API keys.

## Tech stack

| Layer | Tools and techniques |
|---|---|
| Data collection | Official public Stack Overflow survey archive, JSON |
| Transformation & analysis | Python, Pandas, CSV, JSON, data validation, EDA |
| Front end | Semantic HTML5, CSS3, vanilla JavaScript |
| Interactive visualization | Plotly.js, responsive charts, custom hover detail |
| BI / analytics | Filtering, KPIs, subgroup comparisons, percentages, denominator-aware reporting |
| Quality and CI/CD | Python unittest, GitHub Actions |
| Hosting | GitHub Pages |

## Project structure

```text
DevPulse-Analytics/
├── .github/workflows/deploy.yml
├── app.js
├── styles.css
├── index.html
├── data/
│   ├── survey_2025.json
│   └── survey_2025_tidy.csv
├── reports/
│   └── data_quality_report.json
├── scripts/
│   └── prepare_data.py
├── tests/
│   └── test_data_integrity.py
├── requirements.txt
└── README.md
```

## Run locally

Because the browser uses `fetch()`, serve the root folder over HTTP instead of double-clicking `index.html`:

```bash
python -m http.server 8000
```

Visit http://localhost:8000/. Plotly.js and the web fonts load from public CDNs, so the dashboard needs an Internet connection.

## GitHub Pages

This public repository uses the **GitHub Actions** Pages source. Every push to `main` runs offline dataset integrity checks and then publishes the static files. Check the **Actions** tab for the most recent deployment and visit:

https://satish1615.github.io/DevPulse-Analytics/

## Responsible interpretation

- All results are from **2025**. This dashboard contains one survey year and therefore does not claim longitudinal growth or year-over-year changes.
- Respondents are self-selected. This is descriptive analysis, not a representative global developer census.
- Different questions have different bases; published subgroup sizes also vary.
- The source is aggregate-only. The dashboard does not infer individual-level cross-tabulations or causal relationships.
- Multi-select technology answers can exceed 100% when added together. Some published trust answer choices may not total 100%, so these values are not renormalized.
- Public data is adapted with attribution under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Any redistribution of the adapted data should preserve ODbL obligations.

## About

Built by **Satish Singh** as a reproducible Data Analytics, Business Intelligence, Data Visualization and Software Engineering portfolio project.

**Topics:** data-analysis, data-analytics, business-intelligence, data-visualization, python, pandas, exploratory-data-analysis, interactive-dashboard, plotly, javascript, ai-adoption, data-cleaning, developer-survey, github-actions, github-pages.
