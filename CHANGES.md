# Changes Made — Vision2Venture Improvement Pass

This document lists every change applied on top of the original repository, grouped
by the five improvements agreed for the B.Tech final-year project. All Python files
compile cleanly and the new code was smoke-tested.

---

## #1 — Model evaluation suite (NEW)

**Files added:**
- `backend/evaluate_models.py` — full evaluation script.
- `docs/EVALUATION_RESULTS.md` — report-ready results (tables + interpretation).

**What it does:** measures the success classifier honestly (accuracy, precision,
recall, F1, ROC-AUC, confusion matrix, 5-fold CV) and validates the score models
behaviourally (strong idea must outscore a weak idea). Writes `evaluation_results.json`.

**Verified results (run on the real datasets/models in this repo):**
- Success classifier: **77.30% test accuracy**, 5-fold CV **75.95% (±3.32%)**,
  precision 79.55%, recall 87.50%, F1 **0.833**, ROC-AUC **0.840** (baseline 64.68%).
- Score models: **4/4 discrimination checks passed** (strong idea scored higher on
  feasibility/investor/market, lower on risk).

---

## #2 — Caching + reproducibility

**File added:**
- `backend/app/services/cache_service.py` — a dependency-free `disk_cache` decorator
  that caches **only genuinely successful** real-data fetches to disk, keyed by
  arguments, and fails open (never breaks the pipeline).

**Files modified (added one decorator line each):**
- `backend/app/services/google_trends_service.py` — cache successful Trends (24h TTL).
- `backend/app/services/world_bank_service.py` — cache live-verified indicators (7d TTL).
- `backend/app/services/news_service.py` — cache non-empty news (12h TTL).
- `backend/app/services/wikipedia_service.py` — cache found company profiles (7d TTL).
- `backend/app/services/ai_service.py` — LLM sampling **temperature 0.7 → 0.3** for
  more reproducible structured output.

**Effect:** once real Google Trends/World Bank/News/Wikipedia data is fetched, it is
reused, so repeated analyses of the same idea are consistent and external APIs are hit
less often. Fallback/blocked responses are deliberately *not* cached, so a later run can
still obtain real data. Cache lives in `backend/app/.cache/` (gitignored, safe to delete).

---

## #3 — Honest provenance (reduce overclaiming)

**Files modified:**
- `README.md` — corrected the AI stack description (was "Google Gemini"; the code uses
  **Groq/NVIDIA Qwen LLMs** with template fallback), documented the free real-data APIs,
  fixed the env-var/prerequisite sections (GROQ/NVIDIA keys, not Gemini), and added an
  explicit note that market/financial figures for a new idea are estimates.
- `backend/app/routers/analysis.py` — added an additive `estimate_note` field to the
  `/market` and `/financial` API responses stating those figures are AI/benchmark
  estimates, not measured data. (Additive only — no existing field changed.)

---

## #4 — Runnable, documented tests

**Files added:**
- `backend/run_all_tests.py` — runs every `test_*.py` as a subprocess and prints a
  PASS/FAIL summary (exit 0 = all passed); CI-friendly. `-v` also prints output.
- `docs/TESTING.md` — documents every test script, the evaluation suite, and the
  model audit, plus a note about the Windows-only `open('NUL')` line in
  `test_financial.py` (use `/dev/null` on Linux/macOS).

---

## #5 — Limitations & Future Work

**File added:**
- `docs/LIMITATIONS_AND_FUTURE_WORK.md` — a candid, report-ready section: the four
  output categories (real / AI-grounded / benchmark / model score), honest limitations
  (idea-stage estimates, class imbalance, API fragility, LLM variability), and concrete
  future-work items.

---

## Files NOT touched
Core analysis logic, ML models, datasets, database schema, and the frontend components
were left unchanged except for the additive `estimate_note` fields and README text. No
existing behaviour was removed.

## How to apply
Copy these files over your repository (or replace the folder), then commit and push.
New/changed files:
```
CHANGES.md                                    (new)
.gitignore                                    (modified — ignores cache)
README.md                                     (modified)
docs/EVALUATION_RESULTS.md                    (new)
docs/LIMITATIONS_AND_FUTURE_WORK.md           (new)
docs/TESTING.md                               (new)
backend/evaluate_models.py                    (new)
backend/run_all_tests.py                      (new)
backend/app/services/cache_service.py         (new)
backend/app/services/google_trends_service.py (modified)
backend/app/services/world_bank_service.py    (modified)
backend/app/services/news_service.py          (modified)
backend/app/services/wikipedia_service.py     (modified)
backend/app/services/ai_service.py            (modified)
backend/app/routers/analysis.py               (modified)
```
