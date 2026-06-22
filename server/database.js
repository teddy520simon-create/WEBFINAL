import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 強制指向 /home/site/wwwroot/server/transfer.db
const DB_PATH = path.resolve(__dirname, 'transfer.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('資料庫連線失敗:', err.message);
  else console.log('資料庫已連線至:', DB_PATH);
});

// 使用 sqlite3 的 run 進行初始化
export async function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS checklists (...)`); // (這裡放入你原本的 CREATE TABLE)
    db.run(`CREATE TABLE IF NOT EXISTS credit_records (...)`);
    
    // 初始化資料... (原本的 INSERT 邏輯)
  });
}

export function getDB() { return db; }