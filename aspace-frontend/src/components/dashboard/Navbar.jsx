import React from 'react';

export default function Navbar({
  user,
  isDarkMode,
  setIsDarkMode,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  onLogout,
  activeTab,
  setActiveTab
}) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-3xl transition-all shadow-sm ${isDarkMode ? 'border-white/10 bg-slate-950/15' : 'border-black/5 bg-white/15'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        <div className="flex items-center h-8 cursor-pointer select-none" onClick={() => setActiveTab('explore')}>
                  <img
                    src="/A-SPACE_.png"
                    alt="A-SPACE Logo"
                    className={`h-7 w-auto object-contain transition-all`}
                  />
                </div>
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-slate-700 hover:text-slate-900 hover:bg-black/10'}`}
          >
            <span>Hello, <strong className="font-semibold">{user.username}</strong></span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl z-20 ${isDarkMode ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-black/10 text-slate-800'}`}>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 px-1">Navigation</div>
                <div className="space-y-1 mb-2">
                  <button onClick={() => { setActiveTab('explore'); setIsUserDropdownOpen(false); }} className={`w-full text-left px-2 py-2 text-xs rounded-lg transition font-medium flex items-center justify-between ${activeTab === 'explore' ? 'bg-indigo-500 text-white shadow-md' : 'hover:bg-white/5'}`}>
                    <span>Explore Network</span>
                  </button>
                  <button onClick={() => { setActiveTab('spaces'); setIsUserDropdownOpen(false); }} className={`w-full text-left px-2 py-2 text-xs rounded-lg transition font-medium flex items-center justify-between ${activeTab === 'spaces' ? 'bg-indigo-500 text-white shadow-md' : 'hover:bg-white/5'}`}>
                    <span>My Spaces</span>
                  </button>
                </div>
                <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between px-2 py-2 text-xs rounded-lg transition hover:bg-white/5">
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />
                <button onClick={() => { setIsUserDropdownOpen(false); onLogout(); }} className="w-full flex items-center px-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}