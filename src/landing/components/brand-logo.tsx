"use client";

export interface BrandLogoProps {
  /** Nama brand dari content.json */
  brandName: string;
  /**
   * Pilihan warna logo sesuai latar belakang:
   * - "pink-dark": menggunakan text-brand-pink-dark (#D6458B) untuk latar terang (Navbar)
   * - "pink": menggunakan text-brand-pink (#F068A8) untuk latar gelap (Footer)
   */
  tone?: "pink-dark" | "pink";
  /** Ukuran teks logo */
  size?: "sm" | "md" | "lg";
  /** Kelas tambahan opsional */
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-[22px] sm:text-[26px]",
  lg: "text-3xl sm:text-4xl",
};

export function BrandLogo({
  brandName,
  tone = "pink-dark",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const toneClass =
    tone === "pink" ? "text-brand-pink" : "text-brand-pink-dark";

  return (
    <span
      style={{ fontFamily: '"Josefin Sans", "Manrope", sans-serif' }}
      className={`hey-joey-logo-font ${toneClass} ${SIZE_CLASSES[size]} inline-flex items-baseline font-light uppercase tracking-[0.28em] leading-none pt-[0.2em] select-none whitespace-nowrap ${className}`.trim()}
    >
      <span className="relative inline-block">
        {/* Garis aksen miring kecil tepat di atas tiang kiri huruf pertama */}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 10"
          fill="none"
          className="pointer-events-none absolute -top-[0.24em] left-[0.01em] w-[0.36em] h-[0.30em] overflow-visible"
        >
          <line
            x1="1"
            y1="8.8"
            x2="9.6"
            y2="1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>{brandName}</span>
      </span>
    </span>
  );
}

export default BrandLogo;
