from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os
import uuid
import json
from sqlalchemy.orm import Session
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, Competitor, TechnologyRecommendation,
    BusinessModel, SwotAnalysis, FinancialAnalysis, RiskAnalysis,
    FeasibilityAnalysis, InvestorReadiness, ImplementationRoadmap, Report
)

# Color palette
PRIMARY = HexColor('#667eea')
SECONDARY = HexColor('#764ba2')
DARK = HexColor('#0a0e27')
TEXT = HexColor('#333333')
LIGHT_BG = HexColor('#f0f2f5')
ACCENT_GREEN = HexColor('#27ae60')
ACCENT_RED = HexColor('#e74c3c')
ACCENT_BLUE = HexColor('#2980b9')
ACCENT_ORANGE = HexColor('#e67e22')
WHITE = HexColor('#ffffff')


class ReportService:
    @staticmethod
    def _safe_str(val, default='N/A'):
        if val is None:
            return default
        if isinstance(val, (list, dict)):
            return json.dumps(val, indent=2) if val else default
        return str(val)

    @staticmethod
    def generate_pdf(idea_id: str, db: Session) -> str:
        idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
        if not idea:
            return None

        # Ensure reports directory exists
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        pdf_filename = os.path.join(reports_dir, f"{idea_id}_{uuid.uuid4().hex[:8]}.pdf")

        # Fetch all analysis data
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

        # Build PDF — compact margins to prevent empty white space
        doc = SimpleDocTemplate(pdf_filename, pagesize=letter,
                                topMargin=0.5*inch, bottomMargin=0.4*inch,
                                leftMargin=0.6*inch, rightMargin=0.6*inch)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=20, textColor=PRIMARY, spaceAfter=3, spaceBefore=0)
        heading_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=PRIMARY, spaceBefore=6, spaceAfter=2, keepWithNext=True)
        subheading_style = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=10, textColor=SECONDARY, spaceBefore=4, spaceAfter=2, keepWithNext=True)
        body_style = ParagraphStyle('Body', parent=styles['BodyText'], fontSize=9, textColor=TEXT, spaceAfter=2, leading=12)
        center_style = ParagraphStyle('Center', parent=body_style, alignment=TA_CENTER)
        small_style = ParagraphStyle('Small', parent=body_style, fontSize=8, textColor=HexColor('#555555'), spaceAfter=1, leading=10)

        table_bold_style = ParagraphStyle('TableBold', parent=body_style, fontSize=8.5, textColor=PRIMARY, fontName='Helvetica-Bold', leading=11)
        table_header_bold = ParagraphStyle('TableHeaderBold', parent=body_style, fontSize=8.5, textColor=WHITE, fontName='Helvetica-Bold', leading=11)
        table_body_style = ParagraphStyle('TableBody', parent=body_style, fontSize=8.5, textColor=TEXT, leading=11)

        # Compact table style (reusable)
        compact_table_style = TableStyle([
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
        ])

        def cell(text, bold=False, header=False):
            t = ReportService._safe_str(text)
            if header:
                return Paragraph(f"<b>{t}</b>", table_header_bold)
            if bold:
                return Paragraph(f"<b>{t}</b>", table_bold_style)
            return Paragraph(t, table_body_style)

        safe = ReportService._safe_str
        elements = []

        # ── Cover Page (compact) ──
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph("Vision2Venture", title_style))
        elements.append(Paragraph("AI-Powered Startup Analysis Report", center_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"<b>{idea.title}</b>", ParagraphStyle('big', parent=title_style, fontSize=16, alignment=TA_CENTER)))
        elements.append(Spacer(1, 0.15*inch))

        info_data = [
            [cell('Sector', bold=True), cell((idea.sector or 'N/A').capitalize()), cell('Business Type', bold=True), cell(idea.business_type or 'N/A')],
            [cell('Industry', bold=True), cell(idea.industry or 'N/A'), cell('Stage', bold=True), cell(idea.business_stage or 'N/A')],
            [cell('Budget', bold=True), cell(f"${float(idea.budget or 0):,.0f}"), cell('Team Skills', bold=True), cell(idea.team_skills or 'N/A')],
        ]
        info_table = Table(info_data, colWidths=[1.3*inch, 2.3*inch, 1.3*inch, 2.3*inch])
        info_table.setStyle(compact_table_style)
        elements.append(info_table)
        elements.append(PageBreak())

        # ── 1. Overview ──
        elements.append(Paragraph("1. Business Overview", heading_style))
        if overview:
            overview_data = [
                [cell('Domain', bold=True), cell(overview.business_domain)],
                [cell('Category', bold=True), cell(overview.business_category)],
                [cell('Target Users', bold=True), cell(overview.target_users)],
                [cell('Problem', bold=True), cell(overview.problem_statement)],
                [cell('Solution', bold=True), cell(overview.solution)],
            ]
            kw = overview.keywords if isinstance(overview.keywords, list) else []
            if kw:
                overview_data.append([cell('Keywords', bold=True), cell(', '.join(kw))])
            ot = Table(overview_data, colWidths=[1.5*inch, 5.7*inch])
            ot.setStyle(compact_table_style)
            elements.append(ot)
        else:
            elements.append(Paragraph("Overview data not available.", body_style))

        # ── 2. Market Analysis ──
        elements.append(Paragraph("2. Market Analysis", heading_style))
        if market:
            market_data = [
                [cell('Metric', header=True), cell('Value', header=True)],
                [cell('Market Size', bold=True), cell(market.market_size)],
                [cell('Growth Rate', bold=True), cell(f"{float(market.growth_rate)}%")],
                [cell('Demand Level', bold=True), cell(market.demand_level)],
                [cell('Opportunity Score', bold=True), cell(f"{float(market.opportunity_score)}/100")],
            ]
            mt = Table(market_data, colWidths=[2.2*inch, 5.0*inch])
            mt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(mt)
            trends = market.industry_trends if isinstance(market.industry_trends, list) else []
            if trends:
                elements.append(Paragraph("<b>Industry Trends:</b> " + " | ".join(trends), small_style))
            elements.append(Paragraph(f"<b>Analysis:</b> {safe(market.market_analysis_explanation)}", small_style))
        else:
            elements.append(Paragraph("Market analysis data not available.", body_style))

        # ── 3. Competitor Analysis ──
        elements.append(Paragraph("3. Competitor Analysis", heading_style))
        if competitors:
            comp_data = [[cell('Name', header=True), cell('Similarity', header=True), cell('Strengths', header=True), cell('USP', header=True)]]
            for c in competitors[:5]:  # Limit to top 5 competitors
                comp_data.append([
                    cell(c.name, bold=True),
                    cell(f"{float(c.similarity_score)}%"),
                    cell(safe(c.strengths)[:100]),
                    cell(safe(c.usp)[:100]),
                ])
            ct = Table(comp_data, colWidths=[1.5*inch, 0.8*inch, 2.5*inch, 2.4*inch])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(ct)
        else:
            elements.append(Paragraph("Competitor data not available.", body_style))

        # ── 4. Technology Recommendations ──
        elements.append(Paragraph("4. Technology Stack", heading_style))
        if tech:
            tech_data = [
                [cell('Component', header=True), cell('Recommendation', header=True)],
                [cell('Frontend', bold=True), cell(tech.frontend)],
                [cell('Backend', bold=True), cell(tech.backend)],
                [cell('Database', bold=True), cell(tech.database_system)],
                [cell('Cloud', bold=True), cell(tech.cloud_platform)],
                [cell('AI Framework', bold=True), cell(tech.ai_framework)],
                [cell('Deployment', bold=True), cell(tech.deployment)],
            ]
            tt = Table(tech_data, colWidths=[2.0*inch, 5.2*inch])
            tt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(tt)
            elements.append(Paragraph(f"<b>Reasoning:</b> {safe(tech.reasoning)}", small_style))

        # ── 5. Business Model Canvas ──
        elements.append(Paragraph("5. Business Model Canvas", heading_style))
        if bm:
            bm_data = [
                [cell('Aspect', header=True), cell('Details', header=True)],
                [cell('Customer Segments', bold=True), cell(bm.customer_segments)],
                [cell('Value Proposition', bold=True), cell(bm.value_proposition)],
                [cell('Revenue Streams', bold=True), cell(bm.revenue_streams)],
                [cell('Channels', bold=True), cell(bm.channels)],
                [cell('Key Partners', bold=True), cell(bm.key_partners)],
                [cell('Key Activities', bold=True), cell(bm.key_activities)],
                [cell('Key Resources', bold=True), cell(bm.key_resources)],
                [cell('Cost Structure', bold=True), cell(bm.cost_structure)],
            ]
            bt = Table(bm_data, colWidths=[2.0*inch, 5.2*inch])
            bt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(bt)

        # ── 6. SWOT Analysis ──
        elements.append(Paragraph("6. SWOT Analysis", heading_style))
        if swot:
            def fmt_list(items):
                if isinstance(items, list):
                    return '<br/>'.join(f"• {i}" for i in items)
                return safe(items)
            swot_data = [
                [cell('Strengths', header=True), cell('Weaknesses', header=True)],
                [Paragraph(fmt_list(swot.strengths), table_body_style), Paragraph(fmt_list(swot.weaknesses), table_body_style)],
                [cell('Opportunities', header=True), cell('Threats', header=True)],
                [Paragraph(fmt_list(swot.opportunities), table_body_style), Paragraph(fmt_list(swot.threats), table_body_style)],
            ]
            st = Table(swot_data, colWidths=[3.6*inch, 3.6*inch])
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
                elements.append(Paragraph(f"<b>Overall Assessment:</b> {safe(swot.overall_assessment)}", small_style))

        # ── 7. Financial Projections (Compact 4-column layout to fit on same page) ──
        elements.append(Paragraph("7. Financial Projections", heading_style))
        if financial:
            fin_items = []
            if idea.sector in ['online', 'hybrid']:
                fin_items.extend([
                    ('Subscription Rev', f"${float(financial.subscription_revenue):,.0f}"),
                    ('MRR', f"${float(financial.monthly_recurring_revenue):,.0f}"),
                    ('CAC', f"${float(financial.customer_acquisition_cost):,.0f}"),
                    ('LTV', f"${float(financial.lifetime_value):,.0f}"),
                ])
            if idea.sector in ['offline', 'hybrid']:
                fin_items.extend([
                    ('Daily Customers', f"{financial.daily_customers_estimate}"),
                    ('Avg Order Value', f"${float(financial.average_order_value):,.0f}"),
                    ('Monthly Revenue', f"${float(financial.monthly_revenue):,.0f}"),
                    ('Rent+Staff+Costs', f"${float(financial.rent_cost + financial.staff_cost + financial.raw_material_cost):,.0f}"),
                ])
            fin_items.extend([
                ('Dev Cost', f"${float(financial.development_cost):,.0f}"),
                ('Monthly Op Cost', f"${float(financial.monthly_operating_cost):,.0f}"),
                ('ROI', f"{float(financial.roi):.1f}%"),
                ('Profit Margins', f"{float(financial.profit_margins):.1f}%"),
            ])

            # Convert pairs to 4-column compact table
            fin_data = [[cell('Metric', header=True), cell('Amount', header=True), cell('Metric', header=True), cell('Amount', header=True)]]
            for i in range(0, len(fin_items), 2):
                row = []
                row.extend([cell(fin_items[i][0], bold=True), cell(fin_items[i][1])])
                if i + 1 < len(fin_items):
                    row.extend([cell(fin_items[i+1][0], bold=True), cell(fin_items[i+1][1])])
                else:
                    row.extend([cell(''), cell('')])
                fin_data.append(row)

            ft = Table(fin_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
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
                elements.append(Paragraph(f"<b>Break-Even:</b> {safe(financial.break_even_analysis)}", small_style))

        # ── 8. Risk Assessment ──
        elements.append(Paragraph("8. Risk Assessment", heading_style))
        if risk:
            def get_risk_row(name, rdata):
                if isinstance(rdata, dict):
                    score = rdata.get('score', 0)
                    severity = rdata.get('severity', 'N/A')
                    return [cell(name, bold=True), cell(f"{score:.1f}"), cell(severity), cell(safe(rdata.get('explanation', ''))[:150])]
                return [cell(name, bold=True), cell('N/A'), cell('N/A'), cell('N/A')]

            risk_data = [[cell('Risk Type', header=True), cell('Score', header=True), cell('Level', header=True), cell('Assessment', header=True)]]
            risk_data.append(get_risk_row('Technical', risk.technical_risk))
            risk_data.append(get_risk_row('Market', risk.market_risk))
            risk_data.append(get_risk_row('Competition', risk.competition_risk))
            risk_data.append(get_risk_row('Financial', risk.financial_risk))
            risk_data.append(get_risk_row('Operational', risk.operational_risk))

            rt = Table(risk_data, colWidths=[1.2*inch, 0.6*inch, 0.7*inch, 4.7*inch])
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
            elements.append(Paragraph(f"<b>Overall Risk Score: {float(risk.overall_risk):.1f}/100</b>", body_style))

        # ── 9. Feasibility & Investor Readiness ──
        elements.append(Paragraph("9. Feasibility & Investor Readiness", heading_style))
        if feasibility or investor:
            fi_data = [[cell('Metric', header=True), cell('Score', header=True)]]
            if feasibility:
                fi_data.extend([
                    [cell('Market Feasibility', bold=True), cell(f"{float(feasibility.market_score):.1f}/100")],
                    [cell('Technical Feasibility', bold=True), cell(f"{float(feasibility.technical_score):.1f}/100")],
                    [cell('Financial Feasibility', bold=True), cell(f"{float(feasibility.financial_score):.1f}/100")],
                    [cell('Innovation Index', bold=True), cell(f"{float(feasibility.innovation_score):.1f}/100")],
                    [cell('Overall Feasibility', bold=True), cell(f"{float(feasibility.overall_feasibility):.1f}/100")],
                ])
            if investor:
                fi_data.extend([
                    [cell('Scalability', bold=True), cell(f"{float(investor.scalability):.1f}/100")],
                    [cell('Innovation', bold=True), cell(f"{float(investor.innovation):.1f}/100")],
                    [cell('Business Model', bold=True), cell(f"{float(investor.business_model):.1f}/100")],
                    [cell('Market Appeal', bold=True), cell(f"{float(investor.market):.1f}/100")],
                    [cell('Investor Readiness Score', bold=True), cell(f"{float(investor.investor_score):.1f}/100")],
                ])
            fit = Table(fi_data, colWidths=[3.2*inch, 4.0*inch])
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

            if investor:
                suggestions = investor.suggestions if isinstance(investor.suggestions, list) else []
                if suggestions:
                    elements.append(Paragraph("<b>Key Recommendations:</b> " + " | ".join(suggestions[:4]), small_style))

        # ── 10. Roadmap ──
        elements.append(Paragraph("10. Implementation Roadmap", heading_style))
        if roadmap:
            road_data = [[cell('Phase', header=True), cell('Duration', header=True), cell('Cost', header=True), cell('Key Tasks', header=True)]]
            for i in range(1, 6):
                phase = getattr(roadmap, f'phase_{i}', None)
                if phase and isinstance(phase, dict):
                    tasks = phase.get('tasks', [])
                    task_str = ', '.join(tasks[:3]) if tasks else 'N/A'
                    road_data.append([
                        cell(f"Phase {i}: {phase.get('name', 'N/A')}", bold=True),
                        cell(phase.get('duration', 'N/A')),
                        cell(phase.get('estimated_cost', 'N/A')),
                        cell(task_str[:120]),
                    ])
            rdt = Table(road_data, colWidths=[1.8*inch, 1.0*inch, 1.0*inch, 3.4*inch])
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
            elements.append(Paragraph(f"<b>Total Timeline:</b> {safe(roadmap.timeline)}", body_style))

        # ═══════════════════════════════════════════════════════════════
        # ── 11. OVERALL SUMMARY (Final section — simple user overview) ──
        # ═══════════════════════════════════════════════════════════════
        elements.append(Paragraph("11. Overall Executive Summary", heading_style))

        # Build summary scores table
        summary_data = [[cell('Analysis Area', header=True), cell('Score / Result', header=True), cell('Verdict', header=True)]]

        # Success probability
        success_prob = None
        if overview and hasattr(overview, 'success_probability'):
            success_prob = float(overview.success_probability) if overview.success_probability else None

        if success_prob:
            verdict = 'Promising' if success_prob > 65 else ('Moderate' if success_prob > 50 else 'Needs Work')
            summary_data.append([cell('Success Probability', bold=True), cell(f"{success_prob:.1f}%"), cell(verdict)])

        if market:
            opp = float(market.opportunity_score)
            verdict = 'Strong Opportunity' if opp > 70 else ('Good Potential' if opp > 50 else 'Challenging Market')
            summary_data.append([cell('Market Opportunity', bold=True), cell(f"{opp:.1f}/100"), cell(verdict)])

        if financial:
            roi_v = float(financial.roi)
            margin_v = float(financial.profit_margins)
            verdict = 'Excellent Returns' if roi_v > 150 else ('Good Returns' if roi_v > 80 else ('Moderate Returns' if roi_v > 40 else 'Low Returns'))
            summary_data.append([cell('Financial ROI', bold=True), cell(f"{roi_v:.1f}%"), cell(verdict)])
            summary_data.append([cell('Profit Margins', bold=True), cell(f"{margin_v:.1f}%"), cell('Healthy' if margin_v > 30 else ('Moderate' if margin_v > 15 else 'Tight'))])

        if risk:
            risk_v = float(risk.overall_risk)
            verdict = 'High Risk' if risk_v > 60 else ('Moderate Risk' if risk_v > 35 else 'Low Risk')
            summary_data.append([cell('Overall Risk', bold=True), cell(f"{risk_v:.1f}/100"), cell(verdict)])

        if feasibility:
            feas_v = float(feasibility.overall_feasibility)
            verdict = 'Highly Feasible' if feas_v > 70 else ('Feasible' if feas_v > 50 else 'Challenging')
            summary_data.append([cell('Feasibility', bold=True), cell(f"{feas_v:.1f}/100"), cell(verdict)])

        if investor:
            inv_v = float(investor.investor_score)
            verdict = 'Investor Ready' if inv_v > 70 else ('Almost Ready' if inv_v > 50 else 'Needs Preparation')
            summary_data.append([cell('Investor Readiness', bold=True), cell(f"{inv_v:.1f}/100"), cell(verdict)])

        st2 = Table(summary_data, colWidths=[2.6*inch, 2.0*inch, 2.6*inch])
        st2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(st2)
        elements.append(Spacer(1, 0.05*inch))

        # Simple text summary for the user
        summary_parts = []
        summary_parts.append(f"<b>{idea.title}</b> is a {safe(idea.industry)} startup in the {safe(idea.sector)} sector with a budget of ${float(idea.budget or 0):,.0f}.")

        if financial:
            summary_parts.append(f"The financial analysis projects an ROI of {float(financial.roi):.1f}% with profit margins of {float(financial.profit_margins):.1f}%.")

        if risk:
            risk_level = 'high' if float(risk.overall_risk) > 60 else ('moderate' if float(risk.overall_risk) > 35 else 'manageable')
            summary_parts.append(f"Overall risk level is {risk_level} at {float(risk.overall_risk):.1f}/100.")

        if feasibility:
            feas_level = 'highly feasible' if float(feasibility.overall_feasibility) > 70 else ('feasible' if float(feasibility.overall_feasibility) > 50 else 'challenging')
            summary_parts.append(f"The venture is assessed as {feas_level} with an overall score of {float(feasibility.overall_feasibility):.1f}/100.")

        if investor:
            ready = 'ready for investor conversations' if float(investor.investor_score) > 60 else 'recommended to build more traction before approaching investors'
            summary_parts.append(f"Based on our analysis, this startup is {ready} (score: {float(investor.investor_score):.1f}/100).")

        # Top strengths and concerns
        if swot:
            strengths_list = swot.strengths if isinstance(swot.strengths, list) else []
            threats_list = swot.threats if isinstance(swot.threats, list) else []
            if strengths_list:
                summary_parts.append(f"<b>Top Strength:</b> {strengths_list[0]}")
            if threats_list:
                summary_parts.append(f"<b>Key Concern:</b> {threats_list[0]}")

        elements.append(Paragraph(" ".join(summary_parts), body_style))

        # Final recommendation
        if financial and feasibility:
            roi_v = float(financial.roi)
            feas_v = float(feasibility.overall_feasibility)
            if roi_v > 100 and feas_v > 55:
                recommendation = "✓ RECOMMENDATION: This startup idea shows strong potential. Proceed with building an MVP and begin customer validation."
            elif roi_v > 50 and feas_v > 45:
                recommendation = "✓ RECOMMENDATION: This idea has moderate potential. Focus on reducing risks and validating product-market fit before major investment."
            else:
                recommendation = "✓ RECOMMENDATION: Consider pivoting the business model or exploring alternative markets to improve financial viability."
            elements.append(Paragraph(recommendation, ParagraphStyle('Rec', parent=body_style, fontSize=9.5, textColor=PRIMARY, fontName='Helvetica-Bold', spaceBefore=3)))

        # ── Footer ──
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("— Generated by Vision2Venture AI Platform —", ParagraphStyle('Footer', parent=center_style, fontSize=8, textColor=HexColor('#999999'))))

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
