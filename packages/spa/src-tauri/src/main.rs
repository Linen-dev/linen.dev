#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri_plugin_deep_link::prepare("dev.linen.desktop");
    tauri::Builder
        ::default()
        .setup(|app| {
            let handle = app.handle();
            tauri_plugin_deep_link
                ::register("linenapp", move |request| {
                    dbg!(&request);
                    handle.emit_all("scheme-request-received", request).unwrap();
                })
                .unwrap();

            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("scheme-request-received", url).unwrap();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}