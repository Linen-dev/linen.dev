#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ Manager, WindowEvent };

fn main() {
    let ctx = tauri::generate_context!();

    tauri_plugin_deep_link::prepare("dev.linen.desktop");

    tauri::Builder
        ::default()
        .setup(|app| {
            let handle = app.handle();
            let win = app.get_window("main").unwrap();

            #[cfg(not(target_os = "macos"))]
            win.set_title("Linen").unwrap();

            tauri_plugin_deep_link
                ::register("linenapp", move |request| {
                    dbg!(&request);
                    handle.emit_all("scheme-request-received", request).unwrap();
                    win.set_focus().unwrap()
                })
                .unwrap();

            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("scheme-request-received", url).unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .on_window_event(|event| {
            match event.event() {
                WindowEvent::CloseRequested { api, .. } => {
                    #[allow(unused_unsafe)]
                    #[cfg(target_os = "macos")]
                    unsafe {
                        tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
                    }
                    #[cfg(target_os = "macos")]
                    api.prevent_close();
                }
                _ => {}
            }
        })
        .build(ctx)
        .expect("error while running tauri application")
        .run(|_app_handle, e| {
            match e {
                tauri::RunEvent::ExitRequested { api, .. } => {
                    #[cfg(target_os = "macos")]
                    api.prevent_exit();
                }
                _ => {}
            }
        });
}
