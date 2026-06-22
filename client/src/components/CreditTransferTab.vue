<script setup>
import { ref, onMounted } from 'vue'

const BASE_URL = 'http://localhost:3000'

const records     = ref([])
const loading     = ref(false)
const error       = ref(null)
const searchQuery = ref('')
const statusFilter = ref('all')
let   searchTimer  = null

const showModal   = ref(false)
const submitting  = ref(false)
const submitError = ref(null)
const submitSuccess = ref(false)

const form = ref({
  original_school:  '',
  original_dept:    '',
  original_course:  '',
  credits:          '',
  target_course:    '',
  status:           '通過',
  advice:           '',
})

const formErrors = ref({})

async function fetchRecords() {
  loading.value = true
  error.value   = null
  try {
    const params = new URLSearchParams()
    if (searchQuery.value.trim()) params.set('q', searchQuery.value.trim())
    if (statusFilter.value !== 'all') params.set('status', statusFilter.value)
    const res = await fetch(`${BASE_URL}/api/credits?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    records.value = data.records
  } catch (e) {
    error.value = `載入失敗：${e.message}，請確認後端服務是否啟動。`
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchRecords, 350)
}

function onFilterChange() {
  fetchRecords()
}

const statusConfig = {
  '通過':     { badge: 'bg-green-100 text-green-700 border-green-200',  icon: '✅' },
  '需補課綱': { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⚠️' },
  '駁回':     { badge: 'bg-red-100 text-red-700 border-red-200',        icon: '❌' },
}

function getStatusConfig(s) {
  return statusConfig[s] ?? { badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: '❓' }
}

function formatDate(str) {
  if (!str) return '—'
  return str.slice(0, 10)
}

// ── Modal ──────────────────────────────────────────────────────────────────

function openModal() {
  form.value = {
    original_school: '',
    original_dept:   '',
    original_course: '',
    credits:         '',
    target_course:   '',
    status:          '通過',
    advice:          '',
  }
  formErrors.value  = {}
  submitError.value = null
  submitSuccess.value = false
  showModal.value   = true
}

function closeModal() {
  showModal.value = false
}

function validateForm() {
  const errs = {}
  if (!form.value.original_school.trim())  errs.original_school = '請填寫原就讀學校'
  if (!form.value.original_dept.trim())    errs.original_dept   = '請填寫原就讀科系'
  if (!form.value.original_course.trim())  errs.original_course = '請填寫原修課名稱'
  if (!form.value.target_course.trim())    errs.target_course   = '請填寫申請抵免科目'
  const c = parseInt(form.value.credits, 10)
  if (!form.value.credits || isNaN(c) || c < 1 || c > 10) {
    errs.credits = '學分數請填寫 1–10 的整數'
  }
  formErrors.value = errs
  return Object.keys(errs).length === 0
}

async function submitForm() {
  if (!validateForm()) return

  submitting.value  = true
  submitError.value = null

  try {
    const res = await fetch(`${BASE_URL}/api/credits`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_school: form.value.original_school.trim(),
        original_dept:   form.value.original_dept.trim(),
        original_course: form.value.original_course.trim(),
        credits:         parseInt(form.value.credits, 10),
        target_course:   form.value.target_course.trim(),
        status:          form.value.status,
        advice:          form.value.advice.trim() || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

    // 將新紀錄插入列表最前面，不需重新 fetch
    records.value.unshift(data.record)
    submitSuccess.value = true
    setTimeout(() => {
      closeModal()
    }, 1200)
  } catch (e) {
    submitError.value = `送出失敗：${e.message}`
  } finally {
    submitting.value = false
  }
}

onMounted(fetchRecords)
</script>

<template>
  <div>
    <!-- 頁頭 -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-primary mb-1">🎓 學分抵免殿堂</h2>
        <p class="text-sm text-slate-500">前人智慧結晶，讓你的抵免申請少走冤枉路。</p>
      </div>
      <button
        @click="openModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0 ml-4"
      >
        ➕ 回報我的抵免經驗
      </button>
    </div>

    <!-- 搜尋與篩選列 -->
    <div class="flex gap-3 mb-5">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          type="text"
          placeholder="搜尋原學校、科系或科目名稱..."
          class="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      <select
        v-model="statusFilter"
        @change="onFilterChange"
        class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-w-[130px]"
      >
        <option value="all">全部狀態</option>
        <option value="通過">✅ 通過</option>
        <option value="需補課綱">⚠️ 需補課綱</option>
        <option value="駁回">❌ 駁回</option>
      </select>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-20 text-slate-400">
      <span class="text-3xl mr-3 animate-spin">⏳</span>
      <span>載入抵免紀錄中...</span>
    </div>

    <!-- 錯誤 -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm"
    >
      ❌ {{ error }}
    </div>

    <!-- 無資料 -->
    <div
      v-else-if="records.length === 0"
      class="flex flex-col items-center justify-center py-20 text-slate-400"
    >
      <span class="text-5xl mb-4">📭</span>
      <p>找不到符合條件的抵免紀錄</p>
      <p class="text-sm mt-1">試試調整搜尋關鍵字或篩選條件？</p>
    </div>

    <!-- 資料表格 -->
    <div v-else class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">原校系</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">原修課（學分）</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">申請抵免科目</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">審核結果</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">經驗備註</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">回報日期</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rec, idx) in records"
              :key="rec.id"
              :class="[
                'border-b border-slate-100 transition-colors duration-100 hover:bg-slate-50',
                idx === records.length - 1 ? 'border-b-0' : '',
              ]"
            >
              <td class="px-4 py-3 align-top">
                <div class="font-medium text-slate-800 whitespace-nowrap">{{ rec.original_school }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ rec.original_dept }}</div>
              </td>
              <td class="px-4 py-3 align-top whitespace-nowrap">
                <span class="text-slate-700">{{ rec.original_course }}</span>
                <span class="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  {{ rec.credits }} 學分
                </span>
              </td>
              <td class="px-4 py-3 align-top whitespace-nowrap text-slate-700">
                {{ rec.target_course }}
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                    getStatusConfig(rec.status).badge,
                  ]"
                >
                  {{ getStatusConfig(rec.status).icon }}
                  {{ rec.status }}
                </span>
              </td>
              <td class="px-4 py-3 align-top text-slate-500 text-xs leading-relaxed max-w-xs">
                {{ rec.advice ?? '—' }}
              </td>
              <td class="px-4 py-3 align-top text-xs text-slate-400 whitespace-nowrap">
                {{ formatDate(rec.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
        共 {{ records.length }} 筆紀錄
      </div>
    </div>

    <!-- ── Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- 背景遮罩 -->
          <div
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="closeModal"
          />

          <!-- Modal 主體 -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 class="text-base font-semibold text-primary">📝 回報我的學分抵免經驗</h3>
                <p class="text-xs text-slate-400 mt-0.5">你的回報將幫助未來的轉學生少走彎路</p>
              </div>
              <button
                @click="closeModal"
                class="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <!-- 成功訊息 -->
            <div
              v-if="submitSuccess"
              class="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm text-center"
            >
              ✅ 新增成功！感謝你的回報，即將關閉視窗…
            </div>

            <!-- 錯誤訊息 -->
            <div
              v-if="submitError"
              class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm"
            >
              {{ submitError }}
            </div>

            <!-- 表單 -->
            <form @submit.prevent="submitForm" class="px-6 py-4 space-y-4">
              <!-- 原學校 + 科系 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    原就讀學校 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.original_school"
                    type="text"
                    placeholder="例：輔仁大學"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all',
                      formErrors.original_school
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-300 focus:border-primary focus:ring-primary/20',
                    ]"
                  />
                  <p v-if="formErrors.original_school" class="text-red-500 text-xs mt-1">
                    {{ formErrors.original_school }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    原就讀科系 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.original_dept"
                    type="text"
                    placeholder="例：資訊工程學系"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all',
                      formErrors.original_dept
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-300 focus:border-primary focus:ring-primary/20',
                    ]"
                  />
                  <p v-if="formErrors.original_dept" class="text-red-500 text-xs mt-1">
                    {{ formErrors.original_dept }}
                  </p>
                </div>
              </div>

              <!-- 原修課 + 學分 -->
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2">
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    原修課名稱 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.original_course"
                    type="text"
                    placeholder="例：資料結構與演算法"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all',
                      formErrors.original_course
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-300 focus:border-primary focus:ring-primary/20',
                    ]"
                  />
                  <p v-if="formErrors.original_course" class="text-red-500 text-xs mt-1">
                    {{ formErrors.original_course }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    學分數 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.credits"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all',
                      formErrors.credits
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-300 focus:border-primary focus:ring-primary/20',
                    ]"
                  />
                  <p v-if="formErrors.credits" class="text-red-500 text-xs mt-1">
                    {{ formErrors.credits }}
                  </p>
                </div>
              </div>

              <!-- 申請抵免科目 -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">
                  申請抵免本校科目 <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.target_course"
                  type="text"
                  placeholder="例：演算法設計"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all',
                    formErrors.target_course
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-300 focus:border-primary focus:ring-primary/20',
                  ]"
                />
                <p v-if="formErrors.target_course" class="text-red-500 text-xs mt-1">
                  {{ formErrors.target_course }}
                </p>
              </div>

              <!-- 審核結果 -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">
                  審核結果 <span class="text-red-400">*</span>
                </label>
                <div class="flex gap-2">
                  <label
                    v-for="opt in ['通過', '需補課綱', '駁回']"
                    :key="opt"
                    :class="[
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm cursor-pointer transition-all duration-150',
                      form.status === opt
                        ? opt === '通過'
                          ? 'bg-green-50 border-green-400 text-green-700 font-medium'
                          : opt === '需補課綱'
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-700 font-medium'
                          : 'bg-red-50 border-red-400 text-red-700 font-medium'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300',
                    ]"
                  >
                    <input
                      type="radio"
                      :value="opt"
                      v-model="form.status"
                      class="sr-only"
                    />
                    <span>{{ getStatusConfig(opt).icon }}</span>
                    <span>{{ opt }}</span>
                  </label>
                </div>
              </div>

              <!-- 經驗備註 -->
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">
                  經驗備註 <span class="text-slate-400 font-normal">（選填，建議留下申請過程與教授態度）</span>
                </label>
                <textarea
                  v-model="form.advice"
                  rows="3"
                  placeholder="例：帶原校課綱對照表與成績單去，系辦助理直接蓋章，流程很快！"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <!-- 送出按鈕 -->
              <div class="flex gap-3 pt-1 pb-2">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="submitting || submitSuccess"
                  :class="[
                    'flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200',
                    submitting || submitSuccess
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-light shadow-sm hover:shadow-md',
                  ]"
                >
                  {{ submitting ? '⏳ 送出中...' : submitSuccess ? '✅ 已送出' : '確認送出' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
</style>