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
  isDarkMode
}) {
  return (
    <div className="space-y-12">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <div>
          <h1 className={`text-3xl font-extralight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Il tuo <span className="text-indigo-500 font-normal">Hub Personale</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestisci le tue associazioni e accedi ai portali dedicati ai soci.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/30 text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-lg transition active:scale-95"
        >
          + Crea Associazione
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pannello Laterale Sinistro */}
        <div className="space-y-8 lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Spazi che Amministri ({myAdminAssociations.length})</h2>
            {myAdminAssociations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Non possiedi alcuna organizzazione.</p>
            ) : (
              myAdminAssociations.map(assoc => (
                <div
                  key={assoc.id}
                  onClick={() => onManageAssociation(assoc)}
                  className={`p-4 rounded-xl border transition-all backdrop-blur-md cursor-pointer ${selectedAssoc?.id === assoc.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-xl' : isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white' : 'bg-white/60 border-black/5 text-slate-700 hover:border-black/10 hover:bg-white/80 hover:text-slate-900'}`}
                >
                  <h4 className={`font-medium text-sm ${isDarkMode || selectedAssoc?.id === assoc.id ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                  <p className="text-xs font-mono mt-1 text-slate-500">CF: {assoc.taxCodeEts}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">I tuoi Tesseramenti ({myMemberAssociations.length})</h2>
            {myMemberAssociations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Non sei iscritto a nessuna associazione.</p>
            ) : (
              myMemberAssociations.map(assoc => (
                <div key={assoc.id} className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between gap-3 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{assoc.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase ${joinedStatus[assoc.id] === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {joinedStatus[assoc.id]}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{assoc.description}</p>
                  </div>

                  {joinedStatus[assoc.id] === 'ACTIVE' ? (
                    <button 
                      onClick={() => alert(`Reindirizzamento al portale: ${assoc.name}`)}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium tracking-wider uppercase transition active:scale-95"
                    >
                      Entra nel Portale
                    </button>
                  ) : (
                    <button disabled className={`w-full py-1.5 rounded-lg border text-xs font-medium cursor-not-allowed ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-black/5 border-black/5 text-slate-400'}`}>
                      In attesa di approvazione
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cabina di Regia Admin (Destra) */}
        <div className={`lg:col-span-2 border backdrop-blur-md rounded-2xl p-6 min-h-[350px] shadow-2xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-black/5'}`}>
          {selectedAssoc ? (
            <div>
              <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h2 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAssoc.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedAssoc.description}</p>
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
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member.userUsername || 'Utente ID: ' + member.userId}</p>
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
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition active:scale-95"
                            >
                              Rifiuta
                            </button>
                            <button
                              onClick={() => onDecision(member.membershipId, 'APPROVE', selectedAssoc.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition active:scale-95"
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