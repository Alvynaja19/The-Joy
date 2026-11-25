"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { SiteSettings } from "../content/site";
import { BrandLogo } from "./brand-logo";

type InfoItem = SiteSettings["sections"]["footer"]["info_items"][number];

interface FooterProps {
  brandName: string;
  navLinks: SiteSettings["navbar"]["links"];
  footerConfig: SiteSettings["sections"]["footer"];
}

export function Footer({
  brandName,
  navLinks,
  footerConfig,
}: FooterProps) {
  const [activeInfo, setActiveInfo] = useState<InfoItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeInfo) {
      closeRef.current?.focus();
    }
  }, [activeInfo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeInfo) {
        setActiveInfo(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeInfo]);

  return (
    <footer className="bg-brand-ink text-brand-lilac-soft pt-16 pb-10 border-t border-brand-lilac/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-brand-lilac/20">
          <div className="md:col-span-6 space-y-5">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-lilac max-w-xs leading-relaxed">
              {footerConfig.tagline}
            </p>
            <div>
              <BrandLogo brandName={brandName} tone="pink" size="lg" />
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-lilac">
              {footerConfig.nav_heading}
            </h2>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center min-h-[44px] text-sm text-brand-lilac-soft hover:text-brand-pink transition-colors"
                  >
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-lilac">
              {footerConfig.info_heading}
            </h2>
            <ul className="space-y-1">
              {footerConfig.info_items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(item)}
                    className="inline-flex items-center min-h-[44px] text-left text-sm text-brand-lilac-soft hover:text-brand-pink transition-colors"
                  >
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-brand-lilac">
          <p>{footerConfig.copyright}</p>
          <p className="uppercase tracking-[0.14em]">{footerConfig.closing_note}</p>
        </div>
      </div>

      {activeInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/70"
          onClick={() => setActiveInfo(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-info-title"
            className="w-full max-w-lg bg-brand-bg text-brand-ink rounded-2xl border border-brand-lilac p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 id="footer-info-title" className="text-xl font-bold text-brand-ink">
                {activeInfo.title}
              </h3>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setActiveInfo(null)}
                aria-label="Tutup"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full border border-brand-ink/20 text-brand-ink hover:bg-brand-lilac-soft transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed">{activeInfo.content}</p>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
