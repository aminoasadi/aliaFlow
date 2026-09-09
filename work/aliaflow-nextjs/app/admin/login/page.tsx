"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ArrowRight, LockKeyhole } from "lucide-react";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Login failed");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <section className="login-art"><div><span className="inline-grid size-10 place-items-center rounded-lg bg-white text-sm font-black text-black">AF</span></div><div className="relative z-10 max-w-xl"><p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Aliaflow content studio</p><h1 className="m-0 text-5xl font-semibold leading-[1.05] tracking-[-.055em]">Shape the story.<br/>Publish with confidence.</h1><p className="mt-5 max-w-md text-base leading-7 text-white/60">A focused workspace for content, media and every part of the Aliaflow digital experience.</p></div><small className="relative z-10 text-white/40">Protected editorial workspace</small></section>
      <section className="login-panel"><form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-5"><div className="mb-3"><span className="mb-5 grid size-10 place-items-center rounded-lg border border-border bg-white"><LockKeyhole className="size-4"/></span><p className="admin-kicker">Welcome back</p><h2 className="admin-title">Sign in to continue</h2><p className="admin-description">Use your administrator credentials.</p></div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@aliaflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p role="alert" className="m-0 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Signing in…" : <>Sign in <ArrowRight /></>}
        </Button>
      </form></section>
    </div>
  );
}
