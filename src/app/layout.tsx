import type { Metadata } from "next";
import contentData from "../../data/content.json";
import "./globals.css";

export const metadata: Metadata = {
  title: contentData.site_settings.meta.title,
  description: contentData.site_settings.meta.description,
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
