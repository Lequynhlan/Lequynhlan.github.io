"""Rebuild the gallery from assets/img/gallery/photos.json.

photos.json is a list, in display order, of
    {"file": "name.jpg", "thumb": "name-thumb.jpg", "caption": "...", "alt": "..."}
"thumb" is optional (the full image is used when it is missing); "alt" is required.

What the script keeps in step with the photo list:
  * the photo cards in gallery/index.html (between the gallery:start / gallery:end markers);
  * the "gallery" link in every page's navigation (nav-gallery markers): shown only when there is
    at least one photo, so an empty gallery is never advertised;
  * a noindex tag on the gallery page while it is empty (robots markers);
  * sitemap.xml: /gallery/ is listed only when there is at least one photo.

usage: python scripts/build-gallery.py
"""
import datetime
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO_DIR = os.path.join(ROOT, "assets", "img", "gallery")
PHOTOS_JSON = os.path.join(PHOTO_DIR, "photos.json")
GALLERY_PAGE = os.path.join(ROOT, "gallery", "index.html")
SITEMAP = os.path.join(ROOT, "sitemap.xml")
SITE = "https://lequynhlan.github.io"
IMG_URL = "../assets/img/gallery/"

# The navigation entry for each page, as it appears when the gallery is live.
NAV_ON = {
    os.path.join(ROOT, "index.html"): '<li><a href="gallery/">gallery</a></li>',
    os.path.join(ROOT, "cv", "index.html"): '<li><a href="../gallery/">gallery</a></li>',
    GALLERY_PAGE: '<li><a href="./" aria-current="page">gallery</a></li>',
}


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def swap(text, name, inner):
    """Replace whatever sits between <!-- name:start --> and <!-- name:end -->."""
    start, end = "<!-- %s:start -->" % name, "<!-- %s:end -->" % name
    if start not in text or end not in text:
        raise SystemExit("marker %s not found" % name)
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    return pattern.sub(lambda _m: start + inner + end, text)


def load_photos():
    if not os.path.exists(PHOTOS_JSON):
        return []
    with open(PHOTOS_JSON, encoding="utf-8") as fh:
        photos = json.load(fh)
    for photo in photos:
        for key in ("file", "thumb"):
            name = photo.get(key)
            if name and not os.path.exists(os.path.join(PHOTO_DIR, name)):
                raise SystemExit("missing image listed in photos.json: " + name)
        if not photo.get("alt"):
            raise SystemExit("every photo needs alt text: " + photo.get("file", "?"))
    return photos


def card(photo):
    full = IMG_URL + photo["file"]
    thumb = IMG_URL + photo.get("thumb", photo["file"])
    alt = html.escape(photo["alt"], quote=True)
    lines = [
        '        <figure class="gallery__item">',
        '          <a href="%s"><img src="%s" alt="%s" loading="lazy"></a>' % (full, thumb, alt),
    ]
    if photo.get("caption"):
        lines.append("          <figcaption>%s</figcaption>" % html.escape(photo["caption"]))
    lines.append("        </figure>")
    return "\n".join(lines)


def build_gallery_page(photos):
    page = read(GALLERY_PAGE)
    if photos:
        cards = "\n" + "\n".join(card(p) for p in photos) + "\n        "
    else:
        cards = '\n        <p class="gallery__empty">Photos are on the way.</p>\n        '
    page = swap(page, "gallery", cards)
    page = swap(page, "robots", "" if photos else '<meta name="robots" content="noindex">')
    write(GALLERY_PAGE, page)


def build_nav(has_photos):
    for path, entry in NAV_ON.items():
        text = read(path)
        write(path, swap(text, "nav-gallery", entry if has_photos else ""))


def build_sitemap(has_photos):
    today = datetime.date.today().isoformat()
    paths = ["/", "/cv/"] + (["/gallery/"] if has_photos else [])
    rows = "".join(
        "  <url>\n    <loc>%s%s</loc>\n    <lastmod>%s</lastmod>\n  </url>\n" % (SITE, p, today)
        for p in paths
    )
    write(
        SITEMAP,
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + "</urlset>\n",
    )


def main():
    photos = load_photos()
    build_gallery_page(photos)
    build_nav(bool(photos))
    build_sitemap(bool(photos))
    print("gallery rebuilt with %d photo(s)" % len(photos))


if __name__ == "__main__":
    sys.exit(main())
