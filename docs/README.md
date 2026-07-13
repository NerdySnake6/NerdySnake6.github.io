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
│   ├── photo-cropped-20260425.jpg
│   └── photo.jpg
├── docs/
│   └── README.md
├── scripts/
│   └── validate-site.mjs
├── ru/
│   └── index.html
├── index.html
├── style.css
├── app.js
└── README.md
```

## Контент

Корневая страница выбора языка находится в `index.html`.
Русский контент редактируется непосредственно в `ru/index.html`, чтобы основной
текст был доступен пользователям и поисковым роботам без выполнения JavaScript.
Файл `app.js` отвечает только за интерактивные улучшения интерфейса.

## Ассеты

- `assets/photo-cropped-20260425.jpg` - основное фото профиля на сайте
- `assets/certificates/` - изображения сертификатов

## Публикация

Сайт разворачивается через GitHub Pages и GitHub Actions.

- workflow: `.github/workflows/pages.yml`
- ветка публикации: `main`
- адрес сайта: `https://nerdysnake6.github.io/`

## Локальный просмотр

```bash
python3 -m http.server 8000
```
