import { useLang } from "@/lib/i18n/LanguageContext";
import { 
  Mail, 
  Globe, 
  Smartphone, 
  MessageCircle, 
  AlertTriangle, 
  ShieldAlert,
  Search,
  Lock,
  User,
  MoreVertical,
  ThumbsUp,
  MapPin,
  Camera,
  Mic,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface VisualsProps {
  trackId: string;
  questionId: string;
}

export function ScenarioVisuals({ trackId, questionId }: VisualsProps) {
  const { lang } = useLang();

  // PHISHING: Email/Browser UI
  if (trackId === "phishing") {
    if (questionId === "phishing-q2") {
      return (
        <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/20" />
              <div className="w-3 h-3 rounded-full bg-amber-400/20" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-background rounded-md px-3 py-1 text-xs border flex items-center gap-2 text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span className="truncate">http://banque-secure-login.xyz/login</span>
            </div>
          </div>
          <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
             <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white mb-4">
               <ShieldAlert className="h-8 w-8" />
             </div>
             <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">BANQUE NATIONALE</h3>
             <div className="w-full max-w-xs space-y-3">
               <div className="h-10 bg-muted rounded animate-pulse" />
               <div className="h-10 bg-muted rounded animate-pulse" />
               <div className="h-10 bg-blue-600 rounded" />
             </div>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Email Inbox</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold">Admin-Security &lt;security@alert-system.net&gt;</span>
              <span className="text-[10px] text-muted-foreground">14:22</span>
            </div>
            <p className="text-sm font-semibold mb-1">
              {lang === "fr" ? "URGENT : Sécurité du compte" : "عاجل: أمان الحساب"}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {lang === "fr" 
                ? "Votre compte sera bloqué si vous ne validez pas vos informations immédiatement..." 
                : "سيتم حظر حسابك إذا لم تقم بتأكيد معلوماتك فوراً..."}
            </p>
            <div className="mt-3 py-1.5 px-3 bg-blue-600 text-white text-[10px] rounded inline-block">
               {lang === "fr" ? "Cliquez ici" : "انقر هنا"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PASSWORDS: Login UI
  if (trackId === "passwords") {
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-4 bg-card p-6 rounded-xl border shadow-sm">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Password</Label>
            <div className="relative">
              <Input 
                type="text" 
                readOnly 
                value={questionId === "passwords-q1" ? "Tigre!Lune42$" : "123456"} 
                className="font-mono"
              />
              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {questionId === "passwords-q1" && (
              <div className="flex gap-1 mt-1">
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
              </div>
            )}
          </div>
          <Button size="sm" className="w-full">Login</Button>
        </div>
      </div>
    );
  }

  // SOCIAL MEDIA: Feed UI
  if (trackId === "social-media") {
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight text-blue-600">InstaPost</span>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-0">
          <div className="aspect-square bg-muted relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1523050853064-9a071539281e?w=800&auto=format&fit=crop&q=60" 
                alt="School" 
                className="w-full h-full object-cover"
              />
            </div>
            {questionId === "social-q1" && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {lang === "fr" ? "Lycée Ibn Toufail - Rabat" : "ثانوية ابن طفيل - الرباط"}
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="text-sm">
              <span className="font-bold mr-2">youssef_22</span>
              {lang === "fr" ? "Enfin fini les cours !" : "أخيراً انتهت الحصص!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CYBERBULLYING: Chat UI
  if (trackId === "cyberbullying") {
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm h-64 flex flex-col">
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm">Groupe Classe</span>
        </div>
        <div className="flex-1 bg-[#e5ddd5] dark:bg-zinc-900 p-4 space-y-3 overflow-y-auto">
          <div className="flex flex-col items-start max-w-[80%]">
             <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 shadow-sm text-xs">
               <span className="font-bold text-orange-500 block text-[10px]">Anas</span>
               {lang === "fr" ? "T'as vu sa tête sur la photo ? 😂" : "هل رأيت وجهه في الصورة؟ 😂"}
             </div>
          </div>
          <div className="flex flex-col items-start max-w-[80%]">
             <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 shadow-sm text-xs">
               <span className="font-bold text-blue-500 block text-[10px]">Sarah</span>
               {lang === "fr" ? "Grave, quel looser" : "فعلاً، يا له من فاشل"}
             </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="bg-[#dcf8c6] dark:bg-emerald-950 rounded-lg p-2 shadow-sm text-xs text-zinc-900 dark:text-zinc-100">
               ...
             </div>
          </div>
        </div>
      </div>
    );
  }

  // PRIVACY: App Permissions
  if (trackId === "privacy") {
    return (
      <div className="w-full aspect-video rounded-xl border bg-zinc-900 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="w-full max-w-[200px] h-[350px] bg-zinc-800 rounded-[30px] border-4 border-zinc-700 p-4 flex flex-col items-center gap-6 shadow-2xl scale-75 sm:scale-90">
           <div className="w-12 h-1 bg-zinc-700 rounded-full mb-2" />
           <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <Search className="h-6 w-6" />
           </div>
           <Card className="w-full bg-zinc-900/90 border-zinc-700 text-white">
             <CardContent className="p-3 text-center space-y-3">
               <p className="text-[10px] leading-tight">
                 {lang === "fr" 
                   ? "Autoriser 'Super Calculator' à accéder à vos contacts ?" 
                   : "هل تسمح لـ 'Super Calculator' بالوصول إلى جهات الاتصال؟"}
               </p>
               <div className="flex flex-col gap-1.5">
                 <Button size="sm" variant="outline" className="h-7 text-[10px] border-zinc-700 text-white hover:bg-zinc-800">
                    {lang === "fr" ? "Autoriser" : "سماح"}
                 </Button>
                 <Button size="sm" variant="outline" className="h-7 text-[10px] border-zinc-700 text-blue-400 hover:bg-zinc-800 font-bold">
                    {lang === "fr" ? "Refuser" : "رفض"}
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  // MALWARE: Browser Pop-up
  if (trackId === "malware") {
    return (
      <div className="w-full rounded-xl border bg-card overflow-hidden shadow-sm relative h-64">
        <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
           <Globe className="h-3 w-3 text-muted-foreground" />
           <div className="bg-background rounded px-2 py-0.5 text-[10px] border w-32 truncate">games-free.com</div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center h-full">
           <div className="w-full max-w-xs h-32 bg-zinc-100 dark:bg-zinc-800 rounded border flex flex-col items-center justify-center p-4 text-center relative">
              <Badge variant="destructive" className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
                 <AlertTriangle className="h-3 w-3" /> ALERT
              </Badge>
              <h4 className="text-sm font-bold mb-1">
                {lang === "fr" ? "VOTRE PC EST INFECTÉ !" : "جهازك مصاب بالفيروسات!"}
              </h4>
              <p className="text-[10px] text-muted-foreground mb-3 leading-tight">
                {lang === "fr" 
                  ? "Nettoyez votre système immédiatement pour éviter la perte de données." 
                  : "نظف نظامك فوراً لتجنب فقدان البيانات."}
              </p>
              <Button size="sm" variant="destructive" className="h-8 text-[10px] px-4">
                 {lang === "fr" ? "TÉLÉCHARGER" : "تحميل"}
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl border bg-muted/40 flex items-center justify-center">
       <div className="text-muted-foreground flex flex-col items-center gap-2">
          <Smartphone className="h-8 w-8" />
          <span className="text-sm">Scenario Visual</span>
       </div>
    </div>
  );
}
