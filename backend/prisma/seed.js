const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  return;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
