<script setup>
import { ref, onMounted } from 'vue'
const BASE_URL = 'https://unitransfer-api-fcu.azurewebsites.net'

const reviews   = ref([])
const loading   = ref(false)
const searchQ   = ref('')
const deptFilter = ref('all')
const showModal = ref(false)
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref(null)
let timer = null

const depts = ['全部學院', '資訊電機學院', '理工學院', '商學院', '人文社會學院', '設計學院']

const form = ref({
  course_name: '', teacher: '', dept: '資訊電機學院',
  semester: '113上', rating: 5, difficulty: 3,
  content: '', author: '',
})
const formErrors = ref({})

const difficultyLabel = ['', '極簡單', '簡單', '普通', '困難', '地獄']

function renderStars(n, total = 5) {
  return '★'.repeat(n) + '☆'.repeat(total - n)
}

function ratingColor(n) {
  if (n >= 4) return 'text-green-600'
  if (n >= 3) return 'text-yellow-500'
  return 'text-red-500'
}

function diffColor(n) {
  if (n <= 2) return 'bg-green-100 text-green-700'
  if (n === 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

async function fetchReviews() {
  loading.value = true
  try {
    const p = new URLSearchParams()
    if (searchQ.value.trim()) p.set('q', searchQ.value.trim())
    if (deptFilter.value !== 'all') p.set('dept', deptFilter.value)
    const res = await fetch(`${BASE_URL}/api/reviews?${p}`)
    const data = await res.json()
    reviews.value = data.reviews
  } catch (e) {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

function onInput() {
  clearTimeout(timer)
  timer = setTimeout(fetchReviews, 350)
}

function validate() {
  const e = {}
  if (!form.value.course_name.trim()) e.course_name = '請填寫課程名稱'
  if (!form.value.teacher.trim())     e.teacher     = '請填寫授課教師'
  if (!form.value.content.trim())     e.content     = '請填寫評價內容'
  formErrors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = null
  try {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    reviews.value.unshift(data.review)
    submitSuccess.value = true
    setTimeout(() => { showModal.value = false; submitSuccess.value = false }, 1200)
  } catch (e) {
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}

function openModal() {
  form.value = { course_name:'', teacher:'', dept:'資訊電機學院', semester:'113上', rating:5, difficulty:3, content:'', author:'' }
  formErrors.value = {}; submitError.value = null; submitSuccess.value = false
  showModal.value = true
}

onMounted(fetchReviews)
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-primary mb-1">⭐ 逢甲大學課程評價</h2>
        <p class="text-sm text-slate-500">真實學生評價，選課前必看。</p>
      </div>
      <button @click="openModal" class="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-4">
        ✏️ 寫課程評價
      </button>
    </div>

    <div class="flex gap-3 mb-6">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input v-model="searchQ" @input="onInput" type="text" placeholder="搜尋課程名稱或教師..."
          class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
      </div>
      <select v-model="deptFilter" @change="fetchReviews"
        class="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary min-w-[150px]">
        <option value="all">全部學院</option>
        <option v-for="d in depts.slice(1)" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-16 text-slate-400">
      <span class="animate-spin text-3xl mr-2">⏳</span> 載入中...
    </div>

    <div v-else-if="reviews.length === 0" class="flex flex-col items-center py-16 text-slate-400">
      <span class="text-5xl mb-3">📭</span>
      <p>找不到符合條件的課程評價</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="r in reviews" :key="r.id"
        class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm card-hover">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="font-semibold text-slate-800 text-base">{{ r.course_name }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ r.teacher }} ・ {{ r.dept }} ・ {{ r.semester }}</div>
          </div>
          <div class="text-right flex-shrink-0 ml-3">
            <div :class="['text-xl font-bold', ratingColor(r.rating)]">{{ renderStars(r.rating) }}</div>
          </div>
        </div>

        <div class="flex gap-2 mb-3">
          <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', diffColor(r.difficulty)]">
            難度：{{ difficultyLabel[r.difficulty] }}
          </span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
            滿意度 {{ r.rating }}/5
          </span>
        </div>

        <p class="text-sm text-slate-600 leading-relaxed mb-3">{{ r.content }}</p>

        <div class="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
          <span>✍️ {{ r.author }}</span>
          <span>{{ r.created_at?.slice(0, 10) }}</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal=false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 class="text-base font-semibold text-primary">✏️ 撰寫課程評價</h3>
              <button @click="showModal=false" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div v-if="submitSuccess" class="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm text-center">
              ✅ 評價送出成功，感謝分享！
            </div>
            <div v-if="submitError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{{ submitError }}</div>
            <div class="px-6 py-4 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">課程名稱 <span class="text-red-400">*</span></label>
                  <input v-model="form.course_name" type="text" placeholder="例：微積分"
                    :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none', formErrors.course_name ? 'border-red-300' : 'border-slate-300 focus:border-primary']" />
                  <p v-if="formErrors.course_name" class="text-red-500 text-xs mt-1">{{ formErrors.course_name }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">授課教師 <span class="text-red-400">*</span></label>
                  <input v-model="form.teacher" type="text" placeholder="例：陳志明"
                    :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none', formErrors.teacher ? 'border-red-300' : 'border-slate-300 focus:border-primary']" />
                  <p v-if="formErrors.teacher" class="text-red-500 text-xs mt-1">{{ formErrors.teacher }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">學院</label>
                  <select v-model="form.dept" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option v-for="d in depts.slice(1)" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">修課學期</label>
                  <select v-model="form.semester" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary">
                    <option v-for="s in ['113上','113下','112上','112下','111上','111下']" :key="s">{{ s }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">整體滿意度</label>
                  <div class="flex gap-1 mt-1">
                    <button v-for="n in 5" :key="n" @click="form.rating=n"
                      :class="['text-xl transition-all', n <= form.rating ? 'text-yellow-400' : 'text-slate-200']">★</button>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">課程難度（1最簡單）</label>
                  <div class="flex gap-1 mt-1">
                    <button v-for="n in 5" :key="n" @click="form.difficulty=n"
                      :class="['text-xl transition-all', n <= form.difficulty ? 'text-red-400' : 'text-slate-200']">●</button>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">評價內容 <span class="text-red-400">*</span></label>
                <textarea v-model="form.content" rows="3" placeholder="分享你的修課心得、考試難度、老師風格..."
                  :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none', formErrors.content ? 'border-red-300' : 'border-slate-300 focus:border-primary']" />
                <p v-if="formErrors.content" class="text-red-500 text-xs mt-1">{{ formErrors.content }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">署名（選填）</label>
                <input v-model="form.author" type="text" placeholder="例：資工系大三（留空為匿名）"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div class="flex gap-3 pt-1 pb-2">
                <button @click="showModal=false" class="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">取消</button>
                <button @click="submit" :disabled="submitting||submitSuccess"
                  :class="['flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all', submitting||submitSuccess ? 'bg-slate-400' : 'bg-primary hover:bg-primary-light']">
                  {{ submitting ? '送出中...' : submitSuccess ? '✅ 已送出' : '送出評價' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>