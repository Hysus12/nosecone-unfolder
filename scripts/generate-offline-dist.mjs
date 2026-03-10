import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const outDir = join(root, 'offline-dist');
const readme = join(root, 'README-STUDENT.txt');
const assetsDir = join(distDir, 'assets');

if (!existsSync(distDir)) {
  throw new Error('dist/ 不存在，請先執行 npm run build');
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(distDir, outDir, { recursive: true });
cpSync(readme, join(outDir, 'README-STUDENT.txt'));
cpSync(join(root, 'public', 'examples'), join(outDir, 'examples'), { recursive: true });

const topLevelFiles = readdirSync(distDir).filter((file) => statSync(join(distDir, file)).isFile());
const topLevelScript = topLevelFiles.find((file) => !file.endsWith('.css') && !file.endsWith('.html') && !file.endsWith('.map'));
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const assetJs = assetFiles.find((file) => file.endsWith('.js'));
const assetCss = assetFiles.find((file) => file.endsWith('.css'));
const scriptSrc = topLevelScript ? `./${topLevelScript}` : assetJs ? `./assets/${assetJs}` : '';
const cssHref = assetCss ? `./assets/${assetCss}` : '';

if (!scriptSrc) {
  throw new Error('找不到 build 產出的 JavaScript 檔案');
}

const indexHtml = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenRocket Nosecone Unfolder Offline</title>
    ${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
writeFileSync(join(outDir, 'index.html'), indexHtml, 'utf8');

const audit = [
  'Release checklist:',
  '- Open offline-dist/index.html via file:// in Chromium-based browser',
  '- Confirm manual example renders',
  '- Confirm local .ork import works',
  '- Confirm SVG/PDF/ZIP exports work',
  '- Confirm no fetch/worker/chunk/asset file:// errors in console',
  '- Print at 100% scale and verify the 20 mm calibration square'
].join('\n');
writeFileSync(join(outDir, 'RELEASE-CHECKLIST.txt'), audit, 'utf8');
