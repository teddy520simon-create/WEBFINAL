const express = require('express');
const cors    = require('cors');
const app = express(); // 1. 第一步：先讓 app 誕生！

// 2. 第二步：才能幫 app 穿上 cors 裝備
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://kind-beach-0cf998500.7.azurestaticapps.net'
    ],
    credentials: true
}));

const { initDB, getDB, saveDB } = require('./database');


const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─── GET /api/checklist ────────────────────────────────────────────────────
app.get('/api/checklist', (req, res) => {
  const grade = parseInt(req.query.grade, 10);
  if (grade !== 2 && grade !== 3) {
    return res.status(400).json({ error: 'grade 參數必須為 2 或 3' });
  }
  try {
    const db = getDB();
    const result = db.exec(
      `SELECT id, target_grade, category, text, is_required
       FROM checklists WHERE target_grade = ${grade}
       ORDER BY is_required DESC, id ASC`
    );
    const rows = result[0]
      ? result[0].values.map(v => ({ id: v[0], category: v[2], text: v[3], is_required: v[4] === 1 }))
      : [];
    res.json({ grade, total: rows.length, items: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/credits ──────────────────────────────────────────────────────
app.get('/api/credits', (req, res) => {
  const q      = req.query.q && req.query.q.trim() ? req.query.q.trim() : '';
  const status = req.query.status && req.query.status !== 'all' ? req.query.status : '';
  try {
    const db = getDB();
    let sql = 'SELECT * FROM credit_records WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (q) {
      sql += ' AND (original_school LIKE ? OR original_dept LIKE ? OR original_course LIKE ? OR target_course LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    sql += ' ORDER BY created_at DESC';
    const stmt = db.prepare(sql);
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json({ total: rows.length, records: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/credits ─────────────────────────────────────────────────────
app.post('/api/credits', (req, res) => {
  const { original_school, original_dept, original_course, credits, target_course, status, advice } = req.body;
  if (!original_school || !original_dept || !original_course || !credits || !target_course || !status) {
    return res.status(400).json({ error: '缺少必填欄位' });
  }
  if (!['通過','需補課綱','駁回'].includes(status)) return res.status(400).json({ error: 'status 值不合法' });
  const creditsNum = parseInt(credits, 10);
  if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) return res.status(400).json({ error: 'credits 必須為 1–10' });
  try {
    const db  = getDB();
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');
    db.run(
      `INSERT INTO credit_records (original_school, original_dept, original_course, credits, target_course, status, advice, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [original_school.trim(), original_dept.trim(), original_course.trim(), creditsNum, target_course.trim(), status, advice ? advice.trim() : null, now]
    );
    saveDB();
    const r = db.exec('SELECT * FROM credit_records ORDER BY id DESC LIMIT 1');
    const cols = r[0].columns; const vals = r[0].values[0]; const rec = {};
    cols.forEach((c, i) => { rec[c] = vals[i]; });
    res.status(201).json({ message: '新增成功', record: rec });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/reviews ──────────────────────────────────────────────────────
app.get('/api/reviews', (req, res) => {
  const q    = req.query.q    && req.query.q.trim()             ? req.query.q.trim()    : '';
  const dept = req.query.dept && req.query.dept !== 'all'       ? req.query.dept        : '';
  try {
    const db = getDB();
    let sql = 'SELECT * FROM course_reviews WHERE 1=1';
    const params = [];
    if (q)    { sql += ' AND (course_name LIKE ? OR teacher LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
    if (dept) { sql += ' AND dept = ?'; params.push(dept); }
    sql += ' ORDER BY created_at DESC';
    const stmt = db.prepare(sql);
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json({ total: rows.length, reviews: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/reviews ─────────────────────────────────────────────────────
app.post('/api/reviews', (req, res) => {
  const { course_name, teacher, dept, semester, rating, difficulty, content, author } = req.body;
  if (!course_name || !teacher || !dept || !semester || !rating || !difficulty || !content) {
    return res.status(400).json({ error: '缺少必填欄位' });
  }
  const r = parseInt(rating, 10);
  const d = parseInt(difficulty, 10);
  if (r < 1 || r > 5 || d < 1 || d > 5) return res.status(400).json({ error: '評分需為 1-5' });
  try {
    const db  = getDB();
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');
    db.run(
      `INSERT INTO course_reviews (course_name, teacher, dept, semester, rating, difficulty, content, author, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_name.trim(), teacher.trim(), dept.trim(), semester.trim(), r, d, content.trim(), author?.trim() || '匿名學生', now]
    );
    saveDB();
    const result = db.exec('SELECT * FROM course_reviews ORDER BY id DESC LIMIT 1');
    const cols = result[0].columns; const vals = result[0].values[0]; const rec = {};
    cols.forEach((c, i) => { rec[c] = vals[i]; });
    res.status(201).json({ message: '新增成功', review: rec });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/posts ────────────────────────────────────────────────────────
app.get('/api/posts', (req, res) => {
  const category = req.query.category && req.query.category !== 'all' ? req.query.category : '';
  try {
    const db = getDB();
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY created_at DESC';
    const stmt = db.prepare(sql);
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json({ total: rows.length, posts: rows });
  } catch (e) {
    res.status(500).json({ error: e.message }); }
});

// ─── GET /api/posts/:id/comments ───────────────────────────────────────────
app.get('/api/posts/:id/comments', (req, res) => {
  try {
    const db   = getDB();
    const stmt = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC');
    const rows = [];
    stmt.bind([parseInt(req.params.id, 10)]);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json({ comments: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── POST /api/posts ───────────────────────────────────────────────────────
app.post('/api/posts', (req, res) => {
  const { category, title, content, author } = req.body;
  if (!title || !content) return res.status(400).json({ error: '缺少必填欄位' });
  try {
    const db  = getDB();
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');
    db.run(
      'INSERT INTO posts (category, title, content, author, created_at) VALUES (?, ?, ?, ?, ?)',
      [category || '一般', title.trim(), content.trim(), author?.trim() || '匿名學生', now]
    );
    saveDB();
    const result = db.exec('SELECT * FROM posts ORDER BY id DESC LIMIT 1');
    const cols = result[0].columns; const vals = result[0].values[0]; const rec = {};
    cols.forEach((c, i) => { rec[c] = vals[i]; });
    res.status(201).json({ message: '發文成功', post: rec });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── POST /api/posts/:id/comments ──────────────────────────────────────────
app.post('/api/posts/:id/comments', (req, res) => {
  const { content, author } = req.body;
  if (!content) return res.status(400).json({ error: '留言不能為空' });
  try {
    const db  = getDB();
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');
    db.run(
      'INSERT INTO comments (post_id, content, author, created_at) VALUES (?, ?, ?, ?)',
      [parseInt(req.params.id, 10), content.trim(), author?.trim() || '匿名學生', now]
    );
    saveDB();
    res.status(201).json({ message: '留言成功' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── POST /api/posts/:id/like ──────────────────────────────────────────────
app.post('/api/posts/:id/like', (req, res) => {
  try {
    const db = getDB();
    db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [parseInt(req.params.id, 10)]);
    saveDB();
    res.json({ message: '已按讚' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 健康檢查 ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 啟動：等 initDB 完成後才建立所有 table 與假資料 ──────────────────────
initDB().then(() => {
  const db = getDB();

  // 課程評價表
  db.run(`CREATE TABLE IF NOT EXISTS course_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, course_name TEXT NOT NULL,
    teacher TEXT NOT NULL, dept TEXT NOT NULL, semester TEXT NOT NULL,
    rating INTEGER NOT NULL, difficulty INTEGER NOT NULL,
    content TEXT NOT NULL, author TEXT NOT NULL DEFAULT '匿名學生',
    created_at TEXT NOT NULL)`);

  // 討論板表
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL DEFAULT '一般',
    title TEXT NOT NULL, content TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '匿名學生',
    likes INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL,
    content TEXT NOT NULL, author TEXT NOT NULL DEFAULT '匿名學生',
    created_at TEXT NOT NULL)`);

  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');

  // 補課程評價假資料
  const reviewCnt = db.exec('SELECT COUNT(*) AS c FROM course_reviews')[0]?.values[0][0] ?? 0;
  if (reviewCnt === 0) {
    const reviews = [
      ['微積分','陳志明','理工學院','113上',5,4,'老師上課很有條理，考試偏難但有給分。建議去辦公室問問題，老師對認真的學生印象很好。','資工系大一'],
      ['程式設計（一）','林雅惠','資訊電機學院','113上',5,2,'完全適合初學者！作業用 Python，批改很詳細。期末專題可以自選題目，氣氛很好。','資管系大一'],
      ['資料結構','王建國','資訊電機學院','113上',3,5,'內容紮實但老師講課偏快，期中考難度很高，班平均只有 58 分，但有調分。','資工系大二'],
      ['工程數學','張美玲','理工學院','112下',4,4,'老師很認真，每週都有小考。期末考開放一張小抄，準備充分不難過。','電機系大二'],
      ['行銷管理','劉世偉','商學院','113上',5,2,'超好的通識課！老師業界經驗豐富。期末報告用 PPT 分組報告，認真做輕鬆 A。','資工系大三'],
      ['作業系統','陳建宏','資訊電機學院','112下',4,5,'課程內容深但解釋清楚。每週程式作業份量不輕，但做完真的學到東西。','資工系大三'],
      ['英文寫作','李美儀','人文社會學院','113上',5,1,'外籍老師教學方式活潑，每週寫一篇短文。認真交作業基本上都是 B+ 以上。','商管系大二'],
      ['電子電路','黃志豪','資訊電機學院','112下',2,5,'課非常難，期中期末均分都在 50 分以下。建議修前把電路學底子打好。','電機系大三'],
    ];
    reviews.forEach(([cn,t,d,s,r,diff,c,a]) => {
      db.run(`INSERT INTO course_reviews (course_name,teacher,dept,semester,rating,difficulty,content,author,created_at) VALUES(?,?,?,?,?,?,?,?,?)`,
        [cn,t,d,s,r,diff,c,a,now]);
    });
    console.log('✅ course_reviews 假資料寫入完成');
  }

  // 補討論板假資料
  const postCnt = db.exec('SELECT COUNT(*) AS c FROM posts')[0]?.values[0][0] ?? 0;
  if (postCnt === 0) {
    const postsData = [
      ['轉學資訊','從淡江轉來逢甲，學分抵免順利通過！心得分享','剛完成學分抵免審核，資料結構和演算法都過了！關鍵是把兩份課綱做成對照表，老師看了馬上蓋章。有需要模板的同學可以留言，我分享給大家。','逢甲轉學生小明'],
      ['選課討論','113下微積分哪個老師比較好過？','看了評價系統，陳志明老師評分很高，但有人說很難。林建志老師評分中等，有修過的學長姐可以分享嗎？','電機系新生'],
      ['生活資訊','逢甲夜市附近租屋心得—文華路 vs 逢甲路','住了兩個月，文華路巷子比逢甲路安靜很多，而且離校只要走 8 分鐘。套房約 6500-8000。','資工系大二'],
      ['課業求救','工程數學期中剩一週，有沒有人要一起讀書？','工數學得很痛苦，一個人讀效率很低。有沒有同學想組讀書會？我在圖書館 3 樓。','機械系大三'],
      ['逢甲校園','圖書館哪個樓層最好讀書？新生攻略','圖書館 5 樓安靜程度最高，4 樓有比較多電源插座，早上 9 點前去幾乎一定有位子。','商管系大一'],
      ['一般閒聊','逢甲附近哪裡有好吃的平價餐廳推薦？','剛來逢甲的新生，還在探索周邊美食。預算一餐大概 150 以內。','設計系大一'],
    ];
    postsData.forEach(([cat,title,content,author]) => {
      db.run('INSERT INTO posts (category,title,content,author,created_at) VALUES(?,?,?,?,?)',
        [cat,title,content,author,now]);
    });
    const commentsData = [
      [1,'感謝分享！對照表真的很有用，可以分享嗎？','資管系學姐'],
      [1,'我的學分抵免也通過了，確實帶課綱去是關鍵！','轉學生小陳'],
      [2,'陳志明老師很認真，只要作業不要缺交基本上不會被當，推！','資工系大三'],
      [2,'林建志我修過，考試不難但要去上課，他會記出缺席。','電機系大二'],
      [3,'文華路推！我也住那邊，安靜而且超商很近。','資工系大三'],
      [5,'5 樓確實競爭大，我通常去 4 樓靠窗位置。','會計系大二'],
      [6,'推薦校門口對面的「三媽臭臭鍋」，130 以內吃到飽！','商管系大三'],
    ];
    commentsData.forEach(([pid,content,author]) => {
      db.run('INSERT INTO comments (post_id,content,author,created_at) VALUES(?,?,?,?)',
        [pid,content,author,now]);
    });
    console.log('✅ posts & comments 假資料寫入完成');
  }

  saveDB();
  console.log('✅ 所有資料表初始化完成');

  app.listen(PORT, () => {
    console.log(`🚀 UniTransfer Hub API 已啟動：http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ 資料庫初始化失敗：', err);
  process.exit(1);
});