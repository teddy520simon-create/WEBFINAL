<script setup>
import { ref, computed, watch } from 'vue'

const BASE_URL = 'https://unitransfer-api-fcu.azurewebsites.net'

const selectedGrade = ref(null)
const items         = ref([])
const checked       = ref({})
const loading       = ref(false)
const error         = ref(null)

const completedCount = computed(() =>
  items.value.filter(item => checked.value[item.id]).length
)

const progressPct = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((completedCount.value / items.value.length) * 100)
})

const progressBarColor = computed(() => {
  if (progressPct.value === 100) return 'bg-green-500'
  if (progressPct.value >= 60)   return 'bg-accent'
  return 'bg-primary'
})

async function fetchChecklist(grade) {
  loading.value = true
  error.value   = null
  items.value   = []
  checked.value = {}

  try {
    const res = await fetch(`${BASE_URL}/api/checklist?grade=${grade}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    items.value = data.items
    const initChecked = {}
    data.items.forEach(item => { initChecked[item.id] = false })
    checked.value = initChecked
  } catch (e) {
    error.value = `載入失敗：${e.message}，請確認後端服務是否啟動。`
  } finally {
    loading.value = false
  }
}

watch(selectedGrade, (grade) => {
  if (grade) fetchChecklist(grade)
})

const categoryColors = {
  '兵役與證件': 'bg-red-100 text-red-700',
  '帳號申請':   'bg-blue-100 text-blue-700',
  '學分抵免':   'bg-purple-100 text-purple-700',
  '健康檢查':   'bg-green-100 text-green-700',
  '住宿登記':   'bg-yellow-100 text-yellow-700',
  '選課規劃':   'bg-indigo-100 text-indigo-700',
  '社群加入':   'bg-pink-100 text-pink-700',
  '畢業學分確認': 'bg-orange-100 text-orange-700',
  '書卷與助學金': 'bg-teal-100 text-teal-700',
  '實習/交換規劃': 'bg-cyan-100 text-cyan-700',
}

function getCategoryColor(cat) {
  return categoryColors[cat] ?? 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-primary mb-1">📋 新手報到任務包</h2>
      <p class="text-sm text-slate-500">選擇你的轉學身份，查看入學前必辦事項清單。</p>
    </div>

    <!-- 身份選擇器 -->
    <div class="flex gap-3 mb-6">
      <button
        v-for="g in [{ value: 2, label: '大二轉學生（升大二）' }, { value: 3, label: '大三轉學生（升大三）' }]"
        :key="g.value"
        @click="selectedGrade = g.value"
        :class="[
          'px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200',
          selectedGrade === g.value
            ? 'border-primary bg-primary text-white shadow-md'
            : 'border-slate-300 bg-white text-slate-600 hover:border-primary hover:text-primary',
        ]"
      >
        {{ g.label }}
      </button>
    </div>

    <!-- 尚未選擇提示 -->
    <div
      v-if="!selectedGrade"
      class="flex flex-col items-center justify-center py-20 text-slate-400"
    >
      <span class="text-5xl mb-4">👆</span>
      <p class="text-base">請先選擇你的轉學生身份</p>
    </div>

    <!-- 載入中 -->
    <div v-else-if="loading" class="flex items-center justify-center py-20 text-slate-400">
      <span class="text-3xl mr-3 animate-spin">⏳</span>
      <span>載入任務清單中...</span>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm"
    >
      ❌ {{ error }}
    </div>

    <!-- 主內容 -->
    <template v-else>
      <!-- 進度卡片 -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-slate-600">
            完成進度：{{ completedCount }} / {{ items.length }} 項
          </span>
          <span
            :class="[
              'text-sm font-bold transition-colors duration-300',
              progressPct === 100 ? 'text-green-600' : 'text-accent',
            ]"
          >
            {{ progressPct }}%
          </span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            :class="['h-3 rounded-full transition-all duration-500 ease-out', progressBarColor]"
            :style="{ width: progressPct + '%' }"
          />
        </div>
        <p
          v-if="progressPct === 100"
          class="text-green-600 text-sm mt-2 font-medium text-center animate-pulse"
        >
          🎉 太棒了！所有任務已全數完成，準備好迎接大學新生活吧！
        </p>
      </div>

      <!-- 任務列表 -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          @click="checked[item.id] = !checked[item.id]"
          :class="[
            'flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-150',
            'hover:bg-slate-50',
            index !== items.length - 1 ? 'border-b border-slate-100' : '',
            checked[item.id] ? 'opacity-60' : '',
          ]"
        >
          <!-- Checkbox -->
          <div class="mt-0.5 flex-shrink-0">
            <div
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
                checked[item.id]
                  ? 'bg-accent border-accent text-white'
                  : 'border-slate-300 bg-white',
              ]"
            >
              <span v-if="checked[item.id]" class="text-xs leading-none">✓</span>
            </div>
          </div>

          <!-- 內容 -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span
                :class="['text-xs px-2 py-0.5 rounded-full font-medium', getCategoryColor(item.category)]"
              >
                {{ item.category }}
              </span>
              <span
                v-if="item.is_required"
                class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium"
              >
                ★ 必辦
              </span>
              <span
                v-else
                class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400"
              >
                建議辦理
              </span>
            </div>
            <p
              :class="[
                'text-sm leading-relaxed transition-all duration-200',
                checked[item.id] ? 'line-through text-slate-400' : 'text-slate-700',
              ]"
            >
              {{ item.text }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>