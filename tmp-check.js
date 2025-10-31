const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const counts = {
      users: await prisma.user.count(),
      admins: await prisma.user.count({ where: { role: 'ADMIN' } }),
    };
    console.log(JSON.stringify(counts, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
