import connectDB from '../lib/mongodb';
import Token from '../lib/models/Token';
import Family from '../lib/models/Family';

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...\n');

    await connectDB();

    const tokensDeleted = await Token.deleteMany({});
    console.log(`✓ Deleted ${tokensDeleted.deletedCount} tokens`);

    const familiesDeleted = await Family.deleteMany({});
    console.log(`✓ Deleted ${familiesDeleted.deletedCount} families`);

    console.log('\n✅ Database cleared successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clear failed:', error);
    process.exit(1);
  }
}

clearDatabase();
