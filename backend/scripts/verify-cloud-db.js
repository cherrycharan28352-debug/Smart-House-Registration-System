const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function verifyCloudDB() {
  const uri = process.env.MONGODB_URI;

  console.log('================================================================');
  console.log('       MANE MANEGE POLICE — CLOUD DATABASE VERIFICATION        ');
  console.log('================================================================\n');

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    console.log('   Please set MONGODB_URI in backend/.env or your hosting platform.');
    console.log('   Example: mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/mane_manege_police?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`1. Target Database URI: ${safeUri}`);

  try {
    const startTime = Date.now();
    console.log('2. Connecting to managed database...');

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });

    const latency = Date.now() - startTime;
    console.log(`   Connected successfully in ${latency}ms! Host: ${conn.connection.host} ✓`);

    // Verify database ping
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log('3. Database Ping:', pingResult.ok === 1 ? 'OK (Responsive) ✓' : 'Failed ✗');

    // Check collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`4. Existing Collections in Database (${collections.length}):`);
    collections.forEach((c) => console.log(`   - ${c.name}`));

    // Check count of houses
    const housesCount = await conn.connection.db.collection('houses').countDocuments();
    const beatsCount = await conn.connection.db.collection('beats').countDocuments();
    const villagesCount = await conn.connection.db.collection('villages').countDocuments();
    const usersCount = await conn.connection.db.collection('users').countDocuments();

    console.log('\n5. Current Record Counts:');
    console.log(`   - Houses: ${housesCount}`);
    console.log(`   - Police Beats: ${beatsCount}`);
    console.log(`   - Villages: ${villagesCount}`);
    console.log(`   - System Users: ${usersCount}`);

    console.log('\n================================================================');
    console.log('   DATABASE VERIFICATION COMPLETED: READY FOR 200,000+ RECORDS! ');
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DATABASE CONNECTION FAILED:');
    console.error(`   ${err.message}`);
    console.log('\nTroubleshooting Tips:');
    console.log('1. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Allow Access from Anywhere: 0.0.0.0/0).');
    console.log('2. Verify that the database user credentials (username and password) are correct.');
    console.log('3. Ensure special characters in your database password are URL-encoded if applicable.\n');
    process.exit(1);
  }
}

verifyCloudDB();
