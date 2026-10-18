import React, { useState } from 'react';
import { 
  LeadRecord 
} from '../types';
import { 
  formatCurrency, 
  formatNumber 
} from '../utils/calculations';
import { 
  Smartphone, 
  X, 
  MapPin, 
  Send, 
  FileSignature, 
  CheckCircle2, 
  Bell, 
  Compass, 
  ArrowRight, 
  DollarSign, 
  MessageSquare, 
  Sparkles,
  Phone,
  Layers
} from 'lucide-react';

interface MobileCompanionProps {
  leads: LeadRecord[];
  onClose: () => void;
  onAdvanceToSign: (lead: LeadRecord) => void;
}

export const MobileCompanion: React.FC<MobileCompanionProps> = ({
  leads,
  onClose,
  onAdvanceToSign,
}) => {
  const [selectedLead, setSelectedLead] = useState<LeadRecord>(leads[0]);
  const [activeTab, setActiveTab] = useState<'leads' | 'comps' | 'chat' | 'sign'>('comps');
  const [quickSmsSent, setQuickSmsSent] = useState(false);
  const [mobileSigned, setMobileSigned] = useState(false);

  const handleSendMobileSms = () => {
    setQuickSmsSent(true);
    setTimeout(() => setQuickSmsSent(false), 4000);
  };

  const handleMobileSign = () => {
    setMobileSigned(true);
    setTimeout(() => {
      onAdvanceToSign(selectedLead);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container with Mobile Device Frame */}
      <div className="relative max-w-sm w-full bg-slate-900 border-4 border-slate-700 rounded-[48px] shadow-2xl overflow-hidden flex flex-col h-[740px] text-white">
        {/* Device Dynamic Island & Speaker */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>

        {/* Top Close Button (for desktop preview) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
          title="Close Mobile Simulator"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[11px] font-semibold text-slate-300 select-none z-10">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              A
            </span>
            <span className="font-extrabold text-sm tracking-tight text-white">Apex Mobile</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-bold">Field Mode</span>
          </div>
        </div>

        {/* Push Notification Toast Simulator */}
        <div className="mx-4 mt-2 p-2.5 bg-gradient-to-r from-slate-800 to-indigo-950 rounded-2xl border border-indigo-500/30 text-xs shadow-lg flex items-start space-x-2.5 animate-fadeIn">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 text-[11px]">
            <span className="font-bold text-white block">Sophia (AI Agent) Alert</span>
            <span className="text-slate-300">
              {selectedLead.ownerName.split(' ')[0]} accepted your {formatCurrency(selectedLead.mao)} cash offer on {selectedLead.address}!
            </span>
          </div>
        </div>

        {/* Mobile Screen Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Target Lead Selector Drawer */}
          <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
              Inspecting Property
            </div>
            <select
              value={selectedLead.id}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) setSelectedLead(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 font-bold focus:outline-none"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.address} ({l.distressType})
                </option>
              ))}
            </select>

            <div className="mt-2.5 flex justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">ARV</span>
                <span className="font-bold text-slate-200">{formatCurrency(selectedLead.arv)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">MAO Cash Offer</span>
                <span className="font-extrabold text-emerald-400">{formatCurrency(selectedLead.mao)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Profit</span>
                <span className="font-bold text-white">+{formatCurrency(selectedLead.projectedWholesaleProfit)}</span>
              </div>
            </div>
          </div>

          {/* TAB 1: COMPS REVIEW ON THE GO */}
          {activeTab === 'comps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0.5-Mile Radius Comps</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">3 Verified Sales</span>
              </div>

              {/* Visual Map Simulation */}
              <div className="h-28 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center p-3">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Subject Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping absolute" />
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white relative" />
                  <span className="text-[9px] font-black text-rose-300 mt-0.5 bg-slate-950/80 px-1 rounded">Subject</span>
                </div>

                {/* Comps Pins */}
                <div className="absolute top-5 left-10 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                  <span className="text-[8px] font-bold text-emerald-300">$342k</span>
                </div>

                <div className="absolute bottom-4 right-12 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                  <span className="text-[8px] font-bold text-emerald-300">$328k</span>
                </div>

                <div className="absolute top-4 right-8 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                  <span className="text-[8px] font-bold text-emerald-300">$350k</span>
                </div>
              </div>

              {/* Comp Property Cards */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>1419 Elm Creek Dr</span>
                    <span className="text-emerald-400">$342,000</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.08 mi away • 3 bd / 2 ba</span>
                    <span>$178/sqft • Remodeled</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>1504 Timberline Way</span>
                    <span className="text-emerald-400">$328,000</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.24 mi away • 3 bd / 2 ba</span>
                    <span>$178/sqft • Average</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIRE OFF MESSAGES */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white block">
                Quick 1-Tap SMS Dispatcher
              </span>

              <div className="space-y-2">
                {[
                  `Hi ${selectedLead.ownerName.split(' ')[0]}, we can close before your ${selectedLead.preForeclosureAuctionDate ? 'auction' : 'month-end'} and pay off back taxes.`,
                  `We can offer ${formatCurrency(selectedLead.mao)} all-cash with zero repairs needed. Can I send the purchase agreement?`,
                  `Our title escrow team can wire earnest funds tomorrow. What day works best for you to move?`,
                ].map((txt, idx) => (
                  <button
                    key={idx}
                    onClick={handleSendMobileSms}
                    className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-200 transition-colors"
                  >
                    "{txt}"
                  </button>
                ))}
              </div>

              {quickSmsSent && (
                <div className="p-2 bg-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SMS Dispatched to {selectedLead.ownerPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SIGN ON THE GO */}
          {activeTab === 'sign' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white block">
                Mobile E-Signature Agreement
              </span>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Document:</span>
                  <span className="font-bold text-white">TREC Cash As-Is Contract</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Agreed Price:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(selectedLead.mao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seller:</span>
                  <span className="font-medium text-slate-200">{selectedLead.ownerName}</span>
                </div>
              </div>

              <div className="border border-dashed border-slate-700 bg-amber-50 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  1-Tap Biometric / Thumbprint Signature
                </span>
                <button
                  onClick={handleMobileSign}
                  disabled={mobileSigned}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>{mobileSigned ? 'Signed & Escrow Locked!' : 'Tap to Counter-Sign Now'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="p-2 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-1 z-10 text-[10px] font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('comps')}
            className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
              activeTab === 'comps' ? 'text-emerald-400 bg-slate-900' : 'hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Comps</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
              activeTab === 'chat' ? 'text-emerald-400 bg-slate-900' : 'hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('sign')}
            className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${
              activeTab === 'sign' ? 'text-emerald-400 bg-slate-900' : 'hover:text-white'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Sign Docs</span>
          </button>
        </div>

        {/* Mobile Home Bar Indicator */}
        <div className="pb-2 pt-1 flex justify-center bg-slate-950">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
