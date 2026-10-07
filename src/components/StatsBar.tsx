import React from 'react';
import { TrendingUp, AlertTriangle, Building2, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Complaint } from '../types';

interface StatsBarProps {
  complaints: Complaint[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ complaints }) => {
  const totalComplaints = complaints.length;

  const totalMarkup = complaints.reduce((sum, c) => sum + (c.markupAmount || 0), 0);
  const avgMarkup = totalComplaints > 0 ? Math.round(totalMarkup / totalComplaints) : 0;

  // Average markup percentage
  const avgMarkupPercent = totalComplaints > 0
    ? Math.round(
        complaints.reduce((sum, c) => {
          const base = c.govtPrice || 1455;
          return sum + ((c.markupAmount || 0) / base) * 100;
        }, 0) / totalComplaints
      )
    : 0;

  // Find highest markup
  const highestMarkup = complaints.reduce(
    (max, c) => (c.markupAmount > max ? c.markupAmount : max),
    0
  );

  // Find most reported district
  const districtCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    if (c.district) {
      districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
    }
  });
  let topDistrict = 'N/A';
  let maxCount = 0;
  Object.entries(districtCounts).forEach(([district, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topDistrict = district;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Total Active Reports */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Active 15-Day Dossiers</span>
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalComplaints}</span>
          <span className="text-xs text-slate-400">shops flagged</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Live citizen complaints within 15d</p>
      </div>

      {/* Average Syndicate Markup */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Syndicate Markup</span>
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">+{avgMarkupPercent}%</span>
          <span className="text-xs text-amber-300 font-mono">(+৳{avgMarkup})</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Above official government price</p>
      </div>

      {/* Highest Reported Gouge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Peak Overcharge</span>
          <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-red-400">
            ৳{highestMarkup}
          </span>
          <span className="text-xs text-red-300 flex items-center font-bold">
            <ArrowUpRight className="w-3.5 h-3.5 inline" /> Max
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Single cylinder illegal markup</p>
      </div>

      {/* Syndicate Hotspot */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Top Syndicate Hub</span>
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Building2 className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-lg sm:text-xl font-bold text-slate-200 truncate" title={topDistrict}>
            {topDistrict}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {maxCount > 0 ? `${maxCount} separate reports lodged` : 'No reports yet'}
        </p>
      </div>
    </div>
  );
};
