/**
 * Lee .env y genera src/environments/environment.secret.ts
 * Ejecutar antes de start/build (ver package.json).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'src', 'environments', 'environment.secret.ts');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        if (idx === -1) {
          return [line.trim(), ''];
        }
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      })
  );
}

const env = loadEnv(envPath);
const googleMapsApiKey = env.GOOGLE_MAPS_API_KEY || '';

if (!fs.existsSync(envPath)) {
  console.warn('[sync-env] No se encontró .env. Copia .env.example a .env y define GOOGLE_MAPS_API_KEY.');
} else if (!googleMapsApiKey) {
  console.warn('[sync-env] GOOGLE_MAPS_API_KEY está vacío en .env');
}

const content = `// AUTO-GENERADO por scripts/sync-env.js — no editar ni commitear
export const environmentSecret = {
  googleMapsApiKey: '${googleMapsApiKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'
};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('[sync-env] Generado src/environments/environment.secret.ts');
