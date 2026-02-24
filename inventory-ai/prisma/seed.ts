import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const adminHash = await hash("admin123", 10);
  const staffHash = await hash("staff123", 10);
  const viewerHash = await hash("viewer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      email: "staff@example.com",
      name: "Staff User",
      passwordHash: staffHash,
      role: "STAFF",
    },
  });
  await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      name: "Viewer User",
      passwordHash: viewerHash,
      role: "VIEWER",
    },
  });

  const count = await prisma.inventoryItem.count();
  if (count === 0) {
    await prisma.inventoryItem.createMany({
      data: [
        { name: "Widget A", quantity: 10, category: "Electronics", description: "Standard widget", status: "InStock" },
        { name: "Widget B", quantity: 3, category: "Electronics", description: "Premium widget", status: "LowStock" },
        { name: "Cable Pack", quantity: 0, category: "Accessories", description: "USB-C pack", status: "Ordered" },
      ],
    });
  }

  console.log("Seed done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
