import React from 'react';
import { NFTImage } from './NFTImage';

/**
 * Test component to verify IPFS image loading
 */
export const IPFSTest: React.FC = () => {
  const testTokenUri = "ipfs://bafybeiemaouyxb2lltopoahht44e6dqwcedclsw2u573yu45s3zdz3yf3u/normal.json";

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">IPFS NFT Image Test</h3>
      
      <div className="border-2 border-gray-300 p-4 rounded">
        <p className="text-sm text-gray-600 mb-2">Token URI: {testTokenUri}</p>
        
        <NFTImage
          tokenUri={testTokenUri}
          fallbackEmoji="🍅"
          alt="Test Tomato NFT"
          className="w-32 h-32 object-cover rounded border"
          showLoader={true}
        />
      </div>
      
      {/* Test with different sizes */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs mb-2">Small (64x64)</p>
          <NFTImage
            tokenUri={testTokenUri}
            fallbackEmoji="🍅"
            className="w-16 h-16 object-cover rounded"
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs mb-2">Medium (96x96)</p>
          <NFTImage
            tokenUri={testTokenUri}
            fallbackEmoji="🍅"
            className="w-24 h-24 object-cover rounded"
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs mb-2">Large (128x128)</p>
          <NFTImage
            tokenUri={testTokenUri}
            fallbackEmoji="🍅"
            className="w-32 h-32 object-cover rounded"
          />
        </div>
      </div>
    </div>
  );
};