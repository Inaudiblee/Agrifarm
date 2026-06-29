export const pasigCrops = [
  "Pechay", "Kangkong", "Mustard Greens", "Lettuce", "Alugbati", "Spring Onion", "Basil", "Lemongrass", "Pandan",
  "Tomato", "Eggplant", "Okra", "Yardlong Bean", "Bitter Melon", "Squash", "Cucumber", "Radish", "Carrot", "Bell Pepper", "Chili Pepper",
  "Sweet Potato", "Cassava", "Taro", "Banana", "Papaya", "Calamansi", "Guava", "Mango", "Pineapple", "Dragon Fruit", "Watermelon", "Melon"
] as const;

const aliases: Record<string, string[]> = {
  Pechay: ["bok choy", "pak choi"], Kangkong: ["water spinach"], "Mustard Greens": ["mustasa"], Alugbati: ["malabar spinach"],
  Tomato: ["kamatis"], Eggplant: ["talong"], "Yardlong Bean": ["sitaw", "string bean"], "Bitter Melon": ["ampalaya"],
  Squash: ["kalabasa"], Cucumber: ["pipino"], Radish: ["labanos"], Carrot: ["karot"], "Chili Pepper": ["sili", "chili"],
  "Sweet Potato": ["kamote"], Cassava: ["kamoteng kahoy"], Taro: ["gabi"], Banana: ["saging"], Calamansi: ["calamondin"],
  Guava: ["bayabas"], Mango: ["mangga"], Pineapple: ["pinya"], "Dragon Fruit": ["pitaya"], Watermelon: ["pakwan"], Lemongrass: ["tanglad"]
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const distance = (left: string, right: string) => {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) { let previous = row[0]; row[0] = i; for (let j = 1; j <= right.length; j++) { const saved = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1)); previous = saved; } }
  return row[right.length];
};

export function suggestPasigCrops(value: string) {
  const query = normalize(value).replace(/^(fresh|organic|local) /, "");
  if (query.length < 2) return [];
  return pasigCrops.map((name) => {
    const options = [name, ...(aliases[name] ?? [])].map(normalize);
    const exactish = options.some((option) => option.includes(query) || query.includes(option));
    return { name, score: exactish ? -10 : Math.min(...options.map((option) => distance(query, option))) };
  }).sort((a, b) => a.score - b.score || a.name.localeCompare(b.name)).slice(0, 5).map(({ name }) => name);
}
