# Игорь Калинин: Portfolio

Персональный сайт-портфолио Backend & Data Developer.

Репозиторий содержит исходный код сайта, в котором собраны ключевые направления моей работы: backend-разработка, аналитика данных, прикладные проекты, достижения и сертификаты.

## Онлайн-версия

[nerdysnake6.github.io](https://nerdysnake6.github.io/)

Корневая страница предлагает выбрать язык. Русская версия доступна по адресу
[nerdysnake6.github.io/ru/](https://nerdysnake6.github.io/ru/), английская — по адресу
[nerdysnake6.github.io/en/](https://nerdysnake6.github.io/en/).

## Что представлено на сайте

- краткое профессиональное позиционирование
- навыки и инструменты для анализа данных
- достижения и учебно-практический опыт
- проекты с описанием задачи, стека и результата
- сертификаты
- контакты для связи

## Технологии

- HTML5
- CSS3
- JavaScript
- GitHub Pages
- GitHub Actions

## Структура проекта

```text
my-portfolio/
├── .github/
│   └── workflows/
│       └── pages.yml
├── assets/
│   ├── certificates/
│   ├── photo-cropped-20260425.jpg
│   └── photo.jpg
├── docs/
│   └── README.md
├── scripts/
│   └── validate-site.mjs
├── en/
│   └── index.html
├── ru/
│   └── index.html
├── index.html
├── style.css
├── app.js
└── README.md
```

- `index.html` - страница выбора языка
- `ru/index.html` - русская версия портфолио
- `en/index.html` - английская версия портфолио
- `style.css` - стили интерфейса
- `app.js` - progressive enhancement для меню, переключателя языка и сертификатов
- `assets/` - изображения профиля и сертификатов
- `.github/workflows/pages.yml` - CI и деплой в GitHub Pages
- `scripts/validate-site.mjs` - проверка структуры сайта

## Локальный запуск

```bash
python3 -m http.server 8000
```

После запуска сайт доступен по адресу `http://127.0.0.1:8000`.

## Контакты

- GitHub: [NerdySnake6](https://github.com/NerdySnake6)
- Email: [nerdysnake@yandex.ru](mailto:nerdysnake@yandex.ru)
