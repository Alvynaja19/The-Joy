"use client";

import { normalizeExternalUrl } from "../content/site";

interface FloatingShopeeButtonProps {
  href: string;
  label: string;
}

export function FloatingShopeeButton({
  href,
  label,
}: FloatingShopeeButtonProps) {
  const safeHref = normalizeExternalUrl(href);

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-[#EE4D2D] hover:bg-[#d73d1f] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-hidden focus:ring-2 focus:ring-[#EE4D2D] focus:ring-offset-2"
    >
      <svg
        className="w-5 h-5 shrink-0 fill-current transition-transform group-hover:-translate-y-0.5 duration-200"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19.5 6h-3.25C15.86 3.73 14.1 2 12 2S8.14 3.73 7.75 6H4.5C3.67 6 3 6.67 3 7.5l1.5 13c.09.84.8 1.5 1.65 1.5h11.7c.85 0 1.56-.66 1.65-1.5L21 7.5c0-.83-.67-1.5-1.5-1.5zM12 3.75c1.24 0 2.25 1.01 2.25 2.25h-4.5c0-1.24 1.01-2.25 2.25-2.25zM12 16.5c-2.48 0-4.5-2.02-4.5-4.5h1.5c0 1.66 1.34 3 3 3s3-1.34 3-3h1.5c0 2.48-2.02 4.5-4.5 4.5z" />
      </svg>
      <span className="tracking-wide">{label}</span>
    </a>
  );
}

export default FloatingShopeeButton;
