import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Refund = () => (
  <PolicyShell eyebrow="Order management" title="Cancellation & Refund Policy" subtitle="Clear rules for cancelling an order and receiving your refund.">
    <PolicySection title="Order Cancellation">
      <p>Orders can be cancelled free of charge before they are dispatched. To cancel, contact us on WhatsApp at +91 73874 80081 with your order number.</p>
      <p>Once an order is handed over to the courier, it cannot be cancelled — but you may refuse delivery or initiate a return as per our Return & Exchange Policy.</p>
    </PolicySection>
    <PolicySection title="Refund Eligibility">
      <p>Refunds are issued for:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Pre-dispatch cancellations.</li>
        <li>Items damaged in transit (reported within 48 hours with unboxing photos / video).</li>
        <li>Wrong item delivered.</li>
        <li>Items that cannot be replaced due to stock unavailability.</li>
      </ul>
    </PolicySection>
    <PolicySection title="Refund Timelines">
      <p>Approved refunds are processed within 3 working days from approval. Funds typically reflect in your account within 5–7 working days, depending on your bank or UPI provider.</p>
    </PolicySection>
    <PolicySection title="Mode of Refund">
      <p>Refunds are issued to the original payment method. For Cash on Delivery orders, refunds are processed via UPI / bank transfer to an account in the customer's name.</p>
    </PolicySection>
  </PolicyShell>
);

export default Refund;
