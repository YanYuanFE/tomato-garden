/**
 * IPFS Configuration
 */

export const IPFS_CONFIG = {
  // Primary gateway
  gateway: 'azure-judicial-grasshopper-821.mypinata.cloud',
  
  // Fallback gateways
  fallbackGateways: [
    'ipfs.io',
    'gateway.pinata.cloud',
    'cloudflare-ipfs.com',
    'ipfs.infura.io'
  ],
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // Cache duration in milliseconds (24 hours)
  cacheDuration: 24 * 60 * 60 * 1000
};

/**
 * Get the primary IPFS gateway URL
 */
export function getPrimaryGateway(): string {
  return `https://${IPFS_CONFIG.gateway}`;
}

/**
 * Get all available gateway URLs
 */
export function getAllGateways(): string[] {
  return [IPFS_CONFIG.gateway, ...IPFS_CONFIG.fallbackGateways].map(
    gateway => `https://${gateway}`
  );
}

/**
 * Convert IPFS hash to full HTTP URLs for all gateways
 */
export function ipfsHashToUrls(hash: string): string[] {
  return getAllGateways().map(gateway => `${gateway}/ipfs/${hash}`);
}