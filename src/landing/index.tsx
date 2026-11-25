"use client";

import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/300.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./styles.css";

import { useMemo, useRef, useState } from "react";
import defaultContent, { type ContentData, type ProductItem } from "./content/site";
import { usePageMotion } from "./gsap/use-page-motion";
import { Navbar, type CartItem } from "./components/navbar";
import { Hero } from "./components/hero";
import { Manifesto } from "./components/manifesto";
import { Catalog } from "./components/catalog";
import { Lookbook } from "./components/lookbook";
import { Chapters } from "./components/chapters";
import { Story } from "./components/story";
import { Newsletter } from "./components/newsletter";
import { Footer } from "./components/footer";
import { ProductDetailModal } from "./components/product-detail-modal";
import { FloatingShopeeButton } from "./components/floating-shopee-button";

export interface LandingProps {
  data?: ContentData;
}

export function Landing({ data = defaultContent }: LandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  usePageMotion(rootRef);

  const settings = data.site_settings;
  const products: ProductItem[] = data.products;
  const sections = settings.sections;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(sections.catalog.all_category_label);
  const [inspectedProduct, setInspectedProduct] = useState<ProductItem | null>(null);

  const rackProducts = useMemo(() => {
    return products.filter((item) => item.on_rack !== false);
  }, [products]);

  const handleAddToBag = (product: ProductItem, size: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size,
      );
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id && item.size === size
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (id: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === id && item.size === size)),
    );
  };

  const handleClearBag = () => {
    setCart([]);
  };

  return (
    <div ref={rootRef} id="top" className="hey-joey-root min-h-screen flex flex-col overflow-x-hidden">
      <a
        href="#rack"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-ink focus:text-brand-lilac-soft focus:rounded-md focus:text-sm focus:font-semibold"
      >
        <span>{settings.skip_to_content_label}</span>
      </a>

      <Navbar
        announcement={settings.announcement}
        brandName={settings.brand_name}
        tagline={settings.tagline}
        navbarConfig={settings.navbar}
        whatsappNumber={settings.whatsapp_number}
        cart={cart}
        isBagOpen={isBagOpen}
        onOpenBag={() => setIsBagOpen(true)}
        onCloseBag={() => setIsBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={handleClearBag}
      />

      <main className="flex-1">
        <Hero
          heroConfig={sections.hero}
          rackProducts={rackProducts}
          onInspectProduct={(product) => setInspectedProduct(product)}
          onAddToBag={handleAddToBag}
        />

        <Manifesto
          kicker={sections.manifesto.kicker}
          headline={sections.manifesto.headline}
          body={sections.manifesto.body}
        />

        <Catalog
          catalogConfig={sections.catalog}
          products={products}
          shopeeStoreUrl={settings.shopee_store_url}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onInspectProduct={setInspectedProduct}
          onAddToBag={handleAddToBag}
        />

        <Lookbook
          lookbookConfig={sections.lookbook}
          allProducts={products}
          onInspectProduct={(product) => setInspectedProduct(product)}
          onAddToBag={handleAddToBag}
        />

        <Chapters
          chaptersConfig={sections.chapters}
          onSelectChapterCategory={(category) => setActiveCategory(category)}
        />

        <Story
          kicker={sections.story.kicker}
          headline={sections.story.headline}
          paragraphs={sections.story.paragraphs}
        />

        <Newsletter
          newsletterConfig={sections.newsletter}
          instagramUrl={settings.instagram_url}
          instagramHandle={settings.instagram_handle}
        />
      </main>

      <Footer
        brandName={settings.brand_name}
        navLinks={settings.navbar.links}
        footerConfig={sections.footer}
      />

      <ProductDetailModal
        product={inspectedProduct}
        brandName={settings.brand_name}
        whatsappNumber={settings.whatsapp_number}
        shopeeStoreUrl={settings.shopee_store_url}
        modalConfig={sections.product_modal}
        onClose={() => setInspectedProduct(null)}
        onAddToBag={handleAddToBag}
      />

      <FloatingShopeeButton
        href={settings.shopee_store_url}
        label={settings.shopee_floating_label}
      />
    </div>
  );
}

export default Landing;
