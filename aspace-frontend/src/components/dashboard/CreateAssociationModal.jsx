import React from 'react';

export default function CreateAssociationModal({
  showModal,
  setShowModal,
  newName,
  setNewName,
  newTaxCode,
  setNewTaxCode,
  newDesc,
  setNewDesc,
  newColor,
  setNewColor,
  onCreateAssociation,
  createLoading,
  isDarkMode,
  logoUrl,
  setLogoUrl,
  bannerUrl,
  setBannerUrl,
  uploadingLogo,
  uploadingBanner,
  onImageUpload
}) {
  // Se lo stato showModal è false, il modale non deve occupare memoria a schermo
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-xl rounded-2xl p-6 border shadow-2xl flex flex-col space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'
      }`}>

        {/* TESTATA MODALE */}
        <div className="flex justify-between items-center border-b pb-3 border-white/10">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wider">Fonda una nuova Organizzazione</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Inserisci i dati legali e l'identità visiva del tuo spazio digitale.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer"
          >
            Annulla
          </button>
        </div>

        {/* FORM DI COMPILAZIONE */}
        <form onSubmit={onCreateAssociation} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Nome dell'Associazione / ETS</label>
              <input type="text" required placeholder="Es: Associazione Sviluppatori Italiani" value={newName} onChange={(e) => setNewName(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Codice Fiscale Ente</label>
              <input type="text" required placeholder="Es: 90012345678" value={newTaxCode} onChange={(e) => setNewTaxCode(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm font-mono focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
            </div>
          </div>

          {/* SEZIONE MULTIMEDIALE UPLOAD IMMAGINI SU CLOUDINARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-dashed border-white/10">

            {/* FILE INPUT: LOGO */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Logo dell'Ente (Quadrato)</label>
                <input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files[0], 'logo')} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer" />
                {uploadingLogo && <p className="text-[10px] text-indigo-400 animate-pulse mt-1">Sincronizzazione Cloudinary...</p>}
              </div>
              {logoUrl && (
                <div className="mt-3 relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow">
                  <img src={logoUrl} className="w-full h-full object-cover" alt="Logo preview" />
                  <button type="button" onClick={() => setLogoUrl('')} className="absolute inset-0 bg-black/60 text-[9px] font-bold uppercase tracking-wider text-red-400 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">Rimuovi</button>
                </div>
              )}
            </div>

            {/* FILE INPUT: BANNER COPERTINA */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Banner Orizzontale (Copertina)</label>
                <input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files[0], 'banner')} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer" />
                {uploadingBanner && <p className="text-[10px] text-indigo-400 animate-pulse mt-1">Sincronizzazione Cloudinary...</p>}
              </div>
              {bannerUrl && (
                <div className="mt-3 relative w-full h-12 rounded-xl overflow-hidden border border-white/10 shadow">
                  <img src={bannerUrl} className="w-full h-full object-cover" alt="Banner preview" />
                  <button type="button" onClick={() => setBannerUrl('')} className="absolute inset-0 bg-black/60 text-[9px] font-bold uppercase tracking-wider text-red-400 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">Rimuovi</button>
                </div>
              )}
            </div>

          </div>

          {/* PALETTE COLORE ISTITUZIONALE */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Colore Tematico Distintivo (Badge)</label>
            <div className="flex items-center space-x-3">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer shrink-0" />
              <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className={`w-32 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
              <p className="text-[11px] text-slate-400 italic">Determina il colore del pallino e delle finiture grafiche dell'ente.</p>
            </div>
          </div>

          {/* MANIFESTO E DESCRIZIONE */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Manifesto o Breve Biografia dell'Associazione</label>
            <textarea required rows="3" placeholder="Scrivi una breve descrizione degli scopi sociali dell'organizzazione..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
          </div>

          {/* BOTTONE FINALE DI SPEDIZIONE */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createLoading || uploadingLogo || uploadingBanner}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {createLoading ? 'Fondazione in corso...' : 'Costituisci Associazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}