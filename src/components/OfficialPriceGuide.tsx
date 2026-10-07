import React from 'react';
import { Scale, Phone, AlertCircle, FileText, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { OFFICIAL_PRICING_BENCHMARKS } from '../constants/marketData';

export const OfficialPriceGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Benchmark Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Official Government LPG Price Benchmarks</h2>
            <p className="text-xs text-slate-400">
              Energy Regulatory Commission (BERC) Maximum Retail Price (MRP) Reference
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Under the Consumer Rights Protection Act and national energy distribution guidelines, retailers and distributors are legally prohibited from charging any amount exceeding the government-notified price. Demanding excess markups constitutes unlawful profiteering punishable by fine and shop closure.
        </p>

        {/* Price Benchmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(OFFICIAL_PRICING_BENCHMARKS).map(([key, item]) => (
            <div
              key={key}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider">
                  {item.size} Cylinder
                </span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-3xl font-black text-white font-mono">৳{item.officialGovtRate}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Legally Enforceable MRP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Rights & Steps for Citizens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Rights */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Citizen Consumer Rights
          </h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">1</span>
              <span><strong>Right to Official Money Receipt:</strong> Every LPG dealer is legally required to provide an itemized cash memo with the retail price and company name.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">2</span>
              <span><strong>Right Against Artificial Scarcity:</strong> Hoarding cylinders or withholding supply to jack up prices is a criminal violation under Section 40.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</span>
              <span><strong>25% Whistleblower Compensation:</strong> If a penal fine is collected from the syndicate based on your complaint, the complainant is entitled to 25% of the penalty amount by law.</span>
            </li>
          </ul>
        </div>

        {/* Regulatory Helplines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-400" />
            Official Complaint Channels
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">National Consumer Rights (DNCRP)</p>
                <p className="text-xl font-bold text-amber-400 font-mono">16121</p>
                <p className="text-[11px] text-slate-500">Toll-free Hotline (Govt)</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-semibold border border-amber-500/30">
                Direct Call
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">National Emergency Services</p>
                <p className="text-xl font-bold text-red-400 font-mono">999</p>
                <p className="text-[11px] text-slate-500">For ongoing market extortion / syndicate threats</p>
              </div>
              <span className="px-3 py-1 bg-red-500/15 text-red-400 rounded-lg text-xs font-semibold border border-red-500/30">
                Emergency
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
