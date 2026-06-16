type SectionTitleProps = { title: string };

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="section-title-wrap mx-auto max-w-4xl">
      <span className="section-arm" aria-hidden="true" />
      <div className="flex shrink-0 items-center gap-3">
        <span className="section-orn" aria-hidden="true" />
        <h2 className="carved-heading text-2xl sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <span className="section-orn" aria-hidden="true" />
      </div>
      <span className="section-arm right" aria-hidden="true" />
    </div>
  );
}
