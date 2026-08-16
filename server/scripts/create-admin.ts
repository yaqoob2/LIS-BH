import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../src/generated/prisma/client';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !name || !password) {
    throw new Error(
      'INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME and INITIAL_ADMIN_PASSWORD are required',
    );
  }

  if (password.length < 8) {
    throw new Error('Initial admin password must be at least 8 characters');
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'INITIAL_ADMIN_CREATED',
        entityType: 'USER',
        entityId: admin.id,
      },
    });

    console.log('Initial ADMIN created successfully:');
    console.log(admin);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
