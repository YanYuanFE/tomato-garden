# 番茄花园 (Tomato Garden) - 模块化智能合约

一个基于 Starknet 的去中心化番茄种植游戏，采用模块化架构设计。

## 项目架构

项目已重构为两个独立的模块：

### 1. TomatoNFT.cairo - ERC721 番茄 NFT 合约

**功能特性：**
- 完整的 ERC721 NFT 实现（基于 OpenZeppelin）
- 番茄元数据管理（成长阶段、种植时间、收获时间、质押金额）
- 可配置的成长周期参数
- 授权铸造机制（只有授权的合约可以铸造）
- 所有者权限管理

**主要接口：**
```cairo
// 铸造番茄 NFT（仅授权铸造者）
fn mint_tomato(ref self: TContractState, to: ContractAddress, tomato_id: u256, metadata: TomatoMetadata);

// 获取番茄元数据
fn get_tomato_metadata(self: @TContractState, token_id: u256) -> TomatoMetadata;

// 设置成长周期配置（仅所有者）
fn set_growth_cycle_config(ref self: TContractState, growth_time_per_stage: u64, max_growth_stage: u8);

// 更新基础 URI（仅所有者）
fn update_base_uri(ref self: TContractState, new_base_uri: ByteArray);
```

### 2. TomatoStaking.cairo - 主逻辑合约

**功能特性：**
- STRK 代币质押机制
- 番茄种植、浇水、收获逻辑
- 用户番茄记录管理
- 动态成长阶段计算
- 奖励分发系统

**主要接口：**
```cairo
// 种植番茄（质押 STRK）
fn plant_tomato(ref self: TContractState, stake_amount: u256) -> u256;

// 浇水番茄
fn water_tomato(ref self: TContractState, tomato_id: u256);

// 收获番茄（获得奖励）
fn harvest_tomato(ref self: TContractState, tomato_id: u256) -> u256;

// 获取用户番茄数量
fn get_user_tomato_count(self: @TContractState, user: ContractAddress) -> u256;

// 获取当前成长阶段
fn get_current_growth_stage(self: @TContractState, tomato_id: u256) -> u8;
```

## 数据结构

### TomatoMetadata
```cairo
struct TomatoMetadata {
    growth_stage: u8,      // 当前成长阶段
    planted_at: u64,       // 种植时间戳
    harvested_at: u64,     // 收获时间戳（0表示未收获）
    staked_amount: u256,   // 质押的 STRK 数量
}
```

## 部署流程

1. **部署 TomatoNFT 合约**
   ```bash
   # 参数：name, symbol, base_uri, owner, authorized_minter, growth_time_per_stage, max_growth_stage
   ```

2. **部署 TomatoStaking 合约**
   ```bash
   # 参数：strk_token_address, tomato_nft_contract, owner, min_stake_amount, base_reward_per_stage
   ```

3. **配置授权**
   - 在 TomatoNFT 合约中设置 TomatoStaking 合约地址为授权铸造者

## 游戏机制

### 种植流程
1. 用户调用 `plant_tomato()` 并质押 STRK 代币
2. 系统生成唯一的番茄 ID
3. TomatoStaking 合约调用 TomatoNFT 合约铸造 NFT
4. 记录用户的番茄所有权

### 成长机制
- 番茄会根据时间自动成长
- 用户可以通过浇水加速成长
- 成长阶段影响最终收获的奖励

### 收获奖励
- 奖励 = 基础奖励 × 成长阶段
- 收获后番茄状态标记为已收获
- NFT 保留作为收藏品

## 技术特性

- **模块化设计**：NFT 功能与游戏逻辑分离
- **OpenZeppelin 集成**：使用标准的 ERC721 和权限管理组件
- **可配置参数**：成长周期、最小质押金额等可动态调整
- **事件驱动**：完整的事件记录便于前端监听
- **安全性**：权限控制、输入验证、重入保护

## 开发环境

- Cairo: 2.11.4
- Starknet: 2.11.4
- OpenZeppelin: 2.0
- Scarb: 最新版本

## 编译和测试

```bash
# 编译项目
scarb build

# 运行测试
scarb test

# 格式化代码
scarb fmt
```

## 模块优势

1. **可维护性**：独立的模块便于维护和升级
2. **可重用性**：TomatoNFT 可以被其他游戏合约复用
3. **可扩展性**：可以轻松添加新的游戏机制
4. **安全性**：模块间的明确边界减少了安全风险
5. **测试友好**：可以独立测试每个模块的功能

## 功能特性

### 🌱 种植番茄
- 用户质押STRK代币来种植虚拟番茄
- 每个番茄都有唯一的ID和所有者
- 记录质押金额、种植时间等信息

### 🌿 成长系统
- 番茄有5个成长阶段（0-4）
- 每24小时自动成长一个阶段
- 用户可以通过"浇水"功能加速成长

### 💧 浇水机制
- 每24小时可以浇水一次
- 浇水可以减少下一阶段所需的时间
- 有效加速番茄成长过程

### 🍅 收获NFT
- 番茄达到第4阶段（完全成熟）后可以收获
- 收获时会铸造对应的ERC721 NFT
- NFT包含番茄的成长历史和元数据

### 📊 查询功能
- 查看特定番茄的详细信息
- 获取用户拥有的所有番茄
- 实时查看番茄当前成长阶段

## 合约结构

### 核心数据结构

```cairo
struct Tomato {
    owner: ContractAddress,        // 番茄所有者
    staked_amount: u256,          // 质押金额
    planted_at: u64,              // 种植时间
    watered_at: u64,              // 上次浇水时间
    growth_stage: u8,             // 当前成长阶段
    harvested: bool               // 是否已收获
}
```

### 主要功能

#### 种植番茄
```cairo
fn plant_tomato(ref self: ContractState, amount: u256) -> u256
```
- 质押指定数量的STRK代币
- 创建新的番茄实例
- 返回番茄ID

#### 浇水
```cairo
fn water_tomato(ref self: ContractState, tomato_id: u256)
```
- 为指定番茄浇水
- 每24小时只能浇水一次
- 加速成长过程

#### 收获
```cairo
fn harvest_tomato(ref self: ContractState, tomato_id: u256)
```
- 收获完全成熟的番茄
- 铸造对应的NFT
- 标记番茄为已收获状态

#### 查询功能
```cairo
fn get_tomato(self: @ContractState, tomato_id: u256) -> Tomato
fn get_user_tomatoes(self: @ContractState, account: ContractAddress) -> Array<u256>
fn get_current_growth_stage(self: @ContractState, tomato_id: u256) -> u8
```

## 技术实现

### 依赖组件
- **ERC721Component**: NFT功能实现
- **SRC5Component**: 接口支持
- **OwnableComponent**: 权限管理
- **ERC20接口**: STRK代币交互

### 时间机制
- 使用`get_block_timestamp()`获取当前时间
- 每个成长阶段需要86400秒（24小时）
- 浇水可以减少一个阶段的等待时间

### 存储优化
- 使用Map存储番茄数据
- 用户番茄列表单独存储
- 高效的查询和更新机制

## 部署和使用

### 环境要求
- Scarb 2.8.2+
- Starknet Foundry
- OpenZeppelin Contracts v0.18.0

### 编译合约
```bash
scarb build
```

### 部署参数
合约构造函数需要以下参数：
- `strk_token_address`: STRK代币合约地址
- `min_stake_amount`: 最小质押金额
- `owner`: 合约管理员地址

### 使用流程

1. **准备STRK代币**
   - 确保账户有足够的STRK代币
   - 授权合约转移代币

2. **种植番茄**
   ```cairo
   // 调用plant_tomato函数
   let tomato_id = contract.plant_tomato(stake_amount);
   ```

3. **照料番茄**
   ```cairo
   // 每24小时可以浇水一次
   contract.water_tomato(tomato_id);
   ```

4. **查看成长状态**
   ```cairo
   let stage = contract.get_current_growth_stage(tomato_id);
   ```

5. **收获NFT**
   ```cairo
   // 当番茄达到第4阶段时
   contract.harvest_tomato(tomato_id);
   ```

## 安全特性

- **所有权验证**: 只有番茄所有者才能浇水和收获
- **状态检查**: 防止重复收获和无效操作
- **时间限制**: 浇水功能有24小时冷却时间
- **金额验证**: 质押金额必须达到最小要求
- **权限管理**: 管理员功能受到保护

## 事件系统

合约会发出以下事件：
- `TomatoPlanted`: 番茄种植事件
- `TomatoWatered`: 番茄浇水事件
- `TomatoHarvested`: 番茄收获事件

## 扩展功能

未来可以考虑添加：
- 不同品种的番茄
- 稀有度系统
- 番茄交易市场
- 社交功能（好友系统）
- 成就系统
- 季节性活动

## 许可证

MIT License