#!/bin/bash

# Script to download token images from TrustWallet Assets repository
# Run this script from the project root directory

echo "📥 Downloading token images from TrustWallet Assets..."
echo ""

# Create tokens directory if it doesn't exist
mkdir -p public/tokens

# Base URL for TrustWallet assets
TRUSTWALLET_BASE="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum"

# Download base token images from TrustWallet
echo "Downloading base cryptocurrency logos..."

# Ethereum
curl -s -o public/tokens/eth.png "${TRUSTWALLET_BASE}/info/logo.png"
echo "✓ eth.png"

# WETH (Wrapped Ethereum)
curl -s -o public/tokens/weth.png "${TRUSTWALLET_BASE}/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
echo "✓ weth.png"

# WBTC (Wrapped Bitcoin)
curl -s -o public/tokens/wbtc.png "${TRUSTWALLET_BASE}/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
echo "✓ wbtc.png"

# USDC
curl -s -o public/tokens/usdc.png "${TRUSTWALLET_BASE}/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
echo "✓ usdc.png"

# USDT
curl -s -o public/tokens/usdt.png "${TRUSTWALLET_BASE}/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
echo "✓ usdt.png"

# DAI
curl -s -o public/tokens/dai.png "${TRUSTWALLET_BASE}/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
echo "✓ dai.png"

# LINK
curl -s -o public/tokens/link.png "${TRUSTWALLET_BASE}/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png"
echo "✓ link.png"

# UNI
curl -s -o public/tokens/uni.png "${TRUSTWALLET_BASE}/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png"
echo "✓ uni.png"

# AAVE
curl -s -o public/tokens/aave.png "${TRUSTWALLET_BASE}/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png"
echo "✓ aave.png"

echo ""
echo "Downloading derivative token logos..."

# stETH (Lido Staked ETH)
curl -s -o public/tokens/steth.png "${TRUSTWALLET_BASE}/assets/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84/logo.png"
echo "✓ steth.png"

# wstETH (Wrapped Staked ETH)
curl -s -o public/tokens/wsteth.png "${TRUSTWALLET_BASE}/assets/0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0/logo.png"
echo "✓ wsteth.png"

# cbETH (Coinbase Wrapped Staked ETH)
curl -s -o public/tokens/cbeth.png "${TRUSTWALLET_BASE}/assets/0xBe9895146f7AF43049ca1c1AE358B0541Ea49704/logo.png"
echo "✓ cbeth.png"

# rETH (Rocket Pool ETH)
curl -s -o public/tokens/reth.png "${TRUSTWALLET_BASE}/assets/0xae78736Cd615f374D3085123A210448E74Fc6393/logo.png"
echo "✓ reth.png"

# tBTC
curl -s -o public/tokens/tbtc.png "${TRUSTWALLET_BASE}/assets/0x18084fbA666a33d37592fA2633fD49a74DD93a88/logo.png"
echo "✓ tbtc.png"

# cbBTC (Coinbase Wrapped BTC)
curl -s -o public/tokens/cbbtc.png "${TRUSTWALLET_BASE}/assets/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf/logo.png"
echo "✓ cbbtc.png"

# sDAI (Savings DAI)
curl -s -o public/tokens/sdai.png "${TRUSTWALLET_BASE}/assets/0x83F20F44975D03b1b09e64809B757c47f942BEeA/logo.png"
echo "✓ sdai.png"

echo ""
echo "Creating default fallback image..."

# Create a simple default.png (using WETH as fallback if available, or copy eth.png)
if [ -f public/tokens/eth.png ]; then
  cp public/tokens/eth.png public/tokens/default.png
  echo "✓ default.png (using ETH logo as fallback)"
else
  echo "⚠ Could not create default.png - please add manually"
fi

echo ""
echo "✅ Token images downloaded successfully!"
echo ""
echo "Next steps:"
echo "1. Check public/tokens/ directory to verify all images"
echo "2. Run 'npm run seed' to populate the database with image URLs"
echo "3. Restart your development server"
echo ""
