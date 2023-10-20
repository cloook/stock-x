use lazy_static::lazy_static;
use sled::Db;

lazy_static! {
    pub static ref DB_INSTANCE: Db = {
        sled::open("stock_x").unwrap()
    };
}