import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("pg");

const root = process.cwd();
const outDir = path.join(root, "docs", "database");
const outFile = path.join(outDir, "agrifarm-live-database-erd.drawio");
const reportFile = path.join(outDir, "agrifarm-live-database-erd-report.md");
const envFile = path.join(root, "apps", "api", ".env");

const groups = [
  {
    name: "Identity & Access",
    color: "#eaf2ff",
    stroke: "#5377b8",
    tables: ["User", "RefreshToken", "SellerProfile", "Address"]
  },
  {
    name: "Geography & Service Areas",
    color: "#eaf7f0",
    stroke: "#3b8a68",
    tables: ["Barangay", "StoreServiceArea"]
  },
  {
    name: "Marketplace Catalog",
    color: "#fff5df",
    stroke: "#b67814",
    tables: ["Store", "Category", "Product", "ProductVariant", "ProductCategory", "ProductImage", "Cart", "CartItem", "Review"]
  },
  {
    name: "Checkout & Orders",
    color: "#f1edff",
    stroke: "#7659bd",
    tables: ["Order", "SellerOrder", "OrderItem", "Payment", "Fulfillment"]
  },
  {
    name: "Finance & Operations",
    color: "#fff0f3",
    stroke: "#bc5268",
    tables: ["FinancialTransaction", "CommissionPlan", "StoreCommission", "InventoryLedger", "AuditLog", "Notification"]
  },
  {
    name: "Urban Agriculture Data",
    color: "#f0f7e7",
    stroke: "#708f33",
    tables: [
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
      "AgriculturalStatistic"
    ]
  },
  {
    name: "Localization",
    color: "#f4f5f7",
    stroke: "#7a808a",
    tables: ["TranslationOverride"]
  },
  {
    name: "Prisma Metadata",
    color: "#f3f3f3",
    stroke: "#8c8c8c",
    tables: ["_prisma_migrations"]
  }
];

const coreTables = new Set(["User", "Store", "Product", "ProductVariant", "Order", "SellerOrder", "OrderItem", "Barangay", "UrbanFarmer", "FarmingSite", "Crop"]);
const joinTableNameHints = new Set(["ProductCategory", "FarmingAssociationMember", "FarmingSiteFarmer", "StoreServiceArea"]);

function readEnv() {
  const env = {};
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
  return env;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  const text = String(value);
  if (text.startsWith("{") && text.endsWith("}")) {
    const body = text.slice(1, -1);
    if (!body) return [];
    return body.split(",").map((item) => item.replace(/^"|"$/g, ""));
  }
  return [text];
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function id(prefix) {
  id.counter += 1;
  return `${prefix}${id.counter}`;
}
id.counter = 1;

function groupFor(tableName) {
  return groups.find((group) => group.tables.includes(tableName)) ?? {
    name: "Other",
    color: "#f8f8f8",
    stroke: "#777777",
    tables: []
  };
}

function columnType(column) {
  const base = column.udt_name?.startsWith("_") ? `${column.udt_name.slice(1)}[]` : column.data_type;
  if (column.character_maximum_length) return `${base}(${column.character_maximum_length})`;
  if (column.numeric_precision && column.numeric_scale !== null) return `${base}(${column.numeric_precision},${column.numeric_scale})`;
  return base;
}

function columnLabel(column, table) {
  const tags = [];
  if (table.pkColumns.has(column.column_name)) tags.push("PK");
  if (table.fkColumns.has(column.column_name)) tags.push("FK");
  if (table.uniqueColumns.has(column.column_name) && !table.pkColumns.has(column.column_name)) tags.push("UK");
  const nullable = column.is_nullable === "YES" ? "NULL" : "NOT NULL";
  const prefix = tags.length ? `[${tags.join("|")}] ` : "";
  return `${prefix}${column.column_name}: ${columnType(column)} ${nullable}`;
}

function classifyRelationship(fk, tables) {
  const child = tables.get(fk.table_name);
  const childColumns = new Set(fk.columns);
  const childPkMatch = child.pk.length === fk.columns.length && child.pk.every((col) => childColumns.has(col));
  const uniqueMatch = child.uniques.some((unique) => unique.length === fk.columns.length && unique.every((col) => childColumns.has(col)));
  const nullable = fk.nullable;
  const parentCardinality = nullable ? "0..1" : "1";
  const childCardinality = childPkMatch || uniqueMatch ? "0..1" : "0..N";
  return { parentCardinality, childCardinality, type: childCardinality === "0..1" ? "one-to-one" : "one-to-many" };
}

function isJoinTable(table, fks) {
  const outgoing = fks.filter((fk) => fk.table_name === table.name);
  if (joinTableNameHints.has(table.name) && outgoing.length >= 2) return true;
  if (outgoing.length < 2) return false;
  const fkCols = new Set(outgoing.flatMap((fk) => fk.columns));
  const nonKeyColumns = table.columns.filter((column) => {
    const name = column.column_name;
    return !fkCols.has(name) && !["createdAt", "updatedAt", "deletedAt"].includes(name);
  });
  return nonKeyColumns.length <= 2;
}

async function loadSchema() {
  const env = readEnv();
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    const tableRows = await client.query(`
        select c.relname as table_name, obj_description(c.oid) as comment
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
        order by c.relname
      `);
    const columnRows = await client.query(`
        select table_name, column_name, ordinal_position, is_nullable, data_type, udt_name,
          character_maximum_length, numeric_precision, numeric_scale, column_default
        from information_schema.columns
        where table_schema = 'public'
        order by table_name, ordinal_position
      `);
    const pkRows = await client.query(`
        select tc.table_name, kcu.column_name, kcu.ordinal_position
        from information_schema.table_constraints tc
        join information_schema.key_column_usage kcu
          on kcu.constraint_schema = tc.constraint_schema
         and kcu.constraint_name = tc.constraint_name
         and kcu.table_name = tc.table_name
        where tc.table_schema = 'public' and tc.constraint_type = 'PRIMARY KEY'
        order by tc.table_name, kcu.ordinal_position
      `);
    const uniqueRows = await client.query(`
        select
          idx.relname as constraint_name,
          tbl.relname as table_name,
          array_agg(att.attname order by key_cols.ord) as columns
        from pg_index ix
        join pg_class tbl on tbl.oid = ix.indrelid
        join pg_namespace ns on ns.oid = tbl.relnamespace
        join pg_class idx on idx.oid = ix.indexrelid
        join unnest(ix.indkey) with ordinality as key_cols(attnum, ord) on true
        join pg_attribute att
          on att.attrelid = tbl.oid
         and att.attnum = key_cols.attnum
        where ns.nspname = 'public'
          and ix.indisunique
          and not ix.indisprimary
        group by idx.relname, tbl.relname
        order by tbl.relname, idx.relname
      `);
    const fkRows = await client.query(`
        select
          con.conname as constraint_name,
          child.relname as table_name,
          parent.relname as foreign_table_name,
          case con.confdeltype
            when 'a' then 'NO ACTION'
            when 'r' then 'RESTRICT'
            when 'c' then 'CASCADE'
            when 'n' then 'SET NULL'
            when 'd' then 'SET DEFAULT'
          end as delete_rule,
          array_agg(child_att.attname order by key_cols.ord) as columns,
          array_agg(parent_att.attname order by key_cols.ord) as foreign_columns,
          bool_or(cols.is_nullable = 'YES') as nullable
        from pg_constraint con
        join pg_class child on child.oid = con.conrelid
        join pg_namespace child_ns on child_ns.oid = child.relnamespace
        join pg_class parent on parent.oid = con.confrelid
        join pg_namespace parent_ns on parent_ns.oid = parent.relnamespace
        join unnest(con.conkey) with ordinality as key_cols(attnum, ord) on true
        join pg_attribute child_att
          on child_att.attrelid = child.oid
         and child_att.attnum = key_cols.attnum
        join pg_attribute parent_att
          on parent_att.attrelid = parent.oid
         and parent_att.attnum = con.confkey[key_cols.ord]
        join information_schema.columns cols
          on cols.table_schema = child_ns.nspname
         and cols.table_name = child.relname
         and cols.column_name = child_att.attname
        where child_ns.nspname = 'public'
          and parent_ns.nspname = 'public'
          and con.contype = 'f'
        group by con.conname, child.relname, parent.relname, con.confdeltype
        order by child.relname, con.conname
      `);
    const indexRows = await client.query(`
        select schemaname, tablename, indexname, indexdef
        from pg_indexes
        where schemaname = 'public'
        order by tablename, indexname
      `);

    const tables = new Map();
    for (const row of tableRows.rows) {
      tables.set(row.table_name, {
        name: row.table_name,
        columns: [],
        pk: [],
        uniques: [],
        pkColumns: new Set(),
        fkColumns: new Set(),
        uniqueColumns: new Set(),
        indexes: []
      });
    }

    for (const column of columnRows.rows) {
      tables.get(column.table_name)?.columns.push(column);
    }
    for (const row of pkRows.rows) {
      const table = tables.get(row.table_name);
      if (!table) continue;
      table.pk.push(row.column_name);
      table.pkColumns.add(row.column_name);
    }
    for (const row of uniqueRows.rows) {
      const table = tables.get(row.table_name);
      if (!table) continue;
      const columns = asArray(row.columns);
      table.uniques.push(columns);
      for (const column of columns) table.uniqueColumns.add(column);
    }
    for (const row of fkRows.rows) {
      const table = tables.get(row.table_name);
      if (!table) continue;
      for (const column of asArray(row.columns)) table.fkColumns.add(column);
    }
    for (const row of indexRows.rows) {
      tables.get(row.tablename)?.indexes.push(row);
    }

    const fks = fkRows.rows.map((row) => ({
      name: row.constraint_name,
      table_name: row.table_name,
      foreign_table_name: row.foreign_table_name,
      columns: asArray(row.columns),
      foreign_columns: asArray(row.foreign_columns),
      delete_rule: row.delete_rule,
      nullable: row.nullable
    }));

    return { tables, fks };
  } finally {
    await client.end();
  }
}

function mxCell({ cellId, value = "", style = "", parent = "1", vertex = false, edge = false, source, target, geometry }) {
  const attrs = [`id="${esc(cellId)}"`];
  if (value) attrs.push(`value="${esc(value)}"`);
  if (style) attrs.push(`style="${esc(style)}"`);
  attrs.push(`parent="${esc(parent)}"`);
  if (vertex) attrs.push('vertex="1"');
  if (edge) attrs.push('edge="1"');
  if (source) attrs.push(`source="${esc(source)}"`);
  if (target) attrs.push(`target="${esc(target)}"`);
  return `<mxCell ${attrs.join(" ")}>${geometry ?? ""}</mxCell>`;
}

function geom(x, y, width, height, relative = false) {
  const attrs = relative ? 'relative="1" as="geometry"' : `x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"`;
  return `<mxGeometry ${attrs}/>`;
}

function diagramXml(name, cells, pageWidth = 2200, pageHeight = 1500) {
  return `<diagram id="${esc(id("diagram"))}" name="${esc(name)}">
<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" math="0" shadow="0">
<root>
<mxCell id="0"/>
<mxCell id="1" parent="0"/>
${cells.join("\n")}
</root>
</mxGraphModel>
</diagram>`;
}

function tableCell(table, x, y, width, group, options = {}) {
  const rowHeight = 22;
  const headerHeight = 34;
  const maxColumns = options.maxColumns ?? table.columns.length;
  const visibleColumns = table.columns.slice(0, maxColumns);
  const extra = table.columns.length - visibleColumns.length;
  const height = headerHeight + rowHeight * (visibleColumns.length + (extra > 0 ? 1 : 0)) + 12;
  const titlePrefix = coreTables.has(table.name) ? "★ " : "";
  const title = `${titlePrefix}${table.name}${isJoinTable(table, options.fks ?? []) ? "  «join»" : ""}`;
  const lines = [
    `<div style="font-weight:700;font-size:14px;color:#1f2937;margin-bottom:6px">${esc(title)}</div>`,
    ...visibleColumns.map((column) => {
      const label = columnLabel(column, table);
      const color = table.pkColumns.has(column.column_name) ? "#0f4f8f" : table.fkColumns.has(column.column_name) ? "#6b4aa1" : "#344054";
      return `<div style="font-family:Consolas,monospace;font-size:11px;color:${color};white-space:nowrap">${esc(label)}</div>`;
    })
  ];
  if (extra > 0) lines.push(`<div style="font-family:Consolas,monospace;font-size:11px;color:#667085">+ ${extra} more columns</div>`);
  const style = [
    "rounded=1",
    "whiteSpace=wrap",
    "html=1",
    "arcSize=6",
    "shadow=0",
    `fillColor=${coreTables.has(table.name) ? "#ffffff" : group.color}`,
    `strokeColor=${group.stroke}`,
    "strokeWidth=1.4",
    "spacing=10",
    "verticalAlign=top",
    "fontFamily=Inter,Arial"
  ].join(";");
  const cellId = options.cellId ?? `table:${table.name}`;
  return {
    id: cellId,
    xml: mxCell({ cellId, value: lines.join(""), style, vertex: true, geometry: geom(x, y, width, height) }),
    x,
    y,
    width,
    height
  };
}

function edgeCell(fk, sourceId, targetId, tables) {
  const rel = classifyRelationship(fk, tables);
  const value = `${fk.columns.join(", ")} → ${fk.foreign_columns.join(", ")} (${rel.parentCardinality}:${rel.childCardinality})`;
  const style = [
    "edgeStyle=orthogonalEdgeStyle",
    "rounded=1",
    "orthogonalLoop=1",
    "jettySize=40",
    "html=1",
    "endArrow=ERmany",
    "startArrow=ERone",
    "strokeWidth=1.2",
    "strokeColor=#667085",
    "fontSize=10",
    "fontColor=#475467",
    "labelBackgroundColor=#ffffff"
  ].join(";");
  return mxCell({
    cellId: id("edge"),
    value,
    style,
    edge: true,
    source: targetId,
    target: sourceId,
    geometry: geom(0, 0, 0, 0, true)
  });
}

function pageTitle(title, subtitle, width = 940) {
  return mxCell({
    cellId: id("title"),
    value: `<div style="font-size:26px;font-weight:800;color:#101828">${esc(title)}</div><div style="font-size:13px;color:#667085;margin-top:4px">${esc(subtitle)}</div>`,
    style: "rounded=0;whiteSpace=wrap;html=1;strokeColor=none;fillColor=none;fontFamily=Inter,Arial;verticalAlign=top;",
    vertex: true,
    geometry: geom(50, 30, width, 70)
  });
}

function legend(x, y) {
  return mxCell({
    cellId: id("legend"),
    value: "<b>Legend</b><br>[PK] Primary key&nbsp;&nbsp; [FK] Foreign key&nbsp;&nbsp; [UK] Unique key<br>★ Core table&nbsp;&nbsp; «join» Join/pivot table&nbsp;&nbsp; Relationship labels show FK columns and cardinality",
    style: "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d0d5dd;arcSize=6;fontFamily=Inter,Arial;fontSize=12;spacing=10;",
    vertex: true,
    geometry: geom(x, y, 760, 70)
  });
}

function overviewPage(tables, fks) {
  const cells = [pageTitle("Agrifarm Live Database ERD - Overview", "High-level module map generated from the current public database schema.")];
  const layout = [
    ["Identity & Access", 70, 150],
    ["Geography & Service Areas", 70, 430],
    ["Marketplace Catalog", 430, 150],
    ["Checkout & Orders", 790, 150],
    ["Finance & Operations", 1150, 150],
    ["Urban Agriculture Data", 430, 520],
    ["Localization", 1150, 520],
    ["Prisma Metadata", 1510, 520]
  ];
  const groupCells = new Map();
  for (const [name, x, y] of layout) {
    const group = groups.find((candidate) => candidate.name === name);
    const present = group.tables.filter((tableName) => tables.has(tableName));
    const cellId = `module:${name}`;
    groupCells.set(name, cellId);
    cells.push(mxCell({
      cellId,
      value: `<div style="font-size:16px;font-weight:800;color:#1f2937">${esc(name)}</div><div style="font-size:12px;color:#475467;margin-top:8px">${esc(present.join(", "))}</div>`,
      style: `rounded=1;whiteSpace=wrap;html=1;fillColor=${group.color};strokeColor=${group.stroke};strokeWidth=1.5;arcSize=8;fontFamily=Inter,Arial;spacing=14;verticalAlign=top;`,
      vertex: true,
      geometry: geom(x, y, 300, name === "Urban Agriculture Data" ? 220 : 210)
    }));
  }
  const moduleEdges = new Map();
  for (const fk of fks) {
    const fromGroup = groupFor(fk.table_name).name;
    const toGroup = groupFor(fk.foreign_table_name).name;
    if (fromGroup === toGroup || !groupCells.has(fromGroup) || !groupCells.has(toGroup)) continue;
    const key = `${toGroup}->${fromGroup}`;
    moduleEdges.set(key, { fromGroup, toGroup, count: (moduleEdges.get(key)?.count ?? 0) + 1 });
  }
  for (const edge of moduleEdges.values()) {
    cells.push(mxCell({
      cellId: id("moduleEdge"),
      value: `${edge.count} FK${edge.count === 1 ? "" : "s"}`,
      style: "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;strokeColor=#667085;strokeWidth=1.4;fontSize=11;fontColor=#475467;labelBackgroundColor=#ffffff;",
      edge: true,
      source: groupCells.get(edge.toGroup),
      target: groupCells.get(edge.fromGroup),
      geometry: geom(0, 0, 0, 0, true)
    }));
  }
  cells.push(legend(70, 820));
  return diagramXml("Overview", cells, 1900, 1000);
}

function layoutTables(names, tables, startX, startY, cols, width, fks, maxColumns, options = {}) {
  const boxes = new Map();
  const cells = [];
  const gapX = options.gapX ?? 120;
  const gapY = options.gapY ?? 80;
  const colHeights = Array(cols).fill(startY);
  for (const name of names) {
    if (!tables.has(name)) continue;
    const table = tables.get(name);
    const group = groupFor(name);
    const col = colHeights.indexOf(Math.min(...colHeights));
    const x = startX + col * (width + gapX);
    const y = colHeights[col];
    const box = tableCell(table, x, y, width, group, { fks, maxColumns });
    colHeights[col] += box.height + gapY;
    boxes.set(name, box);
    cells.push(box.xml);
  }
  return { cells, boxes, height: Math.max(...colHeights), width: cols * width + (cols - 1) * gapX };
}

function fullPage(tables, fks) {
  const cells = [pageTitle("Agrifarm Live Database ERD - Full Schema", "All public tables, columns, primary keys, foreign keys, nullability, join tables, and relationship cardinality.")];
  const boxes = new Map();
  const regions = [
    ["Identity & Access", 90, 170, 1],
    ["Geography & Service Areas", 90, 1550, 1],
    ["Marketplace Catalog", 760, 170, 2],
    ["Checkout & Orders", 2080, 170, 1],
    ["Finance & Operations", 2740, 170, 1],
    ["Urban Agriculture Data", 3400, 170, 3],
    ["Localization", 5400, 170, 1],
    ["Prisma Metadata", 5400, 650, 1]
  ];
  for (const [groupName, x, y, cols] of regions) {
    const group = groups.find((candidate) => candidate.name === groupName);
    const names = group.tables.filter((name) => tables.has(name));
    const groupCellId = id("group");
    const groupWidth = cols * 400 + (cols - 1) * 240 + 80;
    const approxRows = Math.ceil(names.length / cols);
    const groupHeight = Math.max(340, approxRows * 460 + 180);
    cells.push(mxCell({
      cellId: groupCellId,
      value: `<b>${esc(groupName)}</b>`,
      style: `rounded=1;whiteSpace=wrap;html=1;fillColor=${group.color};strokeColor=${group.stroke};strokeWidth=1;arcSize=8;fontFamily=Inter,Arial;fontSize=15;fontStyle=1;verticalAlign=top;spacing=12;opacity=70;`,
      vertex: true,
      geometry: geom(x - 20, y - 48, groupWidth, groupHeight)
    }));
    const laidOut = layoutTables(names, tables, x, y, cols, 400, fks, 14, { gapX: 240, gapY: 160 });
    cells.push(...laidOut.cells);
    for (const [name, box] of laidOut.boxes.entries()) boxes.set(name, box);
  }
  for (const fk of fks) {
    const source = boxes.get(fk.table_name);
    const target = boxes.get(fk.foreign_table_name);
    if (source && target) cells.push(edgeCell(fk, source.id, target.id, tables));
  }
  cells.push(legend(90, 4280));
  return diagramXml("Full Schema", cells, 6200, 4500);
}

function modulePage(pageName, tableNames, tables, fks, cols = 2, options = {}) {
  const cells = [pageTitle(`Agrifarm Live Database ERD - ${pageName}`, "Module-level ERD with local tables plus directly connected external tables.")];
  const primary = tableNames.filter((name) => tables.has(name));
  const external = new Set();
  if (options.includeExternal === true) {
    for (const fk of fks) {
      if (primary.includes(fk.table_name) && !primary.includes(fk.foreign_table_name)) external.add(fk.foreign_table_name);
      if (primary.includes(fk.foreign_table_name) && !primary.includes(fk.table_name)) external.add(fk.table_name);
    }
  }
  const allNames = [...primary, ...[...external].sort()];
  const width = options.width ?? 410;
  const laidOut = layoutTables(allNames, tables, 100, 170, cols, width, fks, 99, {
    gapX: options.gapX ?? 240,
    gapY: options.gapY ?? 150
  });
  cells.push(...laidOut.cells);
  for (const fk of fks) {
    if (!laidOut.boxes.has(fk.table_name) || !laidOut.boxes.has(fk.foreign_table_name)) continue;
    cells.push(edgeCell(fk, laidOut.boxes.get(fk.table_name).id, laidOut.boxes.get(fk.foreign_table_name).id, tables));
  }
  cells.push(legend(100, laidOut.height + 70));
  return diagramXml(pageName, cells, Math.max(5200, laidOut.width + 300), Math.max(2600, laidOut.height + 260));
}

function relationshipSummary(fks, tables) {
  return fks.map((fk) => {
    const rel = classifyRelationship(fk, tables);
    return `| ${fk.foreign_table_name}.${fk.foreign_columns.join(", ")} | ${fk.table_name}.${fk.columns.join(", ")} | ${rel.type} | ${fk.nullable ? "Optional" : "Required"} | ${fk.delete_rule} |`;
  }).join("\n");
}

function groupSummary(tables, fks) {
  return groups.map((group) => {
    const names = group.tables.filter((name) => tables.has(name));
    if (!names.length) return "";
    const joinTables = names.filter((name) => isJoinTable(tables.get(name), fks));
    const joinText = joinTables.length ? ` Join/pivot tables: ${joinTables.join(", ")}.` : "";
    return `- **${group.name}**: ${names.join(", ")}.${joinText}`;
  }).filter(Boolean).join("\n");
}

function issueReport(tables, fks) {
  const fkByTableColumn = new Set(fks.flatMap((fk) => fk.columns.map((column) => `${fk.table_name}.${column}`)));
  const candidates = [];
  for (const table of tables.values()) {
    for (const column of table.columns) {
      const name = column.column_name;
      if (!/(Id|ID|_id)$/.test(name)) continue;
      if (table.pkColumns.has(name)) continue;
      if (fkByTableColumn.has(`${table.name}.${name}`)) continue;
      candidates.push(`${table.name}.${name}`);
    }
  }
  const tablesWithoutPk = [...tables.values()].filter((table) => table.pk.length === 0).map((table) => table.name);
  const lines = [];
  if (candidates.length) {
    lines.push(`- Possible relationship columns without declared foreign keys: ${candidates.join(", ")}.`);
  } else {
    lines.push("- No obvious `*Id` relationship columns were found without declared foreign keys.");
  }
  if (tablesWithoutPk.length) {
    lines.push(`- Tables without primary keys: ${tablesWithoutPk.join(", ")}.`);
  } else {
    lines.push("- Every inspected table has a declared primary key.");
  }
  lines.push("- `_prisma_migrations` is included as an actual database table, but it is Prisma metadata rather than a business-domain table.");
  return lines.join("\n");
}

function report(tables, fks) {
  const joinTables = [...tables.values()].filter((table) => isJoinTable(table, fks)).map((table) => table.name);
  return `# Agrifarm Live Database ERD Report

Generated from the current PostgreSQL \`public\` schema using \`information_schema\` and \`pg_catalog\`.

## Output

- Editable Draw.io XML: \`docs/database/agrifarm-live-database-erd.drawio\`

## Scope

- Tables inspected: ${tables.size}
- Foreign keys inspected: ${fks.length}
- Join/pivot tables detected: ${joinTables.join(", ") || "None"}

## Table Groups

${groupSummary(tables, fks)}

## Key Relationships

| Parent key | Foreign key | Relationship | Required? | On delete |
| --- | --- | --- | --- | --- |
${relationshipSummary(fks, tables)}

## Possible Relationship Issues

${issueReport(tables, fks)}
`;
}

async function main() {
  const { tables, fks } = await loadSchema();
  fs.mkdirSync(outDir, { recursive: true });
  const diagrams = [
    overviewPage(tables, fks),
    fullPage(tables, fks),
    modulePage("Identity Access", [
      "User",
      "RefreshToken",
      "SellerProfile",
      "Address",
      "Barangay"
    ], tables, fks, 3),
    modulePage("Marketplace Catalog", [
      "User",
      "Store",
      "StoreServiceArea",
      "Barangay",
      "Category",
      "Product",
      "ProductVariant",
      "ProductCategory",
      "ProductImage",
      "Cart",
      "CartItem",
      "Review"
    ], tables, fks, 4),
    modulePage("Checkout Orders", [
      "User",
      "Address",
      "Store",
      "ProductVariant",
      "Order",
      "SellerOrder",
      "OrderItem",
      "Payment",
      "Fulfillment"
    ], tables, fks, 4),
    modulePage("Finance Operations", [
      "User",
      "Store",
      "Order",
      "SellerOrder",
      "ProductVariant",
      "FinancialTransaction",
      "CommissionPlan",
      "StoreCommission",
      "InventoryLedger",
      "AuditLog",
      "Notification",
      "TranslationOverride",
      "_prisma_migrations"
    ], tables, fks, 4),
    modulePage("Urban Agriculture", [
      "Barangay",
      ...groups.find((group) => group.name === "Urban Agriculture Data").tables
    ], tables, fks, 4, { width: 410, gapX: 240, gapY: 160 })
  ];
  const xml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Codex" version="24.7.17" type="device">
${diagrams.join("\n")}
</mxfile>
`;
  fs.writeFileSync(outFile, xml, "utf8");
  fs.writeFileSync(reportFile, report(tables, fks), "utf8");
  console.log(`Generated ${path.relative(root, outFile)} with ${diagrams.length} pages`);
  console.log(`Generated ${path.relative(root, reportFile)}`);
  console.log(`Tables: ${tables.size}; foreign keys: ${fks.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
