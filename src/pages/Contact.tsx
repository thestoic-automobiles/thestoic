import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit phone"),
  message: z.string().trim().min(5).max(1000),
});

const Contact = () => {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(f);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const text = `Name: ${f.name}%0AEmail: ${f.email}%0APhone: ${f.phone}%0A%0A${encodeURIComponent(f.message)}`;
    window.open(`https://wa.me/917387480081?text=${text}`, "_blank", "noopener");
    toast.success("Opening WhatsApp…");
  };

  return (
    <Layout>
      <SEO title="Contact The Stoic Automobiles" description="Call, WhatsApp or visit our counter for genuine auto spare parts. India-wide dispatch, B2B dealer support, expert help 9:30–20:00." path="/contact" />
      <section className="pt-28 pb-12 bg-charcoal-deep text-primary-foreground">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">Contact Us</h1>
          <p className="text-primary-foreground/70 mt-2">We're at the counter all week — call, WhatsApp, or drop by.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Card Icon={MapPin} title="Address">Prime Center, Shop No 1 & 2, Opposite GMD College – 422103</Card>
            <Card Icon={Phone} title="Phone"><a href="tel:+917387480081" className="hover:text-signal">+91 73874 80081</a></Card>
            <Card Icon={MessageCircle} title="WhatsApp"><a href="https://wa.me/917387480081" target="_blank" rel="noopener noreferrer" className="hover:text-signal">+91 73874 80081</a></Card>
            <Card Icon={Mail} title="Email"><a href="mailto:supportthestoic@gmail.com" className="hover:text-signal">supportthestoic@gmail.com</a></Card>
            <Card Icon={Clock} title="Hours">All Days, 8:00 AM – 8:00 PM</Card>
          </div>

          <form onSubmit={submit} className="border border-border rounded-md p-6 bg-card space-y-4">
            <h2 className="font-display text-xl font-bold uppercase">Send an Enquiry</h2>
            <Field label="Your name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={100} required /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={10} required /></Field>
            <Field label="Part you're looking for / message"><Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1000} required /></Field>
            <Button type="submit" size="lg" className="w-full bg-signal hover:bg-signal-deep text-white">Send via WhatsApp</Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>{children}</div>
);
const Card = ({ Icon, title, children }: { Icon: any; title: string; children: React.ReactNode }) => (
  <div className="border border-border rounded-md p-5 bg-card flex gap-4">
    <div className="h-10 w-10 bg-signal/10 text-signal rounded-sm flex items-center justify-center shrink-0"><Icon size={18} /></div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  </div>
);

export default Contact;
