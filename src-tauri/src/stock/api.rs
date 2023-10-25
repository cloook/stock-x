use super::fetch::get_stock_list;
use super::sled::DB_INSTANCE;
use serde::Serialize;

mod keys {
    pub const STOCK_LIST_KEY: &str = "stock_list";
}

#[derive(Serialize, Debug)]
pub struct StockItem {
    code: String,
    name: String,
    price: f64,
    percent: f64,
    high_price: f64,
    low_price: f64,
}

impl StockItem {
    pub fn new() -> Self {
        Self {
            code: String::new(),
            name: String::new(),
            price: 0.0,
            percent: 0.0,
            high_price: 0.0,
            low_price: 0.0,
        }
    }
}

#[tauri::command]
pub async fn stcok_list() -> Vec<StockItem> {
    if let Some(value) = DB_INSTANCE
        .get(keys::STOCK_LIST_KEY)
        .expect("Failed to get data")
    {
        if let Ok(symbols) = String::from_utf8(value.to_vec()) {
            let result = get_stock_list(&symbols);
            match result.await {
                Ok(result_value) => {
                    let mut stock_list: Vec<StockItem> = Vec::new();
                    if result_value["error_code"] == 0 {
                        let stock_list_data = result_value["data"]["items"].as_array().unwrap();
                        for stock in stock_list_data {
                            let mut item = StockItem::new();
                            let quote = stock["quote"].as_object().unwrap();
                            item.code = quote["symbol"].as_str().unwrap().to_string();
                            item.price = quote["current"].as_f64().unwrap();
                            item.percent = quote["percent"].as_f64().unwrap();
                            item.high_price = quote["high"].as_f64().unwrap();
                            item.low_price = quote["low"].as_f64().unwrap();
                            item.name = quote["name"].as_str().unwrap().to_string();
                            stock_list.push(item);
                        }
                        return stock_list;
                    }
                }
                Err(e) => println!("match result error, {}", e),
            }
        } else {
            eprintln!("Failed to convert value to &str");
        }
    } else {
        eprintln!("Key not found");
    }
    vec![]
}

#[tauri::command]
pub async fn update_and_sort(new_list: String) {
    DB_INSTANCE
        .insert(keys::STOCK_LIST_KEY, new_list.as_str())
        .unwrap();
}
