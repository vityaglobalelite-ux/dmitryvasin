"""
Surgical cover/sort update for the two storefront courses + hidden blocks.
Reads SERVICE_ROLE_KEY + SUPABASE_PUBLIC_URL from the environment.

  python scripts/apply-course-covers.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

COURSE_2 = [
    "/assets/site/catalog/covers/course-2-1.webp",
    "/assets/site/catalog/covers/course-2-2.webp",
    "/assets/site/catalog/covers/course-2-3.webp",
]
POSTURE = [
    "/assets/site/catalog/covers/posture-1.webp",
    "/assets/site/catalog/covers/posture-2.webp",
    "/assets/site/catalog/covers/posture-3.webp",
]
POSTURE_B1 = [
    "/assets/site/catalog/covers/posture-b1-1.webp",
    "/assets/site/catalog/covers/posture-b1-2.webp",
    "/assets/site/catalog/covers/posture-b1-3.webp",
]
POSTURE_B2 = [
    "/assets/site/catalog/covers/posture-b2-1.webp",
    "/assets/site/catalog/covers/posture-b2-2.webp",
    "/assets/site/catalog/covers/posture-b2-3.webp",
]

PRODUCTS = [
    {
        "id": "d0230001-0001-4000-8000-000000000001",
        "cover": POSTURE[0],
        "covers": POSTURE,
        "sort_index": 1,
    },
    {
        "id": "d0230001-0002-4000-8000-000000000002",
        "cover": POSTURE_B1[0],
        "covers": POSTURE_B1,
        "sort_index": 101,
    },
    {
        "id": "d0230001-0003-4000-8000-000000000003",
        "cover": POSTURE_B2[0],
        "covers": POSTURE_B2,
        "sort_index": 102,
    },
    {
        "id": "d0230001-0004-4000-8000-000000000004",
        "cover": COURSE_2[0],
        "covers": COURSE_2,
        "sort_index": 2,
    },
]


def rest(url: str, key: str, path: str, *, method: str, body=None, prefer: str | None = None):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(f"{url}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            raw = res.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:500]
        raise SystemExit(f"{method} {path} -> {exc.code}: {detail}") from exc


def main() -> None:
    url = (os.environ.get("SUPABASE_URL") or os.environ.get("SUPABASE_PUBLIC_URL") or "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SERVICE_ROLE_KEY") or ""
    if not url or not key:
        raise SystemExit("Need SUPABASE_URL/SUPABASE_PUBLIC_URL and SERVICE_ROLE_KEY")
    if not key.startswith("eyJ"):
        raise SystemExit("SERVICE_ROLE_KEY does not look like a JWT")

    ids = ",".join(item["id"] for item in PRODUCTS)
    rest(
        url,
        key,
        f"/rest/v1/catalog_product_media?product_id=in.({ids})",
        method="DELETE",
        prefer="return=minimal",
    )

    media = []
    for item in PRODUCTS:
        rest(
            url,
            key,
            f"/rest/v1/catalog_products?id=eq.{item['id']}",
            method="PATCH",
            prefer="return=minimal",
            body={
                "cover_url": item["cover"],
                "sort_index": item["sort_index"],
                "published": True,
            },
        )
        for sort, cover in enumerate(item["covers"]):
            media.append(
                {
                    "product_id": item["id"],
                    "sort": sort,
                    "url": cover,
                    "kind": "cover",
                }
            )

    rest(
        url,
        key,
        "/rest/v1/catalog_product_media",
        method="POST",
        prefer="return=minimal",
        body=media,
    )

    program = rest(
        url,
        key,
        f"/rest/v1/catalog_product_program?product_id=in.({ids})&select=id,gif_urls",
        method="GET",
    ) or []
    rewritten = 0
    for row in program:
        urls = row.get("gif_urls") or []
        next_urls = [item.replace(".gif", ".webp") if isinstance(item, str) else item for item in urls]
        if next_urls != urls:
            rest(
                url,
                key,
                f"/rest/v1/catalog_product_program?id=eq.{row['id']}",
                method="PATCH",
                prefer="return=minimal",
                body={"gif_urls": next_urls},
            )
            rewritten += 1

    print(
        f"Updated covers for {len(PRODUCTS)} course SKUs, {len(media)} media rows, "
        f"{rewritten} program gif paths."
    )


if __name__ == "__main__":
    main()
