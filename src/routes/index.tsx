import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n/LanguageContext";
import { GraduationCap, ShieldCheck, ArrowRight, Wifi, Languages, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "CyberSafe — Apprends à te protéger en ligne" },
      {
        name: "description",
        content: "Plateforme bilingue FR/AR de cybersécurité pour collégiens.",
      },
    ],
  }),
});

function LandingPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-50"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="container mx-auto px-4 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {t("tagline")}
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                {t("heroTitle")}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">{t("heroSubtitle")}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    {t("getStarted")}
                    <ArrowRight className="ltr:ml-2 rtl:mr-2 rtl:rotate-180 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/game">{t("studentPortal")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Portals */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Link to="/login" className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("studentPortal")}</CardTitle>
                  <CardDescription>{t("studentPortalDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                    {t("join")}
                    <ArrowRight className="ltr:ml-1 rtl:mr-1 rtl:rotate-180 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/login" className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-xl border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-2">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("teacherPortal")}</CardTitle>
                  <CardDescription>{t("teacherPortalDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                    {t("signIn")}
                    <ArrowRight className="ltr:ml-1 rtl:mr-1 rtl:rotate-180 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: Languages, fr: "Bilingue FR / AR", ar: "ثنائية اللغة" },
              { icon: Wifi, fr: "Mode hors-ligne", ar: "وضع دون اتصال" },
              { icon: Trophy, fr: "Apprentissage gamifié", ar: "تعلم تفاعلي" },
            ].map(({ icon: Icon, fr, ar }) => (
              <div key={fr} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{fr}</p>
                  <p className="text-sm text-muted-foreground" dir="rtl">{ar}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
