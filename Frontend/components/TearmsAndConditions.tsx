// components/TermsAndConditions.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface PolicyPage {
  id: number;
  title: string;
  pageName: string;
  content: string[];
  anchor: string;
}

const TermsAndConditions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const searchParams = useSearchParams();

  const pages: PolicyPage[] = [
    {
      id: 1,
      title: "Terms of Service",
      pageName: "Terms of Service",
      anchor: "terms-of-service",
      content: [
        "Welcome to www.ugetmogroup.com, operated by UGETMO GROUP (PTY) LTD, 377 Rivonia Blvd, Rivonia, Sandton, 2128, South Africa. By accessing or purchasing from our website, you agree to these Terms of Service.",
        "• Website Use: For lawful purposes only. Unauthorized activities (e.g., hacking, data scraping) are prohibited, per the Electronic Communications and Transactions Act, 2002.",
        "• Order Acceptance: Orders require a minimum value of R500 and are subject to UGETMO GROUP's approval. We may cancel orders due to stock unavailability, pricing errors, or suspected fraud, with notification within 3 working days.",
        "• Pricing: Prices are in ZAR, Exclusive of VAT, and valid for 7 days per quotation unless stated otherwise. Errors are corrected with customer notification.",
        "• Product Descriptions: We aim for accurate descriptions, images, and specifications. Minor variations (e.g., color for branded merchandise) do not qualify for returns unless faulty, per CPA Section 55.",
        "• Liability: UGETMO GROUP's liability is limited to the order value. We are not responsible for indirect losses (e.g., business downtime), except as required by CPA.",
        "• Ownership: For business account orders, ownership remains with UGETMO GROUP until full payment is received, per Payment Terms.",
        "• Intellectual Property: Website content (logos, images, text) is owned by UGETMO GROUP, per the Copyright Act, 1978. Unauthorized use is prohibited.",
        "• Force Majeure: We are not liable for delays due to unforeseen events (e.g., strikes, natural disasters).",
        "• Dispute Resolution: Disputes are resolved via mediation, then arbitration per CPA, or referral to the National Consumer Commission.",
        "• Amendments: Terms may be updated, with changes posted here. Continued use constitutes acceptance.",
        "Contact: legal@ugetmogroup.com or 011 749 3322."
      ]
    },
    {
      id: 2,
      title: "Privacy Policy (POPIA Compliance)",
      pageName: "Privacy Policy",
      anchor: "privacy-policy",
      content: [
        "UGETMO GROUP (PTY) LTD is committed to protecting personal information under the Protection of Personal Information Act, 2013 (POPIA). This Privacy Policy governs data practices for www.ugetmogroup.com.",
        "• Data Collection: We collect personal information (e.g., name, contact details, payment details) via website forms, live chat (HubSpot), WhatsApp, Meta Business Suite, Payfast transactions, or email for orders, quotations, business accounts, and marketing.",
        "• Purpose of Use: Data is used to:",
        "  - Process orders (minimum R500) and deliveries.",
        "  - Manage quotations and 30/60-day accounts.",
        "  - Process payments via Payfast.",
        "  - Send marketing communications (with consent).",
        "  - Improve website functionality.",
        "• Consent: Using our website implies consent to data collection for these purposes. Opt out of marketing via sales@ugetmogroup.com or unsubscribe links.",
        "• Data Security:",
        "  - Data is stored in HubSpot, Xero, AWS, and Payfast with encryption and restricted access.",
        "  - Payfast complies with PCI DSS for secure payments.",
        "  - Employees receive annual POPIA training.",
        "  - Breaches are reported to the Information Regulator and affected parties within 72 hours.",
        "• Data Sharing: Shared only with authorized third parties (e.g., couriers, Payfast) under confidentiality agreements. We do not sell data.",
        "• Retention: Data is retained for 5 years per SARS requirements or as needed for business accounts, then securely deleted.",
        "• Customer Rights: Request access, correction, or deletion of data via legal@ugetmogroup.com within 10 working days."
      ]
    },
    {
      id: 3,
      title: "Privacy Policy (Continued) & Payment Terms",
      pageName: "Payment Terms",
      anchor: "payment-terms",
      content: [
        "• Cookies: Used for essential functions (e.g., live chat, cart, Payfast) and analytics/marketing (with consent). Manage via cookie banner or browser settings.",
        "• Cross-Border Data: International transfers (e.g., Payfast servers) use POPIA-compliant safeguards.",
        "• Complaints: Contact our Information Officer at legal@ugetmogroup.com or the Information Regulator.",
        "PAYMENT TERMS",
        "UGETMO GROUP (PTY) LTD ensures secure and timely payments for orders (minimum R500).",
        "• Standard Payments: Full payment is due upon quotation acceptance, payable via:",
        "  - Payfast: Secure online payments (credit/debit cards, EFT, mobile payments) on www.ugetmogroup.com, per PCI DSS standards.",
        "  - EFT: To Standard Bank, Account No: 1022 7576 908, Business Current, Branch Code: 051001. Send proof to admin@ugetmogroup.com",
        "    No goods are released until payment clears, unless a business account is approved.",
        "• Business Accounts:",
        "  - Apply via admin@ugetmogroup.com with credit references. Approval within 5 working days.",
        "  - 30-Day Accounts: Payment due within 30 days from invoice date.",
        "  - 60-Day Accounts: Payment due within 60 days, subject to additional approval.",
        "  - Ownership remains with UGETMO GROUP until full payment is received.",
        "• Late Payments:",
        "  - Interest: 2% per month (24% per annum, compounded daily), per the National Credit Act, 2005.",
        "  - Penalty: 5% of the outstanding balance for failure to honor terms, added to the next invoice."
      ]
    },
    {
      id: 4,
      title: "Payment Terms (Continued) & Delivery Policy",
      pageName: "Delivery",
      anchor: "delivery-policy",
      content: [
        "• Non-payment may lead to account suspension, order cancellation, or legal action after 7 days' notice.",
        "• Invoicing: Issued via Xero, sent to the client's email.",
        "• Disputes: Raise invoice disputes within 7 days via admin@ugetmogroup.com. Unresolved disputes may be arbitrated, per CPA.",
        "DELIVERY POLICY",
        "UGETMO GROUP (PTY) LTD ensures timely delivery of orders (minimum R500).",
        "• Lead Times:",
        "  - Stationery: 1–3 working days.",
        "  - Furniture: 1–2 weeks (some items: 1–5 working days).",
        "  - Branding: 3–7 working days for branded items & 2-3 days for unbranded items",
        "  - Tech accessories and hardware: 1–3 working days.",
        "• Delivery Fees:",
        "  - Free for orders over R2,000.",
        "  - For orders R500–R2,000, a standard fee of R180.00 applies quoted at checkout or in the quotation.",
        "• Process: Orders are processed after payment confirmation via Payfast or EFT (or business account approval). Tracking details are sent via email.",
        "• Delivery Areas: Nationwide, with priority to Gauteng. International delivery available on request, subject to fees and customs compliance.",
        "• Risk and Ownership: Risk transfers upon delivery; ownership transfers after full payment (for business accounts, remains with UGETMO GROUP until paid).",
        "• Failed Deliveries: If delivery fails due to incorrect address or unavailability, a redelivery fee applies. Contact sales@ugetmogroup.com within 3 days to reschedule.",
        "• Inspection: Inspect goods upon receipt and report issues within 7 days, per Return Policy."
      ]
    },
    {
      id: 5,
      title: "Return Policy",
      pageName: "Returns",
      anchor: "return-policy",
      content: [
        "UGETMO GROUP (PTY) LTD ensures customer satisfaction for orders (minimum R500), per the Consumer Protection Act, 2008.",
        "• No Returns on Branded Merchandise: Customized items (e.g., clothing, promotional items) are non-returnable unless faulty or incorrect.",
        "• Eligible Returns:",
        "  - Faulty or incorrect items must be reported within 7 days of delivery via sales@ugetmogroup.com or live chat, with order number, proof of purchase, and photos.",
        "  - Approved returns must be unused, in original packaging, and returned within 7 days of authorization to 377 Rivonia Blvd, Rivonia, Sandton, 2128.",
        "• Handling Fee: A 15% restocking fee applies to approved non-faulty returns (excluding branded merchandise), deducted from the refund to cover inspection, repackaging, and restocking costs.",
        "• Non-Returnable Items: Groceries, consumables, special-order furniture, and items damaged by misuse or reported after 7 days.",
        "• Shipping Costs: Customers cover return shipping unless faulty or incorrect, per CPA.",
        "• Resolution: Approved returns may result in repair, replacement, or refund, per Refund Policy."
      ]
    },
    {
      id: 6,
      title: "Refund Policy",
      pageName: "Refunds",
      anchor: "refund-policy",
      content: [
        "UGETMO GROUP (PTY) LTD processes refunds for approved returns, per the Consumer Protection Act, 2008.",
        "• Eligibility: Refunds for faulty or incorrect non-branded items approved under the Return Policy. Branded merchandise is non-refunded unless faulty or incorrect.",
        "• Non-Refundable Items: Groceries, consumables, special-order furniture, and branded merchandise (unless faulty/incorrect).",
        "• Process:",
        "  - Submit a return request within 7 days via admin@ugetmogroup.com or live chat, with order details and proof of fault.",
        "  - Return approved items within 7 days.",
        "• Refunds are processed within 7 working days after inspection, via Payfast (for online payments), EFT, or store credit (customer's choice).",
        "• Deductions: A 15% handling fee applies to non-faulty returns. Shipping costs are non-refunded unless faulty/incorrect.",
        "• Business Accounts: Refunds are credited to the account balance or refunded via EFT.",
        "• CPA Compliance: Per Section 56, faulty items within 6 months may be repaired, replaced, or refunded at our discretion.",
        "• Disputes: Contact legal@ugetmogroup.com ; escalate to the National Consumer Commission if unresolved."
      ]
    },
    {
      id: 7,
      title: "Business Account Terms",
      pageName: "Business Accounts",
      anchor: "business-accounts",
      content: [
        "UGETMO GROUP (PTY) LTD offers 30-day and 60-day payment terms for approved business clients (minimum order R500).",
        "• Eligibility: Apply via admin@ugetmogroup.com with credit references. Approval within 5 working days.",
        "• Terms:",
        "  - 30-Day Accounts: Payment due within 30 days from invoice date.",
        "  - 60-Day Accounts: Payment due within 60 days, subject to additional approval.",
        "  - Ownership remains with UGETMO GROUP until full payment is received.",
        "• Payment: Via Payfast or EFT to Standard Bank, Account No: 1022 7576 908, Branch Code: 051001. Send proof to admin@ugetmogroup.com.",
        "• Late Payments:",
        "  - Interest: 2% per month (24% per annum, compounded daily), per the National Credit Act, 2005.",
        "  - Penalty: 5% of the outstanding balance for failure to honor terms, added to the next invoice.",
        "• Non-payment may lead to account suspension, order cancellation, or legal action after 7 days' notice.",
        "• Credit Limits: Set based on creditworthiness, reviewed quarterly.",
        "• Invoicing: Issued via Xero, sent to the client's email.",
        "• Disputes: Notify admin@ugetmogroup.com within 7 days. Unresolved disputes may be arbitrated, per CPA."
      ]
    },
    {
      id: 8,
      title: "Quotation & Customer Service Policies",
      pageName: "Quotations",
      anchor: "quotation-policy",
      content: [
        "QUOTATION POLICY",
        "UGETMO GROUP (PTY) LTD provides transparent quotations (minimum order R500).",
        "• Validity: Quotations are valid for 7 days unless stated otherwise. Prices may change due to stock or cost fluctuations.",
        "• Acceptance: Accepting a quotation creates a binding order, subject to Payment Terms.",
        "• Process: Request quotes via www.ugetmogroup.com, live chat (HubSpot), or sales@ugetmogroup.com. Quotes are prepared in Xero within 1–2 working days.",
        "• Custom Orders: Branded merchandise or bulk orders may have extended lead times and are non-returnable unless faulty.",
        "• Errors: Pricing or stock errors are corrected before confirmation, with notification within 3 working days.",
        "CUSTOMER SERVICE POLICY",
        "UGETMO GROUP (PTY) LTD is dedicated to exceptional customer service.",
        "• Support Channels: Contact via live chat (HubSpot, 08:00–17:00, Monday–Friday), WhatsApp, Meta Business Suite, sales@ugetmogroup.com or 011 749 3322.",
        "• Response Time: Live chat within 5 minutes; email/phone within 24 hours.",
        "• Feedback: Share via HubSpot or sales@ugetmogroup.com to target 90%+ satisfaction.",
        "• Complaints: Report issues within 7 days for resolution. Escalate to the National Consumer Commission if unresolved, per CPA.",
        "• Community Engagement: We support initiatives"
      ]
    },
    {
      id: 9,
      title: "Sustainability, Cookies, Warranties & Accessibility",
      pageName: "Sustainability",
      anchor: "sustainability-policy",
      content: [
        "SUSTAINABILITY POLICY",
        "UGETMO GROUP (PTY) LTD is committed to reducing environmental impact.",
        "• Eco-Friendly Products: We prioritize sustainable office supplies, furniture, and packaging.",
        "• Waste Reduction: Recycling programs operate at 377 Rivonia Blvd, Sandton. Customers are encouraged to recycle packaging.",
        "• Energy Efficiency: We use energy-efficient systems and digital invoicing via Xero.",
        "• Supplier Standards: We partner with environmentally responsible suppliers, verified annually.",
        "• Engagement: Contact sales@ugetmogroup.com for sustainability inquiries.",
        "COOKIE POLICY",
        "UGETMO GROUP (PTY) LTD uses cookies on www.ugetmogroup.com to enhance functionality.",
        "• Types of Cookies:",
        "  - Essential: Support live chat, cart, and Payfast payments.",
        "  - Analytics: Track usage for improvements, with consent.",
        "  - Marketing: Deliver targeted campaigns, with consent.",
        "• Consent: Website use implies consent to essential cookies. Manage others via cookie banner or browser settings.",
        "• Data Protection: Cookie data is stored securely per POPIA.",
        "• Opt-Out: Disable cookies via browser settings, noting potential impacts on functionality.",
        "• Contact: Email legal@ugetmogroup.com for queries."
      ]
    },
    {
      id: 10,
      title: "Warranties & Accessibility",
      pageName: "Warranties",
      anchor: "warranty-policy",
      content: [
        "WARRANTY POLICY",
        "UGETMO GROUP (PTY) LTD provides warranties for select products, per the Consumer Protection Act, 2008.",
        "• Coverage:",
        "  - Tech accessories/hardware: 6-12(depending on the brand) months warranty for manufacturing defects.",
        "  - Furniture: 1-5(depending on the item) year warranty for structural defects (excludes wear and tear).",
        "  - Stationery and groceries: No warranty unless faulty upon delivery.",
        "  - Branded merchandise: No warranty unless faulty/incorrect.",
        "• Claims: Report defects within 7 days via sales@ugetmogroup.com, with order details and photos. Approved claims result in repair, replacement, or refund within 14 working days.",
        "• Exclusions: Damage from misuse, unauthorized repairs, or normal wear.",
        "• Shipping: UGETMO GROUP covers return shipping for valid claims.",
        "ACCESSIBILITY POLICY",
        "UGETMO GROUP (PTY) LTD is committed to making www.ugetmogroup.com accessible, per South African equality laws.",
        "• Features: Supports screen readers, keyboard navigation, and high-contrast modes. Live chat (HubSpot) available 08:00–17:00, Monday–Friday.",
        "• Feedback: Report accessibility issues to sales@ugetmogroup.com for resolution within 10 working days.",
        "• Commitment: We aim to meet Web Content Accessibility Guidelines (WCAG) 2.1."
      ]
    }
  ];

  // Get the section from URL parameters
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      const pageIndex = pages.findIndex(page => page.anchor === section);
      if (pageIndex !== -1) {
        setCurrentPage(pageIndex);
      }
    }
  }, [searchParams]);

  const nextPage = (): void => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex: number): void => {
    setCurrentPage(pageIndex);
  };

  const formatContent = (content: string[]): React.JSX.Element[] => {
    return content.map((line: string, index: number) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('•')) {
        return <li key={index} className="mb-2 pl-4">{trimmedLine.substring(1).trim()}</li>;
      } else if (trimmedLine.startsWith('-')) {
        return <li key={index} className="mb-1 pl-8 text-gray-600 text-sm">{trimmedLine.substring(1).trim()}</li>;
      } else if (trimmedLine === '') {
        return <br key={index} />;
      } else if (trimmedLine.includes(':') && !trimmedLine.startsWith(' ') && !trimmedLine.startsWith('•')) {
        const parts = trimmedLine.split(':');
        const title = parts[0];
        const description = parts.slice(1).join(':');
        return (
          <div key={index} className="mb-3">
            <strong className="text-blue-800">{title.trim()}:</strong> {description.trim()}
          </div>
        );
      } else if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 5) {
        return <h3 key={index} className="text-xl font-semibold text-blue-800 mt-6 mb-4 border-b pb-2">{trimmedLine}</h3>;
      } else {
        return <p key={index} className="mb-4">{trimmedLine}</p>;
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Terms and Conditions</h1>
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-semibold inline-block">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 border-b border-gray-200 pb-2">
            {pages[currentPage].title}
          </h2>
          <div className="text-gray-700 leading-relaxed">
            {formatContent(pages[currentPage].content)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 0}
            className="w-full sm:w-auto bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex justify-center gap-2">
            {pages.map((_, index: number) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full border-none transition-all duration-300 ${
                  currentPage === index ? 'bg-blue-800 scale-125' : 'bg-gray-300 hover:bg-blue-800 hover:scale-110'
                }`}
                onClick={() => goToPage(index)}
                aria-label={`Go to ${pages[index].title}`}
              />
            ))}
          </div>

          <button 
            onClick={nextPage} 
            disabled={currentPage === pages.length - 1}
            className="w-full sm:w-auto bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;