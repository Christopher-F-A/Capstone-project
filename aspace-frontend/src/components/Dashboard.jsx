import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { logout } from '../api/authService';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Utente', id: null };

  // Tab attiva: 'explore' (per vedere tutto) o 'spaces' (I Miei Spazi: Admin + Tesserati)
  const [activeTab, setActiveTab] = useState('explore');

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stati per il modale di creazione
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [createLoading, setCreateLoading] = useState(false);

  // Stati per la gestione dei membri (Cabina di Regia Admin)
  const [selectedAssoc, setSelectedAssoc] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/associations');
      setAssociations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare le associazioni');
    } finally {
      setLoading(false);
    }
  };

  // 1. Associazioni create dall'utente corrente (Spazi che Amministra)
  const myAdminAssociations = associations.filter(assoc => {
    const creatorId = assoc.creatorUser?.id || assoc.creatorUserId;
    return creatorId == user.id;
  });

  // 2. Associazioni di cui l'utente fa parte (Simulazione reattiva basata sulle richieste caricate o sul tracking)
  // Nota: Quando l'utente preme "Diventa Socio", salviamo localmente lo stato o ricarichiamo dal backend
  const [joinedStatus, setJoinedStatus] = useState(() => {
    return JSON.parse(localStorage.getItem(`user_joined_${user.id}`)) || {};
  });

  const handleBecomeMember = async (associationId) => {
    if (!user.id) {
      alert("Errore: Impossibile recuperare il tuo ID utente.");
      return;
    }
    const payload = { userId: user.id, associationId };
    try {
      const response = await apiClient.post('/associations/join', payload);
      alert(response.data.message || 'Richiesta inviata con successo!');

      // Salva lo stato locale come 'PENDING' per rifletterlo istantaneamente nel frontend
      const updatedStatus = { ...joinedStatus, [associationId]: 'PENDING' };
      setJoinedStatus(updatedStatus);
      localStorage.setItem(`user_joined_${user.id}`, JSON.stringify(updatedStatus));

      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante l\'iscrizione');
    }
  };

  const handleCreateAssociation = async (e) => {
    e.preventDefault();
    if (!newName || !newTaxCode || !newDesc) return;

    const payload = {
      name: newName,
      taxCodeEts: newTaxCode,
      description: newDesc,
      badgeBaseColor: newColor,
      creatorUserId: user.id
    };

    try {
      setCreateLoading(true);
      await apiClient.post('/associations', payload);
      alert("Associazione creata con successo!");
      setNewName('');
      setNewTaxCode('');
      setNewDesc('');
      setNewColor('#6366f1');
      setShowModal(false);
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || "Errore durante la creazione.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleManageAssociation = async (assoc) => {
    setSelectedAssoc(assoc);
    try {
      setMembersLoading(true);
      const response = await apiClient.get(`/associations/${assoc.id}/members`);
      setPendingMembers(response.data);
    } catch (err) {
      alert("Errore nel caricamento dei membri.");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleDecision = async (membershipId, action, assocId, userUsername) => {
    const payload = { membershipId, action };
    try {
      await apiClient.put('/associations/membership-decision', payload);
      alert('Operazione completata con successo!');

      // Aggiorna dinamicamente lo stato del membro per rifletterlo nei "Miei Spazi"
      if (action === 'APPROVE') {
        const updated = { ...joinedStatus, [assocId]: 'ACTIVE' };
        setJoinedStatus(updated);
        localStorage.setItem(`user_joined_${user.id}`, JSON.stringify(updated));
      } else {
        const updated = { ...joinedStatus, [assocId]: 'REJECTED' };
        setJoinedStatus(updated);
        localStorage.setItem(`user_joined_${user.id}`, JSON.stringify(updated));
      }

      if (selectedAssoc) handleManageAssociation(selectedAssoc);
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante l\'elaborazione');
    }
  };

  // Filtriamo le associazioni in cui l'utente è un socio tesserato (Active o Pending)
  const myMemberAssociations = associations.filter(assoc => joinedStatus[assoc.id] && assoc.creatorUser?.id !== user.id);

  return (
    <div className="min-h-screen text-slate-100 font-sans antialiased pb-12">

      {/* NAVBAR GLASSMORPHIC */}
      <nav className="border-b border-white/10 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-light tracking-widest text-white">
            A<span className="text-indigo-400 font-semibold">-</span>SPACE
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">Ciao, <strong className="text-white font-medium">{user.username}</strong></span>
            <button onClick={logout} className="px-4 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs uppercase tracking-wider font-medium transition active:scale-95">
              Esci
            </button>
          </div>
        </div>
      </nav>

      {/* SOTTO-NAVIGAZIONE INTERNA */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex space-x-4 border-b border-white/5 pb-3">
        <button
          onClick={() => { setActiveTab('explore'); setSelectedAssoc(null); }}
          className={`text-xs tracking-widest font-medium uppercase pb-2 transition-all border-b-2 ${activeTab === 'explore' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'}`}
        >
          Esplora Network
        </button>
        <button
          onClick={() => setActiveTab('spaces')}
          className={`text-xs tracking-widest font-medium uppercase pb-2 transition-all border-b-2 ${activeTab === 'spaces' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'}`}
        >
          I Miei Spazi ({myAdminAssociations.length + myMemberAssociations.length})
        </button>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <main className="max-w-7xl mx-auto px-6 mt-8">

        {/* VISTA 1: ESPLORA ASSOCIAZIONI (SOLO VETRINA) */}
        {activeTab === 'explore' && (
          <>
            <div className="mb-12">
              <h1 className="text-3xl font-extralight tracking-tight text-white">Trova la tua <span className="text-indigo-400 font-normal">Associazione</span></h1>
              <p className="text-sm text-slate-400 mt-1">Esplora gli enti disponibili nel network e richiedi l'adesione.</p>
            </div>

            {loading && <p className="text-slate-400 text-sm animate-pulse">Caricamento in corso...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {!loading && !error && (
              associations.length === 0 ? (
                <div className="text-center py-16 border border-white/5 rounded-3xl p-8 bg-white/5 backdrop-blur-md">
                  <p className="text-slate-400 text-sm mb-2">Nessuna associazione registrata.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {associations.map((assoc) => (
                    <div key={assoc.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-white/10 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl group">
                      <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
                      <div className="pt-2">
                        <h3 className="text-lg font-medium text-white tracking-wide mb-1">{assoc.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mb-4">CF: {assoc.taxCodeEts}</p>
                        <p className="text-sm text-slate-400 font-light leading-relaxed mb-6 line-clamp-3">{assoc.description}</p>
                      </div>

                      {assoc.creatorUser?.id == user.id ? (
                        <span className="text-center py-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 rounded-xl border border-indigo-500/20 backdrop-blur-sm">Sei l'Amministratore</span>
                      ) : joinedStatus[assoc.id] === 'PENDING' ? (
                        <span className="text-center py-2 text-xs font-mono text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm">Richiesta Pendente</span>
                      ) : joinedStatus[assoc.id] === 'ACTIVE' ? (
                        <span className="text-center py-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 backdrop-blur-sm">Gia Socio</span>
                      ) : (
                        <button onClick={() => handleBecomeMember(assoc.id)} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs uppercase tracking-wider font-medium transition active:scale-[0.98]">
                          Diventa Socio
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}

        {/* VISTA 2: I MIEI SPAZI (HUB UTENTE COMPLETO) */}
        {activeTab === 'spaces' && (
          <div className="space-y-12">

            {/* Header Hub Personale con Bottone Crea Spostato Qui */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h1 className="text-3xl font-extralight tracking-tight text-white">Il tuo <span className="text-indigo-400 font-normal">Hub Personale</span></h1>
                <p className="text-sm text-slate-400 mt-1">Gestisci le tue associazioni e accedi ai portali dedicati ai soci.</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-indigo-500/80 hover:bg-indigo-600 border border-indigo-400/30 text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-lg shadow-indigo-500/10 transition active:scale-95"
              >
                + Crea Associazione
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* COLONNA SINISTRA: ELENCHI DEGLI SPAZI */}
              <div className="space-y-8 lg:col-span-1">

                {/* SOTTO-SEZIONE A: SPAZI CHE AMMINISTRI */}
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Spazi che Amministri ({myAdminAssociations.length})</h2>
                  {myAdminAssociations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Non possiedi alcuna organizzazione.</p>
                  ) : (
                    myAdminAssociations.map(assoc => (
                      <div
                        key={assoc.id}
                        onClick={() => handleManageAssociation(assoc)}
                        className={`p-4 rounded-xl border transition-all backdrop-blur-md cursor-pointer ${selectedAssoc?.id === assoc.id ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-indigo-500/5' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white'}`}
                      >
                        <h4 className="font-medium text-sm text-white">{assoc.name}</h4>
                        <p className="text-xs font-mono mt-1 text-slate-500">CF: {assoc.taxCodeEts}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* SOTTO-SEZIONE B: I TUOI TESSERAMENTI (UTENTE REGOLARE) */}
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">I tuoi Tesseramenti ({myMemberAssociations.length})</h2>
                  {myMemberAssociations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Non sei iscritto a nessuna associazione esterna.</p>
                  ) : (
                    myMemberAssociations.map(assoc => (
                      <div key={assoc.id} className="p-4 rounded-xl border bg-white/5 border-white/10 backdrop-blur-md flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-white">{assoc.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase ${joinedStatus[assoc.id] === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {joinedStatus[assoc.id]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{assoc.description}</p>
                        </div>

                        {joinedStatus[assoc.id] === 'ACTIVE' ? (
                          <button
                            onClick={() => alert(`Reindirizzamento al portale dell'associazione: ${assoc.name}`)}
                            className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium tracking-wider uppercase transition active:scale-95"
                          >
                            Entra nel Portale
                          </button>
                        ) : (
                          <button disabled className="w-full py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 text-xs font-medium cursor-not-allowed">
                            In attesa di approvazione
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* COLONNA DESTRA: PANNELLO DI REGIA DELL'AMMINISTRATORE */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 min-h-[350px] shadow-2xl transition-all">
                {selectedAssoc ? (
                  <div>
                    <div className="border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-2xl font-light text-white">{selectedAssoc.name}</h2>
                      <p className="text-xs text-slate-400 mt-1">{selectedAssoc.description}</p>
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Richieste di Tesseramento</h3>

                    {membersLoading && <p className="text-xs text-slate-400 animate-pulse">Caricamento...</p>}

                    {!membersLoading && pendingMembers.length === 0 && (
                      <p className="text-sm text-slate-500 italic py-6">Nessuna richiesta in attesa per questa organizzazione.</p>
                    )}

                    {!membersLoading && pendingMembers.length > 0 && (
                      <div className="space-y-2">
                        {pendingMembers.map((member) => (
                          <div key={member.membershipId} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between transition-all backdrop-blur-sm">
                            <div>
                              <p className="text-sm font-medium text-white">{member.userUsername || 'Utente ID: ' + member.userId}</p>
                              <p className="text-xs text-slate-400 mt-0.5">Ruolo richiesto: <span className="text-indigo-400 font-mono font-medium">{member.role}</span></p>
                            </div>

                            <div className="flex items-center space-x-4">
                              <span className={`text-[10px] px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider ${member.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {member.status || 'PENDING'}
                              </span>

                              {member.status === 'PENDING' && (
                                <div className="flex space-x-2 border-l border-white/10 pl-4">
                                  <button
                                    onClick={() => handleDecision(member.membershipId, 'REJECT', selectedAssoc.id, member.userUsername)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition active:scale-95"
                                  >
                                    Rifiuta
                                  </button>
                                  <button
                                    onClick={() => handleDecision(member.membershipId, 'APPROVE', selectedAssoc.id, member.userUsername)}
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
                    <p className="text-slate-500 text-sm">Seleziona un'organizzazione dalla sezione "Spazi che Amministri" per accedere alla cabina di regia del consiglio direttivo.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODALE DI CREAZIONE GLASSMORPHIC */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 transition-all">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-light text-white mb-6">Nuovo Ente <span className="text-indigo-400 font-normal">A-SPACE</span></h2>
            <form onSubmit={handleCreateAssociation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Nome Organizzazione</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 text-sm transition-all" placeholder="es. Associazione Terzo Settore" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Codice Fiscale / ETS</label>
                <input type="text" required maxLength="11" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 text-sm font-mono transition-all" placeholder="11 caratteri" value={newTaxCode} onChange={(e) => setNewTaxCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Colore Tematico Badge</label>
                <div className="flex items-center space-x-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
                  <input type="color" className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
                  <span className="text-xs font-mono text-slate-300">{newColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Descrizione Istituzionale</label>
                <textarea required rows="3" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 text-sm resize-none transition-all" placeholder="Finalità dell'associazione..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium hover:text-white transition">Annulla</button>
                <button type="submit" disabled={createLoading} className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/30 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/10">{createLoading ? 'Salvataggio...' : 'Crea Ente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}