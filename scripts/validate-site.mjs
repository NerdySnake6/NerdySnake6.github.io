import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  githubProfileUrl,
  pageUrls,
  seoAssets,
  siteOrigin
} from './site-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pageDefinitions = [
  {
    relativePath: 'index.html',
    lang: 'en',
    canonical: pageUrls.root,
    title: 'Igor Kalinin / Игорь Калинин — Backend & Data Developer',
    description: "Choose the Russian or English version of Igor Kalinin's portfolio — Backend & Data Developer.",
    primaryName: 'Igor Kalinin',
    alternateName: 'Игорь Калинин',
    ogLocale: 'en_US',
    ogAlternateLocale: 'ru_RU',
    ogImage: seoAssets.socialPreviews.default,
    ogImageAlt: 'Igor Kalinin / Игорь Калинин — Backend & Data Developer',
    isPortfolio: false
  },
  {
    relativePath: 'ru/index.html',
    lang: 'ru',
    canonical: pageUrls.ru,
    title: 'Игорь Калинин — Backend & Data Developer',
    description: 'Игорь Калинин — Backend & Data Developer. Проекты на Python, FastAPI, PostgreSQL, в анализе данных и машинном обучении.',
    primaryName: 'Игорь Калинин',
    alternateName: 'Igor Kalinin',
    ogLocale: 'ru_RU',
    ogAlternateLocale: 'en_US',
    ogImage: seoAssets.socialPreviews.ru,
    ogImageAlt: 'Игорь Калинин — Backend & Data Developer',
    isPortfolio: true,
    languageSwitch: { href: '../en/', hreflang: 'en' }
  },
  {
    relativePath: 'en/index.html',
    lang: 'en',
    canonical: pageUrls.en,
    title: 'Igor Kalinin — Backend & Data Developer',
    description: 'Igor Kalinin — Backend & Data Developer. Explore projects built with Python, FastAPI, PostgreSQL, data analysis, and machine learning.',
    primaryName: 'Igor Kalinin',
    alternateName: 'Игорь Калинин',
    ogLocale: 'en_US',
    ogAlternateLocale: 'ru_RU',
    ogImage: seoAssets.socialPreviews.en,
    ogImageAlt: 'Igor Kalinin — Backend & Data Developer',
    isPortfolio: true,
    languageSwitch: { href: '../ru/', hreflang: 'ru' }
  }
];

const expectedHreflang = new Map([
  ['ru', pageUrls.ru],
  ['en', pageUrls.en],
  ['x-default', pageUrls.root]
]);
const requiredPortfolioSections = ['hero', 'projects', 'skills', 'about', 'certificates'];
const googleVerification = Object.freeze({
  relativePath: 'googled97190a15f76ecb8.html',
  content: 'google-site-verification: googled97190a15f76ecb8.html'
});
const yandexVerification = Object.freeze({
  relativePath: 'yandex_8fa605cab47da265.html',
  token: '8fa605cab47da265'
});
const requiredFiles = [
  ...pageDefinitions.map(page => page.relativePath),
  'style.css',
  'app.js',
  'robots.txt',
  'sitemap.xml',
  'scripts/site-config.mjs',
  'scripts/update-site-origin.mjs',
  'assets/favicon.svg',
  'assets/og/portfolio-preview-default.svg',
  'assets/og/portfolio-preview-default.png',
  'assets/og/portfolio-preview-ru.svg',
  'assets/og/portfolio-preview-ru.png',
  'assets/og/portfolio-preview-en.svg',
  'assets/og/portfolio-preview-en.png',
  googleVerification.relativePath,
  yandexVerification.relativePath,
  '.nojekyll'
];
const errors = [];

function addError(message) {
  errors.push(message);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

function extractAttributes(tag) {
  const attributes = new Map();
  const attributePattern = /\b([:\w-]+)\s*=\s*(["'])(.*?)\2/gs;

  for (const match of tag.matchAll(attributePattern)) {
    attributes.set(match[1].toLowerCase(), decodeHtmlEntities(match[3]));
  }

  return attributes;
}

function extractTags(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  return [...html.matchAll(pattern)].map(match => ({
    source: match[0],
    attributes: extractAttributes(match[0])
  }));
}

function findTagByAttribute(html, tagName, attributeName, attributeValue) {
  return extractTags(html, tagName).find(tag => {
    const value = tag.attributes.get(attributeName);
    return value?.toLowerCase() === attributeValue.toLowerCase();
  });
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].replace(/\s+/g, ' ').trim()) : '';
}

function extractDescription(html) {
  const tag = findTagByAttribute(html, 'meta', 'name', 'description');
  return tag?.attributes.get('content')?.trim() || '';
}

function extractCanonical(html) {
  const tag = extractTags(html, 'link').find(link => {
    const rel = link.attributes.get('rel')?.toLowerCase().split(/\s+/) || [];
    return rel.includes('canonical');
  });
  return tag?.attributes.get('href') || '';
}

function extractHreflang(relativePath, html) {
  const values = new Map();

  for (const link of extractTags(html, 'link')) {
    const rel = link.attributes.get('rel')?.toLowerCase().split(/\s+/) || [];
    const hreflang = link.attributes.get('hreflang')?.toLowerCase();
    const href = link.attributes.get('href');
    if (rel.includes('alternate') && hreflang && href) {
      if (values.has(hreflang)) {
        addError(`${relativePath}: hreflang="${hreflang}" объявлен более одного раза.`);
      }
      values.set(hreflang, href);
    }
  }

  return values;
}

function extractOpenGraph(html) {
  const values = new Map();

  for (const meta of extractTags(html, 'meta')) {
    const property = meta.attributes.get('property')?.toLowerCase();
    const content = meta.attributes.get('content');
    if (property?.startsWith('og:') && content && !values.has(property)) {
      values.set(property, content);
    }
  }

  return values;
}

function extractJsonLd(relativePath, html) {
  const values = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(scriptPattern)) {
    const attributes = extractAttributes(match[1]);
    if (attributes.get('type')?.toLowerCase() !== 'application/ld+json') continue;

    try {
      values.push(JSON.parse(match[2].trim()));
    } catch (error) {
      addError(`${relativePath}: JSON-LD содержит невалидный JSON: ${error.message}`);
    }
  }

  return values;
}

function isExternal(ref) {
  return /^(?:[a-z]+:)?\/\//i.test(ref)
    || ref.startsWith('mailto:')
    || ref.startsWith('tel:')
    || ref.startsWith('data:')
    || ref.startsWith('#');
}

function cleanRef(ref) {
  return ref.trim().split(/[?#]/, 1)[0];
}

function extractLocalRefs(html) {
  const refs = new Set();
  const resourcePattern = /<(?:script|link|img|a)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;
  const certificatePattern = /\bdata-certificate-image=["']([^"']+)["']/gi;

  for (const pattern of [resourcePattern, certificatePattern]) {
    for (const match of html.matchAll(pattern)) {
      const ref = cleanRef(match[1]);
      if (ref && !isExternal(ref)) refs.add(ref);
    }
  }

  return [...refs];
}

function extractHtmlIds(html) {
  const ids = [];
  const idPattern = /\bid=["']([^"']+)["']/gi;

  for (const match of html.matchAll(idPattern)) {
    ids.push(match[1]);
  }

  return ids;
}

function textContent(html) {
  return decodeHtmlEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function validateUniqueIds(relativePath, html) {
  const ids = extractHtmlIds(html);
  const seen = new Set();

  for (const id of ids) {
    if (seen.has(id)) {
      addError(`${relativePath}: id="${id}" используется более одного раза.`);
    }
    seen.add(id);
  }
}

function validateAnchorTargets(relativePath, html) {
  const ids = new Set(extractHtmlIds(html));
  const anchorPattern = /<a\b[^>]*\bhref=["']#([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    if (!ids.has(match[1])) {
      addError(`${relativePath}: ссылка ведет на отсутствующий id="${match[1]}".`);
    }
  }
}

function validateImageAltText(relativePath, html) {
  const imagePattern = /<img\b([^>]*)>/gi;

  for (const match of html.matchAll(imagePattern)) {
    if (!/\balt=["'][^"']+["']/i.test(match[1])) {
      addError(`${relativePath}: изображение без непустого alt-текста: ${match[0]}`);
    }
  }
}

async function validateLocalRefs(relativePath, html) {
  const pageDir = path.dirname(path.join(rootDir, relativePath));

  for (const ref of extractLocalRefs(html)) {
    const resolvedPath = path.resolve(pageDir, ref);
    if (!resolvedPath.startsWith(`${rootDir}${path.sep}`) && resolvedPath !== rootDir) {
      addError(`${relativePath}: локальная ссылка выходит за пределы проекта: ${ref}`);
      continue;
    }

    if (!(await exists(resolvedPath))) {
      addError(`${relativePath}: не найден локальный ресурс "${ref}".`);
    }
  }
}

function validateHreflang(relativePath, hreflang) {
  if (hreflang.size !== expectedHreflang.size) {
    addError(`${relativePath}: ожидаются hreflang ru, en и x-default.`);
  }

  for (const [language, expectedUrl] of expectedHreflang) {
    if (hreflang.get(language) !== expectedUrl) {
      addError(`${relativePath}: hreflang="${language}" должен указывать на ${expectedUrl}.`);
    }
  }
}

function validateOpenGraph(definition, openGraph) {
  const expected = new Map([
    ['og:type', 'website'],
    ['og:title', definition.title],
    ['og:description', definition.description],
    ['og:url', definition.canonical],
    ['og:locale', definition.ogLocale],
    ['og:locale:alternate', definition.ogAlternateLocale],
    ['og:image', definition.ogImage],
    ['og:image:type', 'image/png'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', definition.ogImageAlt]
  ]);

  for (const [property, expectedValue] of expected) {
    if (openGraph.get(property) !== expectedValue) {
      addError(`${definition.relativePath}: ${property} должен иметь значение "${expectedValue}".`);
    }
  }
}

function validateStructuredData(definition, jsonLdValues) {
  if (jsonLdValues.length !== 1) {
    addError(`${definition.relativePath}: ожидается ровно один JSON-LD блок.`);
    return;
  }

  const profilePage = jsonLdValues[0];
  const person = profilePage.mainEntity;

  if (profilePage['@context'] !== 'https://schema.org') {
    addError(`${definition.relativePath}: JSON-LD должен использовать context https://schema.org.`);
  }
  if (profilePage['@type'] !== 'ProfilePage') {
    addError(`${definition.relativePath}: верхний уровень JSON-LD должен иметь @type ProfilePage.`);
  }
  if (profilePage.url !== definition.canonical) {
    addError(`${definition.relativePath}: ProfilePage.url должен совпадать с canonical.`);
  }
  if (!person || person['@type'] !== 'Person') {
    addError(`${definition.relativePath}: ProfilePage.mainEntity должен иметь @type Person.`);
    return;
  }
  if (person.name !== definition.primaryName || person.alternateName !== definition.alternateName) {
    addError(`${definition.relativePath}: Person должен содержать локализованные name и alternateName.`);
  }
  if (person.jobTitle !== 'Backend & Data Developer') {
    addError(`${definition.relativePath}: Person.jobTitle должен содержать специализацию.`);
  }
  if (person.image !== seoAssets.profileImage) {
    addError(`${definition.relativePath}: Person.image должен указывать на публичную фотографию.`);
  }
  if (person.url !== definition.canonical) {
    addError(`${definition.relativePath}: Person.url должен совпадать с URL страницы.`);
  }
  if (!Array.isArray(person.sameAs) || !person.sameAs.includes(githubProfileUrl)) {
    addError(`${definition.relativePath}: Person.sameAs должен содержать GitHub-профиль.`);
  }
  if ('email' in person || 'telephone' in person) {
    addError(`${definition.relativePath}: JSON-LD не должен дублировать email или телефон.`);
  }
}

function validatePageContent(definition, html) {
  const content = textContent(html);

  if (!new RegExp(`<html\\s+lang=["']${definition.lang}["']`, 'i').test(html)) {
    addError(`${definition.relativePath}: ожидается lang="${definition.lang}".`);
  }
  if (!content.includes(definition.primaryName) || !content.includes(definition.alternateName)) {
    addError(`${definition.relativePath}: в исходном HTML должны присутствовать оба написания имени.`);
  }
  if (/<meta\b[^>]*(?:name|property)=["']twitter:/i.test(html)) {
    addError(`${definition.relativePath}: Twitter Card не входит в выбранную SEO-конфигурацию.`);
  }

  if (!definition.isPortfolio) {
    if (!/<a\b[^>]*\bhref=["']ru\/["']/i.test(html)) {
      addError('index.html: отсутствует рабочая ссылка на русскую версию ru/.');
    }
    if (!/<a\b[^>]*\bhref=["']en\/["']/i.test(html)) {
      addError('index.html: отсутствует рабочая ссылка на английскую версию en/.');
    }
    return;
  }

  const headingPattern = new RegExp(`<h1\\b[^>]*>\\s*${definition.primaryName}\\s*</h1>`, 'i');
  if (!headingPattern.test(html)) {
    addError(`${definition.relativePath}: h1 должен содержать имя "${definition.primaryName}".`);
  }
  if (content.length < 5000) {
    addError(`${definition.relativePath}: основной текст слишком короткий или зависит от JavaScript.`);
  }
  if (/data\.js|\bsiteData\b/.test(html)) {
    addError(`${definition.relativePath}: статическая версия не должна зависеть от data.js/siteData.`);
  }

  const { href, hreflang } = definition.languageSwitch;
  const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const switchPattern = new RegExp(
    `<a\\b[^>]*\\bhref=["']${escapedHref}["'][^>]*\\bhreflang=["']${hreflang}["'][^>]*\\bdata-language-switch\\b`,
    'i'
  );
  if (!switchPattern.test(html)) {
    addError(`${definition.relativePath}: отсутствует обычная ссылка-переключатель языка.`);
  }

  const ids = new Set(extractHtmlIds(html));
  for (const section of requiredPortfolioSections) {
    if (!ids.has(section)) {
      addError(`${definition.relativePath}: отсутствует обязательный раздел id="${section}".`);
    }
  }
}

async function validatePage(definition) {
  const absolutePath = path.join(rootDir, definition.relativePath);
  const html = await fs.readFile(absolutePath, 'utf8');
  const title = extractTitle(html);
  const description = extractDescription(html);
  const canonical = extractCanonical(html);
  const hreflang = extractHreflang(definition.relativePath, html);
  const openGraph = extractOpenGraph(html);
  const jsonLdValues = extractJsonLd(definition.relativePath, html);

  validatePageContent(definition, html);
  validateUniqueIds(definition.relativePath, html);
  validateAnchorTargets(definition.relativePath, html);
  validateImageAltText(definition.relativePath, html);
  await validateLocalRefs(definition.relativePath, html);

  if (title !== definition.title) {
    addError(`${definition.relativePath}: title должен иметь значение "${definition.title}".`);
  }
  if (description !== definition.description) {
    addError(`${definition.relativePath}: description должен иметь значение "${definition.description}".`);
  }
  if (canonical !== definition.canonical) {
    addError(`${definition.relativePath}: canonical должен указывать на ${definition.canonical}.`);
  }

  validateHreflang(definition.relativePath, hreflang);
  validateOpenGraph(definition, openGraph);
  validateStructuredData(definition, jsonLdValues);

  const favicon = extractTags(html, 'link').find(link => {
    const rel = link.attributes.get('rel')?.toLowerCase().split(/\s+/) || [];
    return rel.includes('icon');
  });
  if (!favicon) {
    addError(`${definition.relativePath}: отсутствует favicon.`);
  }

  return { title, description };
}

function validateUniqueMetadata(records) {
  for (const property of ['title', 'description']) {
    const seen = new Map();
    for (const [relativePath, record] of records) {
      const value = record[property];
      if (seen.has(value)) {
        addError(`${relativePath}: ${property} дублирует значение из ${seen.get(value)}.`);
      } else {
        seen.set(value, relativePath);
      }
    }
  }
}

async function validateSitemap() {
  const sitemap = await fs.readFile(path.join(rootDir, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)]
    .map(match => decodeHtmlEntities(match[1].trim()));
  const expectedUrls = new Set(Object.values(pageUrls));

  if (!/<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i.test(sitemap)) {
    addError('sitemap.xml: отсутствует корректный urlset namespace.');
  }
  if (urls.length !== new Set(urls).size) {
    addError('sitemap.xml: обнаружены повторяющиеся URL.');
  }
  if (urls.length !== expectedUrls.size) {
    addError('sitemap.xml: должен содержать ровно три публичные страницы.');
  }
  for (const url of expectedUrls) {
    if (!urls.includes(url)) {
      addError(`sitemap.xml: отсутствует URL ${url}.`);
    }
  }
}

async function validateRobots() {
  const robots = await fs.readFile(path.join(rootDir, 'robots.txt'), 'utf8');

  if (!/^User-agent:\s*\*\s*$/im.test(robots) || !/^Allow:\s*\/\s*$/im.test(robots)) {
    addError('robots.txt: должен разрешать обход сайта всем роботам.');
  }
  if (!new RegExp(`^Sitemap:\\s*${seoAssets.sitemap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im').test(robots)) {
    addError(`robots.txt: должен ссылаться на ${seoAssets.sitemap}.`);
  }
}

async function validatePreviewImage(relativePath) {
  const previewPath = path.join(rootDir, relativePath);
  const buffer = await fs.readFile(previewPath);
  const pngSignature = '89504e470d0a1a0a';

  if (buffer.subarray(0, 8).toString('hex') !== pngSignature || buffer.length < 24) {
    addError(`${relativePath}: Open Graph preview должен быть валидным PNG-файлом.`);
    return;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    addError(`${relativePath}: Open Graph preview должен иметь размер 1200×630, получено ${width}×${height}.`);
  }
}

async function validatePreviewImages() {
  const previewBaseNames = [
    'portfolio-preview-default',
    'portfolio-preview-ru',
    'portfolio-preview-en'
  ];

  for (const baseName of previewBaseNames) {
    const pngPath = `assets/og/${baseName}.png`;
    const svgPath = `assets/og/${baseName}.svg`;
    const svg = await fs.readFile(path.join(rootDir, svgPath), 'utf8');

    await validatePreviewImage(pngPath);
    if (!/<svg\b[^>]*\bwidth=["']1200["'][^>]*\bheight=["']630["'][^>]*\bviewBox=["']0 0 1200 630["']/i.test(svg)) {
      addError(`${svgPath}: ожидается SVG размером 1200×630 с соответствующим viewBox.`);
    }
    if (!/href=["']\.\.\/photo-20260425\.jpg["']/i.test(svg)) {
      addError(`${svgPath}: исходник должен использовать общую профессиональную фотографию.`);
    }
  }
}

async function validateFavicon() {
  const favicon = await fs.readFile(path.join(rootDir, 'assets/favicon.svg'), 'utf8');
  if (!/<svg\b[^>]*viewBox=["']0 0 64 64["']/i.test(favicon)) {
    addError('assets/favicon.svg: ожидается SVG с viewBox="0 0 64 64".');
  }
}

async function validateGoogleVerification() {
  const verification = await fs.readFile(
    path.join(rootDir, googleVerification.relativePath),
    'utf8'
  );

  if (verification.trim() !== googleVerification.content) {
    addError(`${googleVerification.relativePath}: содержимое файла подтверждения Google изменено.`);
  }
}

async function validateYandexVerification() {
  const verification = await fs.readFile(
    path.join(rootDir, yandexVerification.relativePath),
    'utf8'
  );
  const expectedBody = `<body>Verification: ${yandexVerification.token}</body>`;

  if (!verification.includes(expectedBody)) {
    addError(`${yandexVerification.relativePath}: токен подтверждения Яндекса изменён.`);
  }
}

async function main() {
  if (!siteOrigin.startsWith('https://')) {
    addError('scripts/site-config.mjs: siteOrigin должен использовать HTTPS.');
  }

  for (const file of requiredFiles) {
    if (!(await exists(path.join(rootDir, file)))) {
      addError(`Обязательный файл "${file}" не найден.`);
    }
  }

  if (errors.length === 0) {
    const records = new Map();
    for (const definition of pageDefinitions) {
      records.set(definition.relativePath, await validatePage(definition));
    }

    validateUniqueMetadata(records);
    await validateSitemap();
    await validateRobots();
    await validatePreviewImages();
    await validateFavicon();
    await validateGoogleVerification();
    await validateYandexVerification();
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`::error::${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Multilingual SEO validation passed for all pages and public assets.');
}

await main();
