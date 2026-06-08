import React from 'react';

export default function MySpaces({
  myAdminAssociations,
  myMemberAssociations,
  selectedAssoc,
  onManageAssociation,
  pendingMembers,
  membersLoading,
  joinedStatus,
  onDecision,
  setShowModal,
  isDarkMode,
  onEnterPortal
}) {
  return (
    <div className="space-y-12">
      {/* INTESTAZIONE HUB */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <div>
          <h1 className={`text-3xl font-extralight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Il tuo <span className="text-indigo-500 font-normal">Hub Personale</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestisci le tue associazioni e accedi ai portali dedicati ai soci.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/30 text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
        >
          + Crea Associazione
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANNELLO LATERALE SINISTRO */}
        <div className="space-y-8 lg:col-span-1">

          {/* SEZIONE 1: SPAZI CHE AMMINISTRI (CON MINI THUMBNAIL LOGO) */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Spazi che Amministri ({myAdminAssociations.length})</h2>
            {myAdminAssociations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Non possiedi alcuna organizzazione.</p>
            ) : (
              myAdminAssociations.map(assoc => (
                <div
                  key={assoc.id}
                  onClick={() => onManageAssociation(assoc)}
                  className={`p-4 rounded-xl border transition-all backdrop-blur-md cursor-pointer flex items-center space-x-3 ${selectedAssoc?.id === assoc.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-xl' : isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white' : 'bg-white/60 border-black/5 text-slate-700 hover:border-black/10 hover:bg-white/80 hover:text-slate-900'}`}
                >
                  {/* Mini logo dell'ente amministrato */}
                  <img
                    src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'}
                    className="w-9 h-9 rounded-lg object-cover border border-white/10 shadow-sm"
                    alt="Mini Logo"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm truncate ${isDarkMode || selectedAssoc?.id === assoc.id ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                    <p className="text-[10px] font-mono mt-0.5 text-slate-500">CF: {assoc.taxCodeEts}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SEZIONE 2: I TUOI TESSERAMENTI (COMPLETATO IN STILE PREMIUM OVERLAY CARDS) */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">I tuoi Tesseramenti ({myMemberAssociations.length})</h2>
            {myMemberAssociations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Non sei iscritto a nessuna associazione.</p>
            ) : (
              myMemberAssociations.map(assoc => (
                <div
                  key={assoc.id}
                  className={`rounded-2xl border backdrop-blur-md overflow-hidden flex flex-col relative shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}
                >
                  {/* Banner Superiore della card tesserato */}
                  <div className="h-20 w-full relative bg-slate-800 overflow-hidden">
                    <img src={assoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>

                  {/* Logo Sovrapposto */}
                  <div className="absolute top-12 left-4 z-20 p-0.5 rounded-xl bg-slate-950/40 backdrop-blur-md border border-white/10 shadow-md">
                    <img src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-10 h-10 rounded-lg object-cover" alt="Logo" />
                  </div>

                  {/* Corpo della card */}
                  <div className="pt-4 p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="pl-12">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase font-bold shrink-0 ${joinedStatus[assoc.id] === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {joinedStatus[assoc.id]}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 line-clamp-2 h-8 font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{assoc.description}</p>
                    </div>

                    {joinedStatus[assoc.id] === 'ACTIVE' ? (
                      <button
                        onClick={() => onEnterPortal(assoc)}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold tracking-wider uppercase transition active:scale-95 cursor-pointer"
                      >
                        Entra nel Portale
                      </button>
                    ) : (
                      <button disabled className={`w-full py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider cursor-not-allowed ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-black/5 border-black/5 text-slate-400'}`}>
                        In attesa di approvazione
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CABINA DI REGIA ADMIN (COMPLETATO CON BANNER PROFILO INTEGRALE ED OVERLAY DI LOGO) */}
        <div className={`lg:col-span-2 border backdrop-blur-md rounded-2xl p-6 min-h-[350px] shadow-2xl transition-all overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-black/5'}`}>
          {selectedAssoc ? (
            <div>
              {/* TESTATA PROFILO ENTE CON OVERLAY LOGO/BANNER */}
              <div className="relative rounded-xl overflow-hidden mb-6 border border-white/5 bg-slate-950/40">
                <div className="h-28 w-full relative bg-slate-800">
                  <img src={selectedAssoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>

                <div className="p-4 pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 -mt-10">
                  <div className="flex items-end space-x-4">
                    <div className="p-1 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/20 shadow-2xl shrink-0">
                      <img src={selectedAssoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-16 h-16 rounded-xl object-cover" alt="Logo" />
                    </div>
                    <div className="pb-1 min-w-0">
                      <h2 className={`text-xl font-medium tracking-wide truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssoc.name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-light">{selectedAssoc.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnterPortal(selectedAssoc)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition shadow-md shrink-0 mb-1 cursor-pointer"
                  >
                    Visualizza Portale Completo
                  </button>
                </div>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Richieste di Tesseramento</h3>
              {membersLoading && <p className="text-xs text-slate-400 animate-pulse">Caricamento...</p>}

              {!membersLoading && pendingMembers.length === 0 && (
                <p className="text-sm text-slate-500 italic py-6">Nessuna richiesta in attesa.</p>
              )}

              {!membersLoading && pendingMembers.length > 0 && (
                <div className="space-y-2">
                  {pendingMembers.map((member) => (
                    <div key={member.membershipId} className={`p-4 border rounded-xl flex items-center justify-between transition-all backdrop-blur-sm ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Ruolo: <span className="text-indigo-500 font-mono font-medium">{member.role}</span></p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider ${member.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {member.status || 'PENDING'}
                        </span>

                        {member.status === 'PENDING' && (
                          <div className={`flex space-x-2 border-l pl-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                            <button
                              onClick={() => onDecision(member.membershipId, 'REJECT', selectedAssoc.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition active:scale-95 cursor-pointer"
                            >
                              Rifiuta
                            </button>
                            <button
                              onClick={() => onDecision(member.membershipId, 'APPROVE', selectedAssoc.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition active:scale-95 cursor-pointer"
                            >
                              Approva
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-24">
              <p className="text-slate-500 text-sm">Seleziona un'organizzazione da "Spazi che Amministri" per gestirla.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}