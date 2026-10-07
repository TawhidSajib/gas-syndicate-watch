import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown, Building, Flame } from 'lucide-react';
import { SortOption } from '../types';
import { BANGLADESH_REGIONS, COMMON_LPG_BRANDS } from '../constants/marketData';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDistrict,
  setSelectedDistrict,
  selectedBrand,
  setSelectedBrand,
  sortBy,
  setSortBy,
  onReset,
  totalFilteredCount
}) => {
  const isFiltered = searchQuery || selectedDistrict || selectedBrand || sortBy !== 'markup_desc';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shop, address, or brand..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* District Filter */}
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Regions & Districts</option>
            {BANGLADESH_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="relative">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Cylinder Brands</option>
            {COMMON_LPG_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="relative flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="markup_desc">Highest Markup (Worst Gouging)</option>
            <option value="markup_asc">Lowest Markup</option>
            <option value="newest">Newest Reports First</option>
            <option value="selling_price_desc">Highest Retail Selling Price</option>
          </select>

          {isFiltered && (
            <button
              onClick={onReset}
              title="Reset Filters"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter summary status */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <span>
          Showing <strong className="text-amber-400">{totalFilteredCount}</strong> active syndicate reports
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Query indexed on Firestore • Auto-purged at 15 days
        </span>
      </div>
    </div>
  );
};
