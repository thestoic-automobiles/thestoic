import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Returns = () => (
  <PolicyShell eyebrow="Post-purchase" title="Return & Exchange Policy" subtitle="Wrong fitment or damaged parts? Here's how to get them replaced.">
    <PolicySection title="Return Window">
      <p>Return requests must be raised within 7 days of delivery. Parts must be unused, in original packaging, with all tags, manuals and accessories intact.</p>
    </PolicySection>
    <PolicySection title="Eligible Returns">
      <ul className="list-disc pl-5 space-y-1">
        <li>Wrong part shipped.</li>
        <li>Damaged or defective on arrival.</li>
        <li>Confirmed fitment mismatch despite providing correct vehicle details at the time of order.</li>
      </ul>
    </PolicySection>
    <PolicySection title="Non-Returnable Items">
      <ul className="list-disc pl-5 space-y-1">
        <li>Electrical & electronic components once installed or with broken seals.</li>
        <li>Lubricants, coolants and consumables once opened.</li>
        <li>Custom-ordered or special-import items.</li>
      </ul>
    </PolicySection>
    <PolicySection title="How to Initiate a Return">
      <p>Send a message on WhatsApp to +91 73874 80081 with your order number, reason for return and clear photos / video of the part and packaging. Our team will arrange a reverse pickup or share a return address.</p>
    </PolicySection>
    <PolicySection title="Exchange">
      <p>Exchanges are offered subject to stock availability. If the replacement part has a higher value, the difference is payable before dispatch; if lower, the difference is refunded as per the Refund Policy.</p>
    </PolicySection>
  </PolicyShell>
);

export default Returns;
