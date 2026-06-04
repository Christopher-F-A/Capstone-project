import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationFeed({ associationId, isAdmin, userMembershipId, isDarkMode, onRedirectToEvents }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMediaUrl(response.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante il caricamento del file.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    const payload = {
      associationId: associationId,
      authorMembershipId: userMembershipId,
      type: 'INFO',
      title: title,
      contentBody: contentBody,
      eventDate: null,
      mediaUrl: mediaUrl || null,
      eventId: null
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/posts', payload);
      setTitle(''); setContentBody(''); setMediaUrl('');
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante la pubblicazione.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo post dalla bacheca?')) return;

    try {
      await apiClient.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile completare la rimozione del post.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Nuova Comunicazione Ufficiale
          </h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Titolo</label>
              <input type="text" required placeholder="Inserisci un titolo..." value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Immagine del Post (Carica da dispositivo)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
              />
              {uploadingMedia && <p className="text-[11px] text-indigo-400 animate-pulse mt-1.5">Elaborazione file e caricamento cloud in corso...</p>}
              {mediaUrl && (
                <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setMediaUrl('')} className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Rimuovi</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Contenuto</label>
              <textarea required rows="4" placeholder="Scrivi qui il messaggio..." value={contentBody} onChange={(e) => setContentBody(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submitLoading || uploadingMedia} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50">
                Pubblica Post
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {!loading && posts.map((post) => (
          <div key={post.id} className={`rounded-2xl border backdrop-blur-md shadow-lg p-6 relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>

            <div className="absolute top-4 right-4 flex items-center space-x-3">
              {isAdmin && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-lg font-bold text-red-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0 leading-none"
                  title="Elimina post"
                >
                  X
                </button>
              )}
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${post.type === 'EVENT' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                {post.type}
              </span>
            </div>

            <h3 className={`text-xl font-normal tracking-wide mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>

            {/* CORREZIONE STRUTTURALE: L'IMMAGINE NON VIENE PIÙ TAGLIATA O SCHIACCIATA */}
            {post.mediaUrl && (
              <div className={`mb-4 rounded-xl overflow-hidden border p-1 bg-slate-500/5 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg mx-auto"
                />
              </div>
            )}

            <p className={`text-sm font-light leading-relaxed whitespace-pre-line mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{post.contentBody}</p>

            {post.type === 'EVENT' && (
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-fuchsia-500/5 ${isDarkMode ? 'border-fuchsia-500/20' : 'border-fuchsia-500/10'}`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>Iniziativa Condivisa</p>
                  <p className="text-xs text-slate-400 mt-0.5">Iscrizioni aperte nel pannello agenda</p>
                </div>
                <button onClick={() => onRedirectToEvents()} className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-semibold rounded-lg transition">
                  Dettagli e Prenotazione
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}