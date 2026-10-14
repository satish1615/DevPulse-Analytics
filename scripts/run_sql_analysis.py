#!/usr/bin/env python3
"""Offline SQL exploratory analysis with Pandas, NumPy, SQLite and public survey aggregates."""
from pathlib import Path
import sqlite3

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def main():
    source = ROOT / "data" / "survey_2025_tidy.csv"
    frame = pd.read_csv(source)
    expected = {"question_code", "domain", "segment", "response",
                "count", "percent", "denominator"}
    if not expected.issubset(frame.columns):
        raise ValueError("Expected survey fields are missing.")
    for column in ("count", "percent", "denominator"):
        frame[column] = pd.to_numeric(frame[column], errors="raise")
        if not np.isfinite(frame[column]).all():
            raise ValueError(f"Invalid numeric observations in {column}")
    if frame.duplicated(subset=["question_code","segment","response"]).any():
        raise ValueError("Repeated response labels found within a survey question group.")
    if not frame["percent"].between(0,100).all():
        raise ValueError("Percentage outside the expected range.")
    print(f"PROFILE: {len(frame):,} observations, "
          f"{frame['question_code'].nunique()} questions, "
          f"{frame[['question_code','segment']].drop_duplicates().shape[0]} question-segment groups")

    with sqlite3.connect(":memory:") as conn:
        frame.to_sql("observations", conn, index=False, if_exists="replace")
        statements = (ROOT / "analysis" / "queries.sql").read_text(encoding="utf-8").split(";")
        number = 0
        for sql in statements:
            if not sql.strip() or not any(token in sql.upper() for token in ("SELECT", "WITH")):
                continue
            # sqlite3 executes leading comment lines together with the following statement.
            try:
                result = pd.read_sql_query(sql, conn)
            except Exception as exc:
                raise RuntimeError(f"SQL query {number + 1} failed") from exc
            number += 1
            print(f"\nQUERY {number}\n{result.to_string(index=False)}")
        if number != 5:
            raise ValueError(f"Expected 5 complete SQL analyses, got {number}")


if __name__ == "__main__":
    main()
