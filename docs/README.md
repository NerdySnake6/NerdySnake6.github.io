# Техническая памятка

Этот файл нужен для сопровождения сайта.

## Структура проекта

```text
my-portfolio/
├── .github/
│   └── workflows/
│       └── pages.yml
├── assets/
│   ├── certificates/
│   │   ├── ai-business-spb-prize.png
│   │   ├── braim-if-else-final-2-place.webp
│   │   ├── lenta-tech-life-hack.webp
│   │   ├── braim-postgres-pro.png
│   │   └── stepik-sql-trainer.webp
│   ├── og/
│   │   ├── portfolio-preview.png
│   │   └── portfolio-preview.svg
│   ├── favicon.svg
│   ├── photo-cropped-20260425.jpg
│   └── photo.jpg
├── docs/
│   └── README.md
├── scripts/
│   ├── site-config.mjs
│   ├── update-site-origin.mjs
│   └── validate-site.mjs
├── en/
│   └── index.html
├── ru/
│   └── index.html
├── index.html
├── robots.txt
├── sitemap.xml
├── style.css
├── app.js
└── README.md
```

## Контент

Корневая страница выбора языка находится в `index.html`.
Русский и английский контент редактируются непосредственно в `ru/index.html` и
`en/index.html`, чтобы основной текст был доступен пользователям и поисковым
роботам без выполнения JavaScript. Файл `app.js` отвечает только за интерактивные
улучшения интерфейса и сохранение текущего раздела при переключении языка.

SEO-origin, публичные маршруты и URL ассетов задаются в
`scripts/site-config.mjs`. Validator сверяет с ними canonical, hreflang,
Open Graph, JSON-LD, sitemap и robots.txt, поэтому будущая смена домена
не требует ручного поиска URL по проекту.

Для смены домена нужно обновить `siteOrigin`, а затем выполнить:

```bash
node scripts/update-site-origin.mjs
node scripts/validate-site.mjs
```

## Ассеты

- `assets/photo-cropped-20260425.jpg` - основное фото профиля на сайте
- `assets/certificates/` - изображения сертификатов
- `assets/og/portfolio-preview.svg` - редактируемый исходник Open Graph-карточки
- `assets/og/portfolio-preview.png` - публикуемая карточка 1200×630
- `assets/favicon.svg` - favicon сайта

## Публикация

Сайт разворачивается через GitHub Pages и GitHub Actions.

- workflow: `.github/workflows/pages.yml`
- ветка публикации: `main`
- адрес сайта: `https://nerdysnake6.github.io/`

## Локальный просмотр

```bash
python3 -m http.server 8000
```
