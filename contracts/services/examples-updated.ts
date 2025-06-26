/**
 * Tomato Garden 服务使用示例 - 更新版
 * 展示如何使用更新后的合约逻辑（种植期间查询，收获时铸造NFT）
 */

import { Account, RpcProvider } from 'starknet';
import { TomatoGardenService } from './TomatoGardenService';
import { TomatoStakingService } from './TomatoStakingService';
import { TomatoNFTService } from './TomatoNFTService';
import { 
  TomatoType, 
  GrowthStage, 
  TOMATO_TYPE_INFO, 
  GROWTH_STAGE_INFO 
} from './types';
import { formatSTRK, weiToSTRK } from './utils';

// 账户和提供者设置
const provider = new RpcProvider({ 
  nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8' 
});

// 示例账户（实际使用时需要真实的私钥）
const account = new Account(
  provider,
  '0x3d58edcfaf9db330ca1b3b4600bd79cda4003d1b3dd06abe3667290025ee11d', // 地址
  'your_private_key_here' // 私钥
);

// 初始化服务
const gardenService = new TomatoGardenService('sepolia');
const stakingService = new TomatoStakingService('sepolia');
const nftService = new TomatoNFTService('sepolia');

/**
 * 1. 初始化示例
 */
async function initializeExample() {
  console.log('🌱 初始化 Tomato Garden 服务...');
  
  // 连接账户
  await gardenService.connectAccount(account);
  
  // 获取网络状态
  const status = await gardenService.getNetworkStatus();
  console.log('网络状态:', status);
  
  // 获取合约信息
  const contractInfo = await gardenService.getContractInfo();
  console.log('合约信息:', contractInfo);
  
  // 获取最小质押金额
  const minStake = await gardenService.getMinStakeAmount();
  console.log('最小质押金额:', formatSTRK(weiToSTRK(minStake)), 'STRK');
}

/**
 * 2. 种植番茄示例
 */
async function plantTomatoExample() {
  console.log('🌱 种植番茄示例...');
  
  const stakeAmount = '2000000000000000000'; // 2 STRK
  
  try {
    // 种植番茄（现在不会立即铸造NFT）
    const result = await gardenService.plantTomato(stakeAmount);
    
    if (result.success) {
      console.log('✅ 番茄种植成功!');
      console.log('交易哈希:', result.transactionHash);
      console.log('质押金额:', formatSTRK(weiToSTRK(stakeAmount)), 'STRK');
      
      // 注意：种植后不会立即有NFT，但可以查询番茄信息
      // 需要从交易事件中获取番茄ID
      console.log('💡 提示: 番茄已种植但尚未铸造NFT，需要收获后才会获得NFT');
    } else {
      console.error('❌ 种植失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 种植异常:', error);
  }
}

/**
 * 3. 查询番茄信息示例（种植期间）
 */
async function queryTomatoDuringGrowthExample(tomatoId: string) {
  console.log('🔍 查询种植期间的番茄信息...');
  
  try {
    // 获取完整番茄信息
    const tomatoInfo = await gardenService.getTomatoInfo(tomatoId);
    
    console.log('番茄信息:');
    console.log('- ID:', tomatoInfo.id);
    console.log('- 类型:', TOMATO_TYPE_INFO[tomatoInfo.metadata.tomato_type].chineseName);
    console.log('- 当前阶段:', GROWTH_STAGE_INFO[tomatoInfo.currentGrowthStage].chineseName);
    console.log('- 种植时间:', new Date(tomatoInfo.metadata.planted_at * 1000).toLocaleString());
    console.log('- 质押金额:', formatSTRK(weiToSTRK(tomatoInfo.metadata.staked_amount)), 'STRK');
    console.log('- 是否已收获:', tomatoInfo.isHarvested ? '是' : '否');
    console.log('- 是否可收获:', tomatoInfo.isHarvestable ? '是' : '否');
    
    if (tomatoInfo.timeToNextStage) {
      const hours = Math.floor(tomatoInfo.timeToNextStage / 3600);
      const minutes = Math.floor((tomatoInfo.timeToNextStage % 3600) / 60);
      console.log('- 到下一阶段时间:', `${hours}小时${minutes}分钟`);
    }
    
    if (!tomatoInfo.isHarvested) {
      console.log('💡 番茄正在生长中，尚未铸造NFT');
    } else {
      console.log('🎉 番茄已收获，NFT已铸造');
      console.log('- NFT所有者:', tomatoInfo.owner);
      console.log('- Token URI:', tomatoInfo.tokenUri);
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

/**
 * 4. 浇水示例
 */
async function waterTomatoExample(tomatoId: string) {
  console.log('💧 浇水番茄示例...');
  
  try {
    // 检查是否可以浇水
    const canWater = await gardenService.canWaterTomato(tomatoId, 3600); // 1小时冷却
    
    if (!canWater) {
      console.log('⏰ 番茄还在冷却期，暂时不能浇水');
      return;
    }
    
    // 获取浇水前的类型
    const beforeType = await stakingService.getTomatoType(tomatoId);
    console.log('浇水前类型:', TOMATO_TYPE_INFO[beforeType].chineseName);
    
    // 浇水
    const result = await gardenService.waterTomato(tomatoId);
    
    if (result.success) {
      console.log('✅ 浇水成功!');
      console.log('交易哈希:', result.transactionHash);
      
      if (result.mutated) {
        console.log('🎉 恭喜! 番茄发生了变异!');
        console.log('变异前:', TOMATO_TYPE_INFO[result.oldType!].chineseName);
        console.log('变异后:', TOMATO_TYPE_INFO[result.newType!].chineseName);
        console.log('稀有度:', TOMATO_TYPE_INFO[result.newType!].rarity);
      } else {
        console.log('💧 浇水完成，番茄生长加速中...');
      }
    } else {
      console.error('❌ 浇水失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 浇水异常:', error);
  }
}

/**
 * 5. 收获番茄示例（现在才铸造NFT）
 */
async function harvestTomatoExample(tomatoId: string) {
  console.log('🎯 收获番茄示例...');
  
  try {
    // 检查是否可以收获
    const tomatoInfo = await gardenService.getTomatoInfo(tomatoId);
    
    if (!tomatoInfo.isHarvestable) {
      console.log('⏰ 番茄还未成熟，无法收获');
      console.log('当前阶段:', GROWTH_STAGE_INFO[tomatoInfo.currentGrowthStage].chineseName);
      return;
    }
    
    if (tomatoInfo.isHarvested) {
      console.log('✅ 番茄已经收获过了');
      return;
    }
    
    console.log('🌟 番茄已成熟，开始收获...');
    console.log('番茄类型:', TOMATO_TYPE_INFO[tomatoInfo.metadata.tomato_type].chineseName);
    
    // 收获（这时才会铸造NFT）
    const result = await gardenService.harvestTomato(tomatoId);
    
    if (result.success) {
      console.log('🎉 收获成功! NFT已铸造!');
      console.log('交易哈希:', result.transactionHash);
      console.log('番茄类型:', TOMATO_TYPE_INFO[result.tomatoType!].chineseName);
      
      // 收获后再次查询，现在应该有NFT信息了
      const updatedInfo = await gardenService.getTomatoInfo(tomatoId);
      console.log('NFT所有者:', updatedInfo.owner);
      console.log('Token URI:', updatedInfo.tokenUri);
      console.log('收获时间:', new Date(updatedInfo.metadata.harvested_at * 1000).toLocaleString());
      
    } else {
      console.error('❌ 收获失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 收获异常:', error);
  }
}

/**
 * 6. 用户统计示例
 */
async function userStatsExample(userAddress: string) {
  console.log('📊 用户统计示例...');
  
  try {
    // 获取用户统计
    const stats = await gardenService.getUserStats(userAddress);
    
    console.log('用户统计:');
    console.log('- 总番茄数量:', stats.totalTomatoes);
    console.log('- 可收获数量:', stats.harvestableTomatoes);
    console.log('- 总质押金额:', stats.totalStaked, 'STRK');
    console.log('- 变异率:', (stats.mutationRate * 100).toFixed(2) + '%');
    console.log('- 收藏价值:', stats.collectionValue);
    
    console.log('\n按类型分布:');
    for (const [type, count] of Object.entries(stats.tomatoesByType)) {
      const typeInfo = TOMATO_TYPE_INFO[parseInt(type) as TomatoType];
      if (count > 0) {
        console.log(`- ${typeInfo.chineseName}: ${count} 个`);
      }
    }
    
    console.log('\n按阶段分布:');
    for (const [stage, count] of Object.entries(stats.tomatoesByStage)) {
      const stageInfo = GROWTH_STAGE_INFO[parseInt(stage) as GrowthStage];
      if (count > 0) {
        console.log(`- ${stageInfo.chineseName}: ${count} 个`);
      }
    }
    
    // 获取收藏统计
    const collectionStats = await gardenService.getCollectionStats(userAddress);
    console.log('\n收藏进度:');
    console.log('- 已收集类型:', `${collectionStats.collectedTypes}/${collectionStats.totalTypes}`);
    console.log('- 完成率:', collectionStats.completionRate.toFixed(1) + '%');
    
    if (collectionStats.rarest) {
      console.log('- 最稀有:', TOMATO_TYPE_INFO[collectionStats.rarest].chineseName);
    }
    
  } catch (error) {
    console.error('❌ 统计查询失败:', error);
  }
}

/**
 * 7. 批量操作示例
 */
async function batchOperationsExample(userAddress: string) {
  console.log('🔄 批量操作示例...');
  
  try {
    // 获取用户所有番茄
    const allTomatoes = await gardenService.getUserTomatoInfos(userAddress);
    console.log('用户总番茄数量:', allTomatoes.length);
    
    // 筛选可收获的番茄
    const harvestable = allTomatoes.filter(t => t.isHarvestable && !t.isHarvested);
    console.log('可收获番茄数量:', harvestable.length);
    
    if (harvestable.length > 0) {
      console.log('开始批量收获...');
      const tomatoIds = harvestable.map(t => t.id);
      const results = await gardenService.batchHarvestTomatoes(tomatoIds);
      
      let successCount = 0;
      for (const result of results) {
        if (result.success) {
          successCount++;
          console.log(`✅ 番茄 ${result.tokenId} 收获成功`);
        } else {
          console.log(`❌ 番茄收获失败:`, result.error);
        }
      }
      
      console.log(`批量收获完成: ${successCount}/${results.length} 成功`);
    }
    
    // 按类型分组显示
    const byType = await gardenService.getUserTomatoesByType(userAddress);
    console.log('\n按类型分组:');
    for (const [type, tomatoes] of Object.entries(byType)) {
      const typeInfo = TOMATO_TYPE_INFO[parseInt(type) as TomatoType];
      if (tomatoes.length > 0) {
        console.log(`${typeInfo.chineseName}: ${tomatoes.length} 个`);
        tomatoes.forEach(t => {
          const status = t.isHarvested ? '已收获' : 
                        t.isHarvestable ? '可收获' : '生长中';
          console.log(`  - ID: ${t.id}, 状态: ${status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 批量操作失败:', error);
  }
}

/**
 * 8. 完整流程示例
 */
async function completeWorkflowExample() {
  console.log('🎮 完整流程示例...');
  
  try {
    // 1. 初始化
    await initializeExample();
    
    // 2. 种植番茄
    await plantTomatoExample();
    
    // 这里需要从实际的交易事件中获取番茄ID
    // 为了示例，我们假设番茄ID是 "1"
    const tomatoId = "1";
    
    // 3. 查询种植期间的番茄信息
    await queryTomatoDuringGrowthExample(tomatoId);
    
    // 4. 等待一段时间后浇水
    console.log('⏰ 等待1小时后可以浇水...');
    // 在实际应用中，你需要等待真实时间或者检查时间戳
    
    // 5. 浇水
    await waterTomatoExample(tomatoId);
    
    // 6. 等待成熟
    console.log('⏰ 等待番茄成熟...');
    // 在快速模式下，4小时后番茄就能成熟
    
    // 7. 收获（铸造NFT）
    await harvestTomatoExample(tomatoId);
    
    // 8. 查看用户统计
    const userAddress = account.address;
    await userStatsExample(userAddress);
    
    // 9. 批量操作
    await batchOperationsExample(userAddress);
    
  } catch (error) {
    console.error('❌ 完整流程执行失败:', error);
  }
}

/**
 * 9. 合约地址和网络信息
 */
function showContractInfo() {
  console.log('📋 合约部署信息:');
  
  const addresses = gardenService.getContractAddresses();
  console.log('TomatoNFT 合约:', addresses.nft);
  console.log('TomatoStaking 合约:', addresses.staking);
  console.log('STRK 代币合约:', addresses.strk);
  
  const config = gardenService.getNetworkConfig();
  console.log('网络:', config.name);
  console.log('RPC URL:', config.rpcUrl);
  console.log('浏览器:', config.explorerUrl);
  console.log('最小质押:', formatSTRK(weiToSTRK(config.minStakeAmount)), 'STRK');
  console.log('每阶段奖励:', formatSTRK(weiToSTRK(config.baseRewardPerStage)), 'STRK');
}

// 导出示例函数
export {
  initializeExample,
  plantTomatoExample,
  queryTomatoDuringGrowthExample,
  waterTomatoExample,
  harvestTomatoExample,
  userStatsExample,
  batchOperationsExample,
  completeWorkflowExample,
  showContractInfo
};

// 如果直接运行此文件
if (require.main === module) {
  console.log('🚀 运行 Tomato Garden 示例...');
  showContractInfo();
  // 注意：实际运行需要真实的账户私钥
  // completeWorkflowExample().catch(console.error);
}