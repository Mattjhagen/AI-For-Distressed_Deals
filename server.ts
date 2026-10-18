import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Conversational AI Seller Acquisition Agent
app.post('/api/gemini/negotiate', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], property = {}, offerAmount } = req.body;

    const propertyContext = `
PROPERTY UNDER DISCUSSION:
Address: ${property.address || '1428 Elm Creek Dr, Dallas, TX'}
Property Type: ${property.propertyType || 'Single Family Residence'} (Built ${property.yearBuilt || 1984})
Square Footage: ${property.sqft || 1950} sqft | 3 Beds / 2 Baths
Est. After Repair Value (ARV): $${property.arv?.toLocaleString() || '320,000'}
Estimated Repairs Needed: $${property.estimatedRepairs?.toLocaleString() || '45,000'}
Max Allowable Offer (MAO): $${offerAmount?.toLocaleString() || '179,000'}
Distress Flags: ${property.distressType || 'Tax Delinquency ($18,400 past due) + Vacant + Pre-Foreclosure Notice'}
Owner Name: ${property.ownerName || 'Robert Henderson'}
    `.trim();

    const systemInstruction = `
You are "Sophia", the Senior Acquisitions Director at Apex Capital Holdings.
You negotiate with distressed property owners (pre-foreclosure, tax liens, inherited probate, code violations).

YOUR GOALS:
1. Be empathetic, polite, calm, and completely transparent. Distressed sellers are often stressed or embarrassed.
2. Emphasize advantages of selling to us: 100% Cash, NO realtor commissions (save 6%), WE pay all standard closing costs, buy 100% AS-IS (they don't even need to clean out junk or fix a single nail), and we can close in as little as 10-14 days or whenever they choose.
3. If they push back on price being lower than retail/Zillow, explain gently: "Retail prices assume the home is pristine and renovated, with 6% agent fees and months on market. Our cash offer has zero fees, no appraisal hurdles, and takes on all the repair costs so you walk away with guaranteed net cash in your bank."
4. If they are willing to consider an offer, invite them to lock in a purchase agreement or schedule a quick 10-minute walkthrough/closing call.
5. If the seller says they're ready to proceed or wants a contract sent, celebrate gently, confirm their email, and trigger the state purchase agreement!

Output your answer strictly in valid JSON format with keys:
{
  "reply": "Your conversational response as Sophia",
  "sentiment": "motivated" | "skeptical" | "hostile" | "ready_to_sign" | "information_seeking",
  "objectionCategory": "price_too_low" | "timeline" | "repairs_cost" | "trust_credibility" | "none",
  "calendarBookingProposed": boolean,
  "requiresHumanHandoff": boolean,
  "dealTemperature": "hot" | "warm" | "cold",
  "recommendedAction": "send_purchase_contract" | "schedule_call" | "continue_discovery" | "follow_up_later"
}
    `.trim();

    if (ai) {
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `${propertyContext}\n\nCONVERSATION HISTORY:\n${JSON.stringify(
                conversationHistory
              )}\n\nLATEST SELLER MESSAGE:\n"${message}"\n\nGenerate your acquisitions negotiation response in the required JSON format.`,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, ...parsed });
      } catch {
        return res.json({
          success: true,
          reply: responseText,
          sentiment: 'information_seeking',
          objectionCategory: 'none',
          calendarBookingProposed: false,
          requiresHumanHandoff: false,
          dealTemperature: 'warm',
          recommendedAction: 'continue_discovery',
        });
      }
    }

    // High quality programmatic fallback if API key is not yet configured
    const lower = (message || '').toLowerCase();
    let reply = `Hi ${property.ownerName?.split(' ')[0] || 'there'}, I completely understand. Our team can purchase ${property.address || 'the property'} completely as-is for cash, covering all closing costs and back taxes so you don't have to worry about repairs or foreclosure deadlines. Would next Thursday work to finalize terms?`;
    let sentiment: 'motivated' | 'skeptical' | 'hostile' | 'ready_to_sign' | 'information_seeking' = 'information_seeking';
    let objectionCategory: 'price_too_low' | 'timeline' | 'repairs_cost' | 'trust_credibility' | 'none' = 'none';
    let calendarBookingProposed = false;
    let requiresHumanHandoff = false;
    let dealTemperature: 'hot' | 'warm' | 'cold' = 'warm';
    let recommendedAction: 'send_purchase_contract' | 'schedule_call' | 'continue_discovery' | 'follow_up_later' = 'continue_discovery';

    if (lower.includes('sign') || lower.includes('send offer') || lower.includes('contract') || lower.includes('accept') || lower.includes('deal')) {
      reply = `That is fantastic news, ${property.ownerName?.split(' ')[0] || 'friend'}. I am immediately drafting our state purchase & sale agreement for ${property.address || 'your property'}. You will receive a secure digital signature link in just a moment. Once signed, we will wire the $2,500 earnest deposit to First American Title Escrow!`;
      sentiment = 'ready_to_sign';
      dealTemperature = 'hot';
      requiresHumanHandoff = true;
      recommendedAction = 'send_purchase_contract';
    } else if (lower.includes('low') || lower.includes('zillow') || lower.includes('worth more') || lower.includes('insult')) {
      reply = `I completely hear where you're coming from. Retail numbers often look attractive until you factor in 6% realtor commissions ($19k+), closing fees, and having to pay $45k+ in contractor repairs out of pocket. With our cash offer, there are zero deductions, we take care of all repairs, and you get guaranteed clean funds in 10 days. Would a quick 5-minute call help you see the exact breakdown?`;
      sentiment = 'skeptical';
      objectionCategory = 'price_too_low';
      dealTemperature = 'warm';
      recommendedAction = 'schedule_call';
      calendarBookingProposed = true;
    } else if (lower.includes('fast') || lower.includes('close') || lower.includes('when') || lower.includes('timeline')) {
      reply = `We can close as quickly as 10 to 14 days, or give you up to 45 days if you need time to pack and relocate—you pick the exact closing date. Because we buy with our own capital, there is no waiting on bank mortgage approvals or home inspections. What timeline works best for you?`;
      sentiment = 'motivated';
      dealTemperature = 'hot';
      recommendedAction = 'continue_discovery';
    } else if (lower.includes('repair') || lower.includes('roof') || lower.includes('damage') || lower.includes('condition') || lower.includes('trash') || lower.includes('clean')) {
      reply = `You don't have to lift a single finger or spend a dime. We purchase homes 100% as-is. If there are unwanted furniture, roof leaks, or debris, our clean-out crew handles everything after closing. You just take the items you want and leave the rest!`;
      sentiment = 'motivated';
      objectionCategory = 'repairs_cost';
      dealTemperature = 'hot';
      recommendedAction = 'continue_discovery';
    }

    return res.json({
      success: true,
      reply,
      sentiment,
      objectionCategory,
      calendarBookingProposed,
      requiresHumanHandoff,
      dealTemperature,
      recommendedAction,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/negotiate:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Negotiation agent error',
      reply: "Thank you for reaching out. Let me pull up your property records and our acquisitions manager will confirm the terms with you shortly.",
    });
  }
});

// Deep AI Underwriting Memo generator
app.post('/api/gemini/underwrite', async (req: Request, res: Response) => {
  try {
    const { property } = req.body;
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate an institutional-grade Distressed Real Estate Underwriting Memo for:
Property: ${JSON.stringify(property)}
Include:
1. Executive Investment Thesis
2. Distress & Motivation Risk Matrix (tax liens, pre-foreclosure urgency, probate heirs)
3. 3-Tier Acquisition Structure (Cash 14-day, Novation/Wholetail, Subject-To wrap)
4. Exit Strategy & Projected Net Assignment Spread
5. Closing contingencies and title clearing precautions.
Format as crisp Markdown.`,
      });
      return res.json({ success: true, memo: response.text });
    }

    // High fidelity fallback memo
    const memo = `### Institutional Acquisition Underwriting Memo
**Target Property:** ${property?.address || '1428 Elm Creek Dr, Dallas, TX'}
**Tax Parcel (APN):** ${property?.apn || '041-892-004-91'}
**Assessed ARV:** $${(property?.arv || 320000).toLocaleString()} | **MAO Target:** $${(property?.mao || 179000).toLocaleString()}

#### 1. Distress Situation & Motivation Drivers
- **Default Stage:** ${property?.distressType || 'Notice of Default (90+ Days Late)'}
- **Lien Severity:** $${(property?.taxLien || 18400).toLocaleString()} recorded county tax liens with pending auction threat.
- **Occupancy Status:** Vacant with code violation citations for unmaintained grounds and broken fascia.
- **Estimated Owner Equity:** $${((property?.arv || 320000) - (property?.mortgageBalance || 85000)).toLocaleString()} (${Math.round((((property?.arv || 320000) - (property?.mortgageBalance || 85000)) / (property?.arv || 320000)) * 100)}% equity spread).

#### 2. Underwriting & Valuation Spread
- **After Repair Value (ARV):** $${(property?.arv || 320000).toLocaleString()} ($${Math.round((property?.arv || 320000) / (property?.sqft || 1950))}/sqft based on 3 comps within 0.5 miles)
- **Estimated Rehab Scope:** $${(property?.estimatedRepairs || 45000).toLocaleString()} (Roof replacement, HVAC servicing, cosmetics, kitchen revamp)
- **Wholesale / Margin Spread:** $25,000 - $32,000 minimum assignment margin
- **Max Allowable Offer (MAO 70% rule):** $${(property?.mao || 179000).toLocaleString()}

#### 3. Recommended Acquisition Structure
- **Primary:** Straight Cash Purchase at $${(property?.mao || 179000).toLocaleString()} with 14-day close and $2,500 earnest money deposit.
- **Alternative:** Subject-To existing 3.8% mortgage balance ($${(property?.mortgageBalance || 85000).toLocaleString()}), reinstating delinquent taxes at closing.

#### 4. Title & Closing Escrow Precautions
- Order expedited municipal lien search and title commitment from First American Title.
- Secure standard wholesale assignment clause: *"Buyer reserves right to assign agreement to affiliated LLC or funding partner prior to close of escrow."*`;

    return res.json({ success: true, memo });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexAcquire AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
