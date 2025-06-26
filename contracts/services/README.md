# Tomato Garden Services

Tomato Garden 智能合约的前端服务抽象层，提供 TypeScript/JavaScript 友好的 API。

## 安装

```bash
npm install starknet
```

## 快速开始

```typescript
import { TomatoGardenService, TomatoType } from './services';
import { Account, RpcProvider } from 'starknet';

// 初始化服务
const service = new TomatoGardenService('sepolia');

// 连接钱包
const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.public.blastapi.io' });
const account = new Account(provider, accountAddress, privateKey);
await service.connectAccount(account);

// 种植番茄
const result = await service.plantTomato('2000000000000000000'); // 2 STRK
```

## 核心功能

### 1. 番茄生命周期管理

```typescript
// 种植番茄
const plantResult = await service.plantTomato('2000000000000000000');

// 浇水（可能触发变异）
const waterResult = await service.waterTomato('1');
if (waterResult.mutated) {
  console.log(`变异发生！${waterResult.oldType} → ${waterResult.newType}`);
}

// 收获番茄
const harvestResult = await service.harvestTomato('1');
```

### 2. 用户数据查询

```typescript
// 获取用户统计
const stats = await service.getUserStats(userAddress);
console.log({
  totalTomatoes: stats.totalTomatoes,
  mutationRate: stats.mutationRate,
  collectionValue: stats.collectionValue
});

// 获取用户所有番茄
const tomatoes = await service.getUserTomatoInfos(userAddress);

// 按类型分组
const tomatoesByType = await service.getUserTomatoesByType(userAddress);
console.log('火焰番茄数量:', tomatoesByType[TomatoType.Flame].length);
```

### 3. 批量操作

```typescript
// 获取可收获的番茄
const harvestableTomatoes = await service.getHarvestableTomatoes(userAddress);

// 批量收获
const results = await service.batchHarvestTomatoes(harvestableTomatoes);
```

### 4. 收藏系统

```typescript
// 获取收藏统计
const collectionStats = await service.getCollectionStats(userAddress);
console.log(`收藏完成度: ${collectionStats.completionRate}%`);

// 获取收藏等级
const level = await service.getUserCollectionLevel(userAddress);
console.log('收藏等级:', level); // 例如: "传奇收藏家 👑"
```

## 服务架构

### TomatoGardenService（主服务）
- 整合 NFT 和 Staking 合约功能
- 提供统一的 API 接口
- 处理复杂的数据组合和计算

### TomatoNFTService（NFT 合约服务）
- NFT 基础功能（余额、所有者、元数据等）
- 番茄元数据查询
- 批量操作支持

### TomatoStakingService（质押合约服务）
- 游戏逻辑（种植、浇水、收获）
- 成长阶段计算
- 用户番茄管理

### BaseContractService（基础服务）
- 网络连接管理
- 交易执行和错误处理
- 通用工具函数

## 类型定义

### 番茄类型
```typescript
enum TomatoType {
  Normal = 0,    // 普通 🍅
  Yellow = 1,    // 黄色 🟡
  Purple = 2,    // 紫色 🟣  
  Flame = 3,     // 火焰 🔥
  Ice = 4,       // 冰霜 ❄️
  Rainbow = 5    // 彩虹 🌈
}
```

### 成长阶段
```typescript
enum GrowthStage {
  Seed = 0,      // 种子期 🌱
  Seedling = 1,  // 幼苗期 🌿
  Growing = 2,   // 成长期 🍃
  Flowering = 3, // 开花期 🌺
  Mature = 4     // 成熟期 🍅（可收获）
}
```

### 番茄信息
```typescript
interface TomatoInfo {
  id: string;
  owner: string;
  metadata: TomatoMetadata;
  currentGrowthStage: GrowthStage;
  lastWatered: number;
  tokenUri: string;
  isHarvestable: boolean;
  timeToNextStage?: number;
}
```

## 工具函数

```typescript
import { formatSTRK, calculateGrowthStage, getTomatoTypeInfo } from './services';

// STRK 金额格式化
const strkAmount = formatSTRK('2000000000000000000'); // "2.000000"

// 成长阶段计算
const stage = calculateGrowthStage(plantedAt, lastWatered);

// 番茄类型信息
const typeInfo = getTomatoTypeInfo(TomatoType.Rainbow);
console.log(typeInfo.chineseName); // "彩虹"
```

## 网络配置

支持的网络：
- `sepolia` - Sepolia 测试网（默认）
- `mainnet` - Starknet 主网

```typescript
// 使用主网
const service = new TomatoGardenService('mainnet');

// 获取网络配置
const config = service.getNetworkConfig();
console.log(config.rpcUrl);

// 获取合约地址
const addresses = service.getContractAddresses();
console.log(addresses.nft, addresses.staking);
```

## 错误处理

所有交易操作返回 `TransactionResult` 类型：

```typescript
interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

// 使用示例
const result = await service.plantTomato('1000000000000000000');
if (result.success) {
  console.log('交易成功:', result.transactionHash);
} else {
  console.error('交易失败:', result.error);
}
```

## 事件监听

```typescript
// 监听合约事件
await service.listenToEvents(
  ['TomatoPlanted', 'TomatoWatered', 'TomatoHarvested'],
  'latest',
  (event) => {
    console.log('收到事件:', event);
  }
);
```

## 完整示例

查看 `examples.ts` 文件了解详细的使用示例，包括：
- 基础操作
- 批量处理
- 数据统计
- 错误处理
- 事件监听

## 注意事项

1. **账户连接**: 使用前必须连接 Starknet 账户
2. **网络配置**: 确保合约地址配置正确
3. **Gas 费用**: 交易操作需要支付 Gas 费用
4. **冷却时间**: 浇水有冷却时间限制（默认 1 小时）
5. **变异概率**: 只有普通番茄可以变异，概率为 5%
6. **收获条件**: 只有成熟期的番茄可以收获

## 开发建议

1. 使用 TypeScript 获得完整的类型支持
2. 实现适当的错误处理和用户反馈
3. 考虑交易确认时间和网络延迟
4. 缓存合约数据以提高性能
5. 监听事件以实时更新 UI