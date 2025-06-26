/**
 * Tomato Garden Services 使用示例
 */

import { Account, RpcProvider } from 'starknet';
import { TomatoGardenService, TomatoType, GrowthStage } from './index';

/**
 * 基础使用示例
 */
async function basicExample() {
  // 初始化服务（默认使用 sepolia 测试网）
  const service = new TomatoGardenService('sepolia');
  
  // 连接钱包账户
  const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.public.blastapi.io' });
  const account = new Account(provider, '0x123...', '0x456...');
  await service.connectAccount(account);
  
  // 获取网络状态
  const status = await service.getNetworkStatus();
  console.log('Network Status:', status);
  
  // 获取最小质押金额
  const minStake = await service.getMinStakeAmount();
  console.log('Min Stake Amount:', minStake);
}

/**
 * 种植番茄示例
 */
async function plantTomatoExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  // 种植番茄
  const stakeAmount = '2000000000000000000'; // 2 STRK
  const result = await service.plantTomato(stakeAmount);
  
  if (result.success) {
    console.log('Tomato planted successfully!');
    console.log('Transaction Hash:', result.transactionHash);
    // 需要从事件中获取 tokenId
  } else {
    console.error('Failed to plant tomato:', result.error);
  }
}

/**
 * 浇水示例
 */
async function waterTomatoExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const tomatoId = '1';
  
  // 检查是否可以浇水
  const canWater = await service.canWaterTomato(tomatoId);
  if (!canWater) {
    console.log('Tomato is still in cooldown period');
    return;
  }
  
  // 浇水
  const result = await service.waterTomato(tomatoId);
  
  if (result.success) {
    console.log('Tomato watered successfully!');
    if (result.mutated) {
      console.log(`🎉 Mutation occurred! ${result.oldType} → ${result.newType}`);
    }
  } else {
    console.error('Failed to water tomato:', result.error);
  }
}

/**
 * 收获示例
 */
async function harvestTomatoExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const userAddress = '0x123...';
  
  // 获取可收获的番茄
  const harvestableTomatoes = await service.getHarvestableTomatoes(userAddress);
  console.log('Harvestable tomatoes:', harvestableTomatoes);
  
  if (harvestableTomatoes.length > 0) {
    // 收获第一个番茄
    const tomatoId = harvestableTomatoes[0];
    const result = await service.harvestTomato(tomatoId);
    
    if (result.success) {
      console.log('Tomato harvested successfully!');
      console.log('Reward:', result.reward);
      console.log('Type:', result.tomatoType);
    }
  }
}

/**
 * 批量收获示例
 */
async function batchHarvestExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const userAddress = '0x123...';
  
  // 获取所有可收获的番茄
  const harvestableTomatoes = await service.getHarvestableTomatoes(userAddress);
  
  if (harvestableTomatoes.length > 0) {
    console.log(`Harvesting ${harvestableTomatoes.length} tomatoes...`);
    
    // 批量收获
    const results = await service.batchHarvestTomatoes(harvestableTomatoes);
    
    let successCount = 0;
    let totalReward = 0;
    
    for (const result of results) {
      if (result.success) {
        successCount++;
        if (result.reward) {
          totalReward += parseInt(result.reward);
        }
      }
    }
    
    console.log(`Successfully harvested ${successCount}/${results.length} tomatoes`);
    console.log(`Total reward: ${totalReward}`);
  }
}

/**
 * 用户统计示例
 */
async function userStatsExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const userAddress = '0x123...';
  
  // 获取用户统计
  const stats = await service.getUserStats(userAddress);
  console.log('User Stats:', {
    totalTomatoes: stats.totalTomatoes,
    harvestableTomatoes: stats.harvestableTomatoes,
    mutationRate: `${stats.mutationRate.toFixed(1)}%`,
    collectionValue: stats.collectionValue,
    totalStaked: stats.totalStaked
  });
  
  // 获取收藏等级
  const level = await service.getUserCollectionLevel(userAddress);
  console.log('Collection Level:', level);
  
  // 获取收藏统计
  const collectionStats = await service.getCollectionStats(userAddress);
  console.log('Collection Stats:', {
    completionRate: `${collectionStats.completionRate.toFixed(1)}%`,
    collectedTypes: collectionStats.collectedTypes,
    totalTypes: collectionStats.totalTypes,
    rarest: collectionStats.rarest
  });
}

/**
 * 番茄详细信息示例
 */
async function tomatoInfoExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const userAddress = '0x123...';
  
  // 获取用户所有番茄
  const tomatoes = await service.getUserTomatoInfos(userAddress);
  
  for (const tomato of tomatoes) {
    console.log(`Tomato #${tomato.id}:`);
    console.log(`  Type: ${TomatoType[tomato.metadata.tomato_type]}`);
    console.log(`  Stage: ${GrowthStage[tomato.currentGrowthStage]}`);
    console.log(`  Harvestable: ${tomato.isHarvestable ? 'Yes' : 'No'}`);
    console.log(`  Staked Amount: ${tomato.metadata.staked_amount}`);
    
    if (tomato.timeToNextStage && tomato.timeToNextStage > 0) {
      const hours = Math.floor(tomato.timeToNextStage / 3600);
      const minutes = Math.floor((tomato.timeToNextStage % 3600) / 60);
      console.log(`  Time to next stage: ${hours}h ${minutes}m`);
    }
    
    console.log(`  Token URI: ${tomato.tokenUri}`);
    console.log('---');
  }
}

/**
 * 按类型分组示例
 */
async function groupByTypeExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  const userAddress = '0x123...';
  
  // 按类型分组
  const tomatoesByType = await service.getUserTomatoesByType(userAddress);
  
  for (const [type, tomatoes] of Object.entries(tomatoesByType)) {
    const typeName = TomatoType[parseInt(type) as TomatoType];
    console.log(`${typeName} Tomatoes (${tomatoes.length}):`);
    
    for (const tomato of tomatoes) {
      console.log(`  #${tomato.id} - Stage: ${GrowthStage[tomato.currentGrowthStage]}`);
    }
  }
}

/**
 * 事件监听示例
 */
async function eventListeningExample() {
  const service = new TomatoGardenService();
  // ... 连接账户
  
  // 监听合约事件
  await service.listenToEvents(
    ['TomatoPlanted', 'TomatoWatered', 'TomatoHarvested'],
    'latest',
    (event) => {
      console.log('Event received:', event);
      
      switch (event.eventName) {
        case 'TomatoPlanted':
          console.log(`🌱 New tomato planted by ${event.data.user}`);
          break;
        case 'TomatoWatered':
          console.log(`💧 Tomato #${event.data.tomato_id} watered`);
          if (event.data.mutated) {
            console.log(`🎉 Mutation occurred! New type: ${event.data.new_type}`);
          }
          break;
        case 'TomatoHarvested':
          console.log(`🍅 Tomato #${event.data.tomato_id} harvested for ${event.data.reward} reward`);
          break;
      }
    }
  );
}

/**
 * 错误处理示例
 */
async function errorHandlingExample() {
  const service = new TomatoGardenService();
  
  try {
    // 尝试在没有连接账户的情况下种植番茄
    await service.plantTomato('1000000000000000000');
  } catch (error) {
    console.error('Expected error - no account connected:', error);
  }
  
  // 正确的错误处理
  const result = await service.plantTomato('1000000000000000000');
  if (!result.success) {
    console.error('Transaction failed:', result.error);
    // 处理错误，比如显示用户友好的错误消息
  }
}

// 导出示例函数
export {
  basicExample,
  plantTomatoExample,
  waterTomatoExample,
  harvestTomatoExample,
  batchHarvestExample,
  userStatsExample,
  tomatoInfoExample,
  groupByTypeExample,
  eventListeningExample,
  errorHandlingExample
};