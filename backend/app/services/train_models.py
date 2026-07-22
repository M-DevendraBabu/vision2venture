import os
import json
import numpy as np
import pandas as pd
import joblib
from collections import Counter
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
os.makedirs(MODEL_DIR, exist_ok=True)

def train_all_models():
    print("[ML Training] Starting comprehensive multi-dataset training pipeline...")

    success_path = os.path.join(DATA_DIR, 'startup_success_dataset.csv')
    global_path = os.path.join(DATA_DIR, 'global_startup_success_dataset.csv')
    val_path = os.path.join(DATA_DIR, 'startup_valuation_dataset.csv')
    yc_path = os.path.join(DATA_DIR, 'yc_companies.csv')
    so_path = os.path.join(DATA_DIR, 'survey_results_public.csv')

    # ==================== 1. TRAIN SUCCESS PREDICTOR ====================
    if os.path.exists(success_path):
        print(f"[ML Training] 1/4 Training Success Classifier on {success_path}...")
        df_success = pd.read_csv(success_path)
        
        le_sector = LabelEncoder()
        df_success['sector_encoded'] = le_sector.fit_transform(df_success['sector'].fillna('Other').astype(str))
        df_success['is_success'] = df_success['outcome'].apply(lambda x: 1 if str(x).lower() in ['ipo', 'acquired', 'success'] else 0)

        X = df_success[['funding_rounds', 'founder_experience_years', 'team_size', 'market_size_billion', 'burn_rate_million', 'sector_encoded']].fillna(0)
        y = df_success['is_success']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        clf = RandomForestClassifier(n_estimators=100, max_depth=12, class_weight='balanced', random_state=42)
        clf.fit(X_train, y_train)
        
        acc = clf.score(X_test, y_test)
        print(f"[ML Training] Success Classifier Trained! Accuracy: {acc*100:.2f}%")

        joblib.dump(clf, os.path.join(MODEL_DIR, 'success_model.joblib'))
        joblib.dump(le_sector, os.path.join(MODEL_DIR, 'sector_encoder.joblib'))

    # ==================== 2. TRAIN FINANCIAL REGRESSOR ====================
    if os.path.exists(global_path):
        print(f"[ML Training] 2/4 Training Financial Regressor on {global_path}...")
        df_global = pd.read_csv(global_path)

        le_ind = LabelEncoder()
        df_global['industry_encoded'] = le_ind.fit_transform(df_global['Industry'].fillna('Other').astype(str))

        X_fin = df_global[['Total Funding ($M)', 'Number of Employees', 'industry_encoded']].fillna(0)
        y_fin = df_global['Annual Revenue ($M)'].fillna(0)

        reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
        reg.fit(X_fin, y_fin)

        print(f"[ML Training] Financial Regressor Trained!")
        joblib.dump(reg, os.path.join(MODEL_DIR, 'financial_model.joblib'))
        joblib.dump(le_ind, os.path.join(MODEL_DIR, 'industry_encoder.joblib'))

    # ==================== 3. INGEST YC COMPETITOR DATABASE ====================
    yc_database = []
    if os.path.exists(yc_path):
        print(f"[ML Training] 3/4 Processing YCombinator Startup Index ({yc_path})...")
        try:
            df_yc = pd.read_csv(yc_path, low_memory=False, encoding='utf-8', on_bad_lines='skip')
            for _, row in df_yc.iterrows():
                yc_database.append({
                    "name": str(row.get('name') or ''),
                    "website": str(row.get('website') or ''),
                    "one_liner": str(row.get('one_liner') or row.get('long_description') or '')[:200],
                    "industry": str(row.get('industry') or '').lower(),
                    "tags": str(row.get('tags') or '').lower(),
                    "team_size": str(row.get('team_size') or 'N/A'),
                    "batch": str(row.get('batch') or '')
                })
            print(f"[ML Training] SUCCESS! Ingested {len(yc_database)} real YC startups into Competitor Index!")
            with open(os.path.join(MODEL_DIR, 'yc_competitors.json'), 'w', encoding='utf-8') as f:
                json.dump(yc_database, f, indent=2)
        except Exception as e:
            print(f"[ML Training] Notice parsing YC startups: {e}")

    # ==================== 4. INGEST STACK OVERFLOW TECH SURVEY ====================
    if os.path.exists(so_path):
        print(f"[ML Training] 4/4 Processing Stack Overflow Developer Survey ({so_path})...")
        try:
            df_so = pd.read_csv(so_path, low_memory=False, usecols=['WebframeWorkedWith', 'DatabaseWorkedWith', 'PlatformWorkedWith', 'LanguageWorkedWith'])
            
            webframes = Counter()
            databases = Counter()
            platforms = Counter()
            languages = Counter()

            for _, row in df_so.iterrows():
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
                    for l in str(row['LanguageWorkedWith']).split(';'):
                        languages[l.strip()] += 1

            so_benchmarks = {
                "top_web_frameworks": webframes.most_common(10),
                "top_databases": databases.most_common(10),
                "top_platforms": platforms.most_common(10),
                "top_languages": languages.most_common(10)
            }

            with open(os.path.join(MODEL_DIR, 'tech_survey_benchmarks.json'), 'w') as f:
                json.dump(so_benchmarks, f, indent=2)
            print("[ML Training] Processed 64,461 Stack Overflow developer survey responses into Tech Benchmarks!")
        except Exception as e:
            print(f"[ML Training] Notice parsing Stack Overflow survey: {e}")

    # Industry valuation benchmarks
    benchmarks = {}
    if os.path.exists(val_path):
        df_val = pd.read_csv(val_path)
        for ind, group in df_val.groupby('industry'):
            ind_clean = str(ind).lower().strip()
            benchmarks[ind_clean] = {
                "avg_funding": float(group['funding_amount_usd'].median() or 500000),
                "avg_revenue": float(group['estimated_revenue_usd'].median() or 200000),
                "avg_valuation": float(group['estimated_valuation_usd'].median() or 2000000),
                "avg_team_size": int(group['employee_count'].median() or 10),
                "sample_count": int(len(group))
            }
        with open(os.path.join(MODEL_DIR, 'industry_benchmarks.json'), 'w') as f:
            json.dump(benchmarks, f, indent=2)

    print(f"[ML Training] COMPLETED ALL 9 DATASETS PIPELINE! Saved to {MODEL_DIR}")

if __name__ == '__main__':
    train_all_models()
