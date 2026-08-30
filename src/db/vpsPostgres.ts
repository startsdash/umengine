import { Pool, PoolClient } from 'pg';

const DEFAULT_DB_URL = process.env.DATABASE_URL || 'postgresql://umami_user:mhFdQz4elE8zG0IGCzcE@2.26.86.122:5432/umami_db?sslmode=disable';

function parseDbInfo(url: string) {
  try {
    const parsed = new URL(url.replace(/^postgresql:\/\//, 'http://'));
    return {
      host: parsed.hostname || '2.26.86.122',
      database: parsed.pathname.replace(/^\//, '') || 'umami_db'
    };
  } catch {
    return { host: '2.26.86.122', database: 'umami_db' };
  }
}

let pool: Pool | null = null;
let isInitialized = false;
let lastConnectionStatus: {
  connected: boolean;
  error?: string;
  lastChecked: string;
  host: string;
  database: string;
} = {
  connected: false,
  lastChecked: new Date().toISOString(),
  host: '2.26.86.122',
  database: 'umami_db'
};

export function getDbPool(): Pool | null {
  const connectionString = (process.env.DATABASE_URL || DEFAULT_DB_URL).trim();
  if (!connectionString) return null;

  const info = parseDbInfo(connectionString);
  lastConnectionStatus.host = info.host;
  lastConnectionStatus.database = info.database;

  if (!pool) {
    try {
      const isSslRequired = connectionString.includes('sslmode=require') || connectionString.includes('ssl=true');
      pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 7000,
        idleTimeoutMillis: 30000,
        max: 5,
        ssl: isSslRequired ? { rejectUnauthorized: false } : false
      });

      pool.on('error', (err) => {
        console.error('[VPS Postgres] Unexpected error on idle client:', err.message);
        lastConnectionStatus.connected = false;
        lastConnectionStatus.error = err.message;
        lastConnectionStatus.lastChecked = new Date().toISOString();
      });
    } catch (e: any) {
      console.error('[VPS Postgres] Failed to initialize Pool:', e.message);
      return null;
    }
  }

  return pool;
}

export async function checkDbConnection(): Promise<{
  connected: boolean;
  error?: string;
  lastChecked: string;
  host: string;
  database: string;
  tables?: string[];
}> {
  const p = getDbPool();
  if (!p) {
    return {
      connected: false,
      error: 'DATABASE_URL is not configured',
      lastChecked: new Date().toISOString(),
      host: '2.26.86.122',
      database: 'umami_db'
    };
  }

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    const res = await client.query('SELECT NOW() as now, current_database() as db, inet_server_addr() as host;');
    
    // Check existing tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);

    lastConnectionStatus = {
      connected: true,
      lastChecked: new Date().toISOString(),
      host: res.rows[0]?.host || '2.26.86.122',
      database: res.rows[0]?.db || 'umami_db'
    };

    return {
      ...lastConnectionStatus,
      tables
    };
  } catch (err: any) {
    console.warn('[VPS Postgres] Connection check failed:', err.message);
    lastConnectionStatus = {
      connected: false,
      error: err.message,
      lastChecked: new Date().toISOString(),
      host: '2.26.86.122',
      database: 'umami_db'
    };
    return lastConnectionStatus;
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function initDbSchema(): Promise<boolean> {
  if (isInitialized) return true;
  const p = getDbPool();
  if (!p) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    
    // 1. Table for Custom Sauces & User Formulations
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_sauces (
        id VARCHAR(128) PRIMARY KEY,
        title TEXT NOT NULL,
        chinese_title TEXT,
        pinyin TEXT,
        category VARCHAR(64) DEFAULT 'custom',
        summary TEXT,
        scientific_breakdown TEXT,
        ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
        steps JSONB NOT NULL DEFAULT '[]'::jsonb,
        target_proteins JSONB DEFAULT '[]'::jsonb,
        taste_profile JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Table for Pantry & Inventory State
    await client.query(`
      CREATE TABLE IF NOT EXISTS pantry_state (
        id VARCHAR(64) PRIMARY KEY,
        in_pantry BOOLEAN NOT NULL DEFAULT true,
        custom_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Table for Scraped Playground Articles
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_articles (
        id VARCHAR(128) PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        author TEXT,
        read_time_minutes INT DEFAULT 5,
        tags JSONB DEFAULT '[]'::jsonb,
        summary TEXT,
        markdown_content TEXT NOT NULL,
        key_biochemical_takeaways JSONB DEFAULT '[]'::jsonb,
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Table for Scraped Playground Recipes
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_recipes (
        id VARCHAR(128) PRIMARY KEY,
        title TEXT NOT NULL,
        chinese_title TEXT,
        pinyin TEXT,
        category VARCHAR(64) DEFAULT 'wanzhi_brown',
        summary TEXT,
        ingredients_text JSONB DEFAULT '[]'::jsonb,
        parsed_ingredients JSONB DEFAULT '[]'::jsonb,
        steps JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        synergy_estimate TEXT,
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Table for Translation Cache
    await client.query(`
      CREATE TABLE IF NOT EXISTS translations_cache (
        cache_key VARCHAR(256) PRIMARY KEY,
        item_type VARCHAR(32) NOT NULL,
        translated_payload JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for fast lookup
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_custom_sauces_created ON custom_sauces (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_saved_articles_created ON saved_articles (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_saved_recipes_created ON saved_recipes (created_at DESC);
    `);

    console.log('[VPS Postgres] All database tables initialized successfully!');
    isInitialized = true;
    return true;
  } catch (err: any) {
    console.error('[VPS Postgres] Schema migration error:', err.message);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}
