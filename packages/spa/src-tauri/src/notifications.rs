use tauri::Manager;
use serde::{ Serialize, Deserialize };

#[cfg(not(target_os = "macos"))]
static mut APP_IDENTIFIER: Option<String> = Option::None;

#[derive(Clone, Serialize)]
struct Payload {
    url: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NotificationPayload {
    body: String,
    callback: String,
}

pub struct Instance {}
impl Instance {
    pub fn init(app_identifier: &str) {
        #[cfg(target_os = "macos")]
        mac_notification_sys::set_application(&app_identifier).unwrap();
        #[cfg(not(target_os = "macos"))]
        unsafe {
            APP_IDENTIFIER = Some(app_identifier.to_string());
        }
    }

    pub fn notification(app_handle: tauri::AppHandle, payload: NotificationPayload) {
        #[cfg(target_os = "macos")]
        let result = mac_notification_sys::send_notification(
            "Linen",
            None,
            &payload.body,
            Some(
                mac_notification_sys::Notification
                    ::new()
                    .main_button(mac_notification_sys::MainButton::SingleAction("Open"))
                    .close_button("Close")
            )
        );

        #[cfg(not(target_os = "macos"))]
        let result = unsafe {
            tauri::api::notification::Notification
                ::new(APP_IDENTIFIER.as_ref().unwrap())
                .title("Linen")
                .body(payload.body)
                .show()
        };

        match result {
            Ok(response) => {
                match response {
                    mac_notification_sys::NotificationResponse::ActionButton(action_name) => {
                        if action_name == "Open" {
                            println!("Clicked on open");
                            app_handle
                                .emit_all("scheme-request-received", Payload {
                                    url: payload.callback.into(),
                                })
                                .unwrap();
                        }
                    }
                    mac_notification_sys::NotificationResponse::Click => {
                        println!("Clicked on the notification itself");
                        app_handle
                            .emit_all("scheme-request-received", Payload {
                                url: payload.callback.into(),
                            })
                            .unwrap();
                    }
                    _ => {}
                }
            }
            Err(e) => println!("Could not show notification: {}", e),
        }
    }
}
