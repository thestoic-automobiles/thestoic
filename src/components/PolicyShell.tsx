import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";


export const PolicyShell = ({
  eyebrow,
  title,
  subtitle,
  updated = "June 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}) => {
  const { pathname } = useLocation();
  return (
  <Layout>
    <SEO title={title} description={subtitle || `${title} — The Stoic Automobiles.`} path={pathname} />

    <section className="pt-28 pb-14 bg-secondary/40 border-b border-border">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Last updated: {updated}</p>
      </div>
    </section>
    <section className="py-14">
      <div className="container mx-auto max-w-4xl space-y-8 text-sm md:text-base text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  </Layout>
  );
};


export const PolicySection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-charcoal mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);
