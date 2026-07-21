import zipfile
import re
import html
import json
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W_P = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"
W_R = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r"
W_T = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"
W_RPR = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr"
W_B = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b"

out = Path(__file__).resolve().parents[1] / "content" / "legal"
out.mkdir(parents=True, exist_ok=True)

files = {
    "dmca": Path(r"c:\Users\Victor\Downloads\Telegram Desktop\BT DMCA Policy.docx"),
    "privacy": Path(
        r"c:\Users\Victor\Downloads\Telegram Desktop\BT Privacy Policy.docx"
    ),
    "terms": Path(
        r"c:\Users\Victor\Downloads\Telegram Desktop\BT Terms and Conditions Closed Telegram Club.docx"
    ),
}

HEADING_RE = re.compile(
    r"^(INFORMATION WE|HOW WE|YOUR |THIRD PARTY|CHILDREN|CHANGES TO|"
    r"CONTACT US|CALIFORNIA|EUROPEAN|REPEAT|REPORTING|ACCEPTANCE|"
    r"PRIVATE TELEGRAM|PERSONAL ENJOYMENT|YOUR PRIVACY|IN-PERSON|"
    r"OTHER PROHIBITED|PROHIBITED CONDUCT|ILLEGAL|CONTENT AND|"
    r"IMPERSONATION|CLOSED TELEGRAM|FALSE &|USER CONTENT|INTELLECTUAL|"
    r"PAYMENTS|REFUNDS|TERMINATION|DISCLAIMER|LIMITATION|INDEMNIF|"
    r"GOVERNING|ARBITRATION|CLASS ACTION|MISCELLANEOUS|ENTIRE AGREEMENT|"
    r"TERMS AND CONDITIONS|BETANGO GLOBAL|DMCA POLICY|WE CAUTION|"
    r"IMPORTANT NOTICE|IMPORTANT HEALTH|HOW YOU CONTROL|HOW WE USE COOKIES|"
    r"USER GENERATED|SENSITIVE|INTERNATIONAL|SECURITY|RETENTION|"
    r"ADDITIONAL DISCLOSURES|SHOPIFY)",
    re.I,
)


def is_heading(text: str, bold: bool) -> bool:
    t = text.strip()
    if not t or len(t) > 140:
        return False
    if t.isupper() and len(t) > 3:
        return True
    if t.endswith(":") and len(t) < 90:
        return True
    if bold and len(t) < 100 and not t.endswith("."):
        return True
    if HEADING_RE.match(t):
        return True
    return False


def extract(path: Path):
    z = zipfile.ZipFile(path)
    root = ET.fromstring(z.read("word/document.xml"))
    blocks = []
    for p in root.iter(W_P):
        texts = []
        bold = False
        for r in p.iter(W_R):
            rPr = r.find(W_RPR)
            if rPr is not None and rPr.find(W_B) is not None:
                bold = True
            for t in r.findall(W_T):
                if t.text:
                    texts.append(t.text)
                if t.tail:
                    texts.append(t.tail)
        text = html.unescape("".join(texts))
        text = text.replace("\xa0", " ").replace("\u202f", " ").strip()
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            continue
        kind = "h2" if is_heading(text, bold) else "p"
        blocks.append({"type": kind, "text": text})
    return blocks


for key, path in files.items():
    blocks = extract(path)
    (out / f"{key}.json").write_text(
        json.dumps(blocks, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(key, len(blocks), "ok")
