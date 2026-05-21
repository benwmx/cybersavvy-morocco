import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { 
  ShieldCheck, 
  ArrowRight, 
  Wifi, 
  ChevronDown,
  Fish, 
  KeyRound, 
  Users, 
  MessageSquareWarning, 
  Lock, 
  Bug,
  ArrowUpRight
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
  const { t, lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  const pillars = [
    { id: "phishing", icon: Fish, label: isAr ? t("pillarPhishingAr") : t("pillarPhishing") },
    { id: "passwords", icon: KeyRound, label: isAr ? t("pillarPasswordsAr") : t("pillarPasswords") },
    { id: "social", icon: Users, label: isAr ? t("pillarSocialAr") : t("pillarSocial") },
    { id: "bullying", icon: MessageSquareWarning, label: isAr ? t("pillarBullyingAr") : t("pillarBullying") },
    { id: "privacy", icon: Lock, label: isAr ? t("pillarPrivacyAr") : t("pillarPrivacy") },
    { id: "threats", icon: Bug, label: isAr ? t("pillarMalwareAr") : t("pillarMalware") },
  ];

  const scrollToContent = () => {
    document.getElementById("portals")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#1E3A8A]/10 font-sans text-slate-900 overflow-x-hidden" dir={dir}>
      {/* 1. THE SYSTEM NAVIGATION HEADER */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            <span className="text-xl font-extrabold tracking-tighter text-[#1E3A8A]">CyberSafe</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-lg">
              <button
                onClick={() => setLang("fr")}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                  lang === "fr" 
                    ? "bg-white text-[#1E3A8A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLang("ar")}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                  lang === "ar" 
                    ? "bg-white text-[#1E3A8A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* 2. EDITORIAL HERO SECTION */}
        <section className="relative px-6 pt-24 pb-32 md:pt-40 md:pb-48 bg-white overflow-hidden">
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="inline-block px-3 py-1 rounded-sm bg-slate-50 border border-slate-100 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                {isAr ? "نظام التعليم الوطني" : "Système Éducatif National"}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1E3A8A] leading-[1.05] max-w-4xl">
                {isAr ? t("platformTitleAr") : t("platformTitle")}
              </h1>
              
              <p className="max-w-2xl text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  onClick={scrollToContent}
                  size="lg"
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-10 h-14 rounded-sm font-bold text-base transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    {isAr ? t("startPathAr") : t("startPath")}
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Asymmetrical background element */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F8FAFC] -z-10 hidden md:block" />
        </section>

        {/* 3. THE SEGREGATED PORTAL GATEWAYS */}
        <section id="portals" className="px-6 py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-sm overflow-hidden shadow-sm">
              {/* Portal 1: Learner */}
              <div className="bg-white p-12 md:p-16 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-px bg-[#1E3A8A] mb-8" />
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                    {isAr ? t("learnerSpaceAr") : t("learnerSpace")}
                  </h2>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    {isAr ? t("learnerDescAr") : t("learnerDesc")}
                  </p>
                  
                  <ul className="space-y-4 mb-12">
                    {[
                      { fr: "Validation via Code Massar", ar: "التحقق عبر رمز مسار" },
                      { fr: "Parcours certifiant", ar: "مسار معتمد" },
                      { fr: "Suivi institutionnel", ar: "متابعة مؤسساتية" }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />
                        {isAr ? item.ar : item.fr}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  to="/login" 
                  search={{ role: "student" }}
                  className="inline-flex items-center justify-between group px-8 h-16 border border-slate-200 hover:border-[#1E3A8A] transition-colors rounded-sm"
                >
                  <span className="font-bold uppercase tracking-widest text-xs text-slate-900">
                    {isAr ? "دخول المتعلم" : "Accès Apprenant"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              </div>

              {/* Portal 2: Trainer */}
              <div className="bg-white p-12 md:p-16 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-px bg-slate-300 mb-8" />
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                    {isAr ? t("trainerSpaceAr") : t("trainerSpace")}
                  </h2>
                  <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    {isAr ? t("trainerDescAr") : t("trainerDesc")}
                  </p>
                  
                  <ul className="space-y-4 mb-12">
                    {[
                      { fr: "Gestion de classe dynamique", ar: "إدارة ديناميكية للأقسام" },
                      { fr: "Analyse des lacunes tactiques", ar: "تحليل الثغرات التكتيكية" },
                      { fr: "Outils de simulation", ar: "أدوات المحاكاة" }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {isAr ? item.ar : item.fr}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  to="/login" 
                  search={{ role: "teacher" }}
                  className="inline-flex items-center justify-between group px-8 h-16 border border-slate-200 hover:border-slate-900 transition-colors rounded-sm"
                >
                  <span className="font-bold uppercase tracking-widest text-xs text-slate-900">
                    {isAr ? "فضاء المكون" : "Espace Formateur"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 6 TACTICAL CYBER-SAFETY PILLARS */}
        <section className="px-6 py-32 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A] mb-4">
                {isAr ? "محاور التوعية الرقمية" : "Piliers de Sensibilisation"}
              </h2>
              <div className="w-20 h-1 bg-[#1E3A8A]/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pillars.map((pillar) => (
                <div 
                  key={pillar.id}
                  className="group bg-[#F8FAFC] border border-slate-100 p-10 hover:bg-white hover:shadow-xl hover:shadow-[#1E3A8A]/5 transition-all duration-300 rounded-sm"
                >
                  <pillar.icon className="w-8 h-8 text-slate-800 mb-8 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {pillar.label}
                  </h3>
                  <div className="w-8 h-px bg-slate-200 group-hover:w-16 group-hover:bg-[#1E3A8A] transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. OFFLINE SYSTEM RESILIENCE BANNER & VISITOR ESCAPE */}
        <section className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-32 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="flex items-center justify-center w-8 h-8 bg-slate-50 border border-slate-100 rounded-sm">
                <Wifi className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">
                {isAr ? t("offlineResilienceAr") : t("offlineResilience")}
              </p>
            </div>

            <Link 
              to="/guest"
              className="group flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A] hover:opacity-80 transition-opacity"
            >
              <span>{isAr ? t("freeAccessAr") : t("freeAccess")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#F8FAFC] border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2024 CyberSafe National Digital Initiative
          </div>
          <div className="flex gap-8">
            {["Terms", "Privacy", "Accessibility"].map(item => (
              <button key={item} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
