import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredFiles = [
  'index.html',
  'ru/index.html',
  'style.css',
  'app.js',
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
  const resourcePattern = /<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;
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
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function validateRootPage(html) {
  const content = textContent(html);

  if (!/<html\s+lang=["']en["']/i.test(html)) {
    addError('index.html: корневая страница должна иметь lang="en" до появления нейтрального locale-кода.');
  }
  if (!content.includes('Igor Kalinin') || !content.includes('Игорь Калинин')) {
    addError('index.html: на странице выбора языка должны присутствовать оба написания имени.');
  }
  if (!/<a\b[^>]*\bhref=["']ru\/["']/i.test(html)) {
    addError('index.html: отсутствует рабочая ссылка на русскую версию ru/.');
  }
  if (/<a\b[^>]*\bhref=["']en\/["']/i.test(html)) {
    addError('index.html: английская ссылка не должна быть активной до итерации 2.');
  }
}

function validateRussianPage(html) {
  const content = textContent(html);
  const requiredSections = ['hero', 'projects', 'skills', 'about', 'certificates'];

  if (!/<html\s+lang=["']ru["']/i.test(html)) {
    addError('ru/index.html: ожидается lang="ru".');
  }
  if (!/<h1\b[^>]*>\s*Игорь Калинин\s*<\/h1>/i.test(html)) {
    addError('ru/index.html: h1 должен содержать имя "Игорь Калинин" в исходном HTML.');
  }
  if (!content.includes('Igor Kalinin')) {
    addError('ru/index.html: отсутствует альтернативное написание имени "Igor Kalinin".');
  }
  if (content.length < 5000) {
    addError('ru/index.html: основной текст слишком короткий или по-прежнему зависит от JavaScript.');
  }
  if (/data\.js|\bsiteData\b/.test(html)) {
    addError('ru/index.html: статическая русская версия не должна зависеть от data.js/siteData.');
  }

  const ids = new Set(extractHtmlIds(html));
  for (const section of requiredSections) {
    if (!ids.has(section)) {
      addError(`ru/index.html: отсутствует обязательный раздел id="${section}".`);
    }
  }
}

async function validatePage(relativePath, pageValidator) {
  const absolutePath = path.join(rootDir, relativePath);
  const html = await fs.readFile(absolutePath, 'utf8');

  pageValidator(html);
  validateUniqueIds(relativePath, html);
  validateAnchorTargets(relativePath, html);
  validateImageAltText(relativePath, html);
  await validateLocalRefs(relativePath, html);
}

async function main() {
  for (const file of requiredFiles) {
    if (!(await exists(path.join(rootDir, file)))) {
      addError(`Обязательный файл "${file}" не найден.`);
    }
  }

  if (errors.length === 0) {
    await validatePage('index.html', validateRootPage);
    await validatePage('ru/index.html', validateRussianPage);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`::error::${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Static site validation passed for the language entry and Russian portfolio.');
}

await main();
