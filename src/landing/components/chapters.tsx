"use client";

import type { SiteSettings } from "../content/site";

interface ChaptersProps {
  chaptersConfig: SiteSettings["sections"]["chapters"];
  onSelectChapterCategory: (category: string) => void;
}

export function Chapters({
  chaptersConfig,
  onSelectChapterCategory,
}: ChaptersProps) {
  const items = chaptersConfig.items;
  if (items.length === 0) return null;

  const first = items[0];
  const second = items[1];

  const jumpToCategory = (category: string) => {
    onSelectChapterCategory(category);
    const el = document.getElementById("pieces") || document.getElementById("catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="chapters" className="py-16 sm:py-24 bg-brand-bg border-b border-brand-lilac">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-10" data-scroll-reveal>
          <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted">
            <span>{chaptersConfig.index_label}</span>
            <span aria-hidden="true">/</span>
            <span>{chaptersConfig.kicker}</span>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink">
            {chaptersConfig.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8" data-scroll-reveal>
          {first && (
            <div className="lg:col-span-7 rounded-2xl bg-white border border-brand-lilac overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-muted">
                    {(first as any).badge || first.tag}
                  </p>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-brand-ink">
                    {first.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-brand-ink/80">
                    {first.subtitle}
                  </p>
                  <p className="mt-4 text-sm text-brand-muted leading-relaxed">
                    {first.description}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => jumpToCategory(first.target_category)}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white bg-brand-ink rounded-full hover:bg-brand-pink-dark transition-colors"
                  >
                    <span>{first.cta_label}</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-6 bg-white min-h-[260px] border-t sm:border-t-0 sm:border-l border-brand-lilac overflow-hidden">
                <img
                  src={first.image}
                  alt={first.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {second && (
            <div className="lg:col-span-5 rounded-2xl bg-brand-ink text-brand-lilac-soft overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-lilac">
                  {(second as any).badge || second.tag}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-lilac-soft">
                  {second.title}
                </h3>
                <p className="text-sm font-medium text-brand-lilac">
                  {second.subtitle}
                </p>
                <p className="text-sm text-brand-lilac-soft/90 leading-relaxed">
                  {second.description}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => jumpToCategory(second.target_category)}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink bg-brand-lilac rounded-full hover:bg-brand-lilac-soft transition-colors"
                  >
                    <span>{second.cta_label}</span>
                  </button>
                </div>
              </div>

              <div className="h-60 sm:h-64 bg-white border-t border-brand-lilac/20 overflow-hidden">
                <img
                  src={second.image}
                  alt={second.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Chapters;
