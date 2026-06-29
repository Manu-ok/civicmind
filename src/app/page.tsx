"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, PlayCircle, MapPin, Brain, ShieldCheck, 
  Camera, Bot, Activity, Mic, Users, CheckCircle2 
} from "lucide-react";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GlowCard } from "@/components/shared/GlowCard";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-white selection:bg-blue-500/30 overflow-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
          <ParticlesBackground />
        </div>

        <motion.div 
          className="container max-w-6xl mx-auto relative z-10 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-600 dark:text-zinc-300 mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            🚀 Built for Google Cloud Hackathon 2024
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white via-blue-100 to-indigo-400 bg-clip-text text-transparent leading-[1.1]"
          >
            Transform Your Community <br className="hidden md:block" />
            With AI-Powered Civic Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-zinc-400 mb-10 leading-relaxed"
          >
            Report issues, verify problems, predict crises — all powered by Google Gemini. CivicMind turns every citizen into a community hero.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <button className="group relative h-14 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-blue-500/40">
                Start Reporting Issues
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="h-14 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10">
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-widest"
          >
            Powered by Google Gemini • Google Maps • Firebase
          </motion.p>
        </motion.div>
      </section>

      {/* SECTION 2: LIVE STATS */}
      <section className="relative z-20 -mt-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="p-4 bg-slate-100 dark:bg-zinc-800/50 border-b border-white/5 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Trusted by communities across India</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5 p-8">
            <div className="text-center p-4">
              <h3 className="text-4xl font-black text-white mb-2"><AnimatedCounter value={2847} />+</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Issues Reported</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-4xl font-black text-white mb-2"><AnimatedCounter value={1923} />+</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Issues Resolved</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-4xl font-black text-white mb-2"><AnimatedCounter value={342} />+</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Active Citizens</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-4xl font-black text-white mb-2"><AnimatedCounter value={4.2} /></h3>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Days Avg Resolution</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How CivicMind Works</h2>
            <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">From reporting a pothole to resolving community crises, the AI handles the heavy lifting.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 -z-10" />

            {[
              {
                icon: Camera,
                title: "1. Report",
                desc: "Capture and describe issues. AI automatically detects location, objects, and text.",
                color: "from-blue-500 to-cyan-500",
                bg: "bg-blue-500/10 border-blue-500/20"
              },
              {
                icon: Brain,
                title: "2. Analyze",
                desc: "Google Gemini instantly categorizes, rates severity, and assigns the correct department.",
                color: "from-violet-500 to-fuchsia-500",
                bg: "bg-violet-500/10 border-violet-500/20"
              },
              {
                icon: CheckCircle2,
                title: "3. Resolve",
                desc: "Community verifies the issue, AI generates a resolution plan, and impact is tracked.",
                color: "from-emerald-500 to-teal-500",
                bg: "bg-emerald-500/10 border-emerald-500/20"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-white dark:bg-zinc-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-sm text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl border flex items-center justify-center ${step.bg}`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURE SHOWCASE */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Powerful Capabilities</h2>
            <p className="text-xl text-slate-500 dark:text-zinc-400">Everything you need to orchestrate a smarter city.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Issue Detection", desc: "Instantly process images to classify hazards and estimate severity." },
              { icon: MapPin, title: "Live Community Map", desc: "View hot-spots, verified reports, and real-time community activity." },
              { icon: Bot, title: "Civic AI Agent", desc: "Chat with city data. Ask questions, analyze trends, and get reports." },
              { icon: Activity, title: "Predictive Intelligence", desc: "Forecast seasonal hazards like waterlogging before they happen." },
              { icon: Mic, title: "Voice Reporting", desc: "Hands-free localized voice reporting using advanced Speech-to-Text." },
              { icon: Users, title: "Community Verification", desc: "Crowdsourced credibility stops duplicate reports and abuse." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowCard className="h-full rounded-3xl p-8 border border-white/5 bg-white dark:bg-zinc-900/50">
                  <div className="relative z-10 flex flex-col h-full group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:bg-blue-500/30">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TECH STACK */}
      <section className="py-20 border-y border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-10">Built on Google&apos;s Best Technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* We use Lucide icons as fallbacks/approximations for the brands */}
            <div className="flex items-center gap-3"><Brain className="w-8 h-8 text-blue-400" /><span className="text-xl font-bold">Gemini 1.5 Pro</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-8 h-8 text-green-500" /><span className="text-xl font-bold">Google Maps</span></div>
            <div className="flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-amber-500" /><span className="text-xl font-bold">Firebase</span></div>
            <div className="flex items-center gap-3"><Activity className="w-8 h-8 text-blue-600" /><span className="text-xl font-bold">Google Cloud</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-blue-500/30 blur-[120px] rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to become a Civic Hero?</h2>
          <p className="text-xl text-slate-500 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">Join your community. Make an impact. Track real change.</p>
          
          <Link href="/login">
            <button className="group h-16 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 text-xl font-bold text-black transition-all hover:scale-105 hover:bg-zinc-200 shadow-2xl shadow-white/20">
              Get Started — It&apos;s Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <p className="mt-6 text-sm text-slate-500 dark:text-zinc-500 font-medium">No credit card required • Instant access</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/10 bg-slate-50 dark:bg-zinc-950 text-center text-slate-500 dark:text-zinc-500 text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600" />
            <span className="font-bold text-white">CivicMind AI</span>
          </div>
          <p>Built for Google Cloud Hackathon 2024</p>
          <p>Made with ❤️ by The Team</p>
        </div>
      </footer>
    </main>
  );
}
