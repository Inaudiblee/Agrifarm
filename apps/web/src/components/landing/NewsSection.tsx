import { news } from "@/data/landing";
import { NewsCard } from "./NewsCard";
import { SectionTitle } from "./SectionTitle";

export function NewsSection() {
  return (
    <section
      id="about"
      className="section-block section-block-bottom parchment-section relative w-full px-6 py-16 sm:px-10 lg:px-14"
    >
      <SectionTitle title="Latest From Your Barangay" />
      <div className="grid gap-6 lg:grid-cols-3">
        {news.map(item => (
          <NewsCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
