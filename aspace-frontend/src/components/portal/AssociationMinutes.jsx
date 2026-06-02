import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationMinutes({ associationId, isAdmin, userMembershipId, isDarkMode }) {
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stati per il modulo di caricamento verbali (riservato agli admin)
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Stato per tracciare il caricamento durante la firma di un verbale
  const [signingId, setSigningId] = useState(null);

  useEffect(() => {
    if (associationId) {
      fetchMinutes();
    }
  }, [associationId]);

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      // Invocazione dell'endpoint MinuteController per recuperare i verbali dell'associazione
      const response = await apiClient.get(`/minutes/association/${associationId}`);
      setMinutes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile recuperare il registro dei verbali.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMinute = async (e) => {
    e.preventDefault();
    if (!title || !pdfUrl || !documentHash) return;

    // Payload speculare a MinuteCreationDTO del backend
    const payload = {
      associationId: associationId,
      title: title,
      pdfUrl: pdfUrl,
      documentHash: documentHash
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/minutes', payload);

      // Reset dei campi del modulo
      setTitle('');
      setPdfUrl('');
      documentHash('');

      fetchMinutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante la registrazione del verbale.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignMinute = async (minuteId) => {
    if (!userMembershipId) {
      alert('Errore di configurazione: ID tesseramento non valido.');
      return;
    }

    // Payload speculare a SignMinuteDTO del backend
    // Lasciamo ipAddress nullo o vuoto così il MinuteController lo recupera da request.getRemoteAddr()
    const payload = {
      minuteId: minuteId,
      membershipId: userMembershipId,
      ipAddress: null
    };

    try {
      setSigningId(minuteId);
      const response = await apiClient.post('/minutes/sign', payload);
      alert(response.data.message || 'Firma apposta con successo.');

      fetchMinutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile apporre la firma digitale.');
    } finally {
      setSigningId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* SEZIONE CARICAMENTO VERBALI: SOLO PER AMMINISTRATORI */}
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Registra Verbale d'Assemblea Ufficiale
          </h3>
          <form onSubmit={handleCreateMinute} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Titolo o Sessione del Verbale</label>
              <input
                type="text"
                required
                placeholder="Es: Verbale Assemblea Ordinaria del 15 Marzo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">URL File Documento (PDF)</label>
                <input
                  type="url"
                  required
                  placeholder="https://storage.com/verbale-01.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Impronta Digitale SHA-256</label>
                <input
                  type="text"
                  required
                  placeholder="Inserisci l'hash di verifica del file..."
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm font-mono focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                {submitLoading ? 'Registrazione in corso...' : 'Archivia Verbale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ELENCO DEI VERBALI REGISTRATI */}
      <div className="space-y-6">
        <h2 className={`text-xs font-semibold uppercase tracking-widest text-slate-400 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          Registro Documenti Ufficiali
        </h2>

        {loading && <p className="text-sm text-slate-400 animate-pulse italic">Lettura del registro in corso...</p>}
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {!loading && minutes.length === 0 && (
          <p className="text-sm text-slate-500 italic py-8 text-center">Nessun verbale presente nel registro di questo ente.</p>
        )}

        {!loading && minutes.map((minute) => {
          // Verifica se l'utente corrente ha già firmato esaminando la lista firme restituita dal DB
          const hasSigned = minute.signatures?.some(sig => sig.membership?.id === userMembershipId);
          const signaturesCount = minute.signatures ? minute.signatures.length : 0;

          return (
            <div
              key={minute.id}
              className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg space-y-4 transition-all duration-300 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-medium tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {minute.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 break-all">
                    SHA-256: {minute.documentHash}
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-center">
                  <a
                    href={minute.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition ${
                      isDarkMode
                        ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                        : 'border-black/10 bg-black/5 text-slate-800 hover:bg-black/10'
                    }`}
                  >
                    Visualizza PDF
                  </a>

                  {hasSigned ? (
                    <span className="text-[10px] px-3 py-2 rounded-xl font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Firmato
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSignMinute(minute.id)}
                      disabled={signingId === minute.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                    >
                      {signingId === minute.id ? 'Firma...' : 'Apponi Firma'}
                    </button>
                  )}
                </div>
              </div>

              {/* SEZIONE FIRME ACCUMULATE */}
              <div className={`pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Sottoscrizioni raccolte ({signaturesCount})
                </p>

                {signaturesCount === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nessun membro ha ancora siglato questo documento.</p>
                ) : (
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                    {minute.signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5 last:border-0">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {sig.membership?.user?.firstName} {sig.membership?.user?.lastName}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          IP: {sig.ipAddress}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}