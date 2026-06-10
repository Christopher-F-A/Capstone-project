import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { logout } from '../api/authService';

import Navbar from './dashboard/Navbar';
import DashboardContent from './dashboard/DashboardContent';
import CreateAssociationModal from './dashboard/CreateAssociationModal';
import AssociationFeed from './portal/AssociationFeed';
import AssociationEvents from './portal/AssociationEvents';
import AssociationMinutes from './portal/AssociationMinutes';
import LavaBackground from './dashboard/LavaBackground';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User', id: null };

  const [activeTab, setActiveTab] = useState('explore');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPortal, setCurrentPortal] = useState(null);
  const [portalTab, setPortalTab] = useState('feed');

  // Traditional form states for creation
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [createLoading, setCreateLoading] = useState(false);

  // Profile image and full banner asset upload states
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [selectedAssoc, setSelectedAssoc] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);

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
      setError(err.response?.data?.message || 'Unable to load associations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'banner') setUploadingBanner(true);

      const response = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (type === 'logo') setLogoUrl(response.data.url);
      if (type === 'banner') setBannerUrl(response.data.url);
    } catch (err) {
      alert('Unable to process the image asset file.');
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

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
      alert(response.data.message || 'Membership application sent successfully!');
      setJoinedStatus(prev => ({ ...prev, [associationId]: 'PENDING' }));
      setJoinedRoles(prev => ({ ...prev, [associationId]: 'MEMBER' }));
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred during application process');
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
      creatorUserId: user.id,
      logoUrl: logoUrl,
      bannerUrl: bannerUrl
    };

    try {
      setCreateLoading(true);
      await apiClient.post('/associations', payload);
      alert("Organization founded successfully!");
      setNewName(''); setNewTaxCode(''); setNewDesc(''); setNewColor('#6366f1');
      setLogoUrl(''); setBannerUrl('');
      setShowModal(false);
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred during organization creation.");
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
      alert("Error sync-loading members registry.");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleDecision = async (membershipId, action, assocId) => {
    const payload = { membershipId, action };
    try {
      await apiClient.put('/associations/membership-decision', payload);
      alert('Operation processed successfully!');
      if (selectedAssoc) {
        const response = await apiClient.get(`/associations/${selectedAssoc.id}/members`);
        setPendingMembers(response.data);
      }
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error handling operational database update');
    }
  };

  const handleUpdateMember = async (membershipId, newRole, newStatus) => {
    const payload = { membershipId, newRole, newStatus };
    try {
      await apiClient.put('/associations/member-update', payload);
      alert('Member positioning records updated successfully!');
      if (selectedAssoc) {
        const response = await apiClient.get(`/associations/${selectedAssoc.id}/members`);
        setPendingMembers(response.data);
      }
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to modify role structures.');
    }
  };

  const myMemberAssociations = associations.filter(assoc => {
    const role = joinedRoles[assoc.id];
    const status = joinedStatus[assoc.id];
    return status && status === 'ACTIVE' && role === 'MEMBER';
  });

  // IMMERSIVE WORKSPACE SUB-PORTAL LAYER
  if (currentPortal) {
    const isUserAdminOfCurrentPortal = myAdminAssociations.some(assoc => assoc.id === currentPortal.id);
    const portalThemeColor = currentPortal.badgeBaseColor || '#6366f1';

    return (
      <div className={`min-h-screen font-sans antialiased pb-12 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

        {/* BACKGROUND 3: LavaBackground tinto del badge color specifico dell'associazione */}
        <div className="absolute inset-0 pointer-events-none z-0 transition-all duration-1000">
          <LavaBackground isDarkMode={isDarkMode} lavaColor={portalThemeColor} />
        </div>

        {/* HIGH-END LIQUID GLASS PORTAL NAVIGATION BAR */}
        <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-3xl h-16 flex items-center justify-between px-6 ${isDarkMode ? 'border-white/10 bg-slate-950/15' : 'border-black/5 bg-white/15'}`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPortal(null)}
              style={{ color: portalThemeColor }}
              className="text-xs uppercase tracking-wider font-bold hover:brightness-125 cursor-pointer bg-transparent border-none"
            >
              Back to Hub
            </button>
            <span className="text-slate-400">/</span>

            {currentPortal.logoUrl && (
              <img
                src={currentPortal.logoUrl}
                alt="Logo"
                className="w-7 h-7 rounded-xl object-cover border border-white/10 shadow-md shadow-black/20"
              />
            )}
            <span className="font-medium text-sm">{currentPortal.name}</span>
          </div>

          <div className="flex space-x-6 text-xs uppercase tracking-wider font-bold">
            <button
              onClick={() => setPortalTab('feed')}
              style={{
                color: portalTab === 'feed' ? portalThemeColor : 'rgba(148, 163, 184, 1)',
                borderBottomColor: portalTab === 'feed' ? portalThemeColor : 'transparent'
              }}
              className="pb-1 transition-all bg-transparent border-b-2 cursor-pointer"
            >
              Feed
            </button>
            <button
              onClick={() => setPortalTab('events')}
              style={{
                color: portalTab === 'events' ? portalThemeColor : 'rgba(148, 163, 184, 1)',
                borderBottomColor: portalTab === 'events' ? portalThemeColor : 'transparent'
              }}
              className="pb-1 transition-all bg-transparent border-b-2 cursor-pointer"
            >
              Events
            </button>
            <button
              onClick={() => setPortalTab('minutes')}
              style={{
                color: portalTab === 'minutes' ? portalThemeColor : 'rgba(148, 163, 184, 1)',
                borderBottomColor: portalTab === 'minutes' ? portalThemeColor : 'transparent'
              }}
              className="pb-1 transition-all bg-transparent border-b-2 cursor-pointer"
            >
              Minutes
            </button>
          </div>
          <div></div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 mt-28 z-10 relative">
          {portalTab === 'feed' && (
            <AssociationFeed
              associationId={currentPortal.id}
              associationLogoUrl={currentPortal.logoUrl}
              isAdmin={isUserAdminOfCurrentPortal}
              userMembershipId={user.id}
              isDarkMode={isDarkMode}
              onRedirectToEvents={() => setPortalTab('events')}
            />
          )}
          {portalTab === 'events' && (
            <AssociationEvents
              associationId={currentPortal.id}
              associationLogoUrl={currentPortal.logoUrl}
              isAdmin={isUserAdminOfCurrentPortal}
              userId={user.id}
              isDarkMode={isDarkMode}
            />
          )}
          {portalTab === 'minutes' && (
            <AssociationMinutes
              associationId={currentPortal.id}
              associationLogoUrl={currentPortal.logoUrl}
              isAdmin={isUserAdminOfCurrentPortal}
              userMembershipId={user.id}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>
    );
  }

  const currentUserRoleInSelectedAssoc = selectedAssoc ? joinedRoles[selectedAssoc.id] : null;
  const isCurrentUserSuperAdmin = currentUserRoleInSelectedAssoc === 'SUPERADMIN';

  return (
    <div className={`min-h-screen font-sans antialiased pb-12 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* STRATO SFONDO DINAMICO HUB PRINCIPALE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {activeTab === 'spaces' ? (
          /* BACKGROUND 2: Quando si va in My Spaces, si attiva il LavaBackground di default (indigo) */
          <LavaBackground isDarkMode={isDarkMode} lavaColor="indigo" />
        ) : (
          /* BACKGROUND 1: Background dinamico a raggi (come nel login) quando si è su Explore Network */
          <div className="absolute inset-0 opacity-95 transition-all duration-1000">
            <div
              className={`absolute w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-1000 -top-40 -left-20 ${
                isDarkMode ? 'bg-indigo-600/15' : 'bg-indigo-300/40'
              }`}
            />
            <div
              className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 bottom-0 right-0 ${
                isDarkMode ? 'bg-purple-600/10' : 'bg-purple-300/30'
              }`}
            />

            {/* DYNAMIC SHADOW PROJECTOR: Segue il colore della card selezionata in Explore */}
            {selectedAssoc && (
              <div
                style={{
                  background: `linear-gradient(to top, ${selectedAssoc.badgeBaseColor || '#6366f1'}44 0%, rgba(148, 163, 184, 0.15) 45%, ${selectedAssoc.badgeBaseColor || '#6366f1'}1a 75%, transparent 100%)`,
                  filter: 'blur(110px)'
                }}
                className="absolute w-full h-[120vh] bottom-0 left-0 transition-all duration-1000"
              />
            )}
          </div>
        )}
      </div>

      <Navbar user={user} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isUserDropdownOpen={isUserDropdownOpen} setIsUserDropdownOpen={setIsUserDropdownOpen} onLogout={logout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <DashboardContent
        activeTab={activeTab} associations={associations} loading={loading} error={error} user={user} joinedStatus={joinedStatus} handleBecomeMember={handleBecomeMember}
        myAdminAssociations={myAdminAssociations} myMemberAssociations={myMemberAssociations} selectedAssoc={selectedAssoc} handleManageAssociation={handleManageAssociation}
        pendingMembers={pendingMembers} membersLoading={membersLoading} handleDecision={handleDecision} setShowModal={setShowModal} isDarkMode={isDarkMode}
        onEnterPortal={(assoc) => { setCurrentPortal(assoc); setPortalTab('feed'); }}
      />

      <CreateAssociationModal
        showModal={showModal} setShowModal={setShowModal} newName={newName} setNewName={setNewName} newTaxCode={newTaxCode} setNewTaxCode={setNewTaxCode} newColor={newColor} setNewColor={setNewColor} newDesc={newDesc} setNewDesc={setNewDesc} onCreateAssociation={handleCreateAssociation} createLoading={createLoading} isDarkMode={isDarkMode}
        logoUrl={logoUrl} setLogoUrl={setLogoUrl} bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} uploadingLogo={uploadingLogo} uploadingBanner={uploadingBanner} onImageUpload={handleImageUpload}
      />

      {/* ADMIN CONTROL PANEL MODAL OVERLAY */}
      {showManageMembersModal && selectedAssoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 border shadow-2xl flex flex-col space-y-4 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'}`}>
            <div className="flex justify-between items-center border-b pb-3 border-white/10 gap-4">
              <div>
                <h2 className="text-lg font-semibold uppercase tracking-wide">Organizational Management Board</h2>
                <p className="text-xs text-slate-400 mt-0.5">Admin Workspace: <span className="text-indigo-400 font-medium">{selectedAssoc.name}</span></p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <button onClick={() => { setCurrentPortal(selectedAssoc); setPortalTab('feed'); setShowManageMembersModal(false); }} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition transform active:scale-95 cursor-pointer">Launch Workspace Portal</button>
                <button onClick={() => { setShowManageMembersModal(false); setSelectedAssoc(null); }} className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer">Close</button>
              </div>
            </div>

            {membersLoading && <p className="text-sm text-slate-400 animate-pulse italic py-4">Syncing rosters with non-profit cloud directory...</p>}
            {!membersLoading && pendingMembers.length === 0 && <p className="text-sm text-slate-500 italic py-6 text-center">No active members registered in this space.</p>}
            {!membersLoading && pendingMembers.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`font-semibold uppercase text-[10px] text-slate-400 tracking-wider ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <th className="p-3">Member Details</th>
                      <th className="p-3">Badge ID</th>
                      <th className="p-3">Verification Status</th>
                      <th className="p-3">Institutional Role</th>
                      <th className="p-3 text-right">Corrective Actions</th>
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
                              {!isCurrentUserSuperAdmin ? (
                                <span className="text-[10px] text-slate-400 italic bg-white/5 px-2 py-1 rounded border border-white/5">Requires SUPERADMIN</span>
                              ) : (
                                <>
                                  {isPending && (
                                    <>
                                      <button onClick={() => handleDecision(member.membershipId, 'APPROVE', selectedAssoc.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Approve</button>
                                      <button onClick={() => handleDecision(member.membershipId, 'REJECT', selectedAssoc.id)} className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Reject</button>
                                    </>
                                  )}
                                  {!isPending && member.userId !== user.id && (
                                    isBanned ? (
                                      <button onClick={() => handleUpdateMember(member.membershipId, 'MEMBER', 'ACTIVE')} className="px-2.5 py-1 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Reinstate</button>
                                    ) : (
                                      <button onClick={() => { if(window.confirm(`Are you sure you want to revoke the membership of ${member.firstName}?`)) handleUpdateMember(member.membershipId, member.role, 'BANNED'); }} className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer">Revoke</button>
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