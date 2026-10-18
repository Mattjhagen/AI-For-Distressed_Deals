import React, { useState } from 'react';
import { 
  LeadRecord, 
  PipelineStage, 
  ScoringWeightsConfig, 
  PurchaseContract 
} from './types';
import { 
  initialLeads, 
  initialScoringWeights 
} from './data/mockLeads';
import { 
  calculateDynamicScore 
} from './utils/calculations';
import { Header } from './components/Header';
import { PipelineKanban } from './components/PipelineKanban';
import { IngestionStudio } from './components/IngestionStudio';
import { PredictiveScoringEngine } from './components/PredictiveScoringEngine';
import { MultiChannelOutreach } from './components/MultiChannelOutreach';
import { AiSellerAgent } from './components/AiSellerAgent';
import { ContractStudio } from './components/ContractStudio';
import { MetricsReportView } from './components/MetricsReportView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { MobileCompanion } from './components/MobileCompanion';
import { GuidedWalkthroughModal } from './components/GuidedWalkthroughModal';

export default function App() {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeightsConfig>(initialScoringWeights);
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeads[0].id);
  const [isMobileCompanionOpen, setIsMobileCompanionOpen] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  // Re-calculate scores dynamically based on weights
  const currentLeads = leads.map((l) => ({
    ...l,
    mlMotivationScore: calculateDynamicScore(l, scoringWeights),
  }));

  // Aggregated Pipeline Metrics
  const totalPipelineValue = currentLeads.reduce((acc, l) => acc + (l.arv || 0), 0);
  const totalPotentialProfit = currentLeads.reduce((acc, l) => acc + (l.projectedWholesaleProfit || 0), 0);
  const signedContractsCount = currentLeads.filter((l) => l.contract?.signedBySeller).length;

  const handleUpdateLeadStage = (leadId: string, newStage: PipelineStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: newStage } : l))
    );
  };

  const handleSelectLead = (lead: LeadRecord) => {
    setSelectedLeadId(lead.id);
  };

  const handleNavigateTab = (tab: string, lead?: LeadRecord) => {
    if (lead) {
      setSelectedLeadId(lead.id);
    }
    setActiveTab(tab);
  };

  const handleIngestRawDataset = (datasetName: string) => {
    // Add realistic raw leads from the selected county
    const newRawLead: LeadRecord = {
      id: `lead-${Date.now()}`,
      apn: `044-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: '2914 Live Oak St',
      city: 'Dallas',
      state: 'TX',
      zip: '75204',
      county: 'Dallas County',
      ownerName: 'Genevieve Morales',
      ownerPhone: '(214) 555-6671',
      ownerEmail: 'g.morales77@gmail.com',
      ownerMailingAddress: '1900 Pacific Ave, Dallas, TX',
      isAbsenteeOwner: false,
      outOfStateDistanceMiles: 0,
      distressType: 'Pre-Foreclosure',
      distressNotes: 'Sheriff sale scheduled in 28 days. Senior mortgage default $31,500.',
      daysDelinquent: 175,
      taxLienAmount: 11200,
      preForeclosureAuctionDate: '2026-11-15',
      arv: 310000,
      estimatedRepairs: 40000,
      mortgageBalance: 75000,
      estimatedEquity: 195000,
      equityPercent: 62,
      mao: 167000,
      projectedWholesaleProfit: 25000,
      mlMotivationScore: 90,
      mlTier: 'High Priority',
      featureFactors: [
        { name: 'Foreclosure Auction Set (<30d)', impact: 30, category: 'distress', description: 'Pending Sheriff sale' },
        { name: '62% Equity Cushion', impact: 22, category: 'financial', description: 'Substantial equity room' },
      ],
      pipelineStage: 'raw_lead',
      outreachHistory: [],
      propertyDetails: {
        beds: 3,
        baths: 2,
        sqft: 1720,
        yearBuilt: 1964,
        lotSize: '0.19 Acres',
        propertyType: 'Single Family Residence',
        zestimateRetail: 315000,
        roofCondition: 'Fair',
        foundationStatus: 'Good',
      },
      comps: [],
      lastRefreshed: 'Just now',
      notes: [`Ingested from ${datasetName}`],
    };

    setLeads((prev) => [newRawLead, ...prev]);
    setSelectedLeadId(newRawLead.id);
  };

  const handleRunSkipTrace = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            pipelineStage: l.pipelineStage === 'raw_lead' ? 'enriched' : l.pipelineStage,
            lastRefreshed: 'Just verified (DNC scrubbed)',
            notes: [...l.notes, 'Skip-trace verified: Mobile active, DNC clean, 0.5-mile comps loaded.'],
          };
        }
        return l;
      })
    );
  };

  const handleDeduplicateCheck = () => {
    // Deduplication check
    setLeads((prev) => {
      const seenApns = new Set<string>();
      return prev.filter((item) => {
        if (seenApns.has(item.apn)) {
          return false;
        }
        seenApns.add(item.apn);
        return true;
      });
    });
  };

  const handleLaunchCampaign = (leadId: string, channels: ('sms' | 'email' | 'rvm' | 'postcard')[]) => {
    const timestamp = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const newTouches = channels.map((c, i) => ({
            id: `tp-${Date.now()}-${i}`,
            channel: c,
            timestamp,
            status: 'sent' as const,
            summary: `Automated campaign touch via ${c.toUpperCase()}`,
            content: `Express all-cash buyout inquiry for ${l.address}. 14-day close, back taxes paid.`,
            trackingCode: `TRACK-${c.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          }));

          return {
            ...l,
            pipelineStage: l.pipelineStage === 'raw_lead' || l.pipelineStage === 'enriched' ? 'active_outreach' : l.pipelineStage,
            outreachHistory: [...newTouches, ...l.outreachHistory],
          };
        }
        return l;
      })
    );
  };

  const handleAdvanceToContract = (lead: LeadRecord, agreedPrice: number) => {
    setSelectedLeadId(lead.id);
    setActiveTab('contracts');
  };

  const handleContractExecuted = (leadId: string, updatedContract: PurchaseContract) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            contract: updatedContract,
            pipelineStage: 'under_contract',
            notes: [...l.notes, `Purchase Agreement executed digitally. File Ref: ${updatedContract.contractNumber}`],
          };
        }
        return l;
      })
    );
  };

  const handleResetData = () => {
    setLeads(initialLeads);
    setScoringWeights(initialScoringWeights);
    setSelectedLeadId(initialLeads[0].id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadsCount={currentLeads.length}
        totalPipelineValue={totalPipelineValue}
        totalPotentialProfit={totalPotentialProfit}
        signedContractsCount={signedContractsCount}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onResetData={handleResetData}
        isMobileCompanionOpen={isMobileCompanionOpen}
        setIsMobileCompanionOpen={setIsMobileCompanionOpen}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && (
          <PipelineKanban
            leads={currentLeads}
            onSelectLead={handleSelectLead}
            onUpdateLeadStage={handleUpdateLeadStage}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'ingestion' && (
          <IngestionStudio
            leads={currentLeads}
            onIngestRawDataset={handleIngestRawDataset}
            onRunSkipTrace={handleRunSkipTrace}
            onDeduplicateCheck={handleDeduplicateCheck}
          />
        )}

        {activeTab === 'scoring' && (
          <PredictiveScoringEngine
            leads={currentLeads}
            weights={scoringWeights}
            onUpdateWeights={setScoringWeights}
            onSelectLeadForDetail={handleSelectLead}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'outreach' && (
          <MultiChannelOutreach
            leads={currentLeads}
            selectedLeadId={selectedLeadId}
            onSelectLeadId={setSelectedLeadId}
            onLaunchCampaign={handleLaunchCampaign}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'agent' && (
          <AiSellerAgent
            leads={currentLeads}
            activeLeadId={selectedLeadId}
            onSelectLeadId={setSelectedLeadId}
            onAdvanceToContract={handleAdvanceToContract}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractStudio
            leads={currentLeads}
            activeLeadId={selectedLeadId}
            onSelectLeadId={setSelectedLeadId}
            onContractExecuted={handleContractExecuted}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'metrics' && <MetricsReportView />}

        {activeTab === 'docs' && <ArchitectureDocsView />}
      </main>

      {/* Mobile Companion Overlay Modal */}
      {isMobileCompanionOpen && (
        <MobileCompanion
          leads={currentLeads}
          onClose={() => setIsMobileCompanionOpen(false)}
          onAdvanceToSign={(lead) => {
            setSelectedLeadId(lead.id);
            setActiveTab('contracts');
            setIsMobileCompanionOpen(false);
          }}
        />
      )}

      {/* Guided Walkthrough Modal (Acceptance Criteria #1) */}
      <GuidedWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onJumpToTab={setActiveTab}
        onRunStepAction={(stepIdx) => {
          if (stepIdx === 0) {
            handleIngestRawDataset('Cook County Delinquent Roll');
          } else if (stepIdx === 3) {
            handleLaunchCampaign(selectedLeadId, ['sms', 'postcard', 'rvm']);
          }
        }}
      />
    </div>
  );
}
