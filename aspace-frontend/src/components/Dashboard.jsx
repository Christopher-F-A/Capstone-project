import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { logout } from '../api/authService';

// Importazione dei sotto-componenti estratti
import Navbar from './dashboard/Navbar';
import LavaBackground from './dashboard/LavaBackground';
import DashboardContent from './dashboard/DashboardContent';
import CreateAssociationModal from './dashboard/CreateAssociationModal';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Utente', id: null };

  // Stati di Navigazione e Temi
  const [activeTab, setActiveTab] = useState('explore');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [lavaColor, setLavaColor] = useState('indigo');

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

  // Stati per la cabina di regia Admin
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
          localStorage.setItem('public_associations_cache', JSON.stringify(response.data));
        } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare le associazioni');
    } finally {
      setLoading(false);
    }
  };

  const myAdminAssociations = associations.filter(assoc => {
    const creatorId = assoc.creatorUser?.id || assoc.creatorUserId;
    return user.id && creatorId && creatorId == user.id;
  });

  const [joinedStatus, setJoinedStatus] = useState(() => {
    return JSON.parse(localStorage.getItem(`user_joined_${user.id}`)) || {};
  });

  const handleBecomeMember = async (associationId) => {
    if (!user.id) return;
    const payload = { userId: user.id, associationId };
    try {
      const response = await apiClient.post('/associations/join', payload);
      alert(response.data.message || 'Richiesta inviata con successo!');
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

      if (selectedAssoc) handleManageAssociation(selectedAssoc);
      // Ricarica la lista generale per riflettere i cambiamenti reali dal DB
      fetchAssociations();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante Elaborazione');
    }
  };

  const myMemberAssociations = associations.filter(assoc => {
    const creatorId = assoc.creatorUser?.id || assoc.creatorUserId;
    return user.id && joinedStatus[assoc.id] && creatorId != user.id;
  });

  return (
    <div className={`min-h-screen font-sans antialiased pb-12 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* 1. BACKGROUND ANOMATO ESTRATTO */}
      <LavaBackground isDarkMode={isDarkMode} lavaColor={lavaColor} />

      {/* 2. NAVBAR */}
      <Navbar
        user={user}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        lavaColor={lavaColor}
        setLavaColor={setLavaColor}
        onLogout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. CONTENUTO DELLE SCHEDE ESTRATTO */}
      <DashboardContent
        activeTab={activeTab}
        associations={associations}
        loading={loading}
        error={error}
        user={user}
        joinedStatus={joinedStatus}
        handleBecomeMember={handleBecomeMember}
        myAdminAssociations={myAdminAssociations}
        myMemberAssociations={myMemberAssociations}
        selectedAssoc={selectedAssoc}
        handleManageAssociation={handleManageAssociation}
        pendingMembers={pendingMembers}
        membersLoading={membersLoading}
        handleDecision={handleDecision}
        setShowModal={setShowModal}
        isDarkMode={isDarkMode}
      />

      {/* 4. MODALE DI CREAZIONE */}
      <CreateAssociationModal
        showModal={showModal}
        setShowModal={setShowModal}
        newName={newName}
        setNewName={setNewName}
        newTaxCode={newTaxCode}
        setNewTaxCode={setNewTaxCode}
        newColor={newColor}
        setNewColor={setNewColor}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        onCreateAssociation={handleCreateAssociation}
        createLoading={createLoading}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}