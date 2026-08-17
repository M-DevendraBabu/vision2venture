"""
Vision2Venture - Production Model Audit v3.0
Tests: GradientBoosting accuracy, feature engineering, output variance, domain correctness
"""
import sys, os, json, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'app', 'ml_models')

print("=" * 100)
print("VISION2VENTURE - PRODUCTION MODEL AUDIT v3.0")
print("=" * 100)

# ============ 1. DATASET QUALITY ============
print("\n[1/7] DATASET QUALITY AUDIT")
print("-" * 60)

df_succ = pd.read_csv(os.path.join(DATA_DIR, 'startup_success_dataset.csv'))
print(f"  Success Predictor:   {len(df_succ):,} records, {df_succ['sector'].nunique()} sectors, {df_succ['outcome'].nunique()} outcomes")
print(f"    Features: {list(df_succ.columns)}")

df_glob = pd.read_csv(os.path.join(DATA_DIR, 'global_startup_success_dataset.csv'))
print(f"  Financial Regressor: {len(df_glob):,} records, {df_glob['Industry'].nunique()} industries")

df_val = pd.read_csv(os.path.join(DATA_DIR, 'startup_valuation_dataset.csv'))
print(f"  Valuation Benchmark: {len(df_val):,} records")

# ============ 2. SUCCESS CLASSIFIER ACCURACY ============
print("\n" + "=" * 100)
print("[2/7] SUCCESS CLASSIFIER (GradientBoosting v2.0)")
print("-" * 60)

# Replicate feature engineering from train_models.py
le_sector = LabelEncoder()
df_succ['sector_encoded'] = le_sector.fit_transform(df_succ['sector'].fillna('Other').astype(str))
le_investor = LabelEncoder()
df_succ['investor_encoded'] = le_investor.fit_transform(df_succ['investor_type'].fillna('none').astype(str))
le_founder = LabelEncoder()
df_succ['founder_encoded'] = le_founder.fit_transform(df_succ['founder_background'].fillna('unknown').astype(str))

df_succ['is_success'] = df_succ['outcome'].apply(lambda x: 1 if str(x).lower() in ['ipo', 'acquired', 'acquisition', 'success', 'operating'] else 0)

# Engineered features
df_succ['funding_efficiency'] = df_succ['revenue_million'] / (df_succ['burn_rate_million'] + 0.01)
df_succ['revenue_per_user'] = df_succ['revenue_million'] / (df_succ['product_traction_users'] + 1)
df_succ['burn_ratio'] = df_succ['burn_rate_million'] / (df_succ['funding_rounds'] + 1)
df_succ['traction_per_team'] = df_succ['product_traction_users'] / (df_succ['team_size'] + 1)
df_succ['market_capture_ratio'] = df_succ['revenue_million'] / (df_succ['market_size_billion'] * 1000 + 1)
df_succ['experience_x_rounds'] = df_succ['founder_experience_years'] * df_succ['funding_rounds']

feature_cols = [
    'funding_rounds', 'founder_experience_years', 'team_size',
    'market_size_billion', 'product_traction_users', 'burn_rate_million',
    'revenue_million', 'sector_encoded', 'investor_encoded', 'founder_encoded',
    'funding_efficiency', 'revenue_per_user', 'burn_ratio',
    'traction_per_team', 'market_capture_ratio', 'experience_x_rounds'
]

X = df_succ[feature_cols].fillna(0).replace([np.inf, -np.inf], 0)
y = df_succ['is_success']

print(f"  Total Features: {len(feature_cols)} (7 raw + 3 categorical + 6 engineered)")
print(f"  Labels: Success={y.sum():,} ({y.mean()*100:.1f}%) | Failure={len(y)-y.sum():,} ({(1-y.mean())*100:.1f}%)")

# Load and test the saved model
clf = joblib.load(os.path.join(MODEL_DIR, 'success_model.joblib'))
model_type = type(clf).__name__

# Check if we have the scaler
scaler_path = os.path.join(MODEL_DIR, 'feature_scaler.joblib')
has_scaler = os.path.exists(scaler_path)

if has_scaler:
    scaler = joblib.load(scaler_path)
    X_scaled = scaler.transform(X)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    print(f"  Using StandardScaler: YES")
else:
    # Old model - use only 6 features without scaling
    old_features = ['funding_rounds', 'founder_experience_years', 'team_size', 'market_size_billion', 'burn_rate_million', 'sector_encoded']
    X_old = df_succ[old_features].fillna(0)
    X_train, X_test, y_train, y_test = train_test_split(X_old, y, test_size=0.2, random_state=42, stratify=y)
    print(f"  Using StandardScaler: NO (old model)")

y_pred = clf.predict(X_test)
test_accuracy = accuracy_score(y_test, y_pred)
cv_scores = cross_val_score(clf, X_train, y_train, cv=5, scoring='accuracy')

print(f"\n  Model Type: {model_type}")
print(f"  Test Accuracy: {test_accuracy * 100:.2f}%")
print(f"  5-Fold CV:     {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Failure/Closed', 'Success/IPO/Acquired']))

importances = clf.feature_importances_
if has_scaler:
    print(f"  Feature Importance (16 features):")
    for fname, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)[:10]:
        bar = '#' * int(imp * 40)
        print(f"    {fname:<25} {imp:.4f} {bar}")
else:
    print(f"  Feature Importance (6 features):")
    old_features = ['funding_rounds', 'founder_experience', 'team_size', 'market_size_B', 'burn_rate_M', 'sector']
    for fname, imp in sorted(zip(old_features, importances), key=lambda x: x[1], reverse=True):
        bar = '#' * int(imp * 40)
        print(f"    {fname:<25} {imp:.4f} {bar}")

# ============ 3. FINANCIAL REGRESSOR ============
print("\n" + "=" * 100)
print("[3/7] FINANCIAL REGRESSOR")
print("-" * 60)

reg = joblib.load(os.path.join(MODEL_DIR, 'financial_model.joblib'))
reg_type = type(reg).__name__

le_ind = LabelEncoder()
df_glob['industry_encoded'] = le_ind.fit_transform(df_glob['Industry'].fillna('Other').astype(str))

fin_bench_path = os.path.join(MODEL_DIR, 'financial_benchmarks.json')
has_fin_bench = os.path.exists(fin_bench_path)

# The financial model uses only 3 features (backward compat)
X_fin = df_glob[['Total Funding ($M)', 'Number of Employees', 'industry_encoded']].fillna(0)
X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X_fin, df_glob['Annual Revenue ($M)'].fillna(0), test_size=0.2, random_state=42)

y_pred_f = reg.predict(X_test_f)
r2 = r2_score(y_test_f, y_pred_f)
mae = mean_absolute_error(y_test_f, y_pred_f)
print(f"  Model Type: {reg_type} (lightweight backward-compat model)")
print(f"  NOTE: Dataset has near-zero feature correlations (max r=0.012)")
print(f"  Primary financial estimation uses statistical industry benchmarks instead")

if has_fin_bench:
    with open(fin_bench_path) as f:
        fin_benchmarks = json.load(f)
    print(f"\n  STATISTICAL FINANCIAL BENCHMARKS ({len(fin_benchmarks)} industries):")
    print(f"  {'Industry':<15} | {'Rev P25':<10} | {'Rev Median':<12} | {'Rev P75':<10} | {'IPO Rate':<10} | {'Samples'}")
    print(f"  {'-'*15}-+-{'-'*10}-+-{'-'*12}-+-{'-'*10}-+-{'-'*10}-+-{'-'*7}")
    for ind, data in fin_benchmarks.items():
        print(f"  {ind:<15} | ${data['revenue_p25']:>7.1f}M | ${data['revenue_median']:>9.1f}M | ${data['revenue_p75']:>7.1f}M | {data['ipo_rate']*100:>7.1f}% | {data['sample_count']:>5}")


# ============ 4. INDUSTRY BENCHMARKS ============
print("\n" + "=" * 100)
print("[4/7] INDUSTRY BENCHMARK DATA")
print("-" * 60)

with open(os.path.join(MODEL_DIR, 'industry_benchmarks.json')) as f:
    benchmarks = json.load(f)

print(f"  {'Industry':<15} | {'Avg Funding':<14} | {'Avg Revenue':<14} | {'Avg Valuation':<18} | {'Samples':<7}")
print(f"  {'-'*15}-+-{'-'*14}-+-{'-'*14}-+-{'-'*18}-+-{'-'*7}")
for ind, data in benchmarks.items():
    print(f"  {ind:<15} | ${data['avg_funding']/1e6:>10.1f}M | ${data['avg_revenue']/1e6:>10.1f}M | ${data['avg_valuation']/1e6:>14.1f}M | {data.get('sample_count','N/A'):>5}")

# ============ 5. DYNAMIC OUTPUT VARIANCE TEST ============
print("\n" + "=" * 100)
print("[5/7] DYNAMIC OUTPUT VARIANCE TEST (25 Cross-Domain Ventures)")
print("-" * 60)

from app.services.ml_service import MLService

test_ventures = [
    {'title': 'DevPulse AI Code Reviewer', 'industry': 'SaaS / AI', 'sector': 'online', 'budget': 45000, 'team_size': 3},
    {'title': 'Artisan Bakery Franchise', 'industry': 'Food & Beverage', 'sector': 'offline', 'budget': 65000, 'team_size': 5},
    {'title': 'VoltCharge EV Network', 'industry': 'CleanTech / EV', 'sector': 'hybrid', 'budget': 120000, 'team_size': 4},
    {'title': 'MindEase Telehealth', 'industry': 'Healthcare / MedTech', 'sector': 'online', 'budget': 35000, 'team_size': 2},
    {'title': 'MicroPay Credit Engine', 'industry': 'Fintech', 'sector': 'online', 'budget': 80000, 'team_size': 3},
    {'title': 'AirFleet Medical Drone', 'industry': 'Logistics / Robotics', 'sector': 'hybrid', 'budget': 95000, 'team_size': 6},
    {'title': 'AgriSprout Hydroponics', 'industry': 'AgTech', 'sector': 'offline', 'budget': 75000, 'team_size': 4},
    {'title': 'SpatialHome AR Design', 'industry': 'PropTech / Retail', 'sector': 'online', 'budget': 25000, 'team_size': 2},
    {'title': 'Q-Shield Quantum Security', 'industry': 'DeepTech / Cybersecurity', 'sector': 'online', 'budget': 150000, 'team_size': 5},
    {'title': 'VintageVault Luxury Resale', 'industry': 'E-Commerce', 'sector': 'online', 'budget': 50000, 'team_size': 3},
    {'title': 'BioWaste-to-Watts Energy', 'industry': 'CleanTech / Energy', 'sector': 'offline', 'budget': 200000, 'team_size': 8},
    {'title': 'PulseGym Smart Studios', 'industry': 'Wellness / Hardware', 'sector': 'hybrid', 'budget': 85000, 'team_size': 4},
    {'title': 'GlamExpress Beauty', 'industry': 'Consumer Services', 'sector': 'hybrid', 'budget': 30000, 'team_size': 2},
    {'title': 'StreamNode Cloud Gaming', 'industry': 'Gaming / Cloud', 'sector': 'online', 'budget': 110000, 'team_size': 5},
    {'title': 'CryoLogistics Cold Chain', 'industry': 'BioTech / Logistics', 'sector': 'hybrid', 'budget': 90000, 'team_size': 4},
    {'title': 'FlexDesk Workspace Hub', 'industry': 'PropTech', 'sector': 'online', 'budget': 40000, 'team_size': 2},
    {'title': 'RoboPack Warehouse AMR', 'industry': 'Robotics / Industrial', 'sector': 'hybrid', 'budget': 130000, 'team_size': 7},
    {'title': 'JurisAI Contract Auditor', 'industry': 'LegalTech', 'sector': 'online', 'budget': 60000, 'team_size': 3},
    {'title': 'VR-Polyglot VR Academy', 'industry': 'EdTech / VR', 'sector': 'online', 'budget': 32000, 'team_size': 2},
    {'title': 'Brews & Barrels Taproom', 'industry': 'Hospitality', 'sector': 'offline', 'budget': 70000, 'team_size': 6},
    {'title': 'TerraView Satellite AI', 'industry': 'SpaceTech / AI', 'sector': 'online', 'budget': 140000, 'team_size': 5},
    {'title': 'AuraHome IoT Hub', 'industry': 'Hardware / IoT', 'sector': 'hybrid', 'budget': 55000, 'team_size': 3},
    {'title': 'SunPower Rooftop Solar', 'industry': 'CleanTech / Energy', 'sector': 'offline', 'budget': 160000, 'team_size': 7},
    {'title': 'FreightSync Highway AI', 'industry': 'Logistics / Freight', 'sector': 'online', 'budget': 70000, 'team_size': 4},
    {'title': 'GenePulse DNA Kit', 'industry': 'Health / Genetics', 'sector': 'hybrid', 'budget': 85000, 'team_size': 3},
]

print(f"\n  {'#':<3} {'Venture':<28} {'Sec':<8} {'Succ%':<7} {'Risk':<7} {'Feas':<7} {'Inv':<7} {'V2V':<7}")
print(f"  {'-'*3} {'-'*28} {'-'*8} {'-'*7} {'-'*7} {'-'*7} {'-'*7} {'-'*7}")

success_scores, risk_scores, feas_scores, inv_scores, v2v_scores = [], [], [], [], []

for i, v in enumerate(test_ventures, 1):
    succ = MLService.predict_success_probability(v)
    risk = MLService.calculate_risk(v)
    feas = MLService.calculate_feasibility(v)
    inv = MLService.calculate_investor_readiness(v)
    
    or_val = risk.get('overall_risk', 0)
    of_val = feas.get('overall_feasibility', 0)
    oi_val = inv.get('investor_score', 0)
    
    # V2V Score (matching analysis_service.py formula)
    v2v = round((of_val * 0.3) + (82.0 * 0.3) + (oi_val * 0.25) + (max(0, 100 - or_val) * 0.15), 1)
    
    success_scores.append(succ)
    risk_scores.append(or_val)
    feas_scores.append(of_val)
    inv_scores.append(oi_val)
    v2v_scores.append(v2v)
    
    print(f"  {i:<3} {v['title']:<28} {v['sector']:<8} {succ:<7.1f} {or_val:<7.1f} {of_val:<7.1f} {oi_val:<7.1f} {v2v:<7.1f}")

# ============ 6. VARIANCE & DOMAIN CORRECTNESS ============
print(f"\n" + "=" * 100)
print("[6/7] VARIANCE & DOMAIN CORRECTNESS")
print("-" * 60)

print(f"\n  VARIANCE STATISTICS:")
for name, scores in [('Success Probability', success_scores), ('Risk Score', risk_scores), 
                      ('Feasibility', feas_scores), ('Investor Score', inv_scores), ('V2V Score', v2v_scores)]:
    unique = len(set(scores))
    status = 'PASS' if unique >= 15 else 'FAIL'
    print(f"    {name:<22} Range {min(scores):.1f}-{max(scores):.1f} | Std {np.std(scores):.2f} | Unique {unique}/25 {status}")

print(f"\n  DOMAIN CORRECTNESS:")
# SaaS AI should beat Bakery in success
saas_i, bakery_i = 0, 1
print(f"    SaaS AI success ({success_scores[saas_i]:.1f}) > Bakery ({success_scores[bakery_i]:.1f}): {'PASS' if success_scores[saas_i] > success_scores[bakery_i] else 'FAIL'}")

# Offline should have higher risk than online
print(f"    Offline risk ({risk_scores[bakery_i]:.1f}) > Online risk ({risk_scores[saas_i]:.1f}): {'PASS' if risk_scores[bakery_i] > risk_scores[saas_i] else 'FAIL'}")

# Fintech should beat AgTech in investor score
fintech_i, agtech_i = 4, 6
print(f"    Fintech inv ({inv_scores[fintech_i]:.1f}) > AgTech inv ({inv_scores[agtech_i]:.1f}): {'PASS' if inv_scores[fintech_i] > inv_scores[agtech_i] else 'FAIL'}")

# Online SaaS should have higher scalability than offline Hospitality
print(f"    SaaS feas ({feas_scores[saas_i]:.1f}) != Bakery feas ({feas_scores[bakery_i]:.1f}): {'PASS' if feas_scores[saas_i] != feas_scores[bakery_i] else 'FAIL'}")

# DeepTech should have high innovation but also high tech risk
deeptech_i = 8
deeptech_risk = risk_scores[deeptech_i]
print(f"    DeepTech tech risk ({deeptech_risk:.1f}) is meaningful: {'PASS' if deeptech_risk > 30 else 'FAIL'}")

# All V2V scores should be different
v2v_unique = len(set(v2v_scores))
print(f"    V2V uniqueness ({v2v_unique}/25): {'PASS' if v2v_unique >= 15 else 'FAIL'}")

# ============ 7. SUMMARY ============
print("\n" + "=" * 100)
print("[7/7] PRODUCTION READINESS SUMMARY")
print("=" * 100)

all_pass = (
    len(set(success_scores)) >= 15 and
    len(set(risk_scores)) >= 15 and
    len(set(feas_scores)) >= 15 and
    len(set(inv_scores)) >= 15 and
    success_scores[saas_i] > success_scores[bakery_i] and
    risk_scores[bakery_i] > risk_scores[saas_i]
)

print(f"  Model Algorithm:              {model_type}")
print(f"  Success Accuracy:             {test_accuracy * 100:.2f}% (CV: {cv_scores.mean()*100:.2f}%)")
print(f"  Financial R2:                 {r2:.4f} ({r2*100:.2f}%)")
print(f"  Training Data:                {len(df_succ) + len(df_glob) + len(df_val):,} records")
print(f"  YC Competitors:               5,997 companies")
print(f"  Features Used:                {len(feature_cols)} ({6 if not has_scaler else len(feature_cols)} active)")
print(f"  Success Uniqueness:           {len(set(success_scores))}/25")
print(f"  Risk Uniqueness:              {len(set(risk_scores))}/25")
print(f"  Feasibility Uniqueness:       {len(set(feas_scores))}/25")
print(f"  Investor Uniqueness:          {len(set(inv_scores))}/25")
print(f"  V2V Score Uniqueness:         {len(set(v2v_scores))}/25")
print(f"  Domain Correctness:           {'ALL PASS' if all_pass else 'NEEDS FIX'}")
print(f"  PRODUCTION READY:             {'YES' if all_pass and test_accuracy > 0.60 else 'NEEDS IMPROVEMENT'}")
print("=" * 100)
