# Quynh-Lan Le – personal website

A small static site: About, Gallery and CV pages. Plain HTML, CSS and a little JavaScript.
No build step on GitHub Pages, no dependencies. The look follows the al-folio academic theme
(white page, Roboto Light, purple accent, profile photo on the right).

```
index.html                       About page (home)
gallery/index.html               Photo gallery (cards are generated, see below)
cv/index.html                    CV page: contact card, PDF preview and download
assets/pdf/Le-Quynh-Lan-CV.pdf   the CV file (public copy, no phone number)
assets/css/                      tokens.css (colours), base.css, site-chrome.css, content.css, gallery.css
assets/js/                       theme-toggle.js, lightbox.js
assets/img/                      favicon.svg (clover), apple-touch-icon.png, og-card.png, gallery/
favicon.ico  robots.txt  sitemap.xml  .nojekyll
scripts/build-gallery.py         rebuilds the gallery page, its nav link and the sitemap
```

## Preview locally

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Run it inside this folder, then open <http://localhost:8000>.

## Profile photo

Save a square photo as `assets/img/avatar.jpg` (about 800 x 800 px), then in `index.html` delete the
`<!--` and `-->` lines around the `<div class="profile">` block.

## Gallery

1. Put the photos in `assets/img/gallery/` (about 1600 px on the long edge; strip location data first,
   phone photos carry GPS coordinates in their metadata).
2. List them in `assets/img/gallery/photos.json`, in display order:

   ```json
   [
     {"file": "summit.jpg", "caption": "Fansipan, 2026.", "alt": "A climber on a ridge above the clouds"}
   ]
   ```

3. Run `python scripts/build-gallery.py`. It writes the cards, shows the "gallery" link in the navigation
   and adds /gallery/ to the sitemap. With an empty list the link is hidden and the page is `noindex`.

## Edit

- **Text:** `index.html` (About) and `cv/index.html` (contact card).
- **Colours:** `assets/css/tokens.css`.
- **CV file:** overwrite `assets/pdf/Le-Quynh-Lan-CV.pdf` (keep the name) and update "Last updated" in
  `cv/index.html`. The public PDF leaves out the phone number on purpose.

## Deploy on GitHub Pages

The site is served from the `main` branch, root folder, of the repository `<username>.github.io`.
Commit and push to `main`; Pages rebuilds within a minute or two.

## SEO notes

- Every page has a title, description, canonical URL and Open Graph tags; the home page also carries
  schema.org `Person` and `WebSite` data (names: Quynh-Lan Le, Lê Quỳnh Lan, Le Quynh Lan).
- Add the site to Google Search Console (URL-prefix property `https://lequynhlan.github.io/`), submit
  `sitemap.xml` and request indexing of the home page.
- Link to the site from LinkedIn (Contact info, Website), the GitHub profile (Website field) and the CV.
  Use the same name form, Quynh-Lan Le, on all of them.
- Everything in this repository, including the PDF, is public.

## Hướng dẫn nhanh (tiếng Việt)

- Xem thử: `python -m http.server 8000 --bind 127.0.0.1` trong thư mục này, rồi mở <http://localhost:8000>.
- Ảnh avatar: lưu `assets/img/avatar.jpg` (vuông, khoảng 800 px) rồi bỏ dòng `<!--` và `-->` quanh khối
  `<div class="profile">` trong `index.html`.
- Gallery: bỏ ảnh vào `assets/img/gallery/`, khai báo trong `photos.json`, chạy
  `python scripts/build-gallery.py`. Xóa dữ liệu vị trí (GPS) khỏi ảnh trước khi đăng.
- Đăng lên: commit rồi push lên nhánh `main`; GitHub Pages tự cập nhật sau 1–2 phút.
