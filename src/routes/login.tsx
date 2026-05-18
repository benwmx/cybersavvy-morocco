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

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Accès — CyberSafe" }] }),
});

function LoginPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">
                <GraduationCap className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {t("student")}
              </TabsTrigger>
              <TabsTrigger value="teacher">
                <ShieldCheck className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
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
  const { t } = useLang();
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
        toast.error(t("invalidCode")); // Or a more specific message if available
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
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t("studentPortal")}</CardTitle>
        <CardDescription>{t("studentPortalDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("classCode")}</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DEMO01"
              className="font-mono uppercase tracking-widest text-center text-lg"
              maxLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="massar">{t("massarCode")}</Label>
            <Input
              id="massar"
              value={massar}
              onChange={(e) => setMassar(e.target.value.toUpperCase())}
              placeholder="G123456789"
              className="font-mono uppercase tracking-widest text-center text-lg"
              maxLength={12}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {t("join")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeacherForm() {
  const { t } = useLang();
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
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t("teacherPortal")}</CardTitle>
        <CardDescription>{mode === "in" ? t("signIn") : t("signUp")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "in" ? t("signIn") : t("signUp")}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
          >
            {mode === "in" ? t("needAccount") : t("haveAccount")}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
