import fs from 'fs';
import path from 'path';

// This script reads the seed-data.json file and sends it to the /api/ingest endpoint

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Read seed data
    const seedDataPath = path.join(process.cwd(), 'data', 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    console.log(`📊 Loaded seed data:`);
    console.log(`   - ${seedData.chains.length} chains`);
    console.log(`   - ${seedData.tokens.length} tokens\n`);

    // Determine the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const ingestUrl = `${apiUrl}/api/ingest`;

    console.log(`🌐 Sending data to ${ingestUrl}...\n`);

    // Send data to ingest endpoint
    const response = await fetch(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    console.log('✅ Database seeded successfully!\n');
    console.log('📈 Results:');
    console.log(`   - Inserted: ${result.inserted} tokens`);
    console.log(`   - Updated: ${result.updated} tokens`);
    console.log(`   - Families created/updated: ${result.families.length}`);
    console.log('\n📦 Families:');
    result.families.forEach((familyId: string, index: number) => {
      console.log(`   ${index + 1}. ${familyId.substring(0, 8)}...`);
    });

    console.log('\n✨ Seed complete!\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
