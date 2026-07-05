import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-charcoal mb-3">{title}</h2>
    <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </div>
);

const Terms = () => (
  <Layout>
    <section className="pt-28 pb-16 bg-secondary/40 border-b border-border">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading eyebrow="Legal" title="Terms & Conditions" subtitle="Please read these terms carefully before using The Stoic Automobiles website or placing an order." />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Last updated: June 2026</p>
      </div>
    </section>

    <section className="py-14">
      <div className="container mx-auto max-w-4xl">
        <Section title="1. Introduction">
          <p>These Terms & Conditions ("Terms") govern your use of the website operated by The Stoic Automobiles ("we", "us", "our"). By accessing this website or placing an order, you agree to be bound by these Terms.</p>
        </Section>

        <Section title="2. Products & Genuine Parts">
          <p>We supply genuine OEM and branded automotive spare parts sourced through authorised distributors. Product images are for representation only; actual packaging may vary based on the manufacturer's current batch.</p>
          <p>Compatibility information is provided as a guide. Customers are responsible for verifying part numbers and fitment before installation.</p>
        </Section>

        <Section title="3. Orders & Pricing">
          <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise. We reserve the right to revise prices, correct errors, or cancel orders in the event of incorrect pricing or stock unavailability.</p>
          <p>B2B / dealer pricing is available only to verified accounts with a registered customer code.</p>
        </Section>

        <Section title="4. Payments">
          <p>Payments are processed through secure, PCI-DSS compliant gateways. We accept UPI, major debit/credit cards, net banking, EMI and Cash on Delivery (subject to pincode availability). We do not store full card details on our servers.</p>
        </Section>

        <Section title="5. Shipping & Delivery">
          <p>Orders are dispatched within 24 hours of confirmation on working days. Standard delivery across India takes 2–5 business days depending on pincode. Tracking details are shared via WhatsApp or email after dispatch.</p>
        </Section>

        <Section title="6. Returns & Refunds">
          <p>Wrong-fitment or damaged-in-transit parts may be returned within 7 days of delivery, in original packaging and unused condition. Approved refunds are processed within 7 working days to the original payment method.</p>
          <p>Electrical items, lubricants and consumables are non-returnable once opened, unless found defective.</p>
        </Section>

        <Section title="7. Warranty">
          <p>All parts carry the original manufacturer's warranty, where applicable. Warranty claims are subject to the brand's terms and require the original invoice and packaging.</p>
        </Section>

        <Section title="8. User Accounts">
          <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately of any unauthorised access.</p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>All content on this site — including logos, product photography, copy and design — is the property of The Stoic Automobiles or its licensors and may not be reproduced without written permission.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by law, The Stoic Automobiles shall not be liable for any indirect, incidental or consequential damages arising from the use, installation or failure of any product purchased through this website. Liability, if any, is limited to the invoice value of the product.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nashik, Maharashtra.</p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised Terms.</p>
        </Section>

        <Section title="13. Contact">
          <p>For any questions regarding these Terms, reach us via WhatsApp at +91 73874 80081 or email support@thestoicautomobiles.in.</p>
        </Section>
      </div>
    </section>
  </Layout>
);

export default Terms;
