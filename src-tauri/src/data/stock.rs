use super::fetch::get;
use serde::Serialize;

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
pub fn stcok_list() -> Vec<StockItem> {
    let symbols = "SH601012,SH600312,SH603501";
    let result = get(symbols);
    match result {
        Ok(result_value) => {
            let mut stock_list: Vec<StockItem> = Vec::new();
            println!("error_code: {:?}", result_value["error_code"]);
            if result_value["error_code"] == 0 {
                let stock_list_data = result_value["data"].as_array().unwrap();
                for stock in stock_list_data {
                    let mut item = StockItem::new();
                    item.code = stock["symbol"].as_str().unwrap().to_string();
                    item.price = stock["current"].as_f64().unwrap();
                    item.percent = stock["percent"].as_f64().unwrap();
                    item.high_price = stock["high"].as_f64().unwrap();
                    item.low_price = stock["low"].as_f64().unwrap();
                    stock_list.push(item);
                }
                return stock_list;
            }
        }
        Err(e) => println!("match result error, {}", e),
    }
    vec![]
}
