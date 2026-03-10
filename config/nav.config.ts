import { NavSection } from "@/types/nav";

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "",
    items: [
      {
        label: "Dashboard",
        href:  "/",
        icon:  "LayoutDashboard",
      },
    ],
  },
  {
    label: "Operações",
    items: [
      {
        label: "Ponto de Venda",
        href:  "/pos",
        icon:  "ShoppingCart",
      },
      {
        label: "Caixa",
        href:  "/caixa",
        icon:  "Wallet",
        badge: "ABERTA",
        badgeVariant: "success",
      },
      {
        label: "Faturas",
        href:  "/faturas",
        icon:  "FileText",
      },
    ],
  },
  {
    label: "Inventário",
    items: [
      {
        label: "Produtos",
        href:  "/produtos",
        icon:  "Package",
      },
      {
        label: "Stock",
        href:  "/stock",
        icon:  "Boxes",
        badge: 3,
        badgeVariant: "warning",
      },
      {
        label: "Compras",
        href:  "/compras",
        icon:  "ShoppingBag",
        roles: ["ADMIN", "GERENTE"],
      },
      {
        label: "Fornecedores",
        href:  "/fornecedores",
        icon:  "Truck",
        roles: ["ADMIN", "GERENTE"],
      },
    ],
  },
  {
    label: "Análise",
    items: [
      {
        label: "Relatórios",
        href:  "/relatorios",
        icon:  "BarChart3",
        roles: ["ADMIN", "GERENTE"],
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Utilizadores",
        href:  "/utilizadores",
        icon:  "Users",
        roles: ["ADMIN"],
      },
      {
        label: "Configurações",
        href:  "/configuracoes",
        icon:  "Settings",
        roles: ["ADMIN", "GERENTE"],
      },
    ],
  },
];