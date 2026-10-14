#!/usr/bin/env python3
"""Rebuild the public DevPulse dataset from official Stack Overflow 2025 published survey aggregates.

Dependencies: pandas >= 2.0. Uses only public, question-level aggregated data.
Usage: python scripts/prepare_data.py
"""
import csv
import html
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://raw.githubusercontent.com/StackExchange/Survey/main/packages/archive/2025/json/"
SOURCES = {
    "ai": ["AISelect", "AISent", "AIAcc", "AIAgents", "AIFrustration"],
    "technology": ["Language", "Database", "Platform", "AIModels"],
    "work": ["RemoteWork", "JobSat"],
}
VALID_SEGMENTS = {
    "All Respondents", "Professional Developers", "Learning to Code",
    "Early Career Devs", "Mid Career Devs", "Late Career Devs",
    "USA", "Germany", "India", "UK", "United States", "United Kingdom",
    "Professionals that Use AI", "Learners that Use AI", "Top 10 Countries",
}
COLUMNS = ["question_code", "domain", "segment", "response", "count", "percent", "denominator"]


def download_json(filename: str) -> dict:
    request = Request(BASE + filename + ".json", headers={"User-Agent": "DevPulse-Analytics/1.0"})
    with urlopen(request, timeout=45) as response:
        return json.load(response)


def clean_label(value: object) -> str:
    """Remove formatting artifacts without changing the meaning of a category."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]*>", "", html.unescape(str(value)))).strip()


def prepare() -> dict:
    output = {
        "meta": {
            "title": "DevPulse Analytics",
            "survey": "Stack Overflow Developer Survey 2025",
            "source": "https://github.com/StackExchange/Survey/tree/main/packages/archive/2025/json",
            "year": 2025,
            "license": "ODbL 1.0",
            "basis": "Official, published aggregated survey data. Each question and subgroup has its own response denominator. Percentages represent within-question response shares; multi-select answers can exceed 100% when combined.",
            "processed_at": "2026-10-15",
        },
        "questions": {}
    }
    report = {"source_json_files": list(SOURCES), "questions_requested": 0,
              "groups_selected": 0, "initial_observations": 0,
              "removed_missing_or_invalid": 0, "removed_duplicate_labels": 0}
    records = []

    for domain, questions in SOURCES.items():
        raw = download_json(domain)
        for code in questions:
            report["questions_requested"] += 1
            question = raw[code]
            groups = []
            for group_id, dataset in question.get("datasets", {}).items():
                label = dataset.get("name") or group_id
                if label not in VALID_SEGMENTS:
                    continue
                report["groups_selected"] += 1
                rows = dataset.get("data") or []
                report["initial_observations"] += len(rows)
                frame = pd.DataFrame(rows)
                if not {"response", "frequency", "percent"}.issubset(frame.columns):
                    report["removed_missing_or_invalid"] += len(rows)
                    continue
                frame = frame[["response", "frequency", "percent"]].copy()
                frame["response"] = frame["response"].map(clean_label)
                frame["frequency"] = pd.to_numeric(frame["frequency"], errors="coerce")
                frame["percent"] = pd.to_numeric(frame["percent"], errors="coerce")
                valid = (frame["response"].str.len() > 0) & frame["frequency"].notna() & (
                    frame["percent"].between(0, 1)) & (frame["frequency"] >= 0)
                report["removed_missing_or_invalid"] += int((~valid).sum())
                frame = frame[valid]
                duplicate = frame.duplicated(subset=["response"], keep="first")
                report["removed_duplicate_labels"] += int(duplicate.sum())
                frame = frame[~duplicate]
                clean_rows = []
                for r in frame.itertuples(index=False):
                    percent = round(float(r.percent) * 100, 2)
                    count = int(r.frequency)
                    response = str(r.response)
                    clean_rows.append({"label": response, "count": count, "pct": percent})
                    records.append([code, domain, label, response, count, percent,
                                    int(dataset["total_respondents"])])
                if clean_rows:
                    groups.append({"name": label, "n": dataset["total_respondents"],
                                   "id": group_id, "rows": clean_rows})
            output["questions"][code] = {
                "title": clean_label(question["question"]),
                "category": domain,
                "groups": groups,
            }
    report["clean_observations"] = len(records)
    report["questions_output"] = len(output["questions"])
    if report["clean_observations"] != 795:
        raise ValueError("Expected 795 official published observations. Source may have changed.")
    output["meta"]["total_records"] = report["clean_observations"]
    output["meta"]["dropped_records"] = (
        report["removed_missing_or_invalid"] + report["removed_duplicate_labels"])
    output["meta"]["question_count"] = report["questions_output"]
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "reports").mkdir(exist_ok=True)
    with (ROOT / "data" / "survey_2025.json").open("w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))
    with (ROOT / "data" / "survey_2025_tidy.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(COLUMNS)
        writer.writerows(records)
    with (ROOT / "reports" / "data_quality_report.json").open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    return report


if __name__ == "__main__":
    print(json.dumps(prepare(), indent=2))
