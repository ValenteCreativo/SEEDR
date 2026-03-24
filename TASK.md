# SEEDR MVP — Full Build Task

You are a coding agent. Build the complete Seedr MVP in THIS repository.

## Repository
Already cloned at current directory. Git remote is already configured.
PAT is embedded in the remote URL.

## What to build
Full Next.js 15 + TypeScript + Tailwind + Solana Wallet Adapter + Neon Postgres MVP.

## Stack
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- @solana/web3.js (direct transfer - Option A)
- @solana/wallet-adapter-react + @solana/wallet-adapter-react-ui + @solana/wallet-adapter-wallets
- @coral-xyz/anchor (optional if time allows)
- Neon Postgres via `@neondatabase/serverless`
- Framer Motion for swipe animations
- NO Prisma/Drizzle overhead — use raw SQL via `@neondatabase/serverless`

## Critical: Use a placeholder DATABASE_URL in code
Since we don't have a real Neon DB, use env var `DATABASE_URL` everywhere.
Create a `.env.local.example` with instructions.
All DB operations should gracefully handle missing DB (return mock data if DB not available).

## FULL SPEC BELOW — implement everything described

### Core Mission
Seedr is a swipe-based platform where users discover early-stage projects and support builders on Solana.
- Builders publish projects, define milestones and perks, receive SOL
- Backers connect wallet, swipe through projects, support with SOL on devnet

### Non-negotiable MVP scope
1. Landing / app shell
2. Wallet connect (Phantom via Solana wallet adapter)
3. Role selection (builder/backer/both)
4. Swipe discovery for projects (Tinder-style)
5. Project detail screen/modal
6. Support action with on-chain SOL transfer (web3.js direct transfer)
7. Builder create project flow
8. Backer dashboard
9. Builder dashboard
10. Neon Postgres persistence (with graceful fallback to mock data)

### Database Schema (raw SQL, no ORM)
Run migrations via /api/db/migrate endpoint.

```sql
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
```

### File Structure to create
```
/app
  /page.tsx                          — Landing/hero
  /layout.tsx                        — Root layout with wallet provider
  /globals.css
  /(app)/discover/page.tsx           — Swipe discover
  /(app)/project/[id]/page.tsx       — Project detail
  /(app)/builder/page.tsx            — Builder dashboard + create form
  /(app)/backer/page.tsx             — Backer dashboard
  /api/auth/wallet/route.ts
  /api/projects/route.ts
  /api/projects/[id]/route.ts
  /api/projects/[id]/support/route.ts
  /api/users/me/route.ts
  /api/db/migrate/route.ts

/components
  /wallet/WalletProvider.tsx         — 'use client' wallet providers
  /wallet/ConnectWalletButton.tsx
  /seedr/ProjectCard.tsx
  /seedr/SwipeDeck.tsx
  /seedr/ProjectDetailModal.tsx
  /seedr/SupportModal.tsx
  /seedr/CreateProjectForm.tsx
  /seedr/BuilderDashboard.tsx
  /seedr/BackerDashboard.tsx
  /seedr/ProgressBar.tsx
  /seedr/MilestoneList.tsx
  /seedr/BenefitsList.tsx
  /ui/Navigation.tsx

/lib
  /db.ts                             — Neon DB client + query helpers
  /mock-data.ts                      — 6 realistic mock projects
  /solana.ts                         — SOL transfer helpers
  /utils.ts
```

### Design
Dark graphite background (#0d0d0f), seed green accent (#22c55e / green-500), glass cards with backdrop blur, rounded-2xl, warm light gray text. Premium feel, not generic SaaS.

Tailwind config: extend colors with seedGreen, use dark mode by default.

### Mock Projects (seed these in mock-data.ts)
1. **Waylearn** — "Interactive learning paths for Web3 builders" — EdTech — goal: 15 SOL
2. **LoopMarket** — "Circular economy marketplace for local communities" — Marketplace — goal: 25 SOL
3. **PulseNode** — "Open-source climate sensor network for urban areas" — Climate/IoT — goal: 20 SOL
4. **Frameshift** — "AI-powered creative brief tool for indie studios" — Creative/AI — goal: 12 SOL
5. **GlyphOS** — "Minimal OS interface for maker hardware" — Hardware — goal: 30 SOL
6. **Stackwise** — "Personal knowledge graph for developers" — Productivity — goal: 18 SOL

Each has 3 milestones and 3 supporter benefits.

### Support Flow (CRITICAL - must work end-to-end on devnet)
```typescript
// lib/solana.ts
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const DEVNET_RPC = 'https://api.devnet.solana.com';

export async function transferSOL(
  wallet: any, // wallet adapter wallet
  toAddress: string,
  amountSol: number
): Promise<string> {
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const toPubkey = new PublicKey(toAddress);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  
  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey,
      lamports,
    })
  );
  
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}
```

### API Routes

**POST /api/auth/wallet**
- Body: { walletAddress }
- Upsert user in DB, return user record
- Fallback: return mock user if no DB

**GET /api/projects**
- Return all active projects with milestones and benefits
- Fallback: return mock projects

**POST /api/projects**
- Body: { title, tagline, description, category, fundingGoalSol, milestones[], benefits[], creatorWalletAddress }
- Save to DB, return created project

**GET /api/projects/[id]**
- Return single project with milestones, benefits, supports

**POST /api/projects/[id]/support**
- Body: { walletAddress, amountSol, txSignature, amountLamports, builderWalletAddress }
- Save support, increment current_backed_sol

**GET /api/users/me?walletAddress=...**
- Return user + builderProjects + backedProjects

### Wallet Provider (CRITICAL - must be client component)
```typescript
// components/wallet/WalletProvider.tsx
'use client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export function SeedrWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Key UX Details
- Landing: hero with "Swipe ideas. Back builders." headline, connect wallet CTA
- Discover: card stack with framer-motion drag, left=skip, right=save, tap=open detail
- Project card shows: cover gradient, title, tagline, category badge, progress bar, SOL goal
- Project detail modal: full description, milestones checklist, benefits list, Support button
- Support modal: SOL amount input, "This is not equity" disclaimer, wallet sign CTA
- After support: show tx signature, confetti-like success state
- Navigation: minimal top bar with wallet button and role switch (Builder/Backer)
- Builder dashboard: list of created projects with total raised, button to create new
- Backer dashboard: list of supported projects with amounts, tx links

### Environment Variables (.env.local.example)
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### package.json dependencies
```json
{
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "@solana/web3.js": "^1.98.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@coral-xyz/anchor": "^0.30.1",
    "@neondatabase/serverless": "^0.10.4",
    "framer-motion": "^12.4.7",
    "lucide-react": "^0.511.0",
    "clsx": "^2.1.1",
    "uuid": "^11.1.0",
    "@types/uuid": "^10.0.0"
  }
}
```

## Important notes
1. All wallet adapter components MUST be in client components ('use client')
2. Server components can't use wallet hooks
3. Use dynamic imports for wallet-heavy components if needed
4. The swipe deck is a client component with framer-motion
5. API routes handle DB gracefully — if DATABASE_URL is missing, return mock data
6. After building, run: git add -A && git commit -m "feat: Seedr MVP - swipe-to-support platform on Solana" && git push origin main

## Final step
After all files are created and the build is verified (npm run build or at least npx tsc --noEmit passes), commit and push everything to the repo.

When completely finished, run this command to notify:
openclaw system event --text "Done: Seedr MVP built and pushed to GitHub — Next.js + Solana wallet + swipe UI + dashboards" --mode now
