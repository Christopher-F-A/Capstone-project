import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationFeed({ associationId, isAdmin, userMembershipId, isDarkMode, onRedirectToEvents }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stati per la creazione di un post generico o sondaggio
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [postType, setPostType] = useState('INFO'); // 'INFO' oppure 'POLL'

  // Stati specifici per la gestione dei sondaggi
  const [pollOptions, setPollOptions] = useState(['', '']); // Inizializza con due opzioni vuote di default
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Stato interno per impedire click multipli durante l'invio del voto
  const [votingPostId, setVotingPostId] = useState(null);

  useEffect(() => {
    if (associationId) fetchPosts();
  }, [associationId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/posts/association/${associationId}`);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare la bacheca.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingMedia(true);
      const response = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMediaUrl(response.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante il caricamento del file.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Funzioni per aggiungere, rimuovere o modificare le opzioni del form sondaggio
  const handleOptionChange = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const addPollOptionField = () => {
    if (pollOptions.length >= 6) {
      alert('È consentito inserire un massimo di 6 opzioni per votazione.');
      return;
    }
    setPollOptions([...pollOptions, '']);
  };

  const removePollOptionField = (index) => {
    if (pollOptions.length <= 2) {
      alert('Un sondaggio deve possedere un minimo di 2 opzioni di scelta.');
      return;
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    // Filtra ed esclude opzioni vuote se il tipo è un sondaggio
    const cleanPollOptions = postType === 'POLL' ? pollOptions.filter(opt => opt.trim() !== '') : null;

    if (postType === 'POLL' && (!cleanPollOptions || cleanPollOptions.length < 2)) {
      alert('Compila almeno 2 opzioni valide prima di pubblicare il sondaggio.');
      return;
    }

    const payload = {
      associationId: associationId,
      authorMembershipId: userMembershipId,
      type: postType,
      title: title,
      contentBody: contentBody,
      eventDate: null,
      mediaUrl: postType === 'INFO' ? (mediaUrl || null) : null, // Esclude media se è un sondaggio
      eventId: null,
      pollOptions: cleanPollOptions
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/posts', payload);

      // Reset completo del modulo
      setTitle('');
      setContentBody('');
      setMediaUrl('');
      setPostType('INFO');
      setPollOptions(['', '']);

      fetchPosts();
      alert('Nuova comunicazione inserita in bacheca con successo!');
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante la pubblicazione.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo elemento dalla bacheca?')) return;
    try {
      await apiClient.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile completare la rimozione.');
    }
  };

  // FUNZIONE DI VOTO: Spedisce la scelta al server e aggiorna la bacheca
  const handleVoteSubmit = async (postId, optionId) => {
    try {
      setVotingPostId(postId);
      await apiClient.post(`/posts/${postId}/vote/${optionId}`);
      fetchPosts(); // Ricarica i post mostrando i risultati aggiornati
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile registrare il voto.');
    } finally {
      setVotingPostId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* CREAZIONE POST/SONDAGGIO: APERTO AD ADMIN E SUPERADMIN */}
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Strumento di Comunicazione e Delibera
            </h3>

            {/* SELETTORE DEL TIPO DI POST */}
            <div className="flex bg-slate-800/60 p-0.5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-wider">
              <button type="button" onClick={() => setPostType('INFO')} className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${postType === 'INFO' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Info/Post</button>
              <button type="button" onClick={() => setPostType('POLL')} className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${postType === 'POLL' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Sondaggio</button>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                {postType === 'POLL' ? 'Quesito o Oggetto della Votazione' : 'Titolo'}
              </label>
              <input type="text" required placeholder={postType === 'POLL' ? "Es: Scegli la data per la cena sociale" : "Inserisci un titolo..."} value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>

            {/* SEZIONE INPUT MEDIA EXCLUSIVE PER COMUNICAZIONI INFO */}
            {postType === 'INFO' && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Immagine del Post (Opzionale)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                {uploadingMedia && <p className="text-[11px] text-indigo-400 animate-pulse mt-1.5">Caricamento sul cloud...</p>}
                {mediaUrl && (
                  <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setMediaUrl('')} className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Rimuovi</button>
                  </div>
                )}
              </div>
            )}

            {/* SEZIONE COMPILAZIONE OPZIONI EXCLUSIVE PER SONDAGGIO */}
            {postType === 'POLL' && (
              <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Opzioni di Risposta Disponibili</label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                    <input
                      type="text"
                      required
                      placeholder={`Inserisci l'opzione ${index + 1}...`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-black/5 text-slate-900'}`}
                    />
                    {pollOptions.length > 2 && (
                      <button type="button" onClick={() => removePollOptionField(index)} className="text-xs font-bold text-red-400 hover:text-red-500 px-1.5 cursor-pointer">X</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPollOptionField} className="mt-2 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider cursor-pointer">
                  + Aggiungi un'opzione
                </button>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                {postType === 'POLL' ? 'Descrizione o Contesto del Sondaggio' : 'Contenuto'}
              </label>
              <textarea required rows="3" placeholder={postType === 'POLL' ? "Fornisci ulteriori informazioni per guidare la scelta dei soci..." : "Scrivi qui il tuo messaggio..."} value={contentBody} onChange={(e) => setContentBody(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submitLoading || uploadingMedia} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer">
                {submitLoading ? 'Pubblicazione...' : postType === 'POLL' ? 'Inaugura Sondaggio' : 'Pubblica Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDERIZZAZIONE DELLA BACHECA FEED */}
      <div className="space-y-6">
        {loading && <p className="text-sm text-slate-400 animate-pulse italic">Aggiornamento della bacheca...</p>}
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {!loading && posts.length === 0 && (
          <p className="text-sm text-slate-500 italic py-8 text-center">Nessuna comunicazione presente in bacheca.</p>
        )}

        {!loading && posts.map((post) => {
          const isPoll = post.type === 'POLL';

          // Calcolo metriche se il post è un sondaggio
          let totalPostVotes = 0;
          let userVotedOptionId = null;

          if (isPoll && post.pollOptions) {
            post.pollOptions.forEach(opt => {
              const votesList = opt.votes || [];
              totalPostVotes += votesList.length;

              // Verifica se l'utente corrente ha votato questa opzione specifica
              const voted = votesList.some(v => v.membership?.id === userMembershipId || v.membership?.user?.id === userMembershipId);
              if (voted) userVotedOptionId = opt.id;
            });
          }

          const hasUserVoted = userVotedOptionId !== null;

          return (
            <div key={post.id} className={`rounded-2xl border backdrop-blur-md shadow-lg p-6 relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>

              {/* Tasti di controllo intestazione */}
              <div className="absolute top-4 right-4 flex items-center space-x-3">
                {isAdmin && (
                  <button onClick={() => handleDeletePost(post.id)} className="text-sm font-bold text-red-400/70 hover:text-red-500 cursor-pointer border-none bg-transparent p-0 leading-none" title="Rimuovi">X</button>
                )}
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${isPoll ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : post.type === 'EVENT' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                  {post.type}
                </span>
              </div>

              <h3 className={`text-lg font-medium tracking-wide mb-2 pr-12 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>

              {/* Sezione Media (solo per comunicazioni Info tradizionali) */}
              {!isPoll && post.mediaUrl && (
                <div className={`mb-4 rounded-xl overflow-hidden border p-1 bg-slate-500/5 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  <img src={post.mediaUrl} alt={post.title} className="w-full h-auto max-h-[350px] object-contain rounded-lg mx-auto" />
                </div>
              )}

              <p className={`text-sm font-light leading-relaxed whitespace-pre-line mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{post.contentBody}</p>

              {/* RENDERIZZAZIONE SPECIALE INTERFACCIA SONDAGGIO */}
              {isPoll && post.pollOptions && (
                <div className={`p-4 rounded-xl border space-y-3.5 mb-2 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-1.5">
                    <span>Votazione Democratica</span>
                    <span className="font-mono text-amber-400">Voti totali: {totalPostVotes}</span>
                  </div>

                  <div className="space-y-2.5">
                    {post.pollOptions.map((opt) => {
                      const optionVotesCount = opt.votes ? opt.votes.length : 0;
                      // Evita divisioni per zero
                      const percentage = totalPostVotes > 0 ? Math.round((optionVotesCount / totalPostVotes) * 100) : 0;
                      const isMyChoice = userVotedOptionId === opt.id;

                      // CONDIZIONE DI VISIBILITÀ: Mostra i grafici a barre se l'utente è un admin/superadmin OPPURE se il membro ha già votato
                      const shouldShowResults = isAdmin || hasUserVoted;

                      if (shouldShowResults) {
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`font-medium ${isMyChoice ? 'text-amber-400 font-bold' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                {opt.optionText} {isMyChoice && '(La tua scelta)'}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                {percentage}% ({optionVotesCount})
                              </span>
                            </div>
                            {/* Barra Grafica del Progresso Percentuale */}
                            <div className="w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                              <div
                                style={{ width: `${percentage}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${isMyChoice ? 'bg-amber-500' : 'bg-indigo-500/80'}`}
                              />
                            </div>
                          </div>
                        );
                      } else {
                        // SE IL MEMBRO NON HA ANCORA VOTATO: Vede solo i bottoni per esprimere la preferenza alla cieca
                        return (
                          <button
                            key={opt.id}
                            disabled={votingPostId !== null}
                            onClick={() => handleVoteSubmit(post.id, opt.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium uppercase tracking-wider transition transform active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                              isDarkMode
                                ? 'bg-slate-900/60 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-indigo-500/50'
                                : 'bg-white border-black/10 text-slate-700 hover:bg-slate-50 hover:border-indigo-500'
                            }`}
                          >
                            • {opt.optionText}
                          </button>
                        );
                      }
                    })}
                  </div>

                  {!hasUserVoted && !isAdmin && (
                    <p className="text-[10px] text-slate-400 italic text-center pt-1">
                      * Nota sulla trasparenza: I risultati parziali del sondaggio verranno sbloccati ed esposti subito dopo aver espresso la tua preferenza.
                    </p>
                  )}
                </div>
              )}

              {/* Box di rinvio agli eventi */}
              {post.type === 'EVENT' && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-fuchsia-500/5 ${isDarkMode ? 'border-fuchsia-500/20' : 'border-fuchsia-500/10'}`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>Iniziativa Condivisa</p>
                    <p className="text-xs text-slate-400 mt-0.5">Iscrizioni aperte nel pannello agenda</p>
                  </div>
                  <button onClick={() => onRedirectToEvents()} className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer">Dettagli e Prenotazione</button>
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>
  );
}