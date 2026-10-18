import React, { useState, useRef, useEffect } from 'react';
import { 
  LeadRecord, 
  PurchaseContract 
} from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  calculateMAO, 
  generateAuditHash, 
  generateStateContractText 
} from '../utils/calculations';
import { 
  FileSignature, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Printer, 
  Sparkles, 
  DollarSign, 
  Clock, 
  FileText, 
  PenTool, 
  RotateCcw, 
  FolderCheck,
  Check,
  Building,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContractStudioProps {
  leads: LeadRecord[];
  activeLeadId: string;
  onSelectLeadId: (id: string) => void;
  onContractExecuted: (leadId: string, updatedContract: PurchaseContract) => void;
  onNavigateTab: (tab: string) => void;
}

export const ContractStudio: React.FC<ContractStudioProps> = ({
  leads,
  activeLeadId,
  onSelectLeadId,
  onContractExecuted,
  onNavigateTab,
}) => {
  const activeLead = leads.find((l) => l.id === activeLeadId) || leads[0];

  // Offer calculation state
  const [selectedOfferTier, setSelectedOfferTier] = useState<'cash' | 'novation' | 'subto'>('cash');
  const [customPrice, setCustomPrice] = useState<number>(activeLead.mao);
  const [earnestMoney, setEarnestMoney] = useState<number>(2500);
  const [inspectionDays, setInspectionDays] = useState<number>(7);
  const [closingDays, setClosingDays] = useState<number>(14);
  const [stateTemplate, setStateTemplate] = useState<'TX' | 'CA' | 'FL' | 'OH' | 'GA'>('TX');

  // E-Signature state
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(activeLead.ownerName);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSigned, setIsSigned] = useState(activeLead.contract?.signedBySeller || false);
  const [isBuyerSigned, setIsBuyerSigned] = useState(activeLead.contract?.signedByBuyer ?? true);
  const [auditHash, setAuditHash] = useState<string>(
    activeLead.contract?.auditHash || generateAuditHash('TX-2026-08819', activeLead.ownerName, '2026-10-18')
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state when active lead changes
  useEffect(() => {
    setCustomPrice(activeLead.mao);
    setTypedSignature(activeLead.ownerName);
    setIsSigned(activeLead.contract?.signedBySeller || false);
    setIsBuyerSigned(activeLead.contract?.signedByBuyer ?? true);
    if (activeLead.state === 'TX' || activeLead.state === 'CA' || activeLead.state === 'FL' || activeLead.state === 'GA' || activeLead.state === 'OH') {
      setStateTemplate(activeLead.state);
    }
  }, [activeLead]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleExecuteContract = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : undefined;
    const newHash = generateAuditHash(`DOC-${stateTemplate}-${Date.now()}`, activeLead.ownerName, new Date().toISOString());

    const updatedContract: PurchaseContract = {
      contractNumber: activeLead.contract?.contractNumber || `${stateTemplate}-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      stateTemplate,
      purchasePrice: customPrice,
      earnestMoneyDeposit: earnestMoney,
      inspectionDays,
      closingDays,
      closingDate: new Date(Date.now() + closingDays * 86400000).toISOString().split('T')[0],
      buyerLegalName: 'Apex Capital Holdings LLC & / or Assigns',
      sellerLegalName: activeLead.ownerName,
      titleCompany: 'First American Title - Escrow Settlement Division',
      status: 'fully_executed',
      signedBySeller: true,
      sellerSignatureDate: new Date().toLocaleString(),
      sellerSignatureDataUrl: signatureData,
      signedByBuyer: true,
      buyerSignatureDate: new Date().toLocaleString(),
      auditHash: newHash,
      asIsClauseIncluded: true,
      assignmentClauseIncluded: true,
      notes: `Buyer assumes payoff of all recorded county property tax liens directly from closing escrow proceeds.`,
    };

    setIsSigned(true);
    setAuditHash(newHash);
    onContractExecuted(activeLead.id, updatedContract);

    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'],
    });
  };

  const currentContractObj: PurchaseContract = {
    contractNumber: activeLead.contract?.contractNumber || `${stateTemplate}-2026-98104`,
    stateTemplate,
    purchasePrice: customPrice,
    earnestMoneyDeposit: earnestMoney,
    inspectionDays,
    closingDays,
    closingDate: new Date(Date.now() + closingDays * 86400000).toISOString().split('T')[0],
    buyerLegalName: 'Apex Capital Holdings LLC & / or Assigns',
    sellerLegalName: activeLead.ownerName,
    titleCompany: 'First American Title - Escrow Settlement Division',
    status: isSigned ? 'fully_executed' : 'pending_seller_signature',
    signedBySeller: isSigned,
    sellerSignatureDate: activeLead.contract?.sellerSignatureDate || new Date().toLocaleString(),
    signedByBuyer: isBuyerSigned,
    buyerSignatureDate: '2026-10-18',
    auditHash,
    asIsClauseIncluded: true,
    assignmentClauseIncluded: true,
  };

  const contractFullText = generateStateContractText(currentContractObj, activeLead);

  const handleDownloadContract = () => {
    const blob = new Blob([contractFullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Purchase_Agreement_${activeLead.address.replace(/\s+/g, '_')}_${stateTemplate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSignature className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Purchase Agreement Generator & Digital E-Sign Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Auto-populates state-specific purchase agreements (TX, CA, FL, OH, GA) with standard wholesale assignment privileges, AS-IS warranties, and dual digital audit certificates.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isSigned ? (
              <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-2 rounded-xl font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Contract Fully Executed & Escrow Locked</span>
              </div>
            ) : (
              <button
                onClick={handleExecuteContract}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
              >
                <PenTool className="w-4 h-4 text-slate-950" />
                <span>Execute & Sign Test Contract Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Lead Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold px-2">Contract For:</span>
        {leads.map((l) => (
          <button
            key={l.id}
            onClick={() => onSelectLeadId(l.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
              l.id === activeLead.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>{l.address}</span>
            {l.contract?.signedBySeller && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">✓ Signed</span>
            )}
          </button>
        ))}
      </div>

      {/* 3 Offer Tiers Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Speed Cash */}
        <div
          onClick={() => {
            setSelectedOfferTier('cash');
            setCustomPrice(activeLead.mao);
            setClosingDays(14);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedOfferTier === 'cash'
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Speed Cash Purchase (Fastest)</span>
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Recommended
            </span>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-400">
            {formatCurrency(activeLead.mao)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            10-14 Day Escrow Close • 100% Cash • Buyer pays all closing costs & back taxes • 0% Repairs
          </p>
        </div>

        {/* Tier 2: Wholetail / Novation */}
        <div
          onClick={() => {
            setSelectedOfferTier('novation');
            setCustomPrice(Math.round((activeLead.arv * 0.80 - activeLead.estimatedRepairs) / 500) * 500);
            setClosingDays(30);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedOfferTier === 'novation'
              ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Novation / Top Dollar (30-Day)</span>
            </span>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
              Higher Net
            </span>
          </div>
          <div className="mt-2 text-xl font-black text-indigo-300">
            {formatCurrency(Math.round((activeLead.arv * 0.80 - activeLead.estimatedRepairs) / 500) * 500)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Up to 80% ARV • Seller nets maximum funds • Buyer partners on cosmetic cleanup
          </p>
        </div>

        {/* Tier 3: Subject-To */}
        <div
          onClick={() => {
            setSelectedOfferTier('subto');
            setCustomPrice(activeLead.arv - 20000);
            setClosingDays(21);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedOfferTier === 'subto'
              ? 'bg-purple-950/30 border-purple-500/50 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-purple-400" />
              <span>Subject-To / Wrap Arrears</span>
            </span>
            <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
              Stops Auction
            </span>
          </div>
          <div className="mt-2 text-xl font-black text-purple-300">
            {formatCurrency(activeLead.arv - 20000)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Buyer cures ${formatNumber(activeLead.taxLienAmount)} delinquent taxes immediately and wraps mortgage.
          </p>
        </div>
      </div>

      {/* Main Contract Grid: Agreement Terms & Live Legal Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Contract Configuration & Signature Studio (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSignature className="w-4 h-4 text-emerald-400" />
              <span>Contract Terms & Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">State Statutory Form:</label>
                <select
                  value={stateTemplate}
                  onChange={(e) => setStateTemplate(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TX">Texas (TREC Compliant Unimproved/Improved Cash)</option>
                  <option value="CA">California (C.A.R. Standard Wholesale Agreement)</option>
                  <option value="FL">Florida (FAR/BAR As-Is Residential Contract)</option>
                  <option value="GA">Georgia (GAR Cash Sales Agreement)</option>
                  <option value="OH">Ohio (ORC Commercial/Residential Contract)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cash Purchase Price ($):</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Earnest Money Deposit:</label>
                  <input
                    type="number"
                    value={earnestMoney}
                    onChange={(e) => setEarnestMoney(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Inspection Period (Days):</label>
                  <input
                    type="number"
                    value={inspectionDays}
                    onChange={(e) => setInspectionDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Days to Close Escrow:</label>
                  <input
                    type="number"
                    value={closingDays}
                    onChange={(e) => setClosingDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* E-Signature Pad Section */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seller Digital E-Signature</span>
                </span>
                <div className="flex space-x-1 bg-slate-950 rounded p-0.5 border border-slate-800">
                  <button
                    onClick={() => setSignatureMode('draw')}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                      signatureMode === 'draw' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    Draw
                  </button>
                  <button
                    onClick={() => setSignatureMode('type')}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                      signatureMode === 'type' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    Type
                  </button>
                </div>
              </div>

              {signatureMode === 'draw' ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-28 bg-amber-50 rounded-xl border border-slate-400 cursor-crosshair shadow-inner"
                  />
                  {!hasDrawn && !isSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                      Sign with mouse or stylus here
                    </div>
                  )}
                  {isSigned && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                      VERIFIED SIGNED
                    </div>
                  )}
                  <div className="mt-1.5 flex justify-between text-[10px]">
                    <button
                      onClick={clearCanvas}
                      className="text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Canvas</span>
                    </button>
                    <span className="text-slate-500">Signer: {activeLead.ownerName}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    className="w-full bg-amber-50 text-slate-900 border border-slate-400 rounded-xl p-3 text-lg font-serif italic text-center font-bold"
                  />
                  <span className="text-[10px] text-slate-500 block text-right mt-1">
                    Adopted Legal Electronic Signature
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleExecuteContract}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSigned ? 'Re-Certify & Stamp Contract' : 'Sign & Fully Execute Contract'}</span>
                </button>

                {isSigned && (
                  <button
                    onClick={() => onNavigateTab('pipeline')}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>View in Pipeline (Stage: Under Contract)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Audit Trail Certificate Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ESIGN & UETA Compliance Fingerprint</span>
              </div>
              <p className="font-mono text-[9px] text-slate-500 break-all">{auditHash}</p>
              <p>Escrow: First American Title • Certified Timestamp: 2026-10-18 UTC</p>
            </div>
          </div>
        </div>

        {/* Right Col: Live Legal Contract Viewer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
            {/* Document Viewer Header */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  State Purchase & Sale Agreement ({stateTemplate})
                </span>
                {isSigned && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    MUTUALLY EXECUTED
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadContract}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Agreement</span>
                </button>
              </div>
            </div>

            {/* Document Paper Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text border-x border-slate-850">
              {contractFullText}
            </div>

            {/* Document Viewer Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Property: {activeLead.address}</span>
              <span className="text-emerald-400 font-bold">
                Agreed Cash: {formatCurrency(customPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
