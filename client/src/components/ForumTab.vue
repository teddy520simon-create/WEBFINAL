<script setup>
import { ref, onMounted } from 'vue'
const BASE_URL = 'https://unitransfer-api-fcu.azurewebsites.net'

const posts         = ref([])
const loading       = ref(false)
const catFilter     = ref('all')
const activePost    = ref(null)
const comments      = ref([])
const commentLoading = ref(false)
const showNewPost   = ref(false)
const submitting    = ref(false)
const newComment    = ref('')
const commentAuthor = ref('')
const submitError   = ref(null)

// 根據你的 catColors 鍵值，幫你把亂碼還原成標準校園版塊名稱
const categories = ['全部', '校園資訊', '課業討論', '社團活動', '感情心情', '周邊美食', '生活閒聊']
const catColors  = {
  '校園資訊': 'bg-blue-100 text-blue-700',
  '感情心情': 'bg-purple-100 text-purple-700',
  '社團活動': 'bg-green-100 text-green-700',
  '課業討論': 'bg-red-100 text-red-700',
  '周邊美食': 'bg-orange-100 text-orange-700',
  '生活閒聊': 'bg-slate-100 text-slate-600',
}

const newPost    = ref({ category: '生活閒聊', title: '', content: '', author: '' })
const postErrors = ref({})

async function fetchPosts() {
  loading.value = true
  try {
    const p = new URLSearchParams()
    if (catFilter.value !== 'all') p.set('category', catFilter.value)
    const res  = await fetch(`${BASE_URL}/api/posts?${p}`)
    const data = await res.json()
    posts.value = data.posts
  } catch { posts.value = [] }
  finally { loading.value = false }
}

async function openPost(post) {
  activePost.value = post
  commentLoading.value = true
  try {
    const res  = await fetch(`${BASE_URL}/api/posts/${post.id}/comments`)
    const data = await res.json()
    comments.value = data.comments
  } catch { comments.value = [] }
  finally { commentLoading.value = false }
}

function closePost() {
  activePost.value = null
  comments.value = []
  newComment.value = ''
  commentAuthor.value = ''
}

async function sendComment() {
  if (!newComment.value.trim()) return
  try {
    await fetch(`${BASE_URL}/api/posts/${activePost.value.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment.value.trim(),
        author:  commentAuthor.value.trim() || '匿名使用者',
      }),
    })
    newComment.value    = ''
    commentAuthor.value = ''
    const res  = await fetch(`${BASE_URL}/api/posts/${activePost.value.id}/comments`)
    const data = await res.json()
    comments.value = data.comments
  } catch (e) { submitError.value = e.message }
}

async function likePost(post) {
  await fetch(`${BASE_URL}/api/posts/${post.id}/like`, { method: 'POST' })
  post.likes = (post.likes || 0) + 1
}

function validatePost() {
  const e = {}
  if (!newPost.value.title.trim())   e.title   = '請填寫文章標題'
  if (!newPost.value.content.trim()) e.content = '請填寫文章內容'
  postErrors.value = e
  return Object.keys(e).length === 0
}

async function submitPost() {
  if (!validatePost()) return
  submitting.value  = true
  submitError.value = null
  try {
    const res  = await fetch(`${BASE_URL}/api/posts`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(newPost.value),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    posts.value.unshift(data.post)
    showNewPost.value = false
    newPost.value = { category: '生活閒聊', title: '', content: '', author: '' }
    postErrors.value  = {}
  } catch (e) { submitError.value = e.message }
  finally { submitting.value = false }
}

onMounted(fetchPosts)
</script>

<template>
  <div>
    <div v-if="!activePost">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-primary mb-1">? 校園學生交流板</h2>
          <p class="text-sm text-slate-500">校園資訊、感情討論、課業問答，任何大小事都可以分享！</p>
        </div>
        <button @click="showNewPost = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-4">
          ?? 發表新文章
        </button>
      </div>

      <div class="flex gap-2 flex-wrap mb-6">
        <button
          v-for="cat in categories" :key="cat"
          @click="catFilter = cat === '全部' ? 'all' : cat; fetchPosts()"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            (cat === '全部' && catFilter === 'all') || catFilter === cat
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary',
          ]">
          {{ cat }}
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-16 text-slate-400">
        <span class="animate-spin text-3xl mr-2">?</span> 載入中...
      </div>

      <div v-else class="space-y-3">
        <div v-for="post in posts" :key="post.id"
          class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm card-hover cursor-pointer"
          @click="openPost(post)">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', catColors[post.category] || 'bg-slate-100 text-slate-600']">
                  {{ post.category }}
                </span>
                <span class="text-xs text-slate-400">{{ post.created_at?.slice(0, 10) }}</span>
              </div>
              <h3 class="font-semibold text-slate-800 text-base mb-1 truncate">{{ post.title }}</h3>
              <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed">{{ post.content }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <span class="text-xs text-slate-400">? {{ post.author || '匿名' }}</span>
            <div class="flex items-center gap-3">
              <button @click.stop="likePost(post)"
                class="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                ?? {{ post.likes || 0 }}
              </button>
              <span class="text-xs text-slate-400">? {{ post.comments_count || 0 }} 則留言</span>
            </div>
          </div>
        </div>

        <div v-if="posts.length === 0" class="flex flex-col items-center py-16 text-slate-400">
          <span class="text-5xl mb-3">?</span>
          <p>這個分類目前還沒有文章</p>
        </div>
      </div>
    </div>

    <div v-else>
      <button @click="closePost"
        class="flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-5 transition-colors">
        ← 返回討論板
      </button>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-4">
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', catColors[activePost.category] || 'bg-slate-100 text-slate-600']">
            {{ activePost.category }}
          </span>
          <span class="text-xs text-slate-400">{{ activePost.created_at?.slice(0, 10) }}</span>
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-3">{{ activePost.title }}</h2>
        <p class="text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{{ activePost.content }}</p>
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <span class="text-sm text-slate-500">? {{ activePost.author || '匿名' }}</span>
          <button @click="likePost(activePost)"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-sm transition-all">
            ?? {{ activePost.likes || 0 }} 人覺得讚
          </button>
        </div>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h3 class="font-semibold text-slate-700 mb-4">
          ? 留言區（{{ comments.length }} 則）
        </h3>

        <div v-if="commentLoading" class="text-center py-6 text-slate-400">
          <span class="animate-spin inline-block">?</span> 載入留言中...
        </div>

        <div v-else>
          <div v-if="comments.length === 0" class="text-center py-6 text-slate-400 text-sm">
            目前還沒有留言，搶下頭香吧！
          </div>
          <div v-else class="space-y-3 mb-5">
            <div v-for="c in comments" :key="c.id"
              class="flex gap-3 p-3 bg-slate-50 rounded-xl">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {{ (c.author || '匿')[0] }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-slate-700">{{ c.author }}</span>
                  <span class="text-xs text-slate-400">{{ c.created_at?.slice(0, 10) }}</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">{{ c.content }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4">
            <h4 class="text-sm font-medium text-slate-600 mb-3">我要留言</h4>
            <input v-model="commentAuthor" type="text" placeholder="您的暱稱（留空則為匿名）"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-primary" />
            <textarea v-model="newComment" rows="3" placeholder="輸入留言內容..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-primary mb-2" />
            <button @click="sendComment" :disabled="!newComment.trim()"
              :class="[
                'px-5 py-2 rounded-lg text-sm font-medium text-white transition-all',
                newComment.trim() ? 'bg-primary hover:bg-primary-light' : 'bg-slate-300 cursor-not-allowed',
              ]">
              送出留言
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showNewPost" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showNewPost = false" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 class="text-base font-semibold text-primary">?? 發表新文章</h3>
              <button @click="showNewPost = false" class="text-slate-400 hover:text-slate-600 text-xl">?</button>
            </div>
            <div v-if="submitError" class="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {{ submitError }}
            </div>
            <div class="px-6 py-4 space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">文章分類</label>
                <div class="flex gap-2 flex-wrap">
                  <button v-for="cat in categories.slice(1)" :key="cat"
                    @click="newPost.category = cat"
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium transition-all border',
                      newPost.category === cat
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary',
                    ]">
                    {{ cat }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">文章標題 <span class="text-red-400">*</span></label>
                <input v-model="newPost.title" type="text" placeholder="請輸入文章標題"
                  :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none', postErrors.title ? 'border-red-300' : 'border-slate-300 focus:border-primary']" />
                <p v-if="postErrors.title" class="text-red-500 text-xs mt-1">{{ postErrors.title }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">文章內容 <span class="text-red-400">*</span></label>
                <textarea v-model="newPost.content" rows="5" placeholder="請詳細描述你想分享的內容..."
                  :class="['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none', postErrors.content ? 'border-red-300' : 'border-slate-300 focus:border-primary']" />
                <p v-if="postErrors.content" class="text-red-500 text-xs mt-1">{{ postErrors.content }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">發文者暱稱</label>
                <input v-model="newPost.author" type="text" placeholder="例如：資工一帥（留空則為匿名）"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div class="flex gap-3 pt-1 pb-2">
                <button @click="showNewPost = false"
                  class="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                  取消
                </button>
                <button @click="submitPost" :disabled="submitting"
                  :class="['flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all', submitting ? 'bg-slate-400' : 'bg-primary hover:bg-primary-light']">
                  {{ submitting ? '發布中...' : '確認發布' }}
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* <-- 補上這行標準寫法，波浪警告就會消失 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>