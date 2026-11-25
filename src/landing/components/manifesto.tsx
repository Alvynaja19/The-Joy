interface ManifestoProps {
  kicker: string;
  headline: string;
  body: string;
}

export function Manifesto({ kicker, headline, body }: ManifestoProps) {
  return (
    <section
      id="manifesto"
      className="bg-brand-lilac text-brand-ink border-y border-brand-ink/10 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end"
          data-scroll-reveal
        >
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-ink/80 mb-4">
              {kicker}
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.12] text-brand-ink">
              {headline}
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-base sm:text-lg text-brand-ink/90 leading-relaxed">
              {body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Manifesto;
