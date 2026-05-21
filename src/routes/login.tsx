import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n/LanguageContext";
import { api } from "@/lib/supabase/api";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { z } from "zod";

const loginSearchSchema = z.object({
  role: z.enum(["student", "teacher"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Accès — CyberSafe" }] }),
});

function LoginPage() {
  const { t, lang } = useLang();
  const { role } = Route.useSearch();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
              {lang === "fr" ? "Accès à la Plateforme" : "الدخول إلى المنصة"}
            </h1>
            <p className="text-muted-foreground font-medium">
              {lang === "fr" ? "Veuillez vous identifier pour continuer" : "يرجى تسجيل الدخول للمتابعة"}
            </p>
          </div>

          <Tabs defaultValue={role || "student"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white border border-slate-200 rounded-xl h-12 shadow-sm">
              <TabsTrigger 
                value="student" 
                className="rounded-lg data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all"
              >
                <GraduationCap className="ms-0 me-2 h-4 w-4" />
                {t("student")}
              </TabsTrigger>
              <TabsTrigger 
                value="teacher"
                className="rounded-lg data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all"
              >
                <ShieldCheck className="ms-0 me-2 h-4 w-4" />
                {t("teacher")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <StudentForm />
            </TabsContent>
            <TabsContent value="teacher">
              <TeacherForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StudentForm() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [massar, setMassar] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !massar.trim()) {
      toast.error(t("enterCode"));
      return;
    }
    setLoading(true);
    try {
      const cls = await api.verifyClassCode(code.trim());
      if (!cls) {
        toast.error(t("invalidCode"));
        return;
      }
      
      const student = await api.verifyStudent(cls.id, massar.trim());
      if (!student) {
        toast.error(t("invalidCode"));
        return;
      }

      sessionStorage.setItem(
        "cs.student",
        JSON.stringify({ 
          class_id: cls.id, 
          class_name: cls.name, 
          massar_code: student.massar_code,
          name_fr: student.name_fr,
          name_ar: student.name_ar
        })
      );
      navigate({ to: "/game" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-none shadow-xl shadow-slate-200 bg-white rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-[#1E3A8A]" />
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-xl font-bold text-[#1E3A8A]">{t("learnerSpace")}</CardTitle>
        <CardDescription>{t("studentPortalDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("classCode")}</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DEMO01"
              className="font-mono uppercase tracking-widest text-center text-lg h-12 border-slate-200 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] rounded-xl bg-slate-50/50"
              maxLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="massar" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("massarCode")}</Label>
            <Input
              id="massar"
              value={massar}
              onChange={(e) => setMassar(e.target.value.toUpperCase())}
              placeholder="G123456789"
              className="font-mono uppercase tracking-widest text-center text-lg h-12 border-slate-200 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] rounded-xl bg-slate-50/50"
              maxLength={12}
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-bold shadow-lg shadow-blue-900/10 active:scale-95 transition-all" disabled={loading}>
            {t("join")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeacherForm() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "in") {
        await api.signIn(email, password);
        toast.success(t("welcomeBack"));
      } else {
        await api.signUp(email, password);
        toast.success(t("accountCreated"));
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-none shadow-xl shadow-slate-200 bg-white rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-emerald-500" />
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-xl font-bold text-emerald-600">{t("trainerSpace")}</CardTitle>
        <CardDescription>{mode === "in" ? t("signIn") : t("signUp")}</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-900/10 active:scale-95 transition-all" disabled={loading}>
            {mode === "in" ? t("signIn") : t("signUp")}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="text-sm text-muted-foreground hover:text-[#1E3A8A] font-medium w-full text-center py-2"
          >
            {mode === "in" ? t("needAccount") : t("haveAccount")}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
