import { useState, useEffect } from 'react';
import { fetchNFTMetadataWithRetry, getImageFromMetadata } from '@/services/utils';

interface UseNFTImageResult {
  imageUrl: string;
  metadata: any;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching and caching NFT images from IPFS
 */
export function useNFTImage(tokenUri: string | undefined): UseNFTImageResult {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenUri) {
      setImageUrl('');
      setMetadata(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if we have cached data
        const cacheKey = `nft_metadata_${tokenUri}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          const cached = JSON.parse(cachedData);
          if (isMounted) {
            setMetadata(cached);
            setImageUrl(getImageFromMetadata(cached));
            setLoading(false);
          }
          return;
        }

        // Fetch from IPFS
        const nftMetadata = await fetchNFTMetadataWithRetry(tokenUri);
        
        if (isMounted) {
          if (nftMetadata) {
            setMetadata(nftMetadata);
            const image = getImageFromMetadata(nftMetadata);
            setImageUrl(image);
            
            // Cache the metadata
            localStorage.setItem(cacheKey, JSON.stringify(nftMetadata));
          } else {
            setError('Failed to fetch NFT metadata');
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [tokenUri]);

  return { imageUrl, metadata, loading, error };
}

/**
 * Hook for preloading NFT images
 */
export function usePreloadNFTImages(tokenUris: string[]) {
  useEffect(() => {
    const preloadImages = async () => {
      const promises = tokenUris.map(async (uri) => {
        try {
          const metadata = await fetchNFTMetadataWithRetry(uri);
          if (metadata) {
            const imageUrl = getImageFromMetadata(metadata);
            if (imageUrl) {
              const img = new Image();
              img.src = imageUrl;
            }
          }
        } catch (error) {
          console.warn('Failed to preload image for', uri, error);
        }
      });
      
      await Promise.allSettled(promises);
    };

    if (tokenUris.length > 0) {
      preloadImages();
    }
  }, [tokenUris]);
}