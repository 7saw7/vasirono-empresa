import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_COMPANY_PANEL_URL || "https://panel.vasirono.com";

  const routes = [
    {
      path: "/",
      priority: 1,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/login",
      priority: 0.7,
      changeFrequency: "yearly" as const,
    },
    {
      path: "/recuperar-clave",
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl.replace(/\/$/, "")}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
