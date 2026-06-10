import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationMinutes({ associationId, associationLogoUrl, isAdmin, userMembershipId, isDarkMode }) {
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [signingId, setSigningId] = useState(null);

  useEffect(() => {
    if (associationId) {
      fetchMinutes();
    }
  }, [associationId]);

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/minutes/association/${associationId}`);
      setMinutes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve the minutes register.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMinute = async (e) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    const payload = {
      associationId: associationId,
      title: title,
      contentBody: contentBody
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/minutes', payload);
      setTitle('');
      setContentBody('');
      fetchMinutes();
      alert('Assembly minutes indexed and published in the official register!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred during minutes publication.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignMinute = async (minuteId) => {
    if (!userMembershipId) {
      alert('Configuration error: Invalid user session.');
      return;
    }

    const payload = {
      minuteId: minuteId,
      membershipId: userMembershipId,
      ipAddress: null
    };

    try {
      setSigningId(minuteId);
      await apiClient.post('/minutes/sign', payload);
      alert('Electronic signature successfully applied.');

      const updatedMinutesResponse = await apiClient.get(`/minutes/association/${associationId}`);
      const updatedList = Array.isArray(updatedMinutesResponse.data) ? updatedMinutesResponse.data : [];
      setMinutes(updatedList);

      if (selectedMinute) {
        const freshMinute = updatedList.find(m => m.id === minuteId);
        if (freshMinute) setSelectedMinute(freshMinute);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to validate digital signature.');
    } finally {
      setSigningId(null);
    }
  };

  const formatSignatureDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Draft New Minutes Directly Online
          </h3>
          <form onSubmit={handleCreateMinute} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Assembly Session Title</label>
              <input type="text" required placeholder="e.g., Board of Directors Minutes and Budget Approval" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Full Text of the Agenda and Resolutions</label>
              <textarea required rows="8" placeholder="Write the official contents of the meeting here..." value={contentBody} onChange={(e) => setContentBody(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
              <p className="text-[10px] text-slate-400 mt-1 italic">* Note: Upon saving, the system will automatically generate a SHA-256 hash to protect the integrity of the text.</p>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg cursor-pointer">
                {submitLoading ? 'Archiving...' : 'Publish and Archive Minutes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h2 className={`text-xs font-semibold uppercase tracking-widest text-slate-400 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          Document Register and Subscription Statuses
        </h2>
        {loading && <p className="text-sm text-slate-400 animate-pulse italic">Reading cryptographic register...</p>}
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {!loading && minutes.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">No minutes present.</p>}

        {!loading && minutes.map((minute) => {
          const hasSigned = minute.signatures?.some(sig => sig.membership?.id === userMembershipId || sig.membership?.user?.id === userMembershipId);
          const signaturesCount = minute.signatures ? minute.signatures.length : 0;

          return (
            <div key={minute.id} className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>

              {/* Layout Aligned with Circle Organization Logo on the left */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <img
                  src={associationLogoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'}
                  className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow shadow-black/30 shrink-0"
                  alt="Doc Brand"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-medium tracking-wide truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{minute.title}</h3>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">SHA-256: {minute.documentHash}</p>
                  <p className="text-[11px] text-indigo-400 font-medium mt-1">Signatures: {signaturesCount}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button onClick={() => setSelectedMinute(minute)} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition cursor-pointer ${isDarkMode ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-slate-800 hover:bg-black/10'}`}>Read</button>
                {hasSigned ? (
                  <span className="text-[10px] px-3 py-2 rounded-xl font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">Signed</span>
                ) : (
                  <button onClick={() => handleSignMinute(minute.id)} disabled={signingId === minute.id} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer">Apply Signature</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedMinute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 border shadow-2xl flex flex-col space-y-4 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'}`}>
            <div className="flex justify-between items-start border-b pb-3 border-white/10">
              <div>
                <h2 className="text-xl font-semibold">{selectedMinute.title}</h2>
                <p className="text-[9px] font-mono text-slate-400 mt-1 break-all">SHA-256: {selectedMinute.documentHash}</p>
              </div>
              <button onClick={() => setSelectedMinute(null)} className="text-sm font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer">Close</button>
            </div>
            <div className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line overflow-y-auto max-h-64 font-light ${isDarkMode ? 'bg-white/5 text-slate-200' : 'bg-black/5 text-slate-700'}`}>{selectedMinute.contentBody}</div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">Signatures collected: {selectedMinute.signatures?.length || 0}</span>
              {selectedMinute.signatures?.some(s => s.membership?.id === userMembershipId || s.membership?.user?.id === userMembershipId) ? (
                <span className="text-[10px] px-4 py-1.5 rounded-lg font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">Document Signed</span>
              ) : (
                <button onClick={() => handleSignMinute(selectedMinute.id)} disabled={signingId === selectedMinute.id} className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer">Sign Document</button>
              )}
            </div>

            {isAdmin && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Signature Verification Audit</p>
                {(!selectedMinute.signatures || selectedMinute.signatures.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No signatures recorded.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-white/5 max-h-40 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className={`font-semibold uppercase text-[9px] text-slate-400 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                          <th className="p-2">Member</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">IP Address</th>
                          <th className="p-2 text-right">Date/Time</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono divide-y divide-white/5">
                        {selectedMinute.signatures.map((sig) => (
                          <tr key={sig.id} className="hover:bg-white/5 text-slate-300">
                            <td className="p-2 font-sans font-medium text-slate-200">{sig.membership?.user?.firstName} {sig.membership?.user?.lastName}</td>
                            <td className="p-2 opacity-70">{sig.membership?.user?.email}</td>
                            <td className="p-2 text-indigo-400">{sig.ipAddress}</td>
                            <td className="p-2 text-right text-slate-400">{formatSignatureDate(sig.signedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}