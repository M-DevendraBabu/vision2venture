"""
Vision2Venture — Improved ML Training Pipeline v2
=================================================
Key improvements over v1:
  1. ZERO random noise in target variables — all targets derived deterministically from data
  2. Ensemble models: VotingClassifier (Success), StackingRegressor (all regression models)
  3. RandomizedSearchCV hyperparameter tuning for Success model
  4. 20 engineered features (up from 16)
  5. Proper funding_stage derivation from real data (no np.random)
"""

import os
import json
import time
import numpy as np
import pandas as pd
import warnings
from pathlib import Path
from collections import Counter, defaultdict
from sklearn.model_selection import (
    train_test_split, cross_val_score, StratifiedKFold,
    RandomizedSearchCV
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import (
    GradientBoostingClassifier, GradientBoostingRegressor,
    RandomForestClassifier, RandomForestRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor,
    VotingClassifier, StackingRegressor
)
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    r2_score, mean_absolute_error
)
import joblib

warnings.filterwarnings('ignore')

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = (SCRIPT_DIR / "../../data").resolve()
MODEL_DIR = (SCRIPT_DIR / "../ml_models").resolve()

MODEL_DIR.mkdir(parents=True, exist_ok=True)

metrics_summary = {}


def load_data(filename):
    file_path = DATA_DIR / filename
    if not file_path.exists():
        print(f"Warning: {filename} not found at {file_path}.")
        return pd.DataFrame()
    return pd.read_csv(file_path)


def safe_clip(series, lower, upper):
    return series.clip(lower=lower, upper=upper)


# =====================================================================
# 1. SUCCESS PREDICTOR — VotingClassifier + RandomizedSearchCV
# =====================================================================
def train_success_predictor(df):
    print("\n" + "=" * 60)
    print("  Training 1. SUCCESS PREDICTOR (Ensemble + Tuning)")
    print("=" * 60)
    if df.empty:
        return None

    df = df.copy()

    # Target
    success_labels = ['ipo', 'acquired', 'acquisition', 'success', 'operating']
    df['is_success'] = df['outcome'].str.lower().isin(success_labels).astype(int)

    # Label Encoders
    sector_enc = LabelEncoder()
    investor_enc = LabelEncoder()
    founder_enc = LabelEncoder()

    df['sector_encoded'] = sector_enc.fit_transform(df['sector'].astype(str))
    df['investor_encoded'] = investor_enc.fit_transform(df['investor_type'].astype(str))
    df['founder_encoded'] = founder_enc.fit_transform(df['founder_background'].astype(str))

    # Original 10 features + 10 engineered = 20 features
    df['funding_efficiency'] = df['revenue_million'] / (df['burn_rate_million'] + 0.01)
    df['revenue_per_user'] = df['revenue_million'] / (df['product_traction_users'] + 1)
    df['burn_ratio'] = df['burn_rate_million'] / (df['funding_rounds'] + 1)
    df['traction_per_team'] = df['product_traction_users'] / (df['team_size'] + 1)
    df['market_capture_ratio'] = df['revenue_million'] / (df['market_size_billion'] * 1000 + 1)
    df['experience_x_rounds'] = df['founder_experience_years'] * df['funding_rounds']
    # NEW features
    df['burn_per_team'] = df['burn_rate_million'] / (df['team_size'] + 1)
    df['funding_per_round'] = (df['market_size_billion'] * 0.01) / (df['funding_rounds'] + 1)
    df['revenue_efficiency'] = df['revenue_million'] / (df['team_size'] * df['burn_rate_million'] + 0.01)
    df['market_per_employee'] = df['market_size_billion'] / (df['team_size'] + 1)

    features = [
        'funding_rounds', 'founder_experience_years', 'team_size', 'market_size_billion',
        'product_traction_users', 'burn_rate_million', 'revenue_million',
        'sector_encoded', 'investor_encoded', 'founder_encoded',
        'funding_efficiency', 'revenue_per_user', 'burn_ratio',
        'traction_per_team', 'market_capture_ratio', 'experience_x_rounds',
        'burn_per_team', 'funding_per_round', 'revenue_efficiency', 'market_per_employee'
    ]

    X = df[features].replace([np.inf, -np.inf], np.nan).fillna(0)
    y = df['is_success']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, stratify=y, random_state=42
    )

    # --- Hyperparameter Search for GBM ---
    print("  Running RandomizedSearchCV (30 iterations, 3-fold)...")
    gbm_params = {
        'n_estimators': [200, 300, 400, 500],
        'max_depth': [4, 5, 6, 7],
        'learning_rate': [0.05, 0.08, 0.1, 0.12],
        'min_samples_leaf': [10, 15, 20, 30],
        'subsample': [0.8, 0.85, 0.9],
        'max_features': ['sqrt', 'log2', 0.7],
    }
    gbm_search = RandomizedSearchCV(
        GradientBoostingClassifier(random_state=42),
        gbm_params, n_iter=30, cv=3, scoring='accuracy',
        random_state=42, n_jobs=-1, verbose=0
    )
    gbm_search.fit(X_train, y_train)
    best_gbm = gbm_search.best_estimator_
    print(f"  Best GBM params: {gbm_search.best_params_}")
    print(f"  Best GBM CV accuracy: {gbm_search.best_score_:.4f}")

    # --- Ensemble: VotingClassifier ---
    rf = RandomForestClassifier(
        n_estimators=400, max_depth=7, min_samples_leaf=10,
        max_features='sqrt', random_state=42, n_jobs=-1
    )
    et = ExtraTreesClassifier(
        n_estimators=400, max_depth=7, min_samples_leaf=10,
        max_features='sqrt', random_state=42, n_jobs=-1
    )

    print("  Training VotingClassifier (GBM + RF + ExtraTrees)...")
    ensemble = VotingClassifier(
        estimators=[('gbm', best_gbm), ('rf', rf), ('et', et)],
        voting='soft',
        weights=[3, 2, 1]  # GBM gets highest weight
    )
    ensemble.fit(X_train, y_train)
    y_pred = ensemble.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    # Cross-validation on full data
    print("  Running 5-fold cross validation on ensemble...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(ensemble, X_scaled, y, cv=cv, scoring='accuracy')

    print(f"  CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    print(f"  Test Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")
    metrics_summary['Success Predictor'] = f"Accuracy: {acc:.4f}, F1: {f1:.4f}"

    # Feature importance from best GBM
    importances = best_gbm.feature_importances_
    indices = np.argsort(importances)[::-1]
    print("  Top 10 Features:")
    for i in range(min(10, len(features))):
        print(f"    {features[indices[i]]}: {importances[indices[i]]:.4f}")

    joblib.dump(ensemble, MODEL_DIR / 'success_model.joblib')
    joblib.dump(sector_enc, MODEL_DIR / 'sector_encoder.joblib')
    joblib.dump(investor_enc, MODEL_DIR / 'investor_encoder.joblib')
    joblib.dump(founder_enc, MODEL_DIR / 'founder_encoder.joblib')
    joblib.dump(scaler, MODEL_DIR / 'feature_scaler.joblib')

    metadata = {"feature_cols": features, "categories": {"sector": list(sector_enc.classes_)}}
    with open(MODEL_DIR / 'feature_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    return df, X_scaled, features


# =====================================================================
# HELPER: Build a StackingRegressor ensemble
# =====================================================================
def _build_stacking_regressor(n_estimators=200, max_depth=5):
    """Build a StackingRegressor with GBM + RF + ExtraTrees base, Ridge meta."""
    gbm = GradientBoostingRegressor(
        n_estimators=n_estimators, max_depth=max_depth,
        learning_rate=0.1, min_samples_leaf=15, subsample=0.85,
        random_state=42
    )
    rf = RandomForestRegressor(
        n_estimators=n_estimators, max_depth=max_depth + 1,
        min_samples_leaf=10, max_features='sqrt',
        random_state=42, n_jobs=-1
    )
    et = ExtraTreesRegressor(
        n_estimators=n_estimators, max_depth=max_depth + 1,
        min_samples_leaf=10, max_features='sqrt',
        random_state=42, n_jobs=-1
    )
    return StackingRegressor(
        estimators=[('gbm', gbm), ('rf', rf), ('et', et)],
        final_estimator=Ridge(alpha=1.0),
        cv=3, n_jobs=-1
    )


# =====================================================================
# 2. MARKET ANALYSIS MODEL — StackingRegressor, cleaner targets
# =====================================================================
def prepare_combined_market_data(global_df, val_df):
    if global_df.empty or val_df.empty:
        return pd.DataFrame()

    g_df = pd.DataFrame({
        'industry': global_df.get('Industry', ''),
        'country': global_df.get('Country', ''),
        'team_size': global_df.get('Number of Employees', 0),
        'funding': global_df.get('Total Funding ($M)', 0),
        'revenue': global_df.get('Annual Revenue ($M)', 0),
        'founded_year': global_df.get('Founded Year', 2010),
        'valuation': global_df.get('Valuation ($B)', 0) * 1000,  # to M
        'success_score': global_df.get('Success Score', 50),
        'customers': global_df.get('Customer Base (Millions)', 0),
        'funding_stage': global_df.get('Funding Stage', 'Series A'),
    })

    v_df = pd.DataFrame({
        'industry': val_df.get('industry', ''),
        'country': val_df.get('country', ''),
        'team_size': val_df.get('employee_count', 0),
        'funding': val_df.get('funding_amount_usd', 0) / 1e6,
        'revenue': val_df.get('estimated_revenue_usd', 0) / 1e6,
        'founded_year': val_df.get('founded_year', 2010),
        'valuation': val_df.get('estimated_valuation_usd', 0) / 1e6,
        # DETERMINISTIC success_score instead of random
        'success_score': safe_clip(
            (val_df.get('estimated_revenue_usd', 0) / (val_df.get('funding_amount_usd', 1) + 1)) * 50 +
            (val_df.get('employee_count', 0) / (val_df.get('employee_count', 0).max() + 1)) * 30 +
            val_df.get('exited', 0).astype(int) * 20,
            10, 90
        ),
        'customers': (val_df.get('estimated_revenue_usd', 0) / 1e6) / (val_df.get('employee_count', 1) + 1),
        'funding_stage': val_df.get('funding_round', 'Series A'),
    })

    combined = pd.concat([g_df, v_df], ignore_index=True)
    combined = combined.replace([np.inf, -np.inf], np.nan).fillna(0)
    return combined


def train_market_model(combined_df):
    print("\n" + "=" * 60)
    print("  Training 2. MARKET ANALYSIS MODEL (StackingRegressor)")
    print("=" * 60)
    if combined_df.empty:
        return

    ind_enc = LabelEncoder()
    ctry_enc = LabelEncoder()

    combined_df['industry_encoded'] = ind_enc.fit_transform(combined_df['industry'].astype(str))
    combined_df['country_encoded'] = ctry_enc.fit_transform(combined_df['country'].astype(str))

    # Deterministic targets (NO random)
    combined_df['opp_rank'] = combined_df.groupby('industry')['valuation'].rank(pct=True) * 100
    combined_df['opportunity_score'] = np.where(
        combined_df['success_score'] > 0,
        combined_df['success_score'] * 0.6 + combined_df['opp_rank'] * 0.4,
        combined_df['opp_rank']
    )
    combined_df['opportunity_score'] = safe_clip(combined_df['opportunity_score'], 10, 95)

    combined_df['growth_rate'] = safe_clip(
        (combined_df['valuation'] / (combined_df['funding'] + 1)) * 5, 5, 35
    )

    combined_df['demand_score'] = safe_clip(
        combined_df['customers'] * 10 + combined_df['revenue'] * 0.5, 0, 100
    )

    # Additional engineered features
    combined_df['funding_per_employee'] = combined_df['funding'] / (combined_df['team_size'] + 1)
    combined_df['revenue_per_employee'] = combined_df['revenue'] / (combined_df['team_size'] + 1)
    combined_df['company_age'] = 2024 - combined_df['founded_year'].clip(lower=1990, upper=2024)

    features = [
        'industry_encoded', 'country_encoded', 'team_size', 'funding',
        'revenue', 'founded_year', 'funding_per_employee', 'revenue_per_employee', 'company_age'
    ]
    targets = ['opportunity_score', 'growth_rate', 'demand_score']

    X = combined_df[features].values
    y = combined_df[targets].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # StackingRegressor for each target
    stacker = _build_stacking_regressor(n_estimators=150, max_depth=5)
    model = MultiOutputRegressor(stacker)

    print("  Training StackingRegressor ensemble...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"  R2 Score: {r2:.4f}, MAE: {mae:.4f}")

    # Per-target R2
    for i, tname in enumerate(targets):
        r2_i = r2_score(y_test[:, i], y_pred[:, i])
        print(f"    {tname}: R2={r2_i:.4f}")

    metrics_summary['Market Analysis Model'] = f"R2: {r2:.4f}"

    joblib.dump(model, MODEL_DIR / 'market_model.joblib')
    joblib.dump(scaler, MODEL_DIR / 'market_scaler.joblib')
    joblib.dump(ind_enc, MODEL_DIR / 'market_industry_encoder.joblib')
    joblib.dump(ctry_enc, MODEL_DIR / 'market_country_encoder.joblib')


# =====================================================================
# 3. FINANCIAL PROJECTIONS MODEL — StackingRegressor, cleaner targets
# =====================================================================
def train_financial_model(combined_df):
    print("\n" + "=" * 60)
    print("  Training 3. FINANCIAL PROJECTIONS MODEL (StackingRegressor)")
    print("=" * 60)
    if combined_df.empty:
        return

    ind_enc = LabelEncoder()

    combined_df['industry_encoded'] = ind_enc.fit_transform(combined_df['industry'].astype(str))

    # DETERMINISTIC funding_stage instead of random
    stage_map = {
        'seed': 0, 'pre-seed': 0, 'angel': 0,
        'series a': 1, 'series_a': 1, 'a': 1,
        'series b': 2, 'series_b': 2, 'b': 2,
        'series c': 3, 'series_c': 3, 'c': 3,
        'series d': 4, 'series_d': 4, 'd': 4, 'ipo': 5
    }
    combined_df['funding_stage_encoded'] = combined_df['funding_stage'].astype(str).str.lower().map(stage_map).fillna(1).astype(int)

    # Additional features
    combined_df['funding_per_employee'] = combined_df['funding'] / (combined_df['team_size'] + 1)
    combined_df['revenue_per_employee'] = combined_df['revenue'] / (combined_df['team_size'] + 1)

    # Deterministic targets (NO random)
    combined_df['revenue_ratio'] = combined_df['revenue'] / (combined_df['funding'] + 1)
    combined_df['cost_ratio'] = safe_clip(
        (combined_df['revenue'] - combined_df['valuation'] * 0.1) / (combined_df['revenue'] + 1),
        -1, 1
    )
    combined_df['roi_score'] = safe_clip(
        combined_df['valuation'] / (combined_df['funding'] + 1) * 10, 0, 300
    )
    combined_df['profit_margin'] = safe_clip(
        (combined_df['revenue'] - combined_df['revenue'] * 0.6) / (combined_df['revenue'] + 1) * 100, 5, 85
    )
    combined_df['break_even_months'] = safe_clip(
        24 - (combined_df['success_score'] * 0.2), 3, 36
    )

    features = [
        'industry_encoded', 'funding_stage_encoded', 'team_size', 'funding',
        'funding_per_employee', 'revenue_per_employee'
    ]
    targets = ['revenue_ratio', 'cost_ratio', 'roi_score', 'profit_margin', 'break_even_months']

    X = combined_df[features].replace([np.inf, -np.inf], np.nan).fillna(0).values
    y = combined_df[targets].replace([np.inf, -np.inf], np.nan).fillna(0).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    stacker = _build_stacking_regressor(n_estimators=150, max_depth=5)
    model = MultiOutputRegressor(stacker)

    print("  Training StackingRegressor ensemble...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"  R2 Score: {r2:.4f}, MAE: {mae:.4f}")

    for i, tname in enumerate(targets):
        r2_i = r2_score(y_test[:, i], y_pred[:, i])
        print(f"    {tname}: R2={r2_i:.4f}")

    metrics_summary['Financial Model'] = f"R2: {r2:.4f}"

    joblib.dump(model, MODEL_DIR / 'financial_model.joblib')
    joblib.dump(scaler, MODEL_DIR / 'financial_scaler.joblib')
    joblib.dump(ind_enc, MODEL_DIR / 'fin_industry_encoder.joblib')

    benchmarks = combined_df.groupby('industry')[['funding', 'revenue', 'valuation']].median().to_dict('index')
    with open(MODEL_DIR / 'financial_benchmarks.json', 'w') as f:
        json.dump(benchmarks, f, indent=2)


# =====================================================================
# 4, 5, 6. DERIVED MODELS — Risk, Feasibility, Investor (NO RANDOM NOISE)
# =====================================================================
def train_derived_models(df, X_scaled, features):
    if df.empty:
        return

    # ----- 4. RISK ANALYSIS MODEL (ZERO noise) -----
    print("\n" + "=" * 60)
    print("  Training 4. RISK ANALYSIS MODEL (StackingRegressor, NO noise)")
    print("=" * 60)

    # Normalize helper columns deterministically
    df['funding_eff_norm'] = safe_clip(
        df['funding_efficiency'] / (df['funding_efficiency'].quantile(0.95) + 0.01), 0, 1
    )
    df['market_size_norm'] = safe_clip(
        df['market_size_billion'] / (df['market_size_billion'].quantile(0.95) + 0.01), 0, 1
    )
    df['rev_per_user_norm'] = safe_clip(
        df['revenue_per_user'] / (df['revenue_per_user'].quantile(0.95) + 0.01), 0, 1
    )
    df['burn_revenue_ratio'] = safe_clip(
        df['burn_rate_million'] / (df['revenue_million'] + 0.01), 0, 5
    )

    # DETERMINISTIC risk targets (zero np.random)
    df['technical_risk'] = safe_clip(
        (1 - df['funding_eff_norm']) * 0.4 +
        (1 - df['rev_per_user_norm']) * 0.3 +
        (df['burn_per_team'] / (df['burn_per_team'].quantile(0.95) + 0.01)) * 0.3,
        0.05, 0.95
    )
    df['market_risk'] = safe_clip(
        df['burn_revenue_ratio'] / 5 * 0.5 +
        (1 - df['market_size_norm']) * 0.3 +
        (1 - df['traction_per_team'] / (df['traction_per_team'].quantile(0.95) + 0.01)).clip(0, 1) * 0.2,
        0.05, 0.95
    )
    df['competition_risk'] = safe_clip(
        df['market_size_norm'] * 0.5 +
        (1 - df['rev_per_user_norm']) * 0.3 +
        (1 - df['funding_eff_norm']) * 0.2,
        0.05, 0.95
    )
    df['financial_risk'] = safe_clip(
        df['burn_revenue_ratio'] / 5 * 0.6 +
        (1 - df['funding_eff_norm']) * 0.4,
        0.05, 0.95
    )
    df['operational_risk'] = safe_clip(
        (df['team_size'] / (df['team_size'].quantile(0.95) + 1)) * 0.4 +
        (df['burn_per_team'] / (df['burn_per_team'].quantile(0.95) + 0.01)) * 0.3 +
        (1 - df['market_per_employee'] / (df['market_per_employee'].quantile(0.95) + 0.01)).clip(0, 1) * 0.3,
        0.05, 0.95
    )

    y_risk = df[['technical_risk', 'market_risk', 'competition_risk', 'financial_risk', 'operational_risk']].values
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_risk, test_size=0.2, random_state=42)

    stacker = _build_stacking_regressor(n_estimators=150, max_depth=5)
    model_risk = MultiOutputRegressor(stacker)

    print("  Training StackingRegressor ensemble...")
    model_risk.fit(X_train, y_train)
    y_pred = model_risk.predict(X_test)
    r2_risk = r2_score(y_test, y_pred)
    print(f"  R2 Score: {r2_risk:.4f}")

    risk_targets = ['technical_risk', 'market_risk', 'competition_risk', 'financial_risk', 'operational_risk']
    for i, tname in enumerate(risk_targets):
        r2_i = r2_score(y_test[:, i], y_pred[:, i])
        print(f"    {tname}: R2={r2_i:.4f}")

    metrics_summary['Risk Analysis Model'] = f"R2: {r2_risk:.4f}"
    joblib.dump(model_risk, MODEL_DIR / 'risk_model.joblib')

    # ----- 5. FEASIBILITY MODEL (ZERO noise) -----
    print("\n" + "=" * 60)
    print("  Training 5. FEASIBILITY MODEL (StackingRegressor, NO noise)")
    print("=" * 60)

    df['market_feasibility'] = safe_clip(
        df['market_size_norm'] * 0.4 +
        (df['traction_per_team'] / (df['traction_per_team'].quantile(0.95) + 0.01)).clip(0, 1) * 0.3 +
        df['rev_per_user_norm'] * 0.3,
        0.1, 0.95
    )
    df['technical_feasibility'] = safe_clip(1.0 - df['technical_risk'], 0.1, 0.95)
    df['financial_feasibility'] = safe_clip(
        df['funding_eff_norm'] * 0.5 +
        (df['revenue_million'] / (df['burn_rate_million'] + 0.1)).clip(0, 5) / 5 * 0.5,
        0.1, 0.95
    )
    # DETERMINISTIC innovation_score (no random)
    df['innovation_score'] = safe_clip(
        df['funding_eff_norm'] * 0.3 +
        df['market_capture_ratio'].clip(0, 1) * 0.3 +
        (df['experience_x_rounds'] / (df['experience_x_rounds'].quantile(0.95) + 0.01)).clip(0, 1) * 0.2 +
        df['market_size_norm'] * 0.2,
        0.1, 0.95
    )

    y_feas = df[['market_feasibility', 'technical_feasibility', 'financial_feasibility', 'innovation_score']].values
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_feas, test_size=0.2, random_state=42)

    stacker = _build_stacking_regressor(n_estimators=150, max_depth=5)
    model_feas = MultiOutputRegressor(stacker)

    print("  Training StackingRegressor ensemble...")
    model_feas.fit(X_train, y_train)
    y_pred = model_feas.predict(X_test)
    r2_feas = r2_score(y_test, y_pred)
    print(f"  R2 Score: {r2_feas:.4f}")

    feas_targets = ['market_feasibility', 'technical_feasibility', 'financial_feasibility', 'innovation_score']
    for i, tname in enumerate(feas_targets):
        r2_i = r2_score(y_test[:, i], y_pred[:, i])
        print(f"    {tname}: R2={r2_i:.4f}")

    metrics_summary['Feasibility Model'] = f"R2: {r2_feas:.4f}"
    joblib.dump(model_feas, MODEL_DIR / 'feasibility_model.joblib')

    # ----- 6. INVESTOR READINESS MODEL (ZERO noise) -----
    print("\n" + "=" * 60)
    print("  Training 6. INVESTOR READINESS MODEL (StackingRegressor)")
    print("=" * 60)

    df['scalability'] = safe_clip(
        (df['product_traction_users'] / (df['product_traction_users'].quantile(0.95) + 1)) * 0.5 +
        df['market_size_norm'] * 0.3 +
        df['funding_eff_norm'] * 0.2,
        0.1, 0.95
    )
    df['innovation'] = df['innovation_score']
    df['business_model_strength'] = safe_clip(
        df['funding_eff_norm'] * 0.4 +
        (df['funding_rounds'] / 5).clip(0, 1) * 0.3 +
        df['rev_per_user_norm'] * 0.3,
        0.1, 0.95
    )
    df['market_appeal'] = safe_clip(
        df['market_size_norm'] * 0.4 +
        df['is_success'] * 0.3 +
        (df['revenue_efficiency'] / (df['revenue_efficiency'].quantile(0.95) + 0.01)).clip(0, 1) * 0.3,
        0.2, 0.95
    )

    y_inv = df[['scalability', 'innovation', 'business_model_strength', 'market_appeal']].values
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_inv, test_size=0.2, random_state=42)

    stacker = _build_stacking_regressor(n_estimators=150, max_depth=5)
    model_inv = MultiOutputRegressor(stacker)

    print("  Training StackingRegressor ensemble...")
    model_inv.fit(X_train, y_train)
    y_pred = model_inv.predict(X_test)
    r2_inv = r2_score(y_test, y_pred)
    print(f"  R2 Score: {r2_inv:.4f}")

    inv_targets = ['scalability', 'innovation', 'business_model_strength', 'market_appeal']
    for i, tname in enumerate(inv_targets):
        r2_i = r2_score(y_test[:, i], y_pred[:, i])
        print(f"    {tname}: R2={r2_i:.4f}")

    metrics_summary['Investor Readiness Model'] = f"R2: {r2_inv:.4f}"
    joblib.dump(model_inv, MODEL_DIR / 'investor_model.joblib')


# =====================================================================
# 7. TECH STACK RECOMMENDER
# =====================================================================
def train_tech_stack_recommender(global_df):
    print("\n" + "=" * 60)
    print("  Training 7. TECH STACK RECOMMENDER")
    print("=" * 60)
    if global_df.empty or 'Tech Stack' not in global_df.columns:
        print("  Required columns missing. Skipping.")
        return

    categories = {
        'frontend': ['react', 'angular', 'vue', 'vue.js', 'next.js', 'flutter', 'swift', 'kotlin'],
        'backend': ['node.js', 'django', 'flask', 'fastapi', 'spring', 'express', 'rails', 'go', 'rust'],
        'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'firebase'],
        'cloud': ['aws', 'azure', 'gcp', 'digitalocean', 'heroku'],
        'ai_framework': ['tensorflow', 'pytorch', 'keras', 'scikit-learn', 'openai'],
        'deployment': ['docker', 'kubernetes', 'vercel', 'netlify', 'jenkins']
    }

    industry_stacks = defaultdict(lambda: {k: Counter() for k in categories})

    for _, row in global_df.iterrows():
        ind = str(row.get('Industry', 'Unknown'))
        techs = str(row.get('Tech Stack', '')).lower().split(',')
        for t in techs:
            t = t.strip()
            for cat, words in categories.items():
                if any(w in t for w in words):
                    industry_stacks[ind][cat][t] += 1

    final_recs = {}
    for ind, cats in industry_stacks.items():
        final_recs[ind] = {}
        for cat, counter in cats.items():
            top = [item[0] for item in counter.most_common(3)]
            final_recs[ind][cat] = top if top else ["Not specified"]
        final_recs[ind]['reasoning'] = f"Based on analysis of {len(global_df[global_df['Industry'] == ind])} startups in {ind}."

    with open(MODEL_DIR / 'tech_stack_model.json', 'w') as f:
        json.dump(final_recs, f, indent=2)

    print(f"  Saved tech stack recommendations for {len(final_recs)} industries.")
    metrics_summary['Tech Stack Recommender'] = "JSON Generated"


# =====================================================================
# AUXILIARY JSON FILES
# =====================================================================
def generate_aux_json(val_df, yc_df, global_df, survey_df):
    print("\n" + "=" * 60)
    print("  Generating Auxiliary JSON Files")
    print("=" * 60)

    # --- Industry Benchmarks from valuation dataset ---
    if not val_df.empty:
        benchmarks = {}
        for ind, group in val_df.groupby('industry'):
            ind_clean = str(ind).lower().strip()
            benchmarks[ind_clean] = {
                "avg_funding": float(group['funding_amount_usd'].median() or 500000),
                "avg_revenue": float(group['estimated_revenue_usd'].median() or 200000),
                "avg_valuation": float(group['estimated_valuation_usd'].median() or 2000000),
                "avg_team_size": int(group['employee_count'].median() or 10),
                "sample_count": int(len(group))
            }
        with open(MODEL_DIR / 'industry_benchmarks.json', 'w') as f:
            json.dump(benchmarks, f, indent=2)
        print(f"  Saved industry_benchmarks.json ({len(benchmarks)} industries)")

    # --- YC Competitors (FULL) ---
    if not yc_df.empty:
        yc_database = []
        for _, row in yc_df.iterrows():
            yc_database.append({
                "name": str(row.get('name') or ''),
                "website": str(row.get('website') or ''),
                "one_liner": str(row.get('one_liner') or row.get('long_description') or '')[:200],
                "industry": str(row.get('industry') or '').lower(),
                "tags": str(row.get('tags') or '').lower(),
                "team_size": str(row.get('team_size') or 'N/A'),
                "batch": str(row.get('batch') or '')
            })
        with open(MODEL_DIR / 'yc_competitors.json', 'w', encoding='utf-8') as f:
            json.dump(yc_database, f, indent=2)
        print(f"  Saved yc_competitors.json ({len(yc_database)} startups)")

    # --- Market Benchmarks from global dataset ---
    if not global_df.empty:
        market_benchmarks = {}
        financial_templates = {}
        for ind, group in global_df.groupby('Industry'):
            ind_clean = str(ind).lower().strip()
            val_med = float(group['Valuation ($B)'].median()) if 'Valuation ($B)' in group else 1.0
            rev_med = float(group['Annual Revenue ($M)'].median()) if 'Annual Revenue ($M)' in group else 1.0
            market_benchmarks[ind_clean] = {
                "market_size_estimate": val_med * 10,
                "growth_rate_estimate": min(0.4, val_med * 0.05),
                "demand_level": "High" if val_med > 1 else "Medium",
                "primary_demographics": ["B2B", "Enterprise"] if "tech" in ind_clean else ["Consumers", "B2C"],
                "pain_points": [f"Inefficiency in {ind_clean}", "High costs"],
                "acquisition_channels": ["Digital Ads", "Content Marketing", "Direct Sales"]
            }
            financial_templates[ind_clean] = {
                "mrr_estimate": (rev_med * 1000000) / 12,
                "cac_estimate": val_med * 100,
                "ltv_estimate": val_med * 1000,
                "churn_estimate": 0.05,
                "roi_estimate": 2.5,
                "break_even_months": 24 if val_med > 1 else 12
            }
        with open(MODEL_DIR / 'market_benchmarks.json', 'w') as f:
            json.dump(market_benchmarks, f, indent=2)
        with open(MODEL_DIR / 'financial_templates.json', 'w') as f:
            json.dump(financial_templates, f, indent=2)
        print(f"  Saved market_benchmarks.json ({len(market_benchmarks)} industries)")
        print(f"  Saved financial_templates.json ({len(financial_templates)} industries)")

    # --- Stack Overflow Tech Survey Benchmarks ---
    if not survey_df.empty:
        try:
            webframes = Counter()
            databases = Counter()
            platforms = Counter()
            languages = Counter()
            for _, row in survey_df.iterrows():
                if pd.notna(row.get('WebframeWorkedWith')):
                    for w in str(row['WebframeWorkedWith']).split(';'):
                        webframes[w.strip()] += 1
                if pd.notna(row.get('DatabaseWorkedWith')):
                    for d in str(row['DatabaseWorkedWith']).split(';'):
                        databases[d.strip()] += 1
                if pd.notna(row.get('PlatformWorkedWith')):
                    for p in str(row['PlatformWorkedWith']).split(';'):
                        platforms[p.strip()] += 1
                if pd.notna(row.get('LanguageWorkedWith')):
                    for lg in str(row['LanguageWorkedWith']).split(';'):
                        languages[lg.strip()] += 1
            so_benchmarks = {
                "top_web_frameworks": webframes.most_common(10),
                "top_databases": databases.most_common(10),
                "top_platforms": platforms.most_common(10),
                "top_languages": languages.most_common(10)
            }
            with open(MODEL_DIR / 'tech_survey_benchmarks.json', 'w') as f:
                json.dump(so_benchmarks, f, indent=2)
            print(f"  Saved tech_survey_benchmarks.json ({len(survey_df):,} developer responses)")
        except Exception as e:
            print(f"  Notice parsing survey: {e}")

    print("  Auxiliary JSON files generated successfully.")


# =====================================================================
# MAIN ENTRY POINT
# =====================================================================
def train_all_models():
    start_time = time.time()
    print("=" * 60)
    print("   VISION2VENTURE — ML PIPELINE v2 (ACCURACY IMPROVED)")
    print("   Ensemble Models + Zero Random Noise + Hyperparameter Tuning")
    print("=" * 60)

    # Load Data
    success_df = load_data('startup_success_dataset.csv')
    global_df = load_data('global_startup_success_dataset.csv')
    val_df = load_data('startup_valuation_dataset.csv')
    yc_df = load_data('yc_companies.csv')
    try:
        survey_df = pd.read_csv(
            DATA_DIR / 'survey_results_public.csv', low_memory=False,
            usecols=['WebframeWorkedWith', 'DatabaseWorkedWith', 'PlatformWorkedWith', 'LanguageWorkedWith']
        )
    except Exception:
        survey_df = pd.DataFrame()

    # 1. Success Predictor (Ensemble + Tuning)
    res = train_success_predictor(success_df)
    if res:
        processed_success_df, success_X_scaled, success_features = res
    else:
        processed_success_df = pd.DataFrame()

    # 2 & 3. Market & Financial (StackingRegressor)
    combined_market = prepare_combined_market_data(global_df, val_df)
    train_market_model(combined_market)
    train_financial_model(combined_market)

    # 4, 5, 6. Risk, Feasibility, Investor (StackingRegressor, NO noise)
    if res:
        train_derived_models(processed_success_df, success_X_scaled, success_features)

    # 7. Tech Stack
    train_tech_stack_recommender(global_df)

    # Aux JSON
    generate_aux_json(val_df, yc_df, global_df, survey_df)

    end_time = time.time()

    print("\n" + "=" * 60)
    print("   FINAL SUMMARY")
    print("=" * 60)
    for model, metric in metrics_summary.items():
        print(f"  {model:<30} | {metric}")
    print(f"\n  Total Training Time: {(end_time - start_time) / 60:.2f} minutes")
    print("=" * 60)


if __name__ == '__main__':
    train_all_models()
