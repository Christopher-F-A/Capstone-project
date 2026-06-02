import React from 'react';

export default function CreateAssociationModal({
  showModal,
  setShowModal,
  newName,
  setNewName,
  newTaxCode,
  setNewTaxCode,
  newColor,
  setNewColor,
  newDesc,
  setNewDesc,
  onCreateAssociation,
  createLoading,
  isDarkMode
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 transition-all">
      <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl backdrop-blur-2xl ${isDarkMode ? 'bg-slate-900/90 border-white/10 text-white' : 'bg-white/95 border-black/10 text-slate-800'}`}>
        <h2 className="text-xl font-light mb-6">Nuovo Ente <span className="text-indigo-500 font-normal">A-SPACE</span></h2>
        <form onSubmit={onCreateAssociation} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Nome Organizzazione</label>
            <input type="text" required className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} placeholder="es. Associazione Terzo Settore" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Codice Fiscale / ETS</label>
            <input type="text" required maxLength="11" className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} placeholder="11 caratteri" value={newTaxCode} onChange={(e) => setNewTaxCode(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Colore Tematico Badge</label>
            <div className={`flex items-center space-x-3 border px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white/5 border-black/5'}`}>
              <input type="color" className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
              <span className="text-xs font-mono text-slate-400">{newColor.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Descrizione Istituzionale</label>
            <textarea required rows="3" className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none transition-all focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} placeholder="Finalità dell'associazione..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          <div className={`flex justify-end space-x-3 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider font-medium hover:text-slate-500 transition">Annulla</button>
            <button type="submit" disabled={createLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition disabled:opacity-50 shadow-lg">{createLoading ? 'Salvataggio...' : 'Crea Ente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}