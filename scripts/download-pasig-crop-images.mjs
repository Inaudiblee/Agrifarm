import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const crops = [
  ["pechay", "bok choy vegetable"], ["kangkong", "water spinach vegetable"],
  ["mustard-greens", "mustard greens vegetable"], ["lettuce", "lettuce vegetable"],
  ["alugbati", "Malabar spinach vegetable"], ["tomato", "tomato fruit vegetable"],
  ["eggplant", "eggplant vegetable"], ["okra", "okra vegetable"],
  ["yardlong-bean", "yardlong bean vegetable"], ["bitter-melon", "bitter melon vegetable"],
  ["squash", "squash vegetable"], ["cucumber", "cucumber vegetable"],
  ["radish", "radish vegetable"], ["carrot", "carrot vegetable"],
  ["bell-pepper", "bell pepper vegetable"], ["chili-pepper", "chili pepper vegetable"],
  ["spring-onion", "spring onion vegetable"], ["sweet-potato", "sweet potato vegetable"],
  ["cassava", "cassava root"], ["taro", "taro root vegetable"],
  ["banana", "banana fruit"], ["papaya", "papaya fruit"], ["calamansi", "calamansi fruit"],
  ["guava", "guava fruit"], ["mango", "mango fruit"], ["pineapple", "pineapple fruit"],
  ["dragon-fruit", "dragon fruit"], ["watermelon", "watermelon fruit"], ["melon", "melon fruit"],
  ["basil", "basil herb"], ["lemongrass", "lemongrass herb"], ["pandan", "pandan leaves"]
];

const output = join(process.cwd(), "apps", "api", "uploads", "catalog");
await mkdir(output, { recursive: true });
const sources = {};

for (const [slug, query] of crops) {
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrsearch: query,
    gsrnamespace: "6", gsrlimit: "10", prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "900"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "Agrifarm/1.0 local-crop-catalog" }
  });
  if (!response.ok) throw new Error(`${slug}: Commons returned ${response.status}`);
  const data = await response.json();
  const images = Object.values(data.query?.pages ?? {}).flatMap((page) => page.imageinfo ?? []);
  const image = images.find((item) => ["image/jpeg", "image/png", "image/webp"].includes(item.mime) && (item.thumburl || item.url));
  if (!image) throw new Error(`${slug}: no usable image found`);
  const imageResponse = await fetch(image.thumburl || image.url, { headers: { "User-Agent": "Agrifarm/1.0 local-crop-catalog" } });
  if (!imageResponse.ok) throw new Error(`${slug}: image returned ${imageResponse.status}`);
  const extension = image.mime === "image/png" ? "png" : image.mime === "image/webp" ? "webp" : "jpg";
  await writeFile(join(output, `${slug}.${extension}`), Buffer.from(await imageResponse.arrayBuffer()));
  sources[slug] = {
    file: `${slug}.${extension}`,
    source: image.descriptionurl,
    license: image.extmetadata?.LicenseShortName?.value ?? null,
    artist: image.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null
  };
  console.log(`Downloaded ${slug}`);
}

await writeFile(join(output, "sources.json"), `${JSON.stringify(sources, null, 2)}\n`);
console.log(`Saved ${crops.length} crop images to ${output}`);
