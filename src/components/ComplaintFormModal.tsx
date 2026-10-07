import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Store,
  MapPin,
  Flame,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Complaint } from '../types';
import {
  OFFICIAL_PRICING_BENCHMARKS,
  COMMON_LPG_BRANDS,
  SYNDICATE_TACTICS,
  BANGLADESH_REGIONS
} from '../constants/marketData';
import { compressEvidenceImage, generateDemoEvidencePhoto } from '../utils/imageCompressor';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onSubmitComplaint: (
    data: Omit<Complaint, 'id' | 'createdAt' | 'expiresAt'>
  ) => Promise<void>;
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onSubmitComplaint
}) => {
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [district, setDistrict] = useState(BANGLADESH_REGIONS[0]);
  const [cylinderBrand, setCylinderBrand] = useState(COMMON_LPG_BRANDS[0]);
  const [cylinderSize, setCylinderSize] = useState('12kg');
  const [govtPrice, setGovtPrice] = useState<number>(1455);
  const [sellingPrice, setSellingPrice] = useState<string>('1850');
  const [syndicateTactic, setSyndicateTactic] = useState(SYNDICATE_TACTICS[0]);
  const [notes, setNotes] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Update govt price benchmark when size changes
  useEffect(() => {
    const benchmark = OFFICIAL_PRICING_BENCHMARKS[cylinderSize];
    if (benchmark) {
      setGovtPrice(benchmark.officialGovtRate);
    }
  }, [cylinderSize]);

  // Derived calculations
  const parsedSellingPrice = Number(sellingPrice) || 0;
  const markupAmount = Math.max(0, parsedSellingPrice - govtPrice);
  const markupPercentage = govtPrice > 0 ? Math.round((markupAmount / govtPrice) * 100) : 0;

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setFormError(null);
      const compressed = await compressEvidenceImage(file);
      setEvidencePhotoUrl(compressed);
    } catch (err) {
      console.error(err);
      setFormError('Failed to process image. Please choose another JPG or PNG.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleGenerateSamplePhoto = () => {
    const demo = generateDemoEvidencePhoto(
      shopName || 'Retail Gas Corner',
      cylinderBrand,
      parsedSellingPrice || 1850
    );
    setEvidencePhotoUrl(demo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('You must sign in with your Google account to submit a verified complaint.');
      return;
    }

    if (!shopName.trim() || shopName.length < 2) {
      setFormError('Please provide a valid shop name (at least 2 characters).');
      return;
    }

    if (!shopAddress.trim() || shopAddress.length < 5) {
      setFormError('Please enter a specific shop address or street location (at least 5 characters).');
      return;
    }

    if (parsedSellingPrice <= 0) {
      setFormError('Selling price must be greater than zero.');
      return;
    }

    if (parsedSellingPrice <= govtPrice) {
      setFormError(`Selling price (${parsedSellingPrice}) should exceed the official rate (৳${govtPrice}) to report an overcharge.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      // Only stores Gmail and name as requested
      const payload: Omit<Complaint, 'id' | 'createdAt' | 'expiresAt'> = {
        shopName: shopName.trim(),
        shopAddress: shopAddress.trim(),
        district,
        cylinderBrand,
        cylinderSize,
        govtPrice,
        sellingPrice: parsedSellingPrice,
        markupAmount,
        status: 'active',
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Citizen Reporter',
        userEmail: currentUser.email || ''
      };

      if (syndicateTactic.trim()) {
        payload.syndicateTactic = syndicateTactic.trim();
      }
      if (notes.trim()) {
        payload.notes = notes.trim();
      }
      if (evidencePhotoUrl.trim()) {
        payload.evidencePhotoUrl = evidencePhotoUrl.trim();
      }

      await onSubmitComplaint(payload);

      onClose();
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Error submitting complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report Gas Syndicate Overcharge"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Report Syndicate Overcharging</h2>
              <p className="text-xs text-slate-400">
                Log cylinder price gouging with photo evidence • 15-day public dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* User Sign-In Barrier check */}
          {!currentUser ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google Authentication Required</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  To prevent fraudulent or automated reporting, users must sign in with their Google account.
                  Per privacy guidelines, <strong>only your Gmail address and name</strong> will be stored and displayed.
                </p>
              </div>
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#1e293b"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#1e293b"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google to Continue</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authenticated Identity Pill */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-slate-400">Reporting as: </span>
                    <strong className="text-slate-200">{currentUser.displayName}</strong>
                    <span className="text-slate-400 font-mono ml-1.5">({currentUser.email})</span>
                  </div>
                </div>
                <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  15-Day Session Active
                </span>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Shop Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  Shop Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Shop / Distributor Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Al-Madina Gas & Store"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      District / Area <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    >
                      {BANGLADESH_REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Shop Address / Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="e.g. Shop #12, Road 4, Sector 7 Main Market"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Cylinder & Pricing Breakdown */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Cylinder Brand & Syndicate Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      LPG Cylinder Brand <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={cylinderBrand}
                      onChange={(e) => setCylinderBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    >
                      {COMMON_LPG_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Cylinder Capacity / Weight <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={cylinderSize}
                      onChange={(e) => setCylinderSize(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="12kg">12 kg (Standard Household)</option>
                      <option value="5.5kg">5.5 kg (Mini Cylinder)</option>
                      <option value="35kg">35 kg (Commercial)</option>
                      <option value="45kg">45 kg (Heavy Industrial)</option>
                    </select>
                  </div>
                </div>

                {/* Price Calculation Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Govt Regulated Price
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-slate-400 mr-1.5">৳</span>
                      <input
                        type="number"
                        min="0"
                        value={govtPrice}
                        onChange={(e) => setGovtPrice(Number(e.target.value))}
                        className="w-full py-2 bg-transparent text-slate-200 font-mono text-base font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">Official rate</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Selling Price Charged <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-slate-400 mr-1.5">৳</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        placeholder="e.g. 1900"
                        className="w-full py-2 bg-slate-900 px-2 rounded-lg border border-slate-700 text-amber-300 font-mono text-lg font-black focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">Shop demanded</span>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">
                      Syndicate Markup Imposed
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-red-400 font-mono">
                        +৳{markupAmount}
                      </span>
                      <span className="text-xs font-bold text-red-300 font-mono">
                        (+{markupPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Syndicate Tactics & Notes */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Syndicate Tactic / Violation Observed
                  </label>
                  <select
                    value={syndicateTactic}
                    onChange={(e) => setSyndicateTactic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {SYNDICATE_TACTICS.map((tactic) => (
                      <option key={tactic} value={tactic}>
                        {tactic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Additional Incident Notes / Dialogue (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. The shopkeeper claimed distributors had stopped deliveries and demanded cash without a receipt..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Upload Photo of Shop / Price Board / Cylinders
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSamplePhoto}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-create photo evidence
                  </button>
                </div>

                {evidencePhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-48 flex items-center justify-center">
                    <img
                      src={evidencePhotoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEvidencePhotoUrl('')}
                      className="absolute top-3 right-3 p-1.5 bg-black/80 hover:bg-red-600 text-white rounded-lg transition-colors text-xs flex items-center gap-1 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      id="evidence-file-input"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="evidence-file-input"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="p-3 bg-slate-800 rounded-full text-amber-400">
                        {isCompressing ? (
                          <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-200">
                        {isCompressing ? 'Optimizing photo...' : 'Click to select shop photo or drag & drop'}
                      </div>
                      <p className="text-xs text-slate-500">
                        JPG, PNG, WebP • Auto-compressed for instant loading
                      </p>
                    </label>
                  </div>
                )}
              </div>

              {/* 15-Day Policy Confirmation Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200">15-Day Life Cycle Policy:</strong>
                  <p className="mt-0.5">
                    Your complaint will remain visible in the database for 15 days, allowing citizens and regulators to take action. After 15 days, the complaint will be permanently purged.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-sm font-bold shadow-lg shadow-red-900/40 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Filing Complaint...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Submit 15-Day Verified Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
