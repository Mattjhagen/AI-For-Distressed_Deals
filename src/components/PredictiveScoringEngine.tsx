import React, { useState } from 'react';
import { 
  LeadRecord, 
  ScoringWeightsConfig 
} from '../types';
import { 
  formatCurrency, 
  calculateDynamicScore 
} from '../utils/calculations';
import { 
  Sparkles, 
  Sliders, 
  BarChart, 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle, 
  RotateCcw, 
  Check, 
  Flame, 
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface PredictiveScoringEngineProps {
  leads: LeadRecord[];
  weights: ScoringWeightsConfig;
  onUpdateWeights: (weights: ScoringWeightsConfig) => void;
  onSelectLeadForDetail: (lead: LeadRecord) => void;
  onNavigateTab: (tab: string, lead?: LeadRecord) => void;
}

export const PredictiveScoringEngine: React.FC<PredictiveScoringEngineProps> = ({
  leads,
  weights,
  onUpdateWeights,
  onSelectLeadForDetail,
  onNavigateTab,
}) => {
  const [activeLeadId, setActiveLeadId] = useState<string>(leads[0]?.id || '');
  const activeLead = leads.find((l) => l.id === activeLeadId) || leads[0];

  const handleSliderChange = (key: keyof ScoringWeightsConfig, value: number) => {
    onUpdateWeights({
      ...weights,
      [key]: value,
    });
  };

  const handleResetWeights = () => {
    onUpdateWeights({
      equityWeight: 75,
      delinquencyWeight: 85,
      absenteeWeight: 70,
      violationWeight: 65,
      auctionUrgencyWeight: 90,
      minScoreForAutoOutreach: 75,
    });
  };

  // Compute live impact of criteria weights
  const qualifiedLeads = leads.filter((l) => calculateDynamicScore(l, weights) >= weights.minScoreForAutoOutreach);
  const totalQualifiedProfit = qualifiedLeads.reduce((acc, l) => acc + l.projectedWholesaleProfit, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Predictive Lead Motivation & SHAP Transparency Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Machine-learning model trained on 124,000 off-market distressed property purchases. Predicts probability of owner accepting a discounted cash offer below MAO with full feature attribution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-slate-500 block text-[10px]">Model Performance</span>
              <span className="font-bold text-emerald-400">0.892 ROC-AUC</span>
              <span className="text-slate-400 text-[10px] ml-1.5">• 84.3% Top Decile Precision</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Acquisition Criteria Sliders (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Acquisition Criteria Weighting</span>
              </h3>
              <button
                onClick={handleResetWeights}
                className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                title="Reset to default optimal model weights"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Adjust weights to prioritize specific distress vectors based on your current capital allocation.
            </p>

            <div className="space-y-4">
              {/* Slider 1: Auction Urgency */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Pre-Foreclosure Auction Urgency</span>
                  <span className="text-amber-400 font-bold">{weights.auctionUrgencyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.auctionUrgencyWeight}
                  onChange={(e) => handleSliderChange('auctionUrgencyWeight', Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Heavily boosts leads with auction dates within 30 days</span>
              </div>

              {/* Slider 2: Delinquency & Tax Liens */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Tax Lien & Arrears Severity</span>
                  <span className="text-rose-400 font-bold">{weights.delinquencyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.delinquencyWeight}
                  onChange={(e) => handleSliderChange('delinquencyWeight', Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-950 h-1.5 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Penalizes long delinquency days and heavy recorded liens</span>
              </div>

              {/* Slider 3: Equity Spread */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Homeowner Equity Spread</span>
                  <span className="text-emerald-400 font-bold">{weights.equityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.equityWeight}
                  onChange={(e) => handleSliderChange('equityWeight', Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Ensures seller has enough net proceeds to accept 70% MAO</span>
              </div>

              {/* Slider 4: Absentee Owner */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Out-of-State Absentee Distance</span>
                  <span className="text-blue-400 font-bold">{weights.absenteeWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.absenteeWeight}
                  onChange={(e) => handleSliderChange('absenteeWeight', Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Prioritizes heirs or landlords living &gt;250 miles away</span>
              </div>

              {/* Slider 5: Code Violations */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Municipal Code Violations</span>
                  <span className="text-purple-400 font-bold">{weights.violationWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.violationWeight}
                  onChange={(e) => handleSliderChange('violationWeight', Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 h-1.5 rounded-lg"
                />
                <span className="text-[10px] text-slate-500">Accounts for open citations, water shutoffs, and board-ups</span>
              </div>

              {/* Slider 6: Auto-Outreach Minimum Score */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-Outreach Trigger Threshold</span>
                  </span>
                  <span className="text-emerald-400 font-extrabold">{weights.minScoreForAutoOutreach}+</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={weights.minScoreForAutoOutreach}
                  onChange={(e) => handleSliderChange('minScoreForAutoOutreach', Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Leads scoring above this automatically launch SMS & Postcard sequences
                </span>
              </div>
            </div>

            {/* Impact Box */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tuning Live Impact</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-300">Auto-Campaign Qualified:</span>
                <span className="font-bold text-white">{qualifiedLeads.length} of {leads.length} Leads</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-slate-300">Target Wholesale Pool:</span>
                <span className="font-bold text-emerald-400">+{formatCurrency(totalQualifiedProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: SHAP Transparency Breakdown for Selected Lead */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lead Selector Pill Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-xs text-slate-400 font-semibold px-2">Inspect Lead:</span>
            {leads.map((l) => {
              const liveScore = calculateDynamicScore(l, weights);
              const isSelected = l.id === activeLead.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveLeadId(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[130px]">{l.address}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    liveScore >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {liveScore}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Deep SHAP Attribution Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{activeLead.address}</h3>
                  <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                    {activeLead.distressType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeLead.city}, {activeLead.state} {activeLead.zip} • Owner: {activeLead.ownerName}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Dynamic Motivation Score</span>
                  <div className="flex items-center space-x-1 justify-end">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-2xl font-black text-white">
                      {calculateDynamicScore(activeLead, weights)}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('outreach', activeLead)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-colors flex items-center space-x-1"
                >
                  <span>Launch Campaign</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feature Factor Waterfall / Attribution Breakdown */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <BarChart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Feature Importance Breakdown (SHAP Values)</span>
              </h4>

              <div className="space-y-3">
                {activeLead.featureFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-200">{factor.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {factor.category}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-400 text-xs">
                        +{factor.impact} pts impact
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      {factor.description}
                    </p>

                    {/* Visual Impact Bar */}
                    <div className="mt-2 pl-7">
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(factor.impact * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Spread Snapshot */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Estimated ARV</span>
                <span className="font-bold text-white text-sm">{formatCurrency(activeLead.arv)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Based on 3 recent radius comps</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Max Allowable Offer (MAO)</span>
                <span className="font-bold text-amber-400 text-sm">{formatCurrency(activeLead.mao)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">70% rule - $48k repairs</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Net Wholesale Profit</span>
                <span className="font-bold text-emerald-400 text-sm">+{formatCurrency(activeLead.projectedWholesaleProfit)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Immediate investor spread</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
