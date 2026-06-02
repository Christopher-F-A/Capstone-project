import React, { useState } from 'react';

export default function ExploreNetwork({
  associations,
  loading,
  error,
  user,
  joinedStatus,
  onBecomeMember,
  isDarkMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssoc, setSelectedAssoc] = useState(null);

  // Filtra le associazioni in base al nome o al codice fiscale
  const filteredAssociations = associations.filter((assoc) => {
    const query = searchQuery.toLowerCase();
    return (
      assoc.name?.toLowerCase().includes(query) ||
      assoc.taxCodeEts?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Iniettiamo i keyframes direttamente qui per riattivare lo scorrimento all'istante */}
      <style>{`
        @keyframes scrollCarouselInfinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-carousel {
          animation: scrollCarouselInfinite 30s linear infinite !important;
        }
        .animate-scroll-carousel:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="mb-8">
        <h1 className={`text-3xl font-extralight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Trova la tua <span className="text-indigo-500 font-normal">Associazione</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Cerca un ente nel network per nome o codice fiscale.</p>
      </div>

      {loading && <p className="text-slate-400 text-sm animate-pulse">Caricamento in corso...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-12 min-h-[400px]">

          {/* 🔍 BARRA DI RICERCA STYLE GLASS */}
          <div className="relative max-w-2xl w-full mx-auto">
            <div className={`relative rounded-2xl border backdrop-blur-xl transition-all shadow-lg ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50' : 'bg-white/60 border-black/5 focus-within:border-indigo-500/50'}`}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cerca per nome o codice fiscale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl text-sm focus:outline-none text-slate-200 placeholder-slate-400"
              />
            </div>

            {/* RISULTATI DELLA RICERCA */}
            {searchQuery && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl backdrop-blur-2xl p-2 z-30 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-slate-900/95 border-white/10 text-slate-200' : 'bg-white/95 border-black/10 text-slate-800'}`}>
                {filteredAssociations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center">Nessun risultato trovato</p>
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
                      <span className="font-mono text-[10px] text-slate-500">CF: {assoc.taxCodeEts}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 🃏 CARD DELL'ASSOCIAZIONE SELEZIONATA */}
          <div className="flex justify-center pt-4">
            {selectedAssoc ? (
              <div className={`p-8 max-w-2xl w-full rounded-2xl border backdrop-blur-md flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: selectedAssoc.badgeBaseColor || '#6366f1' }} />

                <button
                  onClick={() => setSelectedAssoc(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg text-sm"
                >
                  ✕
                </button>

                <div className="pt-2">
                  <h3 className={`text-2xl font-medium tracking-wide mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssoc.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mb-6">CF: {selectedAssoc.taxCodeEts}</p>
                  <p className={`text-base font-light leading-relaxed mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{selectedAssoc.description}</p>
                </div>

                {selectedAssoc.creatorUser?.id == user.id ? (
                  <span className="text-center py-3 text-xs font-mono text-indigo-500 bg-indigo-500/10 rounded-xl border border-indigo-500/20 backdrop-blur-sm">Sei l'Amministratore</span>
                ) : joinedStatus[selectedAssoc.id] === 'PENDING' ? (
                  <span className="text-center py-3 text-xs font-mono text-amber-500 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm">Richiesta Pendente</span>
                ) : joinedStatus[selectedAssoc.id] === 'ACTIVE' ? (
                  <span className="text-center py-3 text-xs font-mono text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 backdrop-blur-sm">Già Socio</span>
                ) : (
                  <button
                    onClick={() => onBecomeMember(selectedAssoc.id)}
                    className={`w-full py-3 rounded-xl border text-xs uppercase tracking-wider font-semibold transition active:scale-[0.98] ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/5 text-slate-900 hover:bg-black/10'}`}
                  >
                    Diventa Socio
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-12">Usa la barra di ricerca o seleziona un ente dal carosello in basso per visualizzare i dettagli.</p>
            )}
          </div>

          {/* 🎡 CAROSELLO A SCORRIMENTO INFINITO A TUTTO SCHERMO */}
          <div className="pt-12 w-screen relative left-1/2 right-1/2 -ml-[50vw] +mr-[50vw] overflow-hidden block clear-both">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 px-6 max-w-7xl mx-auto">
              Esplora tutto il Network
            </h2>

            <div className="w-full overflow-hidden block relative">
              {/* Utilizza la nuova classe animate-scroll-carousel definita nello style sopra */}
              <div className="flex flex-row flex-nowrap w-max gap-6 animate-scroll-carousel px-6">

                {/* Primo set di Cards */}
                {associations.map((assoc) => (
                  <div
                    key={`carousel-1-${assoc.id}`}
                    onClick={() => setSelectedAssoc(assoc)}
                    style={{ width: '400px', minWidth: '400px', flexShrink: 0 }}
                    className={`h-40 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                      isDarkMode ? 'bg-white/5 border-white/10 hover:border-indigo-500/40' : 'bg-white/60 border-black/5 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
                    <div>
                      <h4 className={`text-base font-medium tracking-wide truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-2">CF: {assoc.taxCodeEts}</p>
                    </div>
                    <p className="text-sm font-light text-slate-400 line-clamp-2 leading-relaxed">
                      {assoc.description}
                    </p>
                  </div>
                ))}

                {/* Duplicato esatto del set per il loop infinito */}
                {associations.map((assoc) => (
                  <div
                    key={`carousel-2-${assoc.id}`}
                    onClick={() => setSelectedAssoc(assoc)}
                    style={{ width: '400px', minWidth: '400px', flexShrink: 0 }}
                    className={`h-40 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                      isDarkMode ? 'bg-white/5 border-white/10 hover:border-indigo-500/40' : 'bg-white/60 border-black/5 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
                    <div>
                      <h4 className={`text-base font-medium tracking-wide truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-2">CF: {assoc.taxCodeEts}</p>
                    </div>
                    <p className="text-sm font-light text-slate-400 line-clamp-2 leading-relaxed">
                      {assoc.description}
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