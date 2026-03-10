import { Role } from "../lib/generated/prisma/client";

export interface NavItem {
  label:        string;
  href:         string;
  icon:         string; 
  badge?:       string | number;
  badgeVariant?: "default" | "warning" | "success" | "danger";
  roles?:       Role[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}