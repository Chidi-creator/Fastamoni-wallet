const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function manualSeed() {
  try {
    console.log('Connecting to database...');
    // Attempt to connect explicitly
    await prisma.$connect();
    console.log('Connected.');

    const email = 'test@example.com';
    console.log(`Checking for existing user with email: ${email}`);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('User already exists. Deleting to ensure fresh seed...');
      await prisma.paymentIntent.deleteMany({ where: { userId: existing.id } });
      await prisma.wallet.deleteMany({ where: { userId: existing.id } });
      await prisma.account.deleteMany({ where: { userId: existing.id } });
      await prisma.donation.deleteMany({ where: { OR: [{ donorId: existing.id }, { beneficiaryId: existing.id }] } });
      await prisma.user.delete({ where: { id: existing.id } });
      console.log('Existing user deleted.');
    }

    console.log('Creating new test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedPin = await bcrypt.hash('1234', 10);

    const user = await prisma.user.create({
      data: {
        firstname: 'Test',
        lastname: 'User',
        email: email,
        password: hashedPassword,
        pinHash: hashedPin,
        wallet: {
            create: {
                wallet_number: '1234567890',
                bank_name: 'Test Bank',
                bank_code: '001',
            }
        }
      },
      include: {
        wallet: true
      }
    });

    console.log('User created successfully:', JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('Seeding Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualSeed();
