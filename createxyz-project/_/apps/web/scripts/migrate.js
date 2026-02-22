/**
 * Run this script to create all required database tables.
 * Uses Pool + WebSocket instead of neon() HTTP driver for better compatibility.
 * Usage: node --env-file=.env scripts/migrate.js
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Make sure to run: node --env-file=.env scripts/migrate.js');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const schema = `
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  access_token TEXT,
  expires_at BIGINT,
  refresh_token TEXT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  password TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

try {
  console.log('🔄 Connecting to database...');
  const client = await pool.connect();
  console.log('✅ Connected! Running migration...');
  await client.query(schema);
  client.release();
  await pool.end();
  console.log('✅ All tables created successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  if (err.cause) console.error('   Cause:', err.cause.message);
  process.exit(1);
}
