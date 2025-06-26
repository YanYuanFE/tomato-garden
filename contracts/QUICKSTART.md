# 🍅 Tomato Garden 快速开始指南

欢迎来到Tomato Garden！这是一个基于Starknet的游戏化质押应用，让您可以通过质押STRK代币来种植虚拟番茄并收获NFT。

## 📋 前置要求

在开始之前，请确保您已经安装了以下工具：

### 必需工具
- [Scarb](https://docs.swmansion.com/scarb/) >= 2.8.2
- [Starkli](https://github.com/xJonathanLEI/starkli) (用于部署和交互)
- [Python 3](https://www.python.org/) (用于数值转换)
- Git

### 可选工具
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) (用于测试)
- [VS Code](https://code.visualstudio.com/) + [Cairo 扩展](https://marketplace.visualstudio.com/items?itemName=starkware.cairo1)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd tomato-garden
```

### 2. 编译合约

```bash
scarb build
```

### 3. 运行测试（可选）

```bash
snforge test
```

### 4. 部署合约

#### 准备部署参数

- **网络**: `sepolia` (测试网) 或 `mainnet` (主网)
- **STRK代币地址**: 
  - Sepolia: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
  - Mainnet: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **最小质押金额**: 建议 `1000000000000000000` (1 STRK)
- **所有者地址**: 您的钱包地址

#### 执行部署

```bash
./scripts/deploy.sh sepolia 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d 1000000000000000000 0x您的地址
```

部署成功后，合约信息将保存在 `deployments/sepolia_deployment.json` 文件中。

## 🎮 开始游戏

### 1. 授权STRK代币

在种植番茄之前，需要先授权合约使用您的STRK代币：

```bash
./scripts/interact.sh approve sepolia 0xSTRK地址 0x合约地址 2000000000000000000
```

### 2. 种植番茄

质押STRK代币来种植您的第一个番茄：

```bash
./scripts/interact.sh plant sepolia 0x合约地址 2000000000000000000
```

### 3. 查看番茄信息

```bash
# 查看番茄详细信息
./scripts/interact.sh info sepolia 0x合约地址 1

# 查看当前成长阶段
./scripts/interact.sh stage sepolia 0x合约地址 1
```

### 4. 浇水加速成长

每24小时可以浇水一次来加速成长：

```bash
./scripts/interact.sh water sepolia 0x合约地址 1
```

### 5. 收获NFT

当番茄达到第4阶段（成熟期）时，可以收获为NFT：

```bash
./scripts/interact.sh harvest sepolia 0x合约地址 1
```

### 6. 查看您的番茄花园

```bash
./scripts/interact.sh list sepolia 0x合约地址 0x您的地址
```

## 📊 成长阶段说明

| 阶段 | 名称 | 表情 | 描述 | 所需时间 |
|------|------|------|------|----------|
| 0 | 种子期 | 🌱 | 刚刚种植的种子 | 0小时 |
| 1 | 幼苗期 | 🌿 | 种子发芽成幼苗 | 24小时 |
| 2 | 成长期 | 🍃 | 幼苗茁壮成长 | 48小时 |
| 3 | 开花期 | 🌺 | 植物开始开花 | 72小时 |
| 4 | 成熟期 | 🍅 | 可以收获为NFT | 96小时 |

**注意**: 浇水可以减少一个阶段的等待时间！

## 💡 实用技巧

### 最佳策略
1. **定期浇水**: 每24小时浇水一次可以显著减少总成长时间
2. **批量种植**: 可以同时种植多个番茄来增加收益
3. **时间规划**: 合理安排浇水时间，最大化加速效果

### 常见问题

**Q: 为什么我不能浇水？**
A: 每24小时只能浇水一次，请检查上次浇水时间。

**Q: 番茄什么时候可以收获？**
A: 只有达到第4阶段（成熟期）的番茄才能收获。

**Q: 收获后STRK代币会返还吗？**
A: 不会，质押的STRK代币会永久锁定在合约中。

**Q: NFT在哪里可以看到？**
A: 收获的NFT会直接铸造到您的账户，可以在支持ERC721的钱包中查看。

## 🔧 开发者信息

### 项目结构

```
tomato-garden/
├── src/
│   └── lib.cairo          # 主合约代码
├── tests/
│   └── test_tomato_garden.cairo  # 测试文件
├── scripts/
│   ├── deploy.sh          # 部署脚本
│   └── interact.sh        # 交互脚本
├── config/
│   └── networks.example.json     # 网络配置示例
├── Scarb.toml             # 项目配置
├── README.md              # 详细文档
└── QUICKSTART.md          # 本文件
```

### 合约接口

主要函数：
- `plant_tomato(amount: u256) -> u256`: 种植番茄
- `water_tomato(tomato_id: u256)`: 浇水
- `harvest_tomato(tomato_id: u256)`: 收获
- `get_tomato(tomato_id: u256) -> Tomato`: 查看番茄信息
- `get_current_growth_stage(tomato_id: u256) -> u8`: 查看成长阶段

### 运行测试

```bash
# 运行所有测试
snforge test

# 运行特定测试
snforge test test_plant_tomato

# 详细输出
snforge test -v
```

## 🌐 网络信息

### Sepolia 测试网
- **STRK代币**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **浏览器**: https://sepolia.starkscan.co
- **水龙头**: https://starknet-faucet.vercel.app

### Mainnet 主网
- **STRK代币**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- **浏览器**: https://starkscan.co

## 🆘 获取帮助

如果您遇到问题，可以：

1. 查看 [README.md](./README.md) 获取详细文档
2. 检查 [config/networks.example.json](./config/networks.example.json) 获取配置示例
3. 运行 `./scripts/interact.sh help` 查看所有可用命令
4. 在GitHub上提交Issue

## 🎉 开始您的番茄种植之旅！

现在您已经准备好开始在Starknet上种植虚拟番茄了！记住：

- 💰 质押更多STRK可以种植更多番茄
- 💧 定期浇水可以加速成长
- 🍅 收获的NFT是您努力的证明
- 🌱 享受这个游戏化的DeFi体验！

祝您种植愉快！🍅✨