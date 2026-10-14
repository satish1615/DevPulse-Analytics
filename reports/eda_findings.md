# DevPulse Analytics: Exploratory Data Analysis Findings

**Source:** Stack Overflow Developer Survey 2025 official published aggregates  
**Data:** 795 observations from 11 questions across 49 question-segment groups  
**Method:** Tidy CSV, descriptive statistics, Python/Pandas/NumPy validation and SQLite SQL query examples.

## Research question 1: How does daily AI use vary by developer audience?

| Audience | Reports daily AI use | Question base |
|---|---:|---:|
| All respondents | 47.09% | 33,662 |
| Professional developers | 50.62% | 26,004 |
| Learning to code | 39.54% | 2,843 |

Professional developers' reported daily usage is 11.08 percentage points higher than learners'. This is a descriptive comparison of independently reported groups, not evidence that professional experience causes AI use.

## Research question 2: Is favorable sentiment the same as trusting the accuracy of AI output?

| Measure | Share | Question base |
|---|---:|---:|
| Favorable or very favorable sentiment | 59.70% | 33,412 |
| Highly or somewhat trusts accuracy | 32.77% | 33,244 |
| Somewhat or highly distrusts accuracy | 45.71% | 33,244 |

The difference between favorable sentiment and accuracy trust is 26.93 percentage points. The measures come from two questions with different response groups. We cannot assume the same respondents gave both types of answers.

## Research question 3: Which technologies lead, and where does the pattern break?

Among all respondents to the language question, JavaScript has a 66.04% reported-use share and Python has a 57.85% share (n = 31,771).

A notable exception appears when comparing audience subgroups:

| Language | Professional developers | Learning to code |
|---|---:|---:|
| JavaScript | 68.78% | 62.83% |
| Python | 54.84% | 71.76% |

Python has a **16.92 percentage point** higher reported-use share among learners than among professional developers in this survey. Technology questions permit multiple selections, so these percentages are not competing slices of a single total.

## Research question 4: Are AI agents mainstream?

In the AI agent question, 14.13% report using agents at work daily and 8.98% report weekly usage, for a combined **23.11%**, with n = 31,877. This measure represents frequency of reported use, not number of AI applications adopted or productivity outcomes.

## What was tested during EDA?

1. **Compare groups:** professional developers vs. learners on daily AI use.
2. **Break down categories:** developer tools grouped into languages, databases, cloud/infrastructure and AI models.
3. **Re-measure the question:** favorable sentiment vs. accuracy trust, each with its own denominator.
4. **Find exceptions:** Python's higher adoption share among those learning to code.
5. **Validate data:** check missing or invalid percentages, labels, duplicate choices, and response denominators.

## Limitations

This dataset contains official 2025 aggregate counts, not a respondent-level sample. It does not support causal effects, personal cross-tabs, median salary estimates, time series trends, predictive modeling or confidence intervals calculated from independent random sampling assumptions. The Stack Overflow survey is self-selected; results should not be generalized to every developer worldwide.

**Reproduce the SQL analysis:** `python scripts/run_sql_analysis.py` after installing `requirements.txt`. The actual queries are in `analysis/queries.sql`.
