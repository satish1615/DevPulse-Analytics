-- DevPulse Analytics: reproducible SQL EDA (SQLite compatible).
-- Load data/survey_2025_tidy.csv into a table named observations with columns:
-- question_code TEXT, domain TEXT, segment TEXT, response TEXT,
-- count INTEGER, percent REAL, denominator INTEGER.
-- Percent values are already in 0-100 units, not fractions.
-- Published aggregate results are not individual-level records.

-- 1. AI tool usage by audience.
SELECT segment, count AS respondents, denominator, ROUND(percent, 2) AS daily_ai_pct
FROM observations
WHERE question_code = 'AISelect'
  AND response = 'Yes, I use AI tools daily'
  AND segment IN ('All Respondents','Professional Developers','Learning to Code')
ORDER BY daily_ai_pct DESC;

-- 2. Favorability and accuracy trust are different questions with different bases.
SELECT question_code, segment, ROUND(SUM(percent), 2) AS combined_pct,
       SUM(count) AS responses_in_categories, MAX(denominator) AS question_base
FROM observations
WHERE segment = 'All Respondents'
  AND (
    (question_code = 'AISent' AND response IN ('Very favorable','Favorable'))
    OR
    (question_code = 'AIAcc' AND response IN ('Highly trust','Somewhat trust'))
  )
GROUP BY question_code, segment;

-- 3. Top five technologies in each category by response share.
WITH ranked AS (
  SELECT question_code, response, percent, denominator,
         ROW_NUMBER() OVER (PARTITION BY question_code ORDER BY percent DESC) AS place
  FROM observations
  WHERE segment = 'All Respondents'
    AND question_code IN ('Language','Database','Platform','AIModels')
)
SELECT question_code, place, response, percent, denominator
FROM ranked WHERE place <= 5
ORDER BY question_code, place;

-- 4. Check varying denominators across questions.
SELECT question_code, MAX(denominator) AS all_respondents_base,
       COUNT(*) AS choices_published
FROM observations
WHERE segment = 'All Respondents'
GROUP BY question_code
ORDER BY all_respondents_base DESC;

-- 5. Find the biggest professional vs learner technology percentage gaps.
SELECT p.response AS technology,
       ROUND(p.percent, 2) AS professional_pct,
       ROUND(l.percent, 2) AS learner_pct,
       ROUND(p.percent - l.percent, 2) AS professional_minus_learner_points
FROM observations p
JOIN observations l
  ON p.question_code = l.question_code AND p.response = l.response
WHERE p.question_code = 'Language'
  AND p.segment = 'Professional Developers'
  AND l.segment = 'Learning to Code'
ORDER BY ABS(p.percent - l.percent) DESC
LIMIT 12;
