import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  LockOpen,
  KeyRound,
  Fish,
  Bug,
  AlertTriangle,
  Users,
  UserX,
  UserCheck,
  MessageSquareWarning,
  Mail,
  Link,
  Globe,
  Wifi,
  Network,
  Smartphone,
  Monitor,
  Database,
  Server,
  Eye,
  Fingerprint,
  QrCode,
  CreditCard,
  Cpu,
  Cloud,
  Camera,
  type LucideIcon,
} from "lucide-react";

export interface IconDef {
  name: string;
  component: LucideIcon;
  labelFr: string;
  labelAr: string;
}

export const ICON_REGISTRY: IconDef[] = [
  { name: "Shield", component: Shield, labelFr: "Bouclier", labelAr: "درع" },
  { name: "ShieldCheck", component: ShieldCheck, labelFr: "Sécurisé", labelAr: "آمن" },
  { name: "ShieldAlert", component: ShieldAlert, labelFr: "Alerte sécurité", labelAr: "تنبيه أمني" },
  { name: "ShieldX", component: ShieldX, labelFr: "Menace", labelAr: "تهديد" },
  { name: "Lock", component: Lock, labelFr: "Verrouillé", labelAr: "مقفل" },
  { name: "LockOpen", component: LockOpen, labelFr: "Déverrouillé", labelAr: "غير مقفل" },
  { name: "KeyRound", component: KeyRound, labelFr: "Mot de passe", labelAr: "كلمة مرور" },
  { name: "Fish", component: Fish, labelFr: "Hameçonnage", labelAr: "تصيد" },
  { name: "Bug", component: Bug, labelFr: "Malware", labelAr: "برمجية خبيثة" },
  { name: "AlertTriangle", component: AlertTriangle, labelFr: "Danger", labelAr: "خطر" },
  { name: "Users", component: Users, labelFr: "Ingénierie sociale", labelAr: "هندسة اجتماعية" },
  { name: "UserX", component: UserX, labelFr: "Identité volée", labelAr: "هوية مسروقة" },
  { name: "UserCheck", component: UserCheck, labelFr: "Authentification", labelAr: "مصادقة" },
  {
    name: "MessageSquareWarning",
    component: MessageSquareWarning,
    labelFr: "SMS frauduleux",
    labelAr: "رسالة احتيال",
  },
  { name: "Mail", component: Mail, labelFr: "Email", labelAr: "بريد إلكتروني" },
  { name: "Link", component: Link, labelFr: "Liens suspects", labelAr: "روابط مشبوهة" },
  { name: "Globe", component: Globe, labelFr: "Internet", labelAr: "الإنترنت" },
  { name: "Wifi", component: Wifi, labelFr: "Wi-Fi", labelAr: "واي فاي" },
  { name: "Network", component: Network, labelFr: "Réseau", labelAr: "شبكة" },
  { name: "Smartphone", component: Smartphone, labelFr: "Smartphone", labelAr: "هاتف ذكي" },
  { name: "Monitor", component: Monitor, labelFr: "Ordinateur", labelAr: "حاسوب" },
  { name: "Database", component: Database, labelFr: "Données", labelAr: "بيانات" },
  { name: "Server", component: Server, labelFr: "Serveur", labelAr: "خادم" },
  { name: "Eye", component: Eye, labelFr: "Surveillance", labelAr: "مراقبة" },
  { name: "Fingerprint", component: Fingerprint, labelFr: "Identité", labelAr: "هوية" },
  { name: "QrCode", component: QrCode, labelFr: "QR Code", labelAr: "رمز QR" },
  { name: "CreditCard", component: CreditCard, labelFr: "Fraude bancaire", labelAr: "احتيال بنكي" },
  { name: "Cpu", component: Cpu, labelFr: "Matériel", labelAr: "معدات" },
  { name: "Cloud", component: Cloud, labelFr: "Cloud", labelAr: "سحابة" },
  { name: "Camera", component: Camera, labelFr: "Caméra / Vie privée", labelAr: "كاميرا / خصوصية" },
];

export function getIconComponent(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return ICON_REGISTRY.find((i) => i.name === name)?.component ?? null;
}

export function getIconDef(name: string | null | undefined): IconDef | undefined {
  if (!name) return undefined;
  return ICON_REGISTRY.find((i) => i.name === name);
}
