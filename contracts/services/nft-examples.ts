/**
 * 获取用户已收获NFT数据的示例代码
 */

import { TomatoGardenService } from './TomatoGardenService';
import { Account, RpcProvider } from 'starknet';
import { TOMATO_TYPE_INFO, GROWTH_STAGE_INFO } from './types';

// 初始化服务
const gardenService = new TomatoGardenService('sepolia');

/**
 * 方案1：获取用户所有已收获的NFT
 */
export async function getUserHarvestedNFTs(userAddress: string) {
  try {
    console.log(`🔍 获取用户 ${userAddress} 的已收获NFT...`);
    
    const harvestedNFTs = await gardenService.getUserHarvestedNFTs(userAddress);
    
    console.log(`✅ 找到 ${harvestedNFTs.length} 个已收获的NFT:`);
    
    harvestedNFTs.forEach((nft, index) => {
      const typeInfo = TOMATO_TYPE_INFO[nft.metadata.tomato_type];
      console.log(`\n${index + 1}. 番茄NFT #${nft.id}`);
      console.log(`   类型: ${typeInfo.chineseName} ${typeInfo.emoji}`);
      console.log(`   稀有度: ${typeInfo.rarity}`);
      console.log(`   所有者: ${nft.owner}`);
      console.log(`   Token URI: ${nft.tokenUri}`);
      console.log(`   收获时间: ${new Date(nft.metadata.harvested_at * 1000).toLocaleString()}`);
      console.log(`   质押金额: ${nft.metadata.staked_amount} wei`);
    });
    
    return harvestedNFTs;
  } catch (error) {
    console.error('❌ 获取NFT失败:', error);
    return [];
  }
}

/**
 * 方案2：获取详细的NFT收藏信息
 */
export async function getUserNFTCollection(userAddress: string) {
  try {
    console.log(`🎨 获取用户 ${userAddress} 的NFT收藏详情...`);
    
    const collection = await gardenService.getUserNFTCollection(userAddress);
    
    console.log(`🏆 NFT收藏总数: ${collection.length}`);
    
    // 按稀有度分组
    const byRarity = collection.reduce((acc, nft) => {
      acc[nft.rarity] = (acc[nft.rarity] || []).concat(nft);
      return acc;
    }, {} as Record<string, any[]>);
    
    console.log('\n📊 按稀有度分布:');
    Object.entries(byRarity).forEach(([rarity, nfts]) => {
      console.log(`   ${rarity}: ${nfts.length} 个`);
    });
    
    // 显示详细信息
    console.log('\n🌟 收藏详情:');
    collection.forEach((nft, index) => {
      console.log(`\n${index + 1}. ${nft.type} #${nft.tokenId}`);
      console.log(`   稀有度: ${nft.rarity}`);
      console.log(`   收获时间: ${new Date(nft.harvestedAt * 1000).toLocaleString()}`);
      console.log(`   Token URI: ${nft.tokenUri}`);
    });
    
    return collection;
  } catch (error) {
    console.error('❌ 获取收藏失败:', error);
    return [];
  }
}

/**
 * 方案3：按类型获取NFT收藏
 */
export async function getUserNFTsByType(userAddress: string) {
  try {
    console.log(`📋 按类型获取用户 ${userAddress} 的NFT...`);
    
    const tomatoesByType = await gardenService.getUserTomatoesByType(userAddress);
    
    console.log('\n🌈 按类型分布:');
    
    for (const [type, tomatoes] of Object.entries(tomatoesByType)) {
      const harvestedTomatoes = tomatoes.filter(t => t.isHarvested);
      if (harvestedTomatoes.length > 0) {
        const typeInfo = TOMATO_TYPE_INFO[parseInt(type)];
        console.log(`\n${typeInfo.chineseName} ${typeInfo.emoji} (${harvestedTomatoes.length} 个):`);
        
        harvestedTomatoes.forEach((tomato, index) => {
          console.log(`   ${index + 1}. #${tomato.id} - 收获时间: ${new Date(tomato.metadata.harvested_at * 1000).toLocaleString()}`);
        });
      }
    }
    
    return tomatoesByType;
  } catch (error) {
    console.error('❌ 获取失败:', error);
    return {};
  }
}

/**
 * 方案4：获取NFT元数据和图片
 */
export async function getNFTWithMetadata(tokenId: string) {
  try {
    console.log(`🔍 获取NFT #${tokenId} 的详细信息...`);
    
    const tomatoInfo = await gardenService.getTomatoInfo(tokenId);
    
    if (!tomatoInfo.isHarvested) {
      console.log('❌ 此番茄尚未收获，没有NFT');
      return null;
    }
    
    console.log('✅ NFT信息:');
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   所有者: ${tomatoInfo.owner}`);
    console.log(`   Token URI: ${tomatoInfo.tokenUri}`);
    
    // 获取NFT元数据（如果tokenURI指向JSON）
    if (tomatoInfo.tokenUri && tomatoInfo.tokenUri.startsWith('http')) {
      try {
        const response = await fetch(tomatoInfo.tokenUri);
        const metadata = await response.json();
        
        console.log('\n🎨 NFT元数据:');
        console.log(`   名称: ${metadata.name || 'N/A'}`);
        console.log(`   描述: ${metadata.description || 'N/A'}`);
        console.log(`   图片: ${metadata.image || 'N/A'}`);
        
        if (metadata.attributes) {
          console.log('\n📋 属性:');
          metadata.attributes.forEach((attr: any) => {
            console.log(`   ${attr.trait_type}: ${attr.value}`);
          });
        }
        
        return {
          ...tomatoInfo,
          nftMetadata: metadata
        };
      } catch (metadataError) {
        console.warn('⚠️  无法获取NFT元数据:', metadataError);
      }
    }
    
    return tomatoInfo;
  } catch (error) {
    console.error('❌ 获取NFT信息失败:', error);
    return null;
  }
}

/**
 * 方案5：实时监听NFT铸造事件
 */
export async function listenToNFTMints(callback: (nftData: any) => void) {
  try {
    console.log('👂 开始监听NFT铸造事件...');
    
    // 监听合约事件
    await gardenService.listenToEvents(
      ['TomatoHarvested', 'Transfer'], // 监听收获和转移事件
      'latest', // 从最新区块开始
      async (event) => {
        if (event.keys && event.keys[0] === 'TomatoHarvested') {
          console.log('🎉 检测到新的NFT铸造!');
          
          // 解析事件数据
          const tomatoId = event.data[0];
          const owner = event.data[1];
          
          // 获取完整NFT信息
          const nftInfo = await gardenService.getTomatoInfo(tomatoId);
          
          console.log(`   番茄ID: ${tomatoId}`);
          console.log(`   所有者: ${owner}`);
          console.log(`   类型: ${TOMATO_TYPE_INFO[nftInfo.metadata.tomato_type].chineseName}`);
          
          // 回调处理
          callback({
            tokenId: tomatoId,
            owner,
            ...nftInfo
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ 监听事件失败:', error);
  }
}

/**
 * 使用示例
 */
export async function demonstrateNFTFetching() {
  // 示例用户地址
  const userAddress = '0x1234567890123456789012345678901234567890';
  
  console.log('🌱 Tomato Garden NFT 获取演示\n');
  
  // 方案1: 获取所有已收获的NFT
  await getUserHarvestedNFTs(userAddress);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 方案2: 获取详细收藏信息
  await getUserNFTCollection(userAddress);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 方案3: 按类型获取
  await getUserNFTsByType(userAddress);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 方案4: 获取特定NFT的详细信息
  await getNFTWithMetadata('1');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 方案5: 监听新的NFT铸造
  console.log('设置NFT铸造监听器...');
  await listenToNFTMints((nftData) => {
    console.log('🎊 新NFT铸造通知:', nftData);
  });
}

// React Hook 示例
export function useUserNFTs(userAddress: string) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        const harvestedNFTs = await gardenService.getUserHarvestedNFTs(userAddress);
        setNfts(harvestedNFTs);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userAddress) {
      loadNFTs();
      
      // 定期刷新
      const interval = setInterval(loadNFTs, 30000);
      return () => clearInterval(interval);
    }
  }, [userAddress]);
  
  return { nfts, loading, error, refetch: loadNFTs };
}

// Vue 组合式API示例
export function useNFTCollection(userAddress: Ref<string>) {
  const nfts = ref([]);
  const collection = ref(null);
  const loading = ref(false);
  
  const loadCollection = async () => {
    if (!userAddress.value) return;
    
    loading.value = true;
    try {
      const [userNFTs, collectionInfo] = await Promise.all([
        gardenService.getUserHarvestedNFTs(userAddress.value),
        gardenService.getUserNFTCollection(userAddress.value)
      ]);
      
      nfts.value = userNFTs;
      collection.value = collectionInfo;
    } catch (error) {
      console.error('Failed to load NFT collection:', error);
    } finally {
      loading.value = false;
    }
  };
  
  watch(userAddress, loadCollection, { immediate: true });
  
  return {
    nfts: readonly(nfts),
    collection: readonly(collection),
    loading: readonly(loading),
    refresh: loadCollection
  };
}

export default {
  getUserHarvestedNFTs,
  getUserNFTCollection,
  getUserNFTsByType,
  getNFTWithMetadata,
  listenToNFTMints,
  demonstrateNFTFetching
};