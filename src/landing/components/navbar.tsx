"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  formatRupiahAmount,
  parseRupiahAmount,
  type ProductItem,
  type SiteSettings,
} from "../content/site";
import { BrandLogo } from "./brand-logo";

export interface CartItem {
  product: ProductItem;
  size: string;
  quantity: number;
}

interface NavbarProps {
  announcement: string;
  brandName: string;
  tagline: string;
  navbarConfig: SiteSettings["navbar"];
  whatsappNumber?: string;
  cart: CartItem[];
  isBagOpen: boolean;
  onOpenBag: () => void;
  onCloseBag: () => void;
  onUpdateQty: (id: string, size: string, delta: number) => void;
  onRemoveItem: (id: string, size: string) => void;
  onClearBag: () => void;
}

export function Navbar({
  announcement,
  brandName,
  tagline,
  navbarConfig,
  whatsappNumber,
  cart,
  isBagOpen,
  onOpenBag,
  onCloseBag,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const bagCloseRef = useRef<HTMLButtonElement>(null);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parseRupiahAmount(item.product.price) * item.quantity,
    0,
  );
  const drawer = navbarConfig.bag_drawer;

  const cleanNumber = (whatsappNumber || "6282316185858").replace(/\D/g, "");
  const itemsListText = cart
    .map((item, idx) => {
      const itemTotal = parseRupiahAmount(item.product.price) * item.quantity;
      return `${idx + 1}. ${item.product.name}
   - Warna: ${item.product.colorway || "-"}
   - Ukuran: ${item.size}
   - Jumlah: ${item.quantity} pcs
   - Subtotal: ${formatRupiahAmount(itemTotal)}`;
    })
    .join("\n\n");

  const messageText = `Halo ${brandName || "HEY JOEY!"}, saya mau pesan:

${itemsListText}

Total Pesanan: ${formatRupiahAmount(subtotal)}

Mohon info ketersediaan stok dan total ongkos kirim ya. Terima kasih!`;

  const waCheckoutUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

  useEffect(() => {
    if (isBagOpen) {
      bagCloseRef.current?.focus();
    } else {
      setCheckoutNotice(false);
    }
  }, [isBagOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isBagOpen) onCloseBag();
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBagOpen, mobileMenuOpen, onCloseBag]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-ink text-brand-lilac-soft text-[11px] font-medium tracking-[0.14em] uppercase py-2 px-4 text-center">
        <span>{announcement}</span>
      </div>

      {/* Sticky Header with Single-Layer Glass Accent (R-10) */}
      <header className="sticky top-0 z-40 w-full bg-brand-bg/90 backdrop-blur-md border-b border-brand-lilac">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              className="md:hidden inline-flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-2.5 sm:px-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink border border-brand-ink/25 rounded-md hover:bg-brand-lilac-soft transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              <span>{navbarConfig.menu_button_label}</span>
            </button>

            <a
              href="#top"
              aria-label={brandName}
              className="inline-flex items-center min-h-[44px] px-1 rounded-md transition-opacity hover:opacity-85"
            >
              <BrandLogo brandName={brandName} tone="pink-dark" size="md" className="text-[17px] sm:text-[26px]" />
            </a>
          </div>

          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1.5">
            {navbarConfig.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center min-h-[44px] px-4 text-sm font-medium text-brand-ink rounded-md hover:bg-brand-lilac-soft/75 transition-colors"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <span className="hidden lg:inline-block text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-muted">
              {tagline}
            </span>
            <button
              type="button"
              onClick={onOpenBag}
              aria-label={`${drawer.title} (${totalCount})`}
              className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink border border-brand-ink rounded-full hover:bg-brand-ink hover:text-brand-lilac-soft transition-colors"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>{navbarConfig.bag_button_label}</span>
              <span>({totalCount})</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav-panel"
            className="md:hidden border-t border-brand-lilac bg-brand-bg px-4 py-4 space-y-1"
          >
            {navbarConfig.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[44px] px-3 py-2 text-base font-medium text-brand-ink rounded-md hover:bg-brand-lilac-soft transition-colors"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </header>

      {isBagOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-brand-ink/55"
          onClick={onCloseBag}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-drawer-title"
            className="w-full max-w-md bg-brand-bg h-full flex flex-col border-l border-brand-lilac shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-lilac">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-muted">
                  {drawer.kicker}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <h2 id="bag-drawer-title" className="text-lg font-bold text-brand-ink">
                    {drawer.title}
                  </h2>
                  <span className="text-sm font-semibold text-brand-muted">({totalCount})</span>
                </div>
              </div>
              <button
                ref={bagCloseRef}
                type="button"
                onClick={onCloseBag}
                aria-label="Tutup"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full border border-brand-ink/20 text-brand-ink hover:bg-brand-lilac-soft transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-brand-lilac rounded-xl bg-white">
                  <ShoppingBag className="w-10 h-10 text-brand-muted mb-4" strokeWidth={1.4} />
                  <h3 className="text-base font-bold text-brand-ink">{drawer.empty_title}</h3>
                  <p className="mt-2 text-sm text-brand-muted max-w-xs">
                    {drawer.empty_description}
                  </p>
                  <a
                    href="#pieces"
                    onClick={onCloseBag}
                    className="mt-6 inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-semibold text-white bg-brand-ink rounded-full hover:bg-brand-pink-dark transition-colors"
                  >
                    <span>{drawer.empty_cta}</span>
                  </a>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item) => {
                    const itemTotal = parseRupiahAmount(item.product.price) * item.quantity;
                    return (
                      <li
                        key={`${item.product.id}-${item.size}`}
                        className="flex gap-3 sm:gap-4 p-3 rounded-lg bg-white border border-brand-lilac overflow-hidden"
                      >
                        <div className="w-20 h-24 shrink-0 rounded bg-white p-1 overflow-hidden border border-brand-lilac/60">
                          {item.product.front_img && (
                            <img
                              src={item.product.front_img}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-sm font-bold text-brand-ink line-clamp-2 break-words"
                                title={item.product.name}
                              >
                                {item.product.name}
                              </h3>
                              <p className="text-xs text-brand-muted flex flex-wrap items-center gap-1 mt-0.5 truncate break-words">
                                <span>{item.product.colorway}</span>
                                <span aria-hidden="true">·</span>
                                <span>{drawer.size_prefix}</span>
                                <span>{item.size}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.product.id, item.size)}
                              aria-label={`Hapus ${item.product.name}`}
                              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] -mt-2 -mr-2 text-brand-muted hover:text-brand-ink shrink-0"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.6} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="inline-flex items-center border border-brand-ink/20 rounded-md">
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.product.id, item.size, -1)}
                                aria-label="Kurangi jumlah"
                                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-brand-ink hover:bg-brand-lilac-soft"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-brand-ink">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.product.id, item.size, 1)}
                                aria-label="Tambah jumlah"
                                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-brand-ink hover:bg-brand-lilac-soft"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-brand-ink">
                              {formatRupiahAmount(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-brand-lilac bg-white px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted font-medium">{drawer.subtotal_label}</span>
                  <span className="text-base font-bold text-brand-ink">
                    {formatRupiahAmount(subtotal)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={waCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center min-h-[44px] px-6 py-3 text-sm font-semibold text-white bg-brand-ink rounded-full hover:bg-brand-pink-dark transition-colors shadow-sm text-center"
                  >
                    <span>{drawer.checkout_button}</span>
                  </a>
                  {drawer.checkout_note && (
                    <p className="text-[11px] text-center text-brand-muted leading-relaxed">
                      {drawer.checkout_note}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={onClearBag}
                    className="w-full min-h-[44px] px-4 py-2 text-xs font-medium text-brand-muted hover:text-brand-ink transition-colors"
                  >
                    <span>{drawer.clear_button}</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

export default Navbar;
