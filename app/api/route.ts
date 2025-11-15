import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Token Family Catalog API',
    version: '1.0.0',
    description: 'Multi-chain token directory API',
    endpoints: {
      tokens: {
        list: {
          method: 'GET',
          path: '/api/tokens',
          description: 'Get all tokens with optional filters',
          queryParams: {
            chain: 'Filter by blockchain (e.g., ethereum, arbitrum)',
            symbol: 'Filter by token symbol (partial match)',
            type: 'Filter by token type (CANONICAL, WRAPPED, BRIDGED, DERIVATIVE, SYNTHETIC)',
            baseAsset: 'Filter by base asset',
            familyId: 'Filter by family ID',
            limit: 'Max results per page (default: 50, max: 100)',
            skip: 'Pagination offset (default: 0)',
          },
          example: '/api/tokens?chain=ethereum&type=WRAPPED&limit=10',
        },
        detail: {
          method: 'GET',
          path: '/api/tokens/:id',
          description: 'Get token details by ID including family and relationships',
          example: '/api/tokens/507f1f77bcf86cd799439011',
        },
      },
      families: {
        list: {
          method: 'GET',
          path: '/api/families',
          description: 'Get all token families',
          queryParams: {
            baseAsset: 'Filter by base asset',
            limit: 'Max results per page (default: 50)',
            skip: 'Pagination offset (default: 0)',
          },
          example: '/api/families',
        },
        detail: {
          method: 'GET',
          path: '/api/families/:id',
          description: 'Get family details by family ID including all tokens',
          example: '/api/families/cef1233f...',
        },
      },
      ingest: {
        method: 'POST',
        path: '/api/ingest',
        description: 'Bulk upload tokens and chains',
        requestBody: {
          chains: 'Array of chain objects (optional)',
          tokens: 'Array of token objects (required)',
        },
        example: '/api/ingest',
      },
    },
    documentation: 'See README.md for detailed API documentation',
  }, { status: 200 });
}
