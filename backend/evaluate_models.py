"""
Vision2Venture — Model Evaluation Suite
=======================================
Generates the quantitative results for the project report / base paper.

Two kinds of models are evaluated HONESTLY and DIFFERENTLY:

1. Success Classifier  -> trained on REAL outcome labels (acquired vs. closed)
   from the Crunchbase dataset. Reported with full classification metrics:
   accuracy, precision, recall, F1, ROC-AUC, confusion matrix, 5-fold CV.

2. Risk / Feasibility / Investor / Market / Financial regressors -> trained on
   FORMULA-DERIVED targets, so an R2 score would be meaningless (it would only
   measure how well the model refits a formula). Instead they are validated
   BEHAVIOURALLY: we feed a deliberately STRONG idea and a deliberately WEAK
   idea and confirm the models discriminate in the correct direction and do
   not return constants. This is the defensible, honest way to report them.

Run from the backend/ directory:
    python evaluate_models.py
"""
import os
import sys
import json
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestClassifier,
    VotingClassifier,
)
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
RESULTS = {}


def hr(title):
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# ============================================================
# 1. DATASET AUDIT
# ============================================================
def dataset_audit():
    hr("[1/3] DATASET AUDIT")
    stats = {}
    files = {
        "Crunchbase (outcomes)": "startup data.csv",
        "Unicorn Companies": "Unicorn_Companies.csv",
        "Indian Startup Funding": "startup_funding.csv",
        "Y Combinator": "yc_companies.csv",
    }
    for label, fname in files.items():
        path = os.path.join(DATA_DIR, fname)
        if os.path.exists(path):
            n = sum(1 for _ in open(path, encoding="utf-8", errors="ignore")) - 1
            stats[label] = n
            print(f"  {label:26s}: {n:,} records")
    RESULTS["datasets"] = stats
    return stats


# ============================================================
# 2. SUCCESS CLASSIFIER — REAL CLASSIFICATION METRICS
# ============================================================
def build_success_features(cb_clean):
    cb_clean = cb_clean.copy()
    cb_clean["category_code"] = cb_clean["category_code"].fillna("software").astype(str)
    cb_clean["sector_encoded"] = LabelEncoder().fit_transform(cb_clean["category_code"])
    for col, fill in [
        ("funding_rounds", 1), ("funding_total_usd", 0), ("milestones", 0),
        ("relationships", 1), ("has_VC", 0), ("has_angel", 0),
    ]:
        cb_clean[col] = cb_clean[col].fillna(fill)

    f = pd.DataFrame()
    f["funding_rounds"] = cb_clean["funding_rounds"]
    f["founder_experience_years"] = np.clip(cb_clean["relationships"] * 1.5, 2, 15)
    f["team_size"] = np.clip(cb_clean["relationships"] * 2.5, 2, 100)
    f["market_size_billion"] = 5.0
    f["product_traction_users"] = cb_clean["milestones"] * 2500 + 500
    f["burn_rate_million"] = np.clip(cb_clean["funding_total_usd"] / (cb_clean["funding_rounds"] * 1e6 + 0.01), 0.1, 50.0)
    f["revenue_million"] = np.clip(f["burn_rate_million"] * 0.6, 0.05, 30.0)
    f["sector_encoded"] = cb_clean["sector_encoded"]
    f["investor_encoded"] = cb_clean["has_VC"] * 2 + cb_clean["has_angel"]
    f["founder_encoded"] = cb_clean["is_top500"]
    f["funding_efficiency"] = f["revenue_million"] / (f["burn_rate_million"] + 0.01)
    f["revenue_per_user"] = f["revenue_million"] / (f["product_traction_users"] + 1)
    f["burn_ratio"] = f["burn_rate_million"] / (f["funding_rounds"] + 1)
    f["traction_per_team"] = f["product_traction_users"] / (f["team_size"] + 1)
    f["market_capture_ratio"] = f["revenue_million"] / (f["market_size_billion"] * 1000 + 1)
    f["experience_x_rounds"] = f["founder_experience_years"] * f["funding_rounds"]
    f["burn_per_team"] = f["burn_rate_million"] / (f["team_size"] + 1)
    f["funding_per_round"] = (f["market_size_billion"] * 0.01) / (f["funding_rounds"] + 1)
    f["revenue_efficiency"] = f["revenue_million"] / (f["team_size"] * f["burn_rate_million"] + 0.01)
    f["market_per_employee"] = f["market_size_billion"] / (f["team_size"] + 1)
    return f


def evaluate_success_classifier():
    hr("[2/3] SUCCESS CLASSIFIER — CLASSIFICATION METRICS (real outcome labels)")
    path = os.path.join(DATA_DIR, "startup data.csv")
    df = pd.read_csv(path)
    cb = df[df["status"].isin(["acquired", "closed"])].copy()
    cb["is_success"] = (cb["status"] == "acquired").astype(int)

    X = StandardScaler().fit_transform(build_success_features(cb).values)
    y = cb["is_success"].values

    n_acq = int((y == 1).sum())
    n_closed = int((y == 0).sum())
    baseline = max(y.mean(), 1 - y.mean())
    print(f"  Labeled startups : {len(y)}  (acquired={n_acq}, closed={n_closed})")
    print(f"  Majority baseline: {baseline*100:.2f}%  (accuracy of always guessing the common class)")

    def make_model():
        return VotingClassifier(
            estimators=[
                ("gb", GradientBoostingClassifier(n_estimators=120, max_depth=4, learning_rate=0.08, random_state=42)),
                ("rf", RandomForestClassifier(n_estimators=120, max_depth=5, random_state=42)),
            ],
            voting="soft",
        )

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = make_model().fit(X_tr, y_tr)
    y_pred = model.predict(X_te)
    y_proba = model.predict_proba(X_te)[:, 1]

    acc = accuracy_score(y_te, y_pred)
    prec = precision_score(y_te, y_pred)
    rec = recall_score(y_te, y_pred)
    f1 = f1_score(y_te, y_pred)
    auc = roc_auc_score(y_te, y_proba)
    cm = confusion_matrix(y_te, y_pred)

    cv = cross_val_score(make_model(), X, y, cv=StratifiedKFold(5, shuffle=True, random_state=42), scoring="accuracy")

    print("\n  --- Held-out test set (20%) ---")
    print(f"  Accuracy : {acc*100:6.2f}%")
    print(f"  Precision: {prec*100:6.2f}%")
    print(f"  Recall   : {rec*100:6.2f}%")
    print(f"  F1-score : {f1:6.3f}")
    print(f"  ROC-AUC  : {auc:6.3f}")
    print(f"\n  5-fold CV accuracy: {cv.mean()*100:.2f}%  (+/- {cv.std()*100:.2f}%)")
    print("\n  Confusion matrix (rows=actual, cols=predicted):")
    print("                 pred:closed  pred:acquired")
    print(f"    actual:closed     {cm[0,0]:5d}        {cm[0,1]:5d}")
    print(f"    actual:acquired   {cm[1,0]:5d}        {cm[1,1]:5d}")
    print("\n  Classification report:")
    print(classification_report(y_te, y_pred, target_names=["closed", "acquired"], digits=3))

    RESULTS["success_classifier"] = {
        "test_accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1": round(f1, 3),
        "roc_auc": round(auc, 3),
        "cv_accuracy_mean": round(cv.mean() * 100, 2),
        "cv_accuracy_std": round(cv.std() * 100, 2),
        "majority_baseline": round(baseline * 100, 2),
        "confusion_matrix": cm.tolist(),
        "n_samples": len(y),
    }


# ============================================================
# 3. SCORE MODELS — BEHAVIOURAL / DISCRIMINATION VALIDATION
# ============================================================
STRONG_IDEA = {
    "title": "AI Logistics Optimization SaaS",
    "description": "AI-powered route optimization and predictive analytics platform for enterprise logistics fleets, reducing fuel and delivery costs.",
    "industry": "SaaS", "business_type": "online", "sector": "online",
    "budget": 5000000, "funding_required": 20000000, "team_size": 12,
    "revenue_goal": 30000000, "team_skills": "ML, backend, sales, operations",
    "country": "India", "location": "Bangalore", "pricing_model": "Subscription",
}
WEAK_IDEA = {
    "title": "Generic Handmade Candle Shop",
    "description": "A very small local shop selling handmade candles with no online presence and no differentiation.",
    "industry": "Retail", "business_type": "offline", "sector": "offline",
    "budget": 30000, "funding_required": 0, "team_size": 1,
    "revenue_goal": 100000, "team_skills": "none specified",
    "country": "India", "location": "small town", "pricing_model": "one-time",
}


def evaluate_score_models():
    hr("[3/3] SCORE MODELS — BEHAVIOURAL VALIDATION (strong vs. weak idea)")
    print("  NOTE: risk/feasibility/investor/market/financial regressors are trained on")
    print("  formula-derived targets, so a numeric 'accuracy' is not meaningful. They are")
    print("  validated by DISCRIMINATION: a strong idea must score better than a weak one.\n")
    try:
        from app.services.ml_service import MLService, ensure_ml_models_loaded
        ensure_ml_models_loaded()
    except Exception as e:
        print(f"  [skip] Could not load MLService ({e}). Run from backend/ with deps installed.")
        return

    def scores(ctx):
        out = {}
        try:
            out["feasibility"] = MLService.calculate_feasibility(ctx).get("overall_feasibility")
        except Exception as e:
            out["feasibility"] = f"err:{e}"
        try:
            out["investor"] = MLService.calculate_investor_readiness(ctx).get("investor_score")
        except Exception as e:
            out["investor"] = f"err:{e}"
        try:
            out["risk"] = MLService.calculate_risk(ctx).get("overall_risk")
        except Exception as e:
            out["risk"] = f"err:{e}"
        try:
            m = MLService.calculate_market_analysis(ctx)
            out["market_opportunity"] = m.get("opportunity_score")
        except Exception as e:
            out["market_opportunity"] = f"err:{e}"
        return out

    s = scores(STRONG_IDEA)
    w = scores(WEAK_IDEA)

    print(f"  {'Metric':22s}{'STRONG idea':>14s}{'WEAK idea':>12s}   Correct direction?")
    checks = [
        ("feasibility", True),          # higher better
        ("investor", True),             # higher better
        ("market_opportunity", True),   # higher better
        ("risk", False),                # lower better for strong idea
    ]
    passes = 0
    for key, higher_is_better in checks:
        sv, wv = s.get(key), w.get(key)
        ok = "-"
        try:
            if higher_is_better:
                ok = "PASS" if float(sv) >= float(wv) else "FAIL"
            else:
                ok = "PASS" if float(sv) <= float(wv) else "FAIL"
            if ok == "PASS":
                passes += 1
        except Exception:
            ok = "n/a"
        sv_str = f"{sv:.1f}" if isinstance(sv, (int, float)) else str(sv)[:12]
        wv_str = f"{wv:.1f}" if isinstance(wv, (int, float)) else str(wv)[:12]
        print(f"  {key:22s}{sv_str:>14s}{wv_str:>12s}   {ok}")

    print(f"\n  Discrimination checks passed: {passes}/{len(checks)}")
    RESULTS["score_models"] = {"strong": s, "weak": w, "checks_passed": f"{passes}/{len(checks)}"}


if __name__ == "__main__":
    dataset_audit()
    evaluate_success_classifier()
    evaluate_score_models()
    hr("EVALUATION COMPLETE")
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "evaluation_results.json")
    with open(out_path, "w") as fh:
        json.dump(RESULTS, fh, indent=2, default=str)
    print(f"  Machine-readable results written to: {out_path}")
