import { products } from "@/data/landing";
import { ProductCard } from "./ProductCard";
import { SectionTitle } from "./SectionTitle";

export function SeasonalFavorites() {
  return (
    <section
      id="produce"
      className="section-block section-block-bottom relative w-full px-6 py-16 sm:px-10 lg:px-14"
    >
      <SectionTitle title="Seasonal Favorites" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map(p => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </section>
  );
}
