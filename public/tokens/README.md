# Token Images

This directory contains the token logo images used throughout the application.

## Required Images

Place the following token images in this directory. Images should be PNG format with transparent backgrounds, ideally 200x200px or larger.

### Required Token Images:

1. **eth.png** - Ethereum logo
2. **weth.png** - Wrapped Ethereum logo
3. **steth.png** - Lido Staked Ethereum logo
4. **wsteth.png** - Wrapped Staked Ethereum logo
5. **cbeth.png** - Coinbase Wrapped Staked ETH logo
6. **reth.png** - Rocket Pool ETH logo
7. **wbtc.png** - Wrapped Bitcoin logo
8. **tbtc.png** - tBTC logo
9. **cbbtc.png** - Coinbase Wrapped BTC logo
10. **usdc.png** - USD Coin logo
11. **usdt.png** - Tether USD logo
12. **dai.png** - DAI Stablecoin logo
13. **sdai.png** - Savings DAI logo
14. **link.png** - Chainlink logo
15. **uni.png** - Uniswap logo
16. **aave.png** - Aave logo
17. **default.png** - Fallback image for tokens without specific logos

## Where to Get Token Images

### Option 1: TrustWallet Assets (Recommended)
TrustWallet maintains an open-source repository of token images:
https://github.com/trustwallet/assets

Navigate to `blockchains/ethereum/assets/[CONTRACT_ADDRESS]/logo.png`

### Option 2: CoinGecko
Download images from CoinGecko's API or website:
- Search for the token on https://www.coingecko.com
- Right-click the token image and save

### Option 3: Token Project Websites
- Visit the official website of each token project
- Download their official logo from press kits or brand assets

### Option 4: DefiLlama
- Visit https://defillama.com
- Search for the protocol/token
- Download the logo image

## Image Specifications

- **Format**: PNG with transparent background
- **Size**: Minimum 200x200px (recommend 400x400px for retina displays)
- **File naming**: Lowercase, e.g., `eth.png`, `usdc.png`
- **Transparency**: Required for best appearance on dark backgrounds

## Example Download Commands

Using TrustWallet assets via curl:

```bash
# Ethereum
curl -o eth.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png

# WETH
curl -o weth.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png

# WBTC
curl -o wbtc.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png

# USDC
curl -o usdc.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png

# USDT
curl -o usdt.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png

# DAI
curl -o dai.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png

# LINK
curl -o link.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png

# UNI
curl -o uni.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png

# AAVE
curl -o aave.png https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png
```

For derivative tokens (stETH, wstETH, cbETH, rETH, tBTC, cbBTC, sDAI), visit the respective protocol websites:
- Lido (stETH, wstETH): https://lido.fi
- Coinbase (cbETH, cbBTC): https://www.coinbase.com
- Rocket Pool (rETH): https://rocketpool.net
- Threshold (tBTC): https://threshold.network
- MakerDAO (sDAI): https://makerdao.com

## After Adding Images

Once you've added all the token images:

1. Restart your development server if running
2. Clear your browser cache or hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Run the database seed script to populate the database:
   ```bash
   npm run seed
   ```

The images will automatically appear in the application wherever tokens are displayed.
