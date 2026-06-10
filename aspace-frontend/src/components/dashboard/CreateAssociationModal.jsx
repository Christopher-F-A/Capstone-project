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
  // Guard clause to prevent DOM layout contamination when closed
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-xl rounded-2xl p-6 border shadow-2xl flex flex-col space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/10 text-slate-900'
      }`}>

        {/* MODAL HEADER */}
        <div className="flex justify-between items-center border-b pb-3 border-white/10">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wider">Found a New Organization</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter the legal details and visual identity of your digital workspace.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={onCreateAssociation} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Organization / Non-Profit Name</label>
              <input type="text" required placeholder="e.g., Italian Developers Association" value={newName} onChange={(e) => setNewName(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Tax / Registration Code</label>
              <input type="text" required placeholder="e.g., 90012345678" value={newTaxCode} onChange={(e) => setNewTaxCode(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm font-mono focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
            </div>
          </div>

          {/* MULTIMEDIA CLOUDINARY UPLOAD HOOKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-dashed border-white/10">

            {/* LOGO INPUT */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Organization Logo (Square)</label>
                <input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files[0], 'logo')} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer" />
                {uploadingLogo && <p className="text-[10px] text-indigo-400 animate-pulse mt-1">Syncing with Cloudinary...</p>}
              </div>
              {logoUrl && (
                <div className="mt-3 relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow">
                  <img src={logoUrl} className="w-full h-full object-cover" alt="Logo preview" />
                  <button type="button" onClick={() => setLogoUrl('')} className="absolute inset-0 bg-black/60 text-[9px] font-bold uppercase tracking-wider text-red-400 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">Remove</button>
                </div>
              )}
            </div>

            {/* BANNER COVER INPUT */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Horizontal Banner (Cover)</label>
                <input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files[0], 'banner')} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer" />
                {uploadingBanner && <p className="text-[10px] text-indigo-400 animate-pulse mt-1">Syncing with Cloudinary...</p>}
              </div>
              {bannerUrl && (
                <div className="mt-3 relative w-full h-12 rounded-xl overflow-hidden border border-white/10 shadow">
                  <img src={bannerUrl} className="w-full h-full object-cover" alt="Banner preview" />
                  <button type="button" onClick={() => setBannerUrl('')} className="absolute inset-0 bg-black/60 text-[9px] font-bold uppercase tracking-wider text-red-400 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">Remove</button>
                </div>
              )}
            </div>

          </div>

          {/* IDENTITY BRAND PALETTE */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Distinctive Theme Color (Badge)</label>
            <div className="flex items-center space-x-3">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer shrink-0" />
              <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className={`w-32 px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-slate-900'}`} />
              <p className="text-[11px] text-slate-400 italic">Determines the core dynamic tint and light glow profiles of your portal ecosystem.</p>
            </div>
          </div>

          {/* MANIFESTO / DESCRIPTION */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Manifesto or Short Organization Biography</label>
            <textarea required rows="3" placeholder="Describe the mission and social purposes of your non-profit workspace..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className={`w-full px-4 py-2 rounded-xl border text-sm resize-none focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/5 border-black/10 text-slate-900'}`} />
          </div>

          {/* MODAL ACTION SUBMIT */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createLoading || uploadingLogo || uploadingBanner}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {createLoading ? 'Establishing Workspace...' : 'Incorporate Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}