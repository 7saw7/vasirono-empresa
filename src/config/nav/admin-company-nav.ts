import {
  BarChart3,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  CreditCard,
  Megaphone,
  ImageIcon,
  UsersRound,
  ShieldCheck,
  Store,
} from "lucide-react";

export type AdminCompanyNavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export const ADMIN_COMPANY_NAV: AdminCompanyNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Sucursales",
    href: "/sucursales",
    icon: Store,
  },
  {
    label: "Perfil negocio",
    href: "/perfil-negocio",
    icon: Building2,
  },
  {
    label: "Reseñas",
    href: "/resenias",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Verificaciones",
    href: "/verificaciones",
    icon: ShieldCheck,
  },
  {
    label: "Plan y pagos",
    href: "/plan",
    icon: CreditCard,
  },
  {
    label: "Promociones",
    href: "/promociones",
    icon: Megaphone,
  },
  {
    label: "Galería",
    href: "/galeria",
    icon: ImageIcon,
  },
  {
    label: "Equipo",
    href: "/equipo",
    icon: UsersRound,
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
];