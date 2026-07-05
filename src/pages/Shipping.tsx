import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Shipping = () => (
  <PolicyShell eyebrow="Logistics" title="Shipping & Delivery Policy" subtitle="How and when your spare parts reach you across India.">
    <PolicySection title="Dispatch Timelines">
      <p>Orders placed before 4:00 PM IST on working days are dispatched the same day. Orders placed after 4:00 PM or on Sundays / public holidays are dispatched on the next working day.</p>
    </PolicySection>
    <PolicySection title="Delivery Timelines">
      <p>Standard delivery across India takes 2–5 business days for metro and tier-1 cities, and 4–7 business days for remote pincodes. Express delivery may be available on request for select pincodes.</p>
    </PolicySection>
    <PolicySection title="Shipping Charges">
      <p>Shipping is calculated based on weight, volume and destination pincode and is shown at checkout. Bulk and B2B orders may qualify for free shipping — please contact our team for a custom quote.</p>
    </PolicySection>
    <PolicySection title="Tracking">
      <p>A tracking link is shared on WhatsApp / email as soon as the order is handed over to our courier partner. For any delivery concern, reach us on +91 73874 80081.</p>
    </PolicySection>
    <PolicySection title="Undelivered / Returned Shipments">
      <p>If a shipment is returned to us due to an incorrect address, unavailability of the recipient, or repeated failed attempts, re-shipping charges will apply.</p>
    </PolicySection>
  </PolicyShell>
);

export default Shipping;
