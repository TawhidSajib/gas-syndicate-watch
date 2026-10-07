import React from 'react';
import { Clock, ShieldCheck, AlertCircle, PlusCircle, Trash2, CheckCircle2, Flame } from 'lucide-react';
import { User } from 'firebase/auth';
import { Complaint } from '../types';
import { ComplaintCard } from './ComplaintCard';

interface MyComplaintsViewProps {
  currentUser: User | null;
  complaints: Complaint[];
  onOpenReportModal: () => void;
  onDeleteComplaint: (id: string) => void;
  onViewPhoto: (photoUrl: string, shopName: string, markupAmount: number) => void;
  onLogin: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  currentUser,
  complaints,
  onOpenReportModal,
  onDeleteComplaint,
  onViewPhoto,
  onLogin
}) => {
  if (!currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to View Your 15-Day Complaints</h2>
        <p className="text-sm text-slate-400 mb-6">
          Your complaints remain stored in your 15-day active session window. Sign in with your Google account to manage your reports and monitor enforcement.
        </p>
        <button
          onClick={onLogin}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
        >
          <span>Sign In With Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 15-Day Session Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">My 15-Day Complaint Vault</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Logged in as <strong className="text-slate-200">{currentUser.displayName}</strong> ({currentUser.email}).
              Your active complaint submissions are maintained for 15 days before automatic database cleanup.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold text-sm shadow-lg shadow-red-900/30 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Another Shop</span>
          </button>
        </div>

        {/* Informational badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>15-day active persistent session</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Complaints auto-purged on expiry</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Only Gmail & name publicly displayed</span>
          </div>
        </div>
      </div>

      {/* Complaints Grid or Empty State */}
      {complaints.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Complaints Found</h3>
          <p className="text-xs text-slate-400 mb-6">
            You haven't reported any shops in the current 15-day window, or your previous complaints have reached their 15-day expiration and been automatically deleted.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            File a New Complaint Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              currentUserId={currentUser.uid}
              onDelete={onDeleteComplaint}
              onViewPhoto={onViewPhoto}
            />
          ))}
        </div>
      )}
    </div>
  );
};
