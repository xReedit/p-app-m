use tauri_plugin_updater::UpdaterExt;

// Actualizacion de la app de escritorio: la web solo ve "hay version X" y "instalar".
// Consulta plugins.updater.endpoints (latest_app_mozo.json en S3) y valida la firma con la pubkey.

#[tauri::command]
async fn buscar_actualizacion(app: tauri::AppHandle) -> Result<Option<String>, String> {
  let update = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())?;
  Ok(update.map(|u| u.version))
}

// descarga, instala y reinicia (en Windows el instalador cierra la app y la vuelve a abrir)
#[tauri::command]
async fn instalar_actualizacion(app: tauri::AppHandle) -> Result<(), String> {
  let update = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())?;
  let Some(update) = update else { return Ok(()) };
  update.download_and_install(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
  app.restart();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![buscar_actualizacion, instalar_actualizacion])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
