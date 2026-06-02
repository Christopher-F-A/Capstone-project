import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationFeed({ associationId, isAdmin, userMembershipId, isDarkMode }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stati per il form di creazione (visibile solo agli admin)
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [postType, setPostType] = useState('INFO'); // 'INFO' o 'EVENT'
  const [eventDate, setEventDate] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (associationId) {
      fetchPosts();
    }
  }, [associationId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Invocazione dell'endpoint di Spring Boot per recuperare i post dell'associazione
      const response = await apiClient.get(`/posts/association/${associationId}`);
      setPosts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare la bacheca.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    // Costruiamo il payload speculare al PostCreationDTO del backend
    const payload = {
      associationId: associationId,
      authorMembershipId: userMembershipId, // Passiamo l'ID della membership dell'utente corrente
      type: postType,
      title: title,
      contentBody: contentBody,
      eventDate: postType === 'EVENT' ? eventDate : null,
      mediaUrl: mediaUrl || null
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/posts', payload);

      // Reset dei campi del form
      setTitle('');
      setContentBody('');
      setPostType('INFO');
      setEventDate('');
      setMediaUrl('');

      // Ricarica la bacheca per mostrare il nuovo post in cima
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante la pubblicazione.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Funzione per formattare la data dell'evento in italiano senza usare librerie esterne
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* ✍BOX DI CREAZIONE: VISIBILE SOLO SE L'UTENTE È ADMIN O SUPERADMIN */}
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Nuova Comunicazione Ufficiale
          </h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Titolo</label>
                <input
                  type="text"
                  required
                  placeholder="Inserisci un titolo accattivante..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Tipologia Post</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'}`}
                >
                  <option value="INFO">Informativa Generale (INFO)</option>
                  <option value="EVENT">Condivisione Evento (EVENT)</option>
                </select>
              </div>
            </div>

            {/* CAMPO DINAMICO: COMPARE SOLO SE IL POST È UN EVENTO */}
            {postType === 'EVENT' && (
              <div className="animate-fadeIn">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Data dell'Evento</label>
                <input
                  type="date"
                  required={postType === 'EVENT'}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">URL Immagine / Media (Opzionale)</label>
              <input
                type="url"
                placeholder="https://esempio.com/immagine.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Contenuto del Messaggio</label>
              <textarea
                required
                rows="4"
                placeholder="Scrivi qui il corpo del post ufficiale..."
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                {submitLoading ? 'Pubblicazione...' : 'Pubblica in Bacheca'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEZIONE FEED DEI POST */}
      <div className="space-y-6">
        <h2 className={`text-xs font-semibold uppercase tracking-widest text-slate-400 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          Comunicazioni recenti
        </h2>

        {loading && <p className="text-sm text-slate-400 animate-pulse italic">Aggiornamento della bacheca in corso...</p>}
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {!loading && posts.length === 0 && (
          <p className="text-sm text-slate-500 italic py-8 text-center">Nessun post pubblicato in questa bacheca.</p>
        )}

        {!loading && posts.map((post) => (
          <div
            key={post.id}
            className={`rounded-2xl border backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}
          >
            {/* Badge Tematico Dinamico a seconda del Tipo di Post */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold ${
                post.type === 'EVENT'
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {post.type}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Autore (Rigorosamente Nome + Cognome ricavati dall'oggetto author.user) */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold font-mono">
                  {post.author?.user?.firstName?.charAt(0)}{post.author?.user?.lastName?.charAt(0)}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {post.author?.user?.firstName} {post.author?.user?.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Direttivo dell'Ente</p>
                </div>
              </div>

              {/* Titolo e Corpo del Post */}
              <div>
                <h3 className={`text-xl font-normal tracking-wide mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {post.title}
                </h3>
                <p className={`text-sm font-light leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {post.contentBody}
                </p>
              </div>

              {/* CONTENITORE EVENTO: Compare solo se il post condivide un evento */}
              {post.type === 'EVENT' && post.eventDate && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm ${
                  isDarkMode ? 'bg-fuchsia-500/5 border-fuchsia-500/20' : 'bg-fuchsia-500/5 border-fuchsia-500/10'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>
                        Evento in Programma
                      </p>
                      <p className={`text-sm font-mono mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {formatEventDate(post.eventDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">Consulta la scheda Calendario per prenotare</span>
                </div>
              )}

              {/* Media opzionale allegato */}
              {post.mediaUrl && (
                <div className="pt-2">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full max-h-72 object-cover rounded-xl border border-white/10"
                    onError={(e) => { e.target.style.display = 'none'; }} // Nasconde l'immagine se l'URL è rotto
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}