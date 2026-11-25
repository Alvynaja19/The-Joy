import type { Metadata, Viewport } from "next";
import contentData from "../../data/content.json";
import "./globals.css";

export const metadata: Metadata = {
  title: contentData.site_settings.meta.title,
  description: contentData.site_settings.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-brand-bg text-brand-ink">
        {children}
      </body>
    </html>
  );
}
