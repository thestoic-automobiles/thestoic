type Props = { eyebrow?: string; title: string; subtitle?: string; center?: boolean };

const SectionHeading = ({ eyebrow, title, subtitle, center = true }: Props) => (
  <div className={`mb-10 ${center ? "text-center" : ""}`}>
    {eyebrow && <p className="text-signal font-semibold tracking-widest uppercase text-xs mb-3">{eyebrow}</p>}
    <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-charcoal mb-3">{title}</h2>
    {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    <div className={`h-1 w-14 bg-signal rounded-full mt-4 ${center ? "mx-auto" : ""}`} />
  </div>
);

export default SectionHeading;
