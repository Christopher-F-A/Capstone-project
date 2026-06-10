import React from 'react';
import ExploreNetwork from './ExploreNetwork';
import MySpaces from './MySpaces';

export default function DashboardContent({
  activeTab,
  associations,
  loading,
  error,
  user,
  joinedStatus,
  handleBecomeMember,
  myAdminAssociations,
  myMemberAssociations,
  selectedAssoc,
  handleManageAssociation,
  pendingMembers,
  membersLoading,
  handleDecision,
  setShowModal,
  isDarkMode,
  onEnterPortal
}) {
  return (
    <main className="max-w-7xl mx-auto px-6 mt-24 z-10 relative">
      {activeTab === 'explore' ? (
        <ExploreNetwork
          associations={associations}
          loading={loading}
          error={error}
          user={user}
          joinedStatus={joinedStatus}
          onBecomeMember={handleBecomeMember}
          isDarkMode={isDarkMode}
          onEnterPortal={onEnterPortal}
        />
      ) : (
        <MySpaces
          myAdminAssociations={myAdminAssociations}
          myMemberAssociations={myMemberAssociations}
          selectedAssoc={selectedAssoc}
          onManageAssociation={handleManageAssociation}
          pendingMembers={pendingMembers}
          membersLoading={membersLoading}
          joinedStatus={joinedStatus}
          onDecision={handleDecision}
          setShowModal={setShowModal}
          isDarkMode={isDarkMode}
          onEnterPortal={onEnterPortal}
        />
      )}
    </main>
  );
}