import { neon } from '@neondatabase/serverless';

function getDB() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('user:pass@host')) return null;
  try {
    return neon(url);
  } catch {
    return null;
  }
}

export async function query(sql: string, params: any[] = []) {
  const db = getDB();
  if (!db) return null;
  try {
    return await db(sql, params);
  } catch (e) {
    console.error('DB query error:', e);
    return null;
  }
}

export function hasDB(): boolean {
  return getDB() !== null;
}

export const MIGRATIONS = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  role_preference TEXT DEFAULT 'backer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID REFERENCES users(id),
  creator_wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  stage TEXT DEFAULT 'early',
  funding_goal_sol NUMERIC DEFAULT 10,
  current_backed_sol NUMERIC DEFAULT 0,
  cover_image_url TEXT,
  project_url TEXT,
  perks_summary TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  target_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tier_label TEXT DEFAULT 'Early Supporter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  supporter_user_id UUID REFERENCES users(id),
  supporter_wallet_address TEXT NOT NULL,
  builder_wallet_address TEXT NOT NULL,
  amount_sol NUMERIC NOT NULL,
  amount_lamports BIGINT NOT NULL,
  tx_signature TEXT,
  chain TEXT DEFAULT 'solana-devnet',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
`;
