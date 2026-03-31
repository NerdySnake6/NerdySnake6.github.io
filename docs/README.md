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
│   │   ├── braim-if-else.png
│   │   └── braim-postgres-pro.png
│   └── photo.jpg
├── docs/
│   └── README.md
├── scripts/
│   └── validate-site.mjs
├── index.html
├── style.css
├── app.js
├── data.js
└── README.md
```

## Контент

Основной контент редактируется в `data.js`.

- `hero` — первый экран
- `about` — блок "Обо мне"
- `skills` — навыки
- `achievements` — достижения
- `projects` — проекты
- `certificates` — сертификаты
- `contacts` — контакты

## Ассеты

- `assets/photo.jpg` — фото профиля
- `assets/certificates/` — изображения сертификатов

## Публикация

Сайт разворачивается через GitHub Pages и GitHub Actions.

- workflow: `.github/workflows/pages.yml`
- ветка публикации: `main`
- адрес сайта: `https://nerdysnake6.github.io/`

## Локальный просмотр

```bash
python3 -m http.server 8000
```
