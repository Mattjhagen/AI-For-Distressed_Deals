import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Send, 
  Bot, 
  FileSignature, 
  X,
  Play,
  RotateCcw
} from 'lucide-react';

interface GuidedWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTab: (tabId: string) => void;
  onRunStepAction: (stepIdx: number) => void;
}

export const GuidedWalkthroughModal: React.FC<GuidedWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onJumpToTab,
  onRunStepAction,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Raw Data Ingestion & Deduplication',
      tabId: 'ingestion',
      icon: Database,
      badge: 'Data Feed',
      description: 'Ingest raw county tax lien filings, notices of default (lis pendens), code enforcement citations, and probate records. The system deduplicates records across APN parcel numbers and owner identity hashes.',
      actionLabel: 'Go to Ingestion Studio & Sync Feeds',
    },
    {
      title: 'Step 2: AI Skip Tracing & Property Enrichment',
      tabId: 'ingestion',
      icon: Sparkles,
      badge: 'Enrichment',
      description: 'Enrich leads with validated mobile phone numbers, DNC registry scrub, mortgage balance payoff estimates, equity cushions, and 0.5-mile comparable sales.',
      actionLabel: 'Inspect Enriched Skip Trace Data',
    },
    {
      title: 'Step 3: Predictive ML Motivation Scoring',
      tabId: 'scoring',
      icon: Sparkles,
      badge: 'ML Engine',
      description: 'Evaluate leads through our machine-learning model (0.892 ROC-AUC). Transparent SHAP feature attribution reveals why a seller is likely to accept a discounted cash offer.',
      actionLabel: 'Tune Criteria & Inspect SHAP Attribution',
    },
    {
      title: 'Step 4: Launch Multi-Channel Outreach Blitz',
      tabId: 'outreach',
      icon: Send,
      badge: 'Omnichannel',
      description: 'Launch coordinated campaigns across Twilio 10DLC SMS, 6x9 glossy direct mail postcards (Lob API with USPS tracking barcodes), and Ringless Voicemail (RVM) audio drops.',
      actionLabel: 'Preview Postcard & Launch Campaign',
    },
    {
      title: 'Step 5: Conversational AI Negotiation (Sophia)',
      tabId: 'agent',
      icon: Bot,
      badge: 'Gemini AI',
      description: 'Engage in natural negotiation with the seller. Sophia handles seller objections (repairs, foreclosure timeline, retail price comparisons) and books discovery appointments.',
      actionLabel: 'Chat with Seller & Handle Objections',
    },
    {
      title: 'Step 6: State Contract & Digital E-Signature',
      tabId: 'contracts',
      icon: FileSignature,
      badge: 'Execution',
      description: 'Auto-populate state-specific purchase agreements (TX TREC, CA C.A.R., FL FAR/BAR) with standard wholesale assignment clauses. Execute mutual e-signatures with SHA-256 audit certificates.',
      actionLabel: 'Draft & Sign Test Purchase Contract',
    },
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    onRunStepAction(currentStep);
    onJumpToTab(step.tabId);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-2">
          <span>ACCEPTANCE CRITERIA #1: END-TO-END DEMO</span>
        </div>

        {/* Step Progress Dots */}
        <div className="flex space-x-1.5 my-3">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-10 bg-emerald-400'
                  : idx < currentStep
                  ? 'w-4 bg-emerald-700'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Current Step Body */}
        <div className="my-5 p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {step.badge}
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">{step.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {step.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            <span>{step.actionLabel}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
