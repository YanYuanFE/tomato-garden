# Tomato Garden Services - 更新版

这是 Tomato Garden 项目的前端服务层，已更新支持新的合约逻辑：**种植期间可查询番茄信息，收获时才铸造NFT**。

## 🚀 快速开始

### 合约部署信息

**Sepolia 测试网**
- TomatoNFT: `0x0591dd7354ed234c747d2bb56388bb4740be4f615f7300e6204230d6a8d0e515`
- TomatoStaking: `0x073ac8f4404e3d1751e6fc0f0cfbd9d7867638c63473431b5d91bb0c51e9d804`
- STRK Token: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

**配置参数**
- 成长周期：1小时/阶段 (调试模式)
- 最大成长阶段：4 (种子→幼苗→成长→开花→成熟)
- 最小质押：1 STRK
- 每阶段奖励：1 STRK

### 安装依赖

```bash
npm install starknet
```

### 基本使用

```typescript
import { TomatoGardenService } from './services/TomatoGardenService';
import { Account, RpcProvider } from 'starknet';

// 初始化服务
const gardenService = new TomatoGardenService('sepolia');

// 连接账户
const provider = new RpcProvider({ 
  nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8' 
});
const account = new Account(provider, 'your_address', 'your_private_key');
await gardenService.connectAccount(account);
```

## 📋 主要更新

### 新的合约逻辑

1. **种植阶段**：种植番茄时不再立即铸造NFT，而是将信息存储在合约的pending状态中
2. **生长阶段**：可以随时查询番茄的生长状态、浇水、变异等信息
3. **收获阶段**：只有在收获时才会铸造NFT，此时番茄成为永久的收藏品

### 服务层更新

#### TomatoStakingService 新增方法

```typescript
// 获取番茄元数据（种植期间或收获后都可用）
async getTomatoMetadata(tomatoId: string): Promise<TomatoMetadata>

// 检查番茄是否已收获（是否已铸造NFT）
async isTomatoHarvested(tomatoId: string): Promise<boolean>
```

#### TomatoInfo 类型更新

```typescript
interface TomatoInfo {
  id: string;
  owner: string;
  metadata: TomatoMetadata;
  currentGrowthStage: GrowthStage;
  lastWatered: number;
  tokenUri: string;
  isHarvestable: boolean;
  isHarvested: boolean; // 新增：是否已收获
  timeToNextStage?: number;
}
```

## 🎮 使用流程

### 1. 种植番茄

```typescript
// 种植番茄（不会立即铸造NFT）
const stakeAmount = '2000000000000000000'; // 2 STRK
const result = await gardenService.plantTomato(stakeAmount);

if (result.success) {
  console.log('番茄种植成功，但尚未铸造NFT');
  // 从交易事件中获取番茄ID
}
```

### 2. 查询种植期间的番茄信息

```typescript
// 即使没有NFT，也可以查询番茄信息
const tomatoInfo = await gardenService.getTomatoInfo(tomatoId);

console.log('番茄类型:', tomatoInfo.metadata.tomato_type);
console.log('当前阶段:', tomatoInfo.currentGrowthStage);
console.log('是否已收获:', tomatoInfo.isHarvested); // false
console.log('是否可收获:', tomatoInfo.isHarvestable);
```

### 3. 浇水和变异

```typescript
// 浇水可能触发变异
const waterResult = await gardenService.waterTomato(tomatoId);

if (waterResult.mutated) {
  console.log('恭喜！发生变异了！');
  console.log('从', waterResult.oldType, '变为', waterResult.newType);
}
```

### 4. 收获番茄（铸造NFT）

```typescript
// 只有在收获时才会铸造NFT
const harvestResult = await gardenService.harvestTomato(tomatoId);

if (harvestResult.success) {
  console.log('收获成功！NFT已铸造！');
  
  // 现在可以查询NFT信息
  const updatedInfo = await gardenService.getTomatoInfo(tomatoId);
  console.log('NFT所有者:', updatedInfo.owner);
  console.log('Token URI:', updatedInfo.tokenUri);
  console.log('是否已收获:', updatedInfo.isHarvested); // true
}
```

## 📊 状态管理

### 番茄的三种状态

1. **种植期间**：
   - `isHarvested: false`
   - 可以查询生长信息
   - 可以浇水和变异
   - 没有NFT

2. **可收获**：
   - `isHarvestable: true`
   - `isHarvested: false`
   - 达到成熟阶段但尚未收获

3. **已收获**：
   - `isHarvested: true`
   - NFT已铸造
   - 成为永久收藏品

### 查询最佳实践

```typescript
// 统一的查询接口
const tomatoInfo = await gardenService.getTomatoInfo(tomatoId);

if (!tomatoInfo.isHarvested) {
  // 种植期间：关注生长状态
  console.log('生长阶段:', tomatoInfo.currentGrowthStage);
  console.log('到下一阶段:', tomatoInfo.timeToNextStage, '秒');
  
  if (tomatoInfo.isHarvestable) {
    console.log('可以收获了！');
  }
} else {
  // 已收获：关注NFT信息
  console.log('NFT所有者:', tomatoInfo.owner);
  console.log('Token URI:', tomatoInfo.tokenUri);
  console.log('收获时间:', tomatoInfo.metadata.harvested_at);
}
```

## 🔧 调试功能

### 快速测试模式

合约设置为1小时成长周期，方便调试：

- 种子期：0小时
- 幼苗期：1小时  
- 成长期：2小时
- 开花期：3小时
- 成熟期：4小时

### 浇水加速

浇水后生长速度加快3倍：
- 正常情况：1小时/阶段
- 浇水后：20分钟/阶段

### 变异系统

- 变异概率：5%
- 只有Normal类型可以变异
- 变异后不能再次变异

## 📱 前端集成示例

### React Hook 示例

```typescript
import { useState, useEffect } from 'react';
import { TomatoGardenService } from '../services/TomatoGardenService';

export function useTomatoInfo(tomatoId: string) {
  const [tomatoInfo, setTomatoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTomatoInfo = async () => {
      try {
        const info = await gardenService.getTomatoInfo(tomatoId);
        setTomatoInfo(info);
      } catch (error) {
        console.error('Failed to load tomato info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTomatoInfo();
    
    // 定期更新生长状态
    const interval = setInterval(loadTomatoInfo, 30000); // 30秒
    return () => clearInterval(interval);
  }, [tomatoId]);
  
  return { tomatoInfo, loading };
}
```

### Vue 组合式API示例

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { TomatoGardenService } from '../services/TomatoGardenService';

export function useTomatoGarden(userAddress: string) {
  const tomatoes = ref([]);
  const stats = ref(null);
  const loading = ref(true);
  
  const loadUserData = async () => {
    try {
      const [userTomatoes, userStats] = await Promise.all([
        gardenService.getUserTomatoInfos(userAddress),
        gardenService.getUserStats(userAddress)
      ]);
      
      tomatoes.value = userTomatoes;
      stats.value = userStats;
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 60000); // 1分钟
    
    onUnmounted(() => {
      clearInterval(interval);
    });
  });
  
  return {
    tomatoes,
    stats,
    loading,
    refresh: loadUserData
  };
}
```

## 🔍 错误处理

```typescript
try {
  const result = await gardenService.plantTomato(stakeAmount);
  
  if (!result.success) {
    switch (result.error) {
      case 'Stake amount too low':
        console.error('质押金额太低');
        break;
      case 'Transfer failed':
        console.error('代币转账失败，请检查授权');
        break;
      default:
        console.error('未知错误:', result.error);
    }
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

## 📚 API 文档

详细的API文档请参考各个服务文件中的JSDoc注释：

- `TomatoGardenService.ts` - 综合服务API
- `TomatoStakingService.ts` - 质押相关API  
- `TomatoNFTService.ts` - NFT相关API
- `types.ts` - 类型定义
- `utils.ts` - 工具函数

## 🧪 测试

```bash
# 运行示例代码
node -r ts-node/register services/examples-updated.ts

# 查看合约信息
node -e "
const { showContractInfo } = require('./services/examples-updated.ts');
showContractInfo();
"
```

## 📞 支持

如有问题，请参考：

1. 智能合约部署日志：`deployments/sepolia_deployment.json`
2. 交互脚本：`scripts/interact.sh`
3. 测试文件：`tests/test_tomato_garden.cairo`
4. 示例代码：`services/examples-updated.ts`

---

**注意**：当前版本处于调试模式，生长周期为1小时。生产环境建议调整为24小时。