mod proxy;

use proxy::{start_proxy_server, stop_proxy_server, sync_mock_rules, get_local_ips};

#[tauri::command]
fn get_platform() -> String {
    #[cfg(target_os = "windows")]
    return "windows".into();
    #[cfg(target_os = "macos")]
    return "macos".into();
    #[cfg(target_os = "linux")]
    return "linux".into();
    #[allow(unreachable_code)]
    "unknown".into()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            get_platform,
            start_proxy_server,
            stop_proxy_server,
            sync_mock_rules,
            get_local_ips
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main");
                if let Some(w) = window {
                    // Open dev tools in debug mode if needed
                    let _ = w;
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Endly application");
}
