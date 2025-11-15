# Token Family Catalog

A multi-chain token directory that organizes tokens into families based on their underlying assets. Visualize token relationships, explore cross-chain variants, and query token data with an AI-powered chat assistant.

## Features

- **Family Grouping**: Automatically groups tokens by base asset (ETH, WBTC, USDC, etc.)
- **Multi-Chain Support**: Ethereum, Arbitrum, Polygon, Optimism, Base, BSC
- **Token Types**: Canonical, Wrapped, Bridged, Derivative, Synthetic
- **Interactive Visualizations**: Bar charts, pie charts, and relationship graphs
- **AI Chat Assistant**: Ask questions about tokens and get instant answers (OpenAI-powered)
- **Advanced Filtering**: Search by symbol, chain, or type
- **RESTful API**: Query tokens and families programmatically

## Tech Stack

- Next.js 16, React 19, TypeScript
- MongoDB with Mongoose
- Recharts for data visualization
- OpenAI API for chat assistance
- Tailwind CSS 4

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd token-family-catalog
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials:
# MONGODB_URI=mongodb://localhost:27017/token-family-catalog
# OPENAI_API_KEY=your-openai-api-key (Optional)

# Seed database (37 tokens across 8 families)
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/                    # API routes
│   ├── ai/chat/           # AI chat endpoint
│   ├── tokens/            # Token CRUD
│   ├── families/          # Family CRUD
│   └── ingest/            # Bulk token import
├── components/            # React components
│   ├── AIChat.tsx         # AI chat widget
│   ├── FamilyTreeVisualization.tsx
│   └── TokenRelationshipGraph.tsx
├── tokens/[id]/          # Token detail pages
├── families/[id]/        # Family detail pages
└── page.tsx              # Homepage

lib/
├── mongodb.ts            # DB connection
└── models/               # Mongoose schemas
    ├── Token.ts
    ├── Family.ts
    └── Chain.ts

scripts/
├── seed-db.ts           # Seed database
├── clear-db.ts          # Clear database
└── download-token-images.sh
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/tokens` | List all tokens with filters (`chain`, `type`, `symbol`) |
| `GET /api/tokens/:id` | Get token details with family relationships |
| `GET /api/families` | List all token families |
| `GET /api/families/:id` | Get family details with visualization data |
| `POST /api/ingest` | Bulk import tokens and chains |
| `POST /api/ai/chat` | AI chat for token queries |

**Example:**
```bash
# Get all wrapped tokens on Ethereum
curl "http://localhost:3000/api/tokens?chain=ethereum&type=WRAPPED"

# Get family details
curl "http://localhost:3000/api/families/[familyId]"
```

## Token Types Explained

| Type | Description | Example |
|------|-------------|---------|
| **CANONICAL** | Original/native token on its home chain | ETH on Ethereum, USDC on Ethereum |
| **WRAPPED** | ERC-20 wrapper of native asset or BTC | WETH (wraps ETH), WBTC (wraps BTC) |
| **BRIDGED** | Token bridged to another chain | WETH on Arbitrum, USDC on Polygon |
| **DERIVATIVE** | Staking derivatives or yield-bearing | stETH, wstETH, rETH (staked ETH variants) |
| **SYNTHETIC** | Algorithmic/synthetic representations | sUSD, synthetic assets |

## Seed Data

**37 tokens** across **8 families** (ETH, BTC, USDC, USDT, DAI, LINK, UNI, AAVE) and **6 chains** (Ethereum, Arbitrum, Polygon, Optimism, Base, BSC)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |

## How It Works

Tokens are automatically grouped into families using **SHA-256 hash of the base asset**:
- `familyId = SHA256(baseAsset)`
- All ETH variants (WETH, stETH, etc.) share the same family ID
- Families are auto-created during token ingestion
- Relationships are visualized through interactive graphs

