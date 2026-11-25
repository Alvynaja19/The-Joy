"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  formatRupiahAmount,
  parseRupiahAmount,
  type ProductItem,
  type SiteSettings,
} from "../content/site";

interface LookbookProps {
  lookbookConfig: SiteSettings["sections"]["lookbook"];
  allProducts: ProductItem[];
  onInspectProduct: (product: ProductItem) => void;
  onAddToBag: (product: ProductItem, size: string) => void;
}

export function Lookbook({
  lookbookConfig,
  allProducts,
  onInspectProduct,
  onAddToBag,
}: LookbookProps) {
  const [activeLookIdx, setActiveLookIdx] = useState(0);
  const [addedLookId, setAddedLookId] = useState<string | null>(null);

  const looks = lookbookConfig.looks;
  if (looks.length === 0) return null;

  const activeLook = looks[activeLookIdx] || looks[0];
  const lookPieces = activeLook.product_ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  const totalLookPrice = lookPieces.reduce(
    (acc, p) => acc + parseRupiahAmount(p.price),
    0
  );

  const handleAddFullLook = () => {
    lookPieces.forEach((piece) => {
      onAddToBag(piece, piece.sizes[1] || piece.sizes[0] || "M");
    });
    setAddedLookId(activeLook.id);
    window.setTimeout(() => {
      setAddedLookId((curr) => (curr === activeLook.id ? null : curr));
    }, 1600);
  };

  return (
    <section id="lookbook" className="py-16 sm:py-24 bg-brand-lilac-soft/55 border-b border-brand-lilac">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
          data-scroll-reveal
        >
          {/* Left: Full Editorial Look Visual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {looks.map((look, idx) => {
                  const selected = idx === activeLookIdx;
                  return (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() => setActiveLookIdx(idx)}
                      aria-pressed={selected}
                      className={`min-h-[44px] px-4 py-2 text-xs font-semibold tracking-[0.06em] rounded-full border transition-colors ${
                        selected
                          ? "bg-brand-ink text-white border-brand-ink hover:bg-brand-pink-dark hover:border-brand-pink-dark"
                          : "bg-white text-brand-muted border-brand-ink/20 hover:text-brand-ink hover:border-brand-ink"
                      }`}
                    >
                      <span>{look.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-brand-lilac aspect-[4/5]">
              <img
                src={activeLook.image}
                alt={activeLook.label}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-brand-muted">{activeLook.caption}</p>
          </div>

          {/* Right: Breakdown List of Pieces */}
          <div className="lg:col-span-6 lg:pt-8 space-y-6">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted">
                <span>{lookbookConfig.index_label}</span>
                <span aria-hidden="true">/</span>
                <span>{lookbookConfig.kicker}</span>
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink">
                {lookbookConfig.title}
              </h2>
              <p className="mt-3 text-base text-brand-muted leading-relaxed">
                {lookbookConfig.description}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {lookPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-brand-lilac"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-white p-1 border border-brand-lilac/60">
                      <img
                        src={piece.front_img}
                        alt={piece.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand-muted">
                        {piece.category}
                      </p>
                      <h3 className="text-base font-bold text-brand-ink line-clamp-2">
                        {piece.name}
                      </h3>
                      <p className="text-sm font-semibold text-brand-ink">
                        {formatRupiahAmount(parseRupiahAmount(piece.price))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onInspectProduct(piece)}
                      className="min-h-[44px] px-4 py-2 text-xs font-semibold text-brand-ink bg-brand-bg border border-brand-ink/20 rounded-lg hover:bg-brand-lilac-soft transition-colors"
                    >
                      <span>{lookbookConfig.detail_button_label}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToBag(piece, piece.sizes[1] || piece.sizes[0] || "M")}
                      className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-brand-ink rounded-lg hover:bg-brand-pink-dark transition-colors"
                    >
                      <span>{lookbookConfig.add_button_label}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddFullLook}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3.5 text-sm font-semibold text-white bg-brand-ink rounded-full hover:bg-brand-pink-dark transition-colors"
              >
                {addedLookId === activeLook.id ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    <span>{lookbookConfig.added_full_look_label}</span>
                  </>
                ) : (
                  <>
                    <span>{lookbookConfig.add_full_look_label}</span>
                    <span>
                      ({lookPieces.length}) · {formatRupiahAmount(totalLookPrice)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Lookbook;
