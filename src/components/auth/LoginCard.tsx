"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Zap, Shield, BarChart3 } from "lucide-react";

// ── animation variants ──────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, -6, 6, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

// ── floating orb component ──────────────────────────────────────────
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        y: [0, -40, 0, 30, 0],
        x: [0, 20, -20, 10, 0],
        scale: [1, 1.15, 0.95, 1.1, 1],
      }}
      transition={{ duration: 15 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── google icon ─────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── feature pill ────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400">
      <Icon className="h-3 w-3 text-blue-400" />
      {label}
    </div>
  );
}

// ── main login card ─────────────────────────────────────────────────
export default function LoginCard() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading, error } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [focused, setFocused] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUpWithEmail(form.email, form.password, form.displayName);
    } else {
      await signInWithEmail(form.email, form.password);
    }
  };

  const handleDemo = () => {
    setForm({ displayName: "Demo Citizen", email: "demo@civicmind.ai", password: "demo123456" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* ── animated background orbs ─────────────────────────── */}
      <FloatingOrb className="left-[-10%] top-[-5%] h-[500px] w-[500px] bg-blue-600/[0.07]" delay={0} />
      <FloatingOrb className="right-[-8%] top-[30%] h-[400px] w-[400px] bg-violet-600/[0.07]" delay={3} />
      <FloatingOrb className="bottom-[-10%] left-[20%] h-[350px] w-[350px] bg-cyan-600/[0.05]" delay={6} />
      <FloatingOrb className="right-[15%] top-[5%] h-[250px] w-[250px] bg-fuchsia-600/[0.05]" delay={9} />

      {/* ── subtle grid pattern ──────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }}
      />

      {/* ── card ─────────────────────────────────────────────── */}
      <motion.div
        className="group relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Glow ring behind card */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="px-8 pb-8 pt-10">
            {/* ── brand ────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-7 w-7 text-white" />
              </motion.div>

              <h1 className="bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                CivicMind AI
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                AI-Powered Community Resolution
              </p>
            </motion.div>

            {/* ── feature pills ────────────────────────────── */}
            <motion.div variants={itemVariants} className="mb-7 flex flex-wrap justify-center gap-2">
              <FeaturePill icon={Zap} label="AI Analysis" />
              <FeaturePill icon={Shield} label="Verified Reports" />
              <FeaturePill icon={BarChart3} label="City Analytics" />
            </motion.div>

            {/* ── google sign in ───────────────────────────── */}
            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
            </motion.div>

            {/* ── divider ──────────────────────────────────── */}
            <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </motion.div>

            {/* ── form ─────────────────────────────────────── */}
            <motion.div variants={shakeVariants} animate={error ? "shake" : undefined}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Display name (sign up only) */}
                <AnimatePresence mode="popLayout">
                  {isSignUp && (
                    <motion.div
                      key="name-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <InputField
                        icon={User}
                        type="text"
                        placeholder="Full Name"
                        value={form.displayName}
                        onChange={(v) => update("displayName", v)}
                        focused={focused === "name"}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    focused={focused === "email"}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <InputField
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(v) => update("password", v)}
                    focused={focused === "password"}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    suffix={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-zinc-500 transition-colors hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </motion.div>

                {/* ── error display ────────────────────────── */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* ── submit ───────────────────────────────── */}
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>

            {/* ── toggle + demo ─────────────────────────────── */}
            <motion.div variants={itemVariants} className="mt-6 space-y-3 text-center">
              <p className="text-sm text-zinc-500">
                {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); }}
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>

              <button
                type="button"
                onClick={handleDemo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/[0.08] px-3 py-1.5 text-xs text-zinc-500 transition-all hover:border-blue-500/30 hover:text-zinc-300"
              >
                <Zap className="h-3 w-3 text-amber-400" />
                Quick Demo Mode
              </button>
            </motion.div>
          </div>

          {/* ── footer ─────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/[0.04] bg-white/[0.02] px-8 py-4 text-center"
          >
            <p className="text-xs text-zinc-500">
              Join{" "}
              <span className="font-medium text-zinc-300">10,000+</span>{" "}
              citizens making their communities better
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ── input field sub-component ───────────────────────────────────────
function InputField({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  suffix,
}: {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  suffix?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
        focused
          ? "border-blue-500/40 bg-blue-500/[0.04] shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]"
          : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.1]"
      }`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${focused ? "text-blue-400" : "text-zinc-500"}`} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
      />
      {suffix}
    </div>
  );
}
