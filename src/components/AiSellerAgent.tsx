import React, { useState, useRef, useEffect } from 'react';
import { 
  LeadRecord, 
  ChatMessage 
} from '../types';
import { 
  formatCurrency 
} from '../utils/calculations';
import { 
  Bot, 
  Send, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileSignature, 
  ShieldAlert, 
  PhoneCall,
  Flame,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';

interface AiSellerAgentProps {
  leads: LeadRecord[];
  activeLeadId: string;
  onSelectLeadId: (id: string) => void;
  onAdvanceToContract: (lead: LeadRecord, agreedPrice: number) => void;
}

export const AiSellerAgent: React.FC<AiSellerAgentProps> = ({
  leads,
  activeLeadId,
  onSelectLeadId,
  onAdvanceToContract,
}) => {
  const activeLead = leads.find((l) => l.id === activeLeadId) || leads[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      timestamp: '10:24 AM',
      text: `Hello ${activeLead.ownerName.split(' ')[0]}, this is Sophia from Apex Capital. I'm following up regarding our cash interest in ${activeLead.address}. We can purchase 100% as-is, take care of all transfer fees, and pay off your delinquent county taxes directly at closing. Would you be open to discussing a quick cash buyout?`,
      sentiment: 'information_seeking',
    },
    {
      id: 'm2',
      sender: 'seller',
      timestamp: '10:27 AM',
      text: `I might be interested, but I have a foreclosure sale coming up in 3 weeks and I owe $18,400 in back taxes. How fast could you actually close, and do I have to clean out the old furniture?`,
      sentiment: 'motivated',
    },
    {
      id: 'm3',
      sender: 'ai',
      timestamp: '10:28 AM',
      text: `We can close in as little as 10 to 14 days, well ahead of your county auction deadline. And absolutely not—you do not have to clean out a single thing. Whatever unwanted furniture or items you leave behind, our clean-out crew handles at zero cost to you. Based on our underwriting, our firm can pay $176,500 Cash, netting you clean funds after satisfying all liens. Would that give you the relief you need?`,
      sentiment: 'motivated',
      objectionCategory: 'timeline_repairs',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dealSentiment, setDealSentiment] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [calendarBooked, setCalendarBooked] = useState(false);
  const [handoffTriggered, setHandoffTriggered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'seller',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages,
          property: activeLead,
          offerAmount: activeLead.mao,
        }),
      });

      const data = await res.json();
      
      const aiReply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.reply || `Thank you. I have locked in our purchase figures for ${activeLead.address}.`,
        sentiment: data.sentiment,
        objectionCategory: data.objectionCategory,
      };

      setMessages((prev) => [...prev, aiReply]);

      if (data.dealTemperature) {
        setDealSentiment(data.dealTemperature);
      }

      if (data.requiresHumanHandoff || data.sentiment === 'ready_to_sign') {
        setHandoffTriggered(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now() + 1}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `I understand completely. We are prepared to wire the earnest deposit to First American Title and close on your exact timeline. Shall I prepare the purchase agreement for your review?`,
          sentiment: 'ready_to_sign',
        },
      ]);
      setHandoffTriggered(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookCalendarSlot = () => {
    setCalendarBooked(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `cal-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Confirmed! 15-Minute Closing Call booked for Thursday at 2:00 PM CST with our Senior Acquisitions Director. Calendar invite and title preliminary docs sent to ${activeLead.ownerEmail}.`,
      },
    ]);
  };

  const quickPrompts = [
    'Why is your offer lower than Zillow?',
    'Can you guarantee closing before the county auction date?',
    'What if I have bad tenants or old furniture in the house?',
    'I accept the $176,500 cash offer. Send me the purchase contract to sign!',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bot className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Sophia: Conversational AI Seller Agent</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              24/7 autonomous acquisitions agent powered by Gemini. Empathetically qualifies distressed sellers, solves objections (liens, repairs, foreclosure urgency), books calendar slots, and routes to purchase contracts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-500">Deal Temp:</span>
              <span className={`font-bold flex items-center space-x-1 uppercase ${
                dealSentiment === 'hot' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{dealSentiment}</span>
              </span>
            </div>

            <button
              onClick={() => onAdvanceToContract(activeLead, activeLead.mao)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <FileSignature className="w-4 h-4 text-slate-950" />
              <span>Draft State Purchase Contract</span>
            </button>
          </div>
        </div>

        {handoffTriggered && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-white block">Acquisitions Manager Handoff Triggered!</span>
                <span className="text-slate-300">
                  Seller is highly motivated and ready to lock in terms. Pre-filled purchase agreement is ready for e-signature.
                </span>
              </div>
            </div>

            <button
              onClick={() => onAdvanceToContract(activeLead, activeLead.mao)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg shadow-md transition-colors flex items-center space-x-1"
            >
              <span>Review & Execute Contract Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Target Lead Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold px-2">Active Negotiation:</span>
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
            <span className="text-[10px] text-emerald-400 font-bold">{formatCurrency(l.mao)}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chat Stream (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>Sophia (AI Acquisitions Lead)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Talking with Seller: {activeLead.ownerName} ({activeLead.address})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookCalendarSlot}
                disabled={calendarBooked}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{calendarBooked ? 'Call Booked (Thu 2pm)' : 'Book Discovery Call'}</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-md leading-relaxed ${
                      isAi
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 space-x-3">
                      <span className="font-bold">{isAi ? 'Sophia (Apex AI)' : activeLead.ownerName}</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <p className="text-xs">{m.text}</p>

                    {m.objectionCategory && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-semibold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Objection Solved: {m.objectionCategory}</span>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2">
                <Bot className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Sophia is crafting optimal negotiation response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Injection Pills */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex space-x-2 scrollbar-none">
            <span className="text-[10px] text-slate-500 font-bold self-center whitespace-nowrap pl-1">
              Simulate Seller:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="bg-slate-900 hover:bg-slate-850 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap transition-colors hover:text-white"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message as the seller or let AI continue..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Underwriting Context & Negotiation Brief (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Deal Context & Guardrails</span>
            </h3>

            {/* Target Numbers */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">After Repair Value (ARV):</span>
                <span className="font-bold text-white">{formatCurrency(activeLead.arv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Rehab Scope:</span>
                <span className="font-semibold text-rose-400">-{formatCurrency(activeLead.estimatedRepairs)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Back Tax Liens (Payoff):</span>
                <span className="font-semibold text-rose-400">-{formatCurrency(activeLead.taxLienAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-sm">
                <span className="text-emerald-400">Max Allowable Offer (MAO):</span>
                <span className="text-emerald-400">{formatCurrency(activeLead.mao)}</span>
              </div>
            </div>

            {/* Seller Psychology & Objection Cheat Sheet */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Trained Objection Responses
              </span>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                <p className="font-semibold text-amber-400">"Why not retail price?"</p>
                <p className="text-slate-400">
                  Explains 6% realtor fees ($19k), holding costs, closing escrow, and $45k repairs. Net cash in pocket is comparable with zero headaches.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                <p className="font-semibold text-blue-400">"Auction in 2 weeks"</p>
                <p className="text-slate-400">
                  Leverages private cash reserves to order title commitment in 48 hours and close in 10-14 days, stopping auction cold.
                </p>
              </div>
            </div>

            {/* Direct Contract CTA */}
            <div className="pt-2">
              <button
                onClick={() => onAdvanceToContract(activeLead, activeLead.mao)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs py-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FileSignature className="w-4 h-4 text-emerald-400" />
                <span>Advance to Purchase Agreement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
