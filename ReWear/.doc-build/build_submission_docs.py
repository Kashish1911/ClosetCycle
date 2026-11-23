from pathlib import Path
import re
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BASE = Path(__file__).resolve().parents[1]
DOCS = BASE / "docs"
OUT = BASE / "deliverables"
BUILD = BASE / ".doc-build" / "generated"
OUT.mkdir(exist_ok=True)
BUILD.mkdir(parents=True, exist_ok=True)

FOREST = "244B38"
PALE = "F2F5F1"
INK = RGBColor(31, 42, 36)


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_borders(cell):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:color"), "D9D9D9")


def setup_doc(title, landscape=False):
    doc = Document()
    sec = doc.sections[0]
    if landscape:
        sec.orientation = WD_ORIENT.LANDSCAPE
        sec.page_width, sec.page_height = Inches(11), Inches(8.5)
        sec.top_margin = Inches(.55)
        sec.bottom_margin = Inches(.55)
        sec.left_margin = Inches(.65)
        sec.right_margin = Inches(.65)
    else:
        sec.top_margin = Inches(.72)
        sec.bottom_margin = Inches(.72)
        sec.left_margin = Inches(.82)
        sec.right_margin = Inches(.82)
    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = INK
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.12
    for name, size in (("Title", 24), ("Heading 1", 16), ("Heading 2", 12), ("Heading 3", 11)):
        style = doc.styles[name]
        style.font.name = "Arial"
        style.font.size = Pt(size)
        style.font.bold = name != "Title"
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.paragraph_format.space_before = Pt(10 if name != "Title" else 0)
        style.paragraph_format.space_after = Pt(5)
    header = sec.header.paragraphs[0]
    header.text = "Closet Cycle  |  SEMESTER PROJECT"
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for run in header.runs:
        run.font.name = "Arial"; run.font.size = Pt(8); run.font.color.rgb = RGBColor(0, 0, 0)
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.add_run("Closet Cycle  •  ")
    page_field = OxmlElement("w:fldSimple")
    page_field.set(qn("w:instr"), "PAGE")
    footer._p.append(page_field)
    for run in footer.runs:
        run.font.size = Pt(8); run.font.color.rgb = RGBColor(80, 80, 80)
    doc.core_properties.title = title
    doc.core_properties.subject = "Closet Cycle Semester 5 project submission"
    doc.add_paragraph(title, style="Title")
    return doc


def add_inline(p, text):
    parts = re.split(r"(`[^`]+`|\*\*[^*]+\*\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("`") and part.endswith("`"):
            run = p.add_run(part[1:-1]); run.font.name = "Consolas"; run.font.size = Pt(9)
        elif part.startswith("**") and part.endswith("**"):
            p.add_run(part[2:-2]).bold = True
        else:
            p.add_run(part)


def add_table(doc, rows):
    if not rows:
        return
    cols = max(len(row) for row in rows)
    table = doc.add_table(rows=len(rows), cols=cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    table.autofit = True
    for ri, row in enumerate(rows):
        for ci in range(cols):
            cell = table.cell(ri, ci)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            cell.text = ""
            p = cell.paragraphs[0]
            if ci < len(row):
                add_inline(p, row[ci])
            for run in p.runs:
                run.font.name = "Arial"; run.font.size = Pt(8.5)
            set_cell_borders(cell)
            if ri == 0:
                shade(cell, FOREST)
                for run in p.runs:
                    run.font.bold = True; run.font.color.rgb = RGBColor(255, 255, 255)
            elif ri % 2 == 0:
                shade(cell, PALE)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_markdown(doc, path, omit_title=True, skip_mermaid=True):
    lines = path.read_text(encoding="utf-8").splitlines()
    i, in_code, code_lines, first_title = 0, False, [], True
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            language = line[3:].strip().lower()
            if in_code:
                if not (skip_mermaid and language == "mermaid"):
                    p = doc.add_paragraph()
                    p.paragraph_format.left_indent = Inches(.2)
                    p.paragraph_format.space_after = Pt(4)
                    run = p.add_run("\n".join(code_lines))
                    run.font.name = "Consolas"
                    run.font.size = Pt(8.5)
                in_code = False
                code_lines = []
            else:
                in_code = True
                code_lines = []
                current_language = language
            i += 1
            continue
        if in_code:
            code_lines.append(line)
            i += 1
            continue
        if not line.strip():
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [x.strip() for x in lines[i].strip().strip("|").split("|")]
                if not all(set(x) <= {"-", ":", " "} for x in cells):
                    rows.append(cells)
                i += 1
            add_table(doc, rows)
            continue
        if line.startswith("### "):
            p = doc.add_paragraph(style="Heading 3"); add_inline(p, line[4:])
        elif line.startswith("## "):
            p = doc.add_paragraph(style="Heading 1"); add_inline(p, line[3:])
        elif line.startswith("# "):
            if not (omit_title and first_title):
                p = doc.add_paragraph(style="Heading 1"); add_inline(p, line[2:])
            first_title = False
        elif line.startswith("- "):
            p = doc.add_paragraph(style="List Bullet"); add_inline(p, line[2:])
        elif re.match(r"^\d+\. ", line):
            p = doc.add_paragraph(style="List Number"); add_inline(p, re.sub(r"^\d+\. ", "", line))
        else:
            p = doc.add_paragraph(); add_inline(p, line)
        i += 1


def add_code_block(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(.2)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.font.name = "Consolas"
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor(45, 55, 50)


def font(size, bold=False):
    choices = [r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\Arial.ttf"]
    bold_choices = [r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\Arialbd.ttf"]
    for candidate in (bold_choices if bold else choices):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def wrap_text(draw, text, fnt, width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= width:
            current = trial
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    return lines


def make_uml_image(path):
    w, h = 2200, 1360
    im = Image.new("RGB", (w, h), "#fffdf8")
    d = ImageDraw.Draw(im)
    title_f, head_f, body_f = font(42, True), font(25, True), font(19)
    d.text((70, 42), "Closet Cycle JAVA CLASS MODEL", fill="#000000", font=title_f)
    d.text((70, 100), "Inheritance and core domain types", fill="#4d5d53", font=font(22))

    def card(x, y, cw, ch, title, fields, stereotype=None):
        d.rounded_rectangle((x, y, x+cw, y+ch), radius=14, fill="#ffffff", outline=f"#{FOREST}", width=4)
        top = y
        if stereotype:
            d.text((x+15, top+9), stereotype, fill="#8b604e", font=font(16))
            top += 32
        d.text((x+15, top+8), title, fill=f"#{FOREST}", font=head_f)
        line_y = top + 46
        d.line((x, line_y, x+cw, line_y), fill="#b7c7bc", width=2)
        yy = line_y + 12
        for field in fields:
            for ln in wrap_text(d, field, body_f, cw-28):
                d.text((x+14, yy), ln, fill="#1f2a24", font=body_f)
                yy += 25

    parent = (790, 175, 620, 150)
    card(*parent, "AuditedEntity", ["id · createdAt · updatedAt"], "«abstract»")
    child_y, cw, ch, gap, start_x = 480, 390, 245, 28, 70
    names = [
        ("UserAccount", ["displayName · email", "creditBalance · role"]),
        ("ClothingItem", ["title · category · size", "condition · creditValue · status"]),
        ("ExchangeRequest", ["type · status · creditDifference", "requesterConfirmed · ownerConfirmed"]),
        ("CreditTransaction", ["amount · description"]),
        ("MemberReport", ["reporter · item · reason", "details · status"]),
    ]
    centers = []
    for i, (name, fields) in enumerate(names):
        x = start_x + i*(cw+gap)
        card(x, child_y, cw, ch, name, fields, "«entity»")
        centers.append((x+cw//2, child_y))
    px = parent[0] + parent[2]//2
    base_y = parent[1] + parent[3]
    for cx, cy in centers:
        mid = (base_y + cy)//2
        d.line((px, base_y, px, mid), fill=f"#{FOREST}", width=3)
        d.line((px, mid, cx, mid), fill=f"#{FOREST}", width=3)
        d.line((cx, mid, cx, cy-8), fill=f"#{FOREST}", width=3)
        # open inheritance triangle
        d.polygon([(cx, cy-2), (cx-11, cy-22), (cx+11, cy-22)], fill="#fffdf8", outline=f"#{FOREST}")
        d.line((cx, cy-2, cx-11, cy-22), fill=f"#{FOREST}", width=2)
        d.line((cx, cy-2, cx+11, cy-22), fill=f"#{FOREST}", width=2)
        d.line((cx-11, cy-22, cx+11, cy-22), fill=f"#{FOREST}", width=2)

    d.rounded_rectangle((70, 800, 2130, 1260), radius=18, fill="#eef3ee", outline="#d0dbd2", width=3)
    d.text((105, 830), "APPLICATION LAYERS AND STORAGE INTERFACES", fill="#000000", font=head_f)
    boxes = [
        (110, "HTTP controllers", "Auth · Clothing · Exchange\nWallet · Reports"),
        (640, "Services", "Auth · Clothing · Exchange\nUser · MemberReport"),
        (1170, "Repositories", "User · Clothing · Exchange\nCredits · MemberReport"),
        (1700, "Interfaces", "ImageStorageService\nNotificationService"),
    ]
    for x, title, desc in boxes:
        d.rounded_rectangle((x, 925, x+390, 1125), radius=14, fill="#ffffff", outline=f"#{FOREST}", width=3)
        d.text((x+18, 950), title, fill=f"#{FOREST}", font=head_f)
        for j, line in enumerate(desc.split("\n")):
            d.text((x+18, 1005+j*30), line, fill="#1f2a24", font=body_f)
    for x1, x2 in ((500, 635), (1030, 1165), (1560, 1695)):
        d.line((x1, 1025, x2, 1025), fill=f"#{FOREST}", width=4)
        d.polygon([(x2,1025),(x2-15,1016),(x2-15,1034)], fill=f"#{FOREST}")
    d.text((110, 1165), "LocalFileStorageService and S3ImageStorageService implement image storage; AsyncNotificationService implements NotificationService.", fill="#33463a", font=font(18))
    im.save(path, quality=95)


def make_cloud_image(path):
    w, h = 1900, 1160
    im = Image.new("RGB", (w, h), "#fffdf8")
    d = ImageDraw.Draw(im)
    d.text((65, 35), "Closet Cycle CLOUD ARCHITECTURE", fill="#000000", font=font(38, True))
    d.rounded_rectangle((1390, 40, 1835, 100), radius=18, fill="#f2dfd6", outline="#b9674d", width=2)
    d.text((1420, 57), "PLANNED · NOT DEPLOYED", fill="#743f2d", font=font(20, True))
    head_f, body_f = font(23, True), font(18)
    cards = {
        "browser": (690, 140, 500, 125, "Member browser", "HTTPS client"),
        "cdn": (100, 390, 520, 165, "CloudFront + private S3", "Static React frontend"),
        "alb": (690, 390, 520, 165, "HTTPS Application LB", "TLS termination · health checks"),
        "api": (1330, 390, 470, 165, "ECS Fargate API", "Java 25 LTS · Spring Boot · IAM task role"),
        "db": (130, 790, 480, 165, "Private RDS PostgreSQL", "Encrypted · automated backups"),
        "media": (710, 790, 470, 165, "Private encrypted S3", "Listing image objects"),
        "secrets": (1280, 790, 290, 165, "Secrets Manager", "DB / JWT secrets"),
        "logs": (1600, 790, 220, 165, "CloudWatch", "Logs / alarms"),
    }
    def card(box, title, desc):
        x,y,cw,ch=box
        d.rounded_rectangle((x,y,x+cw,y+ch), radius=16, fill="#ffffff", outline=f"#{FOREST}", width=4)
        d.text((x+18,y+25), title, fill=f"#{FOREST}", font=head_f)
        for j,line in enumerate(wrap_text(d,desc,body_f,cw-36)):
            d.text((x+18,y+75+j*28), line, fill="#33463a", font=body_f)
    for key, (x,y,cw,ch,title,desc) in cards.items():
        card((x,y,cw,ch), title, desc)
    def arrow(p1,p2,label=None):
        d.line((p1,p2), fill=f"#{FOREST}", width=4)
        import math
        x1,y1=p1; x2,y2=p2
        a=math.atan2(y2-y1,x2-x1); size=15
        left=(x2-size*math.cos(a-.45),y2-size*math.sin(a-.45))
        right=(x2-size*math.cos(a+.45),y2-size*math.sin(a+.45))
        d.polygon([p2,left,right],fill=f"#{FOREST}")
        if label:
            mx,my=(x1+x2)//2,(y1+y2)//2
            d.rounded_rectangle((mx-65,my-18,mx+65,my+18),radius=6,fill="#fffdf8")
            d.text((mx-58,my-12),label,fill="#4d5d53",font=font(15))
    arrow((940,265),(940,385),"HTTPS")
    arrow((620,470),(685,470),"static")
    arrow((1215,470),(1325,470),"API")
    arrow((1450,560),(390,785),"SQL private")
    arrow((1540,560),(945,785),"media")
    arrow((1640,560),(1420,785),"secrets")
    arrow((1745,560),(1710,785),"logs")
    d.text((80, 1030), "CI: GitHub Actions builds frontend and runs backend integration checks. Terraform, cost alert, monitoring and recovery resources are source configuration only until approved and deployed.", fill="#33463a", font=font(17))
    im.save(path, quality=95)


def parse_sources(doc, sources):
    for idx, source in enumerate(sources):
        if idx:
            doc.add_page_break()
        add_markdown(doc, DOCS / source)


def build_standard(title, filename, sources, intro=None):
    doc = setup_doc(title)
    if intro:
        p=doc.add_paragraph(intro)
        p.paragraph_format.space_after=Pt(14)
    parse_sources(doc, sources)
    doc.save(OUT / filename)


def build_uml():
    title="Closet Cycle Java Design and UML Class Diagram"
    doc=setup_doc(title, landscape=True)
    doc.add_paragraph("This design view follows the current Java source. It shows entity inheritance and the API/service/repository boundaries; it does not imply that the cloud deployment is live.")
    image=BUILD/"Closet_Cycle_UML_Class_Diagram.png"
    make_uml_image(image)
    doc.add_picture(str(image), width=Inches(9.55))
    doc.paragraphs[-1].alignment=WD_ALIGN_PARAGRAPH.CENTER
    doc.add_heading("Core relationships", level=1)
    add_table(doc, [
        ["Classes", "Relationship"],
        ["UserAccount → ClothingItem", "One member can own multiple clothing listings."],
        ["UserAccount → ExchangeRequest", "A member may request an item or own the listing in an exchange."],
        ["ClothingItem → ExchangeRequest", "An exchange references the requested item and may reference an offered item."],
        ["UserAccount / ExchangeRequest → CreditTransaction", "Users have ledger entries; completed exchanges may settle ledger transactions."],
        ["UserAccount / ClothingItem → MemberReport", "A report stores a reporter, a reported listing, reason, details, and status."],
    ])
    doc.add_heading("Java concepts demonstrated", level=1)
    doc.add_paragraph("AuditedEntity supplies shared identity/timestamps. ImageStorageService has local-file and S3 implementations. NotificationService separates notification behavior from exchange logic, with asynchronous delivery. Services enforce exchange rules and use domain-specific exceptions; repositories persist domain records.")
    doc.save(OUT/"Closet_Cycle_Java_UML_Design.docx")


def build_cloud():
    title="Closet Cycle Cloud Architecture and Deployment Plan"
    doc=setup_doc(title)
    doc.add_paragraph("This document describes the proposed AWS deployment and a safe manual release sequence. The infrastructure is not deployed; all cloud services and cost estimates are plans until the team approves and applies them.")
    image=BUILD/"Closet_Cycle_Cloud_Architecture.png"
    make_cloud_image(image)
    doc.add_picture(str(image), width=Inches(6.45))
    doc.paragraphs[-1].alignment=WD_ALIGN_PARAGRAPH.CENTER
    doc.add_heading("Architecture details and operations", level=1)
    add_markdown(doc, DOCS/"ARCHITECTURE.md")
    doc.add_page_break()
    add_markdown(doc, DOCS/"DEPLOY_AWS.md")
    doc.save(OUT/"Closet_Cycle_Cloud_Architecture_and_Deployment.docx")


GAMMA_PROMPT = r'''Create exactly 10 slides for a B.Tech Semester 5 integrated startup-project presentation. The project is Closet Cycle, a campus clothing-exchange platform. These are slides 1–10 of a planned 12-slide deck: make slide 10 a transition into the next section, not a “Thank you” or final conclusion.

AUDIENCE AND PURPOSE
Present to faculty/investors. Explain the problem, business model, product, Java design, startup readiness, cloud plan, and honest project status. Use clear, concise language suitable for a 5-minute presentation. Do not invent customer research, market size, revenue, partnerships, funding, environmental impact, or deployment results.

DESIGN
Use a polished, editorial sustainable-fashion theme consistent with Closet Cycle: warm cream backgrounds, forest-green headings, muted sage panels, restrained terracotta accents, elegant serif headlines, clean sans-serif body text, rounded cards, and generous whitespace. Keep strong contrast and readable text. Use fashion/community imagery only as illustrative stock photography; do not use fake testimonials or government logos. Use simple diagrams and icons where they clarify the story. Keep the same visual system across all 10 slides.

PROJECT FACTS — USE THESE ACCURATELY
- Closet Cycle is a student-built prototype for local clothing exchanges.
- The UI uses React, TypeScript, and Vite. The API uses Java 25 LTS and Spring Boot with a relational database.
- Members can browse, list, request a direct swap or credit exchange, and confirm completion together.
- Credits are internal prototype points: they cannot be bought, withdrawn, or used outside Closet Cycle.
- Closet Cycle does not process cash/card/UPI payments or provide shipping/courier delivery. Members arrange handover themselves.
- The prototype has authentication, listing and exchange workflows, a credit ledger, image-storage abstractions, and report/moderator flows.
- Java design includes inheritance, interfaces, custom exceptions, asynchronous notifications, and local/S3 image-storage implementations.
- The AWS Terraform architecture is proposed but has NOT been deployed. Do not show a live URL or claim live monitoring.
- Local checks previously passed: 18 Java API integration tests, frontend TypeScript checking and production build, Terraform validation, and five local API smoke checks. No coverage percentage is claimed. Performance/load tests, security penetration testing, real user research, live cloud smoke tests, and demo video are still outstanding.
- Cost figures are planning ranges only, not an AWS quote: 100 users $70–$180/month; 1,000 users $150–$450/month; 10,000 users $500–$2,000+/month. Label assumptions and say a regional pricing-calculator estimate is still needed.
- Closet Cycle has no DPIIT recognition, grant award, investor commitment, verified customers, or proven environmental impact.

SLIDE PLAN
1. COVER — “Closet Cycle: Good Clothes, Kept in Motion”. Subtitle: “A campus clothing-exchange platform”. Include editable placeholders: [Team Names] · [Institution] · [Course] · [Date]. Use a strong sustainable-fashion visual and a brief hook about giving wearable clothes another local life.
2. THE PROBLEM AND WHO IT SERVES — Define the target as students/campus members who want affordable wardrobe variety and have wearable clothes they no longer use. Explain friction: finding suitable items, making swaps feel fair, and arranging a trusted handover. Present these as hypotheses, not validated research. Add “Validation next”: consented interviews with 10–15 students and test the listing/request flow; no interviews are complete.
3. LEAN CANVAS — Show all nine blocks: Problem; Customer Segments; Unique Value Proposition; Solution; Channels; Revenue Streams; Cost Structure; Key Metrics; Unfair Advantage. Use Closet Cycle-specific hypotheses, clearly marked “to validate”; add no market-size statistics.
4. BUSINESS MODEL CANVAS — Show all nine blocks: Customer Segments; Value Propositions; Channels; Customer Relationships; Revenue Streams; Key Resources; Key Activities; Key Partnerships; Cost Structure. Pilot starts free. Future revenue ideas are unvalidated: campus sponsorship, clearly labeled promoted listings, or a disclosed completed-exchange fee. Do not present any as current revenue or a partnership.
5. PRODUCT, MVP, AND E-COMMERCE FLOW — Diagram: Discover → List with honest photos/details → Browse/filter → Request direct swap or credits → Owner accepts/declines → Members arrange their own safe handover → Both confirm → Credit ledger settles. State: no real-money payments; credits are not cash. No delivery provider; members coordinate public meetups. Acquisition ideas: campus clubs, sustainability groups, opt-in swap events, student ambassadors; proposed, not launched.
6. SWOT AND PESTEL — SWOT matrix. Strengths: local exchange concept; direct swap plus credits; implemented listing and completion flow. Weaknesses: liquidity unproven; condition/sizing member-reported; meetup self-managed; moderation limited. Opportunities: campus sustainability clubs/events; institutional sponsorship; pilot learning. Threats: low listing density; unsafe handovers; inaccurate listings; privacy incidents; resale competitors. Add compact PESTEL: Political, Economic, Social, Technological, Environmental, Legal. Environmental benefits and demand are unmeasured.
7. STARTUP SUPPORT, FUNDING, IPR, AND ETHICAL COMMERCE — Explain Startup India/DPIIT recognition and official application; no Closet Cycle eligibility claim. Mention incubator examples (IIT/IIM-linked centres, STPI, T-Hub, GUSEC, AICs; examples only). Name programs to research: Startup India Seed Fund Scheme, MeitY SAMRIDH and TIDE 2.0, DST NIDHI (EIR/PRAYAS/Seed Support), AIM, MSME incubation. Calls and eligibility change; don’t imply applications are open or funding guaranteed. Include IPR assistance: patent search/filing, trademarks, designs, copyright guidance, facilitators; any patent-fee benefit is conditional on current official eligibility. Funding plan: no-fee campus pilot, seek mentor/college support or eligible grants only after research/eligibility review. Legal/ethics checklist: privacy and consent, no fake reviews, hidden fees, false urgency or dark patterns, honest listings and clear reporting. Cite official government sources in small footnotes if available; no legal advice.
8. JAVA DESIGN AND UML CLASS DIAGRAM — Draw a readable UML class diagram, not an ERD. Include AuditedEntity superclass → UserAccount, ClothingItem, ExchangeRequest, CreditTransaction, MemberReport. Show controller → service → repository layers; ImageStorageService interface with LocalFileStorageService and S3ImageStorageService implementations; NotificationService with asynchronous implementation. Relationships: users own listings, request exchanges, receive credit transactions; exchanges refer to requested/offered items; reports refer to a listing and reporter. Side panel: OOP, inheritance, interfaces, custom exceptions, asynchronous notifications, file/object storage.
9. CLOUD ARCHITECTURE, SECURITY, SCALABILITY, AND COST — Draw and label “Planned — not deployed”: Browser → CloudFront/static frontend → HTTPS load balancer → ECS Fargate Java API → private RDS PostgreSQL; API also uses private encrypted S3 media, Secrets Manager, and CloudWatch logs/health alarms. Show IAM task roles, private database ingress, HTTPS, and autoscaling/load-balancing intent. Mention Dockerfile, Terraform, GitHub Actions CI, manual deployment steps. Show planning ranges: 100 users $70–$180/month; 1,000 users $150–$450/month; 10,000 users $500–$2,000+/month. Label as rough assumptions, not quote; calculator estimate, deployment, monitoring screenshots, and restore rehearsal pending.
10. CURRENT PROTOTYPE EVIDENCE AND NEXT VALIDATION — Split “Implemented and locally checked” vs “Still needs evidence.” Implemented: responsive UI; Java API; listings/exchanges; two-party completion/credit ledger; authentication; report/moderator flow. Checks: 18 Java integration tests passed; TypeScript check and frontend production build passed; Terraform validation passed; five local API smoke checks passed. Do not call this complete qualification. Pending: user interviews/usability, coverage report, performance/security checks, regression evidence, AWS deployment/public URL, cloud smoke/monitoring evidence, actual cost export, five-minute recorded demo, team/course details. End with “Next: validate with campus members, then deploy within an approved budget.” Do not add a final thank-you slide; slides 11–12 will be added later.

CONTENT AND SOURCE RULES
- Do not fabricate data or describe sample content as real users, reviews, traction, or impact.
- Keep policy claims high-level and conditional. Verify current scheme status and eligibility against official government sources; add source titles/links in small readable footnotes.
- Mark AWS services as planned, not deployed.
- Use concise slide text and speaker notes for detail.
- Keep both canvases, SWOT/PESTEL, UML, and architecture diagram legible in PowerPoint.
- Return exactly 10 editable slides.'''


def build_gamma_doc():
    doc=setup_doc("Closet Cycle Gamma Presentation Prompt for Slides 1 to 10")
    doc.add_paragraph("Copy the prompt below into Gamma. It is scoped to the first ten slides so slides 11–12 can be added later in the same visual theme.")
    for block in GAMMA_PROMPT.split("\n\n"):
        if block.startswith(("AUDIENCE AND PURPOSE", "DESIGN", "PROJECT FACTS", "SLIDE PLAN", "CONTENT AND SOURCE RULES")):
            doc.add_heading(block, level=1)
        elif re.match(r"^\d+\. ", block):
            doc.add_paragraph(block, style="List Number")
        elif block.startswith("-"):
            for line in block.splitlines():
                doc.add_paragraph(line.lstrip("- "), style="List Bullet")
        else:
            doc.add_paragraph(block)
    doc.save(OUT/"Closet_Cycle_Gamma_Prompt_First_10_Slides.docx")


build_standard("Closet Cycle Topic Proposal", "Closet_Cycle_Topic_Proposal.docx", ["TOPIC_PROPOSAL.md"], "Draft project proposal for team and faculty review. Replace bracketed course/team fields and record actual approval before submission.")
build_standard("Closet Cycle Startup and E-commerce Plan", "Closet_Cycle_Startup_and_Ecommerce_Plan.docx", ["PROJECT_DELIVERABLES.md", "ECOMMERCE_DESIGN.md", "STARTUP_READINESS.md", "USER_RESEARCH_PLAN.md"], "This combined plan contains the startup canvases, business and e-commerce design, compliance/readiness notes, and a consent-first research plan. Hypotheses are labelled; no user research or grant award is claimed.")
build_uml()
build_cloud()
build_standard("Closet Cycle Five Minute Demo Script", "Closet_Cycle_Five_Minute_Demo_Script.docx", ["DEMO_SCRIPT.md"], "Presenter script for a five-minute demonstration. Replace names and capture the actual run before claiming a recorded demo.")
build_standard("Closet Cycle Sem 5 Assignment Crosswalk", "Closet_Cycle_Sem5_Assignment_Crosswalk.docx", ["SEM5_ASSIGNMENT_CROSSWALK.md"], "Requirement-by-requirement status against the Semester 5 brief; clearly distinguishes repository artifacts from external deployment and team evidence.")
build_gamma_doc()
print("Created Word deliverables in", OUT)
