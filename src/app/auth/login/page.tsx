"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Building2, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui";

const loginSchema = z.object({
  email:    z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      setError("password", { message: "Email ou mot de passe incorrect" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16 bg-slate-100/80 backdrop-blur-2xl bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_28%)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-blue-300/55 blur-xl animate-pulse" />
        <div className="absolute right-10 top-24 h-44 w-44 rounded-full bg-blue-300/55 blur-xl animate-pulse" />
        <div className="absolute right-10 top-24 h-80 w-80 rounded-full bg-blue-300/55 blur-xl animate-pulse" />
        <div className="absolute right-10 top-24 h-20 w-20 rounded-full bg-blue-300/55 blur-xl animate-pulse" />
        <div className="absolute right-10 top-24 h-30 w-30 rounded-full bg-blue-300/55 blur-xl animate-pulse" />
        <div className="absolute left-1/2 bottom-8 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/45 blur-xl animate-pulse" />
      </div>
      <div className="w-full max-w-[1200px] flex rounded-[2rem] bg-white/70 border border-white/40 shadow-[0_35px_120px_-30px_rgba(15,23,42,0.35)] backdrop-blur-3xl overflow-hidden">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between py-16 px-12 bg-gradient-navy overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh-blue opacity-40" />

        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-500/10 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-400/10 translate-y-1/3 -translate-x-1/4" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">RH Manager</p>
            <p className="text-xs text-white/50">Système de gestion RH</p>
          </div>
        </div>

        {/* Main text */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Gérez vos ressources<br />
              <span className="text-primary-300">humaines</span> efficacement
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Centralisez la gestion des employés, congés, contrats et bien plus dans une seule plateforme.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Workflow de validation à 3 niveaux",
              "Gestion complète des contrats",
              "Tableaux de bord en temps réel",
              "Notifications automatiques",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                </div>
                <span className="text-sm text-white/70">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="relative flex items-center gap-2 text-white/40 text-xs">
          <Shield size={13} />
          <span>Connexion sécurisée — Données chiffrées</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-transparent">
        <div className="w-full max-w-sm rounded-[2rem] bg-white/95 border border-slate-200/60 shadow-[0_45px_90px_-30px_rgba(15,23,42,0.32),0_20px_60px_-20px_rgba(15,23,42,0.18)] backdrop-blur-2xl p-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">RH Manager</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Connexion</h2>
            <p className="text-sm text-muted">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              placeholder="votre@email.com"
              icon={<Mail size={15} />}
              error={errors.email?.message}
              required
              {...register("email")}
            />

            <Input
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock size={15} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={errors.password?.message}
              required
              {...register("password")}
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={isLoading}
            >
              Se connecter
            </Button>
          </form>

         
        </div>
      </div>
    </div>
  </div>
  );
}
