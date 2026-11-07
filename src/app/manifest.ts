import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HRMS",
    short_name: "HRMS",
    description: "PeopleFlow human resource management system.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f8fa",
    theme_color: "#315fc5",
    lang: "en",
    id: "/",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/hrms-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/hrms-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/hrms-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/hrms-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
