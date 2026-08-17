import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.fullName,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#15130F",
    icons: [
      {
        src: "/images/froshx-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/froshx-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
