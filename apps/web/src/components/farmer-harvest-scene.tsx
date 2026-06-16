"use client";

type FarmerHarvestSceneProps = {
  harvesting: boolean;
};

export function FarmerHarvestScene({ harvesting }: FarmerHarvestSceneProps) {
  return (
    <div className="farmer-scene mx-auto" aria-hidden>
      <svg
        viewBox="0 0 320 220"
        className="w-full h-auto drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="160" cy="200" rx="140" ry="18" fill="#166534" opacity="0.5" />

        {/* Crop rows */}
        <g className="crop-rows">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${40 + i * 48}, 155)`}>
              <path
                d="M0 35 Q8 0 16 35"
                fill="#22c55e"
                className={harvesting ? "crop-stalk crop-stalk--sway" : "crop-stalk"}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
              <circle cx="8" cy="2" r="6" fill="#fbbf24" className="crop-grain" />
            </g>
          ))}
        </g>

        {/* Basket */}
        <g transform="translate(218, 128)">
          <path d="M0 28 L8 8 L40 8 L48 28 Z" fill="#92400e" />
          <path d="M8 8 L24 0 L40 8" fill="#b45309" />
          <rect x="4" y="12" width="40" height="6" rx="2" fill="#78350f" opacity="0.5" />
          {harvesting && (
            <g className="harvest-spark">
              <circle cx="24" cy="0" r="4" fill="#fde047" />
            </g>
          )}
        </g>

        {/* Farmer body */}
        <g className="farmer-body" transform="translate(108, 72)">
          {/* Legs */}
          <rect x="28" y="88" width="14" height="42" rx="4" fill="#1e3a5f" />
          <rect x="50" y="88" width="14" height="42" rx="4" fill="#1e3a5f" />
          {/* Torso */}
          <rect x="20" y="48" width="52" height="48" rx="10" fill="#2563eb" />
          {/* Head */}
          <circle cx="46" cy="32" r="22" fill="#fcd9b6" />
          {/* Hat */}
          <ellipse cx="46" cy="18" rx="30" ry="10" fill="#ca8a04" />
          <rect x="24" y="10" width="44" height="14" rx="4" fill="#eab308" />
          {/* Face */}
          <circle cx="38" cy="34" r="2" fill="#44403c" />
          <circle cx="54" cy="34" r="2" fill="#44403c" />
          <path d="M38 42 Q46 48 54 42" stroke="#44403c" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Arms — harvest swing */}
          <g className={harvesting ? "farmer-arm farmer-arm--harvest" : "farmer-arm"} transform="translate(8, 54)">
            <rect x="0" y="0" width="36" height="10" rx="5" fill="#fcd9b6" transform="rotate(-35 4 5)" />
            <circle cx="32" cy="8" r="8" fill="#fcd9b6" />
          </g>
          <g className="farmer-arm-static" transform="translate(58, 58)">
            <rect x="0" y="0" width="28" height="10" rx="5" fill="#fcd9b6" transform="rotate(25 4 5)" />
          </g>

          {/* Sickle / tool */}
          <g className={harvesting ? "farmer-tool farmer-tool--swing" : "farmer-tool"} transform="translate(-4, 40)">
            <path d="M0 0 L28 -8 L30 0" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M28 -8 Q36 4 28 14" stroke="#cbd5e1" strokeWidth="4" fill="none" />
          </g>
        </g>

        <rect x="0" y="170" width="320" height="50" fill="url(#skyGlow)" />
        <rect x="0" y="178" width="320" height="42" fill="#14532d" rx="0" />
      </svg>
    </div>
  );
}
