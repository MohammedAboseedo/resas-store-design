"""Builds storefront/data/store.js from Zid product exports.

Usage:
    python -I tools/build_store_data.py <zid_products_page1.json> [<page2.json> ...]

Each input is the JSON returned by the resas-zid `zid_list_products` tool
({"count", "page", "products": [...]}). Prices from the Zid API exclude VAT;
the storefront shows them with 15% VAT, so the page adds it at render time.
"""
import datetime
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = "https://media.zid.store/640fc833-23b0-408d-8400-ab3e292a7099/"

STORE = {
    "name": "رساس للعطور",
    "short_name": "رساس",
    "url": "https://resas.sa.com/",
    "logo": MEDIA + "9dd5dadb-1bb2-4cc0-990a-01734d9913b1.png",
    "phone": "+966590000902",
    "whatsapp": "966590000902",
    "email": "resas3000@hotmail.com",
    "vat_number": "301168014400003",
    "commercial_registration": "4650053703",
    "founded": 2008,
    "currency": {"code": "SAR", "symbol": "ر.س"},
    "tax_rate": 0.15,
    "social": {
        "instagram": "https://www.instagram.com/resas_perfume",
        "snapchat": "https://www.snapchat.com/add/resas_perfume",
        "tiktok": "https://www.tiktok.com/@resas_perfume",
        "x": "https://twitter.com/resas3000",
    },
    "about": "نشأت رساس في المملكة العربية السعودية عام 2008، لتقدم عطوراً فرنسية وشرقية بأسلوب دافئ وأنيق، وبخوراً وعوداً من أجود الأنواع.",
    "announcement": "قسّم مشترياتك على 4 دفعات مع تمارا وتابي، بدون فوائد",
    "payment_methods": ["مدى", "Apple Pay", "Visa", "Mastercard", "تمارا", "تابي"],
}

# Category ids and slugs as they appear in the store menu; images are the
# store's own category artwork on the Zid CDN.
CATEGORIES = [
    {"key": "perfumes", "name": "عطور", "url": "/categories/358519/عطور", "image": MEDIA + "413f204c-e14d-44bb-a6ae-0d7eba42d5e6.png"},
    {"key": "special", "name": "عطور خاصة", "url": "/categories/1162806/عطور-خاصة", "image": MEDIA + "0955e83c-5455-4eef-9215-efc302563b5c.png"},
    {"key": "inspired", "name": "عطور مستوحاة", "url": "/categories/1308364/عطور-مستوحاه", "image": MEDIA + "93618adb-fcf5-461d-92ff-ade645ed914b.png"},
    {"key": "incense", "name": "البخور والعود", "url": "/categories/218590/أجود-أنواع-البخور-والعود-20-70", "image": MEDIA + "1f7badce-a459-49f5-b423-59ed59361900.png"},
    {"key": "giveaways", "name": "توزيعات", "url": "/categories/673261/توزيعات", "image": MEDIA + "9e5fba2f-2755-4c5b-b179-f3d94237f7ee.png"},
    {"key": "diffusers", "name": "فواحات اعواد", "url": "/categories/141504/فواحات", "image": MEDIA + "9e0d8955-1945-499e-b915-69943aebbcee.png"},
    {"key": "home", "name": "عطور جو ومفارش", "url": "/categories/141977/عطور-جو-ومفارش", "image": MEDIA + "1e36e351-e99f-4504-ae1e-6666f26aeca7.png"},
    {"key": "oils", "name": "عطور زيتية", "url": "/categories/141500/عطور-زيتية", "image": MEDIA + "fc7093a2-80f1-4154-83b1-b0a0934662ce.png"},
]

MENU = [
    {"name": "عطور", "url": "/categories/358519/عطور"},
    {"name": "البخور والعود", "url": "/categories/218590/أجود-أنواع-البخور-والعود-20-70"},
    {"name": "توزيعات", "url": "/categories/673261/توزيعات"},
    {"name": "الهدايا الملكية", "url": "/categories/265764/الهدايا-الملكية"},
    {"name": "عطور جو ومفارش", "url": "/categories/141977/عطور-جو-ومفارش"},
]


def base_image(url):
    """Strips Zid's cdn-cgi resize prefix so the page can request its own size."""
    m = re.search(r"https://media\.zid\.store/640fc833[^?\s]+$", url or "")
    return m.group(0) if m else url


def in_stock(q):
    return q == "infinite" or (isinstance(q, (int, float)) and q > 0)


def plain(html):
    """Product descriptions come as HTML from Zid; the page shows them as text."""
    text = re.sub(r"<br\s*/?>|</p>", "\n", html or "")
    text = re.sub(r"<[^>]+>", "", text).replace("&nbsp;", " ")
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", text)).strip()


def from_raw(item):
    """Full product records (`zid_list_products` with raw=true)."""
    if not item.get("is_published") or not item.get("images"):
        return None
    images = [base_image(i["image"]["large"]) for i in sorted(item["images"], key=lambda i: i.get("display_order") or 0)]
    qty = "infinite" if item.get("is_infinite") else item.get("quantity")
    return {
        "id": item["id"],
        "name": (item["name"].get("ar") or item["name"].get("en") or "").strip(),
        "price": item["price"],
        "sale_price": item["sale_price"],
        "in_stock": in_stock(qty),
        "categories": [c["name"].get("ar", "") for c in item["categories"]],
        "image": images[0],
        "images": images[:6],
        "description": plain((item.get("short_description") or {}).get("ar")),
        "rating": {"average": item["rating"]["average"], "count": item["rating"]["total_count"]},
        "has_options": item.get("has_options", False),
        "created": (item.get("created_at") or "")[:10],
        "url": item["html_url"],
    }


def collect_categories(pages, products):
    """Every category that appears on a published product, with its Zid id,
    description, image and parent/child links, plus how many products are in stock in it."""
    cats = {}
    for page in pages:
        for item in page.get("results", []):
            for c in item["categories"]:
                name = c["name"].get("ar", "").strip()
                if not name or c["id"] in cats:
                    continue
                cats[c["id"]] = {
                    "id": c["id"],
                    "name": name,
                    "url": "/categories/" + c["id"] + "/" + c["slug"],
                    "description": plain((c.get("description") or {}).get("ar")),
                    "image": (MEDIA.rsplit("/640fc833", 1)[0] + "/" + c["image"]) if c.get("image") else None,
                    "parents": [str(x) for x in (c.get("meta") or {}).get("parents", [])],
                    "children": [str(x) for x in (c.get("meta") or {}).get("childs", [])],
                }
    for c in cats.values():
        c["count"] = sum(1 for p in products if p["in_stock"] and c["name"] in p["categories"])
    return sorted(cats.values(), key=lambda c: -c["count"])


def from_compact(item):
    """Compact product records (`zid_list_products` default)."""
    if not item.get("published") or not item.get("image"):
        return None
    return {
        "id": item["id"],
        "name": item["name"].strip(),
        "price": item["price"],
        "sale_price": item["sale_price"],
        "in_stock": in_stock(item["quantity"]),
        "categories": item["categories"],
        "image": base_image(item["image"]),
        "url": item["url"],
    }


def main(paths):
    products, seen, pages = [], set(), []
    for p in paths:
        page = json.loads(pathlib.Path(p).read_text(encoding="utf-8"))
        pages.append(page)
        raw = "results" in page
        for item in page["results"] if raw else page["products"]:
            if item["id"] in seen:
                continue
            row = from_raw(item) if raw else from_compact(item)
            if row:
                seen.add(item["id"])
                products.append(row)
    data = {"store": STORE, "menu": MENU, "categories": CATEGORIES,
            "all_categories": collect_categories(pages, products), "products": products}
    out = ROOT / "data" / "store.js"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        "/* Generated by tools/build_store_data.py from Zid on " + datetime.date.today().isoformat() + ". Do not edit by hand. */\n"
        "window.RESAS_STORE = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8",
    )
    sys.stdout.reconfigure(encoding="utf-8")
    print(f"{len(products)} products, {sum(p['in_stock'] for p in products)} in stock -> {out}")


if __name__ == "__main__":
    main(sys.argv[1:])
