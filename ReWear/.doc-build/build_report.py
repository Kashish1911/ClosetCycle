from pathlib import Path
import re
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BASE = Path(__file__).resolve().parents[1]
source = BASE / "docs" / "FINAL_REPORT.md"
out = BASE / "deliverables" / "Closet_Cycle_Final_Report.docx"
doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(0.72)
sec.bottom_margin = Inches(0.72)
sec.left_margin = Inches(0.82)
sec.right_margin = Inches(0.82)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(10)
normal.font.color.rgb = RGBColor(31, 42, 36)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.12
for name, size in [("Title", 25), ("Heading 1", 16), ("Heading 2", 12)]:
    s = styles[name]
    s.font.name = "Arial"
    s.font.size = Pt(size)
    s.font.bold = name != "Title"
    s.font.color.rgb = RGBColor(0, 0, 0)
    s.paragraph_format.space_before = Pt(11 if name != "Title" else 0)
    s.paragraph_format.space_after = Pt(5)
if "Code Block" not in styles:
    code_style = styles.add_style("Code Block", 1)
else:
    code_style = styles["Code Block"]
code_style.font.name = "Consolas"
code_style.font.size = Pt(8)
code_style.font.color.rgb = RGBColor(45, 55, 50)
code_style.paragraph_format.left_indent = Inches(0.2)
code_style.paragraph_format.space_after = Pt(3)

header = sec.header.paragraphs[0]
header.text = "Closet Cycle  |  SEMESTER PROJECT REPORT"
header.style = styles["Normal"]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for run in header.runs:
    run.font.size = Pt(8)
    run.font.bold = True
    run.font.color.rgb = RGBColor(66, 92, 77)
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer.add_run("Closet Cycle  •  ")
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)
for run in footer.runs:
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(100, 110, 104)

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)

def set_cell_border(cell):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn("w:" + edge))
        if el is None:
            el = OxmlElement("w:" + edge)
            borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:color"), "D9D9D9")

def add_inline(p, text):
    parts = re.split(r"(`[^`]+`|\*\*[^*]+\*\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("`") and part.endswith("`"):
            r = p.add_run(part[1:-1]); r.font.name = "Consolas"; r.font.size = Pt(9)
        elif part.startswith("**") and part.endswith("**"):
            p.add_run(part[2:-2]).bold = True
        else:
            p.add_run(part)

lines = source.read_text(encoding="utf-8").splitlines()
i = 0
in_code = False
code_lines = []
while i < len(lines):
    line = lines[i]
    if line.startswith("```"):
        if in_code:
            p = doc.add_paragraph(style="Code Block")
            p.add_run("\n".join(code_lines))
            in_code, code_lines = False, []
        else:
            in_code = True
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
            row = [x.strip() for x in lines[i].strip().strip("|").split("|")]
            if not all(set(x) <= {"-", ":", " "} for x in row):
                rows.append(row)
            i += 1
        if rows:
            table = doc.add_table(rows=len(rows), cols=max(len(r) for r in rows))
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.style = "Table Grid"
            for ridx, row in enumerate(rows):
                for cidx, value in enumerate(row):
                    cell = table.cell(ridx, cidx)
                    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                    cell.text = ""
                    p = cell.paragraphs[0]
                    add_inline(p, value)
                    for run in p.runs:
                        run.font.size = Pt(8.5)
                    set_cell_border(cell)
                    if ridx == 0:
                        shade(cell, "244B38")
                        for run in p.runs:
                            run.font.bold = True
                            run.font.color.rgb = RGBColor(255, 255, 255)
                    elif ridx % 2 == 0:
                        shade(cell, "F2F5F1")
            doc.add_paragraph().paragraph_format.space_after = Pt(2)
        continue
    if line.startswith("### "):
        p = doc.add_paragraph(style="Heading 2"); add_inline(p, line[4:])
    elif line.startswith("## "):
        p = doc.add_paragraph(style="Heading 1"); add_inline(p, line[3:])
    elif line.startswith("# "):
        p = doc.add_paragraph(style="Title"); add_inline(p, line[2:])
        p.paragraph_format.space_after = Pt(8)
    elif line.startswith("- "):
        p = doc.add_paragraph(style="List Bullet"); add_inline(p, line[2:])
    elif re.match(r"^\d+\. ", line):
        p = doc.add_paragraph(style="List Number"); add_inline(p, re.sub(r"^\d+\. ", "", line))
    else:
        p = doc.add_paragraph(); add_inline(p, line)
    i += 1

doc.core_properties.title = "Closet Cycle Final Project Report"
doc.core_properties.subject = "Semester project summary, implementation, testing, cloud, and startup readiness"
doc.save(out)
print(out)
