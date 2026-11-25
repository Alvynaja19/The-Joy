"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ExternalLink, Search } from "lucide-react";
import {
  formatRupiahAmount,
  normalizeExternalUrl,
  parseRupiahAmount,
  type ProductItem,
  type SiteSettings,
} from "../content/site";

interface CatalogProps {
  catalogConfig: SiteSettings["sections"]["catalog"];
  products: ProductItem[];
  shopeeStoreUrl: string;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onInspectProduct: (product: ProductItem | null) => void;
  onAddToBag: (product: ProductItem, size: string) => void;
}

export function Catalog({
  catalogConfig,
  products,
  shopeeStoreUrl,
  activeCategory,
  onCategoryChange,
  onInspectProduct,
  onAddToBag,
}: CatalogProps) {
  const initialCount = catalogConfig.initial_visible_count || 8;
  const stepCount = catalogConfig.load_more_step || 8;

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [activeCategory, searchQuery, initialCount]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [catalogConfig.all_category_label]: products.length,
    };
    for (const item of products) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [products, catalogConfig.all_category_label]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory =
        activeCategory === catalogConfig.all_category_label || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.colorway.toLowerCase().includes(query) ||
        item.fabric.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery, catalogConfig.all_category_label]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredProducts.length - visibleProducts.length);
  const safeShopeeStoreUrl = normalizeExternalUrl(shopeeStoreUrl);

  const handleQuickAdd = (product: ProductItem, size: string) => {
    onAddToBag(product, size);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((curr) => (curr === product.id ? null : curr));
    }, 1300);
  };

  return (
    <section id="pieces" className="py-16 sm:py-24 bg-brand-bg border-b border-brand-lilac">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          data-scroll-reveal
        >
          <div>
            <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted">
              <span>{catalogConfig.index_label}</span>
              <span aria-hidden="true">/</span>
              <span>{catalogConfig.kicker}</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink">
              {catalogConfig.title}
            </h2>
          </div>

          {/* Search Control */}
          <div className="relative w-full md:w-80">
            <label htmlFor="catalog-search" className="sr-only">
              {catalogConfig.search_placeholder}
            </label>
            <Search
              className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={catalogConfig.search_placeholder}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-white border border-brand-ink/20 rounded-lg text-brand-ink placeholder:text-brand-muted focus:border-brand-ink transition-colors"
            />
          </div>
        </div>

        {/* 12+ Shopee Category Filter Bar: swipeable on mobile, wrapped on desktop */}
        <div
          role="tablist"
          aria-label={catalogConfig.title}
          className="flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-2 mb-8"
        >
          {catalogConfig.categories.map((category) => {
            const isSelected = activeCategory === category;
            const count = categoryCounts[category] || 0;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onCategoryChange(category)}
                className={`shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold tracking-[0.06em] rounded-full transition-colors border ${
                  isSelected
                    ? "bg-brand-ink text-white border-brand-ink hover:bg-brand-pink-dark hover:border-brand-pink-dark"
                    : "bg-white text-brand-muted border-brand-ink/20 hover:border-brand-ink hover:text-brand-ink"
                }`}
              >
                <span>{category}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-brand-lilac-soft text-brand-ink"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Empty / Shopee Redirect State (R-27) */}
        {filteredProducts.length === 0 ? (
          <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-brand-lilac bg-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted mb-2">
              {activeCategory}
            </p>
            <p className="text-lg sm:text-xl font-bold text-brand-ink max-w-lg mx-auto">
              {catalogConfig.empty_title}
            </p>
            <p className="mt-2 text-sm text-brand-muted max-w-lg mx-auto leading-relaxed">
              {catalogConfig.empty_description}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={safeShopeeStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-sm font-bold text-white bg-[#EE4D2D] hover:bg-[#d73d1f] rounded-full transition-colors"
              >
                <span>{catalogConfig.empty_shopee_cta}</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => {
                  onCategoryChange(catalogConfig.all_category_label);
                  setSearchQuery("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold text-brand-ink bg-brand-bg border border-brand-ink/25 rounded-full hover:bg-brand-lilac-soft transition-colors"
              >
                <span>{catalogConfig.reset_filter_label}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {visibleProducts.map((product) => {
                const isAdded = addedId === product.id;
                return (
                  <article
                    key={product.id}
                    className="group flex flex-col h-full bg-white border border-brand-lilac rounded-xl overflow-hidden hover:border-brand-ink/35 transition-colors"
                  >
                    {/* Kotak gambar produk */}
                    <button
                      type="button"
                      onClick={() => onInspectProduct(product)}
                      className="relative block w-full aspect-[4/5] bg-white border-b border-brand-lilac/60 p-3 overflow-hidden text-left shrink-0"
                      aria-label={product.name}
                    >
                      {(product.catalog_img || product.front_img) && (
                        <img
                          src={product.catalog_img || product.front_img}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                      {product.is_new && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase bg-brand-lilac-soft text-brand-ink border border-brand-lilac rounded-sm">
                          {catalogConfig.new_badge_label}
                        </span>
                      )}
                    </button>

                    {/* Kontainer konten teks di bawah gambar */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      {/* Baris 1: Kategori */}
                      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted">
                        {product.category}
                      </p>

                      {/* Baris 2: Judul Produk (Maksimal 2 baris, tinggi seragam, tooltip nama lengkap) */}
                      <h3
                        className="mt-1 text-base font-bold text-brand-ink line-clamp-2 min-h-[2.75rem] leading-snug w-full"
                        title={product.name}
                      >
                        <button
                          type="button"
                          onClick={() => onInspectProduct(product)}
                          className="text-left hover:underline underline-offset-4"
                        >
                          <span>{product.name}</span>
                        </button>
                      </h3>

                      {/* Baris 3: Keterangan Bahan (Truncate 1 baris) */}
                      <p className="mt-1 text-xs text-brand-muted truncate" title={product.fabric}>
                        {product.fabric || "-"}
                      </p>

                      {/* Baris 4: Harga Rupiah di baris tersendiri */}
                      <div className="mt-2">
                        <span className="text-base font-semibold text-brand-ink">
                          {formatRupiahAmount(parseRupiahAmount(product.price))}
                        </span>
                      </div>

                      {/* Tombol Aksi di bagian bawah (rata bawah selalu sejajar) */}
                      <div className="mt-auto pt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onInspectProduct(product)}
                          className="flex-1 min-h-[44px] px-3 py-2 text-xs font-semibold text-brand-ink bg-brand-bg border border-brand-ink/20 rounded-lg hover:bg-brand-lilac-soft transition-colors"
                        >
                          <span>{catalogConfig.detail_button_label}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAdd(product, product.sizes[1] || product.sizes[0] || "M")
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-xs font-semibold text-white bg-brand-ink rounded-lg hover:bg-brand-pink-dark transition-colors"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                              <span>{catalogConfig.added_button_label}</span>
                            </>
                          ) : (
                            <span>{catalogConfig.add_button_label}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Tombol Muat Lebih Banyak ketika produk melebihi batas tampilan awal */}
            {remainingCount > 0 && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + stepCount)}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3 text-sm font-semibold text-brand-ink bg-white border border-brand-ink rounded-full hover:bg-brand-ink hover:text-brand-lilac-soft transition-colors"
                >
                  <span>{catalogConfig.load_more_label}</span>
                  <span>({remainingCount})</span>
                  <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Banner Akses Cepat ke Ratusan Produk di Toko Shopee */}
        <div
          className="mt-12 p-6 sm:p-8 rounded-2xl bg-brand-lilac-soft border border-brand-lilac flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          data-scroll-reveal
        >
          <div className="max-w-2xl space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-brand-ink">
              {catalogConfig.shopee_banner_title}
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              {catalogConfig.shopee_banner_subtitle}
            </p>
          </div>

          <a
            href={safeShopeeStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 rounded-full bg-[#EE4D2D] hover:bg-[#d73d1f] text-white text-sm font-bold shadow-sm transition-colors shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19.5 6h-3.25C15.86 3.73 14.1 2 12 2S8.14 3.73 7.75 6H4.5C3.67 6 3 6.67 3 7.5l1.5 13c.09.84.8 1.5 1.65 1.5h11.7c.85 0 1.56-.66 1.65-1.5L21 7.5c0-.83-.67-1.5-1.5-1.5zM12 3.75c1.24 0 2.25 1.01 2.25 2.25h-4.5c0-1.24 1.01-2.25 2.25-2.25zM12 16.5c-2.48 0-4.5-2.02-4.5-4.5h1.5c0 1.66 1.34 3 3 3s3-1.34 3-3h1.5c0 2.48-2.02 4.5-4.5 4.5z" />
            </svg>
            <span>{catalogConfig.shopee_banner_cta}</span>
            <ExternalLink className="w-4 h-4 opacity-85" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Catalog;
