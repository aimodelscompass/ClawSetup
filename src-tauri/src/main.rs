#[tauri::command]
fn install_openclaw() -> String {
    "Installing...".into()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![install_openclaw])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
