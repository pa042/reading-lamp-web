import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "リーディングランプ",
    short_name: "読書ノート",
    description: "読んだ本の記録をつける、個人用の読書ノート",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2f8049",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
