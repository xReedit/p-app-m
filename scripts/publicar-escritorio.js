// Compila la app de escritorio (Windows) firmada para el updater y deja lista la carpeta para subir a S3:
//   <salida>/<version>/Papaya-App-Mozo_<version>_x64-setup.exe
//   <salida>/<version>/latest_app_mozo.json
// Uso: subir la version en src-tauri/tauri.conf.json y correr `npm run exe`.
// Luego subir AMBOS archivos a S3_BASE (el json se sube con Cache-Control: no-cache).
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const S3_BASE = 'https://papaya-comercio-files.s3.us-east-2.amazonaws.com/installers';
const DIR_LLAVE = process.env.PAPAYA_UPDATER_DIR || 'D:\\certificados\\host-papaya\\app-mozo\\windows\\updater';
const SALIDA = process.env.PAPAYA_SALIDA_EXE || 'D:\\certificados\\host-papaya\\app-mozo\\windows';

const raiz = path.join(__dirname, '..');
const conf = JSON.parse(fs.readFileSync(path.join(raiz, 'src-tauri', 'tauri.conf.json'), 'utf8'));
const version = conf.version;

const llave = path.join(DIR_LLAVE, 'papaya-mozo-updater.key');
const clave = path.join(DIR_LLAVE, 'PASSWORD.txt');
if (!fs.existsSync(llave) || !fs.existsSync(clave)) {
  console.error(`Falta la llave de firma en ${DIR_LLAVE} (papaya-mozo-updater.key y PASSWORD.txt).`);
  process.exit(1);
}

console.log(`Compilando Papaya App Mozo ${version} (escritorio, firmado)...`);
execSync('npx tauri build', {
  cwd: raiz,
  stdio: 'inherit',
  env: {
    ...process.env,
    TAURI_SIGNING_PRIVATE_KEY: fs.readFileSync(llave, 'utf8'),
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: fs.readFileSync(clave, 'utf8').trim(),
  },
});

const nsis = path.join(raiz, 'src-tauri', 'target', 'release', 'bundle', 'nsis');
const setup = path.join(nsis, `${conf.productName}_${version}_x64-setup.exe`);
const firma = `${setup}.sig`;
if (!fs.existsSync(setup) || !fs.existsSync(firma)) {
  console.error(`No se genero el instalador firmado: ${setup}(.sig)`);
  process.exit(1);
}

// nombre sin espacios para la URL de S3
const nombre = `Papaya-App-Mozo_${version}_x64-setup.exe`;
const destino = path.join(SALIDA, version);
fs.mkdirSync(destino, { recursive: true });
fs.copyFileSync(setup, path.join(destino, nombre));

const latest = {
  version,
  notes: `Papaya App Mozo ${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': { signature: fs.readFileSync(firma, 'utf8').trim(), url: `${S3_BASE}/${nombre}` },
  },
};
fs.writeFileSync(path.join(destino, 'latest_app_mozo.json'), JSON.stringify(latest, null, 2));

console.log(`\nListo para subir a ${S3_BASE}/ :`);
console.log(`  ${path.join(destino, nombre)}`);
console.log(`  ${path.join(destino, 'latest_app_mozo.json')}   (Cache-Control: no-cache)`);
