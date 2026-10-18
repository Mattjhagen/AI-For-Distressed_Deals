import React, { useState } from 'react';
import { 
  LeadRecord 
} from '../types';
import { 
  sampleRawCountyDatasets 
} from '../data/mockLeads';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Copy, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/calculations';

interface IngestionStudioProps {
  leads: LeadRecord[];
  onIngestRawDataset: (datasetName: string) => void;
  onRunSkipTrace: (leadId: string) => void;
  onDeduplicateCheck: () => void;
}

export const IngestionStudio: React.FC<IngestionStudioProps> = ({
  leads,
  onIngestRawDataset,
  onRunSkipTrace,
  onDeduplicateCheck,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState(sampleRawCountyDatasets[0].name);
  const [dedupResults, setDedupResults] = useState<{ checked: number; duplicatesFound: number; merged: number } | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const handleSimulatePublicSync = () => {
    setIsSyncing(true);
    setSyncStatusMessage('Connecting to County Recorder & Municipal Tax Assessment APIs...');
    
    setTimeout(() => {
      setSyncStatusMessage('Querying Lis Pendens records & Deed of Trust filings...');
    }, 800);

    setTimeout(() => {
      setSyncStatusMessage('Scrubbing national Do-Not-Call (DNC) list & validating skip-trace data...');
    }, 1600);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMessage('Sync Complete: 14 fresh records enriched, 2 auction date changes updated, 1 duplicate merged.');
      setTimeout(() => setSyncStatusMessage(null), 6000);
    }, 2400);
  };

  const handleRunDedup = () => {
    onDeduplicateCheck();
    setDedupResults({
      checked: leads.length + 12,
      duplicatesFound: 2,
      merged: 2,
    });
  };

  const handleSingleEnrich = (leadId: string) => {
    setEnrichingId(leadId);
    setTimeout(() => {
      onRunSkipTrace(leadId);
      setEnrichingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Ingestion Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Data Ingestion & Enrichment Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Automated ingestion pipelines pulling daily notices of default, delinquent property tax rolls, municipal code citations, and probate filings. Real-time de-duplication on APN and owner SSN hash.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunDedup}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>Run De-duplication Scan</span>
            </button>

            <button
              onClick={handleSimulatePublicSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Feeds...' : 'Sync County Feeds Now'}</span>
            </button>
          </div>
        </div>

        {syncStatusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span>{syncStatusMessage}</span>
          </div>
        )}

        {dedupResults && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/40 text-blue-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>De-duplication Engine: Scanned {dedupResults.checked} records. Found {dedupResults.duplicatesFound} duplicate parcel APNs. Merged into unified master records.</span>
            </div>
            <button onClick={() => setDedupResults(null)} className="text-blue-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}
      </div>

      {/* Two Column Grid: Feed Ingestion & Skip Tracing Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: County Feeds & CSV Uploader (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Public Record Feeds (Active)</span>
            </h3>

            <div className="space-y-2.5">
              {sampleRawCountyDatasets.map((feed) => (
                <div
                  key={feed.name}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedFeed === feed.name
                      ? 'bg-slate-850 border-emerald-500/50 shadow'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                  onClick={() => setSelectedFeed(feed.name)}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="truncate pr-2">{feed.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {feed.recordsCount} leads
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{feed.source}</p>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>Updated: {feed.dateUpdated}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIngestRawDataset(feed.name);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                    >
                      <span>Ingest Batch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom CSV Dropzone */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Custom CSV / JSON Import</span>
              </h4>
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 text-center transition-colors cursor-pointer bg-slate-950/40">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">
                  Drag & Drop Tax Delinquency CSV
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports APN, Owner Name, Arrears, Auction Date, Address
                </p>
                <button
                  onClick={() => onIngestRawDataset('Custom Tax Delinquency Upload')}
                  className="mt-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  Load Sample Batch (15 Records)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Enriched Record Roster (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Enrichment & Skip Trace Registry</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified mobile numbers, heir lineage, estimated equity, and comps
                </p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {leads.length} Records Active
              </span>
            </div>

            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white">{lead.address}</h4>
                        <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                          {lead.distressType}
                        </span>
                        {lead.isAbsenteeOwner && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                            Absentee ({lead.outOfStateDistanceMiles} mi)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lead.city}, {lead.state} {lead.zip} • APN: <span className="font-mono text-slate-300">{lead.apn}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Motivation Score</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {lead.mlMotivationScore}/100
                        </span>
                      </div>
                      <button
                        onClick={() => handleSingleEnrich(lead.id)}
                        disabled={enrichingId === lead.id}
                        className="flex items-center space-x-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${enrichingId === lead.id ? 'animate-spin' : ''}`} />
                        <span>{enrichingId === lead.id ? 'Tracing...' : 'Re-Skip Trace'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Enriched Data Chips */}
                  <div className="mt-3 pt-3 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Owner Contact</span>
                      <span className="font-medium text-slate-200 block truncate">{lead.ownerName}</span>
                      <span className="text-slate-400 text-[10px] font-mono">{lead.ownerPhone}</span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Financial Arrears</span>
                      <span className="font-semibold text-rose-400 block">{formatCurrency(lead.taxLienAmount)} Tax Lien</span>
                      <span className="text-slate-400 text-[10px]">{lead.daysDelinquent} Days Delinquent</span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Valuation & Equity</span>
                      <span className="font-semibold text-slate-200 block">{formatCurrency(lead.arv)} ARV</span>
                      <span className="text-emerald-400 text-[10px] font-semibold">{lead.equityPercent}% Equity Spread</span>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">De-Dup & Verification</span>
                      <span className="text-emerald-400 flex items-center space-x-1 text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified APN Hash</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">DNC Scrubbed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
