#!/usr/bin/env node

/**
 * Tomato Garden CLI 工具
 * 用于测试和演示合约功能
 */

import { Command } from 'commander';
import { Account, RpcProvider } from 'starknet';
import { TomatoGardenService } from './TomatoGardenService';
import { TOMATO_TYPE_INFO, GROWTH_STAGE_INFO } from './types';
import { formatSTRK, weiToSTRK } from './utils';

const program = new Command();

// 网络配置
const NETWORKS = {
  sepolia: {
    rpc: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
    account: '0x3d58edcfaf9db330ca1b3b4600bd79cda4003d1b3dd06abe3667290025ee11d'
  }
};

// 初始化服务
let gardenService: TomatoGardenService;
let provider: RpcProvider;

function initializeService(network: string = 'sepolia') {
  const config = NETWORKS[network as keyof typeof NETWORKS];
  if (!config) {
    console.error('❌ 不支持的网络:', network);
    process.exit(1);
  }
  
  provider = new RpcProvider({ nodeUrl: config.rpc });
  gardenService = new TomatoGardenService(network);
  
  console.log(`🌐 已连接到 ${network} 网络`);
}

// 连接账户（演示用，实际使用需要真实私钥）
async function connectAccount(privateKey?: string) {
  if (!privateKey) {
    console.log('⚠️  未提供私钥，仅使用只读功能');
    return;
  }
  
  const account = new Account(provider, NETWORKS.sepolia.account, privateKey);
  await gardenService.connectAccount(account);
  console.log('✅ 账户已连接');
}

// 命令：显示合约信息
program
  .command('info')
  .description('显示合约部署信息')
  .option('-n, --network <network>', '网络名称', 'sepolia')
  .action(async (options) => {
    initializeService(options.network);
    
    console.log('📋 Tomato Garden 合约信息\n');
    
    const addresses = gardenService.getContractAddresses();
    const config = gardenService.getNetworkConfig();
    
    console.log('📍 合约地址:');
    console.log(`  TomatoNFT:    ${addresses.nft}`);
    console.log(`  TomatoStaking: ${addresses.staking}`);
    console.log(`  STRK Token:   ${addresses.strk}`);
    
    console.log('\n⚙️  配置参数:');
    console.log(`  网络:         ${config.name}`);
    console.log(`  RPC URL:      ${config.rpcUrl}`);
    console.log(`  浏览器:       ${config.explorerUrl}`);
    console.log(`  最小质押:     ${formatSTRK(weiToSTRK(config.minStakeAmount))} STRK`);
    console.log(`  阶段奖励:     ${formatSTRK(weiToSTRK(config.baseRewardPerStage))} STRK`);
    
    console.log('\n⏰ 成长周期: 1小时/阶段 (调试模式)');
    console.log('🎯 变异概率: 5%');
    console.log('💧 浇水加速: 3倍');
  });

// 命令：查询番茄信息
program
  .command('query <tomatoId>')
  .description('查询番茄信息')
  .option('-n, --network <network>', '网络名称', 'sepolia')
  .action(async (tomatoId, options) => {
    initializeService(options.network);
    
    try {
      console.log(`🔍 查询番茄 #${tomatoId}...\n`);
      
      const tomatoInfo = await gardenService.getTomatoInfo(tomatoId);
      
      console.log('📋 基本信息:');
      console.log(`  ID:           ${tomatoInfo.id}`);
      console.log(`  类型:         ${TOMATO_TYPE_INFO[tomatoInfo.metadata.tomato_type].chineseName} ${TOMATO_TYPE_INFO[tomatoInfo.metadata.tomato_type].emoji}`);
      console.log(`  当前阶段:     ${GROWTH_STAGE_INFO[tomatoInfo.currentGrowthStage].chineseName} ${GROWTH_STAGE_INFO[tomatoInfo.currentGrowthStage].emoji}`);
      console.log(`  质押金额:     ${formatSTRK(weiToSTRK(tomatoInfo.metadata.staked_amount))} STRK`);
      
      console.log('\n⏰ 时间信息:');
      if (tomatoInfo.metadata.planted_at > 0) {
        console.log(`  种植时间:     ${new Date(tomatoInfo.metadata.planted_at * 1000).toLocaleString()}`);
      }
      if (tomatoInfo.lastWatered > 0) {
        console.log(`  上次浇水:     ${new Date(tomatoInfo.lastWatered * 1000).toLocaleString()}`);
      }
      if (tomatoInfo.metadata.harvested_at > 0) {
        console.log(`  收获时间:     ${new Date(tomatoInfo.metadata.harvested_at * 1000).toLocaleString()}`);
      }
      
      console.log('\n🎯 状态信息:');
      console.log(`  是否可收获:   ${tomatoInfo.isHarvestable ? '是 ✅' : '否 ❌'}`);
      console.log(`  是否已收获:   ${tomatoInfo.isHarvested ? '是 (NFT已铸造)' : '否 (未铸造NFT)'}`);
      
      if (tomatoInfo.timeToNextStage && tomatoInfo.timeToNextStage > 0) {
        const hours = Math.floor(tomatoInfo.timeToNextStage / 3600);
        const minutes = Math.floor((tomatoInfo.timeToNextStage % 3600) / 60);
        console.log(`  下一阶段时间: ${hours}小时${minutes}分钟`);
      }
      
      if (tomatoInfo.isHarvested) {
        console.log('\n🎨 NFT信息:');
        console.log(`  所有者:       ${tomatoInfo.owner}`);
        console.log(`  Token URI:    ${tomatoInfo.tokenUri}`);
      }
      
    } catch (error) {
      console.error('❌ 查询失败:', error);
    }
  });

// 命令：查询用户统计
program
  .command('stats <userAddress>')
  .description('查询用户统计信息')
  .option('-n, --network <network>', '网络名称', 'sepolia')
  .action(async (userAddress, options) => {
    initializeService(options.network);
    
    try {
      console.log(`📊 查询用户 ${userAddress} 的统计信息...\n`);
      
      const stats = await gardenService.getUserStats(userAddress);
      const collection = await gardenService.getCollectionStats(userAddress);
      
      console.log('📈 总体统计:');
      console.log(`  总番茄数量:   ${stats.totalTomatoes}`);
      console.log(`  可收获数量:   ${stats.harvestableTomatoes}`);
      console.log(`  总质押金额:   ${stats.totalStaked} STRK`);
      console.log(`  变异率:       ${(stats.mutationRate * 100).toFixed(2)}%`);
      console.log(`  收藏价值:     ${stats.collectionValue}`);
      
      console.log('\n🌈 按类型分布:');
      Object.entries(stats.tomatoesByType).forEach(([type, count]) => {
        const typeInfo = TOMATO_TYPE_INFO[parseInt(type) as keyof typeof TOMATO_TYPE_INFO];
        if (count > 0) {
          console.log(`  ${typeInfo.chineseName}: ${count} 个 ${typeInfo.emoji}`);
        }
      });
      
      console.log('\n🌱 按阶段分布:');
      Object.entries(stats.tomatoesByStage).forEach(([stage, count]) => {
        const stageInfo = GROWTH_STAGE_INFO[parseInt(stage) as keyof typeof GROWTH_STAGE_INFO];
        if (count > 0) {
          console.log(`  ${stageInfo.chineseName}: ${count} 个 ${stageInfo.emoji}`);
        }
      });
      
      console.log('\n🏆 收藏进度:');
      console.log(`  完成度:       ${collection.completionRate.toFixed(1)}% (${collection.collectedTypes}/${collection.totalTypes})`);
      if (collection.rarest) {
        console.log(`  最稀有:       ${TOMATO_TYPE_INFO[collection.rarest].chineseName} ${TOMATO_TYPE_INFO[collection.rarest].emoji}`);
      }
      
      if (collection.missingTypes.length > 0) {
        console.log('\n❓ 缺失类型:');
        collection.missingTypes.forEach(type => {
          const typeInfo = TOMATO_TYPE_INFO[type];
          console.log(`  ${typeInfo.chineseName} ${typeInfo.emoji} - ${typeInfo.rarity}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 查询失败:', error);
    }
  });

// 命令：列出用户所有番茄
program
  .command('list <userAddress>')
  .description('列出用户所有番茄')
  .option('-n, --network <network>', '网络名称', 'sepolia')
  .option('-t, --type <type>', '按类型筛选')
  .option('-s, --stage <stage>', '按阶段筛选')
  .action(async (userAddress, options) => {
    initializeService(options.network);
    
    try {
      console.log(`📋 查询用户 ${userAddress} 的所有番茄...\n`);
      
      const tomatoes = await gardenService.getUserTomatoInfos(userAddress);
      
      if (tomatoes.length === 0) {
        console.log('😢 该用户还没有种植任何番茄');
        return;
      }
      
      // 应用筛选条件
      let filteredTomatoes = tomatoes;
      
      if (options.type) {
        const typeFilter = parseInt(options.type);
        filteredTomatoes = filteredTomatoes.filter(t => t.metadata.tomato_type === typeFilter);
      }
      
      if (options.stage) {
        const stageFilter = parseInt(options.stage);
        filteredTomatoes = filteredTomatoes.filter(t => t.currentGrowthStage === stageFilter);
      }
      
      console.log(`找到 ${filteredTomatoes.length} 个番茄:\n`);
      
      filteredTomatoes.forEach((tomato, index) => {
        const typeInfo = TOMATO_TYPE_INFO[tomato.metadata.tomato_type];
        const stageInfo = GROWTH_STAGE_INFO[tomato.currentGrowthStage];
        
        console.log(`${index + 1}. 番茄 #${tomato.id}`);
        console.log(`   类型: ${typeInfo.chineseName} ${typeInfo.emoji} (${typeInfo.rarity})`);
        console.log(`   阶段: ${stageInfo.chineseName} ${stageInfo.emoji}`);
        console.log(`   质押: ${formatSTRK(weiToSTRK(tomato.metadata.staked_amount))} STRK`);
        console.log(`   状态: ${tomato.isHarvested ? '已收获 (NFT)' : tomato.isHarvestable ? '可收获' : '生长中'}`);
        
        if (tomato.timeToNextStage && tomato.timeToNextStage > 0) {
          const hours = Math.floor(tomato.timeToNextStage / 3600);
          const minutes = Math.floor((tomato.timeToNextStage % 3600) / 60);
          console.log(`   下一阶段: ${hours}h${minutes}m`);
        }
        
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ 查询失败:', error);
    }
  });

// 命令：检查合约状态
program
  .command('status')
  .description('检查合约状态')
  .option('-n, --network <network>', '网络名称', 'sepolia')
  .action(async (options) => {
    initializeService(options.network);
    
    try {
      console.log('🔍 检查合约状态...\n');
      
      // 检查网络连接
      const status = await gardenService.getNetworkStatus();
      console.log('🌐 网络状态:');
      console.log(`  连接状态:     ${status.connected ? '已连接 ✅' : '未连接 ❌'}`);
      console.log(`  网络:         ${status.network || 'N/A'}`);
      console.log(`  账户:         ${status.account || 'N/A'}`);
      
      // 检查合约配置
      const contractInfo = await gardenService.getContractInfo();
      console.log('\n📋 合约信息:');
      console.log(`  NFT名称:      ${contractInfo.nft.name}`);
      console.log(`  NFT符号:      ${contractInfo.nft.symbol}`);
      console.log(`  最小质押:     ${formatSTRK(weiToSTRK(contractInfo.staking.minStakeAmount))} STRK`);
      
      console.log('\n✅ 所有合约正常运行');
      
    } catch (error) {
      console.error('❌ 状态检查失败:', error);
    }
  });

// 命令：显示帮助
program
  .command('help-examples')
  .description('显示使用示例')
  .action(() => {
    console.log('🌱 Tomato Garden CLI 使用示例\n');
    
    console.log('📋 查看合约信息:');
    console.log('  npx ts-node cli-tool.ts info');
    console.log('');
    
    console.log('🔍 查询番茄信息:');
    console.log('  npx ts-node cli-tool.ts query 1');
    console.log('');
    
    console.log('📊 查看用户统计:');
    console.log('  npx ts-node cli-tool.ts stats 0x123...');
    console.log('');
    
    console.log('📋 列出所有番茄:');
    console.log('  npx ts-node cli-tool.ts list 0x123...');
    console.log('  npx ts-node cli-tool.ts list 0x123... --type 1  # 只显示黄色番茄');
    console.log('  npx ts-node cli-tool.ts list 0x123... --stage 4 # 只显示成熟番茄');
    console.log('');
    
    console.log('🔍 检查合约状态:');
    console.log('  npx ts-node cli-tool.ts status');
    console.log('');
    
    console.log('📝 注意事项:');
    console.log('  - 当前为调试模式，1小时/成长阶段');
    console.log('  - 浇水可以3倍加速生长');
    console.log('  - 浇水有5%概率触发变异');
    console.log('  - 只有收获时才会铸造NFT');
  });

program
  .name('tomato-cli')
  .description('Tomato Garden 命令行工具')
  .version('1.0.0');

// 如果没有提供命令，显示帮助
if (process.argv.length <= 2) {
  program.help();
}

program.parse();

export default program;