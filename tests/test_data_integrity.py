"""Offline validation of the checked-in, officially sourced data snapshot."""
import csv
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SurveyIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dataset = json.loads((ROOT / "data" / "survey_2025.json").read_text(encoding="utf-8"))
        with (ROOT / "data" / "survey_2025_tidy.csv").open(encoding="utf-8", newline="") as f:
            cls.csv_rows = list(csv.DictReader(f))

    def test_record_count_and_question_count(self):
        self.assertEqual(self.dataset["meta"]["total_records"], 795)
        self.assertEqual(self.dataset["meta"]["question_count"], 11)
        self.assertEqual(len(self.csv_rows), 795)

    def test_all_observations_have_valid_types(self):
        count = 0
        for code, q in self.dataset["questions"].items():
            self.assertTrue(q["groups"], code)
            for group in q["groups"]:
                self.assertGreater(group["n"], 0)
                unique = set()
                for row in group["rows"]:
                    self.assertIsInstance(row["label"], str)
                    self.assertTrue(row["label"].strip())
                    self.assertNotIn(row["label"], unique)
                    unique.add(row["label"])
                    self.assertIsInstance(row["count"], int)
                    self.assertGreaterEqual(row["count"], 0)
                    self.assertGreaterEqual(row["pct"], 0)
                    self.assertLessEqual(row["pct"], 100)
                    self.assertLessEqual(row["count"], group["n"])
                    count += 1
        self.assertEqual(count, 795)

    def test_tidy_csv_matches_json_counts(self):
        indexed = {(r["question_code"], r["segment"], r["response"]): r for r in self.csv_rows}
        for code,q in self.dataset["questions"].items():
            for group in q["groups"]:
                for r in group["rows"]:
                    record=indexed[(code,group["name"],r["label"])]
                    self.assertEqual(int(record["count"]),r["count"])
                    self.assertAlmostEqual(float(record["percent"]),r["pct"],places=2)
                    self.assertEqual(int(record["denominator"]),group["n"])

    def test_known_source_values(self):
        q=self.dataset["questions"]
        all_ai=next(g for g in q["AISelect"]["groups"] if g["name"]=="All Respondents")
        self.assertEqual(all_ai["n"],33662)
        self.assertEqual(all_ai["rows"][0]["count"],15850)
        self.assertEqual(all_ai["rows"][0]["pct"],47.09)
        tech=next(g for g in q["Language"]["groups"] if g["name"]=="All Respondents")
        javascript=next(r for r in tech["rows"] if r["label"]=="JavaScript")
        self.assertEqual(javascript["count"],20982)


if __name__=="__main__":
    unittest.main()
