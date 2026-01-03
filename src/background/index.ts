// Define Data Structures
interface ReviewItem {
  id: string;
  title: string;
  url: string;
  platform: string;
  nextReviewDate: number;
  stage: number;
  tags: string[];         
  lastReviewed: number;   
}

interface ConceptData {
  score: number; 
}

interface StorageShape {
  problems?: Record<string, ReviewItem>;
  concepts?: Record<string, ConceptData>;
  streak?: number;
  lastStudyDate?: string;
}

// Listeners
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SAVE_PROBLEM_MANUAL") {
    saveNewProblem(message.payload);
  } else if (message.type === "UPDATE_SCHEDULE") {
    // FIX: Wait for the async operation to finish before sending response
    updateProblemSchedule(message.payload.id, message.payload.action)
      .then(() => {
        sendResponse({ success: true });
      });
  }
  return true; // Keep channel open
});

// --- STREAK LOGIC ---
async function updateStreak() {
  const result = (await chrome.storage.local.get(["streak", "lastStudyDate"])) as StorageShape;
  let currentStreak = result.streak || 0;
  const lastDateStr = result.lastStudyDate || "";
  
  const today = new Date();
  const todayStr = today.toDateString(); // "Fri Dec 26 2025"
  
  // 1. Check if already studied today
  if (lastDateStr === todayStr) {
      return; // Already counted for today
  }

  // 2. Check if yesterday was the last study date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastDateStr === yesterdayStr) {
      currentStreak += 1; // Continued streak
  } else {
      currentStreak = 1; // Broken streak (or first day)
  }

  // 3. Save
  await chrome.storage.local.set({ 
      streak: currentStreak, 
      lastStudyDate: todayStr 
  });
}

// 1. Save Logic
interface SaveProblemPayload {
  title: string;
  url: string;
  platform: string;
  tags?: string[];
}

async function saveNewProblem(payload: SaveProblemPayload) {
  const { title, url, platform, tags } = payload;
  const id = url.split('?')[0]; 

  const result = (await chrome.storage.local.get(["problems", "concepts"])) as StorageShape;
  const problems = result.problems || {};

  const nextDate = Date.now() + (3 * 24 * 60 * 60 * 1000); 

  problems[id] = {
    id,
    title,
    url,
    platform,
    nextReviewDate: nextDate,
    stage: 1,
    tags: tags || [],
    lastReviewed: Date.now()
  };

  await chrome.storage.local.set({ problems });
  
  if (tags && tags.length > 0) {
    updateConceptScores(tags, result.concepts || {});
  }
  
  // UPDATE STREAK ON SAVE
  await updateStreak();
  
  console.log("Saved manually:", title);
}

// 2. Update Concept Scores
async function updateConceptScores(tags: string[], currentConcepts: Record<string, ConceptData>) {
  const concepts = { ...currentConcepts };

  tags.forEach(tag => {
    const key = tag.toLowerCase();
    if (!concepts[key]) concepts[key] = { score: 30 }; 
    concepts[key].score = Math.min(100, concepts[key].score + 5);
  });

  await chrome.storage.local.set({ concepts });
}

// 3. Schedule Logic
async function updateProblemSchedule(id: string, action: 'pass' | 'clear') {
  const result = (await chrome.storage.local.get("problems")) as StorageShape;
  const problems = result.problems || {};
  const problem = problems[id];

  if (!problem) return;

  if (action === 'clear' || problem.stage >= 3) {
    delete problems[id]; 
  } else {
    let nextInterval = 3; 
    if (problem.stage === 1) nextInterval = 7;
    else if (problem.stage === 2) nextInterval = 21;

    problem.stage += 1;
    problem.nextReviewDate = Date.now() + (nextInterval * 24 * 60 * 60 * 1000);
    problem.lastReviewed = Date.now(); 
  }

  await chrome.storage.local.set({ problems });

  // UPDATE STREAK ON REVIEW
  await updateStreak();
}