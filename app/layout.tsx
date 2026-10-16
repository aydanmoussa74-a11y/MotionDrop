import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotionDrop — HTML/CSS/JS → MP4",
  description: "Convert live HTML, CSS and JavaScript into MP4 video.",
  themeColor: "#0A0A0A",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192x192.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-900 text-stark-white antialiased">
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="manifest" href="/manifest.json" />
        {children}
      </body>
    </html>
  );
}
