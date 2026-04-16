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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
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
  const [syncLimit, setSyncLimit] = useState(50);
  const [syncProgress, setSyncProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [manualResult, setManualResult] = useState(null);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showBulkDeptDropdown, setShowBulkDeptDropdown] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showNoSpamModal, setShowNoSpamModal] = useState(false);

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
      const { data } = await axios.get(`${API_URL}/gmail/sync`, { 
        params: { 
          model: selectedModel, 
          groqKey, openAIKey, geminiKey,
          limit: syncLimit
        } 
      });

      if (data.success) {
        addToast('Sync job added to queue');
        let progress = 10;
        const interval = setInterval(async () => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(interval);
            setIsSyncing(false);
            setSyncProgress(0);
            
            const { data: updatedMessages } = await axios.get(`${API_URL}/messages`);
            setMessages(updatedMessages);
            
            const spamRecords = updatedMessages.filter(m => m.label === 'spam');
            if (spamRecords.length === 0) {
              setShowNoSpamModal(true);
            } else {
              addToast(`Sync complete. Found ${spamRecords.length} spam messages.`);
            }
          } else {
            setSyncProgress(progress);
          }
        }, 800);
      }
    } catch (err) {
      if (err.response?.status === 429) setShowLimitModal(true);
      else addToast('Queueing sync failed', 'error');
      setIsSyncing(false);
      setSyncProgress(0);
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
    .filter((msg) => {
      // If user is in the Spam Vault tab, ALWAYS show only spam
      if (activeTab === 'spam') return msg.label === 'spam';
      // If user is in Manual Scan or Maths Guide, navigation handles it, 
      // but for email tabs:
      if (activeTab === 'inbox') {
        if (selectedDept === 'All') return true; // "All Mail" shows everything
        return msg.label !== 'spam'; // Other inbox categories hide spam by default
      }
      return true;
    })
    .filter((msg) => selectedDept === 'All' || msg.department === selectedDept)
    .filter((msg) => msg.text?.toLowerCase().includes(searchQuery.toLowerCase()));

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
                         <span className="truncate text-xs font-bold">{msg.text?.split('\n\n')?.[0]?.replace('Subject: ', '')?.substring(0, 15) || 'No Subject'}</span>
                      </div>
                      <div className="flex-1 min-w-0 px-4 truncate"><span className="text-slate-800 font-medium">{msg.text?.split('\n\n')?.[0]?.replace('Subject: ', '') || 'Untitled'}</span><span className="text-slate-400"> - {msg.snippet || msg.text?.split('\n\n')?.[1]?.substring(0, 80) || 'No content preview'}...</span></div>
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
                <div><label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Scan Depth: {syncLimit} emails</label><input type="range" min="5" max="500" value={syncLimit} onChange={(e) => setSyncLimit(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-600" /></div>
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
                 <div><span className={`badge ${selectedMessage.label === 'spam' ? 'badge-spam' : 'badge-safe'} mb-2 inline-block`}>{selectedMessage.label}</span><h2 className="text-xl font-bold">{selectedMessage.text?.split('\n\n')?.[0]?.replace('Subject: ', '') || 'No Subject'}</h2></div>
                 <button onClick={() => setSelectedMessage(null)}><XCircle size={24} className="text-slate-400" /></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                 <section><label className="text-[10px] font-black uppercase text-slate-400">Content</label><div className="p-6 bg-slate-50 border rounded-2xl italic text-sm text-slate-600">{selectedMessage.text?.split('\n\n')?.[1] || 'No content'}</div></section>
                 <section className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4"><Sparkles className="text-blue-500" size={16} /><label className="text-[10px] font-black uppercase text-blue-500">AI Log</label></div>
                    <div className="space-y-4">
                       <div className="flex justify-between text-sm font-bold"><span>Confidence</span><span className="text-blue-600">{Math.round(selectedMessage?.confidence || 0)}%</span></div>
                       <p className="text-sm text-slate-600"><strong>Reason:</strong> {selectedMessage?.reason || 'No analysis reason provided'}</p>
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

      <AnimatePresence>
        {showNoSpamModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNoSpamModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[32px] p-10 text-center shadow-2xl border border-slate-100">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-green-500" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">Vault secure.</h3>
               <p className="text-slate-500 text-sm mb-8 leading-relaxed">Our Bayesian engine scanned your inbox and found <b>zero</b> spam patterns. You're all clear!</p>
               <button onClick={() => setShowNoSpamModal(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">GREAT NEWS</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
