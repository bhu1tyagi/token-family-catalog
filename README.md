# Token Family Catalog

A comprehensive multi-chain token directory that organizes tokens into families based on their underlying assets. Built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.

## Features

- **Token Family Grouping**: Automatically groups tokens by their base asset (e.g., all ETH variants)
- **Multi-Chain Support**: Track tokens across Ethereum, Arbitrum, Polygon, Optimism, Base, and BSC
- **Token Classification**: Categorizes tokens as Canonical, Wrapped, Bridged, Derivative, or Synthetic
- **Relationship Visualization**: Visual representation of how tokens relate within a family
- **Advanced Filtering**: Search and filter by symbol, chain, type, and base asset
- **RESTful API**: Full-featured API for token and family data
- **Responsive UI**: Clean, mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd token-family-catalog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/token-family-catalog
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/token-family-catalog
```

### 4. Start MongoDB (if running locally)

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Seed the Database

```bash
npm run seed
```

This will populate the database with ~37 tokens across 8 families and 6 chains.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
token-family-catalog/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ingest/              # POST /api/ingest
│   │   ├── tokens/              # GET /api/tokens
│   │   │   └── [id]/            # GET /api/tokens/:id
│   │   └── families/            # GET /api/families
│   │       └── [id]/            # GET /api/families/:id
│   ├── tokens/[id]/             # Token detail page
│   ├── families/                # Families list page
│   │   └── [id]/                # Family detail page
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/                         # Shared libraries
│   ├── mongodb.ts               # MongoDB connection
│   └── models/                  # Mongoose models
│       ├── Token.ts
│       ├── Family.ts
│       └── Chain.ts
├── data/
│   └── seed-data.json           # Seed data (37 tokens)
├── scripts/
│   └── seed-db.ts               # Database seeding script
├── docs/
│   └── architecture.md          # Architecture documentation
├── .env.local.example           # Environment variables template
├── package.json
└── README.md
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Get All Tokens

```bash
GET /api/tokens
```

**Query Parameters:**
- `chain` (optional): Filter by chain (e.g., `ethereum`, `arbitrum`)
- `symbol` (optional): Filter by symbol (case-insensitive, partial match)
- `type` (optional): Filter by type (`CANONICAL`, `WRAPPED`, `BRIDGED`, `DERIVATIVE`, `SYNTHETIC`)
- `baseAsset` (optional): Filter by base asset
- `familyId` (optional): Filter by family ID
- `limit` (optional): Max results (default: 50, max: 100)
- `skip` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl "http://localhost:3000/api/tokens?chain=ethereum&type=WRAPPED&limit=10"
```

**Response:**
```json
{
  "tokens": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "chain": "ethereum",
      "contractAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "decimals": 18,
      "baseAsset": "ETH",
      "type": "WRAPPED",
      "familyId": "cef1233f...",
      "familyName": "Ethereum Family",
      "metadata": {
        "isCanonical": false,
        "wrappingProtocol": "WETH9"
      }
    }
  ],
  "pagination": {
    "total": 37,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

#### 2. Get Token by ID

```bash
GET /api/tokens/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/tokens/507f1f77bcf86cd799439011"
```

**Response:**
```json
{
  "token": { /* token details */ },
  "family": {
    "familyId": "cef1233f...",
    "name": "Ethereum Family",
    "canonicalToken": { /* canonical token */ }
  },
  "relatedTokens": [ /* array of related tokens */ ],
  "groupedByType": {
    "CANONICAL": [ /* canonical tokens */ ],
    "WRAPPED": [ /* wrapped tokens */ ],
    "BRIDGED": [ /* bridged tokens */ ]
  },
  "groupedByChain": {
    "ethereum": [ /* tokens on ethereum */ ],
    "arbitrum": [ /* tokens on arbitrum */ ]
  },
  "stats": {
    "totalVariants": 8,
    "chains": 3,
    "types": 4
  }
}
```

#### 3. Get All Families

```bash
GET /api/families
```

**Query Parameters:**
- `baseAsset` (optional): Filter by base asset
- `limit` (optional): Max results (default: 50)
- `skip` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl "http://localhost:3000/api/families"
```

**Response:**
```json
{
  "families": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "familyId": "cef1233f...",
      "baseAsset": "ETH",
      "name": "Ethereum Family",
      "description": "All variants of Ethereum...",
      "totalVariants": 8,
      "chains": ["ethereum", "arbitrum", "polygon"],
      "canonicalToken": {
        "symbol": "ETH",
        "name": "Ether",
        "chain": "ethereum"
      }
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

#### 4. Get Family by ID

```bash
GET /api/families/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/families/cef1233f..."
```

**Response:**
```json
{
  "family": { /* family details */ },
  "tokens": [ /* all tokens in family */ ],
  "groupedByType": {
    "CANONICAL": [ /* canonical tokens */ ],
    "WRAPPED": [ /* wrapped tokens */ ]
  },
  "groupedByChain": {
    "ethereum": [ /* tokens */ ],
    "arbitrum": [ /* tokens */ ]
  },
  "graphData": {
    "nodes": [ /* graph nodes */ ],
    "edges": [ /* graph edges */ ]
  },
  "stats": {
    "totalTokens": 8,
    "byType": { "CANONICAL": 1, "WRAPPED": 2 },
    "byChain": { "ethereum": 5, "arbitrum": 3 },
    "chains": 2
  }
}
```

#### 5. Ingest Tokens (Bulk Upload)

```bash
POST /api/ingest
```

**Request Body:**
```json
{
  "chains": [
    {
      "chainId": "ethereum",
      "name": "Ethereum Mainnet",
      "nativeCurrency": "ETH"
    }
  ],
  "tokens": [
    {
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "chain": "ethereum",
      "contractAddress": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "decimals": 18,
      "baseAsset": "ETH",
      "type": "WRAPPED",
      "metadata": {
        "isCanonical": false,
        "wrappingProtocol": "WETH9"
      }
    }
  ]
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/ingest" \
  -H "Content-Type: application/json" \
  -d @data/seed-data.json
```

**Response:**
```json
{
  "success": true,
  "inserted": 25,
  "updated": 12,
  "families": ["cef1233f...", "a9b8c7d6..."],
  "message": "Successfully processed 37 tokens across 8 families"
}
```

## Token Types Explained

| Type | Description | Example |
|------|-------------|---------|
| **CANONICAL** | Original/native token on its home chain | ETH on Ethereum, USDC on Ethereum |
| **WRAPPED** | ERC-20 wrapper of native asset or BTC | WETH (wraps ETH), WBTC (wraps BTC) |
| **BRIDGED** | Token bridged to another chain | WETH on Arbitrum, USDC on Polygon |
| **DERIVATIVE** | Staking derivatives or yield-bearing | stETH, wstETH, rETH (staked ETH variants) |
| **SYNTHETIC** | Algorithmic/synthetic representations | sUSD, synthetic assets |

## Seed Data Overview

The seed data includes **37 tokens** across **8 families** and **6 chains**:

### Families
- **ETH Family** (8 tokens): ETH, WETH, stETH, wstETH, cbETH, rETH + bridged WETH
- **BTC Family** (5 tokens): WBTC, tBTC, cbBTC + bridged versions
- **USDC Family** (7 tokens): USDC on multiple chains + legacy USDC.e
- **USDT Family** (4 tokens): USDT across Ethereum, Arbitrum, Polygon, BSC
- **DAI Family** (4 tokens): DAI + sDAI derivative
- **LINK Family** (3 tokens): LINK on Ethereum, Arbitrum, Polygon
- **UNI Family** (3 tokens): UNI on Ethereum, Arbitrum, Polygon
- **AAVE Family** (3 tokens): AAVE on Ethereum, Arbitrum, Polygon

### Chains
- Ethereum Mainnet
- Arbitrum One
- Polygon PoS
- Optimism
- Base
- BNB Smart Chain

## Scripts

### Seed Database
```bash
npm run seed
```
Ingests all tokens and chains from `data/seed-data.json` into MongoDB.

### Development
```bash
npm run dev
```
Starts Next.js development server on `http://localhost:3000`.

### Build
```bash
npm run build
```
Creates production build.

### Start Production
```bash
npm run start
```
Starts production server (run `npm run build` first).

### Lint
```bash
npm run lint
```
Runs ESLint on the codebase.

## Architecture

The application uses a **family-based grouping algorithm** to organize tokens:

1. **Family ID Generation**: `familyId = SHA256(baseAsset)`
   - Deterministic and stable
   - Same base asset always produces same family ID

2. **Automatic Family Creation**: When tokens are ingested, families are automatically created/updated based on `baseAsset`

3. **Relationship Tracking**: Tokens are related through shared `familyId`
   - Canonical token identified as family "root"
   - Implicit relationships (no explicit edges stored)

For detailed architecture documentation, see [docs/architecture.md](./docs/architecture.md).

## Key Design Decisions

1. **Denormalization**: `familyId` stored in each token for fast lookups
2. **Hash-Based IDs**: SHA-256 ensures deterministic family IDs
3. **Implicit Relationships**: Related tokens share `familyId` (no edge collection)
4. **Type-Based Classification**: 5 token types cover all real-world cases

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `MONGODB_URI` environment variable
4. Deploy

### MongoDB Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `.env.local` or Vercel environment variables

## Troubleshooting

### Database Connection Issues

**Error**: `MongoServerError: Authentication failed`
- Check MongoDB URI in `.env.local`
- Ensure MongoDB is running (local) or credentials are correct (Atlas)

**Error**: `ECONNREFUSED 127.0.0.1:27017`
- Start MongoDB: `brew services start mongodb-community` (macOS)
- Or use MongoDB Atlas cloud database

### Seed Script Fails

**Error**: `fetch failed`
- Ensure dev server is running: `npm run dev`
- Check that `http://localhost:3000` is accessible

### Port Already in Use

**Error**: `Port 3000 is already in use`
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or production.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [docs/architecture.md](./docs/architecture.md) for technical details

---

Built with Next.js, MongoDB, and TypeScript.
