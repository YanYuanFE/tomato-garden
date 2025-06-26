/**
 * Tomato Garden 演示脚本
 * 简化版，用于快速测试合约功能
 */

console.log('🌱 Tomato Garden 合约演示\n');

// 合约部署信息
const CONTRACT_INFO = {
  network: 'Sepolia Testnet',
  nft: '0x02fbcb0931c47c544630824266ac9f9c3e0bf57383dccddff78bf135f944f177',
  staking: '0x0425b48131c54417af983d80184a0f048d41898725fad476d6e68a2a27d934c3',
  strk: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'
};

console.log('📋 合约部署信息:');
console.log(`网络:           ${CONTRACT_INFO.network}`);
console.log(`TomatoNFT:      ${CONTRACT_INFO.nft}`);
console.log(`TomatoStaking:  ${CONTRACT_INFO.staking}`);
console.log(`STRK Token:     ${CONTRACT_INFO.strk}`);

console.log('\n⚙️ 配置参数:');
console.log('成长周期:       1小时/阶段 (调试模式)');
console.log('最大阶段:       4 (种子→幼苗→成长→开花→成熟)');
console.log('最小质押:       1 STRK');
console.log('阶段奖励:       0.1 STRK');
console.log('变异概率:       5%');
console.log('浇水加速:       3倍');

console.log('\n🎮 新的游戏流程:');
console.log('1. 种植番茄     → 质押STRK，存储信息，但不铸造NFT');
console.log('2. 生长期间     → 可查询状态，浇水加速，可能变异');
console.log('3. 成熟后收获   → 铸造NFT，获得奖励，永久收藏');

console.log('\n🔧 调试功能:');
console.log('- 快速成长: 1小时即可到达下一阶段');
console.log('- 浇水加速: 浇水后20分钟即可成长');
console.log('- 实时查询: 可随时查询种植期间的番茄状态');

console.log('\n🌈 番茄类型:');
const TOMATO_TYPES = [
  { name: '普通', emoji: '🍅', rarity: '普通', mutatable: true },
  { name: '黄色', emoji: '🟡', rarity: '不常见', mutatable: false },
  { name: '紫色', emoji: '🟣', rarity: '不常见', mutatable: false },
  { name: '火焰', emoji: '🔥', rarity: '稀有', mutatable: false },
  { name: '冰霜', emoji: '❄️', rarity: '史诗', mutatable: false },
  { name: '彩虹', emoji: '🌈', rarity: '传说', mutatable: false }
];

TOMATO_TYPES.forEach((type, index) => {
  console.log(`${index}. ${type.name} ${type.emoji} - ${type.rarity} ${type.mutatable ? '(可变异)' : ''}`);
});

console.log('\n📱 前端集成:');
console.log('可使用 services/ 目录下的TypeScript服务:');
console.log('- TomatoGardenService: 综合服务API');
console.log('- TomatoStakingService: 质押和游戏逻辑');
console.log('- TomatoNFTService: NFT相关功能');

console.log('\n🔗 实用链接:');
console.log(`NFT合约浏览器: https://sepolia.starkscan.co/contract/${CONTRACT_INFO.nft}`);
console.log(`Staking合约浏览器: https://sepolia.starkscan.co/contract/${CONTRACT_INFO.staking}`);
console.log('水龙头: https://starknet-faucet.vercel.app/');

console.log('\n✨ 开始你的番茄种植之旅吧!');
console.log('请参考 services/README-updated.md 获取详细使用说明');