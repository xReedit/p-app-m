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

Firmar con la clave de subida (`D:\Projects\Papaya.keystore`):

```bash
"C:\Program Files\Java\jdk1.8.0_351\bin\jarsigner.exe" -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
  -keystore D:\Projects\Papaya.keystore ^
  android\app\build\outputs\bundle\release\app-release.aab <alias-del-keystore>

"C:\Program Files\Java\jdk1.8.0_351\bin\jarsigner.exe" -verify android\app\build\outputs\bundle\release\app-release.aab
```

(Alternativa: Android Studio > Build > Generate Signed Bundle / APK con el mismo keystore.)

Play Console > Producción > Crear nueva versión > subir el `.aab`. Notas de la versión sugeridas:
"Envío de pedidos más confiable con señal lenta, cantidad de personas por mesa, correcciones."

`npx cap run` no funciona en esta PC (`NoDefaultCurrentDirectoryInExePath=1`); usar `gradlew.bat` directo.

## 2. iOS (App Store), en la Mac

Requisitos: Xcode 16+, CocoaPods, cuenta Apple Developer. Deployment target ya está en iOS 15.

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
