import React, { useState } from 'react';
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Store,
  Mail,
  User as UserIcon,
  Filter,
  Check,
  Flame,
  Clock
} from 'lucide-react';
import { Complaint } from '../types';
import { formatTimeRemaining } from '../services/complaintService';

interface AdminConsoleViewProps {
  complaints: Complaint[];
  adminEmail: string;
  onDeleteComplaint: (id: string) => void;
  onUpdateStatus: (id: string, status: 'active' | 'under_review' | 'verified_syndicate') => void;
  onViewPhoto: (photoUrl: string, shopName: string, markupAmount: number) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  complaints,
  adminEmail,
  onDeleteComplaint,
  onUpdateStatus,
  onViewPhoto
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter complaints by user Gmail address or name
  const filtered = complaints.filter((c) => {
    const q = userSearch.toLowerCase().trim();
    const matchesUser =
      !q ||
      c.userEmail.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q) ||
      c.shopName.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (!c.status || c.status === 'active')) ||
      c.status === statusFilter;

    return matchesUser && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                <ShieldAlert className="w-7 h-7" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Admin Moderation Console</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                    Superadmin Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Authorized Administrator: <strong className="text-amber-400 font-mono">{adminEmail}</strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              As an authorized admin, you can inspect the verified <strong>Gmail address</strong> and <strong>name</strong> of citizen reporters, verify syndicate fraud evidence, and delete/remove any inappropriate or fraudulent post from the database.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Total Complaints in DB</p>
              <p className="text-2xl font-black text-white font-mono">{complaints.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Unique Citizen Reporters</p>
              <p className="text-2xl font-black text-amber-400 font-mono">
                {new Set(complaints.map((c) => c.userEmail)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by Reporter Gmail, Name, or Shop..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="active">Active Reports</option>
            <option value="verified_syndicate">Verified Syndicate</option>
            <option value="under_review">Under Investigation</option>
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Shop & Location</th>
                <th className="py-3.5 px-4">Cylinder & Markup</th>
                <th className="py-3.5 px-4">Citizen Reporter (Gmail & Name)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">15-Day Lifespan</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No complaints matched your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const time = formatTimeRemaining(c.expiresAt);
                  return (
                    <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                      {/* Shop */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.shopName}</span>
                        </div>
                        <p className="text-slate-400 truncate max-w-[200px] mt-0.5">
                          {c.shopAddress}, <span className="text-slate-300 font-medium">{c.district}</span>
                        </p>
                      </td>

                      {/* Cylinder & Markup */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-semibold">{c.cylinderBrand}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-300">
                            {c.cylinderSize}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-slate-300 font-mono">৳{c.sellingPrice}</span>
                          <span className="text-red-400 font-bold font-mono">
                            (+৳{c.markupAmount})
                          </span>
                        </div>
                      </td>

                      {/* Reporter Gmail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-full bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{c.userName}</p>
                            <p className="text-amber-400 font-mono flex items-center gap-1 mt-0.5 font-medium">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {c.userEmail}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              UID: {c.userId.substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Moderation Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={c.status || 'active'}
                          onChange={(e) =>
                            onUpdateStatus(
                              c.id,
                              e.target.value as 'active' | 'under_review' | 'verified_syndicate'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-750 text-xs font-semibold focus:outline-none focus:border-red-500 text-slate-200 cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="under_review">Under Investigation</option>
                          <option value="verified_syndicate">Verified Syndicate</option>
                        </select>
                      </td>

                      {/* Lifespan */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {time.text}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.evidencePhotoUrl && (
                            <button
                              onClick={() => onViewPhoto(c.evidencePhotoUrl!, c.shopName, c.markupAmount)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                              title="View Photo Evidence"
                            >
                              <ExternalLink className="w-4 h-4 text-amber-400" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Admin Confirmation: Are you sure you want to permanently remove the report for "${c.shopName}" posted by ${c.userName} (${c.userEmail})?`
                                )
                              ) {
                                onDeleteComplaint(c.id);
                              }
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all font-semibold"
                            title="Admin Remove Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
