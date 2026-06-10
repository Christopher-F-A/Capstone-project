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
        console.error("Error loading carousel:", err);
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
        alert("Registration completed successfully! You can now sign in.");
        setIsLogin(true);
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const renderCarouselCard = (assoc, keyId) => {
    const accentColor = assoc.badgeBaseColor || '#6366f1';

    return (
      <div
        key={keyId}
        className="h-44 p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden flex flex-col justify-between shadow-lg group bg-white/40"
        style={{
          width: '400px',
          minWidth: '400px',
          flexShrink: 0,
          borderColor: `${accentColor}25`,
          boxShadow: `0 15px 35px -10px ${accentColor}20, 0 5px 15px -3px rgba(148, 163, 184, 0.08)`
        }}
      >
        {/* BANNER INTEGRALE SULLO SFONDO ASSOLUTO DELLA CARD */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl">
          <img src={assoc.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} className="w-full h-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105" alt="Cover BG" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/75 to-white/90" />
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accentColor }} />
        </div>

        {/* GEOMETRIA STRUTTURALE ALLINEATA AD EXPLORENETWORK */}
        <div className="relative z-10 flex flex-row items-start justify-between gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-semibold tracking-wide truncate mb-0.5 text-slate-900">{assoc.name || 'Organization'}</h4>
          </div>

          <div style={{ borderColor: `${accentColor}33` }} className="p-0.5 rounded-xl bg-white/60 backdrop-blur-md border shadow shrink-0">
            <img src={assoc.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150'} className="w-9 h-9 rounded-lg object-cover" alt="Logo" />
          </div>
        </div>

        {/* Descrizione a pieno spettro senza interruzioni */}
        <p className="text-xs font-light line-clamp-2 leading-relaxed relative z-10 w-full text-slate-600">
          {assoc.description || 'No description provided for this organization.'}
        </p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans bg-gradient-to-tr from-slate-50 via-slate-100 to-slate-200 text-slate-900 selection:bg-indigo-500/10">
       
       <style>{`
         .mask-fade {
           opacity: 0.95 !important;
           mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
           -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
         }
         .carousel-container {
           overflow: hidden;
           width: 100%;
           position: relative;
         }
         .carousel-track {
           display: flex;
           width: max-content;
           flex-wrap: nowrap;
           gap: 24px;
           animation: smoothScrollInfinite 50s linear infinite !important;
         }
         @keyframes smoothScrollInfinite {
           0% { transform: translateX(0); }
           100% { transform: translateX(-50%); }
         }
       `}</style>

      {/* Luce soffusa d'atmosfera fissa */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[140px] bg-indigo-300/40 -top-40 -left-20 animate-pulse duration-[8000ms]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-300/30 bottom-20 right-10" />
      </div>

      {/* ========================================================================= */}
      {/* MODIFICATO CHIRURGICAMENTE: COLORI ACCENTUATI DI UN ULTERIORE +5%          */}
      {/* ========================================================================= */}
      {associations && associations.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mask-fade transition-all duration-1000">
          <div className="carousel-container h-full">
            <div className="carousel-track h-full items-end">
              
              {/* Blocco 1: Canali reali */}
              {associations.map((assoc, idx) => (
                <div
                  key={`bg-beam-real-${assoc.id || idx}`}
                  style={{
                    width: '400px',
                    minWidth: '400px',
                    // MODIFICATO: Base alzata a 55 (~33% di forza) e riflessi alti a 26 (~15%) bilanciati col grigio
                    background: `linear-gradient(to top, ${assoc.badgeBaseColor || '#6366f1'}55 0%, rgba(148, 163, 184, 0.15) 45%, ${assoc.badgeBaseColor || '#6366f1'}26 75%, transparent 100%)`,
                    filter: 'blur(110px)'
                  }}
                  className="h-[120vh]"
                />
              ))}

              {/* Blocco 2: Copie specchio */}
              {associations.map((assoc, idx) => (
                <div
                  key={`bg-beam-clone-${assoc.id || idx}`}
                  style={{
                    width: '400px',
                    minWidth: '400px',
                    background: `linear-gradient(to top, ${assoc.badgeBaseColor || '#6366f1'}55 0%, rgba(148, 163, 184, 0.15) 45%, ${assoc.badgeBaseColor || '#6366f1'}26 75%, transparent 100%)`,
                    filter: 'blur(110px)'
                  }}
                  className="h-[120vh]"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TWO-COLUMN SPLIT LANDING VIEW CONTAINER */}
      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 z-10 pt-12 lg:pt-0">
        
        {/* LEFT COLUMN: BRAND VALUES & CONCISE ACTIONS */}
        <div className="lg:col-span-7 space-y-8 lg:pr-8 text-left">
          <div className="space-y-4">

            <h2 className="text-4xl sm:text-5xl font-extralight tracking-tight text-slate-900 leading-[1.15]">
              Find the community <br />
              you'll <span className="text-indigo-600 font-normal">love to support.</span>
            </h2>
            <p className="text-sm text-slate-500 font-light max-w-xl leading-relaxed">
              Discover active organizations near you, join events, and take a core role in guiding communities toward transparent governance.
            </p>
          </div>

          {/* BENTO GRID (Testi riscritti: Concisione e massimo impatto UX) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="p-5 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md space-y-2 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="text-indigo-600 font-bold text-xs font-mono uppercase tracking-wider">Real-Time Updates</div>
              <h4 className="text-sm font-semibold text-slate-800">Follow Your Favorites</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">Stay closely connected with the latest news. Track live dashboards, statements, and official communications from the associations you care about most.</p>
            </div>

            <div className="p-5 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md space-y-2 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="text-indigo-600 font-bold text-xs font-mono uppercase tracking-wider">Live Events</div>
              <h4 className="text-sm font-semibold text-slate-800">Join Initiatives</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">Take an active part in gatherings, assemblies, and official workshops. Secure your seat instantly with automated cloud reservation management.</p>
            </div>

            <div className="p-5 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md space-y-2 transition-all duration-300 shadow-sm hover:shadow-md sm:col-span-2">
              <div className="text-indigo-600 font-bold text-xs font-mono uppercase tracking-wider">Active Deliberation</div>
              <h4 className="text-sm font-semibold text-slate-800">Cast Secure Votes or Manage an ETS</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">Drive internal community decisions through trusted, unique anti-duplication polls. Ready to lead? Found and administer your own official Third Sector association with fully automated cloud structures.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CRYSTAL BRIGHT FORM VIEW */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md p-8 rounded-3xl border bg-white/70 border-white/80 backdrop-blur-2xl shadow-2xl shadow-slate-300/60 relative">
            <div className="text-center mb-6 flex flex-col items-center justify-center">
                          <img
                            src="/A-SPACE_.png"
                            alt="A-SPACE Logo"
                            className="h-10 w-auto object-contain"
                          />
                          <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                            {isLogin ? 'Sign In to Your Space' : 'Join the Network Today'}
                          </p>
                        </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs transition-all shadow-inner" placeholder="Choose username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs transition-all shadow-inner" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs transition-all shadow-inner" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs transition-all shadow-inner" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                <input type="password" required className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs transition-all shadow-inner" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Get Started'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 text-indigo-600 hover:text-indigo-700 font-semibold underline transition-all bg-transparent border-none cursor-pointer">
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* CAROSELLO DELLE CARD */}
      <div className="pt-8 pb-12 w-full overflow-hidden shrink-0 z-10 relative">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-6 max-w-7xl mx-auto">
          Explore organizations active on the network
        </h2>

        {associations && associations.length > 0 ? (
          <div className="carousel-container mask-fade w-full select-none pointer-events-none">
            <div className="carousel-track">
              {associations.map((assoc, idx) => renderCarouselCard(assoc, `auth-real-${assoc.id || idx}`))}
              {associations.map((assoc, idx) => renderCarouselCard(assoc, `auth-clone-${assoc.id || idx}`))}
            </div>
          </div>
        ) : (
          <div className="carousel-container w-full select-none pointer-events-none opacity-40">
            <div className="carousel-track">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-44 w-[400px] min-w-[400px] p-5 rounded-2xl border border-dashed border-slate-200 bg-white/50 flex flex-col justify-between shadow-sm">
                  <div className="h-16 bg-slate-100 rounded-xl w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mt-2" />
                </div>
              ))}
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={`skeleton-clone-${item}`} className="h-44 w-[400px] min-w-[400px] p-5 rounded-2xl border border-dashed border-slate-200 bg-white/50 flex flex-col justify-between shadow-sm">
                  <div className="h-16 bg-slate-100 rounded-xl w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}