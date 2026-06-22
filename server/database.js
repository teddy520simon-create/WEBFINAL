import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── ES Module 專用的 __dirname 重建大法 ───
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'transfer.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ 讀取既有資料庫：', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ 建立新資料庫');
  }

  db.run('PRAGMA journal_mode = WAL;');

  db.run(`
    CREATE TABLE IF NOT EXISTS checklists (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      target_grade INTEGER NOT NULL,
      category     TEXT    NOT NULL,
      text         TEXT    NOT NULL,
      is_required  INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS credit_records (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      original_school  TEXT    NOT NULL,
      original_dept    TEXT    NOT NULL,
      original_course  TEXT    NOT NULL,
      credits          INTEGER NOT NULL,
      target_course    TEXT    NOT NULL,
      status           TEXT    NOT NULL,
      advice           TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);

  const checklistCount = db.exec('SELECT COUNT(*) AS cnt FROM checklists');
  const cnt1 = checklistCount[0]?.values[0][0] ?? 0;

  if (cnt1 === 0) {
    const checklistData = [
      [2, '兵役與證件', '向原校申請【在學證明】及【兵役緩徵申請書】，於入學後 7 日內繳交學務處兵役業務組，逾期將被通報', 1],
      [2, '帳號申請',   '完成 NTU G-Suite 學術帳號啟用（@ntu.edu.tw），開放申請後 48 小時內完成，帳號將作為選課與校務系統登入憑證', 1],
      [2, '學分抵免',   '備妥原校【歷年成績單（認證本）】與【各科課程大綱】，至教務處申請學分抵免審核，截止日為開學後第三週星期五 17:00', 1],
      [2, '健康檢查',   '至臺大附設醫院 B1 健檢中心完成新生健康檢查（費用約 $500，需網路預約），結果影響宿舍抽籤資格', 1],
      [2, '住宿登記',   '完成宿舍抽籤登記或填寫校外租屋自主申報（登錄地址影響低收入戶、弱勢助學金申請資格）', 1],
      [2, '選課規劃',   '瀏覽課程網確認系所必修課地圖，大二轉入須補修至少 8 學分通識，建議加入系學會 LINE 群取得選課密技', 0],
      [2, '社群加入',   '加入 PTT NTU 板及系所轉學生 Facebook 社團，獲取第一手課程評價與教授偏好資訊', 0],
      [3, '兵役與證件', '向原校申請【在學證明】及【兵役緩徵申請書】，於入學後 7 日內繳交學務處兵役業務組，逾期將被通報', 1],
      [3, '帳號申請',   '完成 NTU G-Suite 學術帳號啟用（@ntu.edu.tw），開放申請後 48 小時內完成', 1],
      [3, '學分抵免',   '備妥原校【歷年成績單（認證本）】與【各科課程大綱】，申請學分抵免，大三轉入抵免學分上限為 40 學分', 1],
      [3, '畢業學分確認', '與系辦助理確認剩餘畢業應修學分及修業年限（大三轉入通常 2 年畢業），提早排課避免大四壓力', 1],
      [3, '健康檢查',   '至臺大附設醫院 B1 健檢中心完成新生健康檢查（費用約 $500，需網路預約）', 1],
      [3, '書卷與助學金', '確認書卷獎、系所獎學金及弱勢助學金申請資格，大三轉入第一學期成績達標（前 5%）即可申請', 0],
      [3, '實習/交換規劃', '部分交換計畫要求在校滿一學期才能申請，提早與國際事務處確認 deadline，避免錯失機會', 0],
      [3, '社群加入',   '加入 PTT NTU 板及系所轉學生 Facebook 社團，特別留意大三常被卡的「系必修」修課時序問題', 0],
    ];

    checklistData.forEach(([grade, cat, text, req]) => {
      db.run(
        'INSERT INTO checklists (target_grade, category, text, is_required) VALUES (?, ?, ?, ?)',
        [grade, cat, text, req]
      );
    });
    console.log('✅ checklists 假資料寫入完成');
  }

  const creditCount = db.exec('SELECT COUNT(*) AS cnt FROM credit_records');
  const cnt2 = creditCount[0]?.values[0][0] ?? 0;

  if (cnt2 === 0) {
    const creditData = [
      ['輔仁大學', '資訊工程學系', '資料結構與演算法', 3, '演算法設計', '通過',
       '攜帶原校課綱對照表與 A+ 成績單，系辦助理直接蓋章，整個流程不到 15 分鐘。'],
      ['淡江大學', '電機工程學系', '計算機組織與結構', 3, '計算機結構', '通過',
       '課綱幾乎一模一樣，教授笑說是「複製貼上」，一週內收到通過通知。'],
      ['東吳大學', '統計學系', '統計學（一）（二）', 6, '機率與統計', '需補課綱',
       '原課綱缺少貝氏統計與 MCMC 章節，需補修一門指定線上課程並繳交截圖，約三週補件。'],
      ['中原大學', '電機工程學系', '電路學（一）', 3, '電路學', '需補課綱',
       '學分數差距是關鍵，需加修「電路學實驗」1 學分後才核准全數抵免。'],
      ['文化大學', '資訊管理學系', '物件導向程式設計', 3, '程式設計與實習', '通過',
       '成績 A 以上幾乎不看課綱細節，直接過，非常佛心。'],
      ['實踐大學', '資訊科技與管理學系', '資料庫管理系統', 3, '資料庫系統', '駁回',
       '原課程使用 MS Access，本校使用 PostgreSQL，教授認為差異過大直接退件。'],
      ['元智大學', '工業工程與管理學系', '作業研究', 3, '作業研究', '通過',
       '課綱高度重疊，審核委員確認後兩天就通過，建議附上期末考考卷加速審查。'],
      ['逢甲大學', '資訊工程學系', '軟體工程', 3, '軟體工程與實務', '需補課綱',
       '原課綱缺少 Agile/Scrum 實務章節，補上兩篇論文閱讀心得後獲批准。'],
    ];

    creditData.forEach(row => {
      db.run(
        `INSERT INTO credit_records
          (original_school, original_dept, original_course, credits, target_course, status, advice)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        row
      );
    });
    console.log('✅ credit_records 假資料寫入完成');
  }

  saveDB();
  console.log('✅ 資料庫初始化完成');
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

// ─── 修正匯出方式 ───
export { initDB, getDB, saveDB };