use tauri_plugin_fs::FsExt;

/// Re-grants fs read access to a previously opened chat file, since the
/// scope extended by the open dialog does not persist across app restarts.
#[tauri::command]
fn allow_recent_file_access(app: tauri::AppHandle, path: String) -> Result<(), String> {
  if let Some(scope) = app.try_fs_scope() {
    scope.allow_file(&path).map_err(|e| e.to_string())?;
  }
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![allow_recent_file_access])
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
