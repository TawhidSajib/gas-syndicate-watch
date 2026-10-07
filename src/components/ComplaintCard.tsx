import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Flame,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Complaint } from '../types';
import { formatTimeRemaining } from '../services/complaintService';

interface ComplaintCardProps {
  complaint: Complaint;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onViewPhoto: (photoUrl: string, shopName: string, markupAmount: number) => void;
  onUpdateStatus?: (id: string, status: 'active' | 'under_review' | 'verified_syndicate') => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  currentUserId,
  isAdmin = false,
  onDelete,
  onViewPhoto,
  onUpdateStatus
}) => {
  const [copied, setCopied] = useState(false);
  const isOwner = currentUserId === complaint.userId;
  const canDelete = isOwner || isAdmin;
  const timeRemaining = formatTimeRemaining(complaint.expiresAt);

  // Compute markup percentage
  const markupPercent = complaint.govtPrice > 0
    ? Math.round((complaint.markupAmount / complaint.govtPrice) * 100)
    : 0;

  const handleCopySummary = () => {
    const text = `🚨 GAS SYNDICATE OVERCHARGE REPORT
Shop: ${complaint.shopName}
Address: ${complaint.shopAddress}, ${complaint.district}
Cylinder: ${complaint.cylinderBrand} (${complaint.cylinderSize})
Govt Fixed Price: ৳${complaint.govtPrice}
Shop Demanded Price: ৳${complaint.sellingPrice}
Syndicate Markup: +৳${complaint.markupAmount} (+${markupPercent}%)
Reported By: ${complaint.userName} (${complaint.userEmail})
Tactic: ${complaint.syndicateTactic || 'Arbitrary price inflation'}
Report Date: ${new Date(complaint.createdAt).toLocaleDateString()}
Active on Gas Syndicate Watch platform.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 hover:shadow-2xl transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Shop Name & Expiration Badge */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Store className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-lg text-slate-100 truncate" title={complaint.shopName}>
                  {complaint.shopName}
                </h3>
              </div>
              <div className="flex items-center text-xs text-slate-400 gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate" title={`${complaint.shopAddress}, ${complaint.district}`}>
                  {complaint.shopAddress}, <strong className="text-slate-300">{complaint.district}</strong>
                </span>
              </div>
            </div>

            {/* 15-Day Auto-Purge Pill */}
            <div
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                timeRemaining.isUrgent
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Complaints are active for 15 days, then deleted automatically from the database"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{timeRemaining.text}</span>
            </div>
          </div>
        </div>

        {/* Cylinder & Pricing Highlight Card */}
        <div className="px-5 py-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80">
            {/* Cylinder Specs */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-medium text-slate-200">{complaint.cylinderBrand}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300 font-bold">
                  {complaint.cylinderSize}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Official: <span className="font-mono text-slate-300 font-bold">৳{complaint.govtPrice}</span>
              </span>
            </div>

            {/* Price gouging delta comparison */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Selling Price Charged
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    ৳{complaint.sellingPrice}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  +৳{complaint.markupAmount} ({markupPercent}%)
                </span>
                <p className="text-[10px] text-red-300/80 mt-1 uppercase font-semibold">Syndicate Markup</p>
              </div>
            </div>

            {/* Visual price markup comparison bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-2"
                  style={{ width: `${Math.min(100, Math.round((complaint.govtPrice / complaint.sellingPrice) * 100))}%` }}
                  title="Official Government Rate portion"
                />
                <div
                  className="bg-red-500 h-2 animate-pulse"
                  style={{ width: `${Math.max(5, Math.min(100, Math.round((complaint.markupAmount / complaint.sellingPrice) * 100)))}%` }}
                  title="Syndicate Markup portion"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span className="text-emerald-400">Govt Rate</span>
                <span className="text-red-400 font-bold">+{complaint.markupAmount} Excess</span>
              </div>
            </div>
          </div>
        </div>

        {/* Syndicate Tactic Tag & Notes */}
        <div className="px-5 py-2 space-y-2">
          {complaint.syndicateTactic && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <Tag className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[280px]">{complaint.syndicateTactic}</span>
            </div>
          )}

          {complaint.notes && (
            <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850 italic">
              "{complaint.notes}"
            </p>
          )}
        </div>

        {/* Evidence Photo Preview */}
        {complaint.evidencePhotoUrl ? (
          <div className="px-5 py-2">
            <div
              onClick={() => onViewPhoto(complaint.evidencePhotoUrl!, complaint.shopName, complaint.markupAmount)}
              className="group relative h-36 rounded-xl overflow-hidden cursor-pointer border border-slate-800 bg-slate-950 shadow-inner"
            >
              <img
                src={complaint.evidencePhotoUrl}
                alt="Shop Evidence"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-xs text-white font-medium flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-700">
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                  View Photo Evidence
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-2">
            <div className="h-16 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-xs text-slate-500">
              No evidence photo attached
            </div>
          </div>
        )}
      </div>

      {/* Footer: User Identity (strictly Gmail & Name as specified) & Actions */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-full bg-slate-800 text-slate-400 shrink-0">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate" title={complaint.userName}>
              {complaint.userName}
            </p>
            <p className="text-[11px] text-slate-400 truncate font-mono" title={complaint.userEmail}>
              {complaint.userEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Admin Status Selector */}
          {isAdmin && onUpdateStatus && (
            <select
              value={complaint.status || 'active'}
              onChange={(e) =>
                onUpdateStatus(
                  complaint.id,
                  e.target.value as 'active' | 'under_review' | 'verified_syndicate'
                )
              }
              className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-amber-300 font-medium focus:outline-none cursor-pointer"
              title="Admin Moderation Status"
            >
              <option value="active">Active</option>
              <option value="under_review">Review</option>
              <option value="verified_syndicate">Verified</option>
            </select>
          )}

          {/* Copy Report */}
          <button
            onClick={handleCopySummary}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Copy Report Dossier"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Delete Action (Owner or Admin) */}
          {canDelete && (
            <button
              onClick={() => {
                if (isAdmin && !isOwner) {
                  if (
                    window.confirm(
                      `Admin Action: Are you sure you want to remove the post for "${complaint.shopName}" reported by ${complaint.userName} (${complaint.userEmail})?`
                    )
                  ) {
                    onDelete(complaint.id);
                  }
                } else {
                  onDelete(complaint.id);
                }
              }}
              className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                isAdmin && !isOwner
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
              title={isAdmin && !isOwner ? 'Admin Remove Post' : 'Delete my complaint'}
            >
              <Trash2 className="w-4 h-4" />
              {isAdmin && !isOwner && <span className="text-[10px] font-bold">Admin Remove</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
