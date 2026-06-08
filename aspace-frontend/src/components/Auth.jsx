import React, { useState, useEffect } from 'react';
import { login, register } from '../api/authService';
import apiClient from '../api/apiClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [associations, setAssociations] = useState([]);

  useEffect(() => {
    apiClient.get('/associations/public')
      .then(res => {
        setAssociations(res.data);
        localStorage.setItem('public_associations_cache', JSON.stringify(res.data));
      })
      .catch(err => {
        console.error("Errore nel caricamento del carosello:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        window.location.href = '/dashboard';
      } else {
        await register(username, email, password, firstName, lastName);
        alert("Registrazione completata con successo! Ora puoi accedere.");
        setIsLogin(true);
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  // Funzione di rendering della singola card riutilizzata sia per l'array reale che per il clone loop
  const renderCarouselCard = (assoc, keyId) => (
    <div
      key={keyId}
      className="h-44 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between shadow-xl group select-none"
      style={{ width: '280px', minWidth: '280px', flexShrink: 0 }}
    >
      {/* Immagine di Copertina / Banner */}
      <div className="h-16 w-full relative bg-slate-800 overflow-hidden shrink-0">
        <img
          src={assoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt="Cover"
        />
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: assoc.badgeBaseColor || '#6366f1' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
      </div>

      {/* Floating Logo Badge Sovrapposto */}
      <div className="absolute top-10 left-4 z-20 p-0.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-lg">
        <img
          src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'}
          className="w-10 h-10 rounded-lg object-cover"
          alt="Logo"
        />
      </div>

      {/* Dettagli Informativi */}
      <div className="pt-6 p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold tracking-wide truncate text-white pl-12">
            {assoc.name || 'Associazione'}
          </h4>
          <p className="text-[10px] font-light text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
            {assoc.description || 'Nessuna descrizione inserita.'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans bg-slate-950 text-white px-4 py-12">
       <style>{`
         @keyframes scrollAuthInfinite {
           0% { transform: translateX(0); }
           100% { transform: translateX(-50%); }
         }
         .animate-auth-carousel {
           animation: scrollAuthInfinite 35s linear infinite !important;
         }
         .mask-fade {
           mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
           -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
         }
       `}</style>

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-600/40 -top-20 -left-10" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-500/20 bottom-10 right-10" />
      </div>

      <div className="relative max-w-md w-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl z-10 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extralight tracking-widest text-white">
            A<span className="text-indigo-500 font-semibold">-</span>SPACE
          </h1>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-semibold">
            {isLogin ? 'Welcome Back' : 'Join the Network'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm transition-all backdrop-blur-sm" placeholder="Il tuo nome" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Nome</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm transition-all backdrop-blur-sm" placeholder="Mario" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Cognome</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm transition-all backdrop-blur-sm" placeholder="Rossi" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm transition-all backdrop-blur-sm" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm transition-all backdrop-blur-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 mt-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium underline transition-all bg-transparent border-none cursor-pointer">
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        </div>
      </div>

      {/* INTRODUZIONE REAL CAROUSEL PREMIUM IN LOOP INFINITO */}
      {associations && associations.length > 0 ? (
        <div className="mask-fade w-full z-10 mt-6 relative select-none pointer-events-none">
          <div className="flex flex-row flex-nowrap space-x-6 animate-auth-carousel min-w-max">
            {/* Blocco 1: Elementi Reali */}
            {associations.map((assoc, idx) => renderCarouselCard(assoc, `auth-real-${assoc.id || idx}`))}
            {/* Blocco 2: Copia Specchio per garantire la continuità fluida del loop */}
            {associations.map((assoc, idx) => renderCarouselCard(assoc, `auth-clone-${assoc.id || idx}`))}
          </div>
        </div>
      ) : (
        /* Fallback Shimmer */
        <div className="w-full z-10 mt-6 relative select-none pointer-events-none opacity-20">
          <div className="flex flex-row flex-nowrap space-x-6 animate-auth-carousel min-w-max">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-44 w-[280px] min-w-[280px] p-4 rounded-2xl border border-dashed border-white/20 bg-white/5 flex flex-col justify-between">
                <div className="h-16 bg-white/10 rounded-xl w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}