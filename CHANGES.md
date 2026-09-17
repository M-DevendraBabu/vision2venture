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

---

# Analysis Accuracy Pass

A second pass audited the analysis pipeline by running diverse new ideas through it and
measuring what each score actually responded to. Nine defects were found and fixed.

## Scores were measuring the wrong things

1. **Dead categorical encoder.** `_safe_encode` matched exactly, but every caller
   lower-cased its input while the trained vocabularies are capitalised. Measured miss
   rate: **100%** — even `'india'` failed against `'India'`. Misses fell back to class 0,
   which in the unicorn-derived vocabulary is the stray investor string
   `'500 Global, Rakuten Ventures, Golden Gate Ventures'`. The market and financial
   models received the same category for every startup. Now resolved case-insensitively
   with an alias table, longest-alias-wins, falling back to `Other`.

2. **Growth rate was a constant.** Trained on `12.0 + company_age * 0.8` while inference
   hardcodes `company_age = 4`, so it emitted ~16.4% for every idea in every sector
   (measured spread across 9 industries: **0.0**). Replaced with an indicative sector
   CAGR benchmark blended with live Google Trends demand and damped for single-location
   physical ventures. Spread is now **18.0** points.

3. **Market opportunity was a budget proxy.** Measured **0.0** spread across industries
   and **28.2** across budgets, floored at 65 so nothing could score poorly. Rebuilt as an
   explicit composite — demand 30%, sector growth 25%, market scale 20%, capital 25% —
   with scale normalised within the venture's own scope so a strong local business is not
   punished for being local.

4. **The founder's revenue goal was ignored everywhere.** It moved every score by 0.0 and
   never reached the financial projection: a ₹12 lakh target and a ₹3 crore target produced
   an identical year-one figure. The projection stays benchmark-derived (an aspiration is
   not evidence), but the gap is now computed and stated — `goal_attainment_percent` and a
   plain-language `goal_assessment`.

5. **Runway was invisible.** Budget and team size were read in isolation, so the models
   could not see that ₹5,00,000 is comfortable for a solo founder and nearly nothing for a
   team of twelve. `_venture_economics` now derives monthly burn, runway and an ambition
   ratio, feeding risk, feasibility and investor readiness.

6. **Dead regressor heads were flattening every score.** Several heads emit a literal
   constant (risk-competition, feasibility-financial, feasibility-innovation and
   investor-market all measured 0.0 spread across five very different ventures), so a 70%
   ML weight compressed everything toward a fixed point. Rebalanced to 50/50.

## Output claimed things that were not true

7. **Fabricated statistics presented as verified.** Competitor star ratings, review counts
   and "N% Positive Feedback" figures were synthesised from `hash(name)` in four places —
   and YC matches described them as *"Rated 4.5★ across 673 verified user reviews"*. All
   removed; ratings are reported as unavailable, because none of the competitor sources
   actually expose them.

8. **LLM-invented businesses labelled as verified.** `discover_local_businesses` is pure
   LLM recall with no lookup behind it, and its prompt explicitly asked the model to supply
   "realistic" ratings and addresses. The results were then given `verified: True`,
   `evidence_status: 'source_verified'`, confidence 90, `"Live Local Directory Data"`, and
   **coordinates derived from `hash(name)`** — putting fabricated pins on the competitor
   map. They are now `verified: False`, `llm_inferred`, confidence 40, carry no
   coordinates or distance, are not auto-selected, render with an orange "Unverified"
   badge, are consulted only when real sources find fewer than three competitors, and are
   suppressed entirely during a provider outage.

9. **An outage was reported as a finding.** When the mapping providers were unreachable the
   app told the founder they had *"zero direct local competition"*. It now says the data is
   temporarily unavailable and that this is explicitly not a finding of zero competition.
   The status line also no longer counts unverified suggestions as "verified competitors".

Two internal-consistency bugs were fixed alongside: online opex double-counted utilities
(the raw-materials slot fell back to `utility_cost`, which is already its own line, so the
breakdown exceeded its own total and percentages passed 100%), and revenue streams rounded
independently could drift from `monthly_revenue`.

## Regression coverage

`backend/test_analysis_accuracy.py` — **57 checks**, no network or database, one test per
defect above. Three pre-existing competitor tests were also repaired: they were asserting a
`evidence_status` vocabulary the code had moved away from, and their zero-fabrication
assertions now check the principle (nothing unverified may claim verification, carry
coordinates or carry ratings) rather than a raw row count.
