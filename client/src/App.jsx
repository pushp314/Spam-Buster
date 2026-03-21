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
  AlertCircle
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
  const [groqKey, setGroqKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [syncLimit, setSyncLimit] = useState(15);
  const [syncProgress, setSyncProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [manualResult, setManualResult] = useState(null);
  const [isManualChecking, setIsManualChecking] = useState(false);

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
      alert('Error initiating Gmail connection');
    }
  };

  const disconnectGmail = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const updateLabel = async (id, newLabel) => {
    try {
      const { data } = await axios.patch(`${API_URL}/messages/${id}/label`, { label: newLabel });
      setMessages(prev => prev.map(m => m._id === id ? data : m));
    } catch (err) {
      alert('Failed to update label');
    }
  };

  const syncEmails = async () => {
    if (!user) return connectGmail();
    setIsSyncing(true);
    setSyncProgress(10);
    try {
      // Mock progress since we can't easily stream the 15 requests count from one route without SSE
      const interval = setInterval(() => setSyncProgress(p => p < 90 ? p + 5 : p), 500);
      
      await axios.get(`${API_URL}/gmail/sync`, { 
        params: { 
          model: selectedModel, 
          groqKey: groqKey,
          openAIKey: openAIKey,
          geminiKey: geminiKey,
          limit: syncLimit
        } 
      });
      
      clearInterval(interval);
      setSyncProgress(100);
      fetchMessages();
    } catch (err) {
      console.error('Sync error:', err);
      alert('Session expired. Please reconnect.');
      setUser(null);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 500);
    }
  };

  const manualCheck = async () => {
    if (!manualText.trim()) return;
    setIsManualChecking(true);
    try {
      const { data } = await axios.post(`${API_URL}/messages/check`, {
        text: manualText,
        model: selectedModel,
        keys: { groqKey, openAIKey, geminiKey }
      });
      setManualResult(data);
    } catch (err) {
      alert('Check failed');
    } finally {
      setIsManualChecking(false);
    }
  };

  const filteredMessages = messages
    .filter((msg) => activeTab === 'inbox' ? msg.label !== 'spam' : msg.label === 'spam')
    .filter((msg) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="gmail-container">
      {/* Header */}
      <header className="gmail-header">
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldAlert className="text-white" size={20} />
          </div>
          <span className="text-xl text-slate-700 font-black tracking-tighter">BAYES BUSTER</span>
        </div>

        <div className="search-bar">
          <Search size={20} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search mail" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Model Selector */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
            <Sparkles className="text-blue-500" size={16} />
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-wider outline-none border-none text-slate-600 cursor-pointer"
            >
              <optgroup label="Ollama (Local)">
                <option value="llama-3.3-70b-versatile">Ollama Llama 3</option>
                <option value="llama-3.1-8b-instant">Ollama 8B (Fast)</option>
              </optgroup>
              <optgroup label="Probabilistic Cloud">
                <option value="gpt-4o-mini">Bayes GPT-4o</option>
                <option value="gemini-1.5-flash-latest">Naive Flash Engine</option>
              </optgroup>
            </select>
          </div>

          <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>

          {user ? (
            <div className="flex items-center gap-3 ml-2 relative">
              <img 
                src={user.picture} 
                alt="P" 
                className="w-8 h-8 rounded-full cursor-pointer border border-slate-200 hover:ring-2 hover:ring-blue-100 transition-all" 
                referrerPolicy="no-referrer"
                onClick={() => setShowProfileDetail(!showProfileDetail)}
              />
              <AnimatePresence>
                {showProfileDetail && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDetail(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-10 right-0 bg-white shadow-2xl rounded-2xl border p-5 z-50 min-w-[240px]"
                    >
                      <div className="flex flex-col items-center text-center mb-4">
                        <img src={user.picture} alt="P" className="w-16 h-16 rounded-full border mb-2" referrerPolicy="no-referrer" />
                        <p className="font-black text-slate-800 tracking-tight">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="border-t pt-4">
                        <button 
                          onClick={disconnectGmail} 
                          className="w-full py-2.5 text-xs font-black text-white bg-slate-800 rounded-xl hover:bg-slate-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200"
                        >
                          <LogOut size={14} /> SIGN OUT
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={connectGmail} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">LINK GMAIL</button>
          )}
        </div>
      </header>

      <div className="gmail-main">
        {/* Sidebar */}
        <aside className="gmail-sidebar">
          <div className="compose-btn" onClick={syncEmails}>
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
            <span>{isSyncing ? 'Syncing...' : 'Fetch Latest'}</span>
          </div>

          <div className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <Inbox size={20} />
            <span>Inbox</span>
            <span className="ml-auto text-xs">{activeTab === 'inbox' ? filteredMessages.length : ''}</span>
          </div>

          <div className={`nav-item ${activeTab === 'spam' ? 'active' : ''}`} onClick={() => setActiveTab('spam')}>
            <Trash2 size={20} />
            <span>Spam Vault</span>
            <span className="ml-auto text-xs">{activeTab === 'spam' ? filteredMessages.length : ''}</span>
          </div>

          <div className={`nav-item ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
            <MailSearch size={20} />
            <span>Manual Check</span>
          </div>

          <div className={`nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
            <AlertCircle size={20} />
            <span>How it Works</span>
          </div>

          <div className="mt-auto p-4 border-t border-slate-200">
             <div className="flex items-center justify-between group">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Engine</span>
               <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             </div>
             <p className="text-[10px] text-slate-400 mt-1 leading-tight">Naive Bayes Active</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="gmail-content">
          {activeTab === 'about' ? (
            <div className="p-12 overflow-y-auto max-w-3xl mx-auto">
              <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">How our Bayes Classifier works.</h1>
              <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">1. Probabilistic Frequency (Naive Bayes)</h3>
                  <p>Our core algorithm uses the Naive Bayes theorem to calculate the probability of a message being spam based on token frequency. We analyze keywords like "Urgent," "Prize," and "Link" to determine the likelihood of a malicious intent.</p>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">2. Ollama Open Source LLM Hybrid</h3>
                  <p>To enhance accuracy, we use <strong>Ollama</strong> (an open-source large language model runner) to understand the semantic context of your emails. This ensures that a "Prize" mention in a professional context (like an award) isn't marked as spam.</p>
                </section>
                <section>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">3. Privacy First Architecture</h3>
                  <p>All analysis is done using stateless sessions. Your data is scanned for patterns and then discarded immediately after classification.</p>
                </section>
              </div>
              <button 
                onClick={() => setActiveTab('inbox')}
                className="mt-12 px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all"
              >
                GO TO INBOX
              </button>
            </div>
          ) : activeTab === 'manual' ? (
            <div className="p-8 h-full flex flex-col">
              <div className="bg-slate-50 border rounded-3xl p-8 flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-xl text-center">
                  <MailSearch size={48} className="text-blue-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Manual Pattern Scan</h2>
                  <p className="text-sm text-slate-500 mb-8">Paste suspected text below to test our Naive Bayes classifier.</p>
                  
                  <textarea 
                    className="w-full h-48 p-6 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm mb-6 shadow-inner"
                    placeholder="Paste message content here..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />

                  <button 
                    onClick={manualCheck}
                    disabled={isManualChecking || !manualText}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20"
                  >
                    {isManualChecking ? 'ANALYZING PATTERNS...' : 'CHECK FOR SPAM'}
                  </button>

                  <AnimatePresence>
                    {manualResult && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`mt-8 p-6 rounded-2xl border ${manualResult.label === 'spam' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                           <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${manualResult.label === 'spam' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             {manualResult.label} DETECTED
                           </span>
                           <span className="text-sm font-bold text-slate-600">{manualResult.confidence}% Confidence</span>
                        </div>
                        <p className="text-xs text-left text-slate-500 font-medium leading-relaxed italic">
                          <span className="font-bold text-slate-700">Bayes Reason:</span> {manualResult.reason}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center px-4 h-12 border-b gap-4">
                 <button onClick={fetchMessages} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Refresh list">
                   <RefreshCcw size={18} />
                 </button>
                 {isSyncing && (
                   <div className="flex-1 flex items-center gap-4 px-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-600" 
                          initial={{ width: 0 }} 
                          animate={{ width: `${syncProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-blue-600 uppercase w-12">{syncProgress}%</span>
                   </div>
                 )}
                 <button onClick={() => { if(window.confirm('Clear all labels?')) axios.delete(`${API_URL}/messages`).then(()=>setMessages([])) }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full ml-auto">
                   <Trash size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Scanning Emails...</span>
                  </div>
                ) : filteredMessages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <MailSearch size={48} className="opacity-20 mb-4" />
                     <p className="text-sm">Inbox is clean! All clear.</p>
                   </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div key={msg._id} className={`email-row ${msg.label === 'spam' ? 'spam' : ''}`} onClick={() => setSelectedMessage(msg)}>
                      <div className="flex items-center gap-3 w-[200px] shrink-0">
                        {msg.label === 'spam' ? <ShieldAlert size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-green-500" />}
                        <span className="truncate font-medium">{msg.text.split('\n\n')[0].replace('Subject: ', '').substring(0, 20)}...</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <span className="subject-text">{msg.text.split('\n\n')[0].replace('Subject: ', '')}</span>
                        <span className="snippet-text"> - {msg.snippet || msg.text.split('\n\n')[1]?.substring(0, 100)}...</span>
                      </div>

                      <div className="flex items-center gap- shrink-0">
                        <div className="flex flex-col items-end mr-4">
                           <span className={`badge ${msg.label === 'spam' ? 'badge-spam' : 'badge-safe'}`}>{Math.round(msg.confidence)}% N.B</span>
                           <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Settings Modal (Updated) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="text-slate-400" />
                Classifier Settings
              </h2>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                    Scan Depth (Results)
                    <span className="text-blue-600">{syncLimit} emails</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={syncLimit} 
                    onChange={(e) => setSyncLimit(e.target.value)} 
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-slate-400 font-bold">MIN: 5</span>
                    <span className="text-[8px] text-slate-400 font-bold">MAX: 50</span>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Auth Overrides</p>
                   <input 
                      type="password"
                      placeholder="Bayes Cloud Key"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                   />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <p className="text-[10px] text-blue-700 leading-relaxed font-bold uppercase tracking-tight">
                     Core Engine: Ollama / Naive Bayes Custom 1.0
                   </p>
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-6">
                SAVE CONFIGURATION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMessage(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b flex justify-between items-start bg-slate-50">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`badge ${selectedMessage.label === 'spam' ? 'badge-spam' : 'badge-safe'}`}>
                         {selectedMessage.label}
                       </span>
                       <span className="text-[10px] text-slate-400 font-mono">
                         ID: {selectedMessage.gmailId}
                       </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                      {selectedMessage.text.split('\n\n')[0].replace('Subject: ', '')}
                    </h2>
                 </div>
                 <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <XCircle size={24} className="text-slate-400" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Email Content Section */}
                 <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Message Snippet</label>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 leading-relaxed">
                       {selectedMessage.text.split('\n\n')[1] || "No snippet available"}
                    </div>
                 </section>

                 {/* AI Analysis Section */}
                 <section className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                       <Sparkles className="text-blue-500" size={18} />
                       <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0">AI Intelligence Log</label>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50">
                          <span className="text-xs text-slate-500">Confidence Score</span>
                          <span className="text-sm font-black text-blue-600">{Math.round(selectedMessage.confidence)}%</span>
                       </div>
                       <p className="text-sm text-slate-700 font-medium">
                          <span className="font-bold text-blue-600 mr-2">Reason:</span>
                          {selectedMessage.reason}
                       </p>
                    </div>
                 </section>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-4 border-t bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setSelectedMessage(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">
                    Close
                 </button>
                 {selectedMessage.label === 'spam' ? (
                   <button 
                     onClick={() => { updateLabel(selectedMessage._id, 'not spam'); setSelectedMessage(null); }} 
                     className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                   >
                     Move to Inbox
                   </button>
                 ) : (
                   <button 
                     onClick={() => { updateLabel(selectedMessage._id, 'spam'); setSelectedMessage(null); }} 
                     className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg"
                   >
                     Mark as Spam
                   </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .email-row:hover .group {
          opacity: 1 !important;
        }
      `}} />
    </div>
  );
}

export default App;
