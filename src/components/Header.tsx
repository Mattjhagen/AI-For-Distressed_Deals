import React from 'react';
import { 
  Building2, 
  Workflow, 
  Sparkles, 
  Send, 
  Bot, 
  FileSignature, 
  BarChart3, 
  FileCode2, 
  Smartphone,
  PlayCircle,
  Database,
  Flame,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leadsCount: number;
  totalPipelineValue: number;
  totalPotentialProfit: number;
  signedContractsCount: number;
  onOpenWalkthrough: () => void;
  onResetData: () => void;
  isMobileCompanionOpen: boolean;
  setIsMobileCompanionOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  leadsCount,
  totalPipelineValue,
  totalPotentialProfit,
  signedContractsCount,
  onOpenWalkthrough,
  onResetData,
  isMobileCompanionOpen,
  setIsMobileCompanionOpen,
}) => {
  const tabs = [
    { id: 'pipeline', label: 'Pipeline Kanban', icon: Workflow },
    { id: 'ingestion', label: 'Data Ingestion & Skip Trace', icon: Database },
    { id: 'scoring', label: 'Predictive ML Scorer', icon: Sparkles },
    { id: 'outreach', label: 'Multi-Channel Outreach', icon: Send },
    { id: 'agent', label: 'AI Seller Agent (Sophia)', icon: Bot, badge: 'Live AI' },
    { id: 'contracts', label: 'Contracts & E-Sign', icon: FileSignature, badge: `${signedContractsCount} Signed` },
    { id: 'metrics', label: 'Accuracy & Delivery Report', icon: BarChart3 },
    { id: 'docs', label: 'Source & Deployment Docs', icon: FileCode2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Utility & Metrics Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Acquisition Engine Online</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Targeting: Pre-Foreclosure • Tax Liens • Distressed Estates</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Pipeline ARV:</span>
            <span className="font-semibold text-white">{formatCurrency(totalPipelineValue)}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Wholesale Profit:</span>
            <span className="font-semibold text-emerald-400">+{formatCurrency(totalPotentialProfit)}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300 hidden md:flex">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Contracts:</span>
            <span className="font-semibold text-white">{signedContractsCount} Executed</span>
          </div>

          <button
            onClick={onResetData}
            title="Reset sample data"
            className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                ApexAcquire <span className="text-emerald-400 font-extrabold">AI</span>
              </h1>
              <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                OFF-MARKET SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Distressed Real Estate Pipeline: Raw Data to Signed Purchase Agreement
            </p>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenWalkthrough}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md hover:shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4 text-slate-950" />
            <span>Interactive Guided Demo</span>
          </button>

          <button
            onClick={() => setIsMobileCompanionOpen(!isMobileCompanionOpen)}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
              isMobileCompanionOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Mobile Companion</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
