
// 添加初始化标记
let isInitialized = false;

// 创建薪资显示器
function createSalaryDisplay() {
  // 创建容器
  const container = document.createElement('div');
  container.id = 'salary-tracker-container';
  container.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    cursor: pointer;
    min-width: auto;
    backdrop-filter: blur(4px);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    opacity: 0.9;
  `;
  
  // 简化显示，只显示金额
  const salary = document.createElement('div');
  salary.id = 'salary-current-value';
  salary.style.cssText = `
    font-weight: 500;
    color: #3B82F6;
    font-size: 10px;
    line-height: 1;
  `;
  salary.textContent = '¥0.00';
  container.appendChild(salary);

  // 添加一个小图标表示工作状态
  const statusDot = document.createElement('div');
  statusDot.id = 'salary-status';
  statusDot.style.cssText = `
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #22C55E;
  `;
  container.appendChild(statusDot);

  // 悬停时显示的详细信息
  const tooltip = document.createElement('div');
  tooltip.id = 'salary-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 2px;
    padding: 4px 6px;
    background: white;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    font-size: 9px;
    display: none;
    white-space: nowrap;
    color: #666;
  `;
  container.appendChild(tooltip);

  // 添加悬停事件
  container.addEventListener('mouseenter', () => {
    container.style.opacity = '1';
    tooltip.style.display = 'block';
  });
  container.addEventListener('mouseleave', () => {
    container.style.opacity = '0.9';
    tooltip.style.display = 'none';
  });

  // 添加到页面
  document.body.appendChild(container);
  
  // 标记为已初始化
  isInitialized = true;
  return container;
}

// 更新薪资显示
function updateSalaryDisplay(data) {
  
  let container = document.getElementById('salary-tracker-container');
  
  if (!container) {
    container = createSalaryDisplay();
  }
  
  try {
    const salaryValue = document.getElementById('salary-current-value');
    const statusDot = document.getElementById('salary-status');
    const tooltip = document.getElementById('salary-tooltip');

    if (data.isWorkDay) {
      // 处理隐私设置
      let displayValue;
      if (data.hideActualAmount) {
        switch (data.hideFormat) {
          case 'stars':
            displayValue = '****';
            break;
          case 'percent':
            // 计算工作日的百分比
            const workStartMinutes = data.workStartTime ? getMinutesFromTimeString(data.workStartTime) : 9 * 60;
            const workEndMinutes = data.workEndTime ? getMinutesFromTimeString(data.workEndTime) : 18 * 60;
            const totalMinutes = workEndMinutes - workStartMinutes;
            // 使用原始分钟数而不是格式化后的字符串
            const workMinutes = typeof data.currentWorkMinutes === 'string' ? 
              data.currentWorkMinutes : // 已经是格式化后的字符串
              (data.currentWorkMinutes / 60) * 60; // 转换为分钟
            const percent = Math.min(100, Math.round((workMinutes / totalMinutes) * 100));
            displayValue = `${percent}%`;
            break;
          case 'progress':
            const workStartMins = data.workStartTime ? getMinutesFromTimeString(data.workStartTime) : 9 * 60;
            const workEndMins = data.workEndTime ? getMinutesFromTimeString(data.workEndTime) : 18 * 60;
            // 使用原始分钟数而不是格式化后的字符串
            const workMins = typeof data.currentWorkMinutes === 'string' ? 
              data.currentWorkMinutes : // 已经是格式化后的字符串
              (data.currentWorkMinutes / 60) * 60; // 转换为分钟
            const progress = Math.min(10, Math.floor((workMins / (workEndMins - workStartMins)) * 10));
            displayValue = '▮'.repeat(progress) + '▯'.repeat(10 - progress);
            break;
          default:
            displayValue = '****';
        }
      } else {
        displayValue = `${data.currencyUnit || '¥'}${data.currentSalary.toFixed(2)}`;
      }

      salaryValue.textContent = displayValue;
      salaryValue.style.color = '#3B82F6';
      statusDot.style.background = '#22C55E';
      
      // 更新提示信息 - 直接使用后台发来的格式化工作时间
      let tooltipContent = `已工作: ${data.currentWorkMinutes}<br>`;
      
      if (!data.hideActualAmount) {
        tooltipContent += `时薪: ${data.currencyUnit || '¥'}${data.hourlyRate.toFixed(2)}<br>`;
      }
      
      tooltipContent += `本月工作日: ${data.workDaysInMonth}天`;
      tooltip.innerHTML = tooltipContent;
    } else {
      salaryValue.textContent = '休';
      salaryValue.style.color = '#9CA3AF';
      statusDot.style.background = '#9CA3AF';
      tooltip.innerHTML = '非工作日';
    }
  } catch (error) {
    console.error("Error updating salary display:", error);
    if (!isInitialized) {
      container = createSalaryDisplay();
      updateSalaryDisplay(data);
    }
  }
}

// 辅助函数：从时间字符串获取分钟数
function getMinutesFromTimeString(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// 修改消息监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.type === 'UPDATE_SALARY') {
    try {
      updateSalaryDisplay(message.data);
      sendResponse({success: true});
    } catch (err) {
      console.error('Error handling UPDATE_SALARY message:', err);
      sendResponse({success: false, error: err.message});
    }
  }
  return true;
});

// 修改数据请求函数
function requestSalaryUpdate() {
  try {
    chrome.runtime.sendMessage({type: 'GET_SALARY_DATA'}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error requesting salary data:', chrome.runtime.lastError);
        return;
      }
      if (response) {
        updateSalaryDisplay(response);
      }
    });
  } catch (err) {
    console.error('Error in requestSalaryUpdate:', err);
  }
  
  // 继续定期请求更新
  setTimeout(requestSalaryUpdate, 2000);
}

// 确保页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  requestSalaryUpdate();
});

// 页面完全加载后的初始化
window.addEventListener('load', () => {
  if (!document.getElementById('salary-tracker-container')) {
    createSalaryDisplay();
  }
  requestSalaryUpdate();
});