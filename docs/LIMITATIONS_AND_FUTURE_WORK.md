# Limitations & Future Work

*A candid statement of what Vision2Venture does and does not guarantee. Included for academic integrity and to pre-empt evaluation questions.*

## Scope of accuracy

Vision2Venture is an **idea-stage decision-support system**, not a source of verified corporate data. Its outputs fall into four honestly-labelled categories (surfaced in the UI as colour-coded source badges):

| Category | Modules | What it means |
|---|---|---|
| **Real data** | Competitor identities & locations (HERE, TomTom, OpenStreetMap, web search, Y Combinator dataset), macro indicators (World Bank), news headlines (Google News), search demand (Google Trends) | Fetched live from public sources |
| **AI-grounded** | Market narrative, SWOT, business model | LLM interpretation of the real signals above |
| **Benchmark** | Financial projections, sector CAGR, market sizing | Derived from Indian sector benchmarks scaled to user inputs |
| **Model score** | Success, risk, feasibility, investor readiness | Trained scikit-learn models blended 50/50 with domain calibration |
| **Unverified** | AI-suggested local businesses (last resort only) | LLM recall with no lookup behind it. Never counted as verified, never given coordinates, never plotted on the map, never auto-selected |

## Limitations

1. **A new idea has no real financials or market share.** Market size, growth, revenue, CAC, LTV and break-even are therefore **estimates** (AI + sector benchmarks), not measured figures. They are planning aids, not guarantees.
2. **Only the success classifier is validated against real outcomes.** It achieves 77% cross-validated accuracy (F1 = 0.83, ROC-AUC = 0.84) on 923 real Crunchbase startups. The risk / feasibility / investor / market regressors are trained on formula-derived targets and are validated *behaviourally* (they correctly rank strong vs. weak ideas — 4/4 checks) rather than against ground-truth labels.
3. **Class imbalance.** The Crunchbase labelled set is 65% acquired / 35% closed, so the classifier is stronger at identifying likely successes (recall 0.88) than failures (recall 0.59).
4. **Live-API fragility.** Google Trends is frequently rate-limited from cloud servers; when unavailable, the system falls back to a labelled baseline. Caching (added in this release) mitigates this by reusing genuinely-successful fetches.
5. **LLM variability.** The language model is generative; lowering the sampling temperature (done in this release) improves consistency but does not make output perfectly deterministic.
6. **Competitor analysis depth.** Competitor *identities* are real, but their strengths/weaknesses/pricing are AI-inferred, not scraped facts.
7. **Ratings and reviews are not collected.** None of the competitor sources (HERE, TomTom, OpenStreetMap, the YC dataset) expose customer ratings, so competitor `rating`, `review_count` and sentiment are reported as unavailable rather than estimated. Earlier revisions synthesised these from a hash of the competitor's name; that has been removed.
8. **Sector CAGR is a benchmark, not a measurement.** The growth rate shown for each sector is an indicative published figure adjusted by live search demand. It replaced a regressor whose growth target was a function of a hardcoded constant and so returned the same number for every industry.
9. **Market opportunity is a composite index, not a forecast.** It weighs live demand (30%), sector growth (25%), addressable market scale (20%) and capital adequacy (25%). It is comparable between ideas, but it is not a probability of success.
10. **An unreachable data provider is reported as unknown, not as zero.** If the mapping providers cannot be reached, the app says so explicitly rather than concluding the venture has no competitors.

## Accuracy regression suite

`backend/test_analysis_accuracy.py` locks in the properties above (57 checks, no network or database required). It guards specifically against the defects found during the analysis audit: a dead categorical encoder that fed every idea the same industry, a constant growth rate, a market-opportunity score that tracked the founder's budget rather than the market, financial breakdowns that did not sum to their own totals, copy describing a different business than the user's, and statistics synthesised from `hash(name)` and presented as verified.

## Future work

- **Ground-truth validation for the score models** via a labelled dataset or expert-rated study, replacing behavioural validation with measured accuracy.
- **Full result caching per idea** so an entire analysis is reproducible and re-openable without re-calling any external API.
- **Retrieval-augmented competitor profiling** — scrape/verify competitor pricing and features instead of inferring them.
- **Confidence intervals** on financial projections instead of point estimates.
- **User feedback loop** — let founders correct outputs and use that signal to fine-tune benchmarks and prompts.
- **Address class imbalance** (resampling / class weighting) to improve failure-case recall.
