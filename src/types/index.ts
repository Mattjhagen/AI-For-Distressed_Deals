export type DistressType = 
  | 'Pre-Foreclosure'
  | 'Tax Delinquency'
  | 'Probate / Inherited'
  | 'Code Violations'
  | 'High-Equity Vacant'
  | 'Bankruptcy';

export type PipelineStage = 
  | 'raw_lead'
  | 'enriched'
  | 'active_outreach'
  | 'seller_engaged'
  | 'offer_sent'
  | 'under_contract'
  | 'due_diligence'
  | 'closed';

export interface FeatureFactor {
  name: string;
  impact: number; // e.g. +28, +15
  category: 'financial' | 'distress' | 'property' | 'behavioral';
  description: string;
}

export interface Touchpoint {
  id: string;
  channel: 'sms' | 'email' | 'rvm' | 'postcard';
  timestamp: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'responded';
  summary: string;
  content: string;
  trackingCode?: string;
}

export interface CompProperty {
  id: string;
  address: string;
  distanceMiles: number;
  salePrice: number;
  saleDate: string;
  beds: number;
  baths: number;
  sqft: number;
  pricePerSqft: number;
  condition: 'Remodeled' | 'Average' | 'Fair';
}

export interface PurchaseContract {
  contractNumber: string;
  stateTemplate: 'TX' | 'CA' | 'FL' | 'OH' | 'GA';
  purchasePrice: number;
  earnestMoneyDeposit: number;
  inspectionDays: number;
  closingDays: number;
  closingDate: string;
  buyerLegalName: string;
  sellerLegalName: string;
  titleCompany: string;
  status: 'draft' | 'pending_seller_signature' | 'fully_executed';
  signedBySeller: boolean;
  sellerSignatureDate?: string;
  sellerSignatureDataUrl?: string;
  signedByBuyer: boolean;
  buyerSignatureDate?: string;
  buyerSignatureDataUrl?: string;
  auditHash?: string;
  asIsClauseIncluded: boolean;
  assignmentClauseIncluded: boolean;
  notes?: string;
}

export interface LeadRecord {
  id: string;
  apn: string;
  address: string;
  city: string;
  state: 'TX' | 'CA' | 'FL' | 'OH' | 'GA' | 'AZ' | 'IL';
  zip: string;
  county: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerMailingAddress: string;
  isAbsenteeOwner: boolean;
  outOfStateDistanceMiles: number;
  distressType: DistressType;
  distressNotes: string;
  daysDelinquent: number;
  taxLienAmount: number;
  preForeclosureAuctionDate?: string;
  arv: number;
  estimatedRepairs: number;
  mortgageBalance: number;
  estimatedEquity: number;
  equityPercent: number;
  mao: number; // Maximum Allowable Offer
  projectedWholesaleProfit: number;
  mlMotivationScore: number; // 0 - 100
  mlTier: 'High Priority' | 'Medium Priority' | 'Watchlist';
  featureFactors: FeatureFactor[];
  pipelineStage: PipelineStage;
  outreachHistory: Touchpoint[];
  propertyDetails: {
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt: number;
    lotSize: string;
    propertyType: string;
    zestimateRetail: number;
    roofCondition: string;
    foundationStatus: string;
  };
  comps: CompProperty[];
  contract?: PurchaseContract;
  lastRefreshed: string;
  isDuplicate?: boolean;
  duplicateMatchedId?: string;
  notes: string[];
}

export interface ScoringWeightsConfig {
  equityWeight: number; // 0 - 100
  delinquencyWeight: number; // 0 - 100
  absenteeWeight: number; // 0 - 100
  violationWeight: number; // 0 - 100
  auctionUrgencyWeight: number; // 0 - 100
  minScoreForAutoOutreach: number; // 0 - 100
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'seller' | 'investor';
  timestamp: string;
  text: string;
  sentiment?: 'motivated' | 'skeptical' | 'hostile' | 'ready_to_sign' | 'information_seeking';
  objectionCategory?: string;
  isHandoffAlert?: boolean;
}
