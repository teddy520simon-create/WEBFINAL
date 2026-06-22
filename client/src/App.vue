<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import ChecklistTab from './components/ChecklistTab.vue'
import CreditTransferTab from './components/CreditTransferTab.vue'
import LifeHackTab from './components/LifeHackTab.vue'
import CourseReviewTab from './components/CourseReviewTab.vue'
import ForumTab from './components/ForumTab.vue'

const activeTab = ref('')

const tabs = [
  { key: 'checklist', label: '新手報到任務包', icon: '📋' },
  { key: 'credits',   label: '學分抵免殿堂',   icon: '🎓' },
  { key: 'lifehack',  label: '校園生存地圖',    icon: '🗺️' },
  { key: 'reviews',   label: '課程評價',         icon: '⭐' },
  { key: 'forum',     label: '學生交流板',       icon: '💬' },
]

function scrollToApp() {
  activeTab.value = 'checklist'
  setTimeout(() => {
    document.getElementById('app-content')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

function switchTab(key) {
  activeTab.value = key
  setTimeout(() => {
    document.getElementById('app-content')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar
      :tabs="tabs"
      :active-tab="activeTab"
      @change-tab="switchTab($event)"
    />

    <Hero @get-started="scrollToApp" />

    <div id="app-content" class="flex-1 bg-slate-50">
      <div v-if="activeTab" class="max-w-6xl mx-auto px-4 py-10">

        <!-- 頁籤切換列 -->
        <div class="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex-wrap justify-center">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:text-primary hover:bg-slate-50',
            ]"
          >
            <span>{{ tab.icon }}</span>{{ tab.label }}
          </button>
        </div>

        <!-- 頁籤內容 -->
        <Transition name="fade" mode="out-in">
          <ChecklistTab      v-if="activeTab === 'checklist'"  key="checklist" />
          <CreditTransferTab v-else-if="activeTab === 'credits'"  key="credits" />
          <LifeHackTab       v-else-if="activeTab === 'lifehack'" key="lifehack" />
          <CourseReviewTab   v-else-if="activeTab === 'reviews'"  key="reviews" />
          <ForumTab          v-else-if="activeTab === 'forum'"    key="forum" />
        </Transition>

      </div>
    </div>

    <footer class="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">🏝️</span>
              <span class="text-white font-semibold text-lg">UniTransfer Hub</span>
            </div>
            <p class="text-sm leading-relaxed">
              由轉學生，為轉學生而建。<br/>
              讓每一位轉學生都能無縫銜接新的大學生活。
            </p>
          </div>
          <div>
            <div class="text-white font-medium mb-3">功能頁籤</div>
            <ul class="space-y-2 text-sm">
              <li v-for="tab in tabs" :key="tab.key">
                <button
                  @click="switchTab(tab.key)"
                  class="hover:text-white transition-colors"
                >
                  {{ tab.icon }} {{ tab.label }}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <div class="text-white font-medium mb-3">關於本站</div>
            <ul class="space-y-2 text-sm">
              <li class="hover:text-white transition-colors cursor-pointer">資料回報說明</li>
              <li class="hover:text-white transition-colors cursor-pointer">隱私權政策</li>
              <li class="hover:text-white transition-colors cursor-pointer">聯絡我們</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
          <span>© 2025 UniTransfer Hub｜逢甲大學 轉學生專屬平台</span>
          <span>Made with ❤️ for transfer students</span>
        </div>
      </div>
    </footer>
  </div>
</template>