import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Warranty = () => (
  <PolicyShell eyebrow="Quality assurance" title="Warranty Policy" subtitle="Every genuine spare we sell carries the original manufacturer's warranty.">
    <PolicySection title="Manufacturer-Backed Warranty">
      <p>All branded and OEM parts sold by The Stoic Automobiles are covered under the warranty terms specified by the respective manufacturer (Maruti Suzuki, Hyundai, Tata, Mahindra, Bajaj, Honda, Spark Minda and others).</p>
    </PolicySection>
    <PolicySection title="Coverage">
      <p>Warranty covers manufacturing defects only. It does not cover:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Normal wear and tear.</li>
        <li>Damage from accidents, misuse or improper installation.</li>
        <li>Parts modified, tampered with or fitted by unauthorised workshops.</li>
        <li>Consumables such as oils, filters, brake pads beyond their service life.</li>
      </ul>
    </PolicySection>
    <PolicySection title="How to Claim">
      <p>Share the original GST invoice, vehicle details and clear photos of the issue on WhatsApp at +91 73874 80081. Approved claims are processed directly with the manufacturer; turnaround depends on the brand's claim cycle.</p>
    </PolicySection>
    <PolicySection title="Limitation">
      <p>Warranty is limited to repair or replacement of the defective part. The Stoic Automobiles is not liable for any consequential loss, vehicle downtime, or labour charges incurred during installation or removal.</p>
    </PolicySection>
  </PolicyShell>
);

export default Warranty;
