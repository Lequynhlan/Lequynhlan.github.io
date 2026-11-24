# Lê Quỳnh Lan – personal website

A small static site: an About page and a CV page with a downloadable PDF.
Plain HTML, CSS and a little JavaScript. No build step, no dependencies.

```
index.html                       About page (home)
cv/index.html                    CV page: contact card, PDF preview and download
assets/pdf/Le-Quynh-Lan-CV.pdf   the CV file
assets/css/                      tokens.css (colours, type), base.css, site-chrome.css,
                                 content.css, hill-climbing-figure.css
assets/js/                       theme-toggle.js, ridge-profile.js, hill-climbing-figure.js
assets/img/favicon.svg
.nojekyll                        tells GitHub Pages to serve the files as they are
```

## Preview locally

```powershell
python -m http.server 8000
```

Open <http://localhost:8000>.

## Edit

- **Text:** `index.html` (About) and `cv/index.html` (contact card).
- **Colours and fonts:** `assets/css/tokens.css`.
- **CV file:** overwrite `assets/pdf/Le-Quynh-Lan-CV.pdf` (keep the file name so links keep
  working) and update "Last updated" in `cv/index.html`. The public PDF leaves out the phone
  number on purpose; keep it that way when you export a new one.
- **Portrait instead of the ridge figure:** save a photo as `assets/img/portrait.jpg`, then in
  `index.html` replace `<div class="hero__figure" data-hill-climbing></div>` with
  `<div class="hero__figure"><img class="hero__portrait" src="assets/img/portrait.jpg" alt="Lê Quỳnh Lan"></div>`.
- **New page** (for example Publications): copy `cv/index.html` to `publications/index.html`,
  change the content, and add a link to the `<nav>` of every page.

## Deploy on GitHub Pages

1. Create a public repository named `<your-github-username>.github.io`.
2. In this folder:

   ```powershell
   git init -b main
   git add .
   git commit -m "Add personal website"
   git remote add origin https://github.com/<your-github-username>/<your-github-username>.github.io.git
   git push -u origin main
   ```

3. On GitHub: Settings → Pages → Build and deployment → Source: **Deploy from a branch** →
   branch `main`, folder `/ (root)` → Save.
4. After a minute the site is live at `https://<your-github-username>.github.io/`.

Everything in the repository, including the PDF, becomes public. Read the PDF once more before
you push.

## Hướng dẫn nhanh (tiếng Việt)

- Xem thử: `python -m http.server 8000`, rồi mở <http://localhost:8000>.
- Sửa nội dung: `index.html` và `cv/index.html`. Thay CV: ghi đè
  `assets/pdf/Le-Quynh-Lan-CV.pdf` (giữ nguyên tên file) và sửa ngày "Last updated".
- Đăng lên web: tạo repo công khai tên `<tên-github>.github.io`, đẩy thư mục này lên nhánh
  `main`, rồi vào Settings → Pages → Deploy from a branch → `main` / root.
- File PDF sẽ công khai hoàn toàn: kiểm tra lại tên dự án, tên đơn vị và thông tin liên lạc
  trước khi đẩy lên.
