import {
  Gauge,
  Zap,
  BookOpen,
  Building2,
  Headset,
  Ticket,
  Cpu,
  Mail,
  Smartphone,
  TrendingUp,
  Image as ImageIcon,
  Users,
  PieChart,
  Monitor,
  Cog,
  History,
  GraduationCap,
  MessageSquare,
  ShoppingBag,
  Shield,
} from "lucide-react";
import { NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <Gauge size={24} /> },
  { id: "retention", label: "Retention Dashboard", icon: <PieChart size={24} /> },
  { id: "live-orders", label: "Live Orders", icon: <Zap size={24} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={24} /> },
  {
    id: "menu-manager",
    label: "Menu Manager",
    icon: <BookOpen size={24} />,
    subItems: [
      { id: "categories", label: "Categories" },
      { id: "menu-items", label: "Menu Items" },
      { id: "modifiers", label: "Modifiers" },
      { id: "hold-items", label: "Hold Items" },
    ],
  },
  { id: "outlets", label: "Outlet Manager", icon: <Building2 size={24} /> },
  { id: "banners", label: "Banner Management", icon: <ImageIcon size={24} /> },
  { id: "reports", label: "Reports & Analytics", icon: <PieChart size={24} /> },
  { id: "audit-logs", label: "Audit Trail", icon: <History size={24} /> },
  { id: "tests", label: "LMS Test Records", icon: <GraduationCap size={24} /> },
  { id: "enquiries", label: "Customer Enquiries", icon: <MessageSquare size={24} /> },
  { id: "blogs", label: "Blog Management", icon: <BookOpen size={24} /> },
  { id: "users", label: "User Management", icon: <Users size={24} /> },
  { id: "role-management", label: "Role Management", icon: <Shield size={24} /> },
  { id: "pos", label: "Point of Sale", icon: <Monitor size={24} /> },
  { id: "chat", label: "Support & CRM", icon: <Headset size={24} /> },
  { id: "help-desk", label: "Help Desk", icon: <Ticket size={24} /> },
  { id: "automations", label: "Business Automation", icon: <Cpu size={24} /> },
  { id: "email-manager", label: "Email Templates", icon: <Mail size={24} /> },
  { id: "whatsapp-manager", label: "WhatsApp", icon: <Smartphone size={24} /> },
  {
    id: "marketing",
    label: "Marketing",
    icon: <TrendingUp size={24} />,
    subItems: [
      { id: "campaigns", label: "Campaigns" },
      { id: "vouchers", label: "Vouchers" },
      { id: "discounts", label: "Discounts" },
    ],
  },
  { id: "segments", label: "Customer Segments", icon: <Users size={24} /> },
  { id: "settings", label: "Settings", icon: <Cog size={24} /> },
];

export const DEFAULT_ROLE_MODULES: Record<string, string[]> = {
  admin: [
    "dashboard", "retention", "live-orders", "orders", "pos", "categories", 
    "menu-items", "modifiers", "hold-items", "outlets", "chat", "help-desk", 
    "automations", "email-manager", "whatsapp-manager", "campaigns", 
    "vouchers", "discounts", "banners", "blogs", "segments", "reports", 
    "audit-logs", "tests", "enquiries", "users", "role-management", "settings"
  ],
  "super-admin": [
    "dashboard", "retention", "live-orders", "orders", "pos", "categories", 
    "menu-items", "modifiers", "hold-items", "outlets", "chat", "help-desk", 
    "automations", "email-manager", "whatsapp-manager", "campaigns", 
    "vouchers", "discounts", "banners", "blogs", "segments", "reports", 
    "audit-logs", "tests", "enquiries", "users", "role-management", "settings"
  ],
  manager: [
    "dashboard", "live-orders", "orders", "pos", "categories", "menu-items",
    "modifiers", "hold-items", "outlets", "chat", "help-desk", "reports"
  ]
};
