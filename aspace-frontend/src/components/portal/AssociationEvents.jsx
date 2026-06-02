import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export default function AssociationEvents({ associationId, isAdmin, userId, isDarkMode }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stati per il form di creazione eventi (riservato agli admin)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxSlots, setMaxSlots] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Stato per tracciare il caricamento delle singole prenotazioni
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

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !location || !eventDate || !maxSlots) return;

    // Payload speculare a EventCreationDTO del backend
    const payload = {
      associationId: associationId,
      title: title,
      description: description || null,
      location: location,
      eventDate: eventDate, // Formato stringa ISO accettato da LocalDateTime
      maxSlots: parseInt(maxSlots, 10)
    };

    try {
      setSubmitLoading(true);
      await apiClient.post('/events', payload);

      // Reset dei campi
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setMaxSlots('');

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

    // Payload speculare a BookingRequestDTO del backend
    const payload = {
      eventId: eventId,
      userId: userId
    };

    try {
      setBookingLoadingId(eventId);
      const response = await apiClient.post('/events/book', payload);
      alert(response.data.message || 'Prenotazione confermata!');

      // Aggiorna la lista eventi per riflettere il nuovo numero di posti occupati
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossibile completare la prenotazione.');
    } finally {
      setBookingLoadingId(null);
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

      {/* PANNELLO CREAZIONE EVENTO: SOLO PER ADMIN */}
      {isAdmin && (
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Pianifica Nuovo Evento Assembleare o Pubblico
          </h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Titolo Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Es: Assemblea Straordinaria Bilancio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Luogo o Piattaforma</label>
                <input
                  type="text"
                  required
                  placeholder="Es: Sede Centrale o Link Zoom"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Data e Ora</label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Posti massimi disponibili</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Es: 50"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Dettagli dell'Ordine del Giorno / Note</label>
              <textarea
                rows="3"
                placeholder="Descrivi i punti cardine dell'evento o i requisiti per partecipare..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                {submitLoading ? 'Registrazione in corso...' : 'Pianifica Evento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FEED DEGLI EVENTI IN PROGRAMMA */}
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
            <div
              key={event.id}
              className={`p-6 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
                event.cancelled
                  ? 'opacity-40 bg-red-500/5 border-red-500/20'
                  : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className={`text-lg font-medium tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'} ${event.cancelled ? 'line-through' : ''}`}>
                    {event.title}
                  </h3>
                  {event.cancelled && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider">
                      Annullato
                    </span>
                  )}
                </div>

                <p className={`text-xs font-mono ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {formatDateTime(event.eventDate)}
                </p>
                <p className="text-xs text-slate-400">
                  Luogo: <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{event.location}</span>
                </p>

                {event.description && (
                  <p className={`text-sm font-light leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {event.description}
                  </p>
                )}
              </div>

              {/* CONTROLLO POSTI E PRENOTAZIONE */}
              <div className="flex flex-col items-start md:items-end justify-between min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6 gap-3">
                <div className="text-left md:text-right">
                  <p className={`text-xs font-semibold ${isFull ? 'text-red-400' : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {isFull ? 'Tutto esaurito' : `${availableSlots} posti rimasti`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Totale: {event.bookedSlots} / {event.maxSlots} occupati
                  </p>
                </div>

                {!event.cancelled && (
                  <button
                    onClick={() => handleBookEvent(event.id)}
                    disabled={isFull || bookingLoadingId === event.id}
                    className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition active:scale-95 ${
                      isFull
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50'
                    }`}
                  >
                    {bookingLoadingId === event.id ? 'Elaborazione...' : 'Prenota Posto'}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}