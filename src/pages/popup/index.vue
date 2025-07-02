<template>
  <div class="min-h-[380px] w-[360px] bg-gradient-to-br from-gray-50 to-gray-100 p-2">
    <!-- 头部区域 - 更紧凑 -->
    <div class="flex items-center gap-1.5 mb-2">
      <div class="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-base font-bold text-gray-800">{{ t('header_title') }}</h1>
    </div>

    <!-- 主要内容区域 - 减小间距 -->
    <div class="space-y-2">
      <!-- 月薪设置 -->
      <div class="bg-white rounded-md p-1.5 shadow-sm">
        <label class="block text-xs font-medium text-gray-700 mb-0.5">{{ t('salary_monthly_label') }}</label>
        <div class="relative flex items-center space-x-1">
          <span class=" text-gray-500 text-xs text-nowrap">{{ currencyUnit || '¥' }}</span>
          <input v-model="monthlySalary" type="number" min="0"
            class="w-full  pr-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="{{ t('salary_monthly_placeholder') }}" @input="handleSettingChange">
        </div>
      </div>

      <!-- 货币单位设置 -->
      <div class="bg-white rounded-md p-1.5 shadow-sm">
        <label class="block text-xs font-medium text-gray-700 mb-0.5">{{ t('salary_currency_label') }}</label>
        <div class="space-y-1">
          <input 
            v-model="currencyUnit" 
            type="text"
            maxlength="6"
            class="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="{{ t('salary_currency_placeholder') }}"
            @input="handleSettingChange"
          >
          <p class="text-[10px] text-gray-500 italic">{{ t('salary_currency_hint') }}</p>
        </div>
      </div>

      <!-- 工作时间设置 -->
      <div class="bg-white rounded-md p-1.5 shadow-sm">
        <label class="block text-xs font-medium text-gray-700 mb-0.5">{{ t('salary_workdays_label') }}</label>
        <div class="flex gap-0.5 flex-wrap">
          <button v-for="day in weekDays" :key="day.value" @click="toggleWorkDay(day.value)" :class="[
            'px-2 py-0.5 rounded text-xs font-medium transition-all duration-200',
            workDays.includes(day.value)
              ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]">
            {{ day.label }}
          </button>
        </div>
      </div>

      <!-- 上下班时间设置 -->
      <div class="bg-white rounded-md p-1.5 shadow-sm">
        <div class="grid grid-cols-2 gap-1.5">
          <div>
            <label class="flex mb-0.5 items-center gap-1 text-xs font-medium text-gray-700">
              <img :src="workerImage" alt="" class="w-4 h-4">
              <span>{{ t('salary_workTime_start') }}</span>
            </label>
            <input v-model="workStartTime" type="time"
              ref="startInputRef"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              @input="handleSettingChange"
              @click="openTimePicker('start')">
          </div>
          <div>
            <label class="flex mb-0.5 items-center gap-1 text-xs font-medium text-gray-700">
              <img :src="workerImage2" alt="" class="w-4 h-4">
              <span>{{ t('salary_workTime_end') }}</span>
            </label>
            <input v-model="workEndTime" type="time"
              ref="endInputRef"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              @input="handleSettingChange"
              @click="openTimePicker('end')">
          </div>
        </div>
      </div>

      <!-- 更新频率设置 -->
      <div class="bg-white rounded-md p-1.5 shadow-sm">
        <label class="block text-xs font-medium text-gray-700 mb-0.5">{{ t('salary_updateInterval_label') }}</label>
        <div class="flex items-center gap-1">
          <button @click="decreaseInterval"
            class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="updateInterval <= 100">
            <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <input v-model="updateInterval" type="number" min="100" max="5000" step="100"
            class="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="{{ t('salary_updateInterval_hint') }}" @input="handleSettingChange">
          <button @click="increaseInterval"
            class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="updateInterval >= 5000">
            <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p class="mt-0.5 text-[10px] text-gray-400">范围：100-5000毫秒，步进值：100毫秒</p>
      </div>

      <!-- 实时薪资显示 -->
      <div class="bg-white rounded-md p-2 shadow-sm">
        <div class="text-center">
          <template v-if="isWorkDay">
            <p class="text-xl font-bold text-blue-600 mb-1">
              {{ formatDisplaySalary(currentSalary) }}
            </p>
            <div class="space-y-0.5 text-[10px] text-gray-500">
              <p>{{ t('display_workStatus_worked') }}: {{ formatWorkTime(currentWorkMinutes) }}</p>
              <p>{{ t('display_workStatus_hourlyRate') }}: {{ formatDisplaySalary(hourlyRate, true) }}</p>
              <p>{{ t('display_workStatus_workDaysInMonth') }}: {{ workDaysInMonth }}</p>
            </div>
          </template>
          <template v-else>
            <p class="text-xl font-bold text-gray-400">{{ t('display_nonWorkingDay') }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const workerImage = chrome.runtime.getURL('src/public/images/1.png')
const workerImage2 = chrome.runtime.getURL('src/public/images/2.png')

// 状态定义
const monthlySalary = ref(0)
const workDays = ref([1, 2, 3, 4, 5])
const workStartTime = ref('09:00')
const workEndTime = ref('18:00')
const updateInterval = ref(200)
const currentSalary = ref(0)
const currentTime = ref('')
const currentWorkMinutes = ref(0)
const hourlyRate = ref(0)
const workDaysInMonth = ref(0)
const isWorkDay = ref(false)
const currencyUnit = ref('¥')

// 用于引用 input 元素
const startInputRef = ref(null)
const endInputRef = ref(null)

// 创建一个 i18n 辅助函数
const t = (key) => chrome.i18n.getMessage(key)

const weekDays = [
  { label: t('salary_workdays_monday'), value: 1 },
  { label: t('salary_workdays_tuesday'), value: 2 },
  { label: t('salary_workdays_wednesday'), value: 3 },
  { label: t('salary_workdays_thursday'), value: 4 },
  { label: t('salary_workdays_friday'), value: 5 },
  { label: t('salary_workdays_saturday'), value: 6 },
  { label: t('salary_workdays_sunday'), value: 0 }
]

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 增加更新频率
const increaseInterval = () => {
  if (updateInterval.value < 5000) {
    updateInterval.value = Math.min(5000, updateInterval.value + 100)
    handleSettingChange()
  }
}

// 减少更新频率
const decreaseInterval = () => {
  if (updateInterval.value > 100) {
    updateInterval.value = Math.max(100, updateInterval.value - 100)
    handleSettingChange()
  }
}

// 处理设置变化
const handleSettingChange = debounce(async () => {
  // 确保更新频率是100的倍数
  updateInterval.value = Math.round(updateInterval.value / 100) * 100
  // 限制在100-5000范围内
  updateInterval.value = Math.max(100, Math.min(5000, updateInterval.value))

  await saveSettings()
  calculateCurrentSalary()

  // 重新启动定时器
  if (timer) {
    cancelAnimationFrame(timer)
  }
  let lastTime = 0
  const animate = (timestamp) => {
    if (timestamp - lastTime >= updateInterval.value) {
      calculateCurrentSalary()
      lastTime = timestamp
    }
    timer = requestAnimationFrame(animate)
  }
  timer = requestAnimationFrame(animate)
}, 300)

// 格式化显示薪资
const formatDisplaySalary = (amount, isHourly = false) => {
  return `${currencyUnit.value}${isHourly ? amount.toFixed(2) : amount.toFixed(2)}`
}

// 保存设置到 Chrome Storage
const saveSettings = () => {
  if (!Array.isArray(workDays.value) || workDays.value.length === 0) {
    workDays.value = [1, 2, 3, 4, 5]
  }

  const settings = {
    monthlySalary: monthlySalary.value,
    workDays: [...workDays.value],
    workStartTime: workStartTime.value,
    workEndTime: workEndTime.value,
    updateInterval: Math.max(100, Math.min(10000, updateInterval.value)),
    currencyUnit: currencyUnit.value
  }

  return new Promise((resolve) => {
    chrome.storage.sync.set({ salarySettings: settings }, () => {
      console.log('Settings saved:', settings)
      // 通知background更新设置
      chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' })
      resolve()
    })
  })
}

// 从 Chrome Storage 加载设置
const loadSettings = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['salarySettings'], (result) => {
      if (result.salarySettings) {
        const settings = result.salarySettings
        monthlySalary.value = settings.monthlySalary || 0
        workDays.value = Array.isArray(settings.workDays) ? [...settings.workDays] : [1, 2, 3, 4, 5]
        workStartTime.value = settings.workStartTime || '09:00'
        workEndTime.value = settings.workEndTime || '18:00'
        updateInterval.value = settings.updateInterval || 200
        currencyUnit.value = settings.currencyUnit || '¥'

        console.log('Settings loaded:', settings)
        calculateCurrentSalary()
      }
      resolve()
    })
  })
}

// 切换工作日
const toggleWorkDay = async (day) => {
  if (!Array.isArray(workDays.value)) {
    workDays.value = []
  }

  const index = workDays.value.indexOf(day)
  if (index === -1) {
    workDays.value.push(day)
  } else {
    workDays.value.splice(index, 1)
  }
  workDays.value.sort((a, b) => a - b)

  await saveSettings()
  calculateCurrentSalary()
}

// 格式化工作时间
const formatWorkTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${hours}小时${mins.toString().padStart(2, '0')}分钟`
}

// 计算当月工作日数量
const getWorkDaysInMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let workDaysCount = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (workDays.value.includes(date.getDay())) {
      workDaysCount++
    }
  }

  return workDaysCount
}

// 计算实时薪资
const calculateCurrentSalary = () => {
  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentSecond = now.getSeconds()
  const currentMillisecond = now.getMilliseconds()

  currentTime.value = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}.${currentMillisecond.toString().padStart(3, '0')}`

  // 检查是否是工作日
  isWorkDay.value = Array.isArray(workDays.value) && workDays.value.includes(currentDay)

  if (!isWorkDay.value) {
    currentSalary.value = 0
    currentWorkMinutes.value = 0
    return
  }

  // 解析工作时间
  const [startHour, startMinute] = workStartTime.value.split(':').map(Number)
  const [endHour, endMinute] = workEndTime.value.split(':').map(
    Number
  )

  const workStartMinutes = startHour * 60 + startMinute
  const workEndMinutes = endHour * 60 + endMinute
  // 使用更精确的时间计算，包括秒和毫秒
  const currentTotalMinutes = currentHour * 60 + currentMinute + (currentSecond / 60) + (currentMillisecond / 60000)

  // 计算每天工作小时数
  const workHoursPerDay = (workEndMinutes - workStartMinutes) / 60

  // 计算当月工作日数量
  workDaysInMonth.value = getWorkDaysInMonth()

  // 计算每小时薪资
  hourlyRate.value = monthlySalary.value / (workDaysInMonth.value * workHoursPerDay)

  // 计算当前工作分钟数（使用更精确的计算）
  if (currentTotalMinutes < workStartMinutes) {
    currentWorkMinutes.value = 0
  } else if (currentTotalMinutes > workEndMinutes) {
    currentWorkMinutes.value = workEndMinutes - workStartMinutes
  } else {
    currentWorkMinutes.value = currentTotalMinutes - workStartMinutes
  }

  // 计算当前薪资（使用更精确的计算）
  currentSalary.value = (currentWorkMinutes.value / 60) * hourlyRate.value
  
  // 通知background数据已更新
  chrome.runtime.sendMessage({
    type: 'SETTINGS_UPDATED',
    data: {
      currencyUnit: currencyUnit.value
    }
  })
}

let timer = null

// 打开时间选择器
const openTimePicker = (type) => {
  if (type === 'start' && startInputRef.value) {
    startInputRef.value.click()
  }
  if (type === 'end' && endInputRef.value) {
    endInputRef.value.click()
  }
}

// 组件挂载时加载设置并启动定时器
onMounted(async () => {
  await loadSettings()
  if (monthlySalary.value <= 0) {
    monthlySalary.value = 10000
  }
  calculateCurrentSalary()
  // 使用 requestAnimationFrame 来获得更平滑的更新
  let lastTime = 0
  const animate = (timestamp) => {
    if (timestamp - lastTime >= updateInterval.value) {
      calculateCurrentSalary()
      lastTime = timestamp
    }
    timer = requestAnimationFrame(animate)
  }
  timer = requestAnimationFrame(animate)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    cancelAnimationFrame(timer)
  }
})
</script>

<style>
/* 可以添加自定义样式 */
</style>
