import json
import re
from pathlib import Path

out = Path(__file__).resolve().parents[1] / "content" / "legal"

SECTION_TITLES = {
    "DMCA Policy",
    "Reporting Claims of Copyright Infringement",
    "Repeat Infringers",
    "INFORMATION WE PROCESS:",
    "HOW WE COLLECT INFORMATION:",
    "HOW WE USE INFORMATION:",
    "HOW WE SHARE INFORMATION:",
    "HOW YOU CONTROL YOUR INFORMATION:",
    "HOW WE USE COOKIES:",
    "USER GENERATED CONTENT:",
    "THIRD PARTY WEBSITES AND LINKS:",
    "CHILDREN'S DATA",
    "CHILDREN’S DATA",
    "CHANGES TO THIS PRIVACY POLICY",
    "CONTACT US",
    "Acceptance of the Terms of Use",
    "Private Telegram chat",
    "Personal Enjoyment",
    "Your Privacy Rights",
    "In-Person Interactions (AT YOUR OWN RISK) and User Safety",
    "Other Prohibited Conduct",
    "Prohibited Conduct",
    "Illegal or Harmful Activity",
    "Content and Communication",
    "Impersonation and Misrepresentation",
    "Closed telegram club Integrity and Technical Abuse",
    "False & Deceptive Content Practices",
}


def refine(blocks: list) -> list:
    result = []
    for b in blocks:
        t = b["text"].strip()
        upper = t.upper()
        is_all_caps = (
            len(t) >= 8
            and len(t) <= 100
            and any(c.isalpha() for c in t)
            and upper == t
            and not t.startswith("(")
        )
        is_section = (
            t in SECTION_TITLES
            or (t.endswith(":") and len(t) <= 70 and t[:-1].replace(" ", "").isalpha() is False and t.count(" ") <= 8)
            or (t.endswith(":") and len(t) <= 60)
            or is_all_caps
        )
        # avoid treating address lines / short fragments as headings
        if t in {"BeTango Global LLC", "7901 4TH ST N", "STE 300", "ST. PETERSBURG, FL 33702"}:
            is_section = False
        if re.match(r"^\(\d+\)", t):
            is_section = False
        if t.startswith("Your physical") or t.startswith("Identification of"):
            is_section = False
        result.append({"type": "h2" if is_section else "p", "text": t})
    return result


for name in ("dmca", "privacy", "terms"):
    path = out / f"{name}.json"
    blocks = json.loads(path.read_text(encoding="utf-8"))
    refined = refine(blocks)
    path.write_text(json.dumps(refined, ensure_ascii=False, indent=2), encoding="utf-8")
    print(name, "h2", sum(1 for x in refined if x["type"] == "h2"))
