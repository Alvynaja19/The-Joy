"use client";

import type { SiteSettings } from "../content/site";

interface NewsletterProps {
  newsletterConfig: SiteSettings["sections"]["newsletter"];
  instagramUrl?: string;
  instagramHandle?: string;
}

export function Newsletter({
  newsletterConfig,
  instagramUrl,
  instagramHandle,
}: NewsletterProps) {
  const targetUrl =
    (newsletterConfig as any).instagram_url ||
    instagramUrl ||
    "https://www.instagram.com/the.joeyspace";

  const buttonText =
    (newsletterConfig as any).button_label ||
    (instagramHandle ? `Ikuti ${instagramHandle}` : "Ikuti di Instagram");

  const subtitleText =
    (newsletterConfig as any).subtitle ||
    (newsletterConfig as any).description;

  const noteText = (newsletterConfig as any).note;

  return (
    <section id="community" className="py-16 sm:py-24 bg-brand-lilac-soft">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center" data-scroll-reveal>
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted">
          {newsletterConfig.kicker}
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink">
          {newsletterConfig.title}
        </h2>
        {subtitleText && (
          <p className="mt-3 text-base text-brand-muted leading-relaxed max-w-xl mx-auto">
            {subtitleText}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-7 py-3 text-sm font-semibold text-white bg-brand-ink rounded-full hover:bg-brand-pink-dark transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4 shrink-0 fill-none stroke-current"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span>{buttonText}</span>
          </a>

          {noteText && (
            <p className="mt-4 text-xs text-brand-muted leading-relaxed">
              {noteText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
