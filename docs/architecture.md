# Architecture Overview

This document explains the core design decisions behind the Token Family Catalog - how we organize multi-chain tokens into "families" and the tradeoffs we made along the way.

## Data Model

We use MongoDB with three main collections. The schema is defined using Mongoose models.

### Tokens Collection

Individual token instances across chains. Each token document includes:

**Core Fields:**
- `symbol` (string) - Token ticker, e.g. "WETH", "USDC"
- `name` (string) - Full name, e.g. "Wrapped Ether"
- `chain` (string) - Network identifier like "ethereum", "arbitrum", "polygon"
- `contractAddress` (string) - Smart contract address on that chain
- `decimals` (number) - Precision (usually 18 for ETH-like tokens, 6 for USDC)

**Family Grouping:**
- `baseAsset` (string) - What the token fundamentally represents (ETH, BTC, USDC)
- `familyId` (string) - SHA-256 hash of baseAsset, used to link related tokens
- `type` (enum) - One of: CANONICAL, WRAPPED, BRIDGED, DERIVATIVE, SYNTHETIC

**Additional Context:**
- `metadata` (object) - Optional fields like:
  - `isCanonical` (boolean) - Explicitly mark the "main" token
  - `bridgeProtocol` (string) - e.g., "Arbitrum Bridge", "Circle CCTP"
  - `wrappingProtocol` (string) - e.g., "WETH9", "Lido"

The token type is crucial for disambiguation. For example, WETH on Ethereum wraps native ETH (type: WRAPPED), but WETH on Arbitrum is bridged from Ethereum (type: BRIDGED) - same symbol, completely different use cases.

**Indexes:**
- Compound unique index on `(chain, contractAddress)` prevents duplicates
- Index on `familyId` for fast family lookups
- Indexes on `symbol`, `type`, `baseAsset` for filtering

### Families Collection

Aggregated view of all tokens sharing the same base asset:

- `familyId` (string) - Primary key, SHA-256 hash of baseAsset
- `baseAsset` (string) - Unique identifier like "ETH", "BTC", "USDC"
- `name` (string) - Human-readable name, e.g., "Ethereum Family"
- `description` (string) - Brief explanation
- `canonicalTokenId` (ObjectId) - Reference to the "main" token (usually the CANONICAL type)
- `totalVariants` (number) - Count of tokens in this family
- `chains` (array) - List of chains where this family exists

This is denormalized data - we're storing aggregated info that could technically be computed from the Tokens collection. But pre-computing it makes queries much faster.

### Chains Collection

Simple reference data for supported blockchains:
- `chainId` (string) - Unique identifier
- `name` (string) - Display name
- `nativeCurrency` (string) - Native token symbol

## How Family Grouping Works

The core idea is simple: tokens with the same underlying asset belong to the same family. All ETH variants (native ETH, WETH, stETH, bridged WETH on L2s) share `baseAsset: "ETH"` and get grouped together.

### Family ID Generation

To generate a consistent family ID, we hash the base asset:

```typescript
function generateFamilyId(baseAsset: string): string {
  return crypto
    .createHash('sha256')
    .update(baseAsset.toUpperCase())
    .digest('hex');
}
```

For example, `generateFamilyId("ETH")` always produces the same hash. This means:
- No auto-increment counters needed
- Works in distributed systems without coordination
- Re-running ingest won't create duplicate families
- IDs are stable across database resets

### Ingestion Flow

When tokens are ingested via the `/api/ingest` endpoint:

1. **Process each token:**
   - Compute `familyId = generateFamilyId(baseAsset)`
   - Upsert token (update if exists based on chain+address, insert if new)
   - Store familyId directly on the token document

2. **Update families:**
   - Group processed tokens by familyId
   - For each family group:
     - Find all tokens with that familyId in the database
     - Identify the canonical token (priority: `metadata.isCanonical === true`, fallback: `type === CANONICAL`)
     - Compute totalVariants count
     - Extract unique chain list
     - Upsert the Family document

This two-phase approach ensures consistency - first we save all the raw token data, then we update the aggregated family metadata.

## Querying and Relationships

We use implicit relationships rather than explicit graph edges. All tokens in a family are related through their shared `familyId`.

**Finding related tokens:**
```typescript
const relatedTokens = await Token.find({
  familyId: token.familyId,
  _id: { $ne: token._id }  // exclude self
});
```

**Grouping by type:**
```typescript
const wrapped = relatedTokens.filter(t => t.type === 'WRAPPED');
const bridged = relatedTokens.filter(t => t.type === 'BRIDGED');
const derivatives = relatedTokens.filter(t => t.type === 'DERIVATIVE');
```

**Grouping by chain:**
```typescript
const arbitrumTokens = relatedTokens.filter(t => t.chain === 'arbitrum');
const polygonTokens = relatedTokens.filter(t => t.chain === 'polygon');
```

The Token schema includes a `relationships` array for potential future use (explicit edges like "WETH wraps ETH"), but we're keeping it simple for now. The implicit approach handles 95% of use cases and is much easier to maintain.

## Reasoning and Tradeoffs

**Why denormalize familyId into tokens?**
MongoDB doesn't have joins, so storing familyId directly on each token means we can query "give me all tokens in family X" with a single index scan. The alternative would be querying by baseAsset, but then we'd need to handle edge cases where baseAsset naming might vary.

The downside is data duplication and harder updates if family logic changes (we'd need to update all tokens in a family). But for a read-heavy app this is the right call - queries are fast and simple.

**Why hash-based IDs instead of auto-increment?**
Determinism. The same baseAsset always generates the same familyId, which means:
- No duplicate families even if you ingest the same data twice
- Works in distributed setups without needing a central ID generator
- Can generate familyId client-side if needed
- IDs are stable across database resets/migrations

The tradeoff is IDs aren't human-readable (can't tell it's the ETH family from the hash), but that's fine for an internal identifier. The UI uses `baseAsset` and `name` for display anyway.

**Why denormalize family metadata?**
We store `totalVariants` and `chains` in the Family document rather than computing on-the-fly. This means every API call gets instant stats without running aggregation queries.

The cost is we have to keep this data in sync during writes. If a new token is added, we need to update both the Token document and the Family document. But read performance justifies the extra write complexity.

## Handling Edge Cases

**WETH across chains**
WETH is tricky because it means different things on different chains:
- Ethereum WETH: Wraps native ETH (type: WRAPPED, wrappingProtocol: "WETH9")
- Arbitrum WETH: Bridged from Ethereum (type: BRIDGED, bridgeProtocol: "Arbitrum Bridge")
- Polygon WETH: Also bridged (type: BRIDGED, bridgeProtocol: "Polygon PoS Bridge")

They all have `baseAsset: "ETH"` and belong to the ETH family, but the type field distinguishes their actual purpose. This is why we need both `type` and `metadata` - symbol alone isn't enough.

**USDC variants**
Native USDC and legacy USDC.e are both stablecoins backed by USD:
- Native USDC: Bridged via Circle's CCTP (symbol: "USDC", bridgeProtocol: "Circle CCTP")
- Legacy USDC: Bridged via older method (symbol: "USDC.e", bridgeProtocol: "Polygon PoS Bridge")

Both have `baseAsset: "USDC"` but different symbols. The symbol suffix (.e) indicates the bridge variant.

**Staking derivatives**
Tokens like stETH, rETH, wstETH all derive from ETH:
- All belong to ETH family (baseAsset: "ETH")
- Type: DERIVATIVE
- Differentiated by wrappingProtocol: "Lido", "Rocket Pool", etc.

**BTC has no canonical**
Since BTC isn't native to EVM chains, there's no truly canonical on-chain BTC. All versions (WBTC, tBTC, cbBTC) are either wrapped or bridged representations. We mark WBTC as canonical by convention since it's the most widely used, but it's technically a wrapped asset.

## Cross-Chain Assumptions

We make a few key assumptions about how cross-chain assets work:

1. **Base asset defines family** - A token's family comes from what it represents, not where it lives. WETH on Arbitrum is part of the ETH family.

2. **Canonical means original chain** - ETH on Ethereum is canonical. USDC on Ethereum (issued by Circle) is canonical. But that canonical token lives on a specific chain.

3. **Bridge neutrality** - We don't prefer one bridge over another. USDC via CCTP or Polygon PoS Bridge are both just BRIDGED type. The specific protocol goes in metadata if needed.

4. **Type hierarchy** - There's an implicit ordering: CANONICAL → WRAPPED → BRIDGED → DERIVATIVE. This informs the UI (canonical at center, others radiating out) but isn't enforced in code.

These assumptions work for most DeFi tokens but might need refinement for edge cases like multi-collateral stablecoins or cross-chain native tokens.
