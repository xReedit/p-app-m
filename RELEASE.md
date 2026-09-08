# Publicar Papaya App Mozo

Estado al 2026-09-07: versión **1.0.5**, `versionCode` / build **8**, `targetSdk 36`, Capacitor 8.

## 0. Antes de compilar (cualquier plataforma)

```bash
# .env con GOOGLE_MAPS_API_KEY (no se commitea); genera environment.secret.ts
npm run build          # ya compila en produccion (ng build --configuration production)
npx cap sync           # copia dist/ a android/ e ios/ y actualiza plugins
```

Verificar que `src/app/shared/config/config.const.ts` tenga las URLs de producción
(`https://app.restobar.papaya.com.pe/...`) y que en `android/app/src/main/AndroidManifest.xml`
NO exista `android:usesCleartextTraffic="true"` ni en `capacitor.config.ts` `allowMixedContent`.

## 1. Android (Google Play)

Subir versión en `android/app/build.gradle` (`versionCode` +1, `versionName`).

```bash
cd android
.\gradlew.bat bundleRelease
# resultado: android/app/build/outputs/bundle/release/app-release.aab (SIN firmar)
```

Llave de subida (la registró Android Studio en `android/.idea/workspace.xml`):

- Keystore: `D:\certificados\host-papaya\app-mozo\android\certificado android\key-mozo.jks`
- Alias: `key-mozo`
- En la misma carpeta está `private_key.pepk` (Play App Signing) y en `..\release\` el último `.aab` subido,
  firmado por el certificado `CN=marcelo, O=papaya.com.pe` con SHA-1
  `39:2D:8D:5E:81:7A:7E:50:DF:0E:BA:97:63:82:B5:24:FC:40:39:FB` (debe coincidir con el de Play Console).

Firmar y verificar:

```bash
"C:\Program Files\Java\jdk1.8.0_351\bin\jarsigner.exe" -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
  -keystore "D:\certificados\host-papaya\app-mozo\android\certificado android\key-mozo.jks" ^
  android\app\build\outputs\bundle\release\app-release.aab key-mozo

"C:\Program Files\Java\jdk1.8.0_351\bin\jarsigner.exe" -verify android\app\build\outputs\bundle\release\app-release.aab
```

(Alternativa: Android Studio > Build > Generate Signed Bundle / APK con el mismo keystore.)

Play Console > Producción > Crear nueva versión > subir el `.aab`. Notas de la versión sugeridas:
"Envío de pedidos más confiable con señal lenta, cantidad de personas por mesa, correcciones."

`npx cap run` no funciona en esta PC (`NoDefaultCurrentDirectoryInExePath=1`); usar `gradlew.bat` directo.

## 2. iOS (App Store), en la Mac

Requisitos: Xcode 16+, CocoaPods, cuenta Apple Developer. Deployment target ya está en iOS 15.

Certificado de distribución vigente (Apple Distribution, equipo HQ75D833B3, vence 08-09-2027) en
`D:\certificados\host-papayapp-mozo\certificados ios6\`: `Certificates-2026.p12` (contraseña en
CLAUDE.local.md), `distribution.cer` y la clave privada `apple-distribution-2026.key` (conservarla: sin ella el
certificado queda inservible). Se hizo con OpenSSL en Windows (CSR + `openssl pkcs12 -export`), sin Mac.
El build se hace en Ionic Appflow: subir ahí el `.p12` y el `.mobileprovision` App Store del App ID
`mozo.papaya.com.pe` (regenerar el perfil después de activar Push en el App ID).

```bash
git pull
npm install            # corre sync-env; necesita el .env con la clave de Maps
npm run build
npx cap sync ios       # aqui si corre pod install
npx cap open ios
```

En Xcode:
1. Target App > Signing & Capabilities: Team y bundle id `mozo.papaya.com.pe`.
2. General: Version 1.0.5, Build 8 (ya vienen del `project.pbxproj`).
3. Capabilities: Push Notifications (la app usa `@capacitor/push-notifications`).
4. Product > Archive > Distribute App > App Store Connect.
5. En App Store Connect completar ficha, capturas y enviar a revisión.

Si Maps no carga en el celular: en Google Cloud, la clave debe permitir el referrer
`https://localhost/*` (origen del WebView de Capacitor) además de los dominios web.

## 3. Backend y POS que acompañan esta versión

- Migración `restobar/migraciones/2026-09-07_021_sede_opciones_mozo_num_personas.sql` en producción.
- Desplegar `backend-pedidos` (idempotencia de `nuevoPedido`, `mozo_num_personas` en `getDataSede`).
- Regenerar `dist/` del POS con `minify.sh` (opción "Cantidad de personas por mesa").

## 3. Push notifications (llamado de mesa)

- Proyecto Firebase: **`push-papaya-com-pe`** (el mismo de repartidor y app cliente; el backend firma con su
  `serviceAccountKey.json`). NO usar `push-notification-app-papaya` (solo Firestore): da `SenderId mismatch`.
- Archivos nativos (ignorados por `.gitignore`, van con `git add -f`):
  `android/app/google-services.json` y `ios/App/App/GoogleService-Info.plist` (Appflow los necesita en el repo).
- iOS: `App.entitlements` (aps-environment), `Info.plist` con `remote-notification`, pod `FirebaseMessaging`,
  `AppDelegate.swift` convierte el token APNs en token FCM. Falta de tu lado: capability Push en el App ID,
  perfil de aprovisionamiento regenerado y subido a Appflow, llave APNs `.p8` cargada en Firebase (proyecto de arriba).
- Backend: tabla `usuario_push_token` (migracion 2026-09-07_027), endpoint `POST mozo/push-token`,
  envio en `service/push.mozo.service.js` (solo a mozos con socket conectado en las ultimas 24 h).
- Probar: entrar como mozo, cerrar la app desde recientes (no "forzar detencion": Android bloquea el push hasta reabrir),
  pedir atencion desde un cliente. Debe sonar/vibrar con el icono morado y "Mesa N solicita atencion".
