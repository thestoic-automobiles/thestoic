import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin, isAdminLoggedIn } from "@/lib/adminStore";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAdminLoggedIn()) {
    navigate("/admin", { replace: true });
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(email, password)) {
      toast.success("Welcome, Admin");
      navigate("/admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-md py-16">
        <h1 className="font-display text-3xl font-bold uppercase mb-6">Admin Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </Layout>
  );
};

export default AdminLogin;
