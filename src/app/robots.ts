import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/recuperar-clave"],
    },
    sitemap: "https://codevastudio.com/sitemap.xml",
  };
}
