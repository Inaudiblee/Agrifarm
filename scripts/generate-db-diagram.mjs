import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "apps", "api", "prisma", "schema.prisma");
const outDir = path.join(root, "docs", "database");

const groupOrder = [
  "Identity & Access",
  "Geography & Service Areas",
  "Marketplace Catalog",
  "Checkout & Orders",
  "Finance & Operations",
  "Urban Agriculture Data",
  "Localization",
];

const groups = {
  "Identity & Access": ["User", "RefreshToken", "SellerProfile", "Address"],
  "Geography & Service Areas": ["Barangay", "StoreServiceArea"],
  "Marketplace Catalog": [
    "Store",
    "Category",
    "Product",
    "ProductVariant",
    "ProductCategory",
    "ProductImage",
    "Cart",
    "CartItem",
    "Review",
  ],
  "Checkout & Orders": ["Order", "SellerOrder", "OrderItem", "Payment", "Fulfillment"],
  "Finance & Operations": [
    "FinancialTransaction",
    "CommissionPlan",
    "StoreCommission",
    "InventoryLedger",
    "AuditLog",
    "Notification",
  ],
  "Urban Agriculture Data": [
    "AgriculturalDataSource",
    "UrbanFarmer",
    "FarmingAssociation",
    "FarmingAssociationMember",
    "FarmingSite",
    "FarmingSiteFarmer",
    "Crop",
    "CultivationRecord",
    "HarvestRecord",
    "SeasonalCropCalendar",
    "MarketPriceObservation",
    "CropAvailabilityObservation",
    "SupplyReport",
    "AgriculturalSaleRecord",
    "AgriculturalStatistic",
  ],
  Localization: ["TranslationOverride"],
};

const groupColors = {
  "Identity & Access": { fill: "#eef4ff", stroke: "#4f6fad" },
  "Geography & Service Areas": { fill: "#edf8f3", stroke: "#2e8064" },
  "Marketplace Catalog": { fill: "#fff7e8", stroke: "#b87918" },
  "Checkout & Orders": { fill: "#f2efff", stroke: "#7257ba" },
  "Finance & Operations": { fill: "#fdf0f2", stroke: "#ba4f63" },
  "Urban Agriculture Data": { fill: "#f1f7e9", stroke: "#688d2e" },
  Localization: { fill: "#f5f5f5", stroke: "#777777" },
};

const groupLayout = {
  "Identity & Access": { x: 60, y: 100, cols: 1 },
  "Geography & Service Areas": { x: 60, y: 760, cols: 1 },
  "Marketplace Catalog": { x: 430, y: 100, cols: 2 },
  "Checkout & Orders": { x: 1050, y: 100, cols: 1 },
  "Finance & Operations": { x: 1400, y: 100, cols: 1 },
  "Urban Agriculture Data": { x: 430, y: 900, cols: 3 },
  Localization: { x: 1400, y: 780, cols: 1 },
};

const importantFields = new Set([
  "id",
  "userId",
  "sellerProfileId",
  "storeId",
  "barangayId",
  "parentId",
  "productId",
  "categoryId",
  "cartId",
  "variantId",
  "buyerId",
  "shippingAddressId",
  "orderId",
  "sellerOrderId",
  "riderId",
  "commissionPlanId",
  "changedById",
  "actorId",
  "sourceId",
  "associationId",
  "farmerId",
  "siteId",
  "cropId",
  "cultivationId",
]);

const prismaScalars = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
]);

function modelGroup(name) {
  for (const [group, models] of Object.entries(groups)) {
    if (models.includes(name)) return group;
  }
  return "Other";
}

function parseSchema(schema) {
  const modelBlocks = [...schema.matchAll(/model\s+(\w+)\s+\{([\s\S]*?)\n\}/g)];
  const models = [];

  for (const [, name, body] of modelBlocks) {
    const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const model = {
      name,
      group: modelGroup(name),
      fields: [],
      pk: [],
      uniqueSets: [],
      relations: [],
    };

    for (const line of lines) {
      if (line.startsWith("@@id")) {
        model.pk = extractFieldList(line);
        continue;
      }
      if (line.startsWith("@@unique")) {
        model.uniqueSets.push(extractFieldList(line));
        continue;
      }
      if (line.startsWith("@@") || line.startsWith("//")) continue;

      const parts = line.split(/\s+/);
      const fieldName = parts[0];
      const type = parts[1];
      const isArray = type.endsWith("[]");
      const baseType = type.replace(/[?\[\]]/g, "");
      const isRelationObject =
        /^[A-Z]/.test(baseType) &&
        !prismaScalars.has(baseType) &&
        !baseType.startsWith("Unsupported");
      const field = {
        name: fieldName,
        type,
        isPk: line.includes("@id"),
        isUnique: line.includes("@unique"),
        isRelationObject,
        isArray,
        raw: line,
      };
      if (field.isPk) model.pk.push(fieldName);
      if (field.isUnique) model.uniqueSets.push([fieldName]);

      const relation = line.match(/@relation\((.*?)\)/);
      if (relation && !isArray) {
        const target = type.replace(/[?\[\]]/g, "");
        const fields = extractNamedList(relation[1], "fields");
        const references = extractNamedList(relation[1], "references");
        const onDelete = relation[1].match(/onDelete:\s*(\w+)/)?.[1] ?? "";
        if (fields.length) {
          model.relations.push({
            from: name,
            to: target,
            fields,
            references,
            optional: type.includes("?"),
            onDelete,
          });
        }
      }

      if (!field.isRelationObject) model.fields.push(field);
    }
    models.push(model);
  }

  const modelMap = new Map(models.map((model) => [model.name, model]));
  const relations = models.flatMap((model) => model.relations);
  return { models, modelMap, relations };
}

function extractFieldList(line) {
  return line.match(/\[([^\]]+)\]/)?.[1].split(",").map((field) => field.trim()) ?? [];
}

function extractNamedList(text, key) {
  const match = text.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`));
  return match ? match[1].split(",").map((field) => field.trim()) : [];
}

function fieldType(type) {
  return type.replace(/[?[\]]/g, "").replace(/Unsupported\("([^"]+)"\)/, "$1");
}

function isIdentifying(model, relation) {
  const key = relation.fields.join("|");
  const uniqueKeys = [model.pk, ...model.uniqueSets].map((set) => set.join("|"));
  return uniqueKeys.includes(key);
}

function relationLine(modelMap, relation) {
  const child = modelMap.get(relation.from);
  const parentCardinality = relation.optional ? "o|" : "||";
  const childCardinality = isIdentifying(child, relation) ? "o|" : "o{";
  const label = relation.fields.join("_");
  return `  ${relation.to} ${parentCardinality}--${childCardinality} ${relation.from} : "${label}"`;
}

function keyRows(model) {
  const relationFields = new Set(model.relations.flatMap((relation) => relation.fields));
  return model.fields
    .filter((field) => field.isPk || relationFields.has(field.name) || importantFields.has(field.name))
    .slice(0, 8);
}

function generateMermaid(parsed) {
  const lines = [
    "erDiagram",
    "  %% Agrifarm database ERD generated from apps/api/prisma/schema.prisma",
    "",
  ];

  for (const group of groupOrder) {
    lines.push(`  %% ${group}`);
    for (const name of groups[group]) {
      const model = parsed.modelMap.get(name);
      if (!model) continue;
      lines.push(`  ${model.name} {`);
      const relationFields = new Set(model.relations.flatMap((relation) => relation.fields));
      const rows = keyRows(model);
      for (const field of rows) {
        const markers = [];
        if (field.isPk || model.pk.includes(field.name)) markers.push("PK");
        if (relationFields.has(field.name)) markers.push("FK");
        if (field.isUnique && !markers.includes("PK")) markers.push("UK");
        lines.push(`    ${fieldType(field.type)} ${field.name}${markers.length ? ` ${markers.join(",")}` : ""}`);
      }
      lines.push("  }");
      lines.push("");
    }
  }

  lines.push("  %% Primary key to foreign key relationships");
  for (const relation of parsed.relations) lines.push(relationLine(parsed.modelMap, relation));
  lines.push("");
  return lines.join("\n");
}

function generateMarkdown(parsed) {
  const relationshipRows = parsed.relations
    .map((r) => `| ${r.to}.${r.references.join(", ")} | ${r.from}.${r.fields.join(", ")} | ${r.optional ? "Optional" : "Required"} | ${r.onDelete || "-"} |`)
    .join("\n");

  const groupRows = groupOrder
    .map((group) => {
      const names = groups[group].filter((name) => parsed.modelMap.has(name));
      return `| ${group} | ${names.join(", ")} |`;
    })
    .join("\n");

  return `# Agrifarm Database Architecture Diagram

Generated from \`apps/api/prisma/schema.prisma\`.

## Files

- \`agrifarm-database-erd.mmd\` is the editable Mermaid ERD source.
- \`agrifarm-database-erd.svg\` is the presentation-ready visual layout.

## Logical Groups

| Area | Tables |
| --- | --- |
${groupRows}

## Relationship Register

This register lists every primary key to foreign key relationship represented in the diagram.

| Parent key | Foreign key | Required? | On delete |
| --- | --- | --- | --- |
${relationshipRows}
`;
}

function svgText(x, y, text, attrs = "") {
  return `<text x="${x}" y="${y}" ${attrs}>${escapeXml(text)}</text>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tableLayout(parsed) {
  const boxes = new Map();
  const tableWidth = 270;
  const rowHeight = 18;
  const headerHeight = 34;
  const gapX = 36;
  const gapY = 22;
  const groupBounds = new Map();

  for (const group of groupOrder) {
    const config = groupLayout[group];
    const names = groups[group].filter((name) => parsed.modelMap.has(name));
    const cols = config.cols;
    const colHeights = Array(cols).fill(0);
    const placed = [];

    for (const name of names) {
      const model = parsed.modelMap.get(name);
      const rows = keyRows(model);
      const height = headerHeight + Math.max(rows.length, 1) * rowHeight + 16;
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = config.x + col * (tableWidth + gapX);
      const y = config.y + colHeights[col];
      colHeights[col] += height + gapY;
      const box = { x, y, width: tableWidth, height, rows, group };
      boxes.set(name, box);
      placed.push(box);
    }

    const maxX = Math.max(...placed.map((box) => box.x + box.width), config.x + tableWidth);
    const maxY = Math.max(...placed.map((box) => box.y + box.height), config.y + 80);
    groupBounds.set(group, {
      x: config.x - 24,
      y: config.y - 58,
      width: maxX - config.x + 48,
      height: maxY - config.y + 86,
    });
  }

  return { boxes, groupBounds };
}

function port(box, toward) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const tx = toward.x + toward.width / 2;
  const ty = toward.y + toward.height / 2;
  if (Math.abs(tx - cx) > Math.abs(ty - cy)) {
    return tx > cx
      ? { x: box.x + box.width, y: cy }
      : { x: box.x, y: cy };
  }
  return ty > cy
    ? { x: cx, y: box.y + box.height }
    : { x: cx, y: box.y };
}

function generateSvg(parsed) {
  const { boxes, groupBounds } = tableLayout(parsed);
  const width = 1720;
  const height = 2220;
  const lineColors = ["#607d8b", "#7e57c2", "#2e7d62", "#b26a00", "#9c3d52", "#556b2f"];
  const lineParts = [];

  parsed.relations.forEach((relation, index) => {
    const child = boxes.get(relation.from);
    const parent = boxes.get(relation.to);
    if (!child || !parent) return;
    const start = port(parent, child);
    const end = port(child, parent);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const color = lineColors[index % lineColors.length];
    const pathData = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
    lineParts.push(`<path d="${pathData}" fill="none" stroke="${color}" stroke-width="1.35" stroke-opacity="0.48" marker-end="url(#arrow)" />`);
    if (index % 2 === 0) {
      lineParts.push(svgText(midX + 4, midY - 4, relation.fields.join(","), `class="edge-label"`));
    }
  });

  const groupParts = [];
  for (const [group, bounds] of groupBounds.entries()) {
    const color = groupColors[group] ?? { fill: "#f5f5f5", stroke: "#777777" };
    groupParts.push(`<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="10" fill="${color.fill}" stroke="${color.stroke}" stroke-width="1.5" opacity="0.72" />`);
    groupParts.push(svgText(bounds.x + 18, bounds.y + 34, group, `class="group-title"`));
  }

  const tableParts = [];
  for (const [name, box] of boxes.entries()) {
    const color = groupColors[box.group] ?? { fill: "#f5f5f5", stroke: "#777777" };
    tableParts.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="7" fill="#ffffff" stroke="${color.stroke}" stroke-width="1.4" filter="url(#shadow)" />`);
    tableParts.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="34" rx="7" fill="${color.stroke}" />`);
    tableParts.push(`<rect x="${box.x}" y="${box.y + 27}" width="${box.width}" height="7" fill="${color.stroke}" />`);
    tableParts.push(svgText(box.x + 14, box.y + 22, name, `class="table-title"`));
    const relationFields = new Set(parsed.modelMap.get(name).relations.flatMap((relation) => relation.fields));
    box.rows.forEach((field, idx) => {
      const y = box.y + 52 + idx * 18;
      const tags = [];
      const model = parsed.modelMap.get(name);
      if (field.isPk || model.pk.includes(field.name)) tags.push("PK");
      if (relationFields.has(field.name)) tags.push("FK");
      if (field.isUnique && !tags.includes("PK")) tags.push("UK");
      const label = `${tags.length ? `[${tags.join("|")}] ` : ""}${field.name}: ${fieldType(field.type)}`;
      tableParts.push(svgText(box.x + 14, y, label, `class="field"`));
    });
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Agrifarm Database Architecture ERD</title>
  <desc id="desc">Grouped database architecture diagram showing primary key to foreign key relationships generated from the Prisma schema.</desc>
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1f2937" flood-opacity="0.12"/>
    </filter>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="#607d8b" opacity="0.65"/>
    </marker>
    <style>
      .title { font: 700 28px Arial, sans-serif; fill: #1f2937; }
      .subtitle { font: 400 14px Arial, sans-serif; fill: #566274; }
      .group-title { font: 700 16px Arial, sans-serif; fill: #253042; letter-spacing: .2px; }
      .table-title { font: 700 15px Arial, sans-serif; fill: #ffffff; }
      .field { font: 400 12px Consolas, "SFMono-Regular", monospace; fill: #263238; }
      .edge-label { font: 400 10px Consolas, "SFMono-Regular", monospace; fill: #455a64; paint-order: stroke; stroke: #ffffff; stroke-width: 3px; }
      .legend { font: 400 12px Arial, sans-serif; fill: #45505f; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#fafbfc"/>
  ${svgText(60, 48, "Agrifarm Database Architecture ERD", `class="title"`)}
  ${svgText(60, 72, "Grouped by business domain. Table rows show key primary, foreign, and unique fields. Relationship lines represent every Prisma @relation field mapping.", `class="subtitle"`)}
  <g id="groups">${groupParts.join("\n")}</g>
  <g id="relationships">${lineParts.join("\n")}</g>
  <g id="tables">${tableParts.join("\n")}</g>
  <g id="legend">
    <rect x="60" y="${height - 76}" width="545" height="42" rx="7" fill="#ffffff" stroke="#d1d5db"/>
    ${svgText(78, height - 50, "[PK] primary key    [FK] foreign key    [UK] unique key    Arrow points to the dependent table", `class="legend"`)}
  </g>
</svg>
`;
}

const schema = fs.readFileSync(schemaPath, "utf8");
const parsed = parseSchema(schema);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "agrifarm-database-erd.mmd"), generateMermaid(parsed));
fs.writeFileSync(path.join(outDir, "agrifarm-database-architecture.md"), generateMarkdown(parsed));
fs.writeFileSync(path.join(outDir, "agrifarm-database-erd.svg"), generateSvg(parsed));

console.log(`Generated ${parsed.models.length} tables and ${parsed.relations.length} relationships in ${path.relative(root, outDir)}`);
