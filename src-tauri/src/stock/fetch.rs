use flate2::read::GzDecoder;
use reqwest::header::HeaderValue;
use std::io::Read;
use std::str;

use serde_json;
use serde_json::Value;

pub struct Params {
    pub url: String,
    pub use_gizp: bool,
    pub cookie: String,
}

impl Params {
    pub fn new(url: String, use_gizp: bool, cookie: String) -> Params {
        Params {
            url,
            use_gizp: use_gizp,
            cookie: cookie,
        }
    }
   
}

pub async fn get(params: Params) -> Result<Value, reqwest::Error> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    if params.cookie != "" {
        headers.insert(
            reqwest::header::COOKIE,
            HeaderValue::from_str(params.cookie.as_str()).unwrap(),
        );
    }
    if params.use_gizp {
        headers.insert(
            reqwest::header::ACCEPT_ENCODING,
            HeaderValue::from_static("gzip, deflate, br"),
        );
    }
    headers.insert(reqwest::header::USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"));
    let request = client.get(params.url).headers(headers);
    let response = request.send().await?;
    let header = response.headers();
    if let Some(content_encoding) = header.get(reqwest::header::CONTENT_ENCODING) {
        let content_encoding_str = content_encoding.to_str().unwrap();
        if content_encoding_str == "gzip" {
            let bytes = response.bytes();
            let compressed_data = bytes.await?.to_vec();

            let mut decoder = GzDecoder::new(&compressed_data[..]);
            let mut decompressed_data = Vec::new();
            decoder.read_to_end(&mut decompressed_data).unwrap();

            if let Ok(decompressed_str) = str::from_utf8(&decompressed_data) {
                let json = serde_json::from_str::<serde_json::Value>(decompressed_str);
                return Ok(json.unwrap());
            } else {
                println!("Decompressed data is not valid UTF-8.");
            }
        } else {
            let body = response.text();
            println!("Response Body: {}", body.await?);
        }
    } else {
        let body = response.text();
        println!("Response Body: {}", body.await?);
    }
    Ok(Value::Null)
}

pub async fn get_token() -> Result<String, reqwest::Error> {
    let url = String::from("https://xueqiu.com/");
    let client = reqwest::Client::new();
    let response = client.get(url).send().await?;
    if response.status().is_success() {
        let headers = response.headers();
        let cookies = headers.get_all("set-cookie");
        for cookie in cookies {
            if let Ok(cookie_str) = cookie.to_str() {
                if let Some(token) = cookie_str.split(';').find(|cookie| cookie.contains("xq_a_token")) {
                    let token_value = token.split('=').nth(1).unwrap_or("");
                    return Ok(format!("xq_a_token={}", token_value));
                }
            }
        }
    } else {
        println!("Request was not successful: {:?}", response.status());
    }
    Ok(String::from(""))
}

pub async fn get_stock_list(symbols: &str) -> Result<Value, Box<dyn std::error::Error>> {
    let url = format!(
        "https://stock.xueqiu.com/v5/stock/batch/quote.json?symbol={}&extend=detail",
        symbols
    );
    let token = get_token();
    let tk = token.await?;
    let params = Params::new(url, true, tk);
    let val = get(params);
    Ok(val.await?)
}
