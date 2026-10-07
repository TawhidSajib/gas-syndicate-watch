import React from 'react';
import { X, ZoomIn, Store, AlertTriangle } from 'lucide-react';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  shopName: string;
  markupAmount: number;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  onClose,
  photoUrl,
  shopName,
  markupAmount
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Evidence Photo Lightbox"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <Store className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-white text-base">{shopName}</h3>
              <p className="text-xs text-red-400 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                Evidence of +৳{markupAmount} syndicate markup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Photo Container */}
        <div className="p-4 flex items-center justify-center max-h-[75vh] bg-slate-950/70 overflow-hidden">
          <img
            src={photoUrl}
            alt={`Evidence against ${shopName}`}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="w-4 h-4 text-slate-500" />
            Citizen Verified Photo Evidence
          </span>
          <span className="text-slate-500 font-mono">15-Day Auto-Purge Protection Active</span>
        </div>
      </div>
    </div>
  );
};
