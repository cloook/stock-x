use flate2::read::GzDecoder;
use reqwest::header::HeaderValue;
use std::io::Read;
use std::str;

use serde_json;
use serde_json::Value;


pub fn get(symbols: &str) -> Result<Value, Box<dyn std::error::Error>> {
    let url = String::from("https://stock.xueqiu.com/v5/stock/realtime/quotec.json?symbol=") + symbols;

    let client = reqwest::blocking::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        reqwest::header::ACCEPT_ENCODING,
        HeaderValue::from_static("gzip, deflate, br"),
    );
    headers.insert(reqwest::header::USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"));
    let request = client.get(url).headers(headers);
    let response = request.send()?;
    let header = response.headers();
    if let Some(content_encoding) = header.get(reqwest::header::CONTENT_ENCODING) {
        let content_encoding_str = content_encoding.to_str()?;

        if content_encoding_str == "gzip" {
            let bytes = response.bytes()?;
            let compressed_data = bytes.to_vec();

            let mut decoder = GzDecoder::new(&compressed_data[..]);
            let mut decompressed_data = Vec::new();
            decoder.read_to_end(&mut decompressed_data)?;

            if let Ok(decompressed_str) = str::from_utf8(&decompressed_data) {
                let json = serde_json::from_str::<serde_json::Value>(decompressed_str)?;
                return Ok(json);
            } else {
                println!("Decompressed data is not valid UTF-8.");
            }
        } else {
            let body = response.text()?;
            println!("Response Body: {}", body);
        }
    }
    Ok(Value::Null)
}
