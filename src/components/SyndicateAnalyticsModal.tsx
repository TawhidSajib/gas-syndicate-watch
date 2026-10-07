import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Building, Flame, MapPin } from 'lucide-react';
import { Complaint } from '../types';

interface SyndicateAnalyticsViewProps {
  complaints: Complaint[];
}

export const SyndicateAnalyticsView: React.FC<SyndicateAnalyticsViewProps> = ({ complaints }) => {
  // Aggregate by district
  const districtStats: Record<string, { count: number; totalMarkup: number; maxPrice: number }> = {};
  complaints.forEach((c) => {
    const dist = c.district || 'Other';
    if (!districtStats[dist]) {
      districtStats[dist] = { count: 0, totalMarkup: 0, maxPrice: 0 };
    }
    districtStats[dist].count += 1;
    districtStats[dist].totalMarkup += c.markupAmount || 0;
    if (c.sellingPrice > districtStats[dist].maxPrice) {
      districtStats[dist].maxPrice = c.sellingPrice;
    }
  });

  const sortedDistricts = Object.entries(districtStats)
    .map(([district, stat]) => ({
      district,
      count: stat.count,
      avgMarkup: Math.round(stat.totalMarkup / stat.count),
      maxPrice: stat.maxPrice
    }))
    .sort((a, b) => b.count - a.count);

  // Aggregate by brand
  const brandStats: Record<string, { count: number; totalMarkup: number }> = {};
  complaints.forEach((c) => {
    const brand = c.cylinderBrand || 'Unknown';
    if (!brandStats[brand]) {
      brandStats[brand] = { count: 0, totalMarkup: 0 };
    }
    brandStats[brand].count += 1;
    brandStats[brand].totalMarkup += c.markupAmount || 0;
  });

  const sortedBrands = Object.entries(brandStats)
    .map(([brand, stat]) => ({
      brand,
      count: stat.count,
      avgMarkup: Math.round(stat.totalMarkup / stat.count)
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Analytics Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Syndicate Hotspot & Mark-up Analytics</h2>
            <p className="text-xs text-slate-400">
              Aggregated real-time citizen reporting patterns within current 15-day cycle
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Syndicate Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Top Syndicate Hotspots by District
          </h3>

          {sortedDistricts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No district data available yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedDistricts.map((item, idx) => (
                <div
                  key={item.district}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.district}</p>
                      <p className="text-xs text-slate-500">
                        {item.count} flagged {item.count === 1 ? 'shop' : 'shops'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-red-400 font-mono">
                      +৳{item.avgMarkup}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase">Avg markup</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Gouged Brands */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Most Targeted Gas Cylinder Brands
          </h3>

          {sortedBrands.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No brand data available yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedBrands.map((item, idx) => (
                <div
                  key={item.brand}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.brand}</p>
                      <p className="text-xs text-slate-500">{item.count} price-gouging reports</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400 font-mono">
                      +৳{item.avgMarkup}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase">Avg Syndicate Excess</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
