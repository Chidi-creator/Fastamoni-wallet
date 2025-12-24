import prisma, { connectDatabase, disconnectDatabase } from '../../db/prisma';
import bcrypt from 'bcrypt';

async function loadTestSeed() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    
    // Cleanup existing test data
    console.log('Cleaning up old test data...');
    
    // Find test users first to clean up related data
    const testUsers = await prisma.user.findMany({ 
        where: { email: { startsWith: 'test' } },
        select: { id: true }
    });
    
    const testUserIds = testUsers.map(u => u.id);

    if (testUserIds.length > 0) {
        // Delete transactions for these users (as donor or beneficiary)
        // Find donations first
        const donations = await prisma.donation.findMany({
            where: {
                OR: [
                    { donorId: { in: testUserIds } },
                    { beneficiaryId: { in: testUserIds } }
                ]
            },
            select: { id: true }
        });
        const donationIds = donations.map(d => d.id);
        
        if (donationIds.length > 0) {
             await prisma.transaction.deleteMany({
                where: { donationId: { in: donationIds } }
             });
             
             await prisma.donation.deleteMany({
                where: { id: { in: donationIds } }
             });
        }
    }

    await prisma.wallet.deleteMany({ where: { user: { email: { startsWith: 'test' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test' } } });

    console.log('Creating test user...');
    // Use low rounds for seed user - checking env var just in case, but hardcoded 1 is fine for test user
    const rounds = process.env.LOAD_TEST_MODE === 'true' ? 1 : 1; 
    const hashedPassword = await bcrypt.hash('password123', rounds); 
    const hashedPin = await bcrypt.hash('1234', rounds);

    await prisma.user.create({
      data: {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        pinHash: hashedPin,
        wallet: {
            create: {
                wallet_number: '1234567890',
                bank_name: 'Test Bank',
                bank_code: '044',
            }
        }
      }
    });

    console.log('Load test seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

loadTestSeed();
