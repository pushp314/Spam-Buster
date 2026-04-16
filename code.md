# Spam Buster — Full Codebase

> Auto-generated on 2026-04-16 17:04:49
> This file contains all code and documentation files, excluding those in `.gitignore` and binary assets.

## Table of Contents

- [`.gitignore`](#-gitignore)
- [`README.md`](#readme-md)
- [`client/.gitignore`](#client--gitignore)
- [`client/README.md`](#client-readme-md)
- [`client/eslint.config.js`](#client-eslint-config-js)
- [`client/index.html`](#client-index-html)
- [`client/package.json`](#client-package-json)
- [`client/postcss.config.js`](#client-postcss-config-js)
- [`client/src/App.css`](#client-src-app-css)
- [`client/src/App.jsx`](#client-src-app-jsx)
- [`client/src/index.css`](#client-src-index-css)
- [`client/src/main.jsx`](#client-src-main-jsx)
- [`client/tailwind.config.js`](#client-tailwind-config-js)
- [`client/vite.config.js`](#client-vite-config-js)
- [`server/index.js`](#server-index-js)
- [`server/models/Message.js`](#server-models-message-js)
- [`server/package.json`](#server-package-json)
- [`server/test_conn.js`](#server-test-conn-js)

---

## `.gitignore`

```
node_modules
.env

```

---

## `README.md`

```markdown
# Spam-Buster

```

---

## `client/.gitignore`

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

---

## `client/README.md`

```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

---

## `client/eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])

```

---

## `client/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap" rel="stylesheet">
    <title>Spam Buster | AI Spam Classifier</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

---

## `client/package.json`

```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.6",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.577.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/postcss": "^4.2.2",
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "postcss": "^8.5.8",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.1"
  }
}

```

---

## `client/postcss.config.js`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

```

---

## `client/src/App.css`

```css
:root {
  --gmail-bg: #f6f8fc;
  --gmail-header: #ffffff;
  --gmail-sidebar: #f6f8fc;
  --gmail-unread: #ffffff;
  --gmail-read: #f2f6fc;
  --gmail-hover: #eaf1fb;
  --gmail-active: #d3e3fd;
  --gmail-blue: #0b57d0;
  --gmail-red: #d93025;
  --gmail-border: #e0e0e0;
  --text-main: #1f1f1f;
  --text-secondary: #444746;
}

body {
  margin: 0;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: var(--gmail-bg);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.gmail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.gmail-header {
  background: var(--gmail-header);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid var(--gmail-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.gmail-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.gmail-sidebar {
  width: 256px;
  background: var(--gmail-sidebar);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gmail-content {
  flex: 1;
  background: white;
  margin: 16px;
  margin-left: 0;
  border-radius: 16px;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,0.301), 0 1px 3px 1px rgba(60,64,67,0.149);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  height: 32px;
  border-radius: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--gmail-hover);
}

.nav-item.active {
  background-color: var(--gmail-active);
  color: var(--gmail-blue);
  font-weight: 700;
}

.email-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: box-shadow 0.1s;
  font-size: 14px;
}

.email-row:hover {
  box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
  z-index: 10;
}

.email-row.spam {
  background-color: #fff8f8;
}

.email-row.unread {
  font-weight: 700;
}

.subject-text {
  color: var(--text-main);
  margin-right: 8px;
}

.snippet-text {
  color: var(--text-secondary);
  font-weight: 400;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 800;
}

.badge-spam {
  background: #fce8e6;
  color: #d93025;
}

.badge-safe {
  background: #e6f4ea;
  color: #1e8e3e;
}

.compose-btn {
  background: #c2e7ff;
  color: #001d35;
  padding: 18px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  margin: 8px 0 16px 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.compose-btn:hover {
  box-shadow: 0 1px 3px 0 rgba(60,64,67,0.302), 0 4px 8px 3px rgba(60,64,67,0.149);
}

.search-bar {
  flex: 1;
  max-width: 720px;
  background: #f1f3f4;
  border-radius: 8px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: background 0.2s, box-shadow 0.2s;
}

.search-bar:focus-within {
  background: white;
  box-shadow: 0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73,0.15);
}

.search-input {
  background: transparent;
  border: none;
  flex: 1;
  padding: 12px;
  font-size: 16px;
  outline: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

progress[value] {
  appearance: none;
  width: 100%;
  height: 6px;
}

progress[value]::-webkit-progress-bar {
  background-color: #f1f5f9;
  border-radius: 10px;
}

progress[value]::-webkit-progress-value {
  background-color: #2563eb;
  border-radius: 10px;
}

```

---

## `client/src/App.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Inbox, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Loader2, 
  Mail, 
  MailWarning, 
  Trash, 
  Clock, 
  RefreshCcw,
  Sparkles,
  Link2,
  Lock,
  MailSearch,
  CheckCircle,
  XCircle,
  LogOut,
  User as UserIcon,
  Settings,
  Plus,
  AlertCircle,
  Calculator,
  Cpu,
  Briefcase,
  FlaskConical,
  Layers,
  CheckSquare,
  Square,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = 'http://localhost:5001/api';
axios.defaults.withCredentials = true;

function App() {
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash-latest');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent API Keys
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('sb_groq_key') || '');
  const [openAIKey, setOpenAIKey] = useState(() => localStorage.getItem('sb_openai_key') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('sb_gemini_key') || '');
  
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [syncLimit, setSyncLimit] = useState(15);
  const [syncProgress, setSyncProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [manualResult, setManualResult] = useState(null);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showBulkDeptDropdown, setShowBulkDeptDropdown] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem('sb_groq_key', groqKey);
    localStorage.setItem('sb_openai_key', openAIKey);
    localStorage.setItem('sb_gemini_key', geminiKey);
  }, [groqKey, openAIKey, geminiKey]);

  useEffect(() => {
    checkConnection();
    fetchMessages();
  }, []);

  const checkConnection = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/status`);
      if (data.connected) setUser(data.user);
    } catch (err) {
      console.error('⚠️ Server connection failed.');
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectGmail = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/google/url`);
      window.location.href = data.url;
    } catch (err) {
      addToast('Error initiating Gmail connection', 'error');
    }
  };

  const disconnectGmail = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
      addToast('Disconnected from Gmail');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const updateLabel = async (id, newLabel) => {
    try {
      const { data } = await axios.patch(`${API_URL}/messages/${id}/label`, { label: newLabel });
      setMessages(prev => prev.map(m => m._id === id ? data : m));
      addToast(`Moved to ${newLabel === 'spam' ? 'Spam' : 'Inbox'}`);
    } catch (err) {
      if (err.response?.status === 429) setShowLimitModal(true);
      else addToast('Update failed', 'error');
    }
  };

  const updateDepartment = async (id, newDept) => {
    try {
      const { data } = await axios.patch(`${API_URL}/messages/${id}/department`, { department: newDept });
      setMessages(prev => prev.map(m => m._id === id ? data : m));
      addToast(`Categorized as ${newDept.replace(' department', '')}`);
      if (selectedMessage?._id === id) setSelectedMessage(data);
    } catch (err) {
      if (err.response?.status === 429) setShowLimitModal(true);
      else addToast('Update failed', 'error');
    }
  };

  const bulkUpdate = async (updates) => {
    if (selectedMessageIds.length === 0) return;
    try {
      const { data } = await axios.patch(`${API_URL}/messages/bulk/update`, {
        ids: selectedMessageIds,
        ...updates
      });
      setMessages(prev => prev.map(m => {
        const updated = data.find(u => u._id === m._id);
        return updated || m;
      }));
      addToast(`Bulk updated ${selectedMessageIds.length} messages`);
      setSelectedMessageIds([]);
      setShowBulkDeptDropdown(false);
    } catch (err) {
      if (err.response?.status === 429) setShowLimitModal(true);
      else addToast('Bulk update failed', 'error');
    }
  };

  const syncEmails = async () => {
    if (!user) return connectGmail();
    setIsSyncing(true);
    setSyncProgress(10);
    try {
      const interval = setInterval(() => setSyncProgress(p => p < 90 ? p + 5 : p), 500);
      await axios.get(`${API_URL}/gmail/sync`, { 
        params: { 
          model: selectedModel, 
          groqKey, openAIKey, geminiKey,
          limit: syncLimit
        } 
      });
      clearInterval(interval);
      setSyncProgress(100);
      addToast('Inbox synced successfully');
      fetchMessages();
    } catch (err) {
      if (err.response?.status === 429) setShowLimitModal(true);
      else addToast('Sync failed', 'error');
    } finally {
      setTimeout(() => { setIsSyncing(false); setSyncProgress(0); }, 500);
    }
  };

  const manualCheck = async () => {
    if (!manualText.trim()) return;
    setIsManualChecking(true);
    try {
      const { data } = await axios.post(`${API_URL}/messages/check`, {
        text: manualText, model: selectedModel, keys: { groqKey, openAIKey, geminiKey }
      });
      setManualResult(data);
      addToast('Analysis complete');
    } catch (err) {
      addToast('Analysis failed', 'error');
    } finally {
      setIsManualChecking(false);
    }
  };

  const filteredMessages = messages
    .filter((msg) => activeTab === 'inbox' ? msg.label !== 'spam' : msg.label === 'spam')
    .filter((msg) => selectedDept === 'All' || msg.department === selectedDept)
    .filter((msg) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSelectAll = () => {
    setSelectedMessageIds(selectedMessageIds.length === filteredMessages.length ? [] : filteredMessages.map(m => m._id));
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedMessageIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const departments = ['Maths department', 'CS department', 'Management department', 'Science department', 'Other'];

  return (
    <div className="gmail-container">
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${t.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-50 text-red-600'}`}>
              {t.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold uppercase tracking-tight">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="gmail-header">
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="bg-red-600 p-1.5 rounded-lg"><ShieldAlert className="text-white" size={20} /></div>
          <span className="text-xl text-slate-700 font-black tracking-tighter uppercase">Spam Buster</span>
        </div>
        <div className="search-bar">
          <Search size={20} className="text-slate-500" />
          <input type="text" placeholder="Search mail" className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
            <Sparkles className="text-blue-500" size={16} />
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-wider outline-none border-none text-slate-600 cursor-pointer">
              <option value="llama-3.3-70b-versatile">Ollama Llama 3</option>
              <option value="llama-3.1-8b-instant">Ollama 8B (Fast)</option>
              <option value="gpt-4o-mini">Bayes GPT-4o</option>
              <option value="gemini-1.5-flash-latest">Naive Flash Engine</option>
            </select>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Settings size={20} /></button>
          {user ? (
            <div className="relative">
              <img src={user.picture} alt="P" className="w-8 h-8 rounded-full cursor-pointer" onClick={() => setShowProfileDetail(!showProfileDetail)} referrerPolicy="no-referrer" />
              <AnimatePresence>
                {showProfileDetail && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDetail(false)} />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-10 right-0 bg-white shadow-2xl rounded-2xl border p-5 z-50 min-w-[240px]">
                       <div className="text-center mb-4">
                          <img src={user.picture} className="w-16 h-16 rounded-full mx-auto mb-2" referrerPolicy="no-referrer" />
                          <p className="font-black text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                       </div>
                       <button onClick={disconnectGmail} className="w-full py-2.5 text-xs font-black text-white bg-slate-800 rounded-xl hover:bg-slate-700 flex items-center justify-center gap-2 transition-all">
                          <LogOut size={14} /> SIGN OUT
                       </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : <button onClick={connectGmail} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">LINK GMAIL</button>}
        </div>
      </header>

      <div className="gmail-main">
        {/* Sidebar */}
        <aside className="gmail-sidebar">
          <div className="compose-btn" onClick={syncEmails}>{isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}<span>Sync Latest</span></div>
          <div className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}><Inbox size={20} /><span>Inbox</span></div>
          <div className={`nav-item ${activeTab === 'spam' ? 'active' : ''}`} onClick={() => setActiveTab('spam')}><Trash2 size={20} /><span>Spam Vault</span></div>
          <div className={`nav-item ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}><MailSearch size={20} /><span>Manual Scan</span></div>
          <div className={`nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}><Info size={20} /><span>Maths Guide</span></div>
          {(activeTab === 'inbox' || activeTab === 'spam') && (
            <div className="mt-6">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Departments</p>
              <div className={`nav-item ${selectedDept === 'All' ? 'active' : ''}`} onClick={() => setSelectedDept('All')}><Layers size={18} /><span>All Mail</span></div>
              {departments.map(dept => (
                <div key={dept} className={`nav-item ${selectedDept === dept ? 'active' : ''}`} onClick={() => setSelectedDept(dept)}>
                  {dept.includes('Maths') && <Calculator size={18} />}{dept.includes('CS') && <Cpu size={18} />}{dept.includes('Management') && <Briefcase size={18} />}{dept.includes('Science') && <FlaskConical size={18} />}{dept === 'Other' && <Layers size={18} />}
                  <span>{dept.replace(' department', '')}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="gmail-content">
          {activeTab === 'about' ? (
            <div className="p-12 overflow-y-auto max-w-3xl mx-auto">
              <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">How our Bayes Classifier works.</h1>
              <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
                <section><h3 className="text-lg font-bold text-slate-700 mb-2">1. Probabilistic Frequency (Naive Bayes)</h3><p>Our algorithm uses Naive Bayes theorem to calculate the probability of a message being spam based on token frequency. We analyze keywords like "Urgent," "Prize," and "Link" to determine malicious intent.</p></section>
                <section><h3 className="text-lg font-bold text-slate-700 mb-2">2. LLM Hybrid</h3><p>To enhance accuracy, we use advanced models like Gemini and Llama-3 to understand the semantic context, ensuring "Urgent" tasks from professors aren't marked as spam.</p></section>
                <section><h3 className="text-lg font-bold text-slate-700 mb-2">3. Stateless Privacy</h3><p>Your data is scanned in stateless sessions and discarded immediately after classification.</p></section>
              </div>
            </div>
          ) : activeTab === 'manual' ? (
            <div className="p-8 h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-xl text-center">
                 <MailSearch size={48} className="text-blue-600 mx-auto mb-6" />
                 <h2 className="text-2xl font-black text-slate-800 mb-8">Manual Pattern Scan</h2>
                 <textarea className="w-full h-48 p-6 bg-slate-50 border rounded-2xl mb-6 outline-none focus:border-blue-500" placeholder="Paste suspected text..." value={manualText} onChange={(e) => setManualText(e.target.value)} />
                 <button onClick={manualCheck} disabled={isManualChecking || !manualText} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20">{isManualChecking ? 'ANALYZING...' : 'CHECK FOR SPAM'}</button>
                 {manualResult && (
                   <div className={`mt-8 p-6 rounded-2xl border ${manualResult.label === 'spam' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                      <div className="flex justify-between items-center mb-4">
                         <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${manualResult.label === 'spam' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{manualResult.label}</span>
                         <span className="text-sm font-bold">{manualResult.confidence}% CONFIDENCE</span>
                      </div>
                      <p className="text-xs text-left italic"><strong>Reason:</strong> {manualResult.reason}</p>
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center px-4 h-12 border-b bg-white sticky top-0 z-[40]">
                 <button onClick={toggleSelectAll} className="p-2 text-slate-400 mr-2">{selectedMessageIds.length === filteredMessages.length && filteredMessages.length > 0 ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}</button>
                 <AnimatePresence mode="wait">
                    {selectedMessageIds.length > 0 ? (
                      <motion.div key="bulk" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-blue-600">{selectedMessageIds.length} Selected</span>
                        <button onClick={() => bulkUpdate({ label: activeTab === 'inbox' ? 'spam' : 'not spam' })} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">{activeTab === 'inbox' ? <Trash2 size={18} /> : <Inbox size={18} />}</button>
                        <div className="relative">
                           <button onClick={() => setShowBulkDeptDropdown(!showBulkDeptDropdown)} className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">Categorize <ChevronDown size={14} /></button>
                           {showBulkDeptDropdown && (
                             <div className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border p-2 z-[100] min-w-[180px]">
                               {departments.map(dept => <button key={dept} onClick={() => bulkUpdate({ department: dept })} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl">{dept.replace(' department', '')}</button>)}
                             </div>
                           )}
                        </div>
                        <button onClick={() => setSelectedMessageIds([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">CLEAR</button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button onClick={fetchMessages} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><RefreshCcw size={18} /></button>
                        {isSyncing && <div className="flex items-center gap-2"><div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-600" animate={{ width: `${syncProgress}%` }} /></div><span className="text-[10px] font-bold">{syncProgress}%</span></div>}
                      </div>
                    )}
                 </AnimatePresence>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30"><Loader2 size={32} className="animate-spin text-blue-600 mb-2" /><span className="text-xs font-bold uppercase tracking-widest">Scanning...</span></div>
                ) : (
                  filteredMessages.map(msg => (
                    <div key={msg._id} className={`email-row group ${msg.label === 'spam' ? 'spam' : ''} ${selectedMessageIds.includes(msg._id) ? 'bg-blue-50' : ''}`} onClick={() => setSelectedMessage(msg)}>
                      <div className="flex items-center gap-3 w-48 shrink-0">
                         <button onClick={(e) => toggleSelect(e, msg._id)} className={`p-1 ${selectedMessageIds.includes(msg._id) ? 'text-blue-600' : 'text-slate-300'}`}>{selectedMessageIds.includes(msg._id) ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                         {msg.label === 'spam' ? <ShieldAlert size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-green-500" />}
                         <span className="truncate text-xs font-bold">{msg.text.split('\n\n')[0].replace('Subject: ', '').substring(0, 15)}</span>
                      </div>
                      <div className="flex-1 min-w-0 px-4 truncate"><span className="text-slate-800 font-medium">{msg.text.split('\n\n')[0].replace('Subject: ', '')}</span><span className="text-slate-400"> - {msg.snippet || msg.text.split('\n\n')[1]?.substring(0, 80)}...</span></div>
                      <div className="hidden group-hover:flex items-center gap-1 mr-4">
                        <button onClick={(e) => { e.stopPropagation(); updateLabel(msg._id, msg.label === 'spam' ? 'not spam' : 'spam'); }} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500">{msg.label === 'spam' ? <Inbox size={14} /> : <Trash2 size={14} />}</button>
                        <div className="relative group/dept">
                           <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"><Briefcase size={14} /></button>
                           <div className="absolute right-0 bottom-full mb-2 hidden group-hover/dept:block bg-white shadow-xl border rounded-xl p-1 z-[60] min-w-[120px]">
                              {departments.map(dept => <button key={dept} onClick={(e) => { e.stopPropagation(); updateDepartment(msg._id, dept); }} className="w-full text-left px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50">{dept.replace(' department', '')}</button>)}
                           </div>
                        </div>
                      </div>
                      <div className="w-32 text-right text-[10px]"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 mr-2">{msg.department}</span><span className="font-bold text-slate-400">{Math.round(msg.confidence)}%</span></div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-2xl p-8 border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20} /> Settings</h2>
              <div className="space-y-6">
                <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Scan Depth: {syncLimit} emails</label><input type="range" min="5" max="50" value={syncLimit} onChange={(e) => setSyncLimit(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-600" /></div>
                <div className="space-y-3">
                  <input type="password" placeholder="Gemini Key" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm" />
                  <input type="password" placeholder="Groq Key" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm" />
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl mt-6">SAVE CONFIG</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMessage(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b flex justify-between bg-slate-50">
                 <div><span className={`badge ${selectedMessage.label === 'spam' ? 'badge-spam' : 'badge-safe'} mb-2 inline-block`}>{selectedMessage.label}</span><h2 className="text-xl font-bold">{selectedMessage.text.split('\n\n')[0].replace('Subject: ', '')}</h2></div>
                 <button onClick={() => setSelectedMessage(null)}><XCircle size={24} className="text-slate-400" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                 <section><label className="text-[10px] font-black uppercase text-slate-400">Content</label><div className="p-6 bg-slate-50 border rounded-2xl italic text-sm text-slate-600">{selectedMessage.text.split('\n\n')[1]}</div></section>
                 <section className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4"><Sparkles className="text-blue-500" size={16} /><label className="text-[10px] font-black uppercase text-blue-500">AI Log</label></div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-sm font-bold"><span>Confidence</span><span className="text-blue-600">{Math.round(selectedMessage.confidence)}%</span></div>
                       <p className="text-sm text-slate-600"><strong>Reason:</strong> {selectedMessage.reason}</p>
                       <div className="mt-4 pt-4 border-t border-blue-100 flex flex-wrap gap-2">
                          {departments.map(dept => <button key={dept} onClick={() => updateDepartment(selectedMessage._id, dept)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${selectedMessage.department === dept ? 'bg-blue-600 text-white' : 'bg-white hover:border-blue-400'}`}>{dept.replace(' department', '')}</button>)}
                       </div>
                    </div>
                 </section>
              </div>
              <div className="px-8 py-4 border-t bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => selectedMessage.label === 'spam' ? updateLabel(selectedMessage._id, 'not spam') : updateLabel(selectedMessage._id, 'spam')} className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl ${selectedMessage.label === 'spam' ? 'bg-blue-600' : 'bg-red-600'}`}>{selectedMessage.label === 'spam' ? 'Move to Inbox' : 'Mark as Spam'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

```

---

## `client/src/index.css`

```css
@import "tailwindcss";

:root {
  font-family: 'Outfit', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #0f172a;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
}

```

---

## `client/src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

---

## `client/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

---

## `client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})

```

---

## `server/index.js`

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');
const cookieSession = require('cookie-session');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spam-buster', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Let it continue but it might fail on requests
  }
};
connectDB();

// Ollama / Naive Bayes AI Configs
// Internally we use the keys for processing, but UI will reflect custom open-source logic
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google OAuth Debugging
console.log('--- OAuth Configuration ---');
console.log('Client ID length:', process.env.GOOGLE_CLIENT_ID?.length || 0);
console.log('Client Secret length:', process.env.GOOGLE_CLIENT_SECRET?.length || 0);
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ CRITICAL ERROR: Google OAuth credentials are missing in .env!');
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// --- ROUTES ---

// 0. Debug Route (Verify credentials)
app.get('/api/auth/debug', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 5)}...` : 'not set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'is set' : 'not set',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'not set'
  });
});

// 1. Get Auth URL
app.get('/api/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ url });
});

// 2. Auth Callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    res.redirect('http://localhost:5173/?connected=true');
  } catch (err) {
    console.error('OAuth Error:', err);
    res.redirect('http://localhost:5173/?error=auth_failed');
  }
});

// 3. User Status & Profile Info
app.get('/api/auth/status', async (req, res) => {
  if (!req.session.tokens) {
    return res.json({ connected: false });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    res.json({ 
      connected: true, 
      user: {
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture
      }
    });
  } catch (err) {
    req.session = null; // Token likely expired
    res.json({ connected: false });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out' });
});

// --- CLASSIFICATION HELPER (Powered by Ollama / Naive Bayes Hybrid) ---
const classifyMessage = async (subject, snippet, selectedModel, keys = {}) => {
  const modelId = selectedModel || 'llama-3.3-70b-versatile'; // Default to open LLM style
  const text = `Subject: ${subject}\nSnippet: ${snippet}`;
  
  // Custom Naive Bayes style prompt with Few-Shot examples
  const prompt = `Act as a Naive Bayes Classifier. Classify based on word frequency and spam patterns:
  
  EXAMPLES:
  1. "Your exam schedule for Advanced Calculus is attached" -> Label: "not spam", Dept: "Maths department"
  2. "New Python internship opening at Tech Corp" -> Label: "not spam", Dept: "CS department"
  3. "Winning lottery ticket #4920 inside! Click to claim $50k" -> Label: "spam", Dept: "Other"
  4. "Quarterly budget meeting moved to Tuesday" -> Label: "not spam", Dept: "Management department"
  
  CRITERIA:
  - SPAM: High frequency of tokens like "Free", "Lottery", "Urgent", "Click here", "Action required".
  - NOT SPAM: Natural conversation, academic or professional patterns.

  Strict JSON output only:
  {
    "label": "spam" or "not spam",
    "department": "Maths department" | "CS department" | "Management department" | "Science department" | "Other",
    "confidence": number,
    "reason": "Explain using probability patterns and why it belongs to this department"
  }

  DATA:
  "${text}"`;

  try {
    let responseText;
    // We route to Groq/Gemini/OpenAI internally but present as "Ollama/NB" in UI
    if (modelId.startsWith('gpt')) {
      const apiKey = keys.openAIKey || process.env.OPENAI_API_KEY;
      const client = new OpenAI({ apiKey });
      const comp = await client.chat.completions.create({ model: modelId, messages: [{role:'user', content:prompt}], response_format: {type:'json_object'} });
      responseText = comp.choices[0].message.content;
    } else if (modelId.startsWith('llama')) {
      const apiKey = keys.groqKey || process.env.GROQ_API_KEY;
      const groqInstance = new Groq({ apiKey });
      const comp = await groqInstance.chat.completions.create({ model: modelId, messages: [{role:'user', content:prompt}], response_format: {type:'json_object'} });
      responseText = comp.choices[0].message.content;
    } else {
      const apiKey = keys.geminiKey || process.env.GEMINI_API_KEY;
      const genAIInstance = new GoogleGenerativeAI(apiKey);
      const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent(prompt);
      responseText = await res.response.text();
    }

    console.log(`🧠 Smart Classifier (${modelId}):`, responseText);
    const cleanedJson = responseText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanedJson);
    
    // Normalize department to match enum
    const validDepts = ['Maths department', 'CS department', 'Management department', 'Science department'];
    const foundDept = validDepts.find(d => 
      result.department?.toLowerCase().includes(d.split(' ')[0].toLowerCase())
    );
    
    result.department = foundDept || 'Other';
    
    return result;
  } catch (err) {
    console.error(`❌ Bayes analysis error:`, err.message);
    return { label: 'not spam', confidence: 50, reason: 'Bayesian pattern recognition failed' };
  }
};

app.get('/api/gmail/sync', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Gmail not connected' });
  const { model: selectedModel, groqKey, geminiKey, openAIKey, limit = 15 } = req.query;

  oauth2Client.setCredentials(req.session.tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({ userId: 'me', maxResults: parseInt(limit) });
    const messages = listRes.data.messages || [];
    
    const results = [];
    for (const msg of messages) {
      const existing = await Message.findOne({ gmailId: msg.id });
      if (existing) continue;

      const detailRes = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      const { snippet, payload } = detailRes.data;
      const headers = payload.headers;
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';

      const classification = await classifyMessage(subject, snippet, selectedModel, { groqKey, geminiKey, openAIKey });
      const newMessage = new Message({
        text: `Subject: ${subject}\n\n${snippet}`,
        label: classification.label.toLowerCase(),
        department: classification.department || 'Other',
        confidence: classification.confidence,
        reason: classification.reason,
        gmailId: msg.id,
      });

      await newMessage.save();
      results.push(newMessage);
    }
    res.json({ count: results.length, newMessages: results });
  } catch (err) {
    console.error('❌ Sync error:', err);
    // Check for Google API limit or Quota error
    if (err.errors?.[0]?.reason === 'rateLimitExceeded' || err.code === 429) {
      return res.status(429).json({ error: 'Quota exceeded', message: 'Gmail API limit reached. Try again later.' });
    }
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// 7. Manual Text Check
app.post('/api/messages/check', async (req, res) => {
  const { text, model, keys } = req.body;
  try {
    const classification = await classifyMessage('Manual Entry', text, model, keys);
    res.json(classification);
  } catch (err) {
    res.status(500).json({ error: 'Manual check failed' });
  }
});

// 6. Update Message Label (Manual Correction)
app.patch('/api/messages/:id/label', async (req, res) => {
  const { label } = req.body;
  if (!['spam', 'not spam'].includes(label)) return res.status(400).json({ error: 'Invalid label' });

  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { label, confidence: 100, reason: 'Manually corrected by user' }, 
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update label' });
  }
});

// 8. Update Message Department
app.patch('/api/messages/:id/department', async (req, res) => {
  const { department } = req.body;
  const validDepts = ['Maths department', 'CS department', 'Management department', 'Science department', 'Other'];
  
  if (!validDepts.includes(department)) {
    return res.status(400).json({ error: 'Invalid department' });
  }

  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { department }, 
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// 9. Bulk Update Messages (Label or Department)
app.patch('/api/messages/bulk/update', async (req, res) => {
  const { ids, label, department } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs' });

  const updateData = {};
  if (label && ['spam', 'not spam'].includes(label)) {
    updateData.label = label;
    updateData.confidence = 100;
    updateData.reason = 'Bulk manual correction';
  }
  if (department) {
    const validDepts = ['Maths department', 'CS department', 'Management department', 'Science department', 'Other'];
    if (validDepts.includes(department)) {
      updateData.department = department;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }

  try {
    await Message.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );
    // Fetch updated messages to return
    const updatedMessages = await Message.find({ _id: { $in: ids } });
    res.json(updatedMessages);
  } catch (err) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: 'Failed', message: err.message });
  }
});

app.delete('/api/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  console.log('✅ Ready to process requests');
});

```

---

## `server/models/Message.js`

```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    enum: ['spam', 'not spam'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  gmailId: {
    type: String,
    unique: true,
  },
  department: {
    type: String,
    enum: ['Maths department', 'CS department', 'Management department', 'Science department', 'Other'],
    default: 'Other',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);

```

---

## `server/package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "axios": "^1.13.6",
    "cookie-session": "^2.1.1",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "googleapis": "^171.4.0",
    "groq-sdk": "^1.1.1",
    "mongoose": "^9.3.1",
    "nodemon": "^3.1.14",
    "openai": "^6.32.0",
    "path": "^0.12.7"
  }
}

```

---

## `server/test_conn.js`

```javascript

require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

```

---

