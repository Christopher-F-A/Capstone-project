import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationEvents({ associationId, associationLogoUrl, isAdmin, userId, isDarkMode }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxSlots, setMaxSlots] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  useEffect(() => {
    if (associationId) {
      fetchEvents();
    }
  }, [associationId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/association/${associationId}`);
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossibile caricare il calendario degli eventi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      const response = await apiClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImageUrl(response.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante il caricamento della copertina.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !location || !eventDate || !maxSlots) return;

    const payload = {
      associationId: associationId,
      title: title,
      description: description || null,
      location: location,
      eventDate: eventDate,
      maxSlots: parseInt(maxSlots, 10),
      imageUrl: imageUrl || null
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/events', payload);
      setTitle(''); setDescription(''); setLocation(''); setEventDate(''); setMaxSlots(''); setImageUrl('');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore durante la creazione dell\'evento.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBookEvent = async (eventId) => {
    if (!userId) {
      alert('Errore di sessione: ID utente non trovato.');
      return;
    }
    const payload = { eventId: eventId, userId: userId };
    try {
      setBookingLoadingId(eventId);
      const response = await apiClient.post('/events/book', payload);
      alert(response.data.message || 'Prenotazione confermata!');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile completare la prenotazione.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleShareEventToFeed = async (event) => {
    const formattedDateForPost = event.eventDate ? event.eventDate.split('T')[0] : null;
    const payload = {
      associationId: associationId,
      authorMembershipId: null,
      type: 'EVENT',
      title: `In evidenza: ${event.title}`,
      contentBody: event.description || `Partecipa al nostro prossimo incontro a ${event.location}.`,
      eventDate: formattedDateForPost,
      mediaUrl: event.imageUrl || null,
      eventId: event.id
    };
    try {
      await apiClient.post('/posts', payload);
      alert('Evento pubblicizzato in bacheca con successo!');
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile condividere l\'evento.');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    const parsedDate = new Date(dateString);
    return `${parsedDate.toLocaleDateString('it-IT', dateOpts)} alle ore ${parsedDate.toLocaleTimeString('it-IT', timeOpts)}`;
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Pianifica Nuovo Evento Assembleare o Pubblico
          </h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Titolo Evento</label>
                <input type="text" required placeholder="Es: Assemblea Straordinaria Bilancio" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Luogo o Piattaforma</label>
                <input type="text" required placeholder="Es: Sede Centrale o Link Zoom" value={location} onChange={(e) => setLocation(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Data e Ora</label>
                <input type="datetime-local" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Posti massimi disponibili</label>
                <input type="number" required min="1" placeholder="Es: 50" value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Copertina Evento (Carica da dispositivo)</label>
              <input type="file" accept="image/*" onChange={handleEventFileChange} className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              {uploadingImage && <p className="text-[11px] text-indigo-400 animate-pulse mt-1.5">Caricamento dell'immagine sul cloud in corso...</p>}
              {imageUrl && (
                <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                  <img src={imageUrl} alt="Anteprima evento" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">Rimuovi</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Dettagli dell'Ordine del Giorno / Note</label>
              <textarea rows="3" placeholder="Descrivi i punti cardine..." value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={submitLoading || uploadingImage} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer">
                Pianifica Evento
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h2 className={`text-xs font-semibold uppercase tracking-widest text-slate-400 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          Eventi in Agenda
        </h2>

        {loading && <p className="text-sm text-slate-400 animate-pulse italic">Aggiornamento del calendario...</p>}
        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {!loading && events.length === 0 && (
          <p className="text-sm text-slate-500 italic py-8 text-center">Nessun evento programmato al momento.</p>
        )}

        {!loading && events.map((event) => {
          const availableSlots = event.maxSlots - event.bookedSlots;
          const isFull = availableSlots <= 0;

          return (
            <div key={event.id} className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${event.cancelled ? 'opacity-40 bg-red-500/5 border-red-500/20' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'}`}>
              <div className="space-y-2 flex-1">

                {/* BRAND HEADER EVENTO CON LOGO CLOUDINARY */}
                <div className="flex items-center space-x-3.5 mb-3 border-b border-white/5 pb-2.5">
                  <img
                    src={associationLogoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow shadow-black/40 shrink-0"
                    alt="Logo"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-base font-semibold tracking-wide truncate ${isDarkMode ? 'text-white' : 'text-slate-900'} ${event.cancelled ? 'line-through' : ''}`}>{event.title}</h3>
                      {event.cancelled && <span className="text-[9px] px-2 py-0.5 rounded-md font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider">Annullato</span>}
                    </div>
                  </div>
                </div>

                {event.imageUrl && (
                  <div className={`my-3 rounded-xl overflow-hidden border p-1 bg-slate-500/5 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <img src={event.imageUrl} alt={event.title} className="w-full h-auto max-h-[350px] object-contain rounded-lg" />
                  </div>
                )}

                <p className={`text-xs font-mono ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{formatDateTime(event.eventDate)}</p>
                <p className="text-xs text-slate-400">Luogo: <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{event.location}</span></p>
                {event.description && <p className={`text-sm font-light leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{event.description}</p>}
              </div>

              <div className="flex flex-col items-start md:items-end justify-between min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6 gap-3">
                <div className="text-left md:text-right">
                  <p className={`text-xs font-semibold ${isFull ? 'text-red-400' : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{isFull ? 'Tutto esaurito' : `${availableSlots} posti rimasti`}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Totale: {event.bookedSlots} / {event.maxSlots} occupati</p>
                </div>

                <div className="flex flex-col w-full gap-2 mt-2">
                  {isAdmin && !event.cancelled && (
                    <button onClick={() => handleShareEventToFeed(event)} className="w-full px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 cursor-pointer">
                      Pubblicizza in Bacheca
                    </button>
                  )}
                  {!event.cancelled && (
                    <button onClick={() => handleBookEvent(event.id)} disabled={isFull || bookingLoadingId === event.id} className={`w-full px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition active:scale-95 cursor-pointer ${isFull ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50'}`}>
                      {bookingLoadingId === event.id ? 'Elaborazione...' : 'Prenota Posto'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}