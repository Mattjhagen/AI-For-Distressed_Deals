import React, { useState } from 'react';
import { 
  LeadRecord, 
  Touchpoint 
} from '../types';
import { 
  formatCurrency 
} from '../utils/calculations';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  FileText, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Eye, 
  RotateCw, 
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';

interface MultiChannelOutreachProps {
  leads: LeadRecord[];
  selectedLeadId: string;
  onSelectLeadId: (id: string) => void;
  onLaunchCampaign: (leadId: string, channels: ('sms' | 'email' | 'rvm' | 'postcard')[]) => void;
  onNavigateTab: (tab: string, lead?: LeadRecord) => void;
}

export const MultiChannelOutreach: React.FC<MultiChannelOutreachProps> = ({
  leads,
  selectedLeadId,
  onSelectLeadId,
  onLaunchCampaign,
  onNavigateTab,
}) => {
  const [activeChannelTab, setActiveChannelTab] = useState<'postcard' | 'sms' | 'rvm' | 'email'>('postcard');
  const [postcardSide, setPostcardSide] = useState<'front' | 'back'>('front');
  const [isPlayingRVM, setIsPlayingRVM] = useState(false);
  const [blitzLaunched, setBlitzLaunched] = useState(false);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleLaunchBlitz = () => {
    onLaunchCampaign(activeLead.id, ['sms', 'rvm', 'postcard', 'email']);
    setBlitzLaunched(true);
    setTimeout(() => setBlitzLaunched(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Send className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Multi-Channel Outreach & Campaign Sequencer</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Coordinated SMS, direct mail postcards, ringless voicemail drops, and email drips. Every touchpoint is unified in a real-time carrier delivery timeline.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLaunchBlitz}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch 4-Channel Blitz</span>
            </button>
          </div>
        </div>

        {blitzLaunched && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Blitz Executed: SMS queued to Twilio 10DLC, RVM drop scheduled via carrier switch, 6x9 Postcard submitted to Lob API with USPS tracking barcode!
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-bold">Live Status: Queued</span>
          </div>
        )}
      </div>

      {/* Lead Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold px-2">Target Property:</span>
        {leads.map((l) => (
          <button
            key={l.id}
            onClick={() => onSelectLeadId(l.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
              l.id === activeLead.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>{l.address}</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
              {l.outreachHistory.length} touches
            </span>
          </button>
        ))}
      </div>

      {/* Main Outreach Grid: Channel Workspaces & Unified Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Channel Previews (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Channel Tabs */}
            <div className="bg-slate-950 border-b border-slate-800 p-2 flex space-x-2">
              <button
                onClick={() => setActiveChannelTab('postcard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeChannelTab === 'postcard'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Direct Mail 6x9 Postcard</span>
              </button>

              <button
                onClick={() => setActiveChannelTab('sms')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeChannelTab === 'sms'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Twilio 10DLC SMS</span>
              </button>

              <button
                onClick={() => setActiveChannelTab('rvm')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeChannelTab === 'rvm'
                    ? 'bg-slate-800 text-blue-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Ringless Voicemail (RVM)</span>
              </button>

              <button
                onClick={() => setActiveChannelTab('email')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeChannelTab === 'email'
                    ? 'bg-slate-800 text-purple-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Drip</span>
              </button>
            </div>

            {/* Channel Content Panel */}
            <div className="p-6">
              {/* 1. DIRECT MAIL POSTCARD STUDIO */}
              {activeChannelTab === 'postcard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Standard USPS First Class Heavy Cardstock (6" x 9")
                    </span>
                    <button
                      onClick={() => setPostcardSide(postcardSide === 'front' ? 'back' : 'front')}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Flip to {postcardSide === 'front' ? 'Back (Address & Stamp)' : 'Front'}</span>
                    </button>
                  </div>

                  {/* Visual Postcard Mockup */}
                  <div className="aspect-[1.5/1] rounded-2xl bg-amber-50 text-slate-900 p-6 shadow-2xl relative border-4 border-amber-200/80 overflow-hidden flex flex-col justify-between">
                    {postcardSide === 'front' ? (
                      /* FRONT SIDE */
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="bg-amber-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                              EXPRESS CASH BUYER NOTICE
                            </span>
                            <h3 className="text-lg font-black text-slate-900 mt-2 font-serif">
                              We Want To Buy {activeLead.address} Completely As-Is
                            </h3>
                          </div>
                          <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center justify-center">
                            <QrCode className="w-10 h-10 text-slate-900" />
                            <span className="text-[8px] font-bold text-slate-600 mt-0.5">SCAN FOR CASH</span>
                          </div>
                        </div>

                        <div className="my-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs">
                          <p className="font-medium text-slate-800">
                            Dear {activeLead.ownerName.split(' ')[0]},
                          </p>
                          <p className="text-[11px] text-slate-700 mt-1">
                            Our private acquisition team is prepared to purchase your property on {activeLead.address} with <strong>100% Cash</strong>. No realtors, zero repair costs, and we cover all delinquent county taxes and closing costs at settlement.
                          </p>
                          <div className="mt-2 flex items-center space-x-3 text-[10px] font-bold text-emerald-800">
                            <span>✓ No Cleaning Required</span>
                            <span>✓ 14-Day Fast Escrow</span>
                            <span>✓ We Pay Your Back Taxes</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-300/60 font-bold">
                          <span className="text-amber-900">Direct Line: (800) 555-APEX</span>
                          <span className="text-emerald-700 text-sm">Estimated Cash Offer: {formatCurrency(activeLead.mao)}</span>
                        </div>
                      </>
                    ) : (
                      /* BACK SIDE */
                      <>
                        <div className="grid grid-cols-2 gap-4 h-full">
                          {/* Left Column: Note */}
                          <div className="border-r border-slate-300 pr-4 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Return Address:</p>
                              <p className="text-[10px] text-slate-700 font-semibold">
                                Apex Capital Holdings LLC<br />
                                100 Crescent Ct, Ste 1400<br />
                                Dallas, TX 75201
                              </p>
                              <div className="mt-4 p-2.5 bg-amber-100/60 rounded-lg text-[10px] text-slate-800 italic">
                                "{activeLead.ownerName.split(' ')[0]}, we know dealing with property distress can be stressful. Let us buy your home as-is before the county auction date."
                              </div>
                            </div>
                            <div className="text-[9px] text-slate-500">
                              Ref Code: {activeLead.apn} • Valid for 30 Days
                            </div>
                          </div>

                          {/* Right Column: Postage & Recipient */}
                          <div className="flex flex-col justify-between pl-2">
                            <div className="flex justify-end">
                              <div className="w-16 h-20 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[8px] font-bold text-slate-500 text-center leading-tight">
                                <span>US POSTAGE</span>
                                <span>PAID</span>
                                <span>PERMIT #491</span>
                              </div>
                            </div>

                            <div className="my-auto pl-2">
                              <p className="text-xs font-bold text-slate-900">{activeLead.ownerName}</p>
                              <p className="text-xs text-slate-800">{activeLead.ownerMailingAddress}</p>
                            </div>

                            {/* USPS Barcode Graphic */}
                            <div className="h-6 flex items-end space-x-0.5 opacity-80 pt-2">
                              {Array.from({ length: 42 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="bg-slate-900 w-[2px]"
                                  style={{ height: `${(i % 3 === 0 ? 18 : i % 2 === 0 ? 12 : 24)}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SMS STUDIO */}
              {activeChannelTab === 'sms' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-sm mx-auto">
                    <div className="text-center text-[10px] text-slate-500 pb-2 border-b border-slate-800">
                      SMS Gateway • Twilio A2P 10DLC Verified
                    </div>

                    <div className="mt-4 space-y-3">
                      {/* Outgoing Message */}
                      <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm p-3 text-xs shadow-md">
                        Hi {activeLead.ownerName.split(' ')[0]}, this is Sophia from Apex Capital. I saw your home on {activeLead.address}. We are actively buying properties in {activeLead.zip} for 100% Cash with zero repair work needed. We also pay off any back property taxes directly at closing. Would you be open to a fair cash offer this week?
                      </div>

                      {/* Reply Simulation */}
                      <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-3 text-xs shadow-md border border-slate-700">
                        How much are you offering? The house needs some work and I need to close before the county auction.
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Delivered to {activeLead.ownerPhone}</span>
                      </span>
                      <button
                        onClick={() => onNavigateTab('agent', activeLead)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                      >
                        <Bot className="w-3 h-3" />
                        <span>Chat via AI Agent</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. RINGLESS VOICEMAIL (RVM) STUDIO */}
              {activeChannelTab === 'rvm' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-2">
                        <PhoneCall className="w-4 h-4 text-blue-400" />
                        <span>High-Engagement RVM Audio Drop (30s)</span>
                      </span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                        91.2% Carrier Connection Rate
                      </span>
                    </div>

                    {/* Waveform Player */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
                      <button
                        onClick={() => setIsPlayingRVM(!isPlayingRVM)}
                        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
                      >
                        {isPlayingRVM ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Voice: Sophia (Acquisitions VP - Dallas)</span>
                          <span>{isPlayingRVM ? '0:14 / 0:28' : '0:28'}</span>
                        </div>
                        {/* Simulated Waveform */}
                        <div className="flex items-center space-x-1 h-6">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full transition-all duration-300 ${
                                isPlayingRVM
                                  ? 'bg-blue-400 animate-pulse'
                                  : 'bg-slate-700'
                              }`}
                              style={{ height: `${(i * 7) % 20 + 6}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Voicemail Script Transcript */}
                    <div className="mt-3 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 italic">
                      "Hey {activeLead.ownerName.split(' ')[0]}, this is Sophia with Apex Capital. I'm reaching out directly about your property on {activeLead.address}. We have private funds ready to buy in your neighborhood this month—we can buy completely as-is, take care of all paperwork, and cover back taxes. Give me a call or text back at (800) 555-APEX."
                    </div>
                  </div>
                </div>
              )}

              {/* 4. EMAIL DRIP SEQUENCE */}
              {activeChannelTab === 'email' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Step 1: Cash Acquisition Term Sheet Notice</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Sent Day 1</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Subject: Urgent: All-Cash Purchase Option for {activeLead.address}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 opacity-80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Step 2: Relocation & Tax Foreclosure Solution</span>
                      <span className="text-[10px] text-slate-400">Scheduled Day 4</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Subject: How we pay off your back taxes and save your equity
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 opacity-60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Step 3: Final Pre-Auction Direct Purchase Warning</span>
                      <span className="text-[10px] text-slate-400">Scheduled Day 7</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Subject: Notice of Default deadline for {activeLead.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Omnichannel Unified Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Unified Touchpoint Timeline</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {activeLead.outreachHistory.length} Recorded
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {activeLead.outreachHistory.map((item, idx) => {
                const iconMap = {
                  postcard: FileText,
                  sms: MessageSquare,
                  rvm: PhoneCall,
                  email: Mail,
                };
                const Icon = iconMap[item.channel] || MessageSquare;

                return (
                  <div key={item.id} className="relative flex items-start space-x-3 text-xs pl-2">
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center flex-shrink-0 z-10">
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="uppercase font-bold text-slate-300">{item.channel}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="font-semibold text-white mt-1 text-[11px]">{item.summary}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">"{item.content}"</p>

                      <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <span className={`font-semibold capitalize ${
                          item.status === 'responded' ? 'text-indigo-400' : 'text-emerald-400'
                        }`}>
                          ● {item.status}
                        </span>
                        {item.trackingCode && (
                          <span className="text-slate-500 font-mono">{item.trackingCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
