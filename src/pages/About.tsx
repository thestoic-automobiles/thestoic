import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import partsGrid from "@/assets/parts-grid.jpg";
import { Award, Users, MapPin, Wrench } from "lucide-react";

const About = () => (
  <Layout>
    <SEO
      title="About The Stoic Automobiles"
      description="15+ years supplying genuine OEM auto spares to workshops, fleets and vehicle owners across India. Authorised dealer network, warranty-backed parts."
      path="/about"
    />

    <section className="pt-28 pb-12 bg-charcoal-deep text-primary-foreground">
      <div className="container mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">About Us</h1>
        <p className="text-primary-foreground/70 mt-2 max-w-2xl">A trusted name for genuine auto spares, serving customers across India.</p>
      </div>
    </section>

    <section className="py-20">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-signal font-semibold tracking-widest uppercase text-xs mb-3">Our Story</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-charcoal mb-4">
            Built for the road.<br />Trusted by mechanics.
          </h2>
          <div className="h-1 w-14 bg-signal mb-6" />
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Stoic Automobiles started as a single counter with one mission with one promise: deliver the right part, every time. We stock genuine and OE-grade spares for India's most-driven vehicles.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today we serve retail customers walking in from across India, and B2B dealers and workshops who depend on us for fast restocks at fair wholesale prices.
          </p>
        </div>
        <img src={partsGrid} alt="Auto parts" className="rounded-md w-full" loading="lazy" width={1600} height={1200} />
      </div>
    </section>

    <section className="py-20 bg-secondary">
      <div className="container mx-auto">
        <SectionHeading eyebrow="What we stand for" title="Our Values" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { Icon: Award, t: "Genuine Only", d: "We never sell duplicate parts. Period." },
            { Icon: Wrench, t: "Mechanic-Friendly", d: "Bulk pricing & fast counter service." },
            { Icon: Users, t: "B2B & Retail", d: "Same trust for shops and walk-ins." },
            { Icon: MapPin, t: "Local & Reliable", d: "Proudly Indian." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="bg-card border border-border rounded-md p-6 text-center hover-lift">
              <div className="h-12 w-12 mx-auto bg-charcoal text-signal flex items-center justify-center rounded-sm mb-3"><Icon size={22} /></div>
              <h3 className="font-display text-lg font-semibold uppercase mb-1">{t}</h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
