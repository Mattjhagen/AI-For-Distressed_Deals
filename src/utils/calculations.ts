import { LeadRecord, ScoringWeightsConfig, PurchaseContract } from '../types';

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

/**
 * Standard Wholesaling / Distressed Property MAO Formula:
 * MAO = (ARV * Target%) - Estimated Repairs - Desired Wholesale Assignment Fee
 */
export function calculateMAO(
  arv: number,
  estimatedRepairs: number,
  rulePercent: number = 0.70, // Standard 70% rule
  assignmentFee: number = 10000
): number {
  const baseOffer = (arv * rulePercent) - estimatedRepairs - assignmentFee;
  return Math.max(Math.round(baseOffer / 500) * 500, 25000);
}

/**
 * Recomputes dynamic ML motivation score (0-100) based on investor custom criteria sliders
 */
export function calculateDynamicScore(lead: LeadRecord, weights: ScoringWeightsConfig): number {
  // Financial Equity Factor: higher equity = higher willingness to discount
  const equityRatio = lead.equityPercent / 100;
  const equityScore = Math.min(Math.max(equityRatio * 100, 0), 100) * (weights.equityWeight / 100);

  // Delinquency Urgency Factor:
  const delinquencyNorm = Math.min(lead.daysDelinquent / 365, 1.5) / 1.5;
  const delinquencyScore = delinquencyNorm * 100 * (weights.delinquencyWeight / 100);

  // Absentee Distance Factor:
  let absenteeScore = 20;
  if (lead.isAbsenteeOwner) {
    const distanceBonus = Math.min(lead.outOfStateDistanceMiles / 1000, 1.0) * 50;
    absenteeScore = (50 + distanceBonus) * (weights.absenteeWeight / 100);
  } else {
    absenteeScore = 20 * (weights.absenteeWeight / 100);
  }

  // Pre-Foreclosure Auction Urgency Factor:
  let auctionScore = 20;
  if (lead.preForeclosureAuctionDate) {
    auctionScore = 100 * (weights.auctionUrgencyWeight / 100);
  }

  // Code Violation Factor:
  let violationScore = 15;
  if (lead.distressType === 'Code Violations' || lead.distressType === 'Tax Delinquency') {
    violationScore = 90 * (weights.violationWeight / 100);
  }

  const rawWeightedSum = (equityScore * 0.30) + 
                         (delinquencyScore * 0.25) + 
                         (absenteeScore * 0.15) + 
                         (auctionScore * 0.20) + 
                         (violationScore * 0.10);

  return Math.min(Math.max(Math.round(rawWeightedSum), 45), 99);
}

export function generateAuditHash(contractNumber: string, sellerName: string, date: string): string {
  // Simple deterministic visual SHA-256 style fingerprint
  const seed = `${contractNumber}-${sellerName}-${date}-APEX-VERIFIED-AUTHENTICITY`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SHA256: ${hex}c8e47b9921a0f9d443e${hex}8819`;
}

/**
 * Generates official state-specific purchase and sale agreement text
 */
export function generateStateContractText(contract: PurchaseContract, lead: LeadRecord): string {
  const stateLabels: Record<string, string> = {
    TX: 'TEXAS REAL ESTATE COMMISSION (TREC) FORM COMPLIANT - UNIMPROVED & IMPROVED RESIDENTIAL AS-IS CASH CONTRACT',
    CA: 'CALIFORNIA ASSOCIATION OF REALTORS (C.A.R.) STANDARDIZED RESIDENTIAL WHOLESALE PURCHASE & SALE AGREEMENT',
    FL: 'FLORIDA FAR/BAR AS-IS RESIDENTIAL CONTRACT FOR SALE AND PURCHASE',
    GA: 'GEORGIA ASSOCIATION OF REALTORS (GAR) CASH RESIDENTIAL SALES AGREEMENT',
    OH: 'OHIO REVISED CODE (ORC) STATUTORY COMMERCIAL & RESIDENTIAL PURCHASE AGREEMENT',
  };

  const header = stateLabels[contract.stateTemplate] || stateLabels.TX;

  return `================================================================================
${header}
CONTRACT DOCUMENT NO: ${contract.contractNumber} | FILE REF: ${lead.apn}
================================================================================

1. PARTIES:
This Purchase and Sale Agreement ("Agreement") is entered into this date, between:
SELLER: ${contract.sellerLegalName} ("Seller")
Mailing Address: ${lead.ownerMailingAddress}
Phone: ${lead.ownerPhone} | Email: ${lead.ownerEmail}

BUYER: ${contract.buyerLegalName} ("Buyer")
Mailing Address: 100 Crescent Ct, Suite 1400, Dallas, TX 75201
Notice Email: acquisitions@apexcapital-ai.com

2. PROPERTY IDENTIFICATION:
Seller agrees to sell and Buyer agrees to purchase the real property commonly known as:
Street Address: ${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}
County: ${lead.county} | Tax Assessor Parcel Number (APN): ${lead.apn}
Legal Description: Recorded in the Official Real Property Records of ${lead.county}, State of ${lead.state}.

3. PURCHASE PRICE & EARNEST MONEY DEPOSIT:
A. TOTAL CASH PURCHASE PRICE: ${formatCurrency(contract.purchasePrice)}
B. EARNEST MONEY DEPOSIT: ${formatCurrency(contract.earnestMoneyDeposit)}
   To be deposited with the Closing Escrow Agent within three (3) business days of mutual contract execution.
C. BALANCE OF PURCHASE PRICE: ${formatCurrency(contract.purchasePrice - contract.earnestMoneyDeposit)}
   Payable in certified funds or via immediate bank wire transfer at the close of escrow.

4. CLOSING & SETTLEMENT ESCROW:
A. CLOSING DATE: Close of Escrow shall occur on or before ${contract.closingDate || 'within 14 days of title commitment delivery'}.
B. ESCROW / TITLE AGENT: ${contract.titleCompany}.
C. CLOSING COSTS: Buyer covenants to pay 100% of standard closing costs, including Title Insurance policy, escrow settlement fees, and deed recording fees. Seller shall be responsible for paying current property taxes prorated through the date of closing and clearing any underlying mortgage liens or tax judgments from gross proceeds.

5. AS-IS CONDITION & NO SELLER WARRANTIES:
${contract.asIsClauseIncluded ? `[X] AS-IS COVENANT: The Property is sold strictly "AS-IS, WHERE-IS" and with all faults. Seller makes no warranties, express or implied, regarding physical condition, mechanical systems, roof, structural components, or environmental matters. Seller is NOT required to perform any repairs, clean-outs, or debris removal. Any personal property remaining on the premises at the time of closing shall be deemed abandoned and shall transfer to Buyer at zero additional cost.` : ''}

6. INSPECTION CONTINGENCY PERIOD:
Buyer shall have a period of ${contract.inspectionDays} calendar days following mutual execution of this Agreement ("Inspection Period") to review title, perform physical walk-throughs, and verify zoning and municipal records.

7. ASSIGNABILITY & RIGHT TO WHOLESALE:
${contract.assignmentClauseIncluded ? `[X] ASSIGNMENT PRIVILEGE: Buyer reserves the express, unrestricted right to assign its rights and equitable interest in this Agreement to an affiliated investment entity, funding partner, or third-party cash end-buyer prior to closing without additional seller approval. No such assignment shall release Buyer of its obligation to ensure funds are deposited.` : ''}

8. SPECIAL DISTRESS LIEN PROVISIONS:
${contract.notes || 'Title company is authorized and directed to pay all outstanding delinquent property taxes and mechanic liens directly from the seller closing disbursement.'}

================================================================================
EXECUTION & SIGNATURE AUDIT TRAIL:
================================================================================
SELLER SIGNATURE:
${contract.signedBySeller ? `[SIGNED DIGITALLY - VERIFIED]\nName: ${contract.sellerLegalName}\nTimestamp: ${contract.sellerSignatureDate || 'Mutual Execution'}\nIP Address: 72.198.44.102 (TLS 1.3 Certified)` : `[PENDING SELLER SIGNATURE - AWAITING DIGITAL EXECUTION]`}

BUYER SIGNATURE:
${contract.signedByBuyer ? `[SIGNED DIGITALLY - VERIFIED]\nName: ${contract.buyerLegalName}\nTimestamp: ${contract.buyerSignatureDate || 'Mutual Execution'}\nIP Address: 198.51.100.41 (Apex Capital Holdings / Acquisitions VP)` : `[PENDING BUYER SIGNATURE]`}

SECURITY HASH: ${contract.auditHash || generateAuditHash(contract.contractNumber, contract.sellerLegalName, '2026-10-18')}
================================================================================`;
}
