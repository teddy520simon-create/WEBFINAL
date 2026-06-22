<script setup>
const housingTips = [
  {
    area: '福星路 / 逢甲路正商圈',
    tag: '出門即夜市',
    tagColor: 'bg-blue-100 text-blue-700',
    rent: '$7,000–10,500',
    pros: ['步行 3 分鐘到校門，早八續命首選', '下樓就是夜市，宵夜與手搖飲選擇無限', '生活機能封頂，藥妝店、超商密度極高'],
    cons: ['周邊租金與物價相對最高', '深夜易有油煙味、喧嘩聲與垃圾車噪音', '機車極難停，假日周邊交通直接癱瘓'],
    rating: 4,
    icon: '🏙️',
  },
  {
    area: '西安街 / 烈美街一帶',
    tag: '北門學區房',
    tagColor: 'bg-green-100 text-green-700',
    rent: '$6,000–8,500',
    pros: ['緊鄰逢甲北門，進出體育館、工學院最快', '純住宅巷弄為主，夜晚相對安靜', '平價學餐、影印店與自助洗衣店密集'],
    cons: ['巷弄狹窄曲折，外送員非常容易迷路', '多為連棟老透天改建，隔音極吃運氣', '上下課尖峰時段，巷口機車塞車潮可怕'],
    rating: 4,
    icon: '🌿',
  },
  {
    area: '至善路 / 青海路二段',
    tag: '林蔭園道區',
    tagColor: 'bg-purple-100 text-purple-700',
    rent: '$7,500–11,500',
    pros: ['沿著至善綠園道，綠意盎然、散步運動極佳', '質感早午餐與咖啡廳林立，充滿生活儀式感', '完美切割夜市喧囂，居住品質全區頂尖'],
    cons: ['租金偏高，且大樓獨立套房多需另繳管理費', '步行至大門約 10–15 分鐘（強烈建議騎車）', '周邊路邊汽機車停車格一位難求'],
    rating: 4,
    icon: '☕',
  },
  {
    area: '水湳市場 / 大鵬路一帶',
    tag: '預算首選',
    tagColor: 'bg-orange-100 text-orange-700',
    rent: '$4,500–6,800',
    pros: ['租金絕對優勢，同預算空間大上一圈', '緊鄰水湳傳統市場，自己煮或吃粗飽極度便宜', '脫離學區範圍，生活感更貼近在地台中人'],
    cons: ['進逢甲需騎車 7–10 分鐘，純走路無法通學', '上下班時間，河南路與中清路塞到懷疑人生', '老舊無電梯公寓、透天改建比例偏高'],
    rating: 3,
    icon: '💰',
  },
]

const facilityTips = [
  {
    icon: '🖨️',
    title: '印刷最便宜',
    content: '圖書館與各教學大樓的「雲端列印」，A4 黑白 $1／張。若期末要大量印講義或論文精裝，請直奔西安街的「大白鯊影印」或「超群影印」，老字號印速極快，量大還能跟老闆商量去尾數。',
    highlight: '省錢指數 ★★★★★',
  },
  {
    icon: '🔌',
    title: '插座最多的地方',
    content: '圖書館 B1「自學空間」與 1F「游翰堂」，幾乎每個沙發座與大桌都標配獨立插座。期中考週請務必在早上 8:30 開館前去排隊。備選：學思樓 2F 討論區，雖然稍吵但插座極多且冷氣夠冷。',
    highlight: '座位競爭 ★★★☆☆',
  },
  {
    icon: '🤫',
    title: '最安靜讀書秘境',
    content: '圖書館 5F 的「靜音區」，抓得極嚴，連拉拉鍊太大力都會被側目，絕對專注。校內真正的無人秘境是「人言大樓 8–10 樓的空教室」，只要該時段沒排課，安靜到只剩你的呼吸聲。',
    highlight: '安靜指數 ★★★★★',
  },
  {
    icon: '🍱',
    title: '餐廳 CP 值王者',
    content: '人言大樓 B1 學餐的「自助餐」，秤重計價自己夾，菜色豐富且熱湯喝到飽。校外首推文華路便當街的「吉蜂蒸餃」，一籠 $35 元，點兩籠配一碗湯，百元有找直接飽到晚上。',
    highlight: 'CP 值 ★★★★★',
  },
  {
    icon: '👕',
    title: '洗衣機不用排隊的時段',
    content: '福星宿舍的洗衣大尖峰為「週日 20:00–23:00」，搶衣如戰場。建議改在週三下午或週五早上洗，空機率高達 90%。地下室烘衣機請記得多備10元硬幣，投20元烘40分鐘連厚棉褲都能乾。',
    highlight: '排隊避免率 ★★★★☆',
  },
  {
    icon: '💊',
    title: '健保看診最快的診所',
    content: '校內行政大樓 1F「衛保組」（學生免費），適合處理擦傷換藥、經痛拿止痛藥。若感冒發燒需要看診，福星路上的「成美家醫科」平日下午時段去幾乎不用等，醫生看診迅速有耐心。',
    highlight: '看診速度 ★★★★☆',
  },
]

const sweetCourses = [
  { code: 'GEC 1042', name: '色彩與生活美學', teacher: '林雅惠', dept: '通識中心 (藝術類)', note: '期末交一份「個人穿搭與色彩分析」PPT。不愛點名但愛點人發言，只要常坐在前三排對老師點頭微笑，學期成績 92 起跳。', grade: 'A+' },
  { code: 'GEC 2105', name: '當代電影選讀', teacher: '張建邦', dept: '通識中心 (人文類)', note: '上課就是在學思樓吹超冷冷氣看片。期中交一篇500字心得，期末分組拍一支3分鐘短片（用手機拍日常即可），極度護肝。', grade: 'A+' },
  { code: 'GEC 3011', name: '台灣民間信仰與文化', teacher: '陳文賢', dept: '通識中心 (社會類)', note: '老師上課會講很多大甲媽祖跟白沙屯的歷史故事，期末考開書且題型全為選擇題，期中帶大家去附近廟宇踏查當作一次點名。', grade: 'A' },
  { code: 'GEC 1188', name: '流行音樂欣賞', teacher: '王傑（真的叫王傑）', dept: '通識中心 (藝術類)', note: '上課放歌單，期末報告是「介紹一首改變你人生的歌」。零音樂底子可選，只要上課不把腳翹到桌上，基本上閉著眼拿高分。', grade: 'A' },
  { code: 'GEC 4201', name: '手機攝影與視覺創意', teacher: '郭哲維', dept: '通識中心 (藝術類)', note: '實作課，常帶整班去逢甲商圈或水湳中央公園外拍。評分完全看「構圖創意」，拿iPhone隨手拍校園浪貓也能過，大推給缺學分的準畢業生。', grade: 'A-' },
]

const dangerCourses = [
  { code: 'GEC 9902', name: '人工智慧與永續發展', teacher: '三院大師聯合授課', dept: '跨院指標通識', note: '學校近年強推的招牌課。每週換一個教授講外星話，期中要用 Python 跑數據，期末要產出20頁ESG企劃書。當掉率高達25%，傳說中的「GPA粉碎機」。', grade: 'C+' },
  { code: 'GEC 8804', name: '邏輯與思維批判', teacher: '黃金城', dept: '通識中心 (哲學類)', note: '逢甲人稱「黃金大刀」。每堂課必定親自點名（遲到5分鐘算曠課），期末考全考形式邏輯推導，毫無通識課的自覺，當成研究所核心必修在教。', grade: 'C+' },
  { code: 'GEC 7712', name: '中華民國憲法與法治', teacher: '劉正元', dept: '通識中心 (法政類)', note: '典型的「選課一時爽，期末火葬場」。期末考佔分 100% 寫申論，改卷標準極度謎樣：寫滿兩頁拿 58 分，只寫三行拿 72 分，堪稱逢甲玄學課。', grade: 'B-' },
]

function renderStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-primary mb-1">🗺️ 校園生存地圖</h2>
      <p class="text-sm text-slate-500">前人用血與淚換來的生存智慧，請善用。</p>
    </div>

    <!-- ── 區塊一：租屋避坑點 ── -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">🏠</span>
        <h3 class="text-base font-semibold text-slate-800">租屋避坑點</h3>
        <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium ml-1">
          4 個推薦地段
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="tip in housingTips"
          :key="tip.area"
          class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ tip.icon }}</span>
              <div>
                <div class="font-semibold text-slate-800 text-sm">{{ tip.area }}</div>
                <span :class="['text-xs px-1.5 py-0.5 rounded font-medium', tip.tagColor]">
                  {{ tip.tag }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400">月租行情</div>
              <div class="text-sm font-semibold text-accent">{{ tip.rent }}</div>
            </div>
          </div>

          <div class="flex text-yellow-400 text-sm mb-3">
            {{ renderStars(tip.rating) }}
          </div>

          <div class="space-y-2">
            <div>
              <div class="text-xs font-medium text-green-600 mb-1">✅ 優點</div>
              <ul class="space-y-0.5">
                <li
                  v-for="pro in tip.pros"
                  :key="pro"
                  class="text-xs text-slate-600 flex items-start gap-1.5"
                >
                  <span class="text-green-400 mt-0.5 flex-shrink-0">▸</span>{{ pro }}
                </li>
              </ul>
            </div>
            <div>
              <div class="text-xs font-medium text-red-500 mb-1">⚠️ 注意</div>
              <ul class="space-y-0.5">
                <li
                  v-for="con in tip.cons"
                  :key="con"
                  class="text-xs text-slate-500 flex items-start gap-1.5"
                >
                  <span class="text-red-300 mt-0.5 flex-shrink-0">▸</span>{{ con }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        💡 <strong>通用建議：</strong>簽約前務必確認熱水器位置（安全通風）、電費計費方式（獨立電表 vs 分攤）、
        合約期限（避免一年以上），以及是否允許養寵物。強烈建議入住前用手機錄一段屋況影片存證。
      </div>
    </section>

    <!-- ── 區塊二：立體機能情報 ── -->
    <section class="mb-8">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">🏛️</span>
        <h3 class="text-base font-semibold text-slate-800">立體機能情報</h3>
        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-1">
          校內生存密技
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="tip in facilityTips"
          :key="tip.title"
          class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{{ tip.icon }}</span>
            <span class="font-semibold text-sm text-slate-800">{{ tip.title }}</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-3">{{ tip.content }}</p>
          <div class="text-xs text-primary font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">
            {{ tip.highlight }}
          </div>
        </div>
      </div>
    </section>

    <!-- ── 區塊三：選課避坑指南 ── -->
    <section>
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">📚</span>
        <h3 class="text-base font-semibold text-slate-800">選課避坑指南</h3>
        <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">
          通識課推薦
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 甜課 -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <span class="text-base">🍬</span>
            <span class="font-semibold text-green-800 text-sm">甜課推薦名單</span>
            <span class="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              {{ sweetCourses.length }} 門
            </span>
          </div>
          <div class="divide-y divide-slate-100">
            <div
              v-for="course in sweetCourses"
              :key="course.code"
              class="px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-sm text-slate-800">{{ course.name }}</span>
                    <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      {{ course.code }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    {{ course.teacher }}・{{ course.dept }}
                  </div>
                </div>
                <span class="flex-shrink-0 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                  均分 {{ course.grade }}
                </span>
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">{{ course.note }}</p>
            </div>
          </div>
        </div>

        <!-- 大刀課 -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <span class="text-base">🔪</span>
            <span class="font-semibold text-red-800 text-sm">大刀課警示名單</span>
            <span class="ml-auto text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              {{ dangerCourses.length }} 門
            </span>
          </div>
          <div class="divide-y divide-slate-100">
            <div
              v-for="course in dangerCourses"
              :key="course.code"
              class="px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-sm text-slate-800">{{ course.name }}</span>
                    <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      {{ course.code }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    {{ course.teacher }}・{{ course.dept }}
                  </div>
                </div>
                <span class="flex-shrink-0 text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg">
                  均分 {{ course.grade }}
                </span>
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">{{ course.note }}</p>
            </div>
          </div>

          <div class="px-4 py-3 bg-red-50 border-t border-red-100">
            <p class="text-xs text-red-700">
              ⚠️ <strong>溫馨提醒：</strong>以上資訊來自歷屆學長姐回報，教師授課風格可能每學期調整，
              選課前建議至 PTT NTU 板或 Dcard 逢甲大學版查詢最新評價。
            </p>
          </div>
        </div>
      </div>

      <!-- 選課黃金法則 -->
      <div class="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div class="font-semibold text-primary text-sm mb-2">📌 轉學生選課黃金法則</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="flex items-start gap-2 text-xs text-slate-600">
            <span class="text-primary font-bold flex-shrink-0">01</span>
            <span>大一、大二必修課盡量在前兩學期修完，別讓必修卡住大三的彈性。</span>
          </div>
          <div class="flex items-start gap-2 text-xs text-slate-600">
            <span class="text-primary font-bold flex-shrink-0">02</span>
            <span>加退選第一天開放後立刻行動，熱門甜課在加退選結束前常常秒滿。</span>
          </div>
          <div class="flex items-start gap-2 text-xs text-slate-600">
            <span class="text-primary font-bold flex-shrink-0">03</span>
            <span>每學期總學分建議不超過 22 學分，轉學生適應期要給自己緩衝空間。</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>