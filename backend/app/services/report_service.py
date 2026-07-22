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

        # Build PDF
        doc = SimpleDocTemplate(pdf_filename, pagesize=letter,
                                topMargin=0.75*inch, bottomMargin=0.75*inch,
                                leftMargin=0.75*inch, rightMargin=0.75*inch)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=24, textColor=PRIMARY, spaceAfter=6)
        heading_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=16, textColor=PRIMARY, spaceBefore=16, spaceAfter=8)
        subheading_style = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=13, textColor=SECONDARY, spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle('Body', parent=styles['BodyText'], fontSize=10, textColor=TEXT, spaceAfter=6, leading=14)
        center_style = ParagraphStyle('Center', parent=body_style, alignment=TA_CENTER)

        safe = ReportService._safe_str
        elements = []

        # ── Cover Page ──
        elements.append(Spacer(1, 2*inch))
        elements.append(Paragraph("Vision2Venture", title_style))
        elements.append(Paragraph("AI-Powered Startup Analysis Report", center_style))
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(f"<b>{idea.title}</b>", ParagraphStyle('big', parent=title_style, fontSize=20, alignment=TA_CENTER)))
        elements.append(Spacer(1, 0.3*inch))

        info_data = [
            ['Sector', (idea.sector or 'N/A').capitalize(), 'Business Type', idea.business_type or 'N/A'],
            ['Industry', idea.industry or 'N/A', 'Stage', idea.business_stage or 'N/A'],
            ['Budget', f"${float(idea.budget or 0):,.0f}", 'Team Skills', (idea.team_skills or 'N/A')[:50]],
        ]
        info_table = Table(info_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        info_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (0, -1), PRIMARY),
            ('TEXTCOLOR', (2, 0), (2, -1), PRIMARY),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
        ]))
        elements.append(info_table)
        elements.append(PageBreak())

        # ── 1. Overview ──
        elements.append(Paragraph("1. Business Overview", heading_style))
        if overview:
            elements.append(Paragraph(f"<b>Domain:</b> {safe(overview.business_domain)}", body_style))
            elements.append(Paragraph(f"<b>Category:</b> {safe(overview.business_category)}", body_style))
            elements.append(Paragraph(f"<b>Target Users:</b> {safe(overview.target_users)}", body_style))
            elements.append(Paragraph(f"<b>Problem:</b> {safe(overview.problem_statement)}", body_style))
            elements.append(Paragraph(f"<b>Solution:</b> {safe(overview.solution)}", body_style))
            kw = overview.keywords if isinstance(overview.keywords, list) else []
            elements.append(Paragraph(f"<b>Keywords:</b> {', '.join(kw)}", body_style))
        else:
            elements.append(Paragraph("Overview data not available.", body_style))

        # ── 2. Market Analysis ──
        elements.append(Paragraph("2. Market Analysis", heading_style))
        if market:
            market_data = [
                ['Market Size', safe(market.market_size)],
                ['Growth Rate', f"{float(market.growth_rate)}%"],
                ['Demand Level', safe(market.demand_level)],
                ['Opportunity Score', f"{float(market.opportunity_score)}/100"],
            ]
            mt = Table(market_data, colWidths=[2*inch, 4.5*inch])
            mt.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(mt)
            trends = market.industry_trends if isinstance(market.industry_trends, list) else []
            if trends:
                elements.append(Paragraph("<b>Industry Trends:</b>", body_style))
                for t in trends:
                    elements.append(Paragraph(f"• {t}", body_style))
            elements.append(Paragraph(f"<b>Market Explanation:</b> {safe(market.market_analysis_explanation)}", body_style))
        else:
            elements.append(Paragraph("Market analysis data not available.", body_style))

        # ── 3. Competitor Analysis ──
        elements.append(Paragraph("3. Competitor Analysis", heading_style))
        if competitors:
            for c in competitors:
                elements.append(Paragraph(f"<b>{c.name}</b> (Similarity: {float(c.similarity_score)}%)", subheading_style))
                elements.append(Paragraph(f"Strengths: {safe(c.strengths)}", body_style))
                elements.append(Paragraph(f"Weaknesses: {safe(c.weaknesses)}", body_style))
                elements.append(Paragraph(f"USP: {safe(c.usp)}", body_style))
                elements.append(Paragraph(f"Explanation: {safe(c.analysis_explanation)}", body_style))
        else:
            elements.append(Paragraph("Competitor data not available.", body_style))

        # ── 4. Technology Recommendations ──
        elements.append(PageBreak())
        elements.append(Paragraph("4. Technology Stack", heading_style))
        if tech:
            tech_data = [
                ['Frontend', safe(tech.frontend)],
                ['Backend', safe(tech.backend)],
                ['Database', safe(tech.database_system)],
                ['Cloud', safe(tech.cloud_platform)],
                ['AI Framework', safe(tech.ai_framework)],
                ['Deployment', safe(tech.deployment)],
            ]
            tt = Table(tech_data, colWidths=[2*inch, 4.5*inch])
            tt.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('BACKGROUND', (0, 0), (0, -1), LIGHT_BG),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(tt)
            elements.append(Paragraph(f"<b>Reasoning:</b> {safe(tech.reasoning)}", body_style))

        # ── 5. Business Model Canvas ──
        elements.append(Paragraph("5. Business Model Canvas", heading_style))
        if bm:
            bm_data = [
                ['Customer Segments', safe(bm.customer_segments)],
                ['Value Proposition', safe(bm.value_proposition)],
                ['Revenue Streams', safe(bm.revenue_streams)],
                ['Channels', safe(bm.channels)],
                ['Key Partners', safe(bm.key_partners)],
                ['Key Activities', safe(bm.key_activities)],
                ['Key Resources', safe(bm.key_resources)],
                ['Cost Structure', safe(bm.cost_structure)],
            ]
            bt = Table(bm_data, colWidths=[2*inch, 4.5*inch])
            bt.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
            ]))
            elements.append(bt)
            elements.append(Paragraph(f"<b>Detailed Explanation:</b> {safe(bm.detailed_explanation)}", body_style))

        # ── 6. SWOT Analysis ──
        elements.append(Paragraph("6. SWOT Analysis", heading_style))
        if swot:
            def fmt_list(items):
                if isinstance(items, list):
                    return '\n'.join(f"• {i}" for i in items)
                return safe(items)
            swot_data = [
                ['Strengths', 'Weaknesses'],
                [Paragraph(fmt_list(swot.strengths), body_style), Paragraph(fmt_list(swot.weaknesses), body_style)],
                ['Opportunities', 'Threats'],
                [Paragraph(fmt_list(swot.opportunities), body_style), Paragraph(fmt_list(swot.threats), body_style)],
            ]
            st = Table(swot_data, colWidths=[3.25*inch, 3.25*inch])
            st.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
                ('TEXTCOLOR', (0, 0), (0, 0), HexColor('#27ae60')),
                ('TEXTCOLOR', (1, 0), (1, 0), HexColor('#e74c3c')),
                ('TEXTCOLOR', (0, 2), (0, 2), HexColor('#2980b9')),
                ('TEXTCOLOR', (1, 2), (1, 2), HexColor('#e67e22')),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(st)
            elements.append(Paragraph(f"<b>Overall Assessment:</b> {safe(swot.overall_assessment)}", body_style))

        # ── 7. Financial Projections ──
        elements.append(PageBreak())
        elements.append(Paragraph("7. Financial Projections", heading_style))
        if financial:
            fin_data = [['Metric', 'Amount']]
            
            if idea.sector in ['online', 'hybrid']:
                fin_data.extend([
                    ['Subscription Revenue', f"${float(financial.subscription_revenue):,.0f}"],
                    ['MRR', f"${float(financial.monthly_recurring_revenue):,.0f}"],
                    ['CAC', f"${float(financial.customer_acquisition_cost):,.0f}"],
                    ['LTV', f"${float(financial.lifetime_value):,.0f}"],
                ])
                
            if idea.sector in ['offline', 'hybrid']:
                fin_data.extend([
                    ['Daily Customers', f"{financial.daily_customers_estimate}"],
                    ['AOV', f"${float(financial.average_order_value):,.0f}"],
                    ['Monthly Revenue', f"${float(financial.monthly_revenue):,.0f}"],
                    ['Rent/Staff/Raw Cost', f"${float(financial.rent_cost + financial.staff_cost + financial.raw_material_cost):,.0f}"],
                ])

            fin_data.extend([
                ['Development Cost', f"${float(financial.development_cost):,.0f}"],
                ['Monthly Operating Cost', f"${float(financial.monthly_operating_cost):,.0f}"],
                ['ROI', f"{float(financial.roi):.1f}%"],
                ['Profit Margins', f"{float(financial.profit_margins):.1f}%"],
            ])
            
            ft = Table(fin_data, colWidths=[3*inch, 3.5*inch])
            ft.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BG),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(ft)
            elements.append(Paragraph(f"<b>Break Even:</b> {safe(financial.break_even_analysis)}", body_style))
            elements.append(Paragraph(f"<b>Detailed Explanation:</b> {safe(financial.detailed_explanation)}", body_style))

        # ── 8. Risk & Feasibility ──
        elements.append(Paragraph("8. Risk Assessment", heading_style))
        if risk:
            def print_risk(name, rdata):
                if isinstance(rdata, dict):
                    return f"{name}: {rdata.get('score', 0)} ({rdata.get('severity', '')}) - {rdata.get('explanation', '')}"
                return f"{name}: N/A"

            elements.append(Paragraph(print_risk("Technical", risk.technical_risk), body_style))
            elements.append(Paragraph(print_risk("Market", risk.market_risk), body_style))
            elements.append(Paragraph(print_risk("Competition", risk.competition_risk), body_style))
            elements.append(Paragraph(print_risk("Financial", risk.financial_risk), body_style))
            elements.append(Paragraph(print_risk("Operational", risk.operational_risk), body_style))
            elements.append(Paragraph(f"<b>Overall Risk Score: {float(risk.overall_risk):.1f}/100</b>", body_style))

        elements.append(Paragraph("Feasibility & Investor Readiness", heading_style))
        if feasibility:
            elements.append(Paragraph(f"<b>Overall Feasibility Score: {float(feasibility.overall_feasibility):.1f}/100</b>", body_style))
            elements.append(Paragraph(f"<i>{safe(feasibility.explanation)}</i>", body_style))

        if investor:
            elements.append(Spacer(1, 6))
            elements.append(Paragraph(f"<b>Investor Readiness Score: {float(investor.investor_score):.1f}/100</b>", body_style))
            elements.append(Paragraph(f"<i>{safe(investor.explanation)}</i>", body_style))
            suggestions = investor.suggestions if isinstance(investor.suggestions, list) else []
            if suggestions:
                elements.append(Paragraph("<b>Suggestions:</b>", body_style))
                for s in suggestions:
                    elements.append(Paragraph(f"• {s}", body_style))

        # ── 9. Roadmap ──
        elements.append(Paragraph("9. Implementation Roadmap", heading_style))
        if roadmap:
            for i in range(1, 6):
                phase = getattr(roadmap, f'phase_{i}', None)
                if phase and isinstance(phase, dict):
                    elements.append(Paragraph(f"<b>Phase {i}: {phase.get('name', 'N/A')}</b> ({phase.get('duration', 'N/A')}) - Cost: {phase.get('estimated_cost', 'N/A')}", subheading_style))
                    tasks = phase.get('tasks', [])
                    for task in tasks:
                        elements.append(Paragraph(f"  • {task}", body_style))
            elements.append(Paragraph(f"<b>Total Timeline:</b> {safe(roadmap.timeline)}", body_style))

        # ── Footer ──
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph("— Generated by Vision2Venture AI Platform —", center_style))

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
