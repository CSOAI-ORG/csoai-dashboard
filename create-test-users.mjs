import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

// Parse database URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.split('/')[1],
  ssl: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function generateTestData() {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🚀 Creating test users and credentials...\n');

    // Test users data
    const testUsers = [
      {
        name: 'Alice Chen',
        email: 'alice@coai.test',
        role: 'admin',
        tier: 'enterprise',
      },
      {
        name: 'Bob Williams',
        email: 'bob@coai.test',
        role: 'user',
        tier: 'enterprise',
      },
      {
        name: 'Carol Martinez',
        email: 'carol@coai.test',
        role: 'watchdog_analyst',
        tier: 'enterprise',
      },
    ];

    const credentials = [];

    // Create test users
    for (const user of testUsers) {
      const openId = `test-${crypto.randomBytes(16).toString('hex')}`;
      const stripeCustomerId = `test_cust_${crypto.randomBytes(8).toString('hex')}`;

      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, stripeCustomerId, subscriptionTier, subscriptionStatus, lastSignedIn) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          openId,
          user.name,
          user.email,
          'test',
          user.role,
          stripeCustomerId,
          user.tier,
          'active',
        ]
      );

      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      );

      const userId = userRows[0].id;

      // Create API key for this user
      const apiKey = `coai_${crypto.randomBytes(24).toString('hex')}`;
      const keyHash = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
      const keyPrefix = apiKey.substring(0, 10);

      await connection.execute(
        `INSERT INTO api_keys (userId, name, keyPrefix, keyHash, tier, permissions, rateLimit, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          `${user.name} Test Key`,
          keyPrefix,
          keyHash,
          'enterprise',
          JSON.stringify(['read', 'write', 'admin']),
          10000,
          true,
        ]
      );

      credentials.push({
        user: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        openId,
        apiKey,
        userId,
      });
    }

    // Create a master enterprise API key for testing
    const masterApiKey = `coai_master_${crypto.randomBytes(24).toString('hex')}`;
    const masterKeyHash = crypto
      .createHash('sha256')
      .update(masterApiKey)
      .digest('hex');
    const masterKeyPrefix = masterApiKey.substring(0, 10);

    await connection.execute(
      `INSERT INTO api_keys (userId, name, keyPrefix, keyHash, tier, permissions, rateLimit, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        credentials[0].userId,
        'Master Enterprise Test Key',
        masterKeyPrefix,
        masterKeyHash,
        'enterprise',
        JSON.stringify(['read', 'write', 'admin', 'billing']),
        50000,
        true,
      ]
    );

    // Display results
    console.log('✅ TEST USERS CREATED\n');
    console.log('═'.repeat(80));

    for (const cred of credentials) {
      console.log(`\n👤 ${cred.user}`);
      console.log(`   Email:  ${cred.email}`);
      console.log(`   Role:   ${cred.role}`);
      console.log(`   Tier:   ${cred.tier}`);
      console.log(`   OpenID: ${cred.openId}`);
      console.log(`   API Key: ${cred.apiKey}`);
    }

    console.log(`\n\n🔑 MASTER API KEY (Unlimited Access)`);
    console.log('═'.repeat(80));
    console.log(`API Key: ${masterApiKey}`);
    console.log(`Prefix:  ${masterKeyPrefix}`);
    console.log(`Permissions: read, write, admin, billing`);
    console.log(`Rate Limit: 50,000 requests/hour`);

    console.log(`\n\n📋 QUICK REFERENCE`);
    console.log('═'.repeat(80));
    console.log(`Login URL: https://coai-dash-k34vnbtb.manus.space/api/auth/login`);
    console.log(`API Base: https://coai-dash-k34vnbtb.manus.space/api`);
    console.log(`\nTest Emails (OAuth will auto-create accounts):`);
    for (const cred of credentials) {
      console.log(`  - ${cred.email}`);
    }

    console.log(`\n\n🧪 TESTING CHECKLIST`);
    console.log('═'.repeat(80));
    console.log('[ ] Login with each test user');
    console.log('[ ] Verify enterprise tier features are unlocked');
    console.log('[ ] Test API key authentication');
    console.log('[ ] Test master API key with all permissions');
    console.log('[ ] Verify dashboard and analytics');
    console.log('[ ] Test payment/billing features');
    console.log('[ ] Check admin panel access');

    console.log('\n✨ All test credentials ready for launch!\n');
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

generateTestData();
