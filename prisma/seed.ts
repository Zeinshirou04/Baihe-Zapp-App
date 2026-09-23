import { prisma } from '@/db/client';
import bcrypt from 'bcryptjs';

async function main() {
  // Ensure admin user exists
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPass = process.env.ADMIN_PASSWORD ?? 'password';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPass, 12);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash: hash, name: 'Admin' },
    });
    console.log('✅ admin user created');
  }

  // Existing seed data
  await prisma.series.createMany({
    data: [
      {
        slug: 'qian-qiu-ling',
        titleHanzi: '千秋令',
        titleLatin: 'Qian Qiu Ling',
        status: 'ONGOING',
        year: 2024,
      },
      {
        slug: 'lian-hua-xuan',
        titleHanzi: '莲花轩',
        titleLatin: 'Lian Hua Xuan',
        status: 'COMPLETED',
        year: 2023,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log('✅ seed complete'))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());