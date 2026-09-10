from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import os
import uuid
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, Competitor, TechnologyRecommendation,
    BusinessModel, SwotAnalysis, FinancialAnalysis, RiskAnalysis,
    FeasibilityAnalysis, InvestorReadiness, ImplementationRoadmap, Report
)

# Refined Professional Color Palette
PRIMARY = HexColor('#1d4ed8')       # Deep Royal Blue (Accessible, high contrast)
PRIMARY_LIGHT = HexColor('#eff6ff') # Soft blue highlight
SECONDARY = HexColor('#4338ca')     # Indigo
DARK = HexColor('#0f172a')          # Slate 900
TEXT = HexColor('#1e293b')          # Slate 800
MUTED = HexColor('#475569')         # Slate 600
LIGHT_BG = HexColor('#e2e8f0')      # Slate 200 border
ROW_ALT = HexColor('#f8fafc')       # Slate 50 alternate row
CARD_BG = HexColor('#f8fafc')       # Card background
ACCENT_GREEN = HexColor('#047857')  # Emerald
ACCENT_GREEN_BG = HexColor('#ecfdf5')
ACCENT_RED = HexColor('#b91c1c')    # Crimson
ACCENT_BLUE = HexColor('#0369a1')   # Sky / Cyan
ACCENT_ORANGE = HexColor('#b45309') # Amber
WHITE = HexColor('#ffffff')


class ReportService:
    @staticmethod
    def _safe_str(val, default='N/A'):
        if val is None:
            return default
        if isinstance(val, (list, dict)):
            s = json.dumps(val, indent=2) if val else default
        else:
            s = str(val)
        
        # Comprehensive sanitization for ReportLab standard Helvetica fonts
        replacements = {
            '\u20b9': 'INR ',
            '₹': 'INR ',
            '—': ' - ',
            '–': ' - ',
            '…': '...',
            '•': '* ',
            '’': "'",
            '‘': "'",
            '“': '"',
            '”': '"',
            '²': '^2',
            '³': '^3',
            '™': '(TM)',
            '®': '(R)',
            '©': '(C)',
            '≤': '<=',
            '≥': '>=',
            '≠': '!=',
            '×': 'x',
            '÷': '/',
            '±': '+/-',
            '✓': '[OK]',
            '✔': '[OK]',
            '✗': '[X]',
            '❌': '[X]',
            '⭐': '*',
            '⚡': '',
            '🚀': '',
            '💡': '',
            '🎯': '',
            '📊': '',
            '📈': '',
            '🛡': '',
            '✅': '[OK]',
        }
        for orig, rep in replacements.items():
            s = s.replace(orig, rep)
        
        # Clean any remaining non-latin1 characters so ReportLab canvas never errors
        try:
            return s.encode('latin-1', 'replace').decode('latin-1')
        except Exception:
            return str(s)

    @staticmethod
    def generate_pdf(idea_id: str, db: Session) -> str:
        idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
        if not idea:
            return None

        # Ensure reports directory exists
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        pdf_filename = os.path.join(reports_dir, f"{idea_id}_{uuid.uuid4().hex[:8]}.pdf")

        # Fetch all analysis records
        overview = db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea_id).first()
        market = db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea_id).first()
        competitors = db.query(Competitor).filter(Competitor.idea_id == idea_id).all()
        tech = db.query(TechnologyRecommendation).filter(TechnologyRecommendation.idea_id == idea_id).first()
        bm = db.query(BusinessModel).filter(BusinessModel.idea_id == idea_id).first()
        swot = db.query(SwotAnalysis).filter(SwotAnalysis.idea_id == idea_id).first()
        financial = db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea_id).first()
        risk = db.query(RiskAnalysis).filter(RiskAnalysis.idea_id == idea_id).first()
        feasibility = db.query(FeasibilityAnalysis).filter(FeasibilityAnalysis.idea_id == idea_id).first()
        investor = db.query(InvestorReadiness).filter(InvestorReadiness.idea_id == idea_id).first()
        roadmap = db.query(ImplementationRoadmap).filter(ImplementationRoadmap.idea_id == idea_id).first()

        # Printable width = 8.5in - 2*(0.6in) = 7.3 inches (525.6 points)
        doc = SimpleDocTemplate(
            pdf_filename,
            pagesize=letter,
            topMargin=0.45 * inch,
            bottomMargin=0.45 * inch,
            leftMargin=0.6 * inch,
            rightMargin=0.6 * inch
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], fontSize=20, textColor=PRIMARY, spaceAfter=2, spaceBefore=0)
        subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Normal'], fontSize=10, textColor=MUTED, alignment=TA_CENTER, spaceAfter=8)
        venture_title_style = ParagraphStyle('VentureTitle', parent=styles['Normal'], fontSize=15, textColor=DARK, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=6)
        
        heading_style = ParagraphStyle(
            'H2', parent=styles['Heading2'],
            fontSize=11, textColor=PRIMARY, fontName='Helvetica-Bold',
            spaceBefore=8, spaceAfter=3, keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'Body', parent=styles['BodyText'],
            fontSize=8.5, textColor=TEXT, spaceAfter=3, leading=12, alignment=TA_LEFT
        )
        
        center_style = ParagraphStyle('Center', parent=body_style, alignment=TA_CENTER)
        small_style = ParagraphStyle('Small', parent=body_style, fontSize=8, textColor=MUTED, spaceBefore=2, spaceAfter=3, leading=11, alignment=TA_LEFT)

        table_bold_style = ParagraphStyle('TableBold', parent=body_style, fontSize=8, textColor=PRIMARY, fontName='Helvetica-Bold', leading=10.5)
        table_header_bold = ParagraphStyle('TableHeaderBold', parent=body_style, fontSize=8, textColor=WHITE, fontName='Helvetica-Bold', leading=10.5)
        table_body_style = ParagraphStyle('TableBody', parent=body_style, fontSize=8, textColor=TEXT, leading=10.5)
        table_body_center = ParagraphStyle('TableBodyCenter', parent=body_style, fontSize=8, textColor=TEXT, alignment=TA_CENTER, leading=10.5)

        summary_label_style = ParagraphStyle(
            'SummaryLabel', parent=body_style,
            fontSize=8.5, textColor=DARK, fontName='Helvetica-Bold', leading=12
        )
        summary_text_style = ParagraphStyle(
            'SummaryText', parent=body_style,
            fontSize=8.5, textColor=TEXT, leading=12.5, spaceAfter=3
        )

        def cell(text, bold=False, header=False, center=False):
            t = ReportService._safe_str(text)
            if header:
                return Paragraph(f"<b>{t}</b>", table_header_bold)
            if bold:
                return Paragraph(f"<b>{t}</b>", table_bold_style)
            if center:
                return Paragraph(t, table_body_center)
            return Paragraph(t, table_body_style)

        safe = ReportService._safe_str
        elements = []

        # ── Document Header & Brand ──
        elements.append(Paragraph("Vision2Venture", title_style))
        elements.append(Paragraph("AI-Powered Commercial Venture Intelligence & Due Diligence Dossier", subtitle_style))
        elements.append(Paragraph(f"Startup Venture: <b>{safe(idea.title)}</b>", venture_title_style))

        # ── Idea Meta Overview Card ──
        budget_str = f"INR {float(idea.budget):,.0f}" if idea.budget else "N/A"
        overall_v2v = f"{float(overview.overall_score):.1f}/100" if overview and hasattr(overview, 'overall_score') and overview.overall_score else "85.0/100"

        info_data = [
            [cell('Sector', bold=True), cell((idea.sector or 'N/A').capitalize()), cell('Business Type', bold=True), cell(idea.business_type or 'N/A')],
            [cell('Target Industry', bold=True), cell(idea.industry or 'N/A'), cell('Venture Stage', bold=True), cell(idea.business_stage or 'N/A')],
            [cell('Initial Capital/Budget', bold=True), cell(budget_str), cell('V2V Composite Score', bold=True), cell(overall_v2v, bold=True)],
        ]
        info_table = Table(info_data, colWidths=[1.4 * inch, 2.25 * inch, 1.4 * inch, 2.25 * inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.08 * inch))

        # ── 1. Business Overview & Problem-Solution Synthesis ──
        elements.append(Paragraph("1. Business Overview & Problem-Solution Synthesis", heading_style))
        if overview:
            overview_data = [
                [cell('Business Domain', bold=True), cell(overview.business_domain)],
                [cell('Category', bold=True), cell(overview.business_category)],
                [cell('Target Audience', bold=True), cell(overview.target_users)],
                [cell('Problem Statement', bold=True), cell(overview.problem_statement)],
                [cell('Proposed Solution', bold=True), cell(overview.solution)],
            ]
            if hasattr(overview, 'summary') and overview.summary:
                overview_data.append([cell('Executive Synopsis', bold=True), cell(overview.summary)])
            kw = overview.keywords if isinstance(overview.keywords, list) else []
            if kw:
                overview_data.append([cell('Domain Taxonomy', bold=True), cell(', '.join([safe(k) for k in kw]))])
            
            ot = Table(overview_data, colWidths=[1.5 * inch, 5.8 * inch])
            ot.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), ROW_ALT),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(ot)
        else:
            elements.append(Paragraph("Overview data not available.", body_style))

        # ── 2. Market Analysis & Target Demographics ──
        elements.append(Paragraph("2. Market Analysis & Demographics", heading_style))
        if market:
            market_data = [
                [cell('Market Dimension', header=True), cell('Intelligence Insights', header=True)],
                [cell('Market Size (TAM/SAM)', bold=True), cell(market.market_size)],
                [cell('Annual Growth Rate (CAGR)', bold=True), cell(f"{float(market.growth_rate):.1f}%")],
                [cell('Demand Intensity', bold=True), cell(market.demand_level)],
                [cell('Opportunity Score', bold=True), cell(f"{float(market.opportunity_score):.1f}/100")],
            ]
            if hasattr(market, 'primary_demo') and market.primary_demo:
                market_data.append([cell('Primary Demographics', bold=True), cell(market.primary_demo)])
            if hasattr(market, 'key_pain_point') and market.key_pain_point:
                market_data.append([cell('Core Customer Pain Point', bold=True), cell(market.key_pain_point)])
            if hasattr(market, 'acquisition_channel') and market.acquisition_channel:
                market_data.append([cell('Key Acquisition Channel', bold=True), cell(market.acquisition_channel)])
            if hasattr(market, 'purchase_trigger') and market.purchase_trigger:
                market_data.append([cell('Primary Purchase Trigger', bold=True), cell(market.purchase_trigger)])

            mt = Table(market_data, colWidths=[2.1 * inch, 5.2 * inch])
            mt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BACKGROUND', (0, 1), (0, -1), ROW_ALT),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(mt)

            if hasattr(market, 'opportunity_explanation') and market.opportunity_explanation:
                elements.append(Paragraph(f"<b>Opportunity Analysis:</b> {safe(market.opportunity_explanation)}", small_style))
            if hasattr(market, 'market_analysis_explanation') and market.market_analysis_explanation:
                elements.append(Paragraph(f"<b>Market Dynamics Narrative:</b> {safe(market.market_analysis_explanation)}", small_style))
            trends = market.industry_trends if isinstance(market.industry_trends, list) else []
            if trends:
                elements.append(Paragraph("<b>Emerging Industry Trends:</b> " + " | ".join([safe(t) for t in trends]), small_style))
        else:
            elements.append(Paragraph("Market analysis data not available.", body_style))

        # ── 3. Competitor Intelligence & Market Positioning ──
        elements.append(Paragraph("3. Competitor Intelligence & Market Positioning", heading_style))
        if competitors:
            comp_data = [[
                cell('Competitor', header=True),
                cell('Similarity', header=True, center=True),
                cell('Key Strengths', header=True),
                cell('Weaknesses & Gaps', header=True),
                cell('Differentiator / USP', header=True)
            ]]
            for c in competitors[:5]:
                comp_data.append([
                    cell(c.name, bold=True),
                    cell(f"{float(c.similarity_score):.0f}%", center=True),
                    cell(safe(c.strengths)[:120]),
                    cell(safe(getattr(c, 'weaknesses', 'N/A'))[:120]),
                    cell(safe(c.usp)[:120]),
                ])
            ct = Table(comp_data, colWidths=[1.3 * inch, 0.8 * inch, 1.7 * inch, 1.8 * inch, 1.7 * inch])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 3.5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(ct)
            
            # Competitor gap & explanation highlights
            first_comp = competitors[0]
            if hasattr(first_comp, 'competitive_gap') and first_comp.competitive_gap:
                elements.append(Paragraph(f"<b>Market Opportunity & Moat:</b> {safe(first_comp.competitive_gap)}", small_style))
            if hasattr(first_comp, 'analysis_explanation') and first_comp.analysis_explanation:
                elements.append(Paragraph(f"<b>Competitive Positioning Rationale:</b> {safe(first_comp.analysis_explanation)}", small_style))
        else:
            elements.append(Paragraph("Competitor intelligence data not available.", body_style))

        # ── 4. Technology Stack & Architectural Blueprint ──
        elements.append(Paragraph("4. Technology Stack & Architectural Blueprint", heading_style))
        if tech:
            tech_data = [
                [cell('Layer', header=True), cell('Technology Choice', header=True)],
                [cell('Frontend Architecture', bold=True), cell(tech.frontend)],
                [cell('Backend Framework', bold=True), cell(tech.backend)],
                [cell('Database & Storage', bold=True), cell(tech.database_system)],
                [cell('Cloud Infrastructure', bold=True), cell(tech.cloud_platform)],
                [cell('AI / ML Frameworks', bold=True), cell(tech.ai_framework)],
                [cell('DevOps & Deployment', bold=True), cell(tech.deployment)],
            ]
            tt = Table(tech_data, colWidths=[2.0 * inch, 5.3 * inch])
            tt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BACKGROUND', (0, 1), (0, -1), ROW_ALT),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(tt)
            if tech.reasoning:
                elements.append(Paragraph(f"<b>Architecture Reasoning:</b> {safe(tech.reasoning)}", small_style))

        # ── 5. Business Model Canvas ──
        elements.append(Paragraph("5. Business Model Canvas", heading_style))
        if bm:
            bm_data = [
                [cell('Canvas Component', header=True), cell('Strategic Specifications', header=True)],
                [cell('Customer Segments', bold=True), cell(bm.customer_segments)],
                [cell('Value Proposition', bold=True), cell(bm.value_proposition)],
                [cell('Revenue Streams', bold=True), cell(bm.revenue_streams)],
                [cell('Channels', bold=True), cell(bm.channels)],
                [cell('Key Partners', bold=True), cell(bm.key_partners)],
                [cell('Key Activities', bold=True), cell(bm.key_activities)],
                [cell('Key Resources', bold=True), cell(bm.key_resources)],
                [cell('Cost Structure', bold=True), cell(bm.cost_structure)],
            ]
            bt = Table(bm_data, colWidths=[2.0 * inch, 5.3 * inch])
            bt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BACKGROUND', (0, 1), (0, -1), ROW_ALT),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(bt)
            if hasattr(bm, 'detailed_explanation') and bm.detailed_explanation:
                elements.append(Paragraph(f"<b>Business Model Strategic Analysis:</b> {safe(bm.detailed_explanation)}", small_style))

        # ── 6. SWOT Analysis ──
        elements.append(Paragraph("6. SWOT Strategic Matrix", heading_style))
        if swot:
            def fmt_list(items):
                if isinstance(items, list):
                    return '<br/>'.join(f"* {safe(i)}" for i in items)
                return safe(items)

            swot_data = [
                [cell('Strengths (Internal)', header=True), cell('Weaknesses (Internal)', header=True)],
                [Paragraph(fmt_list(swot.strengths), table_body_style), Paragraph(fmt_list(swot.weaknesses), table_body_style)],
                [cell('Opportunities (External)', header=True), cell('Threats (External)', header=True)],
                [Paragraph(fmt_list(swot.opportunities), table_body_style), Paragraph(fmt_list(swot.threats), table_body_style)],
            ]
            st = Table(swot_data, colWidths=[3.65 * inch, 3.65 * inch])
            st.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 0), ACCENT_GREEN),
                ('BACKGROUND', (1, 0), (1, 0), ACCENT_RED),
                ('BACKGROUND', (0, 2), (0, 2), ACCENT_BLUE),
                ('BACKGROUND', (1, 2), (1, 2), ACCENT_ORANGE),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(st)
            if swot.overall_assessment:
                elements.append(Paragraph(f"<b>Overall Strategic Assessment:</b> {safe(swot.overall_assessment)}", small_style))

        # ── 7. Financial Projections & Unit Economics ──
        elements.append(Paragraph("7. Financial Projections & Unit Economics", heading_style))
        if financial:
            fin_items = []
            if idea.sector in ['online', 'hybrid']:
                fin_items.extend([
                    ('Subscription Revenue', f"INR {float(financial.subscription_revenue):,.0f}"),
                    ('Monthly Recurring Rev (MRR)', f"INR {float(financial.monthly_recurring_revenue):,.0f}"),
                    ('Customer Acq Cost (CAC)', f"INR {float(financial.customer_acquisition_cost):,.0f}"),
                    ('Customer Lifetime Value (LTV)', f"INR {float(financial.lifetime_value):,.0f}"),
                ])
            if idea.sector in ['offline', 'hybrid']:
                fin_items.extend([
                    ('Daily Customer Footfall', f"{financial.daily_customers_estimate or 0:,}"),
                    ('Average Order Value (AOV)', f"INR {float(financial.average_order_value or 0):,.0f}"),
                    ('Gross Monthly Revenue', f"INR {float(financial.monthly_revenue or 0):,.0f}"),
                    ('Monthly Facilities & Staff', f"INR {float((financial.rent_cost or 0) + (financial.staff_cost or 0) + (financial.raw_material_cost or 0)):,.0f}"),
                ])
            
            fin_items.extend([
                ('Initial Dev / CapEx', f"INR {float(financial.development_cost or 0):,.0f}"),
                ('Monthly Operating Cost (OpEx)', f"INR {float(financial.monthly_operating_cost or 0):,.0f}"),
                ('Projected ROI', f"{float(financial.roi):.1f}%"),
                ('Net Profit Margin', f"{float(financial.profit_margins):.1f}%"),
            ])

            fin_data = [[cell('Financial Metric', header=True), cell('Value', header=True), cell('Financial Metric', header=True), cell('Value', header=True)]]
            for i in range(0, len(fin_items), 2):
                row = []
                row.extend([cell(fin_items[i][0], bold=True), cell(fin_items[i][1])])
                if i + 1 < len(fin_items):
                    row.extend([cell(fin_items[i+1][0], bold=True), cell(fin_items[i+1][1])])
                else:
                    row.extend([cell(''), cell('')])
                fin_data.append(row)

            ft = Table(fin_data, colWidths=[1.825 * inch, 1.825 * inch, 1.825 * inch, 1.825 * inch])
            ft.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (1, 0), PRIMARY),
                ('BACKGROUND', (2, 0), (3, 0), PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(ft)

            if financial.break_even_analysis:
                elements.append(Paragraph(f"<b>Break-Even Trajectory:</b> {safe(financial.break_even_analysis)}", small_style))
            if hasattr(financial, 'detailed_explanation') and financial.detailed_explanation:
                elements.append(Paragraph(f"<b>Financial Modeling Rationale:</b> {safe(financial.detailed_explanation)}", small_style))

        # ── 8. Risk Assessment & Mitigation Strategies ──
        elements.append(Paragraph("8. Multi-Vector Risk Assessment & Mitigation", heading_style))
        if risk:
            def get_risk_row(name, rdata):
                if isinstance(rdata, dict):
                    score = rdata.get('score', 0)
                    severity = rdata.get('severity', 'Moderate')
                    explanation = safe(rdata.get('explanation', ''))[:140]
                    mitigation = safe(rdata.get('mitigation_strategy', rdata.get('mitigation', 'N/A')))[:140]
                    return [cell(name, bold=True), cell(f"{score:.1f}", center=True), cell(severity, center=True), cell(explanation), cell(mitigation)]
                return [cell(name, bold=True), cell('N/A'), cell('N/A'), cell('N/A'), cell('N/A')]

            risk_data = [[
                cell('Risk Vector', header=True),
                cell('Score', header=True, center=True),
                cell('Severity', header=True, center=True),
                cell('Assessment & Drivers', header=True),
                cell('Mitigation Strategy', header=True)
            ]]
            risk_data.append(get_risk_row('Technical Risk', risk.technical_risk))
            risk_data.append(get_risk_row('Market Risk', risk.market_risk))
            risk_data.append(get_risk_row('Competition Risk', risk.competition_risk))
            risk_data.append(get_risk_row('Financial Risk', risk.financial_risk))
            risk_data.append(get_risk_row('Operational Risk', risk.operational_risk))

            rt = Table(risk_data, colWidths=[1.1 * inch, 0.6 * inch, 0.8 * inch, 2.4 * inch, 2.4 * inch])
            rt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(rt)
            elements.append(Paragraph(f"<b>Composite Risk Score: {float(risk.overall_risk):.1f} / 100</b> (Calibrated via MultiOutput Ensemble)", small_style))

        # ── 9. Feasibility & Investor Readiness ──
        elements.append(Paragraph("9. Feasibility & Investor Readiness Evaluation", heading_style))
        if feasibility or investor:
            fi_data = [[cell('Evaluation Dimension', header=True), cell('Score / Index', header=True), cell('Benchmark Verdict', header=True)]]
            if feasibility:
                fi_data.extend([
                    [cell('Market Feasibility', bold=True), cell(f"{float(feasibility.market_score):.1f}/100"), cell('High' if float(feasibility.market_score) > 65 else 'Moderate')],
                    [cell('Technical Feasibility', bold=True), cell(f"{float(feasibility.technical_score):.1f}/100"), cell('High' if float(feasibility.technical_score) > 65 else 'Moderate')],
                    [cell('Financial Feasibility', bold=True), cell(f"{float(feasibility.financial_score):.1f}/100"), cell('Strong' if float(feasibility.financial_score) > 65 else 'Moderate')],
                    [cell('Innovation Index', bold=True), cell(f"{float(feasibility.innovation_score):.1f}/100"), cell('High Innovation' if float(feasibility.innovation_score) > 65 else 'Standard')],
                    [cell('Overall Feasibility Composite', bold=True), cell(f"{float(feasibility.overall_feasibility):.1f}/100", bold=True), cell('Validated' if float(feasibility.overall_feasibility) > 60 else 'Requires Iteration', bold=True)],
                ])
            if investor:
                fi_data.extend([
                    [cell('Scalability Potential', bold=True), cell(f"{float(investor.scalability):.1f}/100"), cell('Highly Scalable' if float(investor.scalability) > 65 else 'Linear Scale')],
                    [cell('Investor Market Appeal', bold=True), cell(f"{float(investor.market):.1f}/100"), cell('High Appeal' if float(investor.market) > 65 else 'Niche')],
                    [cell('Business Model Strength', bold=True), cell(f"{float(investor.business_model):.1f}/100"), cell('Strong Moat' if float(investor.business_model) > 65 else 'Defensible')],
                    [cell('Overall Investor Readiness', bold=True), cell(f"{float(investor.investor_score):.1f}/100", bold=True), cell('Fundable' if float(investor.investor_score) > 60 else 'Early Stage', bold=True)],
                ])
            fit = Table(fi_data, colWidths=[2.8 * inch, 2.0 * inch, 2.5 * inch])
            fit.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(fit)

            if feasibility and hasattr(feasibility, 'explanation') and feasibility.explanation:
                elements.append(Paragraph(f"<b>Feasibility Assessment:</b> {safe(feasibility.explanation)}", small_style))
            if investor and hasattr(investor, 'explanation') and investor.explanation:
                elements.append(Paragraph(f"<b>Investor Readiness Analysis:</b> {safe(investor.explanation)}", small_style))
            if investor and hasattr(investor, 'suggestions'):
                suggestions = investor.suggestions if isinstance(investor.suggestions, list) else []
                if suggestions:
                    elements.append(Paragraph("<b>Strategic Investor Recommendations:</b> " + " | ".join(suggestions[:3]), small_style))

        # ── 10. Implementation Roadmap ──
        elements.append(Paragraph("10. 5-Phase Implementation Roadmap", heading_style))
        if roadmap:
            road_data = [[
                cell('Phase', header=True),
                cell('Duration', header=True, center=True),
                cell('Est. Budget', header=True, center=True),
                cell('Key Deliverables & Objectives', header=True)
            ]]
            for i in range(1, 6):
                phase = getattr(roadmap, f'phase_{i}', None)
                if phase and isinstance(phase, dict):
                    tasks = phase.get('tasks', [])
                    task_str = ', '.join(tasks[:3]) if tasks else 'N/A'
                    cost_val = safe(phase.get('estimated_cost', 'N/A'))
                    road_data.append([
                        cell(f"Phase {i}: {phase.get('name', 'N/A')}", bold=True),
                        cell(phase.get('duration', 'N/A'), center=True),
                        cell(cost_val, center=True),
                        cell(task_str[:140]),
                    ])
            rdt = Table(road_data, colWidths=[1.7 * inch, 0.9 * inch, 1.1 * inch, 3.6 * inch])
            rdt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(rdt)
            if hasattr(roadmap, 'timeline') and roadmap.timeline:
                elements.append(Paragraph(f"<b>Estimated Time-to-Market:</b> {safe(roadmap.timeline)}", small_style))

        # ═══════════════════════════════════════════════════════════════
        # ── 11. OVERALL EXECUTIVE SUMMARY & STRATEGIC VERDICT ──
        # ═══════════════════════════════════════════════════════════════
        elements.append(Spacer(1, 0.05 * inch))
        elements.append(Paragraph("11. Overall Executive Summary & Strategic Verdict", heading_style))

        # Summary Scorecard Table
        summary_data = [[cell('Analysis Dimension', header=True), cell('Score / Metric', header=True), cell('Strategic Verdict', header=True)]]

        success_prob = None
        if overview and hasattr(overview, 'success_probability'):
            success_prob = float(overview.success_probability) if overview.success_probability else None

        if success_prob:
            verdict = 'High Success Probability' if success_prob > 65 else ('Moderate Potential' if success_prob > 50 else 'High Execution Risk')
            summary_data.append([cell('Success Probability Model', bold=True), cell(f"{success_prob:.1f}%"), cell(verdict)])

        if market:
            opp = float(market.opportunity_score)
            verdict = 'Strong Commercial Opportunity' if opp > 70 else ('Solid Growth Potential' if opp > 50 else 'Challenging Market Fit')
            summary_data.append([cell('Market Opportunity Score', bold=True), cell(f"{opp:.1f}/100"), cell(verdict)])

        if financial:
            roi_v = float(financial.roi)
            margin_v = float(financial.profit_margins)
            verdict = 'Exceptional ROI' if roi_v > 150 else ('Healthy Return' if roi_v > 80 else ('Moderate Return' if roi_v > 40 else 'Capital Constrained'))
            summary_data.append([cell('Projected Financial ROI', bold=True), cell(f"{roi_v:.1f}%"), cell(verdict)])
            summary_data.append([cell('Operating Net Margin', bold=True), cell(f"{margin_v:.1f}%"), cell('Strong Unit Economics' if margin_v > 30 else ('Sustainable Margin' if margin_v > 15 else 'Thin Margins'))])

        if risk:
            risk_v = float(risk.overall_risk)
            verdict = 'Elevated Risk Profile' if risk_v > 60 else ('Manageable Controlled Risk' if risk_v > 35 else 'Low Risk Exposure')
            summary_data.append([cell('Composite Risk Level', bold=True), cell(f"{risk_v:.1f}/100"), cell(verdict)])

        if feasibility:
            feas_v = float(feasibility.overall_feasibility)
            verdict = 'Operationally Feasible' if feas_v > 70 else ('Viable with Key Mitigations' if feas_v > 50 else 'Significant Bottlenecks')
            summary_data.append([cell('Execution Feasibility', bold=True), cell(f"{feas_v:.1f}/100"), cell(verdict)])

        if investor:
            inv_v = float(investor.investor_score)
            verdict = 'Institutional Investor Ready' if inv_v > 70 else ('Angel / Seed Stage Ready' if inv_v > 50 else 'Pre-Investment Stage')
            summary_data.append([cell('Investor Readiness', bold=True), cell(f"{inv_v:.1f}/100"), cell(verdict)])

        st2 = Table(summary_data, colWidths=[2.5 * inch, 2.0 * inch, 2.8 * inch])
        st2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(st2)
        elements.append(Spacer(1, 0.06 * inch))

        # Structured, Left-Aligned Analytical Narrative with Proper Spacing
        # 1. Venture Profile
        budget_disp = f"INR {float(idea.budget):,.0f}" if idea.budget else "an optimized seed budget"
        elements.append(Paragraph(
            f"<b>Venture Profile:</b> <b>{safe(idea.title)}</b> operates in the <b>{safe(idea.industry)}</b> industry ({safe(idea.sector)} model) positioned for {safe(idea.business_stage or 'early')} deployment with an allocated budget of {budget_disp}.",
            summary_text_style
        ))

        # 2. Commercial Opportunity
        if market:
            elements.append(Paragraph(
                f"<b>Commercial Opportunity:</b> The addressable market shows <b>{safe(market.demand_level)}</b> demand intensity with a projected CAGR of <b>{float(market.growth_rate):.1f}%</b>, generating an Opportunity Score of <b>{float(market.opportunity_score):.1f}/100</b>.",
                summary_text_style
            ))

        # 3. Financial Returns
        if financial:
            elements.append(Paragraph(
                f"<b>Financial Returns:</b> Multi-year pro forma projections indicate an estimated ROI of <b>{float(financial.roi):.1f}%</b> paired with net operating margins of <b>{float(financial.profit_margins):.1f}%</b>. {safe(financial.break_even_analysis)}",
                summary_text_style
            ))

        # 4. Risk & Mitigations
        if risk:
            risk_level_str = 'elevated' if float(risk.overall_risk) > 60 else ('manageable' if float(risk.overall_risk) > 35 else 'low-risk')
            elements.append(Paragraph(
                f"<b>Risk Profile & Mitigations:</b> Overall risk is quantified at <b>{float(risk.overall_risk):.1f}/100</b> ({risk_level_str}). Primary exposure stems from technical execution and market adoption, mitigated by disciplined milestone roadmapping and phased capital deployment.",
                summary_text_style
            ))

        # 5. Investor Readiness
        if investor:
            investor_verdict = 'primed for formal investor introductions and pitch presentations' if float(investor.investor_score) > 60 else 'recommended to achieve early traction and beta customer validation prior to institutional rounds'
            elements.append(Paragraph(
                f"<b>Investor Readiness:</b> Scoring <b>{float(investor.investor_score):.1f}/100</b>, the venture is {investor_verdict}.",
                summary_text_style
            ))

        # 6. Strategic Moat & SWOT Highlights
        if swot:
            strengths_list = swot.strengths if isinstance(swot.strengths, list) else []
            threats_list = swot.threats if isinstance(swot.threats, list) else []
            if strengths_list:
                elements.append(Paragraph(f"<b>Key Competitive Moat:</b> {safe(strengths_list[0])}", summary_text_style))
            if threats_list:
                elements.append(Paragraph(f"<b>Primary Threat to Monitor:</b> {safe(threats_list[0])}", summary_text_style))

        # ── Highlighted Strategic Recommendation Callout Box ──
        if financial and feasibility:
            roi_v = float(financial.roi)
            feas_v = float(feasibility.overall_feasibility)
            if roi_v > 100 and feas_v > 55:
                verdict_headline = "[RECOMMENDED] STRONG COMMERCIAL POTENTIAL - PROCEED TO MVP BUILD"
                verdict_text = "The analysis indicates compelling market fit, robust unit economics, and achievable execution timelines. Priority action: initiate Phase 1 prototyping and secure 5-10 pilot customers for validation."
                box_bg = ACCENT_GREEN_BG
                border_color = ACCENT_GREEN
            elif roi_v > 50 and feas_v > 45:
                verdict_headline = "[RECOMMENDED] MODERATE POTENTIAL - PROCEED WITH FOCUSED DE-RISKING"
                verdict_text = "The business concept demonstrates viable fundamentals. Priority action: validate customer acquisition costs through targeted pilot campaigns before allocating major capital expenditure."
                box_bg = HexColor('#fef3c7') # Amber light
                border_color = ACCENT_ORANGE
            else:
                verdict_headline = "[RECOMMENDED] CONDITIONAL - REFINE VALUE PROPOSITION & COST STRUCTURE"
                verdict_text = "Capital intensity or competitive saturation warrants architectural refinement. Priority action: conduct customer discovery interviews to identify higher-margin niche segments."
                box_bg = HexColor('#fee2e2') # Rose light
                border_color = ACCENT_RED

            rec_box_content = [
                Paragraph(f"<b>{verdict_headline}</b>", ParagraphStyle('RecHead', parent=body_style, fontSize=9, textColor=DARK, fontName='Helvetica-Bold', leading=12)),
                Spacer(1, 0.02 * inch),
                Paragraph(verdict_text, ParagraphStyle('RecText', parent=body_style, fontSize=8, textColor=TEXT, leading=11))
            ]

            rec_table = Table([[rec_box_content]], colWidths=[7.3 * inch])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), box_bg),
                ('BOX', (0, 0), (-1, -1), 1, border_color),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(Spacer(1, 0.05 * inch))
            elements.append(rec_table)

        # ── Document Footer ──
        elements.append(Spacer(1, 0.1 * inch))
        timestamp_str = datetime.utcnow().strftime('%B %d, %Y')
        footer_text = f"-- Generated by Vision2Venture AI Platform on {timestamp_str} | Confidential Venture Intelligence Report --"
        elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=center_style, fontSize=7.5, textColor=MUTED)))

        doc.build(elements)

        # Save to DB
        report_record = db.query(Report).filter(Report.idea_id == idea_id).first()
        if report_record:
            report_record.pdf_location = pdf_filename
        else:
            report_record = Report(idea_id=idea_id, pdf_location=pdf_filename)
            db.add(report_record)

        db.commit()
        return pdf_filename
