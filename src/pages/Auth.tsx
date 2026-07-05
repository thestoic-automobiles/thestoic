import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const b2cSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit mobile"),
  password: z.string().min(6).max(72),
});
const b2bSchema = b2cSchema.extend({
  customer_code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9-]+$/i, "Use letters, numbers, hyphens"),
  gst_no: z.string().trim().max(20).optional(),
});

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirect = params.get("redirect") || "/account";
  const initialMode = (params.get("mode") as "b2c" | "b2b") || "b2c";
  const [tab, setTab] = useState<"login" | "signup">((params.get("tab") as any) === "signup" ? "signup" : "login");
  const [accountType, setAccountType] = useState<"b2c" | "b2b">(initialMode);
  const [loading, setLoading] = useState(false);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [su, setSu] = useState({ full_name: "", email: "", mobile: "", password: "", customer_code: "", gst_no: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let email = loginEmail;
    if (accountType === "b2b" && loginCode) {
      // Lookup email by customer code via public RPC (uses anon read on a security-definer fn)
      const { data, error } = await (supabase as any).rpc("get_email_by_customer_code", { _code: loginCode.trim() });
      if (error || !data) { toast.error("Customer code not found"); setLoading(false); return; }
      email = data as string;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back");
    navigate(redirect);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = accountType === "b2b" ? b2bSchema : b2cSchema;
    const parsed = schema.safeParse(su);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: su.email,
      password: su.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: su.full_name,
          mobile: su.mobile,
          account_type: accountType,
          customer_code: accountType === "b2b" ? su.customer_code.toUpperCase() : null,
          gst_no: accountType === "b2b" ? su.gst_no : null,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created — you can now sign in.");
    setTab("login");
  };

  return (
    <Layout>
      <div className="container mx-auto pt-28 pb-16 max-w-md">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-center mb-2">Account</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">Sign in or create an account to place orders and track them.</p>

        <div className="border border-border rounded-md bg-card p-6">
          <div className="flex gap-2 mb-5">
            <button onClick={() => setAccountType("b2c")} className={`flex-1 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm ${accountType === "b2c" ? "bg-charcoal text-primary-foreground" : "bg-secondary text-charcoal"}`}>Retail (B2C)</button>
            <button onClick={() => setAccountType("b2b")} className={`flex-1 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm ${accountType === "b2b" ? "bg-charcoal text-primary-foreground" : "bg-secondary text-charcoal"}`}>Dealer (B2B)</button>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {accountType === "b2b" ? (
                  <Field label="Customer Code"><Input value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="e.g. TSA-001" required /></Field>
                ) : (
                  <Field label="Email"><Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></Field>
                )}
                <Field label="Password"><Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required minLength={6} /></Field>
                <Button type="submit" size="lg" className="w-full bg-signal hover:bg-signal-deep text-white" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Field label="Full name"><Input value={su.full_name} onChange={(e) => setSu({ ...su, full_name: e.target.value })} maxLength={100} required /></Field>
                <Field label="Email"><Input type="email" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} required /></Field>
                <Field label="Mobile (10 digits)"><Input value={su.mobile} onChange={(e) => setSu({ ...su, mobile: e.target.value })} maxLength={10} required /></Field>
                {accountType === "b2b" && <>
                  <Field label="Customer Code (your choice)"><Input value={su.customer_code} onChange={(e) => setSu({ ...su, customer_code: e.target.value })} required placeholder="e.g. TSA-001" /></Field>
                  <Field label="GST No. (optional)"><Input value={su.gst_no} onChange={(e) => setSu({ ...su, gst_no: e.target.value })} maxLength={20} /></Field>
                </>}
                <Field label="Password"><Input type="password" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} minLength={6} required /></Field>
                <Button type="submit" size="lg" className="w-full bg-signal hover:bg-signal-deep text-white" disabled={loading}>{loading ? "Creating…" : "Create Account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Need help? <Link to="/contact" className="text-signal hover:underline">Contact us</Link>
        </p>
      </div>
    </Layout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>{children}</div>
);

export default Auth;
