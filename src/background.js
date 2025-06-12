// console.log('background.js');

chrome.action.onClicked.addListener((tab) => {
 
});

chrome.runtime.onInstalled.addListener(async (details) => {
});



// 状态变量
let monthlySalary = 10000;
let workDays = [1, 2, 3, 4, 5];
let workStartTime = '09:00';
let workEndTime = '18:00';
let updateInterval = 200;
let currentSalary = 0;
let currentWorkMinutes = 0;
let hourlyRate = 0;
let workDaysInMonth = 0;
let isWorkDay = false;
let timer = null;
let currencyUnit = '¥';
let hideActualAmount = false;
let hideFormat = 'stars';

// 从 Chrome Storage 加载设置
const loadSettings = async () => {
  try {
    const result = await chrome.storage.sync.get(['salarySettings']);
    if (result.salarySettings) {
      const settings = result.salarySettings;
      monthlySalary = settings.monthlySalary || 10000;
      workDays = Array.isArray(settings.workDays) ? [...settings.workDays] : [1, 2, 3, 4, 5];
      workStartTime = settings.workStartTime || '09:00';
      workEndTime = settings.workEndTime || '18:00';
      updateInterval = settings.updateInterval || 200;
      currencyUnit = settings.currencyUnit || '¥';
      hideActualAmount = settings.hideActualAmount || false;
      hideFormat = settings.hideFormat || 'stars';
      
      console.log('Background: Settings loaded:', settings);
    }
    calculateCurrentSalary();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

// 格式化工作时间
const formatWorkTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}小时${mins.toString().padStart(2, '0')}分钟`;
};

// 计算当月工作日数量
const getWorkDaysInMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workDaysCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (workDays.includes(date.getDay())) {
      workDaysCount++;
    }
  }

  return workDaysCount;
};

// 计算实时薪资
const calculateCurrentSalary = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const currentMillisecond = now.getMilliseconds();

  // 检查是否是工作日
  isWorkDay = Array.isArray(workDays) && workDays.includes(currentDay);

  if (!isWorkDay) {
    currentSalary = 0;
    currentWorkMinutes = 0;
    updateBadgeAndContent();
    return;
  }

  // 解析工作时间
  const [startHour, startMinute] = workStartTime.split(':').map(Number);
  const [endHour, endMinute] = workEndTime.split(':').map(Number);
  
  const workStartMinutes = startHour * 60 + startMinute;
  const workEndMinutes = endHour * 60 + endMinute;
  // 使用更精确的时间计算，包括秒和毫秒
  const currentTotalMinutes = currentHour * 60 + currentMinute + (currentSecond / 60) + (currentMillisecond / 60000);

  // 计算每天工作小时数
  const workHoursPerDay = (workEndMinutes - workStartMinutes) / 60;

  // 计算当月工作日数量
  workDaysInMonth = getWorkDaysInMonth();

  // 计算每小时薪资
  hourlyRate = monthlySalary / (workDaysInMonth * workHoursPerDay);

  // 计算当前工作分钟数（使用更精确的计算）
  if (currentTotalMinutes < workStartMinutes) {
    currentWorkMinutes = 0;
  } else if (currentTotalMinutes > workEndMinutes) {
    currentWorkMinutes = workEndMinutes - workStartMinutes;
  } else {
    currentWorkMinutes = currentTotalMinutes - workStartMinutes;
  }

  // 计算当前薪资（使用更精确的计算）
  currentSalary = (currentWorkMinutes / 60) * hourlyRate;
  
  updateBadgeAndContent();
};

// 更新badge和content
const updateBadgeAndContent = () => {
  // 更新扩展图标 badge
  let badge = '';
  if (isWorkDay) {
    if (currentSalary >= 1000000) {
      badge = (currentSalary / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (currentSalary >= 10000) {
      badge = (currentSalary / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
      badge = Math.floor(currentSalary).toString();
    }
    // 保证最多4字符
    badge = badge.slice(0, 4);
  }
  
  // chrome.action.setBadgeText({ text: badge });
  chrome.action.setBadgeBackgroundColor({ color: isWorkDay ? '#3B82F6' : '#BDBDBD' });
  
  // 准备发送给content script的数据
  const salaryData = {
    currentSalary,
    isWorkDay,
    workDaysInMonth,
    hourlyRate,
    currentWorkMinutes: formatWorkTime(currentWorkMinutes),
    currencyUnit,
    hideActualAmount,
    hideFormat
  };
  
  // 添加调试日志
  console.log('Preparing to send salary data:', salaryData);
  
  // 修改查询和发送逻辑
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      console.log('Found active tab:', activeTab.id);
      try {
        // 检查标签页是否可以接收消息
        if (!activeTab.url || activeTab.url.startsWith('chrome:') || activeTab.url.startsWith('edge:')) {
          console.log('Skipping protected tab:', activeTab.url);
          return;
        }
        
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'UPDATE_SALARY',
          data: salaryData
        });
        console.log('Successfully sent message to tab:', activeTab.id);
      } catch (err) {
        console.log('Error sending message to tab:', err);
      }
    } else {
      console.log('No active tab found');
    }
  });
};

// 监听来自popup的设置更新
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message in background:', message.type);
  
  if (message.type === 'SETTINGS_UPDATED') {
    loadSettings().then(() => {
      calculateCurrentSalary();
      sendResponse({success: true});
    });
    return true; // 表示会异步发送响应
  }
  
  if (message.type === 'GET_SALARY_DATA') {
    const response = {
      currentSalary,
      isWorkDay,
      workDaysInMonth,
      hourlyRate,
      currentWorkMinutes: formatWorkTime(currentWorkMinutes),
      currencyUnit,
      hideActualAmount,
      hideFormat
    };
    console.log('Sending salary data response:', response);
    sendResponse(response);
    return true;
  }
});

// 修改初始化函数
const initialize = async () => {
  console.log('Initializing background script');
  await loadSettings();
  calculateCurrentSalary();
  
  if (timer) {
    clearInterval(timer);
  }
  
  const interval = typeof updateInterval === 'number' && updateInterval >= 100 ? 
    updateInterval : 200;
  
  console.log(`Setting timer with interval: ${interval}ms`);
  timer = setInterval(calculateCurrentSalary, interval);
  
  // 监听标签页激活
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab && tab.url && !tab.url.startsWith('chrome:') && !tab.url.startsWith('edge:')) {
        console.log('Sending data to newly activated tab');
        await chrome.tabs.sendMessage(activeInfo.tabId, {
          type: 'UPDATE_SALARY',
          data: {
            currentSalary,
            isWorkDay,
            workDaysInMonth,
            hourlyRate,
            currentWorkMinutes: formatWorkTime(currentWorkMinutes),
            currencyUnit,
            hideActualAmount,
            hideFormat
          }
        });
      }
    } catch (err) {
      console.log('Error handling tab activation:', err);
    }
  });
};

// 启动计算
initialize();

// 安装/更新时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  await initialize();
});