"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  formatRupiahAmount,
  parseRupiahAmount,
  type ProductItem,
  type SiteSettings,
} from "../content/site";

interface HeroProps {
  heroConfig: SiteSettings["sections"]["hero"];
  rackProducts: ProductItem[];
  onInspectProduct: (product: ProductItem) => void;
  onAddToBag?: (product: ProductItem, size: string) => void;
}

const fluidSpring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
  mass: 1.1,
};

interface RackGarmentItemProps {
  item: ProductItem;
  isActive: boolean;
  isLifted: boolean;
  onHover: () => void;
  onHoverLeave: () => void;
  onClick: () => void;
  innerRef: (el: HTMLDivElement | null) => void;
}

function RackGarmentItem({
  item,
  isActive,
  isLifted,
  onHover,
  onHoverLeave,
  onClick,
  innerRef,
}: RackGarmentItemProps) {
  return (
    <div
      ref={innerRef}
      onMouseEnter={onHover}
      onMouseLeave={onHoverLeave}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`${item.name} ${item.number}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative flex flex-col items-center cursor-pointer select-none min-w-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isActive ? "z-20 opacity-100" : "z-10 opacity-70 hover:opacity-90"
      }`}
    >
      <motion.div
        animate={{ y: isLifted ? -24 : 0 }}
        transition={fluidSpring}
        className="relative w-full h-[350px] flex justify-center items-start overflow-visible"
      >
        {/* Tampak Depan (Front View) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.9,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 flex justify-center pointer-events-none origin-top"
        >
          <div
            className="flex justify-center origin-top"
            style={{
              transform: `scale(${item.frontScale ?? 1})`,
              transformOrigin: "top center",
            }}
          >
            <img
              src={item.rack_img || item.front_img}
              alt={item.name}
              className="h-[340px] w-auto max-w-none object-contain object-top origin-top drop-shadow-xl"
            />
          </div>
        </motion.div>

        {/* Tampak Samping (Side View) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 0 : 1,
            scale: isActive ? 1 : 0.9,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 flex justify-center pointer-events-none origin-top"
        >
          <div
            className="flex justify-center origin-top"
            style={{
              transform: `scale(${item.sideScale ?? 1})`,
              transformOrigin: "top center",
            }}
          >
            <img
              src={item.side_img || item.front_img}
              alt={item.name}
              className="h-[340px] w-auto max-w-none object-contain object-top origin-top drop-shadow-md"
            />
          </div>
        </motion.div>

        {/* Tag Harga (Hanya pada item aktif/hover, fade-in halus) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            y: isActive ? 0 : 4,
            scale: isActive ? 1 : 0.95,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-11 right-1 sm:right-2 z-30 flex items-center pointer-events-none"
        >
          <span className="w-2.5 h-[1px] bg-brand-muted/60" />
          <span className="px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink bg-white/95 border border-brand-lilac rounded shadow-xs whitespace-nowrap">
            {item.tag_price || item.price}
          </span>
        </motion.div>
      </motion.div>

      {/* Nomor Indeks (01 - 10) */}
      <span
        className={`mt-4 sm:mt-6 text-[11px] font-mono tracking-wider transition-all duration-300 ${
          isActive
            ? "text-brand-ink font-bold scale-110"
            : "text-brand-muted/70 font-normal"
        }`}
      >
        {item.number}
      </span>
    </div>
  );
}

export function Hero({
  heroConfig,
  rackProducts,
  onInspectProduct,
}: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(heroConfig.initial_active_index ?? 4);
  const [isLifted, setIsLifted] = useState(false);

  const railContainerRef = useRef<HTMLDivElement>(null);
  const garmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (rackProducts.length === 0) return null;

  const safeIndex = Math.min(Math.max(0, activeIndex), rackProducts.length - 1);
  const activeProduct = rackProducts[safeIndex] || rackProducts[0];

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const stepRack = (delta: number) => {
    clearHoverTimer();
    setIsLifted(false);
    setActiveIndex((prev) => {
      return (prev + delta + rackProducts.length) % rackProducts.length;
    });
  };

  const handleRackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepRack(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepRack(-1);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      clearHoverTimer();
      setIsLifted(true);
      onInspectProduct(activeProduct);
    }
  };

  const handleGarmentHover = (index: number) => {
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      if (index !== safeIndex) {
        setActiveIndex(index);
        setIsLifted(false);
      }
    }, 50);
  };

  const handleGarmentHoverLeave = () => {
    clearHoverTimer();
  };

  const handleGarmentClick = (index: number, product: ProductItem) => {
    if (hasDraggedRef.current) return;
    clearHoverTimer();

    setActiveIndex(index);
    setIsLifted(true);
    onInspectProduct(product);
  };

  useEffect(() => {
    return () => {
      clearHoverTimer();
    };
  }, []);

  useEffect(() => {
    const el = garmentRefs.current[safeIndex];
    if (el && railContainerRef.current) {
      const container = railContainerRef.current;
      if (container.scrollWidth > container.clientWidth) {
        const elLeft = el.offsetLeft;
        const elWidth = el.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: elLeft - containerWidth / 2 + elWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [safeIndex]);

  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!railContainerRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - railContainerRef.current.offsetLeft;
    scrollStartRef.current = railContainerRef.current.scrollLeft;
  };

  const handleContainerMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !railContainerRef.current) return;
    const x = e.pageX - railContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.2;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      railContainerRef.current.scrollLeft = scrollStartRef.current - walk;
    }
  };

  const handleContainerMouseUp = () => {
    isMouseDownRef.current = false;
  };

  return (
    <section
      id="rack"
      className="relative pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-brand-lilac bg-gradient-to-b from-brand-lilac from-0% via-brand-lilac-soft/55 via-24% to-brand-bg to-42% select-none"
      onKeyDown={handleRackKeyDown}
      tabIndex={0}
      aria-label={heroConfig.title}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Header di atas area brand-lilac */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 sm:mb-14" data-hero-reveal>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-brand-ink/80">
            {heroConfig.kicker}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-[-0.03em] text-brand-ink leading-[1.05]">
            {heroConfig.title}
          </h1>
          <p className="text-sm sm:text-base text-brand-ink/85 leading-relaxed max-w-lg mx-auto pt-1">
            {heroConfig.subtitle}
          </p>
        </div>

        {/* The Clothes Rail Container di atas area netral brand-bg */}
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted px-2 mb-3">
            <span>{heroConfig.rail_meta_left}</span>
            <span className="font-bold text-brand-ink">
              {String(safeIndex + 1).padStart(2, "0")} / {String(rackProducts.length).padStart(2, "0")}
            </span>
          </div>

          {/* Batang Rel Gantungan Atas (Wooden Rail Bar) */}
          <div className="relative w-full z-20">
            <div
              aria-hidden="true"
              className="h-[6px] w-full bg-gradient-to-b from-[#C7B299] to-[#A68E74] rounded-full shadow-xs"
            />
            <div
              aria-hidden="true"
              className="absolute -left-2 -top-1 w-4 h-4 rounded-xs bg-[#A68E74] border border-[#8C6F4B] shadow-2xs"
            />
            <div
              aria-hidden="true"
              className="absolute -right-2 -top-1 w-4 h-4 rounded-xs bg-[#A68E74] border border-[#8C6F4B] shadow-2xs"
            />
          </div>

          {/* Kontainer Dynamic Grid untuk Semua Hanger */}
          <div
            ref={railContainerRef}
            role="tablist"
            aria-label={heroConfig.title}
            onMouseDown={handleContainerMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
            onMouseLeave={() => {
              handleContainerMouseUp();
              handleGarmentHoverLeave();
            }}
            className="w-full -mt-[6px] px-8 sm:px-12 pt-1 pb-6 overflow-x-auto md:overflow-x-visible no-scrollbar cursor-grab active:cursor-grabbing"
          >
            <div
              className="grid w-full min-w-[760px] md:min-w-0 items-start gap-2 sm:gap-3 transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                gridTemplateColumns: rackProducts
                  .map((_, i) => (i === safeIndex ? "2.75fr" : "1fr"))
                  .join(" "),
              }}
            >
              {rackProducts.map((product, index) => {
                const isActive = index === safeIndex;

                return (
                  <RackGarmentItem
                    key={product.id}
                    item={product}
                    isActive={isActive}
                    isLifted={isActive && isLifted}
                    onHover={() => handleGarmentHover(index)}
                    onHoverLeave={handleGarmentHoverLeave}
                    onClick={() => handleGarmentClick(index, product)}
                    innerRef={(el) => {
                      garmentRefs.current[index] = el;
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom Action & Control Bar */}
          <div className="mt-6 pt-6 border-t border-brand-lilac flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-muted px-2">
              <span className="hidden md:inline">{heroConfig.helper_desktop}</span>
              <span className="md:hidden">{heroConfig.helper_mobile}</span>
              <span className="hidden sm:inline">{heroConfig.helper_keys}</span>
            </div>

            <div className="flex items-center justify-center gap-5 sm:gap-8 w-full max-w-xl">
              <button
                type="button"
                onClick={() => stepRack(-1)}
                aria-label="Sebelumnya"
                className="w-11 h-11 rounded-full bg-white border border-brand-ink/25 text-brand-ink flex items-center justify-center hover:bg-brand-ink hover:text-brand-lilac-soft transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>

              <div className="text-center min-w-[200px] sm:min-w-[280px]">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted flex items-center justify-center gap-1.5">
                  <span>{activeProduct.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeProduct.colorway}</span>
                </p>
                <div className="flex flex-wrap items-baseline justify-center gap-2 mt-0.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-ink">
                    {activeProduct.name}
                  </h2>
                  <span className="font-semibold text-brand-muted text-lg sm:text-xl">
                    {formatRupiahAmount(parseRupiahAmount(activeProduct.price))}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onInspectProduct(activeProduct)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-bold tracking-[0.14em] uppercase text-brand-ink hover:text-brand-pink-dark transition-colors group"
                  >
                    <span className="border-b border-brand-ink/40 group-hover:border-brand-pink-dark pb-0.5">
                      {heroConfig.inspect_cta}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                  </button>

                  {isLifted && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-brand-lilac-soft text-brand-ink border border-brand-lilac">
                      {heroConfig.lifted_badge}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => stepRack(1)}
                aria-label="Berikutnya"
                className="w-11 h-11 rounded-full bg-white border border-brand-ink/25 text-brand-ink flex items-center justify-center hover:bg-brand-ink hover:text-brand-lilac-soft transition-colors shrink-0"
              >
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            {/* 10 Pagination Dots with 44px vertical touch area */}
            <div className="flex items-center gap-0.5" aria-label="Navigasi pakaian">
              {rackProducts.map((item, dotIdx) => {
                const isDotActive = dotIdx === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.name} ${item.number}`}
                    onClick={() => {
                      clearHoverTimer();
                      setIsLifted(false);
                      setActiveIndex(dotIdx);
                    }}
                    className="min-h-[44px] min-w-[28px] flex items-center justify-center group"
                  >
                    <span
                      className={`block transition-all duration-300 rounded-full ${
                        isDotActive
                          ? "w-2.5 h-2.5 bg-brand-ink scale-110"
                          : "w-1.5 h-1.5 bg-brand-ink/25 group-hover:bg-brand-pink-dark"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
