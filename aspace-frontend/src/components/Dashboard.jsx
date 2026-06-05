import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { logout } from '../api/authService';

import Navbar from './dashboard/Navbar';
import LavaBackground from './dashboard/LavaBackground';
import DashboardContent from './dashboard/DashboardContent';
import CreateAssociationModal from './dashboard/CreateAssociationModal';

import AssociationFeed from './portal/AssociationFeed';
import AssociationEvents from './portal/AssociationEvents';
import AssociationMinutes from './portal/AssociationMinutes';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Utente', id: null };

  const [activeTab, setActiveTab] = useState('explore');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [lavaColor, setLavaColor] = useState('indigo');

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPortal, setCurrentPortal] = useState(null);
  const [portalTab, setPortalTab] = useState('feed');

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [createLoading, setCreateLoading] = useState(false);

  // Cabina di regia membri
  const [selectedAssoc, setSelectedAssoc] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);

  // Stati sdoppiati per preservare la compatibilità con il layout
  const [joinedStatus, setJoinedStatus] = useState({});
  const [joinedRoles, setJoinedRoles] = useState({});

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/associations');
      setAssociations(response.data);
      localStorage.setItem('public_associations_cache', JSON.stringify(response.data));

      if (user.id) {
        const statusResponse = await apiClient.get('/associations/my-status');

        // Elaboriamo la mappa nidificata del server smistando i dati negli stati corretti
        const statusMap = {};
        const roleMap = {};
        Object.keys(statusResponse.data).forEach(assocId => {
          statusMap[assocId] = statusResponse.data[assocId].status;
          roleMap[assocId] = statusResponse.data[assocId].role;
        });

        setJoinedStatus(statusMap);
        setJoinedRoles(roleMap);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare le associazioni');
    } finally {
      setLoading(false);
    }
  };

  // MODIFICATO: Risultano amministratori sia i SUPERADMIN che gli ADMIN attivi
  const myAdminAssociations = associations.filter(assoc => {
    const role = joinedRoles[assoc.id];
    const status = joinedStatus[assoc.id];
    return role && (role === 'ADMIN' || role === 'SUPERADMIN') && status === 'ACTIVE';
  });

  const handleBecomeMember = async (associationId) => {
    if (!user.id) return;
    const payload = { userId: user.id, associationId };
    try {
      const response = await apiClient.post('/associations/join', payload);
      alert(response.data.message || 'Richiesta inviata con successo!');
      setJoinedStatus(prev => ({ ...prev, [associationId]: 'PENDING' }));
      setJoinedRoles(prev => ({ ...prev, [associationId]: 'MEMBER' }));
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante l\'iscrizione');
    }
  };

  const handleCreateAssociation = async (e) => {
    e.preventDefault();
    if (!newName || !newTaxCode || !newDesc) return;
    const payload = { name: newName, taxCodeEts: newTaxCode, description: newDesc, badgeBaseColor: newColor, creatorUserId: user.id };

    try {
      setCreateLoading(true);
      await apiClient.post('/associations', payload);
      alert("Associazione creata con successo!");
      setNewName(''); setNewTaxCode(''); setNewDesc(''); setNewColor('#6366f1');
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
    setShowManageMembersModal(true);
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

  const handleDecision = async (membershipId, action, assocId) => {
    const payload = { membershipId, action };
    try {
      await apiClient.put('/associations/membership-decision', payload);
      alert('Operazione completata con successo!');
      if (selectedAssoc) {
        const response = await apiClient.get(`/associations/${selectedAssoc.id}/members`);
        setPendingMembers(response.data);
      }
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante l\'elaborazione');
    }
  };

  const handleUpdateMember = async (membershipId, newRole, newStatus) => {
    const payload = { membershipId, newRole, newStatus };
    try {
      await apiClient.put('/associations/member-update', payload);
      alert('Posizione del tesserato aggiornata con successo!');
      if (selectedAssoc) {
        const response = await apiClient.get(`/associations/${selectedAssoc.id}/members`);
        setPendingMembers(response.data);
      }
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile completare l\'operazione sui ruoli.');
    }
  };

  // MODIFICATO: Partecipano come membri solo i tesserati con ruolo effettivo MEMBER
  const myMemberAssociations = associations.filter(assoc => {
    const role = joinedRoles[assoc.id];
    const status = joinedStatus[assoc.id];
    return status && status === 'ACTIVE' && role === 'MEMBER';
  });

  if (currentPortal) {
    const isUserAdminOfCurrentPortal = myAdminAssociations.some(assoc => assoc.id === currentPortal.id);

    return (
      <div className={`min-h-screen font-sans antialiased pb-12 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        <LavaBackground isDarkMode={isDarkMode} lavaColor={lavaColor} />

        <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl h-16 flex items-center justify-between px-6 ${isDarkMode ? 'border-white/10 bg-slate-950/60' : 'border-black/5 bg-white/60'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentPortal(null)} className="text-xs uppercase tracking-wider font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer">
              Torna all'Hub
            </button>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-sm">{currentPortal.name}</span>
          </div>

          <div className="flex space-x-6 text-xs uppercase tracking-wider font-semibold">
            <button onClick={() => setPortalTab('feed')} className={portalTab === 'feed' ? 'text-indigo-500 border-b-2 border-indigo-500 pb-1' : 'text-slate-400 hover:text-slate-200 cursor-pointer'}>Bacheca</button>
            <button onClick={() => setPortalTab('events')} className={portalTab === 'events' ? 'text-indigo-500 border-b-2 border-indigo-500 pb-1' : 'text-slate-400 hover:text-slate-200 cursor-pointer'}>Eventi</button>
            <button onClick={() => setPortalTab('minutes')} className={portalTab === 'minutes' ? 'text-indigo-500 border-b-2 border-indigo-500 pb-1' : 'text-slate-400 hover:text-slate-200 cursor-pointer'}>Verbali</button>
          </div>
          <div></div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 mt-28 z-10 relative">
          {portalTab === 'feed' && (
            <AssociationFeed associationId={currentPortal.id} isAdmin={isUserAdminOfCurrentPortal} userMembershipId={user.id} isDarkMode={isDarkMode} onRedirectToEvents={() => setPortalTab('events')} />
          )}
          {portalTab === 'events' && (
            <AssociationEvents associationId={currentPortal.id} isAdmin={isUserAdminOfCurrentPortal} userId={user.id} isDarkMode={isDarkMode} />
          )}
          {portalTab === 'minutes' && (
            <AssociationMinutes associationId={currentPortal.id} isAdmin={isUserAdminOfCurrentPortal} userMembershipId={user.id} isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
    );
  }

  // Estraiamo il ruolo dell'utente loggato nell'associazione selezionata per bloccare la UI del pannello membri
  const currentUserRoleInSelectedAssoc = selectedAssoc ? joinedRoles[selectedAssoc.id] : null;
  const isCurrentUserSuperAdmin = currentUserRoleInSelectedAssoc === 'SUPERADMIN';

  return (
    <div className={`min-h-screen font-sans antialiased pb-12 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <LavaBackground isDarkMode={isDarkMode} lavaColor={lavaColor} />
      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isUserDropdownOpen={isUserDropdownOpen} setIsUserDropdownOpen={setIsUserDropdownOpen} lavaColor={lavaColor} setLavaColor={setLavaColor} onLogout={logout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <DashboardContent
        activeTab={activeTab} associations={associations} loading={loading} error={error} user={user} joinedStatus={joinedStatus} handleBecomeMember={handleBecomeMember}
        myAdminAssociations={myAdminAssociations} myMemberAssociations={myMemberAssociations} selectedAssoc={selectedAssoc} handleManageAssociation={handleManageAssociation}
        pendingMembers={pendingMembers} membersLoading={membersLoading} handleDecision={handleDecision} setShowModal={setShowModal} isDarkMode={isDarkMode}
        onEnterPortal={(assoc) => { setCurrentPortal(assoc); setPortalTab('feed'); }}
      />

      <CreateAssociationModal showModal={showModal} setShowModal={setShowModal} newName={newName} setNewName={setNewName} newTaxCode={newTaxCode} setNewTaxCode={setNewTaxCode} newColor={newColor} setNewColor={setNewColor} newDesc={newDesc} setNewDesc={setNewDesc} onCreateAssociation={handleCreateAssociation} createLoading={createLoading} isDarkMode={isDarkMode} />

      {showManageMembersModal && selectedAssoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 border shadow-2xl flex flex-col space-y-4 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-3 border-white/10 gap-4">
              <div>
                <h2 className="text-lg font-semibold uppercase tracking-wide">Pannello Controllo Organizzativo</h2>
                <p className="text-xs text-slate-400 mt-0.5">Spazio Amministrativo: <span className="text-indigo-400 font-medium">{selectedAssoc.name}</span></p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => {
                    setCurrentPortal(selectedAssoc);
                    setPortalTab('feed');
                    setShowManageMembersModal(false);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Entra nel Portale
                </button>
                <button onClick={() => { setShowManageMembersModal(false); setSelectedAssoc(null); }} className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer">Chiudi</button>
              </div>
            </div>

            {membersLoading && <p className="text-sm text-slate-400 animate-pulse italic py-4">Sincronizzazione registro soci...</p>}
            {!membersLoading && pendingMembers.length === 0 && <p className="text-sm text-slate-500 italic py-6 text-center">Nessun tesserato presente.</p>}

            {!membersLoading && pendingMembers.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-semibold uppercase text-[10px] text-slate-400 tracking-wider ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <th className="p-3">Anagrafica Socio</th>
                      <th className="p-3">Codice Tessera</th>
                      <th className="p-3">Stato Iscrizione</th>
                      <th className="p-3">Ruolo Istituzionale (Enum)</th>
                      <th className="p-3 text-right">Azioni Correttive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingMembers.map((member) => {
                      const isPending = member.status === 'PENDING';
                      const isBanned = member.status === 'BANNED' || member.status === 'REJECTED';

                      return (
                        <tr key={member.membershipId} className={`hover:bg-white/5 transition-colors ${isBanned ? 'opacity-50 bg-red-500/5' : ''}`}>
                          <td className="p-3">
                            <div className="font-medium text-slate-200 text-sm">{member.firstName} {member.lastName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{member.email}</div>
                          </td>
                          <td className="p-3 font-mono text-indigo-400 font-semibold">{member.membershipCode}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${
                              isPending ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                              isBanned ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                              'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}>{member.status}</span>
                          </td>
                          <td className="p-3">
                            {/* DISABILITATO SE L'UTENTE LOGGATO NON È UN SUPERADMIN */}
                            <select
                              value={member.role}
                              disabled={isBanned || member.userId === user.id || !isCurrentUserSuperAdmin}
                              onChange={(e) => handleUpdateMember(member.membershipId, e.target.value, member.status)}
                              className={`px-2 py-1 rounded-lg border text-xs font-medium font-sans focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                                isDarkMode ? 'bg-slate-800 border-white/10 text-slate-200' : 'bg-slate-50 border-black/10 text-slate-800'
                              }`}
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>
                          </td>
                          <td className="p-3 text-right text-slate-400 font-medium">
                            <div className="flex justify-end gap-2">
                              {/* SEZIONE COMPORTAMENTALE: Se l'utente è un semplice ADMIN, vede le scritte di blocco informative al posto dei bottoni attivi */}
                              {!isCurrentUserSuperAdmin ? (
                                <span className="text-[10px] text-slate-400 italic bg-white/5 px-2 py-1 rounded border border-white/5">Richiede SUPERADMIN</span>
                              ) : (
                                <>
                                  {isPending && (
                                    <>
                                      <button onClick={() => handleDecision(member.membershipId, 'APPROVE', selectedAssoc.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Approva</button>
                                      <button onClick={() => handleDecision(member.membershipId, 'REJECT', selectedAssoc.id)} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Rifiuta</button>
                                    </>
                                  )}

                                  {!isPending && member.userId !== user.id && (
                                    isBanned ? (
                                      <button onClick={() => handleUpdateMember(member.membershipId, 'MEMBER', 'ACTIVE')} className="px-2.5 py-1 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Riabilita</button>
                                    ) : (
                                      <button onClick={() => { if(window.confirm(`Revocare il tesseramento di ${member.firstName}?`)) handleUpdateMember(member.membershipId, member.role, 'BANNED'); }} className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Revoca</button>
                                    )
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}