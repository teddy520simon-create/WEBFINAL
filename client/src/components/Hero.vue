<script setup>
const emit = defineEmits(['get-started'])

const stats = [
  { number: '1,200+', label: '轉學生使用中' },
  { number: '380+',   label: '學分抵免案例' },
  { number: '15+',    label: '合作學校科系' },
  { number: '98%',    label: '問題解決率' },
]

const features = [
  {
    icon: '📋',
    title: '新手報到任務包',
    desc: '一站式入學 Checklist，兵役、帳號、學分抵免全部搞定，不漏任何一個死線。',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: '🎓',
    title: '學分抵免殿堂',
    desc: '收錄數百筆前輩抵免紀錄，搜尋你的原校科目，知道哪些課能過、哪些要補件。',
    color: 'bg-orange-50 text-orange-700',
  },
  {
    icon: '🗺️',
    title: '校園生存地圖',
    desc: '租屋避坑、最便宜的印刷室、選課甜課/大刀課名單，老鳥才知道的生存密技。',
    color: 'bg-green-50 text-green-700',
  },
]
</script>

<template>
  <section class="hero-bg text-white py-24 px-4 relative z-0">
    <div class="max-w-6xl mx-auto relative z-10">
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6 backdrop-blur-sm">
          <span>🎓</span> 逢甲大學 轉學生專屬平台
        </div>
        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          轉學，從這裡<br/>
          <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(90deg, #f97316, #fbbf24);">
            無縫銜接
          </span>
        </h1>
        <p class="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          你需要的所有入學情報，由前輩親身整理。<br/>
          報到任務、學分抵免、校園生存，一站搞定。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="emit('get-started')"
            class="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            立即開始使用 →
          </button>
          <button
            @click="emit('get-started')"
            class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-base transition-all duration-200 border border-white/20 backdrop-blur-sm"
          >
            瀏覽學分抵免案例
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-0">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="stat-card rounded-2xl p-5 text-center"
        >
          <div class="text-3xl font-bold text-white mb-1">{{ stat.number }}</div>
          <div class="text-sm text-blue-200">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-white py-16 px-4 border-b border-slate-100">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-3">為什麼選擇 UniTransfer Hub？</h2>
        <p class="text-slate-500 max-w-xl mx-auto">每一筆資料都來自真實的轉學生經歷，不是官方制式說明，是你能直接用上的前線情報。</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="f in features"
          :key="f.title"
          class="card-hover bg-white border border-slate-100 rounded-2xl p-6 shadow-sm cursor-pointer"
          @click="emit('get-started')"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4', f.color]">
            {{ f.icon }}
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ f.title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>