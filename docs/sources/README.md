# Source documents

Every market and consumption figure in this project traces to one of the documents
listed below. Put the PDFs in this folder so a reader can check a number against the
page it came from instead of taking the citation on trust.

The files are not committed — see `.gitignore` — because they are large and
redistributing them is not ours to do. The table is the part that matters: it says
which document each figure came from, and any of them can be downloaded again from
the publisher.

## What each document is used for

| Document | Used for | Lands in |
|---|---|---|
| `HCES FactSheet 2023-24.pdf` (MoSPI/NSO) | All-India and per-state MPCE, item-group shares. Every local catchment market size is built from these. | `backend/app/ml_models/india_consumption_hces.json` |
| `Report_591_HCES_2022-23New.pdf` (MoSPI/NSO) | Corroborating detail on the same survey series. | same |
| `1786107602_Education-And-Training-PPT-May-2026.pdf` (IBEF) | Edtech market total (IAMAI + Grant Thornton Bharat), coaching industry size. | `india_market_sizes.json` → `edtech` |
| `1786428452_Renewable-Energy-PPT-May-2026.pdf` (IBEF) | Cleantech capital deployment (MNRE), and the FEDAI exchange-rate table. | `india_market_sizes.json` → `cleantech`, `_meta.fx_inr_per_usd` |
| `1785908632_Agriculture-May-2026.pdf` (IBEF) | Smart agriculture market (IMARC/Bain). Also independently corroborates the HCES processed-food share. | `india_market_sizes.json` → `agritech` |
| `1787810768_Infrastructure-May-2026.pdf` (IBEF) | Logistics market total and the express/courier sub-segment the addressable share is anchored to. | `india_market_sizes.json` → `logistics` |

## Where the citations live

Nothing here needs to be read to run the project. Each figure carries its own
provenance in the data files, and that provenance is returned with every analysis
and displayed in the app:

- `backend/app/ml_models/india_market_sizes.json` — `source`, `as_of`, `confidence`,
  `share_basis` and `corroboration` per sector, plus the FEDAI rate table in `_meta`
- `backend/app/ml_models/india_consumption_hces.json` — the HCES line each category
  maps to, per-state multipliers, and an independent cross-check recorded in
  `_meta.independent_corroboration`
- `backend/app/ml_models/financial_templates.json` — unit economics with the
  publication each figure comes from

## Two things worth knowing before citing this

**Not everything is sourced, and the app says so.** Nine of the sixteen
unit-economics blocks in `financial_intelligence.py` are internal assumptions with
no published origin, and they report themselves as `PLANNING ASSUMPTION` in every
analysis. Cybersecurity has no published India total and displays in amber. Growth
multiples in the roadmap are assumptions, labelled as such.

**One published figure was not imported because it is wrong.** Slide 20 of the
education deck gives edtech as "Rs 3,35,470 cr (US$3.63bn)", which implies an
exchange rate of Rs 924/USD. The same deck also gives K-12 as both US$268.12bn by
2030 and US$125.8bn by 2032. These are recorded here so nobody imports them later
believing they were missed.
