type Props = {
  product: { name: string; subtitle: string };
};

export function ProductCard({ product }: Props) {
  return (
    <div className="product-card h-full items-center p-5 text-center">
      <span className="product-card-top-lock" aria-hidden="true" />
      <div className="product-rune-panel mb-5 w-full" aria-hidden="true">
        <span>{product.name.slice(0, 1)}</span>
      </div>

      <h3
        className="font-carved text-2xl font-black uppercase"
        style={{
          color: "#F5DDA2",
          textShadow: "0 3px 0 #2A1408, 0 6px 16px rgba(0,0,0,0.75)",
        }}
      >
        {product.name}
      </h3>

      <p
        className="mt-1 min-h-[2rem] text-sm font-semibold"
        style={{ color: "#C8A058" }}
      >
        {product.subtitle}
      </p>

      <button type="button" className="wooden-button mt-5 w-full">
        <span>Add To Cart</span>
        <span className="cart-rune" aria-hidden="true" />
      </button>
    </div>
  );
}
