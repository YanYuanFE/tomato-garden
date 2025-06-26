# Tomato Garden Scripts

这个目录包含了Tomato Garden项目的所有部署和交互脚本。

## 📁 脚本文件

### 🚀 deploy.sh - 部署脚本
完整的合约部署解决方案，支持番茄变种功能。**全面使用sncast替代starkli**。

**使用方法:**
```bash
./scripts/deploy.sh <network> <account_name> <strk_token_address> <min_stake_amount> <owner_address>
./scripts/deploy.sh sepolia new_account 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d 1000000000000000000 0x037303bf5468c9adc80fff39415ab5598851bc084e1112c78abfe3838fd3c429
```

**示例:**
```bash
./scripts/deploy.sh sepolia deployer 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d 1000000000000000000 0x123...
```

**配置要求:**
- 需要先配置`snfoundry.toml`文件（参考项目根目录的`snfoundry.toml.example`）
- 设置好账户名称和网络配置
- 所有脚本现已统一使用sncast命令

**功能:**
- 编译并部署TomatoNFT和TomatoStaking合约
- 自动设置合约权限
- 生成部署信息文件
- 提供完整的使用说明

### 🎮 interact.sh - 交互脚本
单个操作的交互工具，支持所有番茄功能。**现已使用sncast替代starkli**。

**使用方法:**
```bash
./scripts/interact.sh <action> [parameters...]
```

**主要功能:**
- `plant` - 种植番茄
- `water` - 浇水（自动检测变异）
- `harvest` - 收获番茄
- `type` - 查看番茄类型
- `metadata` - 查看完整元数据
- `stage` - 查看成长阶段
- `list` - 查看用户番茄列表
- `approve` - 授权STRK代币

**变异功能特色:**
- 浇水时自动检测变异
- 显示变异前后的类型变化
- 提供变异概率提示

### 📊 stats.sh - 统计脚本
番茄变异统计和分析工具。**现已使用sncast替代starkli**。

**使用方法:**
```bash
./scripts/stats.sh <network> <staking_contract_address> [user_address]
```

**功能:**
- 统计不同类型番茄的数量和比例
- 计算变异率
- 显示稀有度排名
- 收藏价值评估
- 收集建议

### 🚀 batch.sh - 批量操作脚本
高效的批量操作工具。**现已使用sncast替代starkli**。

**使用方法:**
```bash
./scripts/batch.sh <action> <network> <contract_address> [params...]
```

**可用操作:**
- `batch-water` - 批量浇水
- `batch-harvest` - 批量收获
- `batch-check` - 批量状态检查
- `mutation-hunt` - 变异猎取（重复浇水寻找变异）
- `user-summary` - 用户完整报告

## 🎨 番茄变种系统

### 番茄类型
- 🍅 **Normal (普通)** - 默认类型，可以变异
- 🟡 **Yellow (黄色)** - 不常见变异
- 🟣 **Purple (紫色)** - 不常见变异
- 🔥 **Flame (火焰)** - 稀有变异
- ❄️ **Ice (冰霜)** - 史诗变异
- 🌈 **Rainbow (彩虹)** - 传说变异

### 变异机制
- **触发条件:** 浇水时检测
- **变异概率:** 5%
- **变异要求:** 只有Normal类型可以变异
- **永久性:** 变异后类型永久保持

## 📖 使用流程

### 1. 部署合约
```bash
./scripts/deploy.sh sepolia account.json 0x04718... 1000000000000000000 0x123...
```

### 2. 授权代币
```bash
./scripts/interact.sh approve sepolia 0x04718... 0x合约地址 2000000000000000000
```

### 3. 种植番茄
```bash
./scripts/interact.sh plant sepolia 0x合约地址 2000000000000000000
```

### 4. 浇水寻找变异
```bash
./scripts/interact.sh water sepolia 0x合约地址 1
# 或使用变异猎取模式
./scripts/batch.sh mutation-hunt sepolia 0x合约地址 1 10
```

### 5. 查看番茄状态
```bash
./scripts/interact.sh type sepolia 0x合约地址 1
./scripts/interact.sh stage sepolia 0x合约地址 1
```

### 6. 收获成熟番茄
```bash
./scripts/interact.sh harvest sepolia 0x合约地址 1
```

### 7. 查看统计
```bash
./scripts/stats.sh sepolia 0x合约地址 0x用户地址
```

## 🔧 配置文件

部署信息会自动保存到 `deployments/` 目录下，网络配置参考 `config/networks.example.json`。

## 💡 使用技巧

1. **变异策略:** 多种植Normal番茄并频繁浇水可以增加获得稀有变异的机会
2. **批量操作:** 使用batch.sh进行批量操作可以提高效率
3. **统计分析:** 定期使用stats.sh查看收藏进度
4. **自动化:** 所有脚本都支持错误处理和状态反馈

## 🆘 故障排除

- 确保所有脚本都有执行权限 (`chmod +x scripts/*.sh`)
- 检查网络连接和账户余额
- 查看部署信息文件确认合约地址
- 使用 `--help` 参数查看详细用法

## 📞 获取帮助

每个脚本都支持 `help`、`-h` 或 `--help` 参数来显示详细用法说明。