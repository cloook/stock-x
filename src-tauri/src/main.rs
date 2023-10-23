// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stock;
use stock::api::{stcok_list, update_and_sort};
use tokio;

#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![stcok_list, update_and_sort])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
