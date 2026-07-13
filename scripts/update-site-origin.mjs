import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteOrigin } from './site-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const managedFiles = [
  'index.html',
  'ru/index.html',
  'en/index.html',
  'robots.txt',
  'sitemap.xml'
];

function extractCurrentOrigin(rootHtml) {
  const canonicalMatch = rootHtml.match(
    /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i
  );
  if (!canonicalMatch) {
    throw new Error('Не удалось определить текущий origin из canonical в index.html.');
  }

  return new URL(canonicalMatch[1]).origin;
}

async function main() {
  const rootHtml = await fs.readFile(path.join(rootDir, 'index.html'), 'utf8');
  const currentOrigin = extractCurrentOrigin(rootHtml);

  if (currentOrigin === siteOrigin) {
    console.log(`Site origin is already synchronized: ${siteOrigin}`);
    return;
  }

  for (const relativePath of managedFiles) {
    const absolutePath = path.join(rootDir, relativePath);
    const content = await fs.readFile(absolutePath, 'utf8');
    const updatedContent = content.replaceAll(currentOrigin, siteOrigin);

    if (content === updatedContent) {
      throw new Error(`${relativePath}: текущий origin ${currentOrigin} не найден.`);
    }

    await fs.writeFile(absolutePath, updatedContent, 'utf8');
  }

  console.log(`Updated site origin: ${currentOrigin} -> ${siteOrigin}`);
}

await main();
