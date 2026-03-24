# NerdySnake6.github.io

Персональный сайт на [Hugo](https://gohugo.io/) с темой [Blowfish](https://blowfish.page/).

## Что внутри

- стартовая страница с профилем и кратким описанием проекта
- страница `О проекте`
- конфигурация Hugo в `config/_default`
- тема подключена как git submodule в `themes/blowfish`

## Быстрый старт

```bash
git submodule update --init --recursive
hugo server --cacheDir /tmp/hugo_cache
```

После запуска сайт будет доступен по адресу `http://localhost:1313/`.

## Сборка

```bash
hugo --gc --minify --cacheDir /tmp/hugo_cache
```

Готовый сайт собирается в директорию `public/`.

## Структура проекта

- `config/_default` - основная конфигурация сайта
- `content` - страницы и контент
- `static` - статические файлы
- `themes/blowfish` - тема оформления

## Заметки

- `public/` и `.hugo_build.lock` добавлены в `.gitignore`, чтобы не засорять репозиторий локальными артефактами
- `baseURL` настроен под GitHub Pages: `https://nerdysnake6.github.io/`
