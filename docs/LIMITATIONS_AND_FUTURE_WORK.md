# Limitations & Future Work

*A candid statement of what Vision2Venture does and does not guarantee. Included for academic integrity and to pre-empt evaluation questions.*

## Scope of accuracy

Vision2Venture is an **idea-stage decision-support system**, not a source of verified corporate data. Its outputs fall into four honestly-labelled categories (surfaced in the UI as colour-coded source badges):

| Category | Modules | What it means |
|---|---|---|
| **Real data** | Competitor identities & locations (OpenStreetMap, web search, Y Combinator dataset), macro indicators (World Bank), news headlines (Google News), search demand (Google Trends) | Fetched live from public sources |
| **AI-grounded** | Market narrative, SWOT, business model | LLM interpretation of the real signals above |
| **Benchmark** | Financial projections, sector metrics | Derived from Indian sector benchmarks scaled to user inputs |
| **Model score** | Success, risk, feasibility, investor readiness | Output of trained scikit-learn models |

## Limitations

1. **A new idea has no real financials or market share.** Market size, growth, revenue, CAC, LTV and break-even are therefore **estimates** (AI + sector benchmarks), not measured figures. They are planning aids, not guarantees.
2. **Only the success classifier is validated against real outcomes.** It achieves 77% cross-validated accuracy (F1 = 0.83, ROC-AUC = 0.84) on 923 real Crunchbase startups. The risk / feasibility / investor / market regressors are trained on formula-derived targets and are validated *behaviourally* (they correctly rank strong vs. weak ideas — 4/4 checks) rather than against ground-truth labels.
3. **Class imbalance.** The Crunchbase labelled set is 65% acquired / 35% closed, so the classifier is stronger at identifying likely successes (recall 0.88) than failures (recall 0.59).
4. **Live-API fragility.** Google Trends is frequently rate-limited from cloud servers; when unavailable, the system falls back to a labelled baseline. Caching (added in this release) mitigates this by reusing genuinely-successful fetches.
5. **LLM variability.** The language model is generative; lowering the sampling temperature (done in this release) improves consistency but does not make output perfectly deterministic.
6. **Competitor analysis depth.** Competitor *identities* are real, but their strengths/weaknesses/pricing are AI-inferred, not scraped facts.

## Future work

- **Ground-truth validation for the score models** via a labelled dataset or expert-rated study, replacing behavioural validation with measured accuracy.
- **Full result caching per idea** so an entire analysis is reproducible and re-openable without re-calling any external API.
- **Retrieval-augmented competitor profiling** — scrape/verify competitor pricing and features instead of inferring them.
- **Confidence intervals** on financial projections instead of point estimates.
- **User feedback loop** — let founders correct outputs and use that signal to fine-tune benchmarks and prompts.
- **Address class imbalance** (resampling / class weighting) to improve failure-case recall.
