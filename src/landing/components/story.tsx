interface StoryProps {
  kicker: string;
  headline: string;
  paragraphs: string[];
}

export function Story({ kicker, headline, paragraphs }: StoryProps) {
  return (
    <section id="story" className="py-20 sm:py-28 bg-brand-bg border-b border-brand-lilac">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
          data-scroll-reveal
        >
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-muted">
              {kicker}
            </p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-ink leading-[1.08]">
              {headline}
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base sm:text-lg text-brand-muted leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Story;
