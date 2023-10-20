use super::fetch::get_stock_list;
use serde::Serialize;
use super::sled::DB_INSTANCE;

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
    let symbols = "SH601012,SH600312,SH603501";
    if let Some(k1) = DB_INSTANCE.get("k1").unwrap() {
        println!("k1: {}", String::from_utf8_lossy(&k1));
    };
    let result = get_stock_list(symbols);
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
    vec![]
}
