import React, { useState } from 'react';
import { 
  LeadRecord, 
  PipelineStage, 
  DistressType 
} from '../types';
import { 
  formatCurrency, 
  formatNumber 
} from '../utils/calculations';
import { 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  User, 
  MapPin, 
  Bot, 
  FileSignature, 
  Send, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Table as TableIcon,
  Search,
  ExternalLink,
  PhoneCall,
  Clock
} from 'lucide-react';

interface PipelineKanbanProps {
  leads: LeadRecord[];
  onSelectLead: (lead: LeadRecord) => void;
  onUpdateLeadStage: (leadId: string, newStage: PipelineStage) => void;
  onNavigateTab: (tab: string, lead?: LeadRecord) => void;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  leads,
  onSelectLead,
  onUpdateLeadStage,
  onNavigateTab,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistressFilter, setSelectedDistressFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const stages: { id: PipelineStage; title: string; color: string; bg: string; dot: string }[] = [
    { id: 'raw_lead', title: 'Raw Ingestion', color: 'text-slate-400', bg: 'bg-slate-900/60 border-slate-800', dot: 'bg-slate-400' },
    { id: 'enriched', title: 'Enriched & Scored', color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-900/40', dot: 'bg-blue-400' },
    { id: 'active_outreach', title: 'Active Outreach', color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/40', dot: 'bg-amber-400' },
    { id: 'seller_engaged', title: 'Seller Engaged (AI)', color: 'text-indigo-400', bg: 'bg-indigo-950/20 border-indigo-900/40', dot: 'bg-indigo-400' },
    { id: 'offer_sent', title: 'Offer Sent (MAO)', color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-900/40', dot: 'bg-purple-400' },
    { id: 'under_contract', title: 'Under Contract', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/50', dot: 'bg-emerald-400' },
    { id: 'due_diligence', title: 'Title & Escrow', color: 'text-cyan-400', bg: 'bg-cyan-950/20 border-cyan-900/40', dot: 'bg-cyan-400' },
    { id: 'closed', title: 'Closed & Funded', color: 'text-emerald-300', bg: 'bg-emerald-950/40 border-emerald-700/60', dot: 'bg-emerald-300' },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.apn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistress = 
      selectedDistressFilter === 'all' || lead.distressType === selectedDistressFilter;

    const matchesScore = lead.mlMotivationScore >= minScoreFilter;

    return matchesSearch && matchesDistress && matchesScore;
  });

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const order: PipelineStage[] = [
      'raw_lead',
      'enriched',
      'active_outreach',
      'seller_engaged',
      'offer_sent',
      'under_contract',
      'due_diligence',
      'closed',
    ];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const order: PipelineStage[] = [
      'raw_lead',
      'enriched',
      'active_outreach',
      'seller_engaged',
      'offer_sent',
      'under_contract',
      'due_diligence',
      'closed',
    ];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & View Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search address, owner, city, APN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDistressFilter}
              onChange={(e) => setSelectedDistressFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Distress Types</option>
              <option value="Pre-Foreclosure">Pre-Foreclosure</option>
              <option value="Tax Delinquency">Tax Delinquency</option>
              <option value="Probate / Inherited">Probate / Inherited</option>
              <option value="Code Violations">Code Violations</option>
              <option value="High-Equity Vacant">High-Equity Vacant</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Min ML Score:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="w-24 accent-emerald-500"
            />
            <span className="font-semibold text-emerald-400 min-w-[20px]">{minScoreFilter}+</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-[1400px]">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.pipelineStage === stage.id);
              const stageValue = stageLeads.reduce((acc, l) => acc + (l.projectedWholesaleProfit || 0), 0);

              return (
                <div
                  key={stage.id}
                  className={`w-80 flex-shrink-0 rounded-xl border ${stage.bg} flex flex-col max-h-[calc(100vh-250px)] shadow-lg`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                        {stage.title}
                      </h3>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        +{formatCurrency(stageValue)}
                      </span>
                    )}
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 space-y-3 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
                        No deals in this stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const next = getNextStage(lead.pipelineStage);
                        const prev = getPrevStage(lead.pipelineStage);

                        return (
                          <div
                            key={lead.id}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow transition-all hover:shadow-xl group"
                          >
                            {/* Card Top: Distress Tag + ML Score */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>{lead.distressType}</span>
                              </span>

                              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-200">
                                  {lead.mlMotivationScore}
                                </span>
                                <span className="text-[9px] text-slate-500">ML</span>
                              </div>
                            </div>

                            {/* Address & City */}
                            <h4 
                              onClick={() => onSelectLead(lead)}
                              className="text-xs font-bold text-white group-hover:text-emerald-400 cursor-pointer transition-colors"
                            >
                              {lead.address}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{lead.city}, {lead.state} {lead.zip}</span>
                            </p>

                            {/* Financial Snapshot */}
                            <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500 block text-[10px]">ARV / MAO</span>
                                <span className="font-semibold text-slate-200">
                                  {formatCurrency(lead.arv)}
                                </span>
                                <span className="text-slate-500 block text-[9px]">
                                  MAO: {formatCurrency(lead.mao)}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-slate-500 block text-[10px]">Wholesale Spread</span>
                                <span className="font-bold text-emerald-400">
                                  +{formatCurrency(lead.projectedWholesaleProfit)}
                                </span>
                                <span className="text-slate-500 block text-[9px]">
                                  {lead.equityPercent}% Equity
                                </span>
                              </div>
                            </div>

                            {/* Urgent Countdown if Pre-Foreclosure */}
                            {lead.preForeclosureAuctionDate && (
                              <div className="mt-2 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded px-2 py-1 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                                <span>Auction: {lead.preForeclosureAuctionDate}</span>
                              </div>
                            )}

                            {/* Owner Info & Context */}
                            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                              <div className="flex items-center space-x-1 truncate max-w-[170px]">
                                <User className="w-3 h-3 text-slate-500" />
                                <span className="truncate">{lead.ownerName}</span>
                              </div>
                              {lead.isAbsenteeOwner && (
                                <span className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.2 rounded">
                                  Absentee ({lead.outOfStateDistanceMiles}m)
                                </span>
                              )}
                            </div>

                            {/* Stage Progression & Action Shortcuts */}
                            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                              <div className="flex items-center space-x-1">
                                {prev && (
                                  <button
                                    onClick={() => onUpdateLeadStage(lead.id, prev)}
                                    title="Move back"
                                    className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {next && (
                                  <button
                                    onClick={() => onUpdateLeadStage(lead.id, next)}
                                    title={`Advance to ${next}`}
                                    className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20"
                                  >
                                    <span>Advance</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => onNavigateTab('agent', lead)}
                                  title="AI Negotiation Chat"
                                  className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded"
                                >
                                  <Bot className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onNavigateTab('contracts', lead)}
                                  title="Purchase Agreement & E-Sign"
                                  className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded"
                                >
                                  <FileSignature className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Property & Owner</th>
                  <th className="py-3 px-4">Distress Signal</th>
                  <th className="py-3 px-4">ML Motivation</th>
                  <th className="py-3 px-4">ARV / Equity</th>
                  <th className="py-3 px-4">Max Offer (MAO)</th>
                  <th className="py-3 px-4">Wholesale Margin</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onSelectLead(lead)} 
                        className="font-bold text-white hover:text-emerald-400 cursor-pointer"
                      >
                        {lead.address}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lead.city}, {lead.state} • APN: {lead.apn}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Owner: {lead.ownerName} {lead.isAbsenteeOwner && '(Absentee)'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                        {lead.distressType}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {lead.distressNotes}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold ${
                          lead.mlMotivationScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {lead.mlMotivationScore}/100
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                          {lead.mlTier}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{formatCurrency(lead.arv)}</div>
                      <div className="text-[10px] text-emerald-400">
                        {lead.equityPercent}% Equity (${formatNumber(lead.estimatedEquity)})
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {formatCurrency(lead.mao)}
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-400">
                      +{formatCurrency(lead.projectedWholesaleProfit)}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={lead.pipelineStage}
                        onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as PipelineStage)}
                        className="bg-slate-950 border border-slate-700 text-[11px] text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onNavigateTab('agent', lead)}
                          className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded"
                          title="Chat with Seller"
                        >
                          <Bot className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigateTab('contracts', lead)}
                          className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded"
                          title="Generate Contract"
                        >
                          <FileSignature className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
