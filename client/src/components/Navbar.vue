<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  tabs:      { type: Array,  required: true },
  activeTab: { type: String, required: true },
})
const emit = defineEmits(['change-tab'])

const scrolled = ref(false)
function onScroll() { scrolled.value = window.scrollY > 60 }
onMounted(()  => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white shadow-md border-b border-slate-200'
        : 'bg-transparent',
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

      <!-- Logo -->
      <div
        class="flex items-center gap-2 cursor-pointer select-none"
        @click="emit('change-tab', '')"
      >
        <span class="text-2xl">??</span>
        <div class="flex items-center gap-1.5">
          <span :class="['font-bold text-base tracking-wide transition-colors duration-300', scrolled ? 'text-primary' : 'text-white']">
            UniTransfer Hub
          </span>
          <span :class="['text-xs font-medium transition-colors duration-300', scrolled ? 'text-accent' : 'text-orange-300']">
            轉轉銜接島
          </span>
        </div>
      </div>

      <!-- 頁籤按鈕 -->
      <nav class="flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="emit('change-tab', tab.key)"
          :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap',
            activeTab === tab.key
              ? 'bg-accent text-white shadow-sm'
              : scrolled
                ? 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                : 'text-white/90 hover:bg-white/15 hover:text-white',
          ]"
        >
          <span>{{ tab.icon }}</span>
          <span class="hidden md:inline">{{ tab.label }}</span>
        </button>
      </nav>

    </div>
  </header>
</template>