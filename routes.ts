import type { View } from "./types";

export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/admin/launchpad";

const VIEW_PATH_MAP: Record<View, string> = {
  launchpad: "/admin/launchpad",
  dashboard: "/admin/dashboard",
  pos: "/admin/pos",
  automations: "/admin/automations",
  "automation-detail": "/admin/automations",
  campaigns: "/admin/campaigns",
  segments: "/admin/segments",
  settings: "/admin/settings",
  analytics: "/admin/reports",
  "email-manager": "/admin/email-manager",
  "whatsapp-manager": "/admin/whatsapp-manager",
  chat: "/admin/chat",
  "live-orders": "/admin/live-orders",
  menus: "/admin/menus",
  categories: "/admin/categories",
  "menu-items": "/admin/menu-items",
  modifiers: "/admin/modifiers",
  reports: "/admin/reports",
  blogs: "/admin/blogs",
  "report-detail": "/admin/reports/detail",
  outlets: "/admin/outlets",
  "outlet-detail": "/admin/outlets",
  banners: "/admin/banners",
  vouchers: "/admin/vouchers",
  discounts: "/admin/discounts",
  marketing: "/admin/campaigns",
  "help-desk": "/admin/help-desk",
};

const STATIC_ADMIN_PATHS = new Set<string>([
  "/admin/launchpad",
  "/admin/dashboard",
  "/admin/pos",
  "/admin/chat",
  "/admin/automations",
  "/admin/automations/new",
  "/admin/email-manager",
  "/admin/whatsapp-manager",
  "/admin/campaigns",
  "/admin/segments",
  "/admin/settings",
  "/admin/live-orders",
  "/admin/menu-items",
  "/admin/modifiers",
  "/admin/menus",
  "/admin/categories",
  "/admin/banners",
  "/admin/vouchers",
  "/admin/discounts",
  "/admin/blogs",
  "/admin/outlets",
  "/admin/outlets/new",
  "/admin/reports",
  "/admin/reports/detail",
  "/admin/help-desk",
]);

const trimTrailingSlash = (path: string): string => {
  if (path.length > 1 && path.endsWith("/")) {
    return path.replace(/\/+$/, "");
  }

  return path;
};

export const getPathForView = (view: View): string => {
  return VIEW_PATH_MAP[view] || DEFAULT_AUTHENTICATED_PATH;
};

export const getViewFromPath = (pathname: string): View => {
  const normalized = trimTrailingSlash(pathname);

  if (normalized === "/admin/launchpad") return "launchpad";
  if (normalized === "/admin/dashboard") return "dashboard";
  if (normalized === "/admin/pos") return "pos";
  if (normalized === "/admin/chat") return "chat";
  if (
    normalized === "/admin/automations" ||
    normalized.startsWith("/admin/automations/")
  )
    return "automations";
  if (normalized === "/admin/email-manager") return "email-manager";
  if (normalized === "/admin/whatsapp-manager") return "whatsapp-manager";
  if (normalized === "/admin/campaigns") return "campaigns";
  if (normalized === "/admin/segments") return "segments";
  if (normalized === "/admin/settings") return "settings";
  if (normalized === "/admin/live-orders") return "live-orders";
  if (normalized === "/admin/menu-items") return "menu-items";
  if (normalized === "/admin/modifiers") return "modifiers";
  if (normalized === "/admin/menus") return "menus";
  if (normalized === "/admin/categories") return "categories";
  if (normalized === "/admin/banners") return "banners";
  if (normalized === "/admin/vouchers") return "vouchers";
  if (normalized === "/admin/discounts") return "discounts";
  if (normalized === "/admin/blogs" || normalized.startsWith("/admin/blogs/"))
    return "blogs";
  if (
    normalized === "/admin/outlets" ||
    normalized.startsWith("/admin/outlets/")
  )
    return "outlets";
  if (
    normalized === "/admin/reports" ||
    normalized.startsWith("/admin/reports/")
  )
    return "reports";
  if (normalized === "/admin/help-desk") return "help-desk";

  return "launchpad";
};

export const normalizeLandingPath = (landingPage?: string | null): string => {
  if (!landingPage || !landingPage.startsWith("/")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const normalized = trimTrailingSlash(landingPage);

  if (STATIC_ADMIN_PATHS.has(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/admin/automations/")) {
    return normalized;
  }

  if (normalized.startsWith("/admin/outlets/")) {
    return normalized;
  }

  if (normalized.startsWith("/admin/reports/")) {
    return normalized;
  }

  if (normalized.startsWith("/admin/blogs/")) {
    return normalized;
  }

  return DEFAULT_AUTHENTICATED_PATH;
};
