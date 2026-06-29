export type CropCategory = "leafy" | "vegetable" | "root" | "fruit";

export const cropCatalog = [
  { slug: "pechay", name: "Pechay", category: "leafy", aliases: ["bok choy", "pak choi"] },
  { slug: "kangkong", name: "Kangkong", category: "leafy", aliases: ["water spinach"] },
  { slug: "mustard-greens", name: "Mustard Greens", category: "leafy", aliases: ["mustasa"] },
  { slug: "lettuce", name: "Lettuce", category: "leafy", aliases: [] },
  { slug: "alugbati", name: "Alugbati", category: "leafy", aliases: ["malabar spinach"] },
  { slug: "spring-onion", name: "Spring Onion", category: "leafy", aliases: ["scallion", "green onion"] },
  { slug: "basil", name: "Basil", category: "leafy", aliases: [] },
  { slug: "lemongrass", name: "Lemongrass", category: "leafy", aliases: ["tanglad"] },
  { slug: "pandan", name: "Pandan", category: "leafy", aliases: [] },
  { slug: "tomato", name: "Tomato", category: "vegetable", aliases: ["kamatis"] },
  { slug: "eggplant", name: "Eggplant", category: "vegetable", aliases: ["talong"] },
  { slug: "okra", name: "Okra", category: "vegetable", aliases: [] },
  { slug: "yardlong-bean", name: "Yardlong Bean", category: "vegetable", aliases: ["sitaw", "string bean"] },
  { slug: "bitter-melon", name: "Bitter Melon", category: "vegetable", aliases: ["ampalaya"] },
  { slug: "squash", name: "Squash", category: "vegetable", aliases: ["kalabasa"] },
  { slug: "cucumber", name: "Cucumber", category: "vegetable", aliases: ["pipino"] },
  { slug: "radish", name: "Radish", category: "vegetable", aliases: ["labanos"] },
  { slug: "carrot", name: "Carrot", category: "vegetable", aliases: ["karot"] },
  { slug: "bell-pepper", name: "Bell Pepper", category: "vegetable", aliases: ["sweet pepper"] },
  { slug: "chili-pepper", name: "Chili Pepper", category: "vegetable", aliases: ["sili", "chili"] },
  { slug: "sweet-potato", name: "Sweet Potato", category: "root", aliases: ["kamote"] },
  { slug: "cassava", name: "Cassava", category: "root", aliases: ["kamoteng kahoy"] },
  { slug: "taro", name: "Taro", category: "root", aliases: ["gabi"] },
  { slug: "banana", name: "Banana", category: "fruit", aliases: ["saging"] },
  { slug: "papaya", name: "Papaya", category: "fruit", aliases: [] },
  { slug: "calamansi", name: "Calamansi", category: "fruit", aliases: ["calamondin"] },
  { slug: "guava", name: "Guava", category: "fruit", aliases: ["bayabas"] },
  { slug: "mango", name: "Mango", category: "fruit", aliases: ["mangga"] },
  { slug: "pineapple", name: "Pineapple", category: "fruit", aliases: ["pinya"] },
  { slug: "dragon-fruit", name: "Dragon Fruit", category: "fruit", aliases: ["pitaya"] },
  { slug: "watermelon", name: "Watermelon", category: "fruit", aliases: ["pakwan"] },
  { slug: "melon", name: "Melon", category: "fruit", aliases: ["cantaloupe"] }
] as const;

export type CropCatalogItem = (typeof cropCatalog)[number];

const exactCropImages = new Set<CropCatalogItem["slug"]>(["pechay", "tomato", "eggplant"]);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function distance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[right.length];
}

export function findCropMatch(value: string) {
  const query = normalize(value).replace(/^(fresh|organic|local) /, "");
  const exact = cropCatalog.find((crop) => [crop.name, ...crop.aliases].some((name) => normalize(name) === query));
  if (exact) return exact;
  const included = cropCatalog.find((crop) => [crop.name, ...crop.aliases].some((name) => query.includes(normalize(name))));
  if (included) return included;
  const ranked = cropCatalog.map((crop) => ({ crop, score: Math.min(...[crop.name, ...crop.aliases].map((name) => distance(query, normalize(name)))) })).sort((a, b) => a.score - b.score);
  return ranked[0]?.score <= Math.max(2, Math.ceil(query.length * 0.25)) ? ranked[0].crop : null;
}

export function categoryImageUrl(category: CropCategory) {
  const file = category === "leafy" ? "leafy-greens.webp" : category === "root" ? "root-crops.webp" : category === "fruit" ? "tropical-fruits.webp" : "vegetables.webp";
  return `/uploads/catalog/${file}`;
}

export function cropImageUrl(crop: CropCatalogItem) {
  if (exactCropImages.has(crop.slug)) {
    return `/uploads/catalog/crops/${crop.slug}.webp`;
  }
  return categoryImageUrl(crop.category);
}
