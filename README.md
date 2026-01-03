# AlgoRecall - Spaced Repetition for Competitive Programming

<p align="center">
  <img src="public/icons/icon128.png" alt="AlgoRecall Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Master algorithms with cross-platform spaced repetition.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#supported-platforms">Platforms</a> •
  <a href="#installation">Installation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#development">Development</a>
</p>

---

## 🧠 What is AlgoRecall?

AlgoRecall is a Chrome extension that helps you **retain algorithm knowledge** using spaced repetition. When you solve a problem on LeetCode, Codeforces, AtCoder, or CodeChef, AlgoRecall detects your success and schedules it for future review.

**Stop re-learning the same patterns.** Build lasting knowledge.

---

## ✨ Features

- 🔍 **Auto-Detection** - Automatically detects when you solve a problem
- 📅 **Smart Scheduling** - Spaced repetition intervals (3 → 7 → 21 days)
- 🏷️ **Tag Tracking** - Organizes problems by topic/tag
- 🔥 **Streak Counter** - Stay motivated with daily streaks
- 📊 **Insights Dashboard** - See your backlog by topic
- 🔎 **Search & Filter** - Find problems by name, platform, or tag

---

## 🌐 Supported Platforms

| Platform | Detection | Tags |
|----------|-----------|------|
| [LeetCode](https://leetcode.com) | ✅ | ✅ |
| [Codeforces](https://codeforces.com) | ✅ | ✅ |
| [AtCoder](https://atcoder.jp) | ✅ | ❌ |
| [CodeChef](https://codechef.com) | ✅ | ✅ |

---

## 📦 Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AlgoRecall.git
   cd AlgoRecall
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Go to `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist` folder

---

## 🔄 How It Works

### Spaced Repetition Schedule

When you solve a problem, it enters the review queue:

| Stage | Interval | Action |
|-------|----------|--------|
| 1 | 3 days | First review |
| 2 | 7 days | Second review |
| 3 | 21 days | Final review |
| ✅ | — | Mastered! Removed from queue |

### Workflow

1. **Solve** a problem on any supported platform
2. **Toast appears** → Click "Add to Schedule"
3. **Review** when due via the extension popup
4. **Mark complete** → Advances to next stage

---

## 🛠️ Development

### Tech Stack

- **React 19** + **TypeScript**
- **Vite** + **@crxjs/vite-plugin**
- **Tailwind CSS**
- **Chrome Extension Manifest V3**

### Commands

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

### Project Structure

```
src/
├── App.tsx              # Main popup UI
├── main.tsx             # React entry point
├── manifest.json        # Extension manifest
├── background/
│   └── index.ts         # Service worker (storage, scheduling)
└── content/
    ├── index.ts         # Content script (detection, toast)
    └── adapters/
        ├── base.ts      # Abstract adapter class
        ├── leetcode.ts  # LeetCode detection
        ├── codeforces.ts
        ├── atcoder.ts
        └── codechef.ts
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add support for new platforms
- Improve detection accuracy
- Enhance the UI/UX

---

## 📄 License

MIT © 2026

---

<p align="center">
  <strong>Learn once. Remember forever.</strong>
</p>
