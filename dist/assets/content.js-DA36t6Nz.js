let p=!1;function a(){const e=document.createElement("div");e.id="salary-tracker-container",e.style.cssText=`
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
  `;const r=document.createElement("div");r.id="salary-current-value",r.style.cssText=`
    font-weight: 500;
    color: #3B82F6;
    font-size: 10px;
    line-height: 1;
  `,r.textContent="¥0.00",e.appendChild(r);const t=document.createElement("div");t.id="salary-status",t.style.cssText=`
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #22C55E;
  `,e.appendChild(t);const n=document.createElement("div");return n.id="salary-tooltip",n.style.cssText=`
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
  `,e.appendChild(n),e.addEventListener("mouseenter",()=>{e.style.opacity="1",n.style.display="block"}),e.addEventListener("mouseleave",()=>{e.style.opacity="0.9",n.style.display="none"}),document.body.appendChild(e),p=!0,e}function c(e){let r=document.getElementById("salary-tracker-container");r||(r=a());try{const t=document.getElementById("salary-current-value"),n=document.getElementById("salary-status"),u=document.getElementById("salary-tooltip");if(e.isWorkDay){let o;if(e.hideActualAmount)switch(e.hideFormat){case"stars":o="****";break;case"percent":const y=e.workStartTime?s(e.workStartTime):9*60,m=(e.workEndTime?s(e.workEndTime):18*60)-y,k=typeof e.currentWorkMinutes=="string"?e.currentWorkMinutes:e.currentWorkMinutes/60*60;o=`${Math.min(100,Math.round(k/m*100))}%`;break;case"progress":const g=e.workStartTime?s(e.workStartTime):9*60,h=e.workEndTime?s(e.workEndTime):18*60,x=typeof e.currentWorkMinutes=="string"?e.currentWorkMinutes:e.currentWorkMinutes/60*60,d=Math.min(10,Math.floor(x/(h-g)*10));o="▮".repeat(d)+"▯".repeat(10-d);break;default:o="****"}else o=`${e.currencyUnit||"¥"}${e.currentSalary.toFixed(2)}`;t.textContent=o,t.style.color="#3B82F6",n.style.background="#22C55E";let i=`已工作: ${e.currentWorkMinutes}<br>`;e.hideActualAmount||(i+=`时薪: ${e.currencyUnit||"¥"}${e.hourlyRate.toFixed(2)}<br>`),i+=`本月工作日: ${e.workDaysInMonth}天`,u.innerHTML=i}else t.textContent="休",t.style.color="#9CA3AF",n.style.background="#9CA3AF",u.innerHTML="非工作日"}catch(t){console.error("Error updating salary display:",t),p||(r=a(),c(e))}}function s(e){const[r,t]=e.split(":").map(Number);return r*60+t}chrome.runtime.onMessage.addListener((e,r,t)=>{if(e.type==="UPDATE_SALARY")try{c(e.data),t({success:!0})}catch(n){console.error("Error handling UPDATE_SALARY message:",n),t({success:!1,error:n.message})}return!0});function l(){try{chrome.runtime.sendMessage({type:"GET_SALARY_DATA"},e=>{if(chrome.runtime.lastError){console.error("Error requesting salary data:",chrome.runtime.lastError);return}e&&c(e)})}catch(e){console.error("Error in requestSalaryUpdate:",e)}setTimeout(l,2e3)}document.addEventListener("DOMContentLoaded",()=>{l()});window.addEventListener("load",()=>{document.getElementById("salary-tracker-container")||a(),l()});
