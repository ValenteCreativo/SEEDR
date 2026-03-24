# 🌱 Seedr — Plant Early. Grow Together.

> The builder support platform where an AI agent verifies if builders actually deliver.

**Live:** https://seedr-three.vercel.app  
**Repo:** https://github.com/ValenteCreativo/SEEDR  
**Network:** Solana Devnet  
**Built at:** [Hackathon]

---

## The Problem

Every crowdfunding platform has the same flaw: builders make promises, receive funds, and accountability is a handshake. Kickstarter failed projects. Mirror posts forgotten. GoFundMe with no receipts. The pattern repeats.

Web3 made it permissionless — but not accountable.

## The Solution

Seedr is a **swipe-based builder support platform** with three layers of innovation:

1. **Discovery UX** — Tinder-style swiping to find early-stage builders on Solana
2. **On-chain backing** — Direct SOL transfer to builder wallet, confirmed on-chain, no escrow theater
3. **Agent-verified accountability** — SeedrAgent (powered by Venice LLM) evaluates milestone delivery and updates each builder's **Seed Score** in real time

---

## 15-Second Demo

```bash
# 1. Visit the live app
open https://seedr-three.vercel.app

# 2. Connect Phantom wallet (devnet)

# 3. Swipe → find a project → click card → Run Agent Evaluation
# SeedrAgent will call Venice AI and return:
# - Delivery Score (0–100)
# - Per-milestone verdict: ✅ delivered / ⚠️ partial / ❌ missed
# - Seed Score delta (+/-)
# - Recommendation: continue_backing | hold | withdraw

# 4. Back a project → 0.1 SOL → sign tx
# One tx, two instructions: 99.5% to builder + 0.5% Seedr protocol fee
```

---

## How It Works

### The Backing Flow

```
Backer → [SupportModal] → SystemProgram.transfer (2 instructions)
                              ├── 99.5% → Builder wallet
                              └── 0.5%  → Seedr treasury (GSit7oLxyt69vUX3Pbf5TbEanH23ZMkT9KwJNYjNn5dK)
                         → tx confirmed → Neon DB records support
                         → Profile "Backed" tab updated
```

### The Agent Evaluation Flow

```
Builder commits milestones (title + due_date + criteria + evidence)
                    ↓
SeedrAgent (POST /api/agent/evaluate)
                    ↓
Venice AI (llama-3.3-70b) analyzes:
  - Milestone criteria vs evidence provided
  - Funding velocity
  - Builder commitment pattern
                    ↓
Returns: { overall_score, seed_score_delta, milestones[], verdict, recommendation }
```

### The Messaging Layer

Backers can contact builders directly via **Waku** — decentralized, E2E encrypted P2P messaging. No Discord required, no intermediaries.

```
Backer → /messages?to=<builder_wallet> → Waku node
                                            ↓
                               E2E encrypted via /seedr/1/messages/proto
                                            ↓
                                       Builder's wallet
```

---

## Business Model

| Revenue Stream | Mechanism |
|---------------|-----------|
| **Protocol Fee** | 0.5% of every backing transaction → Seedr treasury (on-chain, atomic, enforced in `lib/solana.ts`) |
| **Agent Evaluation (future)** | Premium evaluations with deeper GitHub/on-chain analysis → SOL micropayment |
| **Seed Score API (future)** | B2B: other platforms query builder trust scores → subscription |
| **Featured Projects (future)** | Builders pay SOL to boost discovery position |

The 0.5% fee is **baked into the transaction** — two `SystemProgram.transfer` instructions in a single atomic tx. It is not a suggestion. It cannot be circumvented without modifying the frontend.

---

## Seed Score — Builder Trust Signal

Every builder has a **Seed Score** (0–100) maintained by SeedrAgent:

| Range | Tier | Meaning |
|-------|------|---------|
| 90+ | 🌳 Rooted | Consistently delivers — strong track record |
| 75–89 | 🌿 Growing | Good progress, some milestones pending |
| 60–74 | 🌱 Sprouting | Early stage, limited history |
| <60 | 🌰 Seed | New or underperforming |

Score changes every time SeedrAgent evaluates milestone delivery.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| On-chain | Solana Devnet, `@solana/web3.js`, SystemProgram (no custom program needed) |
| Wallet | `@solana/wallet-adapter-react` (Phantom, Backpack, etc.) |
| AI Agent | Venice AI (`llama-3.3-70b`) — private inference, zero data retention |
| Messaging | Waku (`@waku/sdk`) — decentralized E2E encrypted P2P |
| Database | Neon Postgres (serverless), raw SQL via `@neondatabase/serverless` |
| Deploy | Vercel |

---

## Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/projects` | List projects (DB + mock fallback) |
| `POST /api/projects/:id/support` | Record backing + upsert user |
| `POST /api/agent/evaluate` | SeedrAgent milestone evaluation via Venice |
| `GET /api/users/me?walletAddress=` | Profile data — backed, builder projects |
| `POST /api/db/migrate` | Init DB schema |
| `POST /api/db/migrate/v2` | Schema v2 (TEXT project_id, UNIQUE tx_signature) |

---

## Legal

Seedr is **not** a crowdfunding platform, investment platform, or securities offering.

- Backing a project on Seedr is an on-chain voluntary contribution
- No equity, no shares, no guaranteed returns
- Benefits are defined by each builder at their sole discretion
- The 0.5% protocol fee is a service fee for platform infrastructure

*Supporting a project ≠ investing in it.*

---

## Local Development

```bash
git clone https://github.com/ValenteCreativo/SEEDR
cd SEEDR
npm install

# .env.local
DATABASE_URL=your_neon_connection_string
VENICE_API_KEY=your_venice_key

npm run dev
# → http://localhost:3000

# Run DB migrations
curl -X POST http://localhost:3000/api/db/migrate
curl -X POST http://localhost:3000/api/db/migrate/v2
```

---

## Team

Built by **ValeCreativo** — México 🩵  
*From México, with love.*
