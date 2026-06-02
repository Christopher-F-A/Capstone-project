import React from 'react';

export default function Navbar({
  user,
  isDarkMode,
  setIsDarkMode,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  lavaColor,
  setLavaColor,
  onLogout,
  activeTab,
  setActiveTab
}) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all shadow-sm ${isDarkMode ? 'border-white/10 bg-slate-950/60' : 'border-black/5 bg-white/60'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">

        {/* LOGO SINISTRO */}
        <span className={`text-xl font-light tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          A<span className="text-indigo-500 font-semibold">-</span>SPACE
        </span>

        {/* SPAZIO CENTRALE (Ora vuoto e pulito) */}
        <div></div>

        {/* PROFILO UTENTE / DROPDOWN DESTRO */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-slate-700 hover:text-slate-900 hover:bg-black/10'}`}
          >
            <span>Ciao, <strong className="font-semibold">{user.username}</strong></span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isUserDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl z-20 ${isDarkMode ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-black/10 text-slate-800'}`}>

                {/* SEZIONE NAVIGAZIONE*/}
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 px-1">Navigazione</div>
                <div className="space-y-1 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('explore');
                      setIsUserDropdownOpen(false); // Chiude il menu dopo il click
                    }}
                    className={`w-full text-left px-2 py-2 text-xs rounded-lg transition font-medium flex items-center justify-between ${
                      activeTab === 'explore'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    <span>Esplora Network</span>
                    {activeTab === 'explore' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('spaces');
                      setIsUserDropdownOpen(false); // Chiude il menu dopo il click
                    }}
                    className={`w-full text-left px-2 py-2 text-xs rounded-lg transition font-medium flex items-center justify-between ${
                      activeTab === 'spaces'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-black/5'
                    }`}
                  >
                    <span>I Miei Spazi</span>
                    {activeTab === 'spaces' && <span className="text-[10px]">●</span>}
                  </button>
                </div>

                <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />

                {/* Switcher Tema Notte */}
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full flex items-center justify-between px-2 py-2 text-xs rounded-lg transition mb-2 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                >
                  <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>

                <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />

                {/* Selettore Colore Lava */}
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 px-1">Colore Lava Background</div>
                <div className="grid grid-cols-4 gap-2 mb-2 px-1">
                  {['indigo', 'fuchsia', 'emerald', 'amber'].map((color) => {
                    const colorMap = { indigo: 'bg-indigo-500', fuchsia: 'bg-fuchsia-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' };
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setLavaColor(color)}
                        className={`h-6 rounded-md transition-all relative ${colorMap[color]} ${lavaColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                        title={`Lava ${color}`}
                      />
                    );
                  })}
                </div>

                <div className={`border-t my-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />

                <button
                  type="button"
                  onClick={() => { setIsUserDropdownOpen(false); onLogout(); }}
                  className="w-full flex items-center px-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition"
                >
                  Esci dall'Account
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}