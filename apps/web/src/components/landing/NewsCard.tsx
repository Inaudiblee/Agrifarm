type Props = {
  item: { title: string; description: string; cta?: string };
};

export function NewsCard({ item }: Props) {
  return (
    <article className="news-card group">
      <div className="news-rune-panel" aria-hidden="true">
        <span>Ani</span>
      </div>

      <div className="news-body">
        <h3 className="news-headline">{item.title}</h3>
        <p className="news-excerpt">{item.description}</p>
        <a href="#about" className="news-cta">
          {item.cta ?? "Magbasa Pa"}
          <span aria-hidden="true" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
            &rsaquo;
          </span>
        </a>
      </div>
    </article>
  );
}
