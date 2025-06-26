import React from 'react';
import { useNFTImage } from '@/hooks/useNFTImage';
import { Loader2 } from 'lucide-react';

interface NFTImageProps {
  tokenUri?: string;
  fallbackEmoji?: string;
  alt?: string;
  className?: string;
  showLoader?: boolean;
}

export const NFTImage: React.FC<NFTImageProps> = ({
  tokenUri,
  fallbackEmoji = '🍅',
  alt = 'NFT Image',
  className = 'w-16 h-16 object-cover rounded',
  showLoader = true
}) => {
  const { imageUrl, loading, error } = useNFTImage(tokenUri);

  // Loading state
  if (loading && showLoader) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state or no image - show emoji fallback
  if (error || !imageUrl) {
    return <div className={`flex items-center justify-center bg-gray-50 text-2xl ${className}`}>{fallbackEmoji}</div>;
  }

  // Success state - show actual NFT image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback to emoji if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement!.innerHTML = `<div class="flex items-center justify-center bg-gray-50 text-2xl ${className}">${fallbackEmoji}</div>`;
      }}
    />
  );
};

interface NFTCardImageProps extends NFTImageProps {
  name?: string;
  rarity?: string;
}

export const NFTCardImage: React.FC<NFTCardImageProps> = ({
  tokenUri,
  fallbackEmoji,
  name,
  className = 'w-full h-32 object-cover',
  ...props
}) => {
  const { metadata, loading } = useNFTImage(tokenUri);

  return (
    <div className="relative">
      <NFTImage
        tokenUri={tokenUri}
        fallbackEmoji={fallbackEmoji}
        alt={name || 'Tomato NFT'}
        className={className}
        {...props}
      />

      {/* Overlay with NFT info */}
      {metadata && (
        <div className="absolute top-2 right-2">
          <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">{metadata.name || name}</div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default NFTImage;
