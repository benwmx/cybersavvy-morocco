import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Wifi, 
  Languages, 
  Trophy, 
  PlayCircle, 
  Fish, 
  KeyRound, 
  Users, 
  MessageSquareWarning, 
  Lock, 
  Bug,
  ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "CyberSafe — Plateforme Nationale de Cybersécurité" },
      {
        name: "description",
        content: "Plateforme d'Évaluation et de Sensibilisation à la Cybersécurité pour le milieu éducatif.",
      },
    ],
  }),
});

function LandingPage() {
  const { t, lang } = useLang();

  const pillars = [
    { 
      id: "phishing", 
      icon: Fish, 
      title: t("pillarPhishing"), 
      titleAr: t("pillarPhishingAr"),
      color: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    { 
      id: "passwords", 
      icon: KeyRound, 
      title: t("pillarPasswords"), 
      titleAr: t("pillarPasswordsAr"),
      color: "bg-amber-50 text-amber-700 border-amber-200"
    },
    { 
      id: "social", 
      icon: Users, 
      title: t("pillarSocial"), 
      titleAr: t("pillarSocialAr"),
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    { 
      id: "bullying", 
      icon: MessageSquareWarning, 
      title: t("pillarBullying"), 
      titleAr: t("pillarBullyingAr"),
      color: "bg-rose-50 text-rose-700 border-rose-200"
    },
    { 
      id: "privacy", 
      icon: Lock, 
      title: t("pillarPrivacy"), 
      titleAr: t("pillarPrivacyAr"),
      color: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    { 
      id: "malware", 
      icon: Bug, 
      title: t("pillarMalware"), 
      titleAr: t("pillarMalwareAr"),
      color: "bg-slate-50 text-slate-700 border-slate-200"
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Navbar />
      <main>
        {/* 1. UNIVERSAL HERO SECTION */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden bg-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(30,58,138,0.05)_0%,rgba(255,255,255,0)_100%)]" />
          
          <div className="container max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50/50 text-[#1E3A8A] text-sm font-semibold tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              <span>{lang === "fr" ? "Architecture Sécurisée v2.0" : "بنية أمنية متطورة"}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1E3A8A] leading-[1.15]">
                <span className="block mb-2">{t("platformTitle")}</span>
                <span className="block text-3xl md:text-5xl opacity-80" dir="rtl">{t("platformTitleAr")}</span>
              </h1>
            </div>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="pt-8">
              <Button 
                size="lg" 
                className="group relative h-16 px-10 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-lg font-bold transition-all hover:scale-[1.02] shadow-xl shadow-blue-900/10 active:scale-95"
                onClick={() => document.getElementById("gateways")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="flex items-center gap-3">
                  {t("startPath")} / {t("startPathAr")}
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                </span>
              </Button>
            </div>
          </div>
        </section>

        {/* 2. DUAL-PATHWAY GATEWAY CARDS */}
        <section id="gateways" className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Card A - Learner */}
              <Link to="/login" className="group block">
                <Card className="h-full border-none shadow-lg shadow-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-white">
                  <div className="h-2 bg-[#1E3A8A]" />
                  <CardHeader className="p-8 pb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl font-bold flex flex-col gap-1">
                      <span>{t("learnerSpace")}</span>
                      <span className="text-xl text-[#1E3A8A]/60 font-medium" dir="rtl">{t("learnerSpaceAr")}</span>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {t("learnerDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span>{lang === "fr" ? "Validation par identifiants institutionnels (Code Massar)" : "التحقق عبر الهوية المؤسساتية (رمز مسار)"}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span>{lang === "fr" ? "Télémétrie d'évaluation transmise en temps réel" : "نقل بيانات التقييم بشكل فوري"}</span>
                      </li>
                    </ul>
                    <div className="flex items-center text-[#1E3A8A] font-bold group-hover:underline gap-2">
                      <span>{t("join")}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2 rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Card B - Trainer */}
              <Link to="/login" className="group block">
                <Card className="h-full border-none shadow-lg shadow-slate-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-white">
                  <div className="h-2 bg-emerald-500" />
                  <CardHeader className="p-8 pb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl font-bold flex flex-col gap-1">
                      <span>{t("trainerSpace")}</span>
                      <span className="text-xl text-emerald-600/60 font-medium" dir="rtl">{t("trainerSpaceAr")}</span>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {t("trainerDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="h-5 w-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span>{lang === "fr" ? "Analyse dynamique des lacunes tactiques" : "تحليل ديناميكي للثغرات التكتيكية"}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="h-5 w-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                        <span>{lang === "fr" ? "Module de création de simulations personnalisées" : "وحدة بناء محاكاة مخصصة"}</span>
                      </li>
                    </ul>
                    <div className="flex items-center text-emerald-600 font-bold group-hover:underline gap-2">
                      <span>{t("signIn")}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2 rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. THE 6 CYBER-SAFETY SIMULATION PILLARS */}
        <section className="py-24 bg-white">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">
                {lang === "fr" ? "Piliers de Simulation Tactique" : "محاور المحاكاة التكتيكية"}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {lang === "fr" 
                  ? "Explorez les 6 domaines critiques de l'hygiène numérique à travers nos simulations interactives." 
                  : "استكشف المجالات الستة الحرجة للصحة الرقمية من خلال عمليات المحاكاة التفاعلية."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((pillar) => (
                <div key={pillar.id} className={`group p-6 rounded-2xl border ${pillar.color} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                      <pillar.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{pillar.title}</h3>
                  <p className="text-lg opacity-80 font-medium" dir="rtl">{pillar.titleAr}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. OFFLINE SYSTEM RESILIENCE BANNER */}
        <section className="pb-24 pt-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1E3A8A] p-8 md:p-16 text-white text-center space-y-8 shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wifi className="h-32 w-32" />
              </div>
              
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                  {t("offlineResilience")}
                </h2>
                <p className="text-xl opacity-80" dir="rtl">
                  {t("offlineResilienceAr")}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="h-14 px-8 rounded-xl font-bold text-[#1E3A8A] shadow-lg active:scale-95 transition-transform">
                  <Link to="/guest" className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    {t("freeAccess")} / {t("freeAccessAr")}
                  </Link>
                </Button>
                <div className="flex items-center gap-6 text-sm font-medium opacity-80">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>{t("offline")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    <span>FR / AR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="w-3.5 h-3.5"
    >
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}
