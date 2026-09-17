# Testing & Evaluation Guide

All commands are run from the `backend/` directory with dependencies installed
(`pip install -r requirements.txt`).

## 1. Run the full validation suite

```bash
python run_all_tests.py        # runs every test_*.py, reports PASS/FAIL
python run_all_tests.py -v     # also prints each script's output
```

`run_all_tests.py` executes each validation script as a subprocess and prints a
pass/fail summary (exit code 0 = all passed), making the suite CI-friendly.

## 2. What each test covers

| Script | Purpose |
|---|---|
| `test_ml_validation.py` | Runs all 7 ML models across 5 diverse startup scenarios |
| `test_financial.py` | Financial projections (MRR, CAC, LTV, ROI) across sectors |
| `test_production.py` | End-to-end pipeline on a sample idea |
| `test_ml_migration.py` | ML feature-vector / model compatibility |
| `test_batch_validation.py`, `test_large_scale_batch.py` | Batch runs across many ideas |
| `test_cases_validation.py` | Assorted correctness cases |
| `test_competitor_*.py` | Competitor discovery & tab output audits |

## 3. Quantitative model evaluation (for the report)

```bash
python evaluate_models.py
```

Produces classification metrics for the success classifier (accuracy, precision,
recall, F1, ROC-AUC, confusion matrix, 5-fold CV) and behavioural-discrimination
results for the score models, and writes `evaluation_results.json`. See
`docs/EVALUATION_RESULTS.md` for the interpreted results table.

## 4. Model audit

```bash
python audit_model.py     # verifies all models & datasets load correctly
```

## Note on portability

`test_financial.py` contains a Windows-specific `open('NUL', 'w')` line for
silencing stderr. On Linux/macOS replace `'NUL'` with `'/dev/null'` (or delete
the line) if you run that script directly. `run_all_tests.py` runs each script in
isolation, so a single failing script does not stop the others.
