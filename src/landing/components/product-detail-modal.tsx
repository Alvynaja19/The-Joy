"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Minus, Plus, ShoppingBag, X } from "lucide-react";
import {
  formatRupiahAmount,
  normalizeExternalUrl,
  parseRupiahAmount,
  type ProductItem,
  type SiteSettings,
} from "../content/site";

interface ProductDetailModalProps {
  product: ProductItem | null;
  brandName: string;
  whatsappNumber: string;
  shopeeStoreUrl: string;
  modalConfig: SiteSettings["sections"]["product_modal"];
  onClose: () => void;
  onAddToBag?: (product: ProductItem, size: string) => void;
}

export function ProductDetailModal({
  product,
  brandName,
  whatsappNumber,
  shopeeStoreUrl,
  modalConfig,
  onClose,
  onAddToBag,
}: ProductDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (product) {
      const defaultColor =
        product.colors && product.colors.length > 0
          ? product.colors[0]
          : product.colorway;
      const defaultSize =
        product.sizes && product.sizes.length > 0
          ? product.sizes[1] || product.sizes[0]
          : "M";

      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);
      setQuantity(1);
      setAddedNotice(false);

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && product) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const unitPrice = parseRupiahAmount(product.price);
  const totalPrice = unitPrice * quantity;
  const formattedTotalPrice = formatRupiahAmount(totalPrice);
  const activeImage =
    (selectedColor && product.color_images?.[selectedColor]) ||
    product.catalog_img ||
    product.front_img;

  const waText =
    `Halo ${brandName || "HEY JOEY!"}, saya mau pesan langsung:\n\n` +
    `• Nama Produk: ${product.name}\n` +
    `• Warna: ${selectedColor || "-"}\n` +
    `• Ukuran: ${selectedSize}\n` +
    `• Jumlah: ${quantity} pcs\n` +
    `• Total Harga: ${formattedTotalPrice}\n\n` +
    `Mohon info ketersediaan stok dan kelanjutan pembayarannya ya. Terima kasih!`;

  const cleanWaNumber = (whatsappNumber || "6282316185858").replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waText)}`;
  const productShopeeHref = normalizeExternalUrl(product.shopee_url, shopeeStoreUrl);

  const handleBagAdd = () => {
    if (onAddToBag) {
      const productToAdd = selectedColor
        ? { ...product, colorway: selectedColor }
        : product;
      for (let i = 0; i < quantity; i++) {
        onAddToBag(productToAdd, selectedSize);
      }
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
      }, 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-ink/65"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-bg border border-brand-lilac shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-30 inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-white hover:bg-brand-lilac-soft text-brand-ink border border-brand-ink/20 shadow-xs transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Kolom Kiri: Preview Gambar Tampak Depan memakai tag <img> standar */}
        <div className="md:w-1/2 bg-white p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-brand-lilac">
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-brand-bg text-brand-ink border border-brand-lilac rounded-md flex items-center gap-1">
              <span>{modalConfig.item_prefix}</span>
              <span>{product.number}</span>
            </span>
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-brand-lilac-soft text-brand-ink rounded-md">
              {product.category}
            </span>
          </div>

          <div className="w-full h-[280px] sm:h-[380px] flex items-center justify-center pt-6">
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-xl select-none"
            />
          </div>

          <p className="mt-4 text-[11px] font-medium text-brand-muted tracking-wide text-center">
            {modalConfig.photo_caption}
          </p>
        </div>

        {/* Kolom Kanan: Detail Informasi & Form Varian */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="pr-10">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted flex items-center gap-1.5">
                <span>{modalConfig.collection_prefix}</span>
                <span aria-hidden="true">·</span>
                <span>{product.colorway}</span>
              </p>
              <h2
                id="product-modal-title"
                className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-ink"
              >
                {product.name}
              </h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-xl sm:text-2xl font-bold text-brand-ink">
                  {formatRupiahAmount(unitPrice)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-brand-lilac-soft text-brand-ink border border-brand-lilac uppercase tracking-wider">
                  {modalConfig.ready_badge}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {product.description}
            </p>

            {/* Spesifikasi Kain & Potongan */}
            <div className="grid grid-cols-2 gap-3 py-3 px-3.5 bg-white rounded-xl border border-brand-lilac text-xs">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted block">
                  {modalConfig.fabric_label}
                </span>
                <span className="font-medium text-brand-ink mt-0.5 block">
                  {product.fabric}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted block">
                  {modalConfig.fit_label}
                </span>
                <span className="font-medium text-brand-ink mt-0.5 block">
                  {product.fit}
                </span>
              </div>
            </div>

            {/* Pilihan Warna */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center justify-between mb-2">
                  <span>{modalConfig.color_label}</span>
                  <span className="text-[11px] font-normal text-brand-muted">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isColorActive = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={isColorActive}
                        className={`min-h-[44px] px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          isColorActive
                            ? "bg-brand-ink text-white border-brand-ink hover:bg-brand-pink-dark hover:border-brand-pink-dark"
                            : "bg-white text-brand-ink border-brand-ink/20 hover:border-brand-ink"
                        }`}
                      >
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pilihan Ukuran */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-ink flex items-center justify-between mb-2">
                  <span>{modalConfig.size_label}</span>
                  <span className="text-[11px] font-normal text-brand-muted">
                    {selectedSize}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => {
                    const isSizeActive = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={isSizeActive}
                        className={`min-h-[44px] rounded-lg text-sm font-bold border transition-colors ${
                          isSizeActive
                            ? "bg-brand-ink text-white border-brand-ink hover:bg-brand-pink-dark hover:border-brand-pink-dark"
                            : "bg-white text-brand-ink border-brand-ink/20 hover:border-brand-ink"
                        }`}
                      >
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kontrol Jumlah / Qty */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                {modalConfig.qty_label}
              </span>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-brand-ink/20 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Kurangi jumlah"
                    disabled={quantity <= 1}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-ink hover:bg-brand-lilac-soft disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-brand-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Tambah jumlah"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-ink hover:bg-brand-lilac-soft transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {quantity > 1 && (
                  <span className="text-xs font-semibold text-brand-ink">
                    {formattedTotalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bagian Tombol Checkout */}
          <div className="pt-4 border-t border-brand-lilac space-y-3">
            {/* Baris 1 (Full-width): Tombol utama Pesan Langsung via WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 rounded-full bg-brand-ink hover:bg-brand-pink-dark text-white text-xs sm:text-sm font-bold shadow-sm transition-colors text-center"
            >
              <svg
                className="w-4 h-4 shrink-0 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.91 11.91 0 0012.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.23-1.63a11.93 11.93 0 005.83 1.5h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.42zm-8.46 18.37h-.01a9.93 9.93 0 01-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.92 9.92 0 01-1.52-5.22c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.04 7.02 2.92a9.88 9.88 0 012.92 7.02c0 5.49-4.47 9.95-9.94 9.95zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.02 9.02 0 01-1.67-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.07 2.91 1.22 3.11c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
              </svg>
              <span>
                {(modalConfig as any).whatsapp_direct_cta || "Pesan Langsung via WhatsApp"}
              </span>
            </a>

            {/* Baris 2 (Grid 2 kolom sejajar): Tambah ke Tas (Kiri) & Beli di Shopee (Kanan) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Kiri: Tambah ke Tas (Outline / Secondary) */}
              {onAddToBag && (
                <button
                  type="button"
                  onClick={handleBagAdd}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-3 py-2.5 rounded-full bg-white hover:bg-brand-lilac-soft text-brand-ink border border-brand-ink/20 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-muted" />
                  <span>
                    {addedNotice
                      ? modalConfig.saved_to_bag_label
                      : `+ ${modalConfig.save_to_bag_label}`}
                  </span>
                </button>
              )}

              {/* Kanan: Beli di Shopee */}
              <a
                href={productShopeeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-3 py-2.5 rounded-full bg-[#EE4D2D] hover:bg-[#d73d1f] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors group"
              >
                <svg
                  className="w-4 h-4 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.5 6h-3.25C15.86 3.73 14.1 2 12 2S8.14 3.73 7.75 6H4.5C3.67 6 3 6.67 3 7.5l1.5 13c.09.84.8 1.5 1.65 1.5h11.7c.85 0 1.56-.66 1.65-1.5L21 7.5c0-.83-.67-1.5-1.5-1.5zM12 3.75c1.24 0 2.25 1.01 2.25 2.25h-4.5c0-1.24 1.01-2.25 2.25-2.25zM12 16.5c-2.48 0-4.5-2.02-4.5-4.5h1.5c0 1.66 1.34 3 3 3s3-1.34 3-3h1.5c0 2.48-2.02 4.5-4.5 4.5z" />
                </svg>
                <span>{modalConfig.shopee_cta}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-85" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
