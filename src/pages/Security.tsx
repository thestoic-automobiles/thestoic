import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Security = () => (
  <PolicyShell eyebrow="Trust & safety" title="Security" subtitle="How we keep your account, payments and data safe.">
    <PolicySection title="Secure Payments">
      <p>All online payments are processed through PCI-DSS compliant payment gateways. Card numbers, CVV and UPI PINs are never stored on our servers — they are handled directly by the payment processor.</p>
    </PolicySection>
    <PolicySection title="Encrypted Connection">
      <p>The entire website runs on HTTPS with industry-standard SSL/TLS encryption, protecting data in transit between your device and our servers.</p>
    </PolicySection>
    <PolicySection title="Account Protection">
      <p>Passwords are stored using one-way cryptographic hashing. We recommend using a strong, unique password and never sharing your login credentials. B2B accounts are tied to a verified customer code.</p>
    </PolicySection>
    <PolicySection title="Access Control">
      <p>Internal access to customer data is restricted to authorised team members on a need-to-know basis and is logged for audit purposes.</p>
    </PolicySection>
    <PolicySection title="Report a Vulnerability">
      <p>If you discover a security issue on our website, please report it responsibly on WhatsApp at +91 73874 80081 or via the Contact page. We will investigate every credible report.</p>
    </PolicySection>
  </PolicyShell>
);

export default Security;
