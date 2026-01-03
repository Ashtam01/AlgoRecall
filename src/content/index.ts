import { CodeforcesAdapter } from "./adapters/codeforces";
import { CodeChefAdapter } from "./adapters/codechef";
import { AtCoderAdapter } from "./adapters/atcoder";
import { LeetCodeAdapter } from "./adapters/leetcode";

console.log("🚀 AlgoRecall: Content script loaded!");

const adapters = [
    new CodeforcesAdapter(),
    new CodeChefAdapter(),
    new AtCoderAdapter(),
    new LeetCodeAdapter()
];

const currentUrl = window.location.href;
const activeAdapter = adapters.find(a => a.matchUrl(currentUrl));

// --- Keep existing Type Definitions & Logic ---
interface ReviewItem { id: string; tags?: string[]; }
interface StorageShape { problems?: Record<string, ReviewItem>; }

let hasShownToast = false;

if (activeAdapter) {
  console.log(`AlgoRecall: Active on ${activeAdapter.name}`);
  
  const intervalId = setInterval(() => {
    if (activeAdapter.isSuccessState() && !hasShownToast) {
        checkIfTrackedAndShowToast();
        clearInterval(intervalId); // Stop polling after showing toast
    }
  }, 3000);
}

function checkIfTrackedAndShowToast() {
    if (!activeAdapter) return;

    chrome.storage.local.get("problems", (result: StorageShape) => {
        const problems = result.problems || {};
        const currentId = window.location.href.split('?')[0];

        if (problems[currentId]) {
            hasShownToast = true; 
            return; 
        }

        hasShownToast = true;
        const title = activeAdapter.getProblemTitle() || "Problem";
        const tags = activeAdapter.getProblemTags ? activeAdapter.getProblemTags() : [];
        
        showAddToast(title, window.location.href, activeAdapter.name, tags);
    });
}

// ... Keep showAddToast function exactly as it was ...
function showAddToast(title: string, url: string, platform: string, tags: string[]) {
  // Inject keyframes if not already present
  if (!document.getElementById('ar-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ar-keyframes';
    style.textContent = `
      @keyframes slideIn {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.id = "ar-toast-container"; 
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; 
    background: #18181b; color: white; padding: 16px; 
    border-radius: 12px; border: 1px solid #3f3f46; 
    box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 10000;
    font-family: sans-serif; display: flex; flex-direction: column; gap: 8px;
    width: 280px; animation: slideIn 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center">
      <span style="font-weight:bold; font-size:14px; color:#fff">Solved! 🎉</span>
      <button id="ar-close" style="background:none; border:none; color:#71717a; cursor:pointer;">✕</button>
    </div>
    <div style="font-size:12px; color:#a1a1aa; margin-bottom:4px">${title}</div>
    <div style="font-size:10px; color:#52525b; display:flex; gap:4px; flex-wrap:wrap;">
        ${tags.slice(0,3).map(t => `<span style="background:#27272a; padding:2px 4px; rounded:2px;">${t}</span>`).join('')}
    </div>
    <button id="ar-add-btn" style="
      background: #3b82f6; color: white; border: none; padding: 10px; 
      border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background 0.2s; margin-top: 4px;
    ">
      Add to Schedule (3 Days)
    </button>
  `;

  document.body.appendChild(toast);

  document.getElementById('ar-close')?.addEventListener('click', () => toast.remove());
  
  document.getElementById('ar-add-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('ar-add-btn') as HTMLButtonElement;
    btn.textContent = "Scheduled! ✅";
    btn.style.background = "#22c55e"; 

    chrome.runtime.sendMessage({
      type: "SAVE_PROBLEM_MANUAL",
      payload: { title, url, platform, tags } 
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 500);
  });
}