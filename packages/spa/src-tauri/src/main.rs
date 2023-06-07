#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
extern crate objc;
use notifications::{ Instance, NotificationPayload };

use tauri::{ Manager, WindowEvent };
// use window_ext::{ WindowExt, ToolbarThickness };
// mod window_ext;
mod notifications;

fn main() {
    let ctx = tauri::generate_context!();
    Instance::init(&ctx.config().tauri.bundle.identifier);
    // // macOS "App Nap" periodically pauses our app when it's in the background.
    // // We need to prevent that so our intervals are not interrupted.
    // #[cfg(target_os = "macos")]
    // macos_app_nap::prevent();

    tauri_plugin_deep_link::prepare("dev.linen.desktop");
    tauri::Builder
        ::default()
        .setup(|app| {
            let handle = app.handle();
            let win = app.get_window("main").unwrap();
            // win.set_transparent_titlebar(ToolbarThickness::Thick);

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
        .invoke_handler(tauri::generate_handler![custom_notification])
        .on_window_event(|event| {
            match event.event() {
                WindowEvent::CloseRequested { api, .. } => {
                    // #[allow(unused_unsafe)]
                    // #[cfg(not(target_os = "macos"))]
                    // {
                    //     event.window().hide().unwrap();
                    // }

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

#[tauri::command]
async fn custom_notification(app_handle: tauri::AppHandle, payload: NotificationPayload) {
    Instance::notification(app_handle, payload);
}
