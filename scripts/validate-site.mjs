import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredFiles = ['index.html', 'style.css', 'data.js', 'app.js'];
const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

function isExternal(link) {
  return /^(?:[a-z]+:)?\/\//i.test(link) || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#');
}

function extractLocalRefs(html) {
  const refs = new Set();
  const attrPattern = /<(script|link|img)\b[^>]*\b(?:src|href)=["']([^"'#?]+)(?:[?#][^"']*)?["'][^>]*>/gi;

  for (const match of html.matchAll(attrPattern)) {
    const ref = match[2].trim();
    if (!ref || isExternal(ref)) {
      continue;
    }
    refs.add(ref);
  }

  return [...refs];
}

function extractHtmlIds(html) {
  const ids = new Set();
  const idPattern = /\bid=["']([^"']+)["']/gi;

  for (const match of html.matchAll(idPattern)) {
    ids.add(match[1]);
  }

  return ids;
}

async function loadSiteData() {
  const dataPath = path.join(rootDir, 'data.js');
  const source = await fs.readFile(dataPath, 'utf8');
  const context = vm.createContext({});

  try {
    const script = new vm.Script(`${source}\n;globalThis.__siteData = siteData;`, {
      filename: 'data.js'
    });
    script.runInContext(context);
  } catch (error) {
    addError(`Не удалось выполнить data.js в изолированном контексте: ${error.message}`);
    return null;
  }

  return context.__siteData ?? null;
}

function validateSiteData(siteData, htmlIds) {
  if (!siteData || typeof siteData !== 'object') {
    addError('siteData не найден или имеет неверный формат.');
    return;
  }

  const requiredSections = ['hero', 'nav', 'about', 'skills', 'achievements', 'projects', 'certificates', 'contacts'];
  for (const section of requiredSections) {
    if (!(section in siteData)) {
      addError(`В siteData отсутствует секция "${section}".`);
    }
  }

  if (siteData.hero?.photo && !htmlIds.has('hero-photo')) {
    addError('В index.html отсутствует контейнер с id="hero-photo".');
  }

  if (!Array.isArray(siteData.nav) || siteData.nav.length === 0) {
    addError('Навигация siteData.nav должна быть непустым массивом.');
  } else {
    for (const item of siteData.nav) {
      if (!item?.href?.startsWith('#')) {
        continue;
      }

      const targetId = item.href.slice(1);
      if (!htmlIds.has(targetId)) {
        addError(`Пункт навигации "${item.label}" ведет на несуществующий id "${targetId}".`);
      }
    }
  }

  if (siteData.hero?.photo) {
    addWarningIfMissing(siteData.hero.photo, 'Фото для hero не найдено, сайт покажет инициалы вместо изображения.');
  }

  if (Array.isArray(siteData.certificates?.items)) {
    for (const certificate of siteData.certificates.items) {
      if (certificate?.image) {
        addWarningIfMissing(
          certificate.image,
          `Изображение сертификата "${certificate.title ?? 'без названия'}" не найдено.`
        );
      }
    }
  }
}

function addWarningIfMissing(relativePath, message) {
  pendingWarningChecks.push(
    exists(relativePath).then(found => {
      if (!found) {
        addWarning(message);
      }
    })
  );
}

const pendingWarningChecks = [];

async function main() {
  for (const file of requiredFiles) {
    if (!(await exists(file))) {
      addError(`Обязательный файл "${file}" не найден.`);
    }
  }

  if (errors.length > 0) {
    reportAndExit();
    return;
  }

  const html = await fs.readFile(path.join(rootDir, 'index.html'), 'utf8');
  const htmlIds = extractHtmlIds(html);

  for (const ref of extractLocalRefs(html)) {
    if (!(await exists(ref))) {
      addError(`index.html ссылается на отсутствующий файл "${ref}".`);
    }
  }

  const siteData = await loadSiteData();
  validateSiteData(siteData, htmlIds);
  await Promise.all(pendingWarningChecks);
  reportAndExit();
}

function reportAndExit() {
  for (const warning of warnings) {
    console.warn(`::warning::${warning}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`::error::${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Static site validation passed.');
}

await main();
