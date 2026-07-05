import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Privacy = () => (
  <PolicyShell eyebrow="Your data" title="Privacy Policy" subtitle="How we collect, use and protect your information.">
    <PolicySection title="Information We Collect">
      <p>We collect information you provide directly — name, mobile number, email, billing / shipping address, GST number (for B2B), vehicle details, and order history. We also collect basic device and usage data via cookies and analytics.</p>
    </PolicySection>
    <PolicySection title="How We Use Your Information">
      <ul className="list-disc pl-5 space-y-1">
        <li>Process and deliver your orders.</li>
        <li>Verify B2B dealer accounts and apply wholesale pricing.</li>
        <li>Send order updates via WhatsApp, SMS or email.</li>
        <li>Improve our catalogue, website experience and customer support.</li>
        <li>Comply with legal, tax and GST requirements.</li>
      </ul>
    </PolicySection>
    <PolicySection title="Sharing of Information">
      <p>We share information only with: courier partners (for delivery), payment gateways (for transactions), and government authorities where legally required. We do not sell your personal data to third parties.</p>
    </PolicySection>
    <PolicySection title="Cookies">
      <p>We use cookies to remember your cart, keep you signed in, and understand site usage. You can disable cookies in your browser, but some features may not work correctly.</p>
    </PolicySection>
    <PolicySection title="Data Retention">
      <p>Order and tax records are retained as required under Indian law (typically 8 years). Account data is retained as long as your account is active.</p>
    </PolicySection>
    <PolicySection title="Your Rights">
      <p>You may request access, correction or deletion of your personal data by writing to us on WhatsApp at +91 73874 80081 or via the Contact page.</p>
    </PolicySection>
  </PolicyShell>
);

export default Privacy;
