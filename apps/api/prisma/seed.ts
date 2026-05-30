import { PaymentMethod, PrismaClient, StoreStatus, UserRole } from "@prisma/client";
import { pbkdf2Sync } from "crypto";

const prisma = new PrismaClient();

const pasigBarangays = [
  "Bagong Ilog",
  "Bagong Katipunan",
  "Bambang",
  "Buting",
  "Caniogan",
  "Dela Paz",
  "Kalawaan",
  "Kapasigan",
  "Kapitolyo",
  "Malinao",
  "Manggahan",
  "Maybunga",
  "Oranbo",
  "Palatiw",
  "Pinagbuhatan",
  "Pineda",
  "Rosario",
  "Sagad",
  "San Antonio",
  "San Joaquin",
  "San Jose",
  "San Miguel",
  "San Nicolas",
  "Santa Cruz",
  "Santa Lucia",
  "Santa Rosa",
  "Santo Tomas",
  "Santolan",
  "Sumilang",
  "Ugong"
];

const normalizeBarangay = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

const passwordHash = (password: string) => {
  const salt = "agrifarm_seed_salt";
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
};

async function main() {
  for (const name of pasigBarangays) {
    await prisma.barangay.upsert({
      where: { normalizedName: normalizeBarangay(name) },
      create: { name, normalizedName: normalizeBarangay(name) },
      update: { name, isActive: true }
    });
  }

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@agrifarm.local" },
    create: {
      email: "buyer@agrifarm.local",
      passwordHash: passwordHash("password123"),
      fullName: "Pasig Buyer",
      phone: "09170000000",
      role: UserRole.BUYER
    },
    update: {}
  });

  await prisma.user.upsert({
    where: { email: "admin@agrifarm.local" },
    create: {
      email: "admin@agrifarm.local",
      passwordHash: passwordHash("password123"),
      fullName: "Agrifarm Admin",
      phone: "09170000002",
      role: UserRole.ADMIN
    },
    update: { role: UserRole.ADMIN }
  });

  const kapitolyo = await prisma.barangay.findUniqueOrThrow({ where: { normalizedName: "kapitolyo" } });
  await prisma.address.upsert({
    where: { id_userId: { id: "seed-buyer-kapitolyo-address", userId: buyer.id } },
    create: {
      id: "seed-buyer-kapitolyo-address",
      userId: buyer.id,
      barangayId: kapitolyo.id,
      label: "Home",
      recipientName: buyer.fullName,
      phone: buyer.phone ?? "09170000000",
      street: "1 Market Street",
      barangay: kapitolyo.name,
      city: "Pasig",
      province: "Metro Manila",
      isDefault: true
    },
    update: { barangayId: kapitolyo.id, barangay: kapitolyo.name, isDefault: true }
  });

  const sellers = [
    {
      email: "rosario.farm@agrifarm.local",
      fullName: "Rosario Farm Seller",
      businessName: "Rosario Fresh Farm",
      storeName: "Rosario Fresh",
      slug: "rosario-fresh",
      areas: ["Kapitolyo", "San Antonio", "Rosario"],
      product: { name: "Tomato", slug: "tomato", sku: "ROS-TOM-KG", price: "72.00", stockOnHand: 80 }
    },
    {
      email: "pinagbuhatan.growers@agrifarm.local",
      fullName: "Pinagbuhatan Grower",
      businessName: "Pinagbuhatan Growers",
      storeName: "Pinagbuhatan Growers",
      slug: "pinagbuhatan-growers",
      areas: ["Kapitolyo", "Pineda", "Pinagbuhatan"],
      product: { name: "Eggplant", slug: "eggplant", sku: "PIN-EGG-KG", price: "64.00", stockOnHand: 70 }
    }
  ];

  for (const sellerSeed of sellers) {
    const user = await prisma.user.upsert({
      where: { email: sellerSeed.email },
      create: {
        email: sellerSeed.email,
        passwordHash: passwordHash("password123"),
        fullName: sellerSeed.fullName,
        role: UserRole.SELLER
      },
      update: { role: UserRole.SELLER }
    });

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, businessName: sellerSeed.businessName, verifiedAt: new Date() },
      update: { businessName: sellerSeed.businessName }
    });

    const store = await prisma.store.upsert({
      where: { slug: sellerSeed.slug },
      create: {
        sellerProfileId: profile.id,
        name: sellerSeed.storeName,
        slug: sellerSeed.slug,
        status: StoreStatus.ACTIVE
      },
      update: { sellerProfileId: profile.id, name: sellerSeed.storeName, status: StoreStatus.ACTIVE }
    });

    for (const areaName of sellerSeed.areas) {
      const barangay = await prisma.barangay.findUniqueOrThrow({ where: { normalizedName: normalizeBarangay(areaName) } });
      await prisma.storeServiceArea.upsert({
        where: { storeId_barangayId: { storeId: store.id, barangayId: barangay.id } },
        create: { storeId: store.id, barangayId: barangay.id, deliveryFee: "30.00" },
        update: { isActive: true, deliveryFee: "30.00" }
      });
    }

    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: sellerSeed.product.slug } },
      create: {
        storeId: store.id,
        name: sellerSeed.product.name,
        slug: sellerSeed.product.slug,
        status: "ACTIVE"
      },
      update: { name: sellerSeed.product.name, status: "ACTIVE" }
    });

    await prisma.productVariant.upsert({
      where: { storeId_sku: { storeId: store.id, sku: sellerSeed.product.sku } },
      create: {
        storeId: store.id,
        productId: product.id,
        name: "Regular",
        sku: sellerSeed.product.sku,
        price: sellerSeed.product.price,
        stockOnHand: sellerSeed.product.stockOnHand,
        inventoryLedger: {
          create: {
            reason: "INITIAL_STOCK",
            quantityDelta: sellerSeed.product.stockOnHand,
            quantityAfter: sellerSeed.product.stockOnHand,
            changedById: user.id
          }
        }
      },
      update: {
        productId: product.id,
        price: sellerSeed.product.price,
        stockOnHand: sellerSeed.product.stockOnHand,
        isActive: true
      }
    });
  }

  console.log(`Seeded ${pasigBarangays.length} Pasig barangays, sample sellers, stores, products, buyer, and admin.`);
  console.log(`Sample buyer/seller password: password123. Checkout payment method example: ${PaymentMethod.CASH_ON_DELIVERY}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
