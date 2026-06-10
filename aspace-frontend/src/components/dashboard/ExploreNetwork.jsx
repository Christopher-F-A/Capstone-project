import React, { useState } from 'react';

export default function ExploreNetwork({
  associations,
  loading,
  error,
  user,
  joinedStatus,
  onBecomeMember,
  isDarkMode,
  onEnterPortal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssoc, setSelectedAssoc] = useState(null);

  // Filters records dynamically matching name or tax tracking fields[cite: 21]
  const filteredAssociations = associations.filter((assoc) => {
    const query = searchQuery.toLowerCase();
    return (
      assoc.name?.toLowerCase().includes(query) ||
      assoc.taxCodeEts?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <style>{`
        @keyframes scrollCarouselInfinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-carousel {
          animation: scrollCarouselInfinite 50s linear infinite !important;
        }
      `}</style>

      <div className="mb-8">
        <h1 className={`text-3xl font-extralight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Explore the <span className="text-indigo-500 font-normal">Network</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Search active organizations by name or tax tracking registration code.</p>
      </div>

      {loading && <p className="text-slate-400 text-sm animate-pulse">Syncing non-profit cloud ledger records...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-12 min-h-[400px]">

          {/* 🔍 STYLE GLASS INPUT SEARCH BAR */}
          <div className="relative max-w-2xl w-full mx-auto">
            <div className={`relative rounded-2xl border backdrop-blur-xl transition-all shadow-lg ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50' : 'bg-white/60 border-black/5 focus-within:border-indigo-500/50'}`}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search organizations by name or tax id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl text-sm focus:outline-none placeholder-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
              />
            </div>

            {/* LIVE SEARCH DROPDOWN OVERLAY */}
            {searchQuery && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl backdrop-blur-2xl p-2 z-30 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-slate-900/95 border-white/10 text-slate-200' : 'bg-white/95 border-black/10 text-slate-800'}`}>
                {filteredAssociations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center">No matching records found</p>
                ) : (
                  filteredAssociations.map((assoc) => (
                    <button
                      key={assoc.id}
                      onClick={() => {
                        setSelectedAssoc(assoc);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs flex justify-between items-center transition ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                    >
                      <span className="font-medium tracking-wide text-sm">{assoc.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">ID: {assoc.taxCodeEts}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 🃏 SELECTED BOARD INSPECTION CONTAINER */}
          <div className="flex justify-center pt-4">
            {selectedAssoc ? (
              <div
                style={{
                  borderColor: `${selectedAssoc.badgeBaseColor || '#6366f1'}44`,
                  boxShadow: `0 20px 40px -15px ${(selectedAssoc.badgeBaseColor || '#6366f1')}25`
                }}
                className={`max-w-2xl w-full rounded-2xl border backdrop-blur-xl flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-500 p-6 min-h-[300px] ${
                  isDarkMode ? 'bg-slate-950/50' : 'bg-white/50'
                }`}
              >
                <div className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl">
                  <img
                    src={selectedAssoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'}
                    className="w-full h-full object-cover opacity-45 scale-105"
                    alt="Cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-slate-950/60 via-slate-950/85 to-slate-950/95' : 'from-white/60 via-white/85 to-white/95'}`} />
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: selectedAssoc.badgeBaseColor || '#6366f1' }} />
                </div>

                <button
                  onClick={() => setSelectedAssoc(null)}
                  className="absolute top-5 right-5 text-white bg-black/40 hover:bg-black/60 transition p-1.5 rounded-full text-xs z-30 border border-white/10"
                >
                  ✕
                </button>

                <div className="relative z-10 pt-4 flex flex-row items-start justify-between gap-6 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-2xl font-medium tracking-wide mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssoc.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedAssoc.taxCodeEts}</p>
                    <p className={`text-base font-light leading-relaxed mt-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedAssoc.description}</p>
                  </div>

                  <div
                    style={{ borderColor: `${selectedAssoc.badgeBaseColor || '#6366f1'}55` }}
                    className="p-1 rounded-2xl bg-slate-950/50 backdrop-blur-xl border shadow-xl shrink-0"
                  >
                    <img src={selectedAssoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-16 h-16 rounded-xl object-cover" alt="Logo" />
                  </div>
                </div>

                <div className="relative z-10 p-2 pt-4">
                  {selectedAssoc.creatorUser?.id === user.id ? (
                    <span style={{ color: selectedAssoc.badgeBaseColor, backgroundColor: `${selectedAssoc.badgeBaseColor}15`, borderColor: `${selectedAssoc.badgeBaseColor}33` }} className="block text-center py-3 text-xs font-mono rounded-xl border backdrop-blur-sm font-semibold uppercase tracking-wider">You are the Administrator</span>
                  ) : joinedStatus[selectedAssoc.id] === 'PENDING' ? (
                    <span className="block text-center py-3 text-xs font-mono text-amber-500 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm font-semibold uppercase tracking-wider">Application Pending Approval</span>
                  ) : joinedStatus[selectedAssoc.id] === 'ACTIVE' ? (
                    <button
                      onClick={() => onEnterPortal(selectedAssoc)}
                      style={{ backgroundColor: selectedAssoc.badgeBaseColor || '#6366f1' }}
                      className="w-full py-3 hover:brightness-110 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg active:scale-[0.98] cursor-pointer"
                    >
                      Access Workspace Portal (Active Member)
                    </button>
                  ) : (
                    <button
                      onClick={() => onBecomeMember(selectedAssoc.id)}
                      style={{ borderColor: selectedAssoc.badgeBaseColor, color: isDarkMode ? '#fff' : '#000', backgroundColor: `${selectedAssoc.badgeBaseColor}15` }}
                      className="w-full py-3 rounded-xl border text-xs uppercase tracking-wider font-semibold transition hover:brightness-125 active:scale-[0.98] cursor-pointer"
                    >
                      Join Organization
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-12">Select an entity from the stream below or use the search bar to inspect details.</p>
            )}
          </div>

          {/* 🎡 HORIZONTAL HIGH-END INFINITE TIMELINE STREAM */}
          <div className="pt-12 w-screen relative left-1/2 right-1/2 -ml-[50vw] +mr-[50vw] overflow-hidden block clear-both">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 px-6 max-w-7xl mx-auto">
              Network Streams
            </h2>

            <div className="w-full overflow-hidden block relative">
              <div className="flex flex-row flex-nowrap w-max gap-6 animate-scroll-carousel px-6">

                {/* Track Block 1 */}
                {associations.map((assoc) => (
                  <div
                    key={`carousel-1-${assoc.id}`}
                    onClick={() => setSelectedAssoc(assoc)}
                    style={{
                      width: '400px', minWidth: '400px', flexShrink: 0,
                      borderColor: `${assoc.badgeBaseColor || '#6366f1'}25`
                    }}
                    className={`h-44 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-lg group ${
                      isDarkMode ? 'bg-slate-950/50 hover:bg-slate-900/60' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <div className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl">
                      <img src={assoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} className="w-full h-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105" alt="Cover" />
                      <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-slate-950/60 via-slate-950/75 to-slate-950/90' : 'from-white/60 via-white/75 to-white/90'}`} />
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
                    </div>

                    <div className="relative z-10 flex flex-row items-start justify-between gap-4 w-full">
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-base font-medium tracking-wide truncate mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {assoc.taxCodeEts}</p>
                      </div>

                      <div style={{ borderColor: `${assoc.badgeBaseColor || '#6366f1'}33` }} className="p-0.5 rounded-xl bg-slate-950/40 backdrop-blur-md border shadow shrink-0">
                        <img src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-9 h-9 rounded-lg object-cover" alt="Logo" />
                      </div>
                    </div>

                    <p className={`text-xs font-light line-clamp-2 leading-relaxed relative z-10 w-full ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {assoc.description || 'No description summary provided for this workspace.'}
                    </p>
                  </div>
                ))}

                {/* Track Block 2 Mirror Loop */}
                {associations.map((assoc) => (
                  <div
                    key={`carousel-2-${assoc.id}`}
                    onClick={() => setSelectedAssoc(assoc)}
                    style={{
                      width: '400px', minWidth: '400px', flexShrink: 0,
                      borderColor: `${assoc.badgeBaseColor || '#6366f1'}25`
                    }}
                    className={`h-44 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-lg group ${
                      isDarkMode ? 'bg-slate-950/50 hover:bg-slate-900/60' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <div className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl">
                      <img src={assoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} className="w-full h-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105" alt="Cover" />
                      <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-slate-950/60 via-slate-950/75 to-slate-950/90' : 'from-white/60 via-white/75 to-white/90'}`} />
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
                    </div>

                    <div className="relative z-10 flex flex-row items-start justify-between gap-4 w-full">
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-base font-medium tracking-wide truncate mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {assoc.taxCodeEts}</p>
                      </div>

                      <div style={{ borderColor: `${assoc.badgeBaseColor || '#6366f1'}33` }} className="p-0.5 rounded-xl bg-slate-950/40 backdrop-blur-md border shadow shrink-0">
                        <img src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-9 h-9 rounded-lg object-cover" alt="Logo" />
                      </div>
                    </div>

                    <p className={`text-xs font-light line-clamp-2 leading-relaxed relative z-10 w-full ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {assoc.description || 'No description summary provided for this workspace.'}
                    </p>
                  </div>
                ))}

              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}